const efectivo = document.getElementById('efectivo');
const { dialog } = require('electron').remote;

efectivo.addEventListener('keydown', e => {
    if(e.key === 'Enter') {
        e.preventDefault();
        submitForm();
    }
});

const submitForm = async() => {
    const shiftInProgress = await fetch('http://localhost:5000/dashboard/movimientos/turno-en-proceso', {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }).then(response => response.json());

    if(shiftInProgress.length === 0) {
        await fetch('http://localhost:5000/dashboard/movimientos/apertura-turno', {
            method: 'POST',
            mode: 'cors', 
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                efectivo:efectivo.value
            })
        })
        .then(response => response.json())
        .then(jsonResponse => {
            dialog.showMessageBox({ message: jsonResponse.message });
        });
        window.location.href = '/dashboard';
    } else {
        dialog.showMessageBox({ type:'error', message: 'Turno ya ha sido iniciado, y actualmente esta en progreso.' });
        window.location.href = '/dashboard';
    }
};