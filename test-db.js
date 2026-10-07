const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if(key) acc[key.trim()] = val.join('=').trim().replace(/^\"|\"$/g, '');
  return acc;
}, {});

const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?select=id,created_at,status&order=created_at.desc&limit=5`;
fetch(url, {
  headers: {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  }
}).then(res => res.json()).then(res => console.log(JSON.stringify(res, null, 2)));
