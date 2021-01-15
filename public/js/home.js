const sectionItemTabs = document.getElementsByClassName('nav-section-tab');
const comprasYVentasChart = document.getElementById('comprasYVentasChart');
const productosMasVendidosChart = document.getElementById('productosMasVendidosChart');
const Chart = require('chart.js');


// helper functions
const getWeekStartAndEnd = () => {
    let today = new Date();
    today.toLocaleString('es-gt');
    let first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    let last = first + 6; // last day is the first day + 6
    let firstday = new Date(today.setDate(first));
    let lastday = new Date(today.setDate(last));
    firstday.toLocaleString('es-gt');
    lastday.toLocaleString('es-gt');

    firstday = firstday.getFullYear() + '-' + String(firstday.getMonth() + 1).padStart(2, '0') + '-' + String(firstday.getDate()).padStart(2, '0');
    lastday = lastday.getFullYear() + '-' + String(lastday.getMonth() + 1).padStart(2, '0') + '-' + String(lastday.getDate()).padStart(2, '0');

    return [firstday,lastday];
};

const getTotalVentas = async() => {
    const [firstday, lastday] = getWeekStartAndEnd();

    const ventas = await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${firstday}/${lastday}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())

    let ventasPorDia = {
        0: [], //sunday
        1: [], //monday
        2: [], //tuesday
        3: [], //wednesday
        4: [], //thursday
        5: [], //friday
        6: []  //saturday
    };
    ventas.forEach(venta => {
        let day = new Date(venta.fecha_de_venta);
        let timeStart = new Date(venta.fecha_de_venta);
        let timeEnd = new Date(venta.fecha_de_venta);
        day.toLocaleString('es-gt');
        timeStart.toLocaleString('es-gt');
        timeEnd.toLocaleString('es-gt');

        timeStart.setHours(7);
        timeStart.setMinutes(0);
        timeStart.setSeconds(0);

        timeEnd.setDate(timeEnd.getDate()+1);
        timeEnd.setHours(7);
        timeEnd.setMinutes(0);
        timeEnd.setSeconds(0);

        if(day >= timeStart && day <= timeEnd) {
            day = day.getDay();
        } else if(day > timeEnd) {
            day.setDate(day.getDate()+1);
            day = day.getDay();
        } else if(day < timeStart) {
            day.setDate(day.getDate()-1);
            day = day.getDay();
        }

        ventasPorDia[day].push(venta);
    });

    let totalVentas = [];
    Object.values(ventasPorDia).forEach(dia => {
        let totalVenta = 0;
        dia.forEach(venta => {
            totalVenta += venta.subtotal;
        });
        totalVentas.push(totalVenta);
    });

    return totalVentas;
};

const getTotalCompras = async() => {
    const [firstday, lastday] = getWeekStartAndEnd();

    const compras = await fetch(`http://localhost:5000/dashboard/reportes/compras-por-tiempo/${firstday}/${lastday}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())

    let comprasPorDia = {
        0: [], //sunday
        1: [], //monday
        2: [], //tuesday
        3: [], //wednesday
        4: [], //thursday
        5: [], //friday
        6: []  //saturday
    };
    compras.forEach(compra => {

        let day = new Date(compra.fecha_de_compra);
        let timeStart = new Date(compra.fecha_de_compra);
        let timeEnd = new Date(compra.fecha_de_compra);
        day.toLocaleString('es-gt');
        timeStart.toLocaleString('es-gt');
        timeEnd.toLocaleString('es-gt');

        timeStart.setHours(7);
        timeStart.setMinutes(0);
        timeStart.setSeconds(0);

        timeEnd.setDate(timeEnd.getDate()+1);
        timeEnd.setHours(7);
        timeEnd.setMinutes(0);
        timeEnd.setSeconds(0);

        if(day >= timeStart && day <= timeEnd) {
            day = day.getDay();
        } else if(day > timeEnd) {
            day.setDate(day.getDate()+1);
            day = day.getDay();
        } else if(day < timeStart) {
            day.setDate(day.getDate()-1);
            day = day.getDay();
        }
        comprasPorDia[day].push(compra);
    });

    let totalCompras = [];
    Object.values(comprasPorDia).forEach(dia => {
        let totalCompra = 0;
        dia.forEach(compra => {
            totalCompra += compra.subtotal;
        });
        totalCompras.push(totalCompra);
    });

    return totalCompras;
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

    // Graph productos mas vendidos
    const chartTwo = new Chart(productosMasVendidosChart, {
        type: 'horizontalBar',
        data: {
            labels: descripcion,
            datasets: [{
                label: 'Productos',
                data: counts,
                backgroundColor: [
                    'rgba(53, 105, 134, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(53, 105, 134, 1)',
                    'rgba(225, 205, 107, 1)',
                    'rgba(53, 105, 134, 1)'
                ],
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