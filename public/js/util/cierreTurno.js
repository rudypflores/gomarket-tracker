const efectivoCierre = document.getElementById('efectivo');
const submitButton = document.getElementById('ingresar');
const moment = require('moment');
require('moment-timezone');

const cerrarTurno = async() => {
    efectivoCierre.style.display = 'none';
    const turnoInfo = await fetch('http://localhost:5000/dashboard/movimientos/cierre-turno', {
        method: 'PUT',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            efectivo: efectivoCierre.value
        })
    })
    .then(response => response.json());

    const start = moment.tz(turnoInfo[0].fecha_apertura, 'America/Guatemala').format('YYYY-MM-DD HH:mm:ss');
    const finish = moment.tz(turnoInfo[0].fecha_cierre, 'America/Guatemala').format('YYYY-MM-DD HH:mm:ss');

    const ventasTotalTurno = await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${start}/${finish}`, {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(jsonResponse => {
        let total = 0;
        for(let i = 0; i < jsonResponse.length; i++) {
            total += jsonResponse[i].subtotal;
        }
        return total;
    });

    const sobranteFaltante = (ventasTotalTurno + turnoInfo[0].efectivo_apertura - turnoInfo[0].efectivo_cierre).toFixed(2);

    document.getElementById('cierreForm').innerHTML = `
        <label for="efectivoApertura">
            Efectivo Apertura:
            <input type="text" value="${turnoInfo[0].efectivo_apertura}" readonly>
        </label>
        <label for="totalVentas">
            Total de Ventas del Turno:
            <input type="text" value="${ventasTotalTurno}" readonly>
        </label>
        <label for="efectivoCierre">
            Efectivo de Cierre:
            <input type="text" value="${turnoInfo[0].efectivo_cierre}" readonly>
        </label>
        <label for="sobrante">
            Sobrante del Turno (+):
            <input type="text" value="${sobranteFaltante > 0 ? sobranteFaltante : 0.00}" readonly>
        </label>
        <label for="faltante">
            Faltante del Turno (-):
            <input type="text" value="${sobranteFaltante < 0 ? sobranteFaltante : 0.00}" readonly>
        </label>
        <div class="break"></div>
        <a href="/dashboard">
            <button type="button">Salir</button>
        </a>
    `;
};

efectivoCierre.addEventListener('keydown', e => {
    if(e.key === 'Enter') {
        e.preventDefault();
        cerrarTurno();
    }
});
submitButton.addEventListener('click', () => cerrarTurno());