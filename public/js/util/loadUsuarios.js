const nUsuario = document.getElementById('nUsuario');
const $ = require('jquery');
require('selectize');

fetch('http://localhost:5000/usuario', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse = jsonResponse.map(curr => {return { codigo: curr.n_usuario, nombre: curr.uid }});
    const $select = $('#nUsuario').selectize({
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
                var caption = item.nombre || item.codigo;
                var label = item.nombre ? item.codigo : null;
                return '<div>' +
                    '<span class="label"><b>' + escape(label) + '</b></span><br/>' +
                    (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                '</div>';
            }
        },
        onItemAdd: (value) => {
            console.log(value);
            nUsuario.value = value;
            document.getElementById('efectivoApertura').focus();
        }
    });
    $select[0].selectize.focus();
    document.getElementsByClassName('selectize-control')[0].addEventListener('keydown', e => {
        if(e.key === 'Tab')
            e.preventDefault();
    });
});