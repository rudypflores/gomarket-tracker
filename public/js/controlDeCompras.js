const facturaNo = document.getElementById('facturaNo');
const fechaDeCompra = document.getElementById('fecha-de-compra');
const direccion = document.getElementById('direccion');
const codigoDeProducto = document.getElementById('codigo-de-producto');
const descripcion = document.getElementById('descripcion');
const precioQ = document.getElementById('precio-q');
const cantidad = document.getElementById('cantidad');
const columns = document.getElementsByClassName('column');
const total = document.getElementById('total');
let cancelBtn = document.getElementById('cancelar');
let salirBtn = document.getElementById('salirBtn');
const agregarProductoButton = document.getElementById('agregar-producto');
const { dialog, BrowserWindow } = require('electron').remote;
const { PosPrinter } = require('electron').remote.require('electron-pos-printer');
const moment = require('moment');
require('moment-timezone');

// Globals
let rowIndex = 0;
let compraNos = [];
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
    const facturaData = await fetch(`http://localhost:5000/dashboard/movimientos/factura-compra`, {
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

const printReceipt = async (efectivo, vuelto) => {
    const printerOptions = {
        preview: true,
        silent:true,
        width: '300px',
        margin: '0 0 0 0',
        copies: 1,
        printerName: 'EPSON TM-m30 Receipt5',
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
    
    const printerData = [
        {
            type: 'image',                                       
            path: 'public/img/logo.svg',
            position: 'center',           
            width: '100px',  
            height: '50px', 
            css: { "margin":"0" }
        },{
            type: 'text',                                
            value: `NIT: 123456789-0`,
            style: `text-align:center;`,
            css: {"font-weight": "300", "font-size": "12px"}
        },
        {
            type: 'text',
            value: `Go West - ${cashierInfo.market_id} 123 ave ejemplo calle 2375, Zona 18, Guatemala`.toUpperCase(),
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: `${moment.tz(moment(), 'America/Guatemala').locale('es').format('DD-MMMM-YYYY HH:mm:ss').toUpperCase()}`,
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
            value: `EFECTIVO: Q${efectivo}`,
            css: {"text-align":"center"}
        },
        {
            type:'text',
            value: `VUELTO: Q${vuelto}`,
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
            value: 'GO123456789',
            height: 12,                     // height of barcode, applicable only to bar and QR codes
            width: 1,                       // width of barcode, applicable only to bar and QR codes
            displayValue: true,             // Display value below barcode
            fontsize: 8,
            position:'center'
        }
    ];
    
    PosPrinter.print(printerData, printerOptions)
    .then(() => {})
    .catch(err => {
        console.error(err);
    });
};

// prefill to todays date
let today = moment.tz(moment(), 'America/Guatemala');
fechaDeCompra.value = today.format('YYYY-MM-DD');

const submitForm = event => {
    if(event.key === 'Enter') {
        event.preventDefault();
        agregarProducto();
    }
};

// autofill parameters on tab press
direccion.addEventListener('keydown', event => {
    if(event.key === 'Tab' && event.target.value === "")
        event.target.value = 'Ciudad';
});
nit.addEventListener('keydown', event => {
    if(event.key === 'Tab' && event.target.value === "")
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

// Cancellation of factura and sequence fix
const cancelFactura = async () => {
    await fetch(`http://localhost:5000/dashboard/movimientos/factura-compra/${facturaNo.value}`, {
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
    await fetch(`http://localhost:5000/dashboard/movimientos/compras-data`, {
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

// Add a compra to database
const addCompra = async () => {
    const success = await updateInventario(codigoDeProducto.value, cantidad.value);
    if(!success) return;
    return await fetch('http://localhost:5000/dashboard/movimientos/compras-data', {
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
            proveedor: proveedor.value,
            nit: nit.value,
            fechaDeCompra: fechaDeCompra.valueAsDate,
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
    .then(jsonResponse => jsonResponse[0].compra_no);
};

// Remove all compras upon cancellation
const cancelCompra = async() => {
    if(productos.length === 0)
        window.location.href = '/dashboard/movimientos/compras';

    playLoading(cancelBtn);
    cancelBtn = cancelBtn.cloneNode(true);

    await cancelFactura();
    for(let i = 0; i < productos.length; i++) {
        await updateInventario(productos[i][0], -productos[i][3]);
    }
    compraNos.forEach(async(id) => {
        await fetch(`http://localhost:5000/dashboard/movimientos/compras-data/${id}` , {
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
            if(id === compraNos[compraNos.length-1]) {
                dialog.showMessageBox({title:'Cancelación de compra', message:'compra cancelada exitosamente!'});
                stopLoading(cancelBtn, 'Cancelar');
                window.location.href = '/dashboard/movimientos/compras';
            }
        });
    });
}

// Remove a compra from database & UI
const removeCompra = async(event, compraNo, codigo, cambio) => {
    await updateInventario(codigo, -cambio);
    fetch(`http://localhost:5000/dashboard/movimientos/compras-data/${compraNo}`, {
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
        console.log(jsonResponse.message);
        tableRows.forEach(row => {
            if(row[row.length-1].firstChild.id === event.target.id) {
                total.innerHTML = `${parseFloat(total.innerHTML,10).toFixed(2) - parseFloat(row[row.length-2].innerHTML,10).toFixed(2)}`;
                row.forEach(cell => cell.remove());
            }
        });
        tableRows = tableRows.filter(row => row[row.length-1].firstChild.id !== event.target.id);
        productos = productos.filter(row => row[row.length-1].id !== event.target.id);
    });
};

// submit forms and add to table UI
const agregarProducto = async () => {
    if(codigoDeProducto.value !== "" && descripcion.value !== "" && precioQ.value !== NaN && cantidad.value !== NaN) {
        // disbale form submission on button spam
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

        const compraNo = await addCompra();
        if(compraNo === undefined) {
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
                item.addEventListener('click', event => removeCompra(event, compraNo, producto[0], producto[3]));
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
        compraNos.push(compraNo);
        productos.push(producto);
        rowIndex++;

        // delete object and recreate with any producto changes
        let selectize = $('#codigo-de-producto').selectize()[0].selectize;
        selectize.destroy();
        await selectizingProductos();
        
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

const pagar = async () => {
    if(tableRows.length > 0) {
        // clear page and render new information
        const updateFactura = await fetch('http://localhost:5000/dashboard/movimientos/factura-compra', {
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
        await updateTipoDePago();
        dialog.showMessageBox({ title:'Compras', message:'Factura ingresada exitosamente.' });
        window.location.href = '/dashboard/movimientos/compras';
    }
    else
        dialog.showErrorBox('Error','Porfavor ingresar al menos un producto antes de pagar.');
}


const refrescarProductos = async () => {
    // delete object and recreate with any producto changes
    let selectize = $('#codigo-de-producto').selectize()[0].selectize;
    selectize.destroy();
    await selectizingProductos();
    clearForm();
};

const salir = async() => {
    playLoading(salirBtn);
    await cancelFactura();
    if(productos.length > 0)
        await cancelCompra();
    stopLoading(salirBtn, 'Salir');
    window.location.href = '/dashboard';
};

const editarPrecio = () => {
    document.getElementById('precio-q').addEventListener('keydown', event => {
        if(event.key === 'Backspace') {
            event.preventDefault();
            const newWindow = new BrowserWindow({ 
                width:854, 
                height:480,
                webPreferences: {
                    nodeIntegration: true,
                    plugins: true,
                    enableRemoteModule: true
                },
                icon: './public/img/favicon.ico'
            });
            newWindow.loadURL('http://localhost:5000/dashboard/mantenimientos/editar-producto');
            newWindow.focus();
        }
    });
};

getFacturaNo();
editarPrecio();