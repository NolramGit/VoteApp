const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Permitir conexiones de cualquier lado por ahora
});

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Aquí vivirá tu HTML

// VARIABLES EN MEMORIA RAM
let codigosValidos = new Set(); // Se llena desde Electron
let yaVotaron = new Set();      // Se limpia por cada pregunta
let preguntaActual = { texto: "Esperando pregunta...", opciones: [] };
let electronSocketId = null;    // Para saber quién es tu laptop

// --- RUTA PARA QUE EL MÓVIL RECIBA LA PREGUNTA ---
app.get('/api/pregunta', (req, res) => {
    res.json(preguntaActual);
});

// --- RUTA PARA RECIBIR EL VOTO (POST) ---
app.post('/api/votar', (req, res) => {
    const { codigo, voto } = req.body;

    // 1. Validar si el código existe
    if (!codigosValidos.has(codigo)) {
        return res.status(401).json({ error: "Código no válido" });
    }

    // 2. Validar si ya votó en esta ronda
    if (yaVotaron.has(codigo)) {
        return res.status(403).json({ error: "Ya has registrado un voto" });
    }

    // 3. Enviar a Electron para validación final y guardado
    if (electronSocketId) {
        io.to(electronSocketId).emit('nuevo-voto', { codigo, voto });
        // NOTA: No respondemos 'OK' todavía. 
        // Esperaremos a que Electron nos confirme por el socket.
        // Pero para el POST, responderemos un "Recibido"
        res.status(202).json({ mensaje: "Voto en proceso de verificación..." });
    } else {
        res.status(503).json({ error: "Sistema de recepción no disponible" });
    }
});

// --- COMUNICACIÓN CON ELECTRON (Socket.io) ---
io.on('connection', (socket) => {
    console.log('Alguien se conectó:', socket.id);

    // Identificar que es tu laptop
    socket.on('identificar-electron', (password) => {
        if(password === "TU_CLAVE_SECRETA") { // Seguridad básica
            electronSocketId = socket.id;
            console.log("Electron vinculado correctamente");
        }
    });

    // Electron nos manda los códigos al iniciar
    socket.on('cargar-codigos', (lista) => {
        codigosValidos = new Set(lista);
        console.log("800 códigos cargados en RAM");
    });

    // Electron confirma que el voto se guardó en el JSON
    socket.on('confirmacion-voto-guardado', (codigo) => {
        yaVotaron.add(codigo);
        io.emit(`confirmado-${codigo}`); // Avisar al móvil específico
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});