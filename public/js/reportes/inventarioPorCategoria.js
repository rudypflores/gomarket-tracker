const ubicacion = document.getElementById('ubicacion');
const $ = require('jquery');
require('selectize');

// allow leave on button press
window.addEventListener('keydown', e => {
    if(e.key === 'Backspace') {
        window.location.href = '/dashboard/reportes/inventario-por-categoria';
    }
});

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
    let data = jsonResponse.map(curr => {return { nit: curr.codigo, nombre: curr.ubicacion }});
    $('#ubicacion').selectize({
        valueField: 'nombre',
        labelField: 'nit',
        searchField: ['nombre', 'nit'],
        options: data,
        closeAfterSelect:true,
        selectOnTab:true,
        openOnFocus:false,
        render: {
            item: function(item, escape) {
                return '<div>' +
                    (item.nombre ? '<span class="nombre">' + escape(item.nombre) + '</span>' : '') +
                    // (item.nit ? '<span class="codigo">' + escape(item.nit) + '</span>' : '') +
                '</div>';
            },
            option: function(item, escape) {
                var label = item.nombre || item.nit;
                var caption = item.nombre ? item.nit : null;
                return '<div>' +
                    '<span class="label"><b>' + escape(label) + '</b></span><br/>' +
                    (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                '</div>';
            }
        },
        onItemAdd: (value) => {
            ubicacion.value = value;
            document.getElementById('ingresar').focus();
        }
    });
    $('#ubicacion').selectize()[0].selectize.focus();
});

const generateReport = e => {
    fetch(`http://localhost:5000/dashboard/reportes/inventario-por-categoria-report/${document.getElementById('ubicacion').value}`, {
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
        document.body.innerHTML = '';
        const table = document.createElement('table');
        const rowTitle = document.createElement('tr');
        table.append(rowTitle);

        // generate column title rows
        titles = [
            'Codigo',
            'Descripcion',
            'P. Venta',
            'Cant. Ant',
            'Cant.'
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
                    `${inventario.descripcion} (${inventario.ubicacion ? inventario.ubicacion : 'N/A'})`,
                    inventario.precio_publico ? inventario.precio_publico : 'N/A',
                    inventario.existencia_actual,
                    '\t'
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
        returnAnchor.href = '/dashboard/reportes/inventario-por-categoria';
        returnAnchor.append(returnBtn);

        document.body.append(table);
        document.body.append(returnAnchor);
    });
};