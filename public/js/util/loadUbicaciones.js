const ubicacion = document.getElementById('ubicacion');
const $ = require('jquery');
require('selectize');

fetch('http://localhost:5000/dashboard/mantenimientos/ubicacion', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    let data = jsonResponse.map(curr => {return { nit: curr.codigo, nombre: curr.ubicacion }});
    $('#ubicacion').selectize({
        valueField: 'nombre',
        labelField: 'nit',
        searchField: ['nombre', 'nit'],
        options: data,
        closeAfterSelect:true,
        selectOnTab:true,
        openOnFocus:false,
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
            ubicacion.value = value;
            
        }
    });
    $('.selectize-input')[0].click();
});