const fs = require('fs');
const path = require('path');
const {
    parseXml,
    saveSubdomains,
    extractCookies,
    saveCookies,
} = require('./export-xml-to-redis');

test('parses XML file', async () => {
    const xmlPath = path.resolve(__dirname, 'config.xml');
    const xml = await fs.promises.readFile(xmlPath, 'utf-8');
    const doc = await parseXml(xml);
    expect(doc).toBeDefined();
});

test('saves subdomains to Redis', async () => {
    const subdomains = ['http://example.com', 'http://test.com'];
    await saveSubdomains(subdomains);
    const savedSubdomains = await redisClient.get('subdomains');
    expect(savedSubdomains).toEqual(JSON.stringify(subdomains));
});

test('extracts cookies from XML document', () => {
    const xmlPath = path.resolve(__dirname, 'config.xml');
    const xml = fs.readFileSync(xmlPath, 'utf-8');
    const doc = parseXml(xml);
    const cookies = extractCookies(doc);
    expect(cookies).toHaveLength(22);
});

test('saves cookies to Redis', async () => {
    const cookies = [
        { name: 'cookie1', host: 'example.com', value: 'abc123' },
        { name: 'cookie2', host: 'test.com', value: 'def456' },
    ];
    await saveCookies(cookies);
    const cookie1 = await redisClient.get('cookie:cookie1:example.com');
    const cookie2 = await redisClient.get('cookie:cookie2:test.com');
    expect(cookie1).toEqual('abc123');
    expect(cookie2).toEqual('def456');
});
