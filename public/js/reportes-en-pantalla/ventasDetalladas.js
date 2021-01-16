let table = document.getElementById('turnos-table');
const columns = document.getElementsByClassName('column');
const turnoForm = document.getElementById('turno-form');


// store default table
const originalTable = document.createElement('div');
originalTable.innerHTML = table.innerHTML;

const populateTable = async(data) => {
    let totalVentas = 0;
    for(let i = 0; i < data.length; i++) {
        const current = [
            data[i].venta_no,
            new Date(data[i].fecha_de_venta).toLocaleString('es-gt'),
            data[i].cantidad,
            data[i].descripcion,
            data[i].precio_q,
            data[i].cantidad*data[i].precio_q
        ];
        totalVentas += data[i].cantidad*data[i].precio_q;
        for(let j = 0; j < columns.length; j++) {            
            const newRow = document.createElement('div');
            newRow.classList.add('row');
            if(j == 0) {
                newRow.classList.add('clickable');
            }
            newRow.textContent = current[j];
            columns[j].append(newRow);
        }
    }
    document.getElementById('totalVentas').textContent = 'Q ' + totalVentas.toFixed(2);
}

const todasV = async() => {
    return await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/ventas-detalladas-todos-v', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());
};
const contadoV = async() => {
    return await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/ventas-detalladas-contado-v', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());
};
const creditoV = async() => {
    return await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/ventas-detalladas-credito-v', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());
};

const todasT = async() => {
    return await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/ventas-detalladas-todos-t', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());
};
const contadoT = async() => {
    return await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/ventas-detalladas-contado-t', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());
};
const creditoT = async() => {
    return await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/ventas-detalladas-credito-t', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());
};

const determineReportType = async() => {
    table.innerHTML = originalTable.innerHTML;
    const type = document.querySelector("input[name=seleccion]:checked").value;

    switch(type) {
        case 'todas-v':
            populateTable(await todasV());
            break;
        case 'contado-v':
            populateTable(await contadoV());
            break;
        case 'credito-v':
            populateTable(await creditoV());
            break;
        case 'todas-t':
            populateTable(await todasT());
            break;
        case 'contado-t':
            populateTable(await contadoT());
            break;
        case 'credito-t':
            populateTable(await creditoT());
            break;
    }
};

determineReportType();
turnoForm.addEventListener('change', () => determineReportType());