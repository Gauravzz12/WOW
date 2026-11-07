const DodoPayments = require('dodopayments').default;

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
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
