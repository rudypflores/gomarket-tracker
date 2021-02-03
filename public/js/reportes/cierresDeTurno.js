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
    for(let i = 0; i < ventasData.length; i++) {
        costo += ventasData[i].costo_q*ventasData[i].cantidad;
        totalVentas += ventasData[i].subtotal;
        if(ventasData[i].tipo_de_pago === 'efectivo') {
            totalVentasEfectivo += ventasData[i].subtotal;
        } else if(ventasData[i].tipo_de_pago === 'tarjeta') {
            totalVentasTarjeta += ventasData[i].subtotal;
        }
    }

    const sobrante = data.efectivo_apertura+totalVentas-data.efectivo_cierre < 0 ? Math.abs(data.efectivo_apertura+totalVentas-data.efectivo_cierre).toFixed(2) : 0;

    stopLoading(salirBtn, 'Salir');
    document.body.innerHTML = `
        <a href="/dashboard/reportes/cierres-de-turno"><img src="../../img/logo.svg" class="logo"/></a>
        <h2>Zona 18</h2>
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
        <div class="table-report">
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Efectivo de Apertura</p>
                </div>
                <div class="row-report">
                    <p>Q ${data.efectivo_apertura}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Venta en Efectivo</p>
                </div>
                <div class="row-report">
                    <p>Q ${totalVentasEfectivo}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Venta con Tarjeta</p>
                </div>
                <div class="row-report">
                    <p>Q ${totalVentasTarjeta}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Total en Ventas</p>
                </div>
                <div class="row-report">
                    <p>Q ${totalVentas}</p>
                </div>
            </div>
        </div>
        <p></p>
        <div class="table-report">
            <div class="column-report" style="flex-basis:24%">
            <div class="row-title-report">
                <p style="text-align:center;">Gastos Sobre Ventas</p>
            </div>
            <div class="row-report">
                <p>Q ${0}</p>
            </div>
            </div>
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Efectivo de Cierre</p>
                </div>
                <div class="row-report">
                    <p>Q ${data.efectivo_cierre}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Sobrante</p>
                </div>
                <div class="row-report">
                    <p>Q ${sobrante}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:24%">
                <div class="row-title-report">
                    <p style="text-align:center;">Faltante</p>
                </div>
                <div class="row-report">
                    <p>Q ${data.efectivo_apertura+totalVentas-data.efectivo_cierre > 0 ? data.efectivo_apertura+totalVentas-data.efectivo_cierre : 0}</p>
                </div>
            </div>
        </div>
        <p></p>
        <div class="table-report">
            <div class="column-report" style="flex-basis:32%">
                <div class="row-title-report">
                    <p style="text-align:center;">Efectivo Neto</p>
                </div>
                <div class="row-report">
                    <p>Q ${totalVentasEfectivo+totalVentasTarjeta+parseFloat(sobrante,10)}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:32%">
                <div class="row-title-report">
                    <p style="text-align:center;">Costo</p>
                </div>
                <div class="row-report">
                    <p>Q ${costo.toFixed(2)}</p>
                </div>
            </div>
            <div class="column-report" style="flex-basis:32%">
                <div class="row-title-report">
                    <p style="text-align:center;">Utilidad</p>
                </div>
                <div class="row-report">
                    <p>Q ${(totalVentas-costo).toFixed(2)}</p>
                </div>
            </div>
        </div>
        <p></p>
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
            data[i].efectivo_apertura+totalVentas-data[i].efectivo_cierre > 0 ? data[i].efectivo_apertura+totalVentas-data[i].efectivo_cierre : 0
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