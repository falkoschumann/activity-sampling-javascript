import * as path from 'node:path';
import * as url from 'node:url';
import { net, protocol } from 'electron';

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

    return handleNotFound();
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

function handleBackendRequest(/** @type {Request} */ request) {
  // TODO Handle API requests locally (prod) or remotely (dev)

  const { pathname } = new URL(request.url);
  return net.fetch(`http://localhost:${process.env.PORT ?? 3000}${pathname}`, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}

function handleNotFound() {
  return new Response('Not Found', {
    status: 404,
    headers: { 'content-type': 'text/plain' },
  });
}
