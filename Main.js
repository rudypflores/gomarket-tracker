const { app, BrowserWindow } = require('electron');
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
      nodeIntegration: true
    },
    icon: './public/img/logo.svg'
  });

  win.setMenuBarVisibility(false);

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