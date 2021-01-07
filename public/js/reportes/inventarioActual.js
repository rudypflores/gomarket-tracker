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
    const table = document.createElement('div');
    table.classList.add('table-report');

    // Generate columns
    const columns = [];
    const sizes = [
        '30%',
        '10%',
        '10%',
        '5%',
        '10%',
        '15%',
        '10%'
    ];
    for(let i = 0; i < sizes.length; i++) {
        const column = document.createElement('div');
        column.style.fontSize = '0.75em';
        column.classList.add('column-report');
        column.style.flexBasis = sizes[i];
        columns.push(column);
        table.append(column);
    }

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

    for(let i = 0; i < columns.length; i++) {
        const titleRow = document.createElement('div');
        titleRow.classList.add('row-title-report');
        titleRow.textContent = titles[i];
        columns[i].append(titleRow);
    }

    // Generate rows for found reports
    inventarios.forEach(inventario => {
        const rows = [
            inventario.codigo,
            inventario.costo_q,
            inventario.precio_publico,
            inventario.descripcion,
            inventario.existencia_actual,
            inventario.existencia_actual*inventario.costo_q,
            inventario.existencia_actual*inventario.precio_publico
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
    returnAnchor.href = '/dashboard';
    returnAnchor.append(returnBtn);
    document.body.append(table);
    document.body.append(returnAnchor);
});