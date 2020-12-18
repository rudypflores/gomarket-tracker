const fecha = document.getElementById('fecha');

const generateReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/ventas-mensuales/${fecha.value}`, {
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
        console.log(ventas);
        document.body.innerHTML = '';

        const table = document.createElement('div');
        table.classList.add('table-report');
        
        // Generate columns
        const columns = [];
        const sizes = [
            '10%',
            '20%',
            '30%',
            '9%',
            '10%',
            '10%',
            '10%'
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
            'Venta',
            'Codigo',
            'Descripcion',
            'Cantidad',
            'P.U. Costo',
            'P.P',
            'Subtotal'
        ];

        for(let i = 0; i < columns.length; i++) {
            const titleRow = document.createElement('div');
            titleRow.classList.add('row-title-report');
            titleRow.textContent = titles[i];
            columns[i].append(titleRow);
        }

        // Generate rows for found reports
        ventas.forEach(venta => {
            const rows = [
                venta.venta_no,
                venta.codigo_de_producto,
                venta.descripcion,
                venta.cantidad,
                venta.costo_q,
                venta.precio_publico,
                venta.subtotal
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
        returnAnchor.href = '/dashboard/reportes/ventas-mensuales';
        returnAnchor.append(returnBtn);

        // Render table
        document.body.append(table);
        document.body.append(returnAnchor);
    });
};

const downloadReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/ventas-mensuales-download/${fecha.value}`)
    .then(report => report.json())
    .then(jsonResponse => {
        alert(jsonResponse.message);
    });
};

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
fecha.valueAsDate = today;