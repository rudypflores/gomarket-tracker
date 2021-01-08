const nUsuario = document.getElementById('nUsuario');
const nUsuarios = document.getElementById('nUsuarios');

// Get usuario options
fetch('http://localhost:5000/usuario', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.n_usuario;
        option.innerHTML = `${usuario.nombre}, ${usuario.apellido}`;
        nUsuarios.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible usuarios
nUsuario.addEventListener('change', () => {
    nUsuario.readOnly = true;
    console.log(nUsuario.value);
    fetch(`http://localhost:5000/usuario/${nUsuario.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(usuario => {
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('apellido').value = usuario.apellido;
        document.getElementById('cargo').value = usuario.cargo;
        document.getElementById('estado').value = usuario.estado;
        document.getElementById('direccion').value = usuario.direccion;
        document.getElementById('celular').value = usuario.celular;
        document.getElementById('marketId').value = usuario.market_id;
    });
});