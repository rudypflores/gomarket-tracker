const ubicaciones = document.getElementById('ubicaciones');

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
        option.value = ubicacion.ubicacion
        option.innerHTML = ubicacion.codigo;
        ubicaciones.appendChild(option);
    });
});