const facturaNo = document.getElementById('facturaNo');
const nit = document.getElementById('nit');
const cliente = document.getElementById('cliente');
const fechaDeVenta = document.getElementById('fecha-de-venta');
const direccion = document.getElementById('direccion');
const codigoDeProducto = document.getElementById('codigo-de-producto');
const descripcion = document.getElementById('descripcion');
const precioQ = document.getElementById('precio-q');
const cantidad = document.getElementById('cantidad');
const columns = document.getElementsByClassName('column');
const total = document.getElementById('total');
const agregarProductoButton = document.getElementById('agregar-producto');
let cancelBtn = document.getElementById('cancelar');
let salirBtn = document.getElementById('salirBtn');
const { dialog } = require('electron').remote;
const { PosPrinter } = require('electron').remote.require('electron-pos-printer');
const webContents = require('electron').remote.getCurrentWebContents();
const moment = require('moment');
require('moment-timezone');
const onScan = require('onscan.js');

// // add barcode scanner events
onScan.attachTo(cantidad);
cantidad.addEventListener('scan', (event) => {
    event.preventDefault();
});

// Get default printer name
const printers = webContents.getPrinters();
const defaultPrinter = printers.filter(printer => printer.isDefault)[0];

// Globals
let rowIndex = 0;
let ventaNos = [];
let tableRows = [];
let productos = [];

// Loading animation and indicator
const playLoading = element => {
    element.innerHTML = '';
    const loadingAnim = document.createElement('img');
    loadingAnim.src = '/img/loading.svg';
    loadingAnim.id = 'loading';
    element.append(loadingAnim);
}

const stopLoading = (element, txt) => {
    element.removeChild(element.firstChild);
    element.textContent = txt;
}

