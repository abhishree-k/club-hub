const http = require('http');

const HOST = process.env.HOST || '127.0.0.1'; // Use IP instead of localhost
const PORT = process.env.PORT || 3000;

const data = JSON.stringify({
    name: 'Debug User',
    message: 'Debug Message',
    email: 'debug@example.com'
});

const options = {
    hostname: HOST, // Use IP instead of localhost
    port: PORT,
    path: '/api/feedback',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');

    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log(`BODY: ${body}`);

        if (res.statusCode >= 400) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.setTimeout(5000, () => {
    console.error('Request timed out');
    req.destroy();
    process.exit(1);
});

req.write(data);
req.end();
