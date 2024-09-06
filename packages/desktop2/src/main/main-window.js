import * as path from 'node:path';
import { shell, BrowserWindow } from 'electron';
//import { is } from '@electron-toolkit/utils';

import icon from '../../resources/icon.png?asset';

export function createWindow() {
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
  mainWindow.loadURL('app://bundle/');
  //}
}
