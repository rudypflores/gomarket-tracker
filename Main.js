'use strict';

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

// Initiate server
require('./server.js');

// try {
//   require('electron-reload')(module);
// } catch (_) {}

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true,
    },
    icon: './public/img/favicon.ico'
  });

  // Check for updates
  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  // win.webContents.openDevTools();

  // top bar menu
  let menuTemplate = [
    {
        label: "Imprimir",
        accelerator:'CmdOrCtrl+P',
        click() {
          let options = { 
            silent: false,
            printBackground:true,
            color:true,
            margin: { 
              marginType: 'custom',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            landscape: false, 
            pagesPerSheet: 1, 
            collate: false, 
          } 
          let winPrint = BrowserWindow.getFocusedWindow();
          winPrint.webContents.print(options, (success, failureReason) => {
            if (!success) console.log(failureReason); 
            console.log('Print Initiated'); 
          });
        }
    },
    {
      label: "Refrescar",
      accelerator: 'CmdOrCtrl+R',
      click() {
        win.reload();
      }
    },
    {
      label: "Cerrar Sessión",
      accelerator:'CmdOrCtrl+Q',
      click() {
        app.quit();
      }
    }
  ];

  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // win.setMenuBarVisibility(false);
  win.loadURL('http://localhost:5000/');
  win.focus();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

// Send latest version to client
ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

// Install update
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// Handle update events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});