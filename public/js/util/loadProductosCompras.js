// const codigos = document.getElementById('codigos');
const codigo = document.getElementById('codigo-de-producto');
const $ = require('jquery');
require('selectize');

// Get code options
const loadOptions = async () => {
    console.log('loading productos...');
    return await fetch('http://localhost:5000/dashboard/mantenimientos/producto', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(jsonResponse => {
        return jsonResponse.map(curr => {return { codigo: curr.codigo, nombre: curr.nombre }});
    });
};

const selectizingProductos = async() => {
    let optionsLoaded = await loadOptions();
    $('#codigo-de-producto').selectize({
        valueField: 'codigo',
        labelField: 'nombre',
        searchField: ['nombre', 'codigo'],
        options: optionsLoaded,
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
        onItemAdd: async (value) => {
            codigo.value = value;
            // Autofill
            await fetch(`http://localhost:5000/dashboard/mantenimientos/producto/${value}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            })
            .then(response => response.json())
            .then(producto => {
                document.getElementById('descripcion').value = producto.nombre;
                document.getElementById('precio-q').value = producto.costo_q;
                document.getElementById('cantidad').value = 1;
                document.getElementById('descripcion').readOnly = true;
                document.getElementById('cantidad').focus();
            });
        }
    });

    document.getElementsByClassName('selectize-control')[0].addEventListener('keydown', e => {
        if(e.key === 'Tab')
            e.preventDefault();
    });
}

selectizingProductos();