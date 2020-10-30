const proveedores = document.getElementById('proveedores');
const proveedor = document.getElementById('proveedor');

// Get nit options
fetch('http://localhost:5000/dashboard/mantenimientos/proveedor', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(p => {
        const option = document.createElement('option');
        option.value = p.nombre;
        option.innerHTML = p.nit;
        proveedores.appendChild(option);
    });

    // Autofill form after selecting an option from the possible nits
    proveedor.addEventListener('change', () => {
        list = jsonResponse.filter(item => item.nombre === proveedor.value)[0];
        proveedor.readOnly = true;
        nit.readOnly = true;
        fechaDeCompra.readOnly = true;
        direccion.readOnly = true;

        // Autofill
        fetch(`http://localhost:5000/dashboard/mantenimientos/proveedor/${list.codigo}`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        })
        .then(response => response.json())
        .then(p => {
            document.getElementById('nit').value = p.nit;
            document.getElementById('direccion').value = p.direccion;
            codigoDeProducto.focus();
        });
    });
});