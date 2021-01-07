const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');
const producto = document.getElementById('producto');
const existenciaActual = document.getElementById('unidadesActuales');
const fecha = document.getElementById('fecha');

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/inventario', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(inventario => {
        const option = document.createElement('option');
        option.value = inventario.codigo;
        option.innerHTML = inventario.descripcion;
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    // Autofill
    fetch(`http://localhost:5000/dashboard/mantenimientos/inventario/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(inventario => {
        producto.value = inventario.descripcion;
        existenciaActual.value = inventario.existencia_actual;

        codigo.readOnly = true;
        producto.readOnly = true;
        existenciaActual.readOnly = true;
        document.getElementById('agregarODescontar').focus();
    });
});

let today = new Date();
today.toLocaleDateString('es-gt');
fecha.valueAsDate = today;
fecha.readOnly = true;