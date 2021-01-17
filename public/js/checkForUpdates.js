const { ipcRenderer } = require('electron');
const version = document.getElementById('version');

// Display current version installed
ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    version.innerText = 'Versión ' + arg.version;
});

// Display notification and let user decide what to do with update
const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  message.innerText = 'Hay una nueva actualización disponible. Descargando ahora ...';
  notification.classList.remove('hidden');
});

ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  message.innerText = 'Actualización ha sido descargada. Se instalará al reiniciar. ¿Reiniciar ahora?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
});

ipcRenderer.on('message', function(event, text) {
  let progress = document.getElementById('progress');
  progress.textContent = text;
})

function closeNotification() {
    notification.classList.add('hidden');
}
function restartApp() {
    ipcRenderer.send('restart_app');
}