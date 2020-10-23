const productos = document.getElementById('productos');
const codigo = document.getElementById('codigo');

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
    codigo.readOnly = true;
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
        document.getElementById('pUtilidad').value = producto.p_utilidad;
        document.getElementById('ubicacion').value = producto.ubicacion;
        document.getElementById('vencimiento').value = producto.vencimiento.substring(0, producto.vencimiento.indexOf("T"));
    });
});