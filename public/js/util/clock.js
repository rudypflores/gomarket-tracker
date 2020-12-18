// Date & Time are DOM elements to place respective information
const date = document.getElementById('fecha');
const time = document.getElementById('hora');

let today = new Date();
today.toLocaleDateString('es-gt');

const months = {
    01:'Enero',
    02:'Febrero',
    03:'Marzo',
    04:'Abril',
    05:'Mayo',
    06:'Junio',
    07:'Julio',
    08:'Agosto',
    09:'Septiembre',
    10:'Octubre',
    11:'Noviembre',
    12:'Diciembre',
}

const days = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

//get date dd/mm/yyyy
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();

//get time
const formatAMPM = c => {
    let hours = c.getHours();
    let minutes = c.getMinutes();
    let seconds = c.getSeconds() < 10 ? `0${c.getSeconds()}` : c.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = `${hours}:${minutes}:${seconds} ${ampm}`;
    return strTime;
}

// Set html text
date.innerHTML = `${days[today.getDay()]}, ${dd} de ${months[mm]} de ${yyyy}`;
setInterval(() => {
    time.innerHTML = formatAMPM(new Date());
}, 1000);