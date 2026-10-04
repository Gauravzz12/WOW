const DodoPayments = require('dodopayments').default;

const client = new DodoPayments({
  bearerToken: 'VW_lFihtfE62zI3l.UMLzqUZAlcNwkTfIs7Ig3CLD_pFHzc-oQXxOpOHmnFYQoJFX',
  environment: 'test_mode'
});

async function main() {
  try {
    const product = await client.products.create({
      name: 'Words of the World - Message Slot',
      description: 'A message slot on Words of the World digital billboard.',
      price: {
        currency: 'USD',
        price: 200, // Minimum suggested price
        pay_what_you_want: true,
        type: 'one_time_price'
      },
      tax_category: 'digital_products'
    });
    console.log(JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error creating product:', error);
  }
}

main();
