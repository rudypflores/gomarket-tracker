const proveedor = document.getElementById('proveedor');
if($) {
    const $ = require('jquery');
}
require('selectize');

// Get code options
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
    let data = jsonResponse.map(curr => {return { nit: curr.nit, nombre: curr.nombre }});
    $('#proveedor').selectize({
        valueField: 'nombre',
        labelField: 'nit',
        searchField: ['nombre', 'nit'],
        options: data,
        closeAfterSelect:true,
        render: {
            item: function(item, escape) {
                return '<div>' +
                    (item.nombre ? '<span class="nombre">' + escape(item.nombre) + '</span>' : '') +
                    // (item.nit ? '<span class="codigo">' + escape(item.nit) + '</span>' : '') +
                '</div>';
            },
            option: function(item, escape) {
                var label = item.nombre || item.nit;
                var caption = item.nombre ? item.nit : null;
                return '<div>' +
                    '<span class="label"><b>' + escape(label) + '</b></span><br/>' +
                    (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                '</div>';
            }
        },
        onItemAdd: (value) => {
            proveedor.value = value;
            let list = jsonResponse.filter(item => item.nombre === value)[0];
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
                if($('#codigo-de-producto').selectize())
                    $('#codigo-de-producto').selectize()[0].selectize.focus();
            });
        }
    });
    $('.selectize-input')[0].click();
})