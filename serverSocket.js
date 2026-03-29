const { Server } = require("socket.io");
const { redisClient, connectRedis } = require("./redis");

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        this.io = new Server(server, {
            cors: { origin: "*" }
        });

        // Middleware de autenticación
        this.io.use((socket, next) => {
            const pass = socket.handshake.auth.pass;

            if (pass === "Marlon*209188") return next();
            return next(new Error("No autorizado!"));
        });

        // Conexión
        this.io.on("connection", (socket) => {
            console.log("Electron conectado:", socket.id);

            socket.on("sync-clientsData", async (data, callback) => {
                try {
                    if (!redisClient.isOpen) await connectRedis();

                    const multi = redisClient.multi();

                    for (const codigo in data) {
                        const infoCliente = data[codigo];
                        multi.set(`cliente:${codigo}`, JSON.stringify(infoCliente));
                    }

                    await multi.exec();

                    callback({
                        status: "OK",
                        message: "Datos sincronizados en Redis."
                    });

                } catch (err) {
                    callback({
                        status: "ERROR",
                        message: "Error sincronizando datos en Redis. " + err.message
                    });
                }
            });

            socket.on("disconnect", () => {
                console.log("Cliente desconectado:", socket.id);
            });

            socket.on('get-registro', async () => {
                let datos = [];
                try {
                    if (!redisClient.isOpen) {
                        await redisClient.connect();
                    }
                    const keys = await redisClient.keys('registro:*');

                    for (const key of keys) {
                        const data = await redisClient.get(key);
                        const { code } = JSON.parse(data)
                        datos.push(code);    
                    }

                    socket.emit('sendRegistro', datos);

                } catch (err) {
                    console.error('Error al conectar o consultar Redis:', err);
                }
            });

            socket.on('set-votacion', async (data) => {
                // await redisClient.set(`voteType:tipo`, JSON.stringify({active:true, type: "standard", options:"1"}));
                await redisClient.set(`voteType:tipo`, JSON.stringify(data));

            });
        });
    };

    async getCliente(codigo) {
        if (!redisClient.isOpen) await connectRedis();

        const data = await redisClient.get(`cliente:${codigo}`);

        if (!data) return null;

        return JSON.parse(data);
    };

    async validarRegistro(codigo) {
        if (!redisClient.isOpen) await connectRedis();
        const data = await redisClient.get(`registro:${codigo}`);
        return data;
    };

    async registro(data) {
        if (!this.io) return;
        try {
            // 2. Asegurar conexión
            if (!redisClient.isOpen) {
                await connectRedis();
            }

            // 3. ¡IMPORTANTE! Agregar 'await' aquí
            // Sin el await, la función termina antes de que Redis confirme el guardado
            await redisClient.set(`registro:${data}`, JSON.stringify({ code: data }));

            // 4. Emitir el evento
            this.io.emit("registro", data);

        } catch (error) {
            console.error("Error en el proceso de registro:", error);
        }
    };

    async validarVoto(codigo) {
        if (!redisClient.isOpen) await connectRedis();
        const data = await redisClient.get(`voto:${codigo}`);
        return data;
    };

    async voto(data) {
        if (!this.io) return;
        if (!redisClient.isOpen) await connectRedis();

        const { codigo, voto } = data;
        redisClient.set(`voto:${codigo}`, JSON.stringify({ code: codigo, voto: voto }));
        this.io.emit("voto", data);
    };

    async getVotacion(){
        if (!this.io) return;
        if (!redisClient.isOpen) await connectRedis();
        // const data = await redisClient.keys('voteType:*');
        const data = await redisClient.get(`voteType:tipo`);

        return data;
    }
}

module.exports = new SocketService();