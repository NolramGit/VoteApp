const express = require('express');
const http = require('http');
const cors = require('cors');
const socketService = require('./serverSocket');
const rutas = require("./routes");


const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
// const io = setupSocket(server);
socketService.init(server);

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// app.use(cors({
//     origin: "*", // Permite cualquier origen, o cambia a tu URL de frontend
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

//Rutas
app.use("/api", rutas);

server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});