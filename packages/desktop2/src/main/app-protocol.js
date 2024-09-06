import * as path from 'node:path';
import * as url from 'node:url';
import { net, protocol } from 'electron';

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

    return responseNotFound();
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
    return new Response('Bad Request', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    });
  }

  return net.fetch(url.pathToFileURL(pathToServe).toString());
}

const services = Services.create();

async function handleBackendRequest(/** @type {Request} */ request) {
  const { pathname, search } = new URL(request.url);

  if (request.method === 'POST' && pathname.startsWith('/api/log-activity')) {
    const dto = await request.json();
    const logActivity = LogActivity.create(dto).validate();
    await services.logActivity(logActivity);
    return new Response(null, { status: 204 });
  }

  if (
    request.method === 'GET' &&
    pathname.startsWith('/api/recent-activities')
  ) {
    const { today } = search;
    const activities = await services.selectRecentActivities({ today });
    return new Response(JSON.stringify(activities), {
      headers: { 'content-type': 'application/json' },
    });
  }

  return responseNotFound();
}

function responseNotFound() {
  return new Response('Not Found', {
    status: 404,
    headers: { 'content-type': 'text/plain' },
  });
}
