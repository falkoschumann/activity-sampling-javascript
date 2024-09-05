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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    // TODO Handle API requests locally (prod) or remotely (dev)

    const { host, pathname } = new URL(req.url);
    console.log('app protocol,', 'host:', host, 'pathname:', pathname);
    if (host === 'bundle') {
      if (pathname.startsWith('/api/')) {
        return net.fetch('http://localhost:3000' + pathname, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
      }

      const publicPath = path.join(__dirname, '../renderer');
      if (pathname === '/') {
        //return new Response('<h1>Hello, World!</h1>', {
        //  headers: { 'content-type': 'text/html' },
        //});
        const index = path.join(publicPath, 'index.html');
        console.log('app protocol, serve:', index);
        return net.fetch(url.pathToFileURL(index).toString());
      }

      // NB, this checks for paths that escape the bundle, e.g.
      // app://bundle/../../secret_file.txt
      const pathToServe = path.isAbsolute(pathname)
        ? publicPath + pathname
        : path.resolve(publicPath, pathname);
      const relativePath = path.relative(publicPath, pathToServe);
      const isSafe =
        relativePath &&
        !relativePath.startsWith('..') &&
        !path.isAbsolute(relativePath);
      console.log(
        'app protocol,',
        'working directory:',
        publicPath,
        'pathToServe:',
        pathToServe,
        ',relativePath:',
        relativePath,
        ',isSafe:',
        isSafe,
      );
      if (!isSafe) {
        return new Response('bad', {
          status: 400,
          headers: { 'content-type': 'text/html' },
        });
      }

      return net.fetch(url.pathToFileURL(pathToServe).toString());
    } else if (host === 'api') {
      return net.fetch('https://api.my-server.com/' + pathname, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    } else {
      return new Response('Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      });
    }
  });

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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
