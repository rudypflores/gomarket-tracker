const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo-de-producto');

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
        codigos.appendChild(option);
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
        document.getElementById('descripcion').value = producto.nombre;
        document.getElementById('precio-q').value = producto.precio_publico;
        document.getElementById('cantidad').value = 1;
        document.getElementById('descripcion').readOnly = true;
        document.getElementById('cantidad').focus();
    });
});