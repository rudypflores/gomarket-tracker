const marketId = document.getElementById('marketId');

fetch('http://localhost:5000/dashboard/mantenimientos/market', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
})
.then(response => response.json())
.then(markets => {
    markets.forEach(market => {
        const option = document.createElement('option');
        option.value = market.market_id;
        option.innerHTML = market.market_id;
        marketId.appendChild(option);
    });
});