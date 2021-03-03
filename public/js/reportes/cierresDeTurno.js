let table = document.getElementById('turnos-table');
const columns = document.getElementsByClassName('column-report');
const turnoForm = document.getElementById('turno-form');
const salirBtn = document.getElementById('salir');

// store default table
const originalTable = document.createElement('div');
originalTable.innerHTML = table.innerHTML;

// Loading animation and indicator
const playLoading = element => {
    document.body.style.pointerEvents = 'none';
    element.innerHTML = '';
    const loadingAnim = document.createElement('img');
    loadingAnim.src = '/img/loading.svg';
    loadingAnim.id = 'loading';
    element.append(loadingAnim);
}

const stopLoading = (element, txt) => {
    document.body.style.pointerEvents = 'auto';
    element.removeChild(element.firstChild);
    element.textContent = txt;
}

// Get information on all turnos for today
const turnosHoy = async () => {
    return await fetch('http://localhost:5000/dashboard/movimientos/turno-hoy', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    })
    .then(response => response.json());
}

const turnosMes = async () => {
    return await fetch('http://localhost:5000/dashboard/movimientos/turno-mes', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    })
    .then(response => response.json());
}

const turnosTodos = async () => {
    return await fetch('http://localhost:5000/dashboard/movimientos/turno', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    })
    .then(response => response.json());
}

const getTotalVentas = async(comienzo, fin) => {
    return await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${comienzo}/${fin}`,{
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    })
    .then(response => response.json());
};

// load document report
const handleClick = async(username, data, ventasData) => {
    playLoading(salirBtn);
    const user = await fetch(`http://localhost:5000/usuario/${username}`, {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    })
    .then(response => response.json());

    let totalVentas = 0;
    let totalVentasEfectivo = 0;
    let totalVentasTarjeta = 0;
    let costo = 0;
    let utilidad = 0;
    for(let i = 0; i < ventasData.length; i++) {
        costo += ventasData[i].costo_q*ventasData[i].cantidad;
        totalVentas += ventasData[i].subtotal;
        if(ventasData[i].tipo_de_pago === 'efectivo') {
            totalVentasEfectivo += ventasData[i].subtotal;
        } else if(ventasData[i].tipo_de_pago === 'tarjeta') {
            totalVentasTarjeta += ventasData[i].subtotal;
        }
    }
    utilidad = totalVentas-costo;
    const sobrante = data.efectivo_apertura+totalVentas-data.efectivo_cierre < 0 ? Math.abs(data.efectivo_apertura+totalVentas-data.efectivo_cierre).toFixed(2) : 0;
    const faltante = data.efectivo_apertura+totalVentas-data.efectivo_cierre > 0 ? data.efectivo_apertura+totalVentas-data.efectivo_cierre : 0;
    const sobranteFaltante = data.efectivo_apertura+totalVentas-data.efectivo_cierre < 0 ? Math.abs(data.efectivo_apertura+totalVentas-data.efectivo_cierre).toFixed(2) : data.efectivo_apertura+totalVentas-data.efectivo_cierre;

    stopLoading(salirBtn, 'Salir');
    document.body.innerHTML = `
        <a href="/dashboard/reportes/cierres-de-turno"><img src="../../img/logo.svg" class="logo"/></a>
        <h2>${user.market_id}</h2>
        <h1 class="report-title">Cierres de Turno</h1>
        <p><b>Usuario de Apertura:</b> ${user.nombre} ${user.apellido}</p>
        <div class="table-report">
            <div class="column-report" style="flex-basis:48%">
                <div class="row-title-report">
                    <p style="text-align:center;">Apertura de Turno<br/>Fecha & Hora</p>
                </div>
                <div class="row-report">
                    <p>${data.fecha_apertura}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:48%">
                <div class="row-title-report">
                    <p style="text-align:center;">Cierre del Turno<br/>Fecha & Hora</p>
                </div>
                <div class="row-report">
                    <p>${data.fecha_cierre === data.fecha_apertura ? 'En progreso' : data.fecha_cierre}</p>
                </div>
            </div>
        </div>
        <p></p>
        <table style="margin-bottom:25px">
            <tr>
                <th style="width:50%; text-align:right;">Venta en Efectivo:</th>
                <td style="width:50%; text-align:left;">${'\xA0\xA0\xA0\xA0'}Q ${totalVentasEfectivo.toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;">Venta en Tarjeta:</th>
                <td style="width:50%; text-align:left;">+ Q ${totalVentasTarjeta.toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;"></th>
                <td style="width:50%; text-align:left;"><hr style="width:30%; margin:0 auto 0 0;"></td>
            <tr/>
            <tr>
                <th style="width:50%; text-align:right;">Total en Ventas:</th>
                <td style="width:50%; text-align:left;">${'\xA0\xA0\xA0\xA0'}Q ${totalVentas.toFixed(2)}</td>
            </tr>
        </table>
        <table style="margin-bottom:25px">
            <tr>
                <th style="width:50%; text-align:right;">Efectivo de Apertura:</th>
                <td style="width:50%; text-align:left;">+ Q ${data.efectivo_apertura.toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;">Sobrante:</th>
                <td style="color:${sobrante > 0 ? 'green' : 'black'}; width:50%; text-align:left;">+ Q ${parseFloat(sobrante,10).toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;">Faltante:</th>
                <td style="color:${faltante > 0 ? 'red' : 'black'}; width:50%; text-align:left;">− Q ${faltante.toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;"></th>
                <td style="width:50%; text-align:left;"><hr style="width:30%; margin:0 auto 0 0;"></td>
            <tr/>
            <tr>
                <th style="width:50%; text-align:right;">Efectivo de Cierre:</th>
                <td style="width:50%; text-align:left;">${'\xA0\xA0\xA0\xA0'}Q ${data.efectivo_cierre.toFixed(2)}</td>
            </tr>
        </table>
        <table style="margin-bottom:25px">
            <tr>
                <th style="width:50%; text-align:right;">Efectivo Neto:</th>
                <td style="width:50%; text-align:left;">${'\xA0\xA0\xA0\xA0'}Q ${(totalVentasEfectivo+totalVentasTarjeta+parseFloat(sobranteFaltante,10)).toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;">Costo:</th>
                <td style="width:50%; text-align:left;">${'\xA0\xA0\xA0\xA0'}Q ${costo.toFixed(2)}</td>
            </tr>
            <tr>
                <th style="width:50%; text-align:right;">Utilidad:</th>
                <td style="width:50%; text-align:left;">${'\xA0\xA0\xA0\xA0'}Q ${utilidad.toFixed(2)}</td>
            </tr>
        </table>
    `;
};

const populateTable = async(data) => {
    for(let i = data.length-1; i >= 0; i--) {
        const ventas = await getTotalVentas(data[i].fecha_apertura, data[i].fecha_cierre);
        let totalVentas = 0;
        for(let j = 0; j < ventas.length; j++)
            totalVentas += ventas[j].subtotal;
        
        const current = [
            data[i].n_usuario,
            data[i].fecha_cierre,
            data[i].efectivo_apertura,
            data[i].efectivo_cierre,
            data[i].efectivo_apertura+totalVentas-data[i].efectivo_cierre < 0 ? Math.abs(data[i].efectivo_apertura+totalVentas-data[i].efectivo_cierre).toFixed(2) : 0,
            data[i].efectivo_apertura+totalVentas-data[i].efectivo_cierre > 0 ? (data[i].efectivo_apertura+totalVentas-data[i].efectivo_cierre).toFixed(2) : 0
        ];
        for(let j = 0; j < columns.length; j++) {         
            const newRow = document.createElement('div');
            newRow.classList.add('row-report');
            if(j == 0) {
                newRow.classList.add('clickable');
                newRow.addEventListener('mouseup', () => handleClick(current[j], data[i], ventas));
            }
            newRow.textContent = current[j];
            columns[j].append(newRow);
        }
    }
}

const determineReportType = async() => {
    table.innerHTML = originalTable.innerHTML;
    const type = document.querySelector("input[name=turnos]:checked").value;

    playLoading(salirBtn);

    if(type === 'hoy')
        await populateTable(await turnosHoy());
    else if(type === 'mes')
        await populateTable(await turnosMes());
    else if(type === 'todos')
        await populateTable(await turnosTodos());

    stopLoading(salirBtn, 'Salir');
};

determineReportType();
turnoForm.addEventListener('change', () => determineReportType());
salirBtn.addEventListener('click', () => {
    playLoading(salirBtn);
});