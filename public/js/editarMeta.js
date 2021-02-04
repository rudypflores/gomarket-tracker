const codigo = document.getElementById('codigo');
const { dialog } = require('electron').remote;
const $ = require('jquery');
require('selectize');

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/meta', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse = jsonResponse.map(curr => {return { codigo: curr.meta_id, nombre: `Meta: Q${curr.cantidad_meta}` }});
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
            fetch(`http://localhost:5000/dashboard/mantenimientos/meta/${value}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            })
            .then(response => response.json())
            .then(meta => {
                document.getElementById('cantidadMeta').value = meta.cantidad_meta;
                document.getElementById('cantidadMeta').focus();
                document.getElementById('cantidadMeta').select();
                codigo.readOnly = true;
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
    fetch(`http://localhost:5000/dashboard/mantenimientos/meta/${codigo.value}`, {
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