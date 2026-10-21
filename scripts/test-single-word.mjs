import fs from 'node:fs';
import path from 'node:path';

const envContent = fs.readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const apiKey = process.env.TYPESAFE_API_KEY;

async function checkWord(word) {
  const res = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'jev-latest',
      state: { document: word, normalized_text: word },
      questions: {
        illegal_contraband: {
          type: 'noul',
          instructions:
            'Does this text actively sell, solicit, deal, or offer for purchase illegal narcotics (fentanyl, cocaine, meth, heroin, pills), illegal firearms, stolen credit cards/CVV, malware/ransomware, or financial phishing scams? IMPORTANT: Merely mentioning drug names (e.g. "cocaine", "weed", "heroin"), casual drug references, anti-drug opinions ("cocaine should be illegal"), discussions of drug laws, or addiction recovery are completely safe and MUST be evaluated as safe. Only commercial dealing, selling, sourcing, or street distribution is prohibited.',
        },
        category: {
          type: 'choice',
          instructions: 'Classify the message in semantic context.',
          criteria: {
            safe: 'Safe content, single word or casual drug mentions ("cocaine", "weed"), everyday swearing, emotional venting, philosophical misanthropy ("everyone should die", "humanity sucks"), anti-drug opinions ("cocaine should be illegal"), love confessions, flattering romantic compliments, anti-violence advocacy ("School shooting should be prohibited"), anti-racism advocacy, historical education, or digital piracy/torrents',
            illegal_contraband: 'Active commercial drug dealing, selling, sourcing, or distributing hard drugs or illegal weapons, stolen credit cards, malware, or phishing scams. NOT mere mentions of drug words like "cocaine".',
          },
        },
      },
    }),
  });

  const json = await res.json();
  console.log(`Word: "${word}" ->`, json.answers);
}

async function main() {
  await checkWord('cocaine');
  await checkWord('Selling cocaine on telegram DM me');
}
main();
