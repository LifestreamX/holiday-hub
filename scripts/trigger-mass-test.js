const http = require('http');

async function triggerLocalTest() {
  console.log('--- 🧪 TRIGGERING MASSIVE SCHEDULER TEST ---');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cron/notify',
    method: 'POST',
    headers: {
      'x-local-test': 'true',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
      } catch {
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error.message);
  });

  req.end();
}

triggerLocalTest();