// Get factura_no and display it on load
const getFacturaNo = async () => {
    const facturaData = await fetch(`http://localhost:5000/dashboard/movimientos/factura-venta`, {
        method: 'POST',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(jsonResponse => jsonResponse[0]);

    facturaNo.value = facturaData.factura_no;
}

const printReceipt = async (efectivo, vuelto, tipoDePago, tipoDeImprenta, btnPressed) => {
    const printerOptions = {
        preview: false,
        silent: true,
        width: '270px',
        margin: '0 0 0 0',
        copies: 1,
        printerName: defaultPrinter.name,
        timeOutPerLine: 400,
    };

    const tableData = [];
    let totalData = 0;
    productos.forEach(producto => {
        tableData.push([
            { type:'text', value: producto[3] },
            { type:'text', value: producto[1] },
            { type:'text', value: parseFloat(producto[2],10).toFixed(2) },
            { type:'text', value: parseFloat(producto[4],10).toFixed(2) }
        ]);
        totalData += producto[4];
    });

    const cashierInfo = await fetch('http://localhost:5000/dashboard/mantenimientos/market-current', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json());
    
    const facturaData = [
        {
            type: 'image',                                       
            path: 'public/img/logo-2.svg',
            position: 'center',           
            width: '200px',  
            height: '50px', 
            css: { "margin":"0" }
        },{
            type: 'text',                                
            value: `NIT: 123456789-0`,
            style: `text-align:center;`,
            css: {"font-weight": "300"}
        },
        {
            type: 'text',
            value: `Go West - ${cashierInfo.market_id} 123 ave ejemplo calle 2375, Zona 18, Guatemala`.toUpperCase(),
            css: {"text-align":"center"}
        },
        {
            type: 'text',
            value: 'FACTURA',
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: `Fecha y hora de emisión: ${moment.tz(moment(), 'America/Guatemala').locale('es').format('DD-MMMM-YYYY HH:mm:ss').toUpperCase()}`,
            css: {"text-align":"center"}
        },
        {
            type: 'table',
            style: 'border: 1px solid #ddd; margin:5px',
            tableHeader: ['CTD', 'DESCRIPCION', 'PRECIO', 'SUBTOTAL'],
            tableBody: tableData,
            tableHeaderStyle: 'border: 1px solid #000;',
            tableBodyStyle: 'border: 1px solid #ddd;',
        },
        {
            type:'text',
            value: `TOTAL: Q${totalData.toFixed(2)}`,
            css: {"text-align":"center", "margin":"5px"}
        },
        {
            type:'text',
            value: tipoDePago === 'efectivo' ? `EFECTIVO: Q${efectivo}` : 'PAGO CON TARJETA',
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: tipoDePago === 'efectivo' ? `VUELTO: Q${vuelto}` : '',
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: `CAJERO: ${cashierInfo.nombre.toUpperCase()} ${cashierInfo.apellido.toUpperCase()}`,
            css: {"text-align":"center", "margin":"5px"}
        },
        {
            type:'text',
            value: `¡GRACIAS POR SU VISITA!`,
            css: {"text-align":"center", "margin":"5px"}
        },
        {
            type: 'barCode',
            value: facturaNo.value,
            height: 12,    
            width: 1,          
            displayValue: true,         
            fontsize: 12,
            position:'center'
        }
    ];

    const reciboData = [
        {
            type: 'image',                                       
            path: 'public/img/logo-2.svg',
            position: 'center',           
            width: '200px',  
            height: '50px', 
            css: { "margin":"0" }
        },
        {
            type:'text',
            value: `Fecha y hora de emisión: ${moment.tz(moment(), 'America/Guatemala').locale('es').format('DD-MMMM-YYYY HH:mm:ss').toUpperCase()}`,
            css: {"text-align":"center"}
        },
        {
            type: 'text',
            value: 'RECIBO',
            css: {"text-align":"center"}
        },
        {
            type: 'table',
            style: 'border: 1px solid #ddd',
            tableHeader: ['CTD', 'DESCRIPCION', 'PRECIO', 'SUBTOTAL'],
            tableBody: tableData,
            tableHeaderStyle: 'border: 1px solid #000;',
            tableBodyStyle: 'border: 1px solid #ddd',
        },
        {
            type:'text',
            value: `TOTAL: Q${totalData.toFixed(2)}`,
            css: {"text-align":"center", "margin":"5px"}
        },
        {
            type:'text',
            value: tipoDePago === 'efectivo' ? `EFECTIVO: Q${efectivo}` : 'PAGO CON TARJETA',
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: tipoDePago === 'efectivo' ? `VUELTO: Q${vuelto}` : '',
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: `CAJERO: ${cashierInfo.nombre.toUpperCase()} ${cashierInfo.apellido.toUpperCase()}`,
            css: {"text-align":"center", "margin":"5px"}
        },
        {
            type:'text',
            value: `¡GRACIAS POR SU COMPRA!`,
            css: {"text-align":"center", "margin":"5px"}
        },
        {
            type: 'barCode',
            value: facturaNo.value,
            height: 12,    
            width: 1,          
            displayValue: true,         
            fontsize: 12,
            position:'center'
        }
    ];


    const printerData = tipoDeImprenta === 'factura' ? facturaData : reciboData;
    const btnPressedText = btnPressed.textContent;
    playLoading(btnPressed);

    PosPrinter.print(printerData, printerOptions)
    .then(() => {
        stopLoading(btnPressed, btnPressedText);
        dialog.showMessageBox({ title: `Impresión de ${tipoDeImprenta}`, message: `${tipoDeImprenta} imprimido exitosamente.` });
    })
    .catch(err => {
        console.error(err);
        stopLoading(btnPressed, btnPressedText);
        dialog.showMessageBox({ type:'error', title:`Impresión de ${tipoDeImprenta}`, message:'No se ha podido imprimir.' });
    });
};

// prefill to todays date
let today = moment.tz(moment(), 'America/Guatemala');
fechaDeVenta.value = today.format('YYYY-MM-DD');

const submitForm = event => {
    if(event.key === 'Enter') {
        event.preventDefault();
        agregarProducto();
    }
};

// autofill parameters on tab press
direccion.addEventListener('keydown', event => {
    if(event.key === 'Tab' || event.key === 'Enter' && event.target.value === "")
        event.target.value = 'Ciudad';
});
nit.addEventListener('keydown', event => {
    if(event.key === 'Tab' || event.key === 'Enter' && event.target.value === "")
        event.target.value = 'CF';
});
cliente.addEventListener('keydown', event => {
    if(event.key === 'Tab' || event.key === 'Enter' && event.target.value === "")
        event.target.value = 'CF';
});
cantidad.addEventListener('keydown', submitForm);

// replace tabular browsing for enter browsing
document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.nodeName === 'INPUT') {
        let form = event.target.form;
        let index = Array.prototype.indexOf.call(form, event.target);

        if(form.elements[index].id !== 'codigo-de-producto-selectized') {
            if(form.elements[index+1].id === 'codigo-de-producto') {
                $('#codigo-de-producto').selectize()[0].selectize.focus();
            }
            else {
                form.elements[index + 1].focus();
            }
        }
        event.preventDefault();
    }
});

// reset form and return focus to starting point
const clearForm = () => {
    codigoDeProducto.value = '';
    descripcion.value = '';
    precioQ.value = '';
    cantidad.value = '';
    $('#codigo-de-producto').selectize()[0].selectize.clear();
    $('#codigo-de-producto').selectize()[0].selectize.focus();
};

const cancelFactura = async () => {
    await fetch(`http://localhost:5000/dashboard/movimientos/factura-venta/${facturaNo.value}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    });
};

const updateTipoDePago = async () => {
    await fetch(`http://localhost:5000/dashboard/movimientos/ventas-data`, {
        method: 'PUT',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            facturaNo: facturaNo.value,
            tipoDePago: document.querySelector('input[name="tipoDePago"]:checked').value
        })
    })
    .then(response => response.json());
};

// Update inventario of a product
const updateInventario = async(id, amountChange) => {
    // get existencia actual of product
    const ea = await fetch(`http://localhost:5000/dashboard/mantenimientos/inventario/${id}`, {
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
    .catch(err => {
        dialog.showMessageBox({ type:'error' , message: 'Este producto no tiene un inventario asignado, por favor crearlo en la sección de inventarios antes de continuar.' });
        return;
    });

    // process failed so return to continue
    if(ea === undefined)
        return false;

    // update inventario count
    await fetch('http://localhost:5000/dashboard/mantenimientos/inventario', {
        method: 'PUT',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            codigo: id,
            descripcion: descripcion.value,
            cantidad: amountChange,
            existenciaActual: ea.existencia_actual
        })
    });
    return true;
}

// Add a venta to database
const addVenta = async () => {
    const success = await updateInventario(codigoDeProducto.value, -cantidad.value);
    if(!success) return;
    return await fetch('http://localhost:5000/dashboard/movimientos/ventas-data', {
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
            nit: nit.value,
            cliente: cliente.value,
            fechaDeVenta: fechaDeVenta.valueAsDate,
            direccion: direccion.value,
            codigoDeProducto: codigoDeProducto.value,
            descripcion: descripcion.value,
            precioQ: precioQ.value,
            cantidad: cantidad.value,
            tipoDePago: document.querySelector('input[name="tipoDePago"]:checked').value,
            facturaNo: facturaNo.value
        })
    })
    .then(response => response.json())
    .then(jsonResponse => jsonResponse[0].venta_no);
};

// Remove all ventas upon cancellation
const cancelVenta = async () => {
    if(productos.length === 0)
        window.location.href = '/dashboard/movimientos/ventas'

    playLoading(cancelBtn);
    cancelBtn = cancelBtn.cloneNode(true);

    await cancelFactura();

    for (let i = 0; i < productos.length; i++) {
        await updateInventario(productos[i][0], productos[i][3]);
    }
    ventaNos.forEach(async(id) => {
        await fetch(`http://localhost:5000/dashboard/movimientos/ventas-data/${id}` , {
            method: 'DELETE',
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
        .then(jsonResponse => {
            if(id === ventaNos[ventaNos.length-1]) {
                dialog.showMessageBox({title:'Cancelación de venta', message:'venta cancelada exitosamente!'});
                stopLoading(cancelBtn, 'Cancelar');
                window.location.href = '/dashboard/movimientos/ventas';
            }
        });
    });
}

// Remove a venta from database & UI
const removeVenta = async(event, ventaNo, codigo, cambio) => {
    await updateInventario(codigo, cambio);
    fetch(`http://localhost:5000/dashboard/movimientos/ventas-data/${ventaNo}`, {
        method: 'DELETE',
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
    .then(jsonResponse => {
        tableRows.forEach(row => {
            if(row[row.length-1].firstChild.id === event.target.id) {
                total.innerHTML = `${parseFloat(total.innerHTML,10).toFixed(2) - parseFloat(row[row.length-2].innerHTML,10).toFixed(2)}`;
                row.forEach(cell => cell.remove());
            }
        });

        // remove item from tracker variables as well
        tableRows = tableRows.filter(row => row[row.length-1].firstChild.id !== event.target.id);
        productos = productos.filter(row => row[row.length-1].id !== event.target.id);
    });
};

// submit forms and add to table UI
const agregarProducto = async () => {
    if(codigoDeProducto.value !== "" && descripcion.value !== "" && precioQ.value !== NaN && cantidad.value !== NaN) {
        // disable form submission on button spam
        playLoading(agregarProductoButton);
        agregarProductoButton.style.pointerEvents = 'none';
        cantidad.removeEventListener('keydown', submitForm);
        $('#codigo-de-producto').selectize()[0].selectize.disable();

        const producto = [
            codigoDeProducto.value,
            descripcion.value,
            precioQ.value,
            cantidad.value,
            parseFloat(precioQ.value, 10).toFixed(2) * parseFloat(cantidad.value, 10).toFixed(2),
            document.createElement('img')
        ];

        // Handle error where inventario is not made for producto
        const ventaNo = await addVenta();
        if(ventaNo === undefined) {
            // bring back events after process has been made
            cantidad.addEventListener('keydown', submitForm);
            $('#codigo-de-producto').selectize()[0].selectize.enable();
            stopLoading(agregarProductoButton, 'Agregar');
            agregarProductoButton.style.pointerEvents = 'auto';
            clearForm();
            return;
        }

        const tableRow = [];
        let index = 0;

        for(column of columns) {
            const item = document.createElement('div');
            item.classList.add('row');
            if(column.id === 'delete') {
                producto[index].src = '../../img/delete.svg';
                producto[index].style.cursor = 'pointer';
                producto[index].classList.add('trash');
                producto[index].id = rowIndex;
                item.addEventListener('click', event => removeVenta(event, ventaNo, producto[0], producto[3]));
                item.append(producto[index]);
            }
            else if(column.id === 'subtotal') {
                item.innerHTML = producto[index].toFixed(2);
                total.innerHTML = `${(parseFloat(total.innerHTML,10) + producto[index]).toFixed(2)}`;
            } else {
                item.innerHTML = producto[index];
            }
            index++;
            tableRow.push(item);
            column.append(item);
        }
        tableRows.push(tableRow);
        ventaNos.push(ventaNo);
        productos.push(producto);
        rowIndex++;

        // delete object and recreate with any producto changes
        let selectize = $('#codigo-de-producto').selectize()[0].selectize;
        selectize.destroy();
        await selectizing();

        // bring back events after process has been made
        cantidad.addEventListener('keydown', submitForm);
        $('#codigo-de-producto').selectize()[0].selectize.enable();
        stopLoading(agregarProductoButton, 'Agregar');
        agregarProductoButton.style.pointerEvents = 'auto';
        clearForm();
    } else {
        dialog.showErrorBox('Error','Porfavor llenar todas las casillas del formulario.');
    }
};

const processPayment = async () => {
    const updateFactura = await fetch('http://localhost:5000/dashboard/movimientos/factura-venta', {
        method: 'PUT',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            total: parseFloat(document.getElementById('total').innerHTML,10).toFixed(2),
            facturaNo: facturaNo.value
        })
    });

    const pago = document.getElementById('pago');

    const vuelto = document.createElement('h2');
    const amount = Math.abs(parseFloat(document.getElementById('total').innerHTML,10).toFixed(2) - pago.value);
    vuelto.innerHTML = `Vuelto: Q${amount.toFixed(2)}`;

    const returnBtn = document.createElement('button');
    returnBtn.innerHTML = 'Salir';

    const printFactura = document.createElement('button');
    printFactura.innerHTML = 'Imprimir Factura';
    printFactura.addEventListener('click', () => printReceipt(parseFloat(pago.value,10).toFixed(2), amount.toFixed(2), 'efectivo', 'factura', printFactura));

    const printRecibo = document.createElement('button');
    printRecibo.innerHTML = 'Imprimir Recibo';
    printRecibo.addEventListener('click', () => printReceipt(parseFloat(pago.value,10).toFixed(2), amount.toFixed(2), 'efectivo', 'recibo', printRecibo));

    const reroute = document.createElement('a');
    reroute.href = '/dashboard/movimientos/ventas';
    reroute.append(returnBtn);

    document.body.innerHTML = '';
    document.body.append(vuelto);
    document.body.append(reroute);
    document.body.append(printFactura);
    document.body.append(printRecibo);
};

const pagar = async () => {
    // Handle credit card payment process
    if(tableRows.length > 0 && document.querySelector('input[name="tipoDePago"]:checked').value === 'tarjeta'){
        await updateTipoDePago();
        let t = parseFloat(total.innerHTML,10).toFixed(2);
        const updateFactura = await fetch('http://localhost:5000/dashboard/movimientos/factura-venta', {
            method: 'PUT',
            mode: 'cors', 
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                total: parseFloat(document.getElementById('total').innerHTML,10).toFixed(2),
                facturaNo: facturaNo.value
            })
        });
        const returnBtn = document.createElement('button');
        returnBtn.innerHTML = 'Salir';

        const printFactura = document.createElement('button');
        printFactura.innerHTML = 'Imprimir Factura';
        printFactura.addEventListener('click', () => printReceipt(t, t, 'tarjeta', 'factura', printFactura));

        const printRecibo = document.createElement('button');
        printRecibo.innerHTML = 'Imprimir Recibo';
        printRecibo.addEventListener('click', () => printReceipt(t, t, 'tarjeta', 'recibo', printRecibo));

        const reroute = document.createElement('a');
        reroute.href = '/dashboard/movimientos/ventas';
        reroute.append(returnBtn);

        document.body.innerHTML = '';
        document.body.append(reroute);
        document.body.append(printFactura);
        document.body.append(printRecibo);
    }
    else if(tableRows.length > 0) {
        // clear page and render new information
        await updateTipoDePago();
        let t = parseFloat(total.innerHTML,10).toFixed(2);
        document.body.innerHTML = `
                                    <h2 class="title">Pagos de Ventas</h2>
                                    <label>Total <span id="total"></span></label>
                                    <form>
                                        <label for="pago">
                                            Cantidad:
                                            <input type="number" name="pago" id="pago" step="any" min="0" required autofocus="autofocus" onClick="this.select();" onkeydown="return event.keyCode !== 69 && event.keyCode !== 187 && event.keyCode !== 189" value="0">
                                        </label>
                                        <div class="break"></div>
                                        <button type="button" onclick="processPayment()">Pagar</button>
                                    </form>
                                `;
        document.getElementById('total').innerHTML = `${t}`;
        document.getElementById('pago').focus();
        document.getElementById('pago').select();
        pago.addEventListener('keydown', event => {
            if(event.key === 'Enter')  {
                event.preventDefault();
                processPayment();
            }
        });
    }
    else
        dialog.showErrorBox('Error','Porfavor ingresar al menos un producto antes de pagar.');
}

const salir = async () => {
    playLoading(salirBtn);
    await cancelFactura();
    if(productos.length > 0) {
        await cancelVenta();
    }
    stopLoading(salirBtn, 'Salir');
    window.location.href = '/dashboard';
};

const refrescarProductos = async () => {
    // delete object and recreate with any producto changes
    let selectize = $('#codigo-de-producto').selectize()[0].selectize;
    selectize.destroy();
    await selectizing();
    clearForm();
};

// Key combo for triggering payment submission
document.addEventListener('keydown', e => {
    if(e.altKey === true && e.key === 'b')
        pagar();
});

getFacturaNo();