const { dialog } = require('electron').remote;

const crear = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/producto`, {
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
            nombre: document.getElementById('nombre').value,
            costoQ: document.getElementById('costoQ').value,
            precioPublico: document.getElementById('precioPublico').value,
            pUtilidad: document.getElementById('pUtilidad').value,
            ubicacion: document.getElementById('ubicacion').value,
            estado: document.getElementById('estado').value
        })
    })
    .then(response => response.json())
    .then(jsonResponse => {
        dialog.showMessageBox({
            title: 'Crear producto',
            message: jsonResponse.message
        });
        window.location.reload();
    });
};