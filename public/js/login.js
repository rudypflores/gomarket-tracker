const form = document.getElementById('login-form');
const correo = document.getElementById('correo');
const pass = document.getElementById('pass');


form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = JSON.stringify({
        "correo":correo.value,
        "pass":pass.value
    });

    fetch('http://localhost:5000/login', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:data
    })
    .then(response => response.json())
    .then(jsonResponse => {
        alert(jsonResponse.value);
        window.location.replace('./login.html');
    })
})