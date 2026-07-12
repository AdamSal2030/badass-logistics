#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — Google Search Console ranking report
   Reads a Google service-account key (gsc-key.json), pulls Search
   Analytics for badasslogistics.com, and prints a readable report:
   top queries, top pages, and position — the SEO scoreboard.

   SETUP (see the GSC Launch Kit):
     1. Create a service account in Google Cloud, enable the
        "Google Search Console API", download its JSON key.
     2. Save that key as  ~/badass-logistics/gsc-key.json
     3. In Search Console → Settings → Users and permissions,
        add the service-account email with "Full" access.

   RUN:  node gsc-report.js            (last 28 days, domain property)
         node gsc-report.js 90         (last 90 days)
         SITE="https://badasslogistics.com/" node gsc-report.js
   No npm installs — pure Node (crypto + fetch).
   =========================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEY_PATH = process.env.GSC_KEY || path.join(__dirname, 'gsc-key.json');
const SITE = process.env.SITE || 'sc-domain:badasslogistics.com'; // or 'https://badasslogistics.com/'
const DAYS = Number(process.argv[2] || 28);

function die(msg) { console.error('✖ ' + msg); process.exit(1); }
if (!fs.existsSync(KEY_PATH)) die(`No key at ${KEY_PATH}. Save your service-account JSON there (see the GSC kit).`);

const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
if (!key.client_email || !key.private_key) die('gsc-key.json is missing client_email / private_key — is it a service-account key?');

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(key.private_key);
  const jwt = `${signingInput}.${b64url(signature)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const j = await res.json();
  if (!j.access_token) die(`Token request failed: ${JSON.stringify(j)}`);
  return j.access_token;
}

async function query(token, body) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  if (j.error) die(`API error (${j.error.code}): ${j.error.message}\n(Property = ${SITE}. If wrong, set SITE env to your exact GSC property, e.g. "https://badasslogistics.com/".)`);
  return j.rows || [];
}

const dstr = (d) => d.toISOString().slice(0, 10);
function pad(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n); }
function num(n) { return Number(n || 0).toLocaleString(); }

(async () => {
  const end = new Date(Date.now() - 2 * 864e5);       // GSC lags ~2 days
  const start = new Date(end.getTime() - DAYS * 864e5);
  const range = { startDate: dstr(start), endDate: dstr(end) };
  console.log(`\n=== Badass Logistics — Search Console report ===`);
  console.log(`Property: ${SITE}   Range: ${range.startDate} → ${range.endDate} (${DAYS}d)\n`);

  const token = await getToken();

  const totals = await query(token, { ...range, dimensions: [] });
  if (!totals.length) {
    console.log('No data yet for this range. New pages can take days–weeks to accumulate impressions.');
    console.log('Re-run this in a few days as Google crawls the new pages.\n');
  } else {
    const t = totals[0];
    // trend log: append this run + show delta vs the previous logged run
    const trendPath = path.join(__dirname, 'data', 'gsc-trend.csv');
    let prev = null;
    try {
      const lines = fs.readFileSync(trendPath, 'utf8').trim().split('\n').filter(Boolean);
      const last = lines[lines.length - 1];
      if (last && !last.startsWith('date')) { const [, c, i, , p] = last.split(','); prev = { clicks: +c, impressions: +i, position: +p }; }
    } catch {}
    const row = `${range.endDate},${Math.round(t.clicks)},${Math.round(t.impressions)},${(t.ctr*100).toFixed(2)},${t.position.toFixed(1)}\n`;
    try {
      if (!fs.existsSync(trendPath)) fs.writeFileSync(trendPath, 'date,clicks,impressions,ctr,position\n');
      fs.appendFileSync(trendPath, row);
    } catch {}
    const d = (cur, was, inv=false) => { if (was == null) return ''; const diff = cur - was; if (Math.abs(diff) < 0.05) return ' (—)'; const up = inv ? diff < 0 : diff > 0; const sign = diff > 0 ? '+' : ''; return ` (${up?'▲':'▼'}${sign}${inv?diff.toFixed(1):num(Math.round(diff))} vs last)`; };
    console.log(`TOTALS  clicks ${num(t.clicks)}${d(t.clicks, prev&&prev.clicks)} · impressions ${num(t.impressions)}${d(t.impressions, prev&&prev.impressions)} · CTR ${(t.ctr*100).toFixed(1)}% · avg position ${t.position.toFixed(1)}${d(t.position, prev&&prev.position, true)}\n`);
  }

  const queries = await query(token, { ...range, dimensions: ['query'], rowLimit: 30 });
  console.log(`── TOP QUERIES ${'─'.repeat(52)}`);
  console.log(`${pad('query',42)} ${pad('clicks',7)} ${pad('impr',8)} ${pad('pos',5)}`);
  for (const r of queries) console.log(`${pad(r.keys[0],42)} ${pad(num(r.clicks),7)} ${pad(num(r.impressions),8)} ${pad(r.position.toFixed(1),5)}`);
  if (!queries.length) console.log('(none yet)');

  const pages = await query(token, { ...range, dimensions: ['page'], rowLimit: 30 });
  console.log(`\n── TOP PAGES ${'─'.repeat(54)}`);
  console.log(`${pad('page',50)} ${pad('clicks',7)} ${pad('impr',8)} ${pad('pos',5)}`);
  for (const r of pages) console.log(`${pad(r.keys[0].replace('https://badasslogistics.com',''),50)} ${pad(num(r.clicks),7)} ${pad(num(r.impressions),8)} ${pad(r.position.toFixed(1),5)}`);
  if (!pages.length) console.log('(none yet)');

  // page-2 opportunities: ranking 11-20 (a nudge could push to page 1)
  const opp = queries.filter(r => r.position > 10 && r.position <= 20).sort((a,b)=>b.impressions-a.impressions);
  if (opp.length) {
    console.log(`\n── PAGE-2 OPPORTUNITIES (pos 11–20 — closest to page 1) ${'─'.repeat(8)}`);
    for (const r of opp.slice(0, 12)) console.log(`  pos ${r.position.toFixed(1).padStart(4)} · ${num(r.impressions)} impr · ${r.keys[0]}`);
  }
  console.log('');
})();
