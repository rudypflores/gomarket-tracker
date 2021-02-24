const abrirButton = document.getElementById('abrir');
const exportarBtn = document.getElementById('exportar');
const salirBtn = document.getElementById('salir');
const { dialog } = require('electron').remote;

// allow leave on button press
window.addEventListener('keydown', e => {
    if(e.key === 'Backspace') {
        window.location.href = '/dashboard';
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

const generateReport = async () => {
    playLoading(abrirButton);
    fetch('http://localhost:5000/dashboard/reportes/inventario-actual-report', {
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
    .then(inventarios => {
        // generate report table
        stopLoading(abrirButton, 'Abrir');
        document.body.innerHTML = '';

        const table = document.createElement('table');
        const rowTitle = document.createElement('tr');
        table.append(rowTitle);

        // generate column title rows
        titles = [
            'Codigo',
            'P. Costo',
            'P. Venta',
            'Descripcion',
            'Existencias',
            'Total Costo',
            'Total Venta'
        ];
        for(let i = 0; i < titles.length; i++) {
            const cell = document.createElement('th');
            cell.textContent = titles[i];
            rowTitle.append(cell);
        }

        // create cells for each row
        inventarios.forEach(inventario => {
            const row = document.createElement('tr');
            table.append(row);

            const cells = [
                inventario.codigo ? inventario.codigo : 'Inventario No Existe',
                inventario.costo_q ? inventario.costo_q : 'N/A',
                inventario.precio_publico ? inventario.precio_publico : 'N/A',
                inventario.descripcion,
                inventario.existencia_actual,
                (inventario.existencia_actual*inventario.costo_q).toFixed(2),
                (inventario.existencia_actual*inventario.precio_publico).toFixed(2)
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
        returnAnchor.href = '/dashboard/reportes/inventario-actual';
        returnAnchor.append(returnBtn);

        document.body.append(table);
        document.body.append(returnAnchor);
    })
    .catch(err => {
        stopLoading(abrirButton, 'Abrir');
    });
};

const downloadReport = async () => {
    playLoading(exportarBtn);
    await dialog.showSaveDialog({properties: ['openFile', 'showOverwriteConfirmation', 'createDirectory'], buttonLabel:'Guardar', showsTagField:true, filters: [
        { name: 'Excel', extensions: ['csv'] },
    ]})
    .then(result => {
        if(!result.canceled) {
            fetch(`http://localhost:5000/dashboard/reportes/inventario-actual-report-download`, {
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