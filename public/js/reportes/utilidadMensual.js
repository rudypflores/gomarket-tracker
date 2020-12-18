const fecha = document.getElementById('fecha');

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
fecha.valueAsDate = today;

const generateReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/utilidad-mensual/${fecha.value}`, {
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
    .then(utilidad => {
        document.body.innerHTML = '';

        const title = document.createElement('h1');
        title.classList.add('title');
        title.innerHTML = `Utilidad ${fecha.value}`;

        const subOne = document.createElement('h3');
        subOne.innerHTML = `Total Ventas: Q ${utilidad.totalVentas === null ? 0 : utilidad.totalVentas}`;

        const subTwo = document.createElement('h3');
        subTwo.innerHTML = `Total Costos: Q ${utilidad.totalCompras  === null ? 0 : utilidad.totalCompras}`;

        const subThree = document.createElement('h3');
        subThree.innerHTML = `Utilidad Neta: Q ${utilidad.utilidadNeta === null ? 0 : utilidad.utilidadNeta}`;

        const subFour = document.createElement('h3');
        subFour.innerHTML = `Utilidad Sobre Venta: ${utilidad.pUtilidad === null ? 0 : utilidad.pUtilidad}%`;

        const subFive = document.createElement('h3');
        subFive.innerHTML = `Utilidad Neta Sobrante: Q ${utilidad.utilidadNeta === null ? 0 : utilidad.utilidadNeta}`;

        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Regresar';
        const returnAnchor = document.createElement('a');
        returnAnchor.href = '/dashboard/reportes/utilidades-mensuales';
        returnAnchor.append(returnBtn);

        document.body.append(title);
        document.body.append(subOne);
        document.body.append(subTwo);
        document.body.append(subThree);
        document.body.append(subFour);
        document.body.append(subFive);
        document.body.append(returnAnchor);
    });
};

const downloadReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/utilidad-mensual-download/${fecha.value}`)
    .then(report => report.json())
    .then(jsonResponse => {
        alert(jsonResponse.message);
    });
};