fetch('http://localhost:5000/dashboard/reportes/inventario-nuevo-report', {
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
    console.table(inventarios);
    const table = document.createElement('div');
    table.classList.add('table-report');
    
    // Generate columns
    const columns = [];
    const sizes = [
        '20%',
        '40%',
        '10%',
        '10%',
        '10%',
    ];
    for(let i = 0; i < sizes.length; i++) {
        const column = document.createElement('div');
        column.classList.add('column-report');
        if(i%2 == 0)
            column.style.backgroundColor = '#224a67';
        else
            column.style.backgroundColor = '#356986';
        column.style.flexBasis = sizes[i];
        columns.push(column);
        table.append(column);
    }

    // generate column title rows
    titles = [
        'Codigo',
        'Descripcion',
        'P. Venta',
        'Cant. Ant',
        'Cant.'
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
            `${inventario.descripcion} (${inventario.ubicacion})`,
            inventario.precio_publico,
            inventario.existencia_actual,
            '\xa0'
        ];

        for(let i = 0; i < columns.length; i++) {
            const row = document.createElement('div');
            row.classList.add('row-report');
            row.textContent = rows[i];
            columns[i].append(row);
        }
    });
    
    document.body.append(table);
});