const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/proveedor', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor.codigo;
        option.innerHTML = proveedor.nombre;
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    codigo.readOnly = true;
    fetch(`http://localhost:5000/dashboard/mantenimientos/proveedor/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(proveedor => {
        document.getElementById('nit').value = proveedor.nit;
        document.getElementById('nombre').value = proveedor.nombre;
        document.getElementById('direccion').value = proveedor.direccion;
        document.getElementById('celular').value = proveedor.celular;
        document.getElementById('saldo').value = proveedor.saldo;
        document.getElementById('marketId').value = proveedor.market_id;
    });
});