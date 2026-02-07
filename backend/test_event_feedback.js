const http = require('http');

const data = JSON.stringify({
    name: 'Event Feedback User',
    eventName: 'AI Workshop',
    rating: '⭐ Excellent',
    message: 'Great event!'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/feedback',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => console.log('Response:', body));
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
