//! REVISAR EL ESTADO DE ELECTRON PARA HABILITAR VOTON DE ENVIO DE CODIGO
//! REVISAR EL CAMBIO DE NOMBRE DEL CONJUNTO.

document.addEventListener('DOMContentLoaded', () => {
    const registroGuardado = localStorage.getItem('usuario_asamblea');

    if (registroGuardado) {
        const { usuario, fechaRegistro } = JSON.parse(registroGuardado);
        const hoy = new Date().toLocaleDateString('en-CA');

        if (fechaRegistro !== hoy) {
            // Es un día diferente: Borramos y no mostramos nada
            localStorage.removeItem('usuario_asamblea');
        } else {
            // Es el mismo día: Restauramos la sesión
            mostrarInfoUsuario(usuario);
        }
    }
});

// const btnBorrar = document.querySelector("#borrar");//!BORRRAR
const alertMessage = document.querySelector(".alert-message");
const inputs = document.querySelectorAll('.otp-input');
const button = document.querySelector('.verify-btn');
const to_vote = document.querySelector('#to-vote');
const sendVote = document.querySelector('#submit-vote-btn');
const btnBack = document.querySelector('#back');

btnBack.addEventListener("click", () => {
    document.getElementById('section-success').classList.add('hidden');
    const infoSec = document.getElementById('section-info');
    infoSec.classList.remove('hidden');
    infoSec.classList.add('fade-in');
});

sendVote.addEventListener("click", () => {
    enviarVoto();
});

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;

        if (value && index < inputs.length - 1) {
            inputs[index + 1].focus();
            e.target.value = e.data;
        }
    });

    input.addEventListener('keydown', (e) => {
        alertMessage.textContent = "";
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

async function getVotacion() {
    try {
        const response = await fetch('http://192.168.10.22:3000/api/getVotacion'); 
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos:', JSON.parse(data.data));

        irAVotacion(JSON.parse(data.data));
    } catch (error) {
        console.error('Ocurrió un error:', error);
    }
}

to_vote.addEventListener('click', async () => {
    getVotacion();
})

button.addEventListener('click', () => {
    const code = Array.from(inputs).map(input => input.value).join('');
    if (code.length === 6) {
        enviarDatos(code.toUpperCase());
    } else {
        alertMessage.textContent = "* Por favor completa los 6 caracteres."
    }
});

function mostrarInfoUsuario(data) {
    const loginSec = document.getElementById('section-login');
    const infoSec = document.getElementById('section-info');
    document.getElementById('user-name').textContent = data.nombre
    document.getElementById('user-apto').textContent = data.apto;
    document.getElementById('user-coef').textContent = data.coeficiente;

    // Generar iniciales automáticamente
    const iniciales = data.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
    document.getElementById('user-initials').textContent = iniciales;

    // 2. Transición visual
    loginSec.classList.add('hidden'); // Oculta login
    infoSec.classList.remove('hidden'); // Muestra info
    infoSec.classList.add('fade-in'); // Aplica animación
}

const enviarDatos = async (code) => {
    //   const respuesta = await fetch('https://tu-app-en-railway.railway.app/api/registro', {
    const respuesta = await fetch('http://192.168.10.22:3000/api/registro', { //!CAMBIAR A URL DE RAILWAY
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo: code })
    });

    const resultado = await respuesta.json();

    if (resultado.status === "ERROR") {
        alertMessage.textContent = resultado.message
        inputs.forEach((input) => {
            input.value = "";
        })
    }

    if (resultado.status === "OK") {
        const infoParaGuardar = {
            codigo: code,
            usuario: resultado.data,
            fechaRegistro: new Date().toLocaleDateString('en-CA') // Formato YYYY-MM-DD
        };

        localStorage.setItem('usuario_asamblea', JSON.stringify(infoParaGuardar));
        mostrarInfoUsuario(resultado.data);
    }

    console.log("Respuesta del servidor:", resultado);
};


// Función para pasar de la Info a la Votación
function irAVotacion(data) {
    document.getElementById('section-info').classList.add('hidden');
    const voteSec = document.getElementById('section-vote');
    voteSec.classList.remove('hidden');
    voteSec.classList.add('fade-in');
    renderizarOpcionesVotacion(data.options);
}

// Función para procesar el voto
async function enviarVoto() {
    const seleccion = document.querySelector('input[name="vote"]:checked');

    if (!seleccion) {
        document.querySelector('.alert-message').textContent = "Por favor, elige una opción.";
        return;
    };

    const datosGuardados = localStorage.getItem('usuario_asamblea');
    const { codigo } = JSON.parse(datosGuardados);

    const respuesta = await fetch('http://localhost:3000/api/voto', { //!CAMBIAR A URL DE RAILWAY
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo: codigo, voto: seleccion.value })
    });

    const resultado = await respuesta.json();

    if (resultado.status === "ERROR") {
        alertMessage.textContent = resultado.message
        setTimeout(() => {
            alertMessage.textContent = "";
            document.getElementById('section-vote').classList.add('hidden');
            const infoSec = document.getElementById('section-info');
            infoSec.classList.remove('hidden');
            infoSec.classList.add('fade-in');
        }, 2000);
    }

    if (resultado.status === "OK") {
        document.getElementById('section-vote').classList.add('hidden');
        const successSec = document.getElementById('section-success');
        successSec.classList.remove('hidden');
        successSec.classList.add('fade-in');
    }

    // const respuesta = await fetch('http://192.168.10.29:3000/api/voto', { //!CAMBIAR A URL DE RAILWAY

    // setTimeout(() => {
    //     alert("¡Voto registrado con éxito!");
    //     // Aquí podrías mostrar un mensaje de "Gracias por votar"
    // }, 1500);
}


function renderizarOpcionesVotacion(opciones) {
    const container = document.getElementById('vote-options-container');
    container.innerHTML = ''; // Limpiamos opciones anteriores

    opciones.forEach(opcion => {
        const label = document.createElement('label');
        label.className = 'vote-option';

        // Usamos el valor en mayúsculas para el "value" y normalizado para el texto
        label.innerHTML = `
            <input type="radio" name="vote" value="${opcion}" class="radio-input">
            <div class="option-content">
                <span class="radio-visual"></span>
                <span class="option-text">${opcion === 'EN BLANCO' ? 'EN BLANCO' : opcion}</span>
            </div>
        `;
        container.appendChild(label);
    });
}
