const fechaComienzo = document.getElementById('fechaComienzo');
const fechaFinal = document.getElementById('fechaFinal');

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();
if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;
fechaFinal.value = year + "-" + month + "-" + day;

const generateReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/utilidades-periodicas/${fechaComienzo.value}/${fechaFinal.value}`, {
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
        title.innerHTML = `Utilidad ${fechaComienzo.value} a ${fechaFinal.value}`;

        const subOne = document.createElement('h3');
        subOne.innerHTML = `Total Ventas: Q ${utilidad.totalVentas === null ? 0 : utilidad.totalVentas}`;

        const subTwo = document.createElement('h3');
        subTwo.innerHTML = `Total Costos: Q ${utilidad.totalCompras  === null ? 0 : utilidad.totalCompras}`;

        const subThree = document.createElement('h3');
        subThree.innerHTML = `Utilidad Neta: Q ${utilidad.utilidadNeta === null ? 0 : utilidad.utilidadNeta}`;

        const subFour = document.createElement('h3');
        const pUtilidad = ((utilidad.totalVentas-utilidad.totalCompras)/utilidad.totalCompras).toFixed(2)*100;
        subFour.innerHTML = `Utilidad Sobre Venta: ${pUtilidad === null ? 0 : pUtilidad}%`;

        const subFive = document.createElement('h3');
        subFive.innerHTML = `Utilidad Neta Sobrante: Q ${utilidad.utilidadNeta === null ? 0 : utilidad.utilidadNeta}`;

        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Regresar';
        const returnAnchor = document.createElement('a');
        returnAnchor.href = '/dashboard/reportes/utilidades-periodicas';
        returnAnchor.append(returnBtn);

        document.body.append(title);
        document.body.append(subOne);
        document.body.append(subTwo);
        document.body.append(subThree);
        document.body.append(subFour);
        document.body.append(subFive);
        document.body.append(returnAnchor);
        document.body.style.height = 'auto';
    });
};

const downloadReport = () => {
    fetch(`http://localhost:5000/dashboard/reportes/utilidades-periodicas-download/${fechaComienzo.value}/${fechaFinal.value}`)
    .then(report => report.json())
    .then(jsonResponse => {
        alert(jsonResponse.message);
    });
};