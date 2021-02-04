const sectionItemTabs = document.getElementsByClassName('nav-section-tab');
const progressBar = document.getElementById('progressBar');
const progressBarTitle = document.getElementById('progressBarTitle');
const moment = require('moment');
require('moment-timezone');

const loadShortcuts = () => {
    document.body.addEventListener('keydown', e => {
        if(e.key === 'F1')
            window.location.href = '/dashboard/movimientos/ventas';
        else if(e.key === 'F2')
            window.location.href = '/dashboard/movimientos/compras';
    });
};

// Loading animation and indicator
const playLoading = element => {
    element.innerHTML = '';
    const loadingAnim = document.createElement('img');
    loadingAnim.src = '/img/loading.svg';
    loadingAnim.id = 'loading';
    element.append(loadingAnim);
}

const stopLoading = (element, txt) => {
    element.removeChild(element.firstChild);
    element.textContent = txt;
}

const progressBarStatus = async() => {
    playLoading(progressBarTitle);
    const metaAmount = await fetch('http://localhost:5000/dashboard/mantenimientos/meta-hoy', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json());
    const dateNow = moment.tz(moment(), 'America/Guatemala');
    const metaDate = moment.tz(metaAmount.fecha, 'America/Guatemala');
    const shiftStart = moment.tz(metaAmount.fecha, 'America/Guatemala');
    const shiftEnd = moment.tz(metaAmount.fecha, 'America/Guatemala');
    shiftEnd.add(1, 'day');
    shiftStart.set({ hour: 7, minute: 0, second: 0 });
    shiftEnd.set({ hour: 7, minute: 0, second: 0 });

    const ventasTurnoTotal = await fetch(`http://localhost:5000/dashboard/reportes/ventas-por-tiempo/${shiftStart.format('YYYY-MM-DD HH:mm:ss')}/${shiftEnd.format('YYYY-MM-DD HH:mm:ss')}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(ventas => {
        return ventas.map(venta => venta.subtotal).reduce((acc, curr) => acc+curr);
    });

    let progress = Math.floor((ventasTurnoTotal/metaAmount.cantidad_meta)*100);
    stopLoading(progressBarTitle, '% Meta de Hoy:');
    progressBar.style.backgroundColor = '#e1cd6b';
    if(dateNow.isAfter(metaDate, 'day') && dateNow.isAfter(shiftEnd)) {
        progressBar.textContent = 'Meta ha expirado...';
        progressBar.style.width = '100%';
    } else {
        if(progress > 100) {
            progressBar.style.width = `100%`;
            progressBar.textContent = `${progress}%`;
        }
        else {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }
    }
};

// user interaction stuff
const toggleHide = (elements, toggle) => {
    for(let i = 1; i < elements.children.length; i++) {
        if(toggle)
            elements.children[i].classList.add('hide');
        else
            elements.children[i].classList.remove('hide');
    }
}

const expandTab = event => {
    const section = event.currentTarget.children[2];
    if(section.classList.contains('rotateDown')) {
        // Hide tabs for clicked section
        section.classList.remove('rotateDown');
        section.classList.add('rotateUp');
        toggleHide(section.parentNode.parentNode, true);
    }
    else { // Show the tabs for clicked section
        section.classList.add('rotateDown');
        toggleHide(section.parentNode.parentNode, false);
    }
};

for(tabs of sectionItemTabs) {
    toggleHide(tabs, true); // Hide all tabs first on page load
    tabs.children[0].addEventListener('mouseup', event => expandTab(event));
}

loadShortcuts();
progressBarStatus();