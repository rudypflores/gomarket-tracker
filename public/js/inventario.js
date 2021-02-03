const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo');
const descripcion = document.getElementById('descripcion');
const existenciaActual = document.getElementById('existencia-actual');
if(marketId) {
    const marketId = document.getElementById('marketId');
}
const { dialog } = require('electron').remote;
const $ = require('jquery');
require('selectize');


// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/inventario', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse = jsonResponse.map(curr => {return { codigo: curr.codigo, nombre: curr.descripcion }});
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
            fetch(`http://localhost:5000/dashboard/mantenimientos/inventario/${value}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            })
            .then(response => response.json())
            .then(inventario => {
                descripcion.value = inventario.descripcion;
                existenciaActual.value = inventario.existencia_actual;
                marketId.value = inventario.market_id;

                codigo.readOnly = true;
                descripcion.readOnly = true;
                existenciaActual.readOnly = true;
                document.getElementById('cantidad').focus();
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
    fetch(`http://localhost:5000/dashboard/mantenimientos/inventario/${codigo.value}`, {
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