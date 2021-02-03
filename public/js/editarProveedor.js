const codigo = document.getElementById('codigo');
const { dialog } = require('electron').remote;
const $ = require('jquery');
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
    jsonResponse = jsonResponse.map(curr => {return { codigo: curr.codigo, nombre: curr.nombre }});
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
            codigo.readOnly = true;
            fetch(`http://localhost:5000/dashboard/mantenimientos/proveedor/${value}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            })
            .then(response => response.json())
            .then(proveedor => {
                document.getElementById('nit').value = proveedor.nit;
                document.getElementById('nombre').value = proveedor.nombre;
                document.getElementById('direccion').value = proveedor.direccion;
                document.getElementById('celular').value = proveedor.celular;
                document.getElementById('saldo').value = proveedor.saldo;
                document.getElementById('marketId').value = proveedor.market_id;
            });
        }
    });
    $select[0].selectize.focus();
    document.getElementsByClassName('selectize-control')[0].addEventListener('keydown', e => {
        if(e.key === 'Tab')
            e.preventDefault();
    });
});

const borrar = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/proveedor/${codigo.value}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(jsonResponse => {
        dialog.showMessageBox({
            message: jsonResponse.message
        });
        window.location.reload();
    }); 
};