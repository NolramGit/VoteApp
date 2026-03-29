const { createClient } = require('redis');

const url = 'redis://default:roYFOjOFpohrNImlXBhbcSZSWLAgJbZB@centerbeam.proxy.rlwy.net:46127' || "";

const redisClient = createClient({
    url: 'redis://default:roYFOjOFpohrNImlXBhbcSZSWLAgJbZB@centerbeam.proxy.rlwy.net:46127'
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