const fechaEmpiezo = document.getElementById('fechaEmpiezo');
const fechaFinal = document.getElementById('fechaFinal');
const abrirButton = document.getElementById('abrir');
const exportarBtn = document.getElementById('exportar');
const salirBtn = document.getElementById('salir');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');

// allow leave on button press
window.addEventListener('keydown', e => {
    if(e.key === 'Backspace') {
        window.location.href = '/dashboard/reportes/ventas-por-tiempo';
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
    fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${fechaEmpiezo.value}/${fechaFinal.value}`, {
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
    .then(ventas => {
        // generate report table
        stopLoading(abrirButton, 'Abrir');
        document.body.innerHTML = '';

        const table = document.createElement('table');
        const rowTitle = document.createElement('tr');
        table.append(rowTitle);

        // generate column title rows
        titles = [
            'Venta',
            'Codigo',
            'Descripcion',
            'Cantidad',
            'P.U. Costo',
            'P.P',
            'Subtotal'
        ];
        for(let i = 0; i < titles.length; i++) {
            const cell = document.createElement('th');
            cell.textContent = titles[i];
            rowTitle.append(cell);
        }

        let total = 0;

        // create cells for each row
        ventas.forEach(venta => {
            const row = document.createElement('tr');
            table.append(row);

            const cells = [
                venta.factura_no ? venta.factura_no : 'N/A',
                venta.codigo_de_producto ? venta.codigo_de_producto : 'N/A',
                venta.descripcion ? venta.descripcion : 'N/A',
                venta.cantidad ? venta.cantidad : 'N/A',
                venta.costo_q ? venta.costo_q : 'N/A',
                venta.precio_q ? venta.precio_q : 'N/A',
                venta.subtotal ? venta.subtotal.toFixed(2) : 'N/A'
            ];

            total += venta.subtotal;

            for(let i = 0; i < titles.length; i++) {
                const cell = document.createElement('td');
                cell.textContent = cells[i];
                row.append(cell);
            }
        });

        const totalText = document.createElement('h1');
        totalText.textContent = `Total: ${total.toFixed(2)}`;

        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Regresar';
        const returnAnchor = document.createElement('a');
        returnAnchor.href = '/dashboard/reportes/ventas-por-tiempo';
        returnAnchor.append(returnBtn);

        document.body.append(table);
        document.body.append(totalText);
        document.body.append(returnAnchor);
    })
    .catch(err => {
        stopLoading(abrirButton, 'Abrir');
    })
};

const downloadReport = async () => {
    playLoading(exportarBtn);
    await dialog.showSaveDialog({properties: ['openFile', 'showOverwriteConfirmation', 'createDirectory'], buttonLabel:'Guardar', showsTagField:true, filters: [
        { name: 'Excel', extensions: ['csv'] },
    ]})
    .then(result => {
        if(!result.canceled) {
            fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo-download`, {
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
                    fechaEmpiezo: fechaEmpiezo.value,
                    fechaFinal: fechaFinal.value,
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
    });
    stopLoading(exportarBtn, 'Exportar');
};

salirBtn.addEventListener('click', () => {
    playLoading(salirBtn);
});