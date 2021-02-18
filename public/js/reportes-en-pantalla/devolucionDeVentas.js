const tableVentas = document.getElementById('tableVentas');
const codigo = document.getElementById('codigo');
const labelCantidad = document.getElementById('labelCantidad');
const labelCodigo = document.getElementById('labelCodigo');
const labelVentaNo = document.getElementById('labelVentaNo');
const codigoInput = document.getElementById('codigoInput');
const cantidad = document.getElementById('cantidad');
const ventaNo = document.getElementById('ventaNo');
const devolverBtn = document.getElementById('devolver');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');
const $ = require('jquery');
require('selectize');

const initializeDevolucion = (factura, venta) => {
    codigoInput.value = venta.codigo_de_producto;
    ventaNo.value = venta.venta_no;
    devolverBtn.style.display = 'block';
    devolverBtn.addEventListener('click', () => devolucion(cantidad.value, venta.cantidad, venta.factura_no, factura));
};

const populateVentasTable = factura => {
    tableVentas.innerHTML = '';
    // Generate columns
    const columns = [];
    const sizes = [
        '20%',
        '20%',
        '20%',
        '20%',
        '20%'
    ];
    for(let i = 0; i < sizes.length; i++) {
        const column = document.createElement('div');
        column.classList.add('column');
        column.style.flexBasis = sizes[i];
        columns.push(column);
        tableVentas.append(column);
    }

    // generate column title rows
    titles = [
        'Codigo',
        'Nombre',
        'Precio',
        'Cantidad',
        'Subtotal'
    ];

    for(let i = 0; i < columns.length; i++) {
        const titleRow = document.createElement('div');
        titleRow.classList.add('row-title');
        titleRow.textContent = titles[i];
        columns[i].append(titleRow);
    }

    // Generate rows for found reports
    factura.forEach(venta => {
        const rows = [
            venta.codigo_de_producto,
            venta.descripcion,
            venta.precio_q,
            venta.cantidad,
            (venta.cantidad*venta.precio_q).toFixed(2)
        ];

        for(let i = 0; i < columns.length; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            row.textContent = rows[i];
            if(i === 0)
                row.addEventListener('click', () => initializeDevolucion(factura, venta));
            columns[i].append(row);
        }
    });

    // show hidden inputs
    labelCodigo.style.visibility = 'visible';
    labelCantidad.style.visibility = 'visible';
    labelVentaNo.style.visibility = 'visible';
};

const initialSearch = () => {
    // Get code options
    fetch(`http://localhost:5000/dashboard/reportes-en-pantalla/facturas`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(jsonResponse => {
        jsonResponse = jsonResponse.map(curr => {return { codigo: curr.factura_no, nombre: curr.fecha }});
        const $select = $('#codigo').selectize({
            valueField: 'codigo',
            labelField: 'nombre',
            searchField: ['nombre', 'codigo'],
            options: jsonResponse,
            closeAfterSelect:true,
            selectOnTab:true,
            openOnFocus:false,

            render: {
                item: function(item, escape) {
                    return '<div>' +
                        // (item.nombre ? '<span class="nombre">' + escape(item.nombre) + '</span>' : '') +
                        (item.codigo ? '<span class="codigo">' + escape(item.codigo) + '</span>' : '') +
                    '</div>';
                },
                option: function(item, escape) {
                    var label = item.nombre || item.codigo;
                    var caption = item.nombre ? item.codigo : null;
                    return '<div>' +
                        '<span class="label"><b>' + escape(label) + '</b></span><br/>' +
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                    '</div>';
                }
            },
            onItemAdd: (value) => {
                codigo.value = value;
                // Autofill
                fetch(`http://localhost:5000/dashboard/reportes-en-pantalla/venta/${value}`, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer'
                })
                .then(response => response.json())
                .then(factura => {
                    populateVentasTable(factura);
                    $('#codigo').selectize()[0].selectize.destroy;
                });
            }
        });
        $select[0].selectize.focus();
        document.getElementsByClassName('selectize-control')[0].addEventListener('keydown', e => {
            if(e.key === 'Tab')
                e.preventDefault();
        });
    });
};

const devolucion = async(cambio, cantidadOriginal, facturaNo, factura) => {
    if(cambio <= cantidadOriginal) {
        let total = 0;
        factura.forEach(item => {
            if(ventaNo.value !== item.venta_no)
                total += parseFloat(item.precio_q,10) * parseFloat(item.cantidad,10);
            else
                total += parseFloat(item.precio_q,10) * (parseFloat(cantidadOriginal,10) - parseFloat(cambio,10));
        });

        console.log(total);

        await fetch('http://localhost:5000/dashboard/reportes-en-pantalla/devolucion', {
        method: 'PUT',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            codigo:codigoInput.value,
            cambio:-cambio,
            ventaNo:ventaNo.value,
            total:total.toFixed(2),
            facturaNo:facturaNo
        })
        })
        .then(response => response.json())
        .then(jsonResponse => {
            dialog.showMessageBox({ title:'Devolución de Ventas: ', message: jsonResponse.message });
            window.location.href = '/dashboard/reportes-en-pantalla/devolucion-de-ventas';
        });
    }
    else {
        dialog.showMessageBox({ type:'error', message:'No se pudo realizar porque la devolución supera la cantidad original.' })
    }
};

// prevent default
labelCantidad.addEventListener('keydown', event => {
    if(event.key === 'Enter')
        event.preventDefault();
});

initialSearch();