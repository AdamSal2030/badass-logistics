#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — demand-gap finder

   Answers "what pages should we actually build next?" from real
   Search Console demand instead of guesswork. A page is worth
   building when Google ALREADY shows us for a query (so the demand
   and our topical fit are proven) but we rank badly because no page
   on the site actually targets it.

   Blindly adding pages to a site averaging position 23 is how you
   get a doorway-page problem. This only surfaces queries with
   demonstrated impressions.

   RUN:  node gsc-gaps.js [days]        (default 28)
   =========================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DAYS = parseInt(process.argv[2] || '28', 10);
const SITE = process.env.SITE || 'sc-domain:badasslogistics.com';
const KEY_PATH = process.env.GSC_KEY || path.join(__dirname, 'gsc-key.json');
if (!fs.existsSync(KEY_PATH)) { console.error(`✖ No key at ${KEY_PATH}`); process.exit(1); }
const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
const b64url = (b) => Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

async function getToken() {
  const now = Math.floor(Date.now()/1000);
  const header = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const claim = b64url(JSON.stringify({iss:key.client_email,
    scope:'https://www.googleapis.com/auth/webmasters.readonly',
    aud:'https://oauth2.googleapis.com/token', iat:now, exp:now+3600}));
  const si = `${header}.${claim}`;
  const sig = crypto.createSign('RSA-SHA256').update(si).sign(key.private_key);
  const res = await fetch('https://oauth2.googleapis.com/token',{method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${si}.${b64url(sig)}`})});
  const j = await res.json();
  if (!j.access_token) { console.error('token failed', j); process.exit(1); }
  return j.access_token;
}
async function query(token, body) {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    {method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(body)});
  const j = await res.json();
  if (j.error) { console.error(`API error ${j.error.code}: ${j.error.message}`); process.exit(1); }
  return j.rows || [];
}
const dstr = d => d.toISOString().slice(0,10);

// Every slug we already have a page for, as a normalised token bag.
function siteVocab() {
  const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(d,{withFileTypes:true})) {
    if (['.git','node_modules','content-drafts','assets','css'].includes(e.name)) continue;
    const p = path.join(d,e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) out.push('/'+path.relative(__dirname,p).replace(/\.html$/,''));
  }};
  walk(__dirname);
  return out;
}

(async () => {
  const token = await getToken();
  const end = new Date(Date.now()-2*864e5), start = new Date(end.getTime()-DAYS*864e5);
  const range = {startDate:dstr(start), endDate:dstr(end)};

  const qrows = await query(token, {...range, dimensions:['query'], rowLimit:25000});
  const prows = await query(token, {...range, dimensions:['page'],  rowLimit:25000});

  console.log(`\n=== DEMAND GAPS — ${range.startDate} → ${range.endDate} (${DAYS}d) ===\n`);

  // ---- page coverage: how much of the site earns anything at all ----
  const sm = fs.readFileSync(path.join(__dirname,'sitemap.xml'),'utf8');
  const all = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replace(/\/$/,''));
  const seen = new Map(prows.map(r=>[r.keys[0].replace(/\/$/,''), r]));
  const withImp = all.filter(u=>seen.has(u));
  const withClk = withImp.filter(u=>seen.get(u).clicks>0);
  console.log(`SITE COVERAGE`);
  console.log(`  sitemap URLs           ${all.length}`);
  console.log(`  earning impressions    ${withImp.length}  (${(100*withImp.length/all.length).toFixed(0)}%)`);
  console.log(`  earning ZERO           ${all.length-withImp.length}  (${(100*(all.length-withImp.length)/all.length).toFixed(0)}%)`);
  console.log(`  earning >=1 click      ${withClk.length}  (${(100*withClk.length/all.length).toFixed(1)}%)`);

  const brand = /badass|bad ass|badas|bad-ass|ass logistic|badlands|bass logistic|bad logistic/i;
  const totClicks = qrows.reduce((a,r)=>a+r.clicks,0);
  const brandClicks = qrows.filter(r=>brand.test(r.keys[0])).reduce((a,r)=>a+r.clicks,0);
  console.log(`\n  total clicks ${totClicks} — brand ${brandClicks} (${(100*brandClicks/totClicks).toFixed(0)}%), non-brand ${totClicks-brandClicks}`);

  // ---- the gaps ----
  const vocab = siteVocab();
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const slugify = s => norm(s).replace(/\s+/g,'-');
  // Does any existing page's slug contain most of the query's meaningful words?
  const STOP = new Set(['the','a','to','for','in','of','and','near','me','my','you','is','are','with','how','what','do','does','can','best','company','companies','service','services','it','on','from','by','that','this','we','they']);
  function covered(q) {
    const words = norm(q).split(' ').filter(w=>w.length>2 && !STOP.has(w));
    if (!words.length) return true;
    return vocab.some(slug => {
      const s = slug.toLowerCase();
      const hit = words.filter(w=>s.includes(w)).length;
      return hit / words.length >= 0.75;
    });
  }

  const gaps = qrows
    .filter(r => !brand.test(r.keys[0]))
    .filter(r => r.impressions >= 3)
    .filter(r => r.position > 15)          // not already close to page 1
    .filter(r => !covered(r.keys[0]))
    .sort((a,b)=> b.impressions - a.impressions);

  console.log(`\nUNCOVERED QUERIES (>=3 impr, pos >15, no page targets them): ${gaps.length}`);
  console.log(`${'query'.padEnd(52)} impr   pos`);
  console.log('─'.repeat(70));
  for (const r of gaps.slice(0,45))
    console.log(`${r.keys[0].slice(0,50).padEnd(52)} ${String(Math.round(r.impressions)).padStart(4)}  ${r.position.toFixed(0).padStart(4)}`);

  // ---- near-miss: already close, do NOT build a new page, fix the existing one ----
  const near = qrows.filter(r=>!brand.test(r.keys[0]) && r.position>=5 && r.position<=20 && r.impressions>=5)
                    .sort((a,b)=>b.impressions-a.impressions);
  console.log(`\n\nNEAR-MISS (pos 5-20 — improve the EXISTING page, don't build a new one): ${near.length}`);
  console.log(`${'query'.padEnd(52)} impr  clk   pos`);
  console.log('─'.repeat(70));
  for (const r of near.slice(0,20))
    console.log(`${r.keys[0].slice(0,50).padEnd(52)} ${String(Math.round(r.impressions)).padStart(4)} ${String(r.clicks).padStart(4)}  ${r.position.toFixed(1).padStart(5)}`);
})();
