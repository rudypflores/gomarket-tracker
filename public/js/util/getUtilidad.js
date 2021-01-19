const pUtilidad = document.getElementById('pUtilidad');
const costoQ = document.getElementById('costoQ');
const precioPublico = document.getElementById('precioPublico');

// Calculate % de utilidad
pUtilidad.readOnly = true;
precioPublico.addEventListener('change', () => {
    if(precioPublico.value !== NaN && costoQ.value !== NaN)
        pUtilidad.value = `${((precioPublico.value-costoQ.value)/costoQ.value).toFixed(2)}`;

    document.getElementById('precioPublico').addEventListener('change', () => {
        document.getElementById('ubicacion').focus();
    });
});