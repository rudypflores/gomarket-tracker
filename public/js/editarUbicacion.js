const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');
const { dialog } = require('electron').remote;

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/ubicacion', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(ubicacion => {
        const option = document.createElement('option');
        option.value = ubicacion.codigo;
        option.innerHTML = ubicacion.ubicacion;
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    codigo.readOnly = true;
    fetch(`http://localhost:5000/dashboard/mantenimientos/ubicacion/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(ubicacion => {
        document.getElementById('ubicacion').value = ubicacion.ubicacion;
    });
});

const borrar = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/ubicacion/${codigo.value}`, {
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