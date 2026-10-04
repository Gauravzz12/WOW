const DodoPayments = require('dodopayments').default;

const client = new DodoPayments({
  bearerToken: 'VW_lFihtfE62zI3l.UMLzqUZAlcNwkTfIs7Ig3CLD_pFHzc-oQXxOpOHmnFYQoJFX',
  environment: 'test_mode'
});

async function main() {
  try {
    const webhook = await client.webhooks.create({
      url: 'https://words.world/api/webhooks/dodopayments', // Can change when testing locally using ngrok
      description: 'Payment Success Webhook',
      filter_types: ['payment.succeeded']
    });
    console.log(JSON.stringify(webhook, null, 2));
  } catch (error) {
    console.error('Error creating webhook:', error);
  }
}

main();
