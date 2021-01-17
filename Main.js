'use strict';

const { app, BrowserWindow, Menu, ipcMain, protocol } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Initiate server
require('./server.js');

// For development only
// try {
//   require('electron-reloader')(module);
// } catch (_) {}

// dev logs
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true,
    },
    icon: './public/img/favicon.ico'
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

  win.loadURL('http://localhost:5000/');
  win.focus();

  // Auto update shenanigans
  function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
  }
  
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  })
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
  })
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
  })
}

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});

app.whenReady().then(() => {
  createWindow();
});

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