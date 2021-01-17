const sectionItemTabs = document.getElementsByClassName('nav-section-tab');
const comprasYVentasChart = document.getElementById('comprasYVentasChart');
const productosMasVendidosChart = document.getElementById('productosMasVendidosChart');
const Chart = require('chart.js');

const getCurrentWeek = () => {
    let curr = new Date;
    let week = [];

    for (let i = 1; i <= 8; i++) {
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

const getTotalVentas = async() => {

    const week = getCurrentWeek();
    let totalVentas = [];

    for(let i = 1; i < week.length; i++) {
        let firstDay = new Date(week[i-1]);
        firstDay.setHours(7);
        firstDay.setMinutes(0);
        firstDay.setSeconds(0);

        let lastDay = new Date(week[i]);
        lastDay.setHours(7);
        lastDay.setMinutes(0);
        lastDay.setSeconds(0);

        const ventas = await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${formatDateTime(firstDay)}/${formatDateTime(lastDay)}`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        })
        .then(response => response.json())

        let totalVenta = 0;
        ventas.forEach(venta => {
            totalVenta += venta.subtotal;
        });

        totalVentas.push(totalVenta);
    }
    return totalVentas;
};

const getTotalCompras = async() => {
    const week = getCurrentWeek();
    let totalCompras = [];

    for(let i = 1; i < week.length; i++) {
        let firstDay = new Date(week[i-1]);
        firstDay.setHours(7);
        firstDay.setMinutes(0);
        firstDay.setSeconds(0);

        let lastDay = new Date(week[i]);
        lastDay.setHours(7);
        lastDay.setMinutes(0);
        lastDay.setSeconds(0);

        const compras = await fetch(`http://localhost:5000/dashboard/reportes/compras-por-tiempo/${formatDateTime(firstDay)}/${formatDateTime(lastDay)}`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        })
        .then(response => response.json())

        let totalCompra = 0;
        compras.forEach(compra => {
            totalCompra += compra.subtotal;
        });

        totalCompras.push(totalCompra);
    }
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