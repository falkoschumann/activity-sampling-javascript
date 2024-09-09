/* global MAIN_WINDOW_VITE_DEV_SERVER_URL */

import * as path from 'node:path';
import * as url from 'node:url';
import { app, net, protocol, BrowserWindow } from 'electron';

import { LogActivity } from '@activity-sampling/domain';
import { Services } from '@activity-sampling/backend';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
//if (require('electron-squirrel-startup')) {
//  app.quit();
//}

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

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: 'images/icon.png',
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    //mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    mainWindow.loadURL('app://bundle/');
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createProtocolHandler();
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

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

const activityLogFile =
  process.env.NODE_ENV === 'development'
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
