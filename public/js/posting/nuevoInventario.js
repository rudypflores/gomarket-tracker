const { dialog } = require('electron').remote;

const crear = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/inventario`, {
        method: 'POST',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            codigo: document.getElementById('codigo').value,
            descripcion: document.getElementById('descripcion').value,
            existenciaActual: document.getElementById('existencia-actual').value
        })
    })
    .then(response => response.json())
    .then(jsonResponse => {
        dialog.showMessageBox({
            title: 'Crear producto',
            message: jsonResponse.message
        });
        window.location.href = window.location.href.replace('/nuevo-inventario', '') + '/nuevo-inventario';
    });
};

document.getElementById('existencia-actual').addEventListener('keydown', event => {
    if(event.key === 'Enter')
        crear();
});