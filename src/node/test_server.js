const http = require('http');
console.log('Starting test server...');
http.createServer((req, res) => {
    console.log('Received request');
    res.writeHead(200);
    res.end('OK from Test Server');
}).listen(5454, '0.0.0.0', () => console.log('Test server running on 5454'));
