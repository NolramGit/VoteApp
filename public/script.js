const alertMessage = document.querySelector(".alert-message");;
const inputs = document.querySelectorAll('.otp-input');
const button = document.querySelector('.verify-btn');

inputs.forEach((input, index) => {
    // Manejar la entrada de texto
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        console.log(inputs)
        // Si hay un valor, pasar al siguiente input
        if (value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    // Manejar el borrado (Backspace)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// Ejemplo de acción del botón
button.addEventListener('click', () => {
    const code = Array.from(inputs).map(input => input.value).join('');
    if (code.length === 6) {
        // console.log("Verificando código:", code);
        enviarDatos(code);
        
        alert("Validando acceso para el código: " + code);
    } else {
        alertMessage.textContent = "* Por favor completa los 6 caracteres."
    }
});


const enviarDatos = async (datosUsuario) => {
  const respuesta = await fetch('https://tu-app-en-railway.railway.app/api/registro', {
    method: 'POST', // El verbo de la acción
    headers: {
      'Content-Type': 'application/json' // Avisamos que enviamos JSON
    },
    body: JSON.stringify({codigo : datosUsuario}) // El "paquete" con la info
  });
  
  const resultado = await respuesta.json();
  console.log("Respuesta del servidor:", resultado);
};