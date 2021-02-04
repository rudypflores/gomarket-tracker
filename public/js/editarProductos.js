const codigo = document.getElementById('codigo');
const costoQ = document.getElementById('costoQ');
const precioPublico = document.getElementById('precioPublico');
const { dialog } = require('electron').remote;
const $ = require('jquery');
require('selectize');

document.getElementById('pUtilidad').readOnly = true;

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/producto', {
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
            
            // Autofill
            fetch(`http://localhost:5000/dashboard/mantenimientos/producto/${value}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            })
            .then(response => response.json())
            .then(producto => {
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('costoQ').value = producto.costo_q;
                document.getElementById('precioPublico').value = producto.precio_publico;
                document.getElementById('pUtilidad').value = parseFloat(producto.p_utilidad,10);
                document.getElementById('ubicacion').value = producto.ubicacion;
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
    fetch(`http://localhost:5000/dashboard/mantenimientos/producto/${codigo.value}`, {
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


precioPublico.addEventListener('change', () => {
    if(precioPublico.value !== NaN && costoQ.value !== NaN)
        pUtilidad.value = `${((precioPublico.value-costoQ.value)/costoQ.value).toFixed(2)}`;
});

costoQ.addEventListener('change', () => {
    if(precioPublico.value !== NaN && costoQ.value !== NaN)
        pUtilidad.value = `${((precioPublico.value-costoQ.value)/costoQ.value).toFixed(2)}`;
})