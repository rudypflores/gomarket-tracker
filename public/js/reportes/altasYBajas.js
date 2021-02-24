const fecha = document.getElementById('fecha');
const abrirButton = document.getElementById('abrir');
const exportarBtn = document.getElementById('exportar');
const salirBtn = document.getElementById('salir');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');

// allow leave on button press
window.addEventListener('keydown', e => {
    if(e.key === 'Backspace') {
        window.location.href = '/dashboard/reportes/altas-y-bajas';
    }
});

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

const generateReport = () => {
    playLoading(abrirButton);
    fetch(`http://localhost:5000/dashboard/reportes/altas-y-bajas/${fecha.value}`, {
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
    .then(response => response.json())
    .then(altasYBajas => {
        // generate report table
        stopLoading(abrirButton, 'Abrir');
        document.body.innerHTML = '';

        const table = document.createElement('table');
        const rowTitle = document.createElement('tr');
        table.append(rowTitle);

        // generate column title rows
        titles = [
            'Fecha',
            'Codigo',
            'Nombre',
            'Cambio',
            'Descripción'
        ];
        for(let i = 0; i < titles.length; i++) {
            const cell = document.createElement('th');
            cell.textContent = titles[i];
            rowTitle.append(cell);
        }

        // create cells for each row
        altasYBajas.forEach(altaYBaja => {
            const row = document.createElement('tr');
            table.append(row);

            const cells = [
                moment.tz(altaYBaja.fecha, 'America/Guatemala').format('YYYY-MM-DD'),
                altaYBaja.codigo,
                altaYBaja.nombre,
                altaYBaja.cantidad_cambio,
                altaYBaja.descripcion
            ];

            for(let i = 0; i < titles.length; i++) {
                const cell = document.createElement('td');
                cell.textContent = cells[i];
                row.append(cell);
            }
        });

        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Regresar';
        const returnAnchor = document.createElement('a');
        returnAnchor.href = '/dashboard/reportes/altas-y-bajas';
        returnAnchor.append(returnBtn);

        document.body.append(table);
        document.body.append(returnAnchor);
    })
    .catch(err => {
        stopLoading(abrirButton, 'Abrir');
    });
};

const downloadReport = async() => {
    playLoading(exportarBtn);
    await dialog.showSaveDialog({properties: ['openFile', 'showOverwriteConfirmation', 'createDirectory'], buttonLabel:'Guardar', showsTagField:true, filters: [
        { name: 'Excel', extensions: ['csv'] },
    ]})
    .then(result => {
        if(!result.canceled) {
            fetch(`http://localhost:5000/dashboard/reportes/altas-y-bajas-download`, {
                method: 'POST',
                mode: 'cors', 
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify({
                    fecha: fecha.value,
                    location: result.filePath.replace(/\\/g, '/')
                })
            })
            .then(report => report.json())
            .then(jsonResponse => {
                dialog.showMessageBox({title: 'Exportar a Excel', message:jsonResponse.message});
            });
        }
    })
    .catch(err => {
        console.log(err);
    })
    stopLoading(exportarBtn, 'Exportar');
};

salirBtn.addEventListener('click', () => {
    playLoading(salirBtn);
});

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();
if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;
fecha.value = year + "-" + month + "-" + day;