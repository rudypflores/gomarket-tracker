const codigo = document.getElementById('id');
const codigos = document.getElementById('ids');
const { dialog } = require('electron').remote;

// Get code options
fetch('http://localhost:5000/dashboard/mantenimientos/market', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(jsonResponse => {
    jsonResponse.forEach(market => {
        const option = document.createElement('option');
        option.value = market.id;
        option.innerHTML = market.market_id;
        codigos.appendChild(option);
    });
});

// Autofill form after selecting an option from the possible codes
codigo.addEventListener('change', () => {
    // Autofill
    fetch(`http://localhost:5000/dashboard/mantenimientos/market/${codigo.value}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    })
    .then(response => response.json())
    .then(market => {
        document.getElementById('marketId').value = market.market_id;
        codigo.readOnly = true;
    });
});

const borrar = () => {
    fetch(`http://localhost:5000/dashboard/mantenimientos/market/${codigo.value}`, {
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