const pago = document.getElementById('pago');

const pagar = () => {
    const logo = document.createElement('img');
    logo.src = 'img/logo.svg';
    logo.classList.add('logo');

    const vuelto = document.createElement('h2');
    const amount = Math.abs(parseFloat(document.getElementById('total').innerHTML,10).toFixed(2) - pago.value);
    vuelto.innerHTML = `Vuelto: ${amount} Q`;

    const returnBtn = document.createElement('button');
    returnBtn.innerHTML = 'Salir';
    const reroute = document.createElement('a');
    reroute.href = '/dashboard';

    reroute.append(returnBtn);

    document.body.innerHTML = '';
    document.body.append(logo);
    document.body.append(vuelto);
    document.body.append(reroute);
};

pago.addEventListener('keydown', event => {
    if(event.key === 'Enter')  {
        event.preventDefault();
        pagar();
    }
});