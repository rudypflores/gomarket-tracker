const fecha = document.getElementById('fecha');
const abrirButton = document.getElementById('abrir');
const exportarBtn = document.getElementById('exportar');
const salirBtn = document.getElementById('salir');
const { dialog } = require('electron').remote;

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();
if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;
fecha.value = year + "-" + month + "-" + day;

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
    fetch(`http://localhost:5000/dashboard/reportes/utilidad-diaria/${fecha.value}`, {
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
        stopLoading(abrirButton, 'Abrir');
        document.body.innerHTML = '';

        const title = document.createElement('h1');
        title.classList.add('title');
        title.innerHTML = `Utilidad ${fecha.value}`;

        const subOne = document.createElement('h3');
        subOne.innerHTML = `Total Ventas: Q ${utilidad.totalVentas === null ? 0 : utilidad.totalVentas.toFixed(2)}`;

        const subTwo = document.createElement('h3');
        subTwo.innerHTML = `Total Costos: Q ${utilidad.totalCompras  === null ? 0 : utilidad.totalCompras.toFixed(2)}`;

        const subThree = document.createElement('h3');
        subThree.innerHTML = `Utilidad Neta: Q ${utilidad.utilidadNeta === null ? 0 : utilidad.utilidadNeta.toFixed(2)}`;

        const subFour = document.createElement('h3');
        const pUtilidad = ((utilidad.totalVentas-utilidad.totalCompras)/utilidad.totalCompras).toFixed(2)*100;
        subFour.innerHTML = `Utilidad Sobre Venta: ${pUtilidad === null ? 0 : pUtilidad}%`;

        const subFive = document.createElement('h3');
        subFive.innerHTML = `Utilidad Neta Sobrante: Q ${utilidad.utilidadNeta === null ? 0 : utilidad.utilidadNeta.toFixed(2)}`;

        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Regresar';
        const returnAnchor = document.createElement('a');
        returnAnchor.href = '/dashboard/reportes/utilidad-diaria';
        returnAnchor.append(returnBtn);

        document.body.append(title);
        document.body.append(subOne);
        document.body.append(subTwo);
        document.body.append(subThree);
        document.body.append(subFour);
        document.body.append(subFive);
        document.body.append(returnAnchor);
        document.body.style.height = 'auto';
    })
    .catch(err => {
        stopLoading(abrirButton, 'Abrir');
    });
};

const downloadReport = async() => {
    playLoading(exportarBtn);
    await dialog.showSaveDialog({properties: ['openFile', 'showOverwriteConfirmation', 'createDirectory'], buttonLabel:'Guardar', showsTagField:true, filters: [
        { name: 'Excel', extensions: ['csv'] },
    ]})
    .then(result => {
        if(!result.canceled) {
            fetch(`http://localhost:5000/dashboard/reportes/utilidad-diaria-download`, {
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
                    fecha: fecha.value,
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