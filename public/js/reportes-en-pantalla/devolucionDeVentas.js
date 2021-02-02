const devolucionForm = document.getElementById('devolucion-form');
const facturasTable = document.getElementById('facturas-table');
const columnsFacturas = document.getElementsByClassName('facturas');
const columnsVentas = document.getElementsByClassName('ventas');
const labelCantidad = document.getElementById('labelCantidad');
const labelCodigoDeProducto = document.getElementById('labelCodigo');
const labelVentaNumero = document.getElementById('labelVentaNo');
const cantidadP = document.getElementById('cantidad');
const codigoDeProducto = document.getElementById('codigo');
const ventaNumero = document.getElementById('ventaNo');
const devolverBtn = document.getElementById('devolver');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');

// original state
const originalTable = document.createElement('div');
originalTable.innerHTML = document.getElementById('ventas-table').innerHTML;

// globals
let cantidad;
let codigo;
let cambio;
let ventaNo;
let facturaNumero;
let f;

const devolucion = async() => {
    if(cambio <= cantidad) {

        let total = 0;
        f.forEach(item => {
            if(ventaNo !== item.venta_no)
                total += parseFloat(item.precio_q,10) * parseFloat(item.cantidad,10);
            else
                total += parseFloat(item.precio_q,10) * (parseFloat(cantidad,10) - parseFloat(cambio,10));
        });

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
            codigo:codigo,
            cambio:-cambio,
            ventaNo:ventaNo,
            total:total.toFixed(2),
            facturaNo:facturaNumero
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

devolverBtn.addEventListener('click', () => {
    cambio = cantidadP.value;
    devolucion();
});

const populateVentasTable = async (facturaNo) => {
    // reset to default state
    facturaNumero = facturaNo.textContent;
    document.getElementById('ventas-table').innerHTML = originalTable.innerHTML;
    devolucionForm.style.pointerEvents = 'none';
    const data = await fetch(`http://localhost:5000/dashboard/reportes-en-pantalla/venta/${facturaNo.textContent}`, {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());

    f = data;

    for(let i = 0; i < data.length; i++) {
        const current = [
            data[i].codigo_de_producto,
            data[i].descripcion,
            data[i].precio_q,
            data[i].cantidad,
            data[i].precio_q*data[i].cantidad
        ];
        for(let j = 0; j < columnsVentas.length; j++) {            
            const newRow = document.createElement('div');
            newRow.classList.add('row');
            if(j == 0) {
                newRow.classList.add('clickable');
                newRow.addEventListener('click', event => {
                    labelCantidad.style.visibility = 'visible';
                    labelCodigoDeProducto.style.visibility = 'visible';
                    labelVentaNumero.style.visibility = 'visible';

                    codigoDeProducto.value = event.target.textContent;
                    ventaNumero.value = data[i].venta_no;

                    cantidadP.value = 1;
                    labelCantidad.focus();

                    // set globals for use on run devolucion()
                    cantidad = data[i].cantidad;
                    precio = data[i].precio_q;
                    codigo = codigoDeProducto.value;
                    ventaNo = ventaNumero.value;
                });
            }
            newRow.textContent = current[j];
            columnsVentas[j].append(newRow);
        }
    }
    devolucionForm.style.pointerEvents = 'auto';
};

const populateFacturasTable = async () => {
    let shiftStart = moment.tz(moment(), 'America/Guatemala');
    let shiftEnd = moment.tz(moment(), 'America/Guatemala');
    shiftStart.subtract(1, 'days');
    shiftStart.set({ hour: 0, minute: 0, second: 0 });
    shiftEnd.add(1, 'days');
    shiftEnd.set({ hour: 23, minute: 59, second: 59 });

    devolucionForm.style.pointerEvents = 'none';

    const data = await fetch(`http://localhost:5000/dashboard/reportes-en-pantalla/facturas-por-tiempo/${shiftStart.format('YYYY-MM-DD HH:mm:ss')}/${shiftEnd.format('YYYY-MM-DD HH:mm:ss')}`, {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => response.json());

    for(let i = 0; i < data.length; i++) {
        const current = [
            data[i].factura_no,
            moment.tz(data[i].fecha, 'America/Guatemala').format('YYYY-MM-DD HH:mm:ss'),
            data[i].total
        ];
        for(let j = 0; j < columnsFacturas.length; j++) {            
            const newRow = document.createElement('div');
            newRow.classList.add('row');
            if(j == 0) {
                newRow.classList.add('clickable');
                newRow.addEventListener('click', event => {
                    populateVentasTable(event.target);
                });
            }
            newRow.textContent = current[j];
            columnsFacturas[j].append(newRow);
        }
    }
    devolucionForm.style.pointerEvents = 'auto';
}

// prevent default
labelCantidad.addEventListener('keydown', event => {
    if(event.key === 'Enter')
        event.preventDefault();
});

populateFacturasTable();