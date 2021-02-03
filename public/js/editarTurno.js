const codigo = document.getElementById('codigo');
const { dialog } = require('electron').remote;
const moment = require('moment');
require('moment-timezone');
const $ = require('jquery');
require('selectize');

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/turno', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse = jsonResponse.map(curr => {return { codigo: curr.no_turno, nombre: `${curr.n_usuario} Fecha: ${moment.tz(curr.fecha_apertura,'America/Guatemala').format('YYYY-MM-DD HH:mm:ss')}` }});
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
            console.log(value);
            codigo.value = value;
            // Autofill
            fetch(`http://localhost:5000/dashboard/mantenimientos/turno/${value}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            })
            .then(response => response.json())
            .then(turno => {
                const fa = moment.tz(turno.fecha_apertura, 'America/Guatemala');
                const fc = moment.tz(turno.fecha_cierre, 'America/Guatemala');

                codigo.readOnly = true;
                document.getElementById('nUsuario').value = turno.n_usuario;
                document.getElementById('efectivoApertura').value = turno.efectivo_apertura;
                document.getElementById('efectivoCierre').value = turno.efectivo_cierre;
                document.getElementById('fechaApertura').value = fa.format('YYYY-MM-DDThh:mm:ss');
                document.getElementById('fechaCierre').value = fc.format('YYYY-MM-DDThh:mm:ss');;
                document.getElementById('marketId').value = turno.market_id;
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
    fetch(`http://localhost:5000/dashboard/mantenimientos/turno/${codigo.value}`, {
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