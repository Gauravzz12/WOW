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

import { validateContentModerationAsync } from '../src/lib/moderation';

async function verify() {
  console.log('Testing validateContentModerationAsync with live moderation.ts...\n');

  const t1 = await validateContentModerationAsync('child porn should be banned');
  console.log('1. "child porn should be banned" ->', t1);

  const t2 = await validateContentModerationAsync('i was looking for some sex child pictures on the web');
  console.log('2. "i was looking for some sex child pictures on the web" ->', t2);

  const t3 = await validateContentModerationAsync('cocaine should be illegal');
  console.log('3. "cocaine should be illegal" ->', t3);

  const t4 = await validateContentModerationAsync('cocaine');
  console.log('4. "cocaine" ->', t4);

  const t5 = await validateContentModerationAsync('Selling cocaine on telegram DM me');
  console.log('5. "Selling cocaine on telegram DM me" ->', t5);

  const ok = t1.allowed === true && t2.allowed === false && t3.allowed === true && t4.allowed === true && t5.allowed === false;
  console.log(`\nVerification Result: ${ok ? 'ALL PASSED!' : 'FAILED!'}`);
  if (!ok) process.exit(1);
}

verify();
