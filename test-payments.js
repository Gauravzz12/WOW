const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if(key) acc[key.trim()] = val.join('=').trim().replace(/^\"|\"$/g, '');
  return acc;
}, {});

async function test() {
  const pUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/payments?select=*&order=created_at.desc&limit=5`;
  const pRes = await fetch(pUrl, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }).then(r => r.json());
  console.log("Payments:", JSON.stringify(pRes, null, 2));
}
test();
