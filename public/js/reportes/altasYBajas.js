const fecha = document.getElementById('fecha');

const generateReport = () => {
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
        document.body.innerHTML = '';

        const table = document.createElement('div');
        table.classList.add('table-report');
        
        // Generate columns
        const columns = [];
        const sizes = [
            '25%',
            '25%',
            '25%',
            '25%',
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
            'Nombre',
            'Cambio',
            'Descripción'
        ];

        for(let i = 0; i < columns.length; i++) {
            const titleRow = document.createElement('div');
            titleRow.classList.add('row-title-report');
            titleRow.textContent = titles[i];
            columns[i].append(titleRow);
        }

        // Generate rows for found reports
        altasYBajas.forEach(altaYBaja => {
            console.table(altaYBaja);
            const rows = [
                altaYBaja.codigo,
                altaYBaja.nombre,
                altaYBaja.cantidad_cambio,
                altaYBaja.descripcion
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
        returnAnchor.href = '/dashboard/reportes/altas-y-bajas';
        returnAnchor.append(returnBtn);

        // Render table
        document.body.append(table);
        document.body.append(returnAnchor);
    });
};

const downloadReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/altas-y-bajas-download/${fecha.value}`)
    .then(report => report.json())
    .then(jsonResponse => {
        alert(jsonResponse.message);
    });
};

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
fecha.valueAsDate = today;