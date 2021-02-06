'use strict';

const { app, BrowserWindow, Menu, ipcMain, protocol, Notification } = require('electron');
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

function createSecondWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true
    },
    icon: './public/img/favicon.ico'
  });
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
      label: "Cerrar Sessión",
      accelerator:'CmdOrCtrl+Q',
      click() {
        app.quit();
      }
    },
    {
      label: "Tamaño de Ventana",
      submenu: [
        {
          label:'Restablecer',
          role: 'resetzoom'
        },
        {
          label:'Agrandar',
          role: 'zoomin',
          accelerator: 'CmdOrCtrl+='
        },
        {
          label:'Encoger',
          role: 'zoomout'
        },
      ]
    },
    {
      label: 'Nueva Ventana',
      accelerator:'CmdorCtrl+T',
      click() {
        createSecondWindow();
      }
    }
  ];
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  win.loadURL('http://localhost:5000/dashboard');
  win.focus();
}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true
    },
    icon: './public/img/favicon.ico'
  });

  // For development only
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
      label: "Cerrar Sessión",
      accelerator:'CmdOrCtrl+Q',
      click() {
        app.quit();
      }
    },
    {
      label: "Tamaño de Ventana",
      submenu: [
        {
          label:'Restablecer',
          role: 'resetzoom'
        },
        {
          label:'Agrandar',
          role: 'zoomin',
          accelerator: 'CmdOrCtrl+='
        },
        {
          label:'Encoger',
          role: 'zoomout'
        },
      ]
    },
    {
      label: 'Nueva Ventana',
      accelerator:'CmdorCtrl+T',
      click() {
        createSecondWindow();
      }
    }
  ];

  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  win.loadURL('http://localhost:5000/');
  win.focus();

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  // update progress bar
  function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
  }

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Descargado: ' + Math.round(progressObj.percent) + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  });

  // Notify user of an update available or downloaded
  autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
  });
}

// Notifications
function showNotification () {
  const notification = {
    title: 'Nueva Notificación:',
    body: 'Bienvenido al sistema de Go Market!',
    icon: './public/img/favicon.ico'
  }
  new Notification(notification).show()
}

// App initial loading 
app.whenReady().then(() => {
  app.setAppUserModelId("Sistema Go Market");
  createWindow();
  showNotification();
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

// Restart app on update downloaded
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});