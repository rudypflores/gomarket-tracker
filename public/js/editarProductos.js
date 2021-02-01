const productos = document.getElementById('productos');
const codigo = document.getElementById('codigo');
const { dialog } = require('electron').remote;

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/producto', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.codigo;
        option.innerHTML = producto.nombre;
        productos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    // Autofill
    fetch(`http://localhost:5000/dashboard/mantenimientos/producto/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(producto => {
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('costoQ').value = producto.costo_q;
        document.getElementById('precioPublico').value = producto.precio_publico;
        document.getElementById('pUtilidad').value = parseFloat(producto.p_utilidad,10)*100;
        document.getElementById('ubicacion').value = producto.ubicacion;
    });
});

const borrar = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/producto/${codigo.value}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(jsonResponse => {
        dialog.showMessageBox({
            message: jsonResponse.message
        });
        window.location.reload();
    }); 
};