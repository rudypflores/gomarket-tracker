const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/gasto', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(gasto => {
        const option = document.createElement('option');
        option.value = gasto.codigo;
        option.innerHTML = gasto.tipo_de_gasto;
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    codigo.readOnly = true;
    fetch(`http://localhost:5000/dashboard/mantenimientos/gasto/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(gasto => {
        document.getElementById('tipoDeGasto').value = gasto.tipo_de_gasto;
    });
});