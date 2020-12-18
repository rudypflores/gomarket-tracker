const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');
const descripcion = document.getElementById('descripcion');
const existenciaActual = document.getElementById('existencia-actual');

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
        descripcion.value = inventario.descripcion;
        existenciaActual.value = inventario.existencia_actual;

        codigo.readOnly = true;
        descripcion.readOnly = true;
        existenciaActual.readOnly = true;
        document.getElementById('cantidad').focus();
    });
});