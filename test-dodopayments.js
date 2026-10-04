const http = require('https'); // Or http if testing locally

// Replace this with the actual messageId from your database that is PENDING_PAYMENT or QUEUED
const messageIdToTest = 'YOUR_MESSAGE_ID_HERE';

// Replace with your live domain if deployed, or http://localhost:3000 if running locally
const domain = 'https://words.world'; 

const data = JSON.stringify({
  type: 'payment.succeeded',
  data: {
    payment_id: 'mock_dodo_pay_' + Date.now(),
    currency: 'usd',
    total_amount: 500, // $5.00
    metadata: {
      messageId: messageIdToTest,
      isSponsorMode: 'false',
      isReservedSlot: 'false'
    }
  }
});

const url = new URL(`${domain}/api/webhooks/dodopayments`);

const req = http.request({
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response from Webhook:', body));
});

req.on('error', e => console.error('Error:', e));
req.write(data);
req.end();
