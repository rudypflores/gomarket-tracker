const fechaDeCompra = document.getElementById('fecha-de-compra');
const direccion = document.getElementById('direccion');
const codigoDeProducto = document.getElementById('codigo-de-producto');
const descripcion = document.getElementById('descripcion');
const precioQ = document.getElementById('precio-q');
const cantidad = document.getElementById('cantidad');
const columns = document.getElementsByClassName('column');
const total = document.getElementById('total');

// Globals
let rowIndex = 0;
let compraNos = [];
let tableRows = [];

// Set input date to today's date
const today = new Date();
today.setHours(-1);
fechaDeCompra.valueAsDate = today;

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

// Add a compra to database
const addCompra = async () => {
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
const cancelCompra = () => {
    compraNos.forEach(id => {
        fetch(`http://localhost:5000/dashboard/movimientos/compras-data/${id}` , {
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
const removeCompra = (event, compraNo) => {
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
                producto[index].src = 'img/delete.svg';
                producto[index].style.cursor = 'pointer';
                producto[index].classList.add('trash');
                producto[index].id = rowIndex;
                item.addEventListener('click', event => removeCompra(event, compraNo));
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
        rowIndex++;
        clearForm();
    } else {
        alert('Error: Porfavor llenar todas las casillas del formulario.');
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
        window.location.href = `/pagos?total=${total.innerHTML}`;
    else
        alert('Error: Porfavor ingresar al menos un producto antes de pagar.');
}