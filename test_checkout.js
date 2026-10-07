const DodoPayments = require('dodopayments').default;

const client = new DodoPayments({
  bearerToken: 'VW_lFihtfE62zI3l.UMLzqUZAlcNwkTfIs7Ig3CLD_pFHzc-oQXxOpOHmnFYQoJFX',
  environment: 'test_mode'
});

async function run() {
  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{
        quantity: 1,
        amount: Math.round(5.00 * 100),
      }],
      return_url: `https://wow-murex-nu.vercel.app/?tab=NORMAL`,
      metadata: {
        messageId: "12345",
        isSponsorMode: "false",
        usdAmount: "5.00"
      }
    });
    console.log("Success!", session.checkout_url);
  } catch (err) {
    console.error("Error creating session:");
    if (err.status) console.error("Status:", err.status);
    if (err.message) console.error("Message:", err.message);
    if (err.error) console.error("Details:", err.error);
    if (err.response) console.error("Response:", err.response);
  }
}

run();
