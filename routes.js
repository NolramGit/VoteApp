// routes.js
const express = require("express");
const router = express.Router();
const serverSocket = require("./serverSocket");

router.get("/", (req, res) => {
    res.json({ mensaje: "API funcionando correctamente 🚀" });
});


router.get("/getVotacion", async (req, res) => {
    try {
        const voteType = await serverSocket.getVotacion();

        return res.json({
            status: "OK",
            data: voteType
        });

    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: error.message
        });
    }
});


router.post("/registro", async (req, res) => {
    try {
        const { codigo } = req.body;

        const yaRegistrado = await serverSocket.validarRegistro(codigo);

        if (yaRegistrado) {
            return res.status(404).json({
                status: "ERROR",
                message: "El codigo ya se ha registrado!"
            });
        }

        const cliente = await serverSocket.getCliente(codigo);

        if (!cliente) {
            return res.status(404).json({
                status: "ERROR",
                message: "Codigo invalido"
            });
        }

        // (opcional) emitir algo si quieres
        serverSocket.registro(codigo);

        return res.json({
            status: "OK",
            data: cliente
        });

    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: error.message
        });
    }
});

router.post('/voto', async (req, res) => {
    try {
        const { codigo, voto } = req.body;

        const yaRegistrado = await serverSocket.validarVoto(codigo);

        if (yaRegistrado) {
            return res.status(404).json({
                status: "ERROR",
                message: "Tu voto ya ha sido registrado para esta votación."
            });
        }

        serverSocket.voto({ codigo: codigo, voto: voto });

        return res.json({
            status: "OK",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: error.message
        });
    }


    // console.log(codigo, " ", voto)
});

// app.post('/api/registro', (req, res) => {
//     const { codigo } = req.body;

//     if (!electronSocketId) {
//         return res.status(503).json({ error: "Sistema no disponible" });
//     }

//     if (!codigosValidos.has(codigo)) {
//         return res.status(401).json({ error: "Código no válido" });
//     };

//     if (yaRegistrados.has(codigo)) {
//         return res.status(403).json({ error: "Ya te has registrado" });
//     }

//     const timeout = setTimeout(() => {
//         return res.status(504).json({ error: "Timeout del socket" });
//     }, 5000);

//     io.to(electronSocketId).emit('nuevo-registro', codigo, (response) => {
//         clearTimeout(timeout);
//         return res.status(200).json(response)
//     });
// })

// // --- RUTA PARA RECIBIR EL VOTO (POST) ---
// app.post('/api/votar', (req, res) => {
//     const { codigo, voto } = req.body;

//     // 1. Validar si el código existe
//     if (!codigosValidos.has(codigo)) {
//         return res.status(401).json({ error: "Código no válido" });
//     }

//     // 2. Validar si ya votó en esta ronda
//     if (yaVotaron.has(codigo)) {
//         return res.status(403).json({ error: "Ya has registrado un voto" });
//     }

//     // 3. Enviar a Electron para validación final y guardado
//     if (electronSocketId) {
//         io.to(electronSocketId).emit('nuevo-voto', { codigo, voto });
//         // NOTA: No respondemos 'OK' todavía. 
//         // Esperaremos a que Electron nos confirme por el socket.
//         // Pero para el POST, responderemos un "Recibido"
//         res.status(202).json({ mensaje: "Voto en proceso de verificación..." });
//     } else {
//         res.status(503).json({ error: "Sistema de recepción no disponible" });
//     }
// });

module.exports = router;