async function check() {
  const html = await fetch('https://wow-murex-nu.vercel.app/').then(r=>r.text());
  const jsFiles = [...html.matchAll(/href=\"(\/_next\/static\/chunks\/[^\"]+\.js)\"/g)].map(m=>m[1]);
  for(const file of jsFiles) {
    const js = await fetch('https://wow-murex-nu.vercel.app' + file).then(r=>r.text());
    const match = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/);
    if(match) { console.log('Found:', match[0]); return; }
  }
  console.log('Not found in any script');
}
check();
