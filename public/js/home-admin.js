const sectionItemTabs = document.getElementsByClassName('nav-section-tab');
const comprasYVentasChart = document.getElementById('comprasYVentasChart');
const productosMasVendidosChart = document.getElementById('productosMasVendidosChart');
const Chart = require('chart.js');
const moment = require('moment');
require('moment-timezone');

const loadShortcuts = () => {
    document.body.addEventListener('keydown', e => {
        if(e.key === 'F1')
            window.location.href = '/dashboard/movimientos/ventas';
        else if(e.key === 'F2')
            window.location.href = '/dashboard/movimientos/compras';
        else if(e.key === 'F3')
            window.location.href = '/dashboard/reportes/cierres-de-turno';
        else if(e.key === 'F4')
            window.location.href = '/dashboard/reportes-en-pantalla/ventas-detalladas';
    });
};

const getCurrentWeek = () => {
    const currentDate = moment.tz(moment(), 'America/Guatemala');
    const weekStart = currentDate.clone().startOf('isoWeek').subtract(1, 'days');
    const weekEnd = currentDate.clone().endOf('isoWeek').subtract(1, 'days');
    return [weekStart.format('YYYY-MM-DD HH:mm:ss'), weekEnd.format('YYYY-MM-DD HH:mm:ss')];
}

const getTotalVentas = async() => {
    const [firstDay, lastDay] = getCurrentWeek();
    const ventas = await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${firstDay}/${lastDay}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json());
    if(ventas.length === 0) return [0,0,0,0,0,0,0];

    // parse to days of week (saves multiple connections!)
    const ventasPorTurno = { 0: [], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
    let nextShift = moment.tz(firstDay, 'America/Guatemala');
    let currentShift = moment.tz(firstDay, 'America/Guatemala');
    nextShift.add(1, 'days');
    nextShift.set({ hour: 7, minute: 0, second: 0 });
    currentShift.set({ hour: 7, minute: 0, second: 0 });

    // seperate venta by shift days
    ventas.forEach(venta => {
        let curr = moment.tz(venta.fecha_de_venta, 'America/Guatemala');
        if(curr.isBetween(currentShift, nextShift, '[]')) {
            if(curr.isSame(currentShift, 'day'))
                ventasPorTurno[curr.day()].push(venta.subtotal);
            else
                ventasPorTurno[curr.day()-1].push(venta.subtotal);
        }
        else if(curr.isSameOrAfter(nextShift, 'hour') && curr.isSameOrAfter(nextShift, 'day')) {
            nextShift.add(1, 'days');
            currentShift.add(1, 'days');
            ventasPorTurno[curr.day()].push(venta.subtotal);
        }
    });
    // add all subtotals
    const subtotals = [];
    Object.values(ventasPorTurno).forEach(venta => subtotals.push(venta.length > 0 ? venta.reduce((acc, curr) => acc + curr).toFixed(2) : 0));
    return subtotals;
};

const getTotalCompras = async() => {
    const [firstDay, lastDay] = getCurrentWeek();
    const compras = await fetch(`http://localhost:5000/dashboard/reportes/compras-por-tiempo-dashboard/${firstDay}/${lastDay}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json());

    if(compras.length === 0) return [0,0,0,0,0,0,0];

    // parse to days of week (saves multiple connections!)
    const comprasPorTurno = { 0: [], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
    let nextShift = moment.tz(firstDay, 'America/Guatemala');
    let currentShift = moment.tz(firstDay, 'America/Guatemala');
    nextShift.add(1, 'days');
    nextShift.set({ hour: 7, minute: 0, second: 0 });
    currentShift.set({ hour: 7, minute: 0, second: 0 });

    // seperate venta by shift days
    compras.forEach(compra => {
        let curr = moment.tz(compra.fecha_de_compra, 'America/Guatemala');
        if(curr.isBetween(currentShift, nextShift, '[]')) {
            if(curr.isSame(currentShift, 'day'))
                comprasPorTurno[curr.day()].push(compra.subtotal);
            else
                comprasPorTurno[curr.day()-1].push(compra.subtotal);
        }
        else if(curr.isSameOrAfter(nextShift, 'hour') && curr.isSameOrAfter(nextShift, 'day')) {
            nextShift.add(1, 'days');
            currentShift.add(1, 'days');
            comprasPorTurno[curr.day()].push(compra.subtotal);
        }
    });
    // add all subtotals
    const subtotals = [];
    Object.values(comprasPorTurno).forEach(compra => subtotals.push(compra.length > 0 ? compra.reduce((acc, curr) => acc + curr).toFixed(2) : 0));
    return subtotals;
};

const getProductosMasVendidos = async() => {
    const result = await fetch(`http://localhost:5000/dashboard/reportes-en-pantalla/productos-mas-vendidos-report`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }).then(response => response.json());

    let descripcion = [];
    let counts = [];
    result.forEach(r => {
        descripcion.push(r.descripcion);
        counts.push(r.counts);
    });
    return [descripcion, counts];
};

const getProductosMenosVendidos = async() => {
    const result = await fetch(`http://localhost:5000/dashboard/reportes-en-pantalla/productos-menos-vendidos-report`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }).then(response => response.json());

    let descripcion = [];
    let counts = [];
    result.forEach(r => {
        descripcion.push(r.descripcion);
        counts.push(r.counts);
    });
    return [descripcion, counts];
};

// Graphs
const loadGraphs = async() => {

    const totalVentas = await getTotalVentas();
    const totalCompras = await getTotalCompras();
    const [descripcion, counts] = await getProductosMasVendidos();
    const [descripcion2, counts2] = await getProductosMenosVendidos();

    // Graph total ventas and total compras for each day of the week
    const chartOne = new Chart(comprasYVentasChart, {
        type: 'line',
        data: {
            labels: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
            datasets: [{
                label: 'Ventas',
                data: totalVentas,
                backgroundColor: [
                    'rgba(53, 105, 134, 0.5)',
                ],
                // borderColor: [
                //     'rgba(34, 74, 103, 1)',
                // ],
                borderWidth: 0,
                pointBackgroundColor: [
                    'rgba(34, 74, 103, 1)',
                    'rgba(34, 74, 103, 1)',
                    'rgba(34, 74, 103, 1)',
                    'rgba(34, 74, 103, 1)',
                    'rgba(34, 74, 103, 1)',
                    'rgba(34, 74, 103, 1)',
                    'rgba(34, 74, 103, 1)',
                ]
            },
            {
                label: 'Compras',
                data: totalCompras,
                backgroundColor: [
                    'rgba(225, 205, 107, 0.5)'
                ],
                // borderColor: [
                //     'rgba(225, 205, 107, 1)'
                // ],
                borderWidth: 0,
                pointBackgroundColor: [
                    'rgba(225, 205, 107, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(225, 205, 107, 1)',
                ]
            }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: true,
                text: 'Total de Compras & Ventas por Turno'
            }
        }
    });

    const backgroundColorsOne = [];
    const backgroundColorsTwo = [];
    const colorOne = 'rgba(53, 105, 134, 1)';
    const colorTwo = 'rgba(225, 205, 107, 1)';
    for(let i = 0; i < descripcion.length; i++) {
        backgroundColorsOne.push(colorOne);
        backgroundColorsTwo.push(colorTwo);
    }

    const randChance = Math.floor(Math.random() * 2);
    const datasetOne = {
        label: 'Mas Vendidos',
        data: counts,
        backgroundColor: backgroundColorsOne,
    };
    const datasetTwo = {
        label: 'Menos Vendidos',
        data:counts2,
        backgroundColor: backgroundColorsTwo
    };

    // Graph productos mas vendidos
    const chartTwo = new Chart(productosMasVendidosChart, {
        type: 'bar',
        data: {
            labels: randChance == 0 ? descripcion : descripcion2,
            datasets: [
                randChance == 0 ? datasetOne : datasetTwo
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: true,
                text: 'Ventas de Productos'
            }
        }
    });
};

// user interaction stuff
const toggleHide = (elements, toggle) => {
    for(let i = 1; i < elements.children.length; i++) {
        if(toggle)
            elements.children[i].classList.add('hide');
        else
            elements.children[i].classList.remove('hide');
    }
}

const expandTab = event => {
    const section = event.currentTarget.children[2];
    if(section.classList.contains('rotateDown')) {
        // Hide tabs for clicked section
        section.classList.remove('rotateDown');
        section.classList.add('rotateUp');
        toggleHide(section.parentNode.parentNode, true);
    }
    else { // Show the tabs for clicked section
        section.classList.add('rotateDown');
        toggleHide(section.parentNode.parentNode, false);
    }
};

for(tabs of sectionItemTabs) {
    toggleHide(tabs, true); // Hide all tabs first on page load
    tabs.children[0].addEventListener('mouseup', event => expandTab(event));
}

loadGraphs();
loadShortcuts();