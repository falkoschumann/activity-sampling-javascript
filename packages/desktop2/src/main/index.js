import * as path from 'node:path';
import * as url from 'node:url';
import { app, shell, BrowserWindow, ipcMain, net, protocol } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

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
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  //if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //  mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  //} else {
  //  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  //}
  mainWindow.loadURL('app://bundle/');
}

const bundlePath = path.join(__dirname, '../renderer');

function createProtocolHandler() {
  protocol.handle('app', (req) => {
    const { host, pathname } = new URL(req.url);
    if (host === 'bundle') {
      if (pathname.startsWith('/api/')) {
        return handleBackendRequests(req);
      }

      return handleFrontendRequests(req);
    }

    return handleNotFound();
  });
}

function handleFrontendRequests(/** @type {Request} */ request) {
  // TODO Handle API requests locally (prod) or remotely (dev)

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

function handleBackendRequests(/** @type {Request} */ request) {
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createProtocolHandler();

  // Set app user model id for windows
  electronApp.setAppUserModelId('de.muspellheim.activitysampling');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
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
// code. You can also put them in separate files and require them here.
