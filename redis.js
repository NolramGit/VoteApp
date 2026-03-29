const { createClient } = require('redis');

const url = 'redis://default:roYFOjOFpohrNImlXBhbcSZSWLAgJbZB@redis.railway.internal:6379' || "";

const redisClient = createClient({
    url: url
});

// redisClient.on('error', (err) => console.error('❌ Error en el Cliente de Redis:', err));
// redisClient.on('connect', () => console.log('✅ Conectando a Redis...'));
// redisClient.on('ready', () => console.log('🚀 Redis está listo para usar en Railway'));


const connectRedis = async () => {
    if (!redisClient.isOpen){
        await redisClient.connect();
        console.log("conectado a Redis!")
    }

    return redisClient;
}

module.exports = {redisClient, connectRedis};