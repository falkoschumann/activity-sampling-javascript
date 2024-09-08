import * as path from 'node:path';
import * as url from 'node:url';
import { app, net, protocol } from 'electron';
import { is } from '@electron-toolkit/utils';

import { LogActivity } from '@activity-sampling/domain';
import { Services } from '@activity-sampling/backend';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

export function createProtocolHandler() {
  protocol.handle('app', (req) => {
    const { host, pathname } = new URL(req.url);
    if (host === 'bundle') {
      if (pathname.startsWith('/api/')) {
        return handleBackendRequest(req);
      }

      return handleFrontendRequest(req);
    }

    return reply({ status: 404 });
  });
}

function handleFrontendRequest(/** @type {Request} */ request) {
  const bundlePath = path.join(__dirname, '../renderer');

  const { pathname } = new URL(request.url);
  if (pathname === '/') {
    const index = path.join(bundlePath, 'index.html');
    return net.fetch(url.pathToFileURL(index).toString());
  }

  // NB, this checks for paths that escape the bundle, e.g.
  // app://bundle/../../secret_file.txt
  const pathToServe = path.isAbsolute(pathname)
    ? bundlePath + pathname
    : path.resolve(bundlePath, pathname);
  const relativePath = path.relative(bundlePath, pathToServe);
  const isSafe =
    relativePath &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath);
  if (!isSafe) {
    return reply({ status: 400 });
  }

  return net.fetch(url.pathToFileURL(pathToServe).toString());
}

const activityLogFile = is.dev
  ? undefined
  : path.resolve(app.getPath('home'), 'activity-log-electron.csv');
const services = Services.create({ activityLogFile });

async function handleBackendRequest(/** @type {Request} */ request) {
  const { pathname } = new URL(request.url);
  if (request.method === 'POST' && pathname.startsWith('/api/log-activity')) {
    return runSafe(() => logActivity(request));
  }

  if (
    request.method === 'GET' &&
    pathname.startsWith('/api/recent-activities')
  ) {
    return runSafe(() => getRecentActivities(request));
  }

  return reply({ status: 404 });
}

async function logActivity(/** @type {Request} */ request) {
  const body = await request.json();
  const command = LogActivity.create(body).validate();
  await services.logActivity(command);
  return reply({ status: 204 });
}

async function getRecentActivities(/** @type {Request} */ request) {
  const { search } = new URL(request.url);
  const query = { today: search.today };
  const activities = await services.selectRecentActivities(query);
  return reply({
    headers: { 'content-type': 'application/json' },
    body: activities,
  });
}

async function runSafe(func) {
  try {
    return await func();
  } catch (error) {
    return reply({ status: 500, body: String(error) });
  }
}

export function reply({
  status = 200,
  headers = { 'Content-Type': 'text/plain' },
  body,
} = {}) {
  const bodyString = body != null ? JSON.stringify(body) : null;
  return new Response(bodyString, { status, headers });
}
