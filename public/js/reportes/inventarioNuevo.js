// allow leave on button press
window.addEventListener('keydown', e => {
    if(e.key === 'Backspace') {
        window.location.href = '/dashboard';
    }
});

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
    returnAnchor.href = '/dashboard';
    returnAnchor.append(returnBtn);

    document.body.append(table);
    document.body.append(returnAnchor);
});