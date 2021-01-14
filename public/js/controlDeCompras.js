const fechaDeCompra = document.getElementById('fecha-de-compra');
const direccion = document.getElementById('direccion');
const codigoDeProducto = document.getElementById('codigo-de-producto');
const descripcion = document.getElementById('descripcion');
const precioQ = document.getElementById('precio-q');
const cantidad = document.getElementById('cantidad');
const columns = document.getElementsByClassName('column');
const total = document.getElementById('total');
const { dialog } = require('electron').remote;

// Globals
let rowIndex = 0;
let compraNos = [];
let tableRows = [];
let productos = [];

// prefill to todays date
let today = new Date();
today.toLocaleDateString('es-gt');
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();
if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;
fechaDeCompra.value = year + "-" + month + "-" + day;

// autofill parameters on tab press
direccion.addEventListener('keydown', event => {
    if(event.key === 'Tab' && event.target.value === "")
        event.target.value = 'Ciudad';
});
nit.addEventListener('keydown', event => {
    if(event.key === 'Tab' && event.target.value === "")
        event.target.value = 'CF';
});

// reset form and return focus to starting point
const clearForm = () => {
    codigoDeProducto.value = '';
    descripcion.value = '';
    precioQ.value = '';
    cantidad.value = '';
    codigoDeProducto.focus();
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
    .catch(err => console.warn('Inventario no existe para este producto.'));

    // update inventario count
    fetch('http://localhost:5000/dashboard/mantenimientos/inventario', {
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
}

// Add a compra to database
const addCompra = async () => {
    await updateInventario(codigoDeProducto.value, -cantidad.value);
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
            tipoDePago: document.querySelector('input[name="tipoDePago"]:checked').value
        })
    })
    .then(response => response.json())
    .then(jsonResponse => jsonResponse[0].compra_no);
};

// Remove all compras upon cancellation
const cancelCompra = async() => {
    for(let i = 0; i < productos.length; i++) {
        await updateInventario(productos[i][0], productos[i][3]);
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
            console.log(jsonResponse.message);
            window.location.href = '/dashboard/movimientos/compras';
        });
    });
}

// Remove a compra from database & UI
const removeCompra = async(event, compraNo, codigo, cambio) => {
    await updateInventario(codigo, cambio);
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
    });
};

// submit forms and add to table UI
const agregarProducto = async () => {
    if(codigoDeProducto.value !== "" && descripcion.value !== "" && precioQ.value !== NaN && cantidad.value !== NaN) {
        const producto = [
            codigoDeProducto.value,
            descripcion.value,
            precioQ.value,
            cantidad.value,
            parseFloat(precioQ.value, 10).toFixed(2) * parseFloat(cantidad.value, 10).toFixed(2),
            document.createElement('img')
        ];

        const compraNo = await addCompra();
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
                item.innerHTML = producto[index];
                total.innerHTML = `${parseFloat(total.innerHTML,10) + producto[index]}`;
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
        clearForm();
    } else {
        dialog.showErrorBox('Error','Porfavor llenar todas las casillas del formulario.');
    }
};
cantidad.addEventListener('keydown', event => {
    if(event.key === 'Enter') {
        event.preventDefault();
        agregarProducto();
    }
});

const pagar = () => {
    if(tableRows.length > 0) 
        window.location.href = `/pagos?total=${parseFloat(total.innerHTML,10).toFixed(2)}&type=compra`;
    else
        dialog.showErrorBox('Error','Porfavor ingresar al menos un producto antes de pagar.');
}

const salir = async() => {
    await cancelCompra();
    window.location.href = '/dashboard';
};