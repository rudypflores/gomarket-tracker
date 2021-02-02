const fecha = document.getElementById('fecha');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');

const generateReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/compras-mensuales/${fecha.value}`, {
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
    .then(compras => {
        // generate report table
        document.body.innerHTML = '';

        const table = document.createElement('div');
        table.classList.add('table-report');
        
        // Generate columns
        const columns = [];
        const sizes = [
            '7%',
            '10%',
            '15%',
            '25%',
            '25%',
            '3%',
            '5%',
            '8%'
        ];
        for(let i = 0; i < sizes.length; i++) {
            const column = document.createElement('div');
            column.classList.add('column-report');
            column.style.flexBasis = sizes[i];
            columns.push(column);
            table.append(column);
        }

        // generate column title rows
        titles = [
            'Fecha',
            'Compra No.',
            'Proveedor',
            'Codigo',
            'Descripcion',
            'Cant.',
            'P/Compra',
            'Subtotal'
        ];

        for(let i = 0; i < columns.length; i++) {
            const titleRow = document.createElement('div');
            titleRow.classList.add('row-title-report');
            titleRow.textContent = titles[i];
            columns[i].append(titleRow);
        }

        // Generate rows for found reports
        compras.forEach(compra => {
            const rows = [
                compra.fecha_de_compra,
                compra.factura_no,
                compra.proveedor,
                compra.codigo_de_producto,
                compra.descripcion,
                compra.cantidad,
                compra.precio_q,
                compra.subtotal.toFixed(2)
            ];

            for(let i = 0; i < columns.length; i++) {
               const row = document.createElement('div');
               row.classList.add('row-report');
               row.textContent = rows[i];
               columns[i].append(row);
            }
        });

        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Regresar';
        const returnAnchor = document.createElement('a');
        returnAnchor.href = '/dashboard/reportes/compras-mensuales';
        returnAnchor.append(returnBtn);

        // Render table
        document.body.append(table);
        document.body.append(returnAnchor);
        document.body.style.height = 'auto';
    });
};

const downloadReport = () => {
    dialog.showSaveDialog({properties: ['openFile', 'showOverwriteConfirmation', 'createDirectory'], buttonLabel:'Guardar', showsTagField:true, filters: [
        { name: 'Excel', extensions: ['csv'] },
    ]})
    .then(result => {
        if(!result.canceled) {
            fetch(`http://localhost:5000/dashboard/reportes/compras-mensuales-download`, {
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
};

// prefill to todays date
let today = moment.tz(moment(), 'America/Guatemala');
fecha.value = today.format('YYYY-MM');