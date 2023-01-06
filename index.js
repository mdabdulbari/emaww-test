const fs = require('fs');
const { parseString } = require('xml2js');
const { promisify } = require('util');
const redisClient = require('./clients/redis-client');

const parseStringAsync = promisify(parseString);

async function parseXml(xmlPath) {
    const xml = await promisify(fs.readFile)(xmlPath, 'utf8');
    const doc = await parseStringAsync(xml);
    return doc;
}

function extractSubdomains(doc) {
    return doc.config.subdomains[0].subdomain.map(subdomain => subdomain.$text);
}

function saveSubdomains(subdomains, verbose = false) {
    const subdomainsJson = JSON.stringify(subdomains);
    redisClient.set('subdomains', subdomainsJson, redisClient.print);
    if (verbose) {
        console.log(`Saved subdomains to Redis: ${subdomainsJson}`);
    }
}

function extractCookies(doc) {
    return doc.config.cookies[0].cookie.map(cookie => ({
        name: cookie.$.name,
        host: cookie.$.host,
        value: cookie.$text,
    }));
}

async function saveCookies(cookies, verbose) {
    const multi = redisClient.multi();
    cookies.forEach((cookie) => {
        const key = `cookie:${cookie.name}:${cookie.host}`;
        multi.set(key, cookie.value);
    });
    const result = await multi.exec();
    if (verbose) {
        console.log('Cookies saved:', result.map((r) => r[0]));
    }
}

async function exportXmlToRedis(xmlPath, verbose = false) {
    await redisClient.connect();
    const doc = await parseXml(xmlPath);
    const subdomains = extractSubdomains(doc);
    saveSubdomains(subdomains, verbose);
    const cookies = extractCookies(doc);
    saveCookies(cookies, verbose);
}

exportXmlToRedis(process.argv[2], process.argv[3] === '-v');

module.exports = {
    parseXml,
    extractSubdomains,
    saveSubdomains,
    extractCookies,
    saveCookies,
};