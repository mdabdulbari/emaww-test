const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

module.exports = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
});