const nUsuario = document.getElementById('nUsuario');
const nUsuarios = document.getElementById('nUsuarios');

fetch('http://localhost:5000/usuario', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(usuarios => {
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.n_usuario;
        option.innerHTML = usuario.nombre + ', ' + usuario.apellido;
        nUsuarios.appendChild(option);
    });
});