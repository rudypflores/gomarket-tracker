const codigo = document.getElementById('noTurno');
const codigos = document.getElementById('noTurnos');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');


// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/turno', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(turno => {
        const fa = moment.tz(turno.fecha_apertura, 'America/Guatemala');
        const option = document.createElement('option');
        option.value = turno.no_turno;
        option.innerHTML = turno.n_usuario + ' fecha: ' + fa.format('YYYY-MM-DD hh:mm:ss');
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    // Autofill
    fetch(`http://localhost:5000/dashboard/mantenimientos/turno/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(turno => {
        const fa = moment.tz(turno.fecha_apertura, 'America/Guatemala');
        const fc = moment.tz(turno.fecha_cierre, 'America/Guatemala');

        codigo.readOnly = true;
        document.getElementById('nUsuario').value = turno.n_usuario;
        document.getElementById('efectivoApertura').value = turno.efectivo_apertura;
        document.getElementById('efectivoCierre').value = turno.efectivo_cierre;
        document.getElementById('fechaApertura').value = fa.format('YYYY-MM-DDThh:mm:ss');
        document.getElementById('fechaCierre').value = fc.format('YYYY-MM-DDThh:mm:ss');;
        document.getElementById('marketId').value = turno.market_id;
    });
});

const borrar = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/turno/${codigo.value}`, {
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