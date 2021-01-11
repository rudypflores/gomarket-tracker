'use strict';

const { app, BrowserWindow, Menu } = require('electron');
const ejse = require('ejs-electron');
require('./server.js');

try {
  require('electron-reloader')(module);
} catch (_) {}

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 720,
    height: 540,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      enableRemoteModule: true,
    },
    icon: './public/img/favicon.ico'
  });

  // win.webContents.openDevTools();

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
  win.loadURL(`http://localhost:5000/`);
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