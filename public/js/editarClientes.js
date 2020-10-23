const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/cliente', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.codigo;
        option.innerHTML = `${cliente.nombre}, ${cliente.apellido}`;
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    codigo.readOnly = true;
    fetch(`http://localhost:5000/dashboard/mantenimientos/cliente/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(cliente => {
        document.getElementById('nit').value = cliente.nit;
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('apellido').value = cliente.apellido;
        document.getElementById('direccion').value = cliente.direccion;
        document.getElementById('celular').value = cliente.celular;
    });
});