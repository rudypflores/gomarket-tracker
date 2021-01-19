const sectionItemTabs = document.getElementsByClassName('nav-section-tab');
const comprasYVentasChart = document.getElementById('comprasYVentasChart');
const productosMasVendidosChart = document.getElementById('productosMasVendidosChart');
const Chart = require('chart.js');

const getCurrentWeek = () => {
    let curr = new Date;
    let week = [];

    for (let i = 0; i <= 7; i++) {
        let first = curr.getDate() - curr.getDay() + i;
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
        week.push(day);
    }

    return week;
}

const formatDateTime = dt => {
    return `${
        (dt.getMonth()+1).toString().padStart(2, '0')}-${
        dt.getDate().toString().padStart(2, '0')}-${
        dt.getFullYear().toString().padStart(4, '0')} ${
        dt.getHours().toString().padStart(2, '0')}:${
        dt.getMinutes().toString().padStart(2, '0')}:${
        dt.getSeconds().toString().padStart(2, '0')}`
}

const createShiftDate = timestamp => {
    const dt = new Date(timestamp);
    dt.setHours(7);
    dt.setMinutes(0);
    dt.setSeconds(0);
    return dt;
};

const getTotalVentas = async() => {
    const week = getCurrentWeek();
    let firstDay = createShiftDate(week[0]);
    let lastDay = createShiftDate(week[week.length-1]);

    const ventas = await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${formatDateTime(firstDay)}/${formatDateTime(lastDay)}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json());

    if(ventas.length === 0)
        return [0,0,0,0,0,0,0];

    // parse to days of week (saves connections!)
    const ventasPorTurno = { 0: [], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
    let nextShift = createShiftDate(ventas[0].fecha_de_venta);
    nextShift.setDate(nextShift.getDate() + 1);

    // seperate venta by shift
    ventas.forEach(venta => {
        const curr = new Date(venta.fecha_de_venta);
        if(curr >= nextShift) {
            nextShift.setDate(nextShift.getDate() + 1);
            ventasPorTurno[curr.getDay()].push(venta.subtotal);
        } else if (curr < nextShift && curr.getDay() === nextShift.getDay()) {
            ventasPorTurno[curr.getDay()-1].push(venta.subtotal);
        } else {
            ventasPorTurno[curr.getDay()].push(venta.subtotal);
        }
    });

    // add all subtotals
    const subtotals = [];
    Object.values(ventasPorTurno).forEach(venta => subtotals.push(venta.length > 0 ? venta.reduce((acc, curr) => acc + curr) : 0));
    return subtotals;
};

const getTotalCompras = async() => {
    const week = getCurrentWeek();
    let firstDay = createShiftDate(week[0]);
    let lastDay = createShiftDate(week[week.length-1]);

    const compras = await fetch(`http://localhost:5000/dashboard/reportes/compras-por-tiempo/${formatDateTime(firstDay)}/${formatDateTime(lastDay)}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json());

    if(compras.length === 0)
        return [0,0,0,0,0,0,0];

    // parse to days of week (saves connections!)
    const comprasPorTurno = { 0: [], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
    let nextShift = createShiftDate(compras[0].fecha_de_compra);
    nextShift.setDate(nextShift.getDate() + 1);

    // seperate venta by shift
    compras.forEach(compra => {
        const curr = new Date(compra.fecha_de_compra);
        if(curr >= nextShift) {
            nextShift.setDate(nextShift.getDate() + 1);
            comprasPorTurno[curr.getDay()].push(compra.subtotal);
        } else if (curr < nextShift && curr.getDay() === nextShift.getDay()) {
            comprasPorTurno[curr.getDay()-1].push(compra.subtotal);
        } else {
            comprasPorTurno[curr.getDay()].push(compra.subtotal);
        }
    });

    // add all subtotals
    const subtotals = [];
    Object.values(comprasPorTurno).forEach(compra => subtotals.push(compra.length > 0 ? compra.reduce((acc, curr) => acc + curr) : 0));
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

// Graphs
const loadGraphs = async() => {

    const totalVentas = await getTotalVentas();
    const totalCompras = await getTotalCompras();
    const [descripcion, counts] = await getProductosMasVendidos();

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

    const backgroundColors = [];
    const colorOne = 'rgba(53, 105, 134, 1)';
    const colorTwo = 'rgba(225, 205, 107, 1)';
    for(let i = 0; i < descripcion.length; i++) {
        if(i%2 === 0)
            backgroundColors.push(colorOne);
        else
            backgroundColors.push(colorTwo);
    }

    // Graph productos mas vendidos
    const chartTwo = new Chart(productosMasVendidosChart, {
        type: 'bar',
        data: {
            labels: descripcion,
            datasets: [{
                label: 'Productos',
                data: counts,
                backgroundColor: backgroundColors,
            }]
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
                text: 'Productos Mas Vendidos'
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