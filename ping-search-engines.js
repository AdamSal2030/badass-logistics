#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — tell the search engines we shipped

   GitHub Pages has no ping hook, so after a content push the site
   just waits to be recrawled. URL Inspection on 2026-08-11 showed the
   trailer hubs were last crawled 2026-07-14 — nearly a month stale,
   and still reporting referringUrls=1, i.e. Google's picture of them
   predated the Aug 7 link mesh entirely. New pages sat unseen.

   This does the two things that actually move the needle:
     1. IndexNow  -> Bing + Yandex, near-immediate (feeds Copilot)
     2. Sitemaps.submit -> Google, nudges a sitemap re-download

   Google has no supported "recrawl this URL" API for regular pages
   (the Indexing API is JobPosting/BroadcastEvent only), so the
   sitemap resubmit plus real inbound links is the honest lever.

   RUN:
     node ping-search-engines.js                 # today's lastmod URLs from sitemap.xml
     node ping-search-engines.js /services/x /blog/y   # explicit paths
     node ping-search-engines.js --all           # every URL in the sitemap (use sparingly)

   Needs gsc-key.json for the Google half; the IndexNow half works
   without it. IndexNow key file lives at the repo root and must stay
   reachable at https://badasslogistics.com/<key>.txt
   =========================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DOMAIN = 'https://badasslogistics.com';
const HOST = 'badasslogistics.com';
const INDEXNOW_KEY = 'e83558048c9c1b4d6767f314ca9cb757';
const SITE = 'sc-domain:badasslogistics.com';
const SITEMAP = `${DOMAIN}/sitemap.xml`;
const KEY_PATH = process.env.GSC_KEY || path.join(ROOT, 'gsc-key.json');

// IndexNow caps a submission at 10,000 URLs; we stay well under by default.
const MAX_URLS = 10000;

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)]
    .map(m => ({ loc: m[1], lastmod: m[2] || '' }));
}

function pickUrls(argv) {
  const paths = argv.filter(a => !a.startsWith('--'));
  if (paths.length) return paths.map(p => (p.startsWith('http') ? p : DOMAIN + (p.startsWith('/') ? p : '/' + p)));

  const all = sitemapUrls();
  if (argv.includes('--all')) return all.map(u => u.loc);

  // Default: whatever the sitemap says changed today. The generators stamp
  // lastmod on every page they rewrite, so a rebuild marks far more than you
  // actually edited — hence the cap and the printed count.
  const today = new Date().toISOString().slice(0, 10);
  const fresh = all.filter(u => u.lastmod === today).map(u => u.loc);
  return fresh;
}

async function googleToken() {
  const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const now = Math.floor(Date.now() / 1000);
  const claim = { iss: key.client_email, scope: 'https://www.googleapis.com/auth/webmasters', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  const input = `${b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64(JSON.stringify(claim))}`;
  const jwt = `${input}.${b64(crypto.createSign('RSA-SHA256').update(input).sign(key.private_key))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error(`token request failed: ${JSON.stringify(j)}`);
  return j.access_token;
}

(async () => {
  const urls = pickUrls(process.argv.slice(2)).slice(0, MAX_URLS);
  if (!urls.length) {
    console.log('Nothing to ping — no URLs with today\'s lastmod in sitemap.xml.');
    console.log('Pass paths explicitly, or --all, if that is not what you expected.');
    return;
  }
  console.log(`Pinging ${urls.length} URL${urls.length === 1 ? '' : 's'}\n`);

  // ---- 1. IndexNow (Bing, Yandex) ----
  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${DOMAIN}/${INDEXNOW_KEY}.txt`, urlList: urls }),
    });
    // 200 accepted, 202 accepted but key still validating, 422 = url/key mismatch.
    console.log(`IndexNow          HTTP ${res.status} ${res.status === 200 || res.status === 202 ? '✓ accepted' : '✖ ' + (await res.text()).slice(0, 200)}`);
  } catch (e) {
    console.log(`IndexNow          ✖ ${e.message}`);
  }

  // ---- 2. Google: resubmit the sitemap ----
  if (!fs.existsSync(KEY_PATH)) {
    console.log(`Google sitemap    – skipped (no key at ${path.relative(ROOT, KEY_PATH)})`);
    return;
  }
  try {
    const token = await googleToken();
    const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`;
    const put = await fetch(`${base}/${encodeURIComponent(SITEMAP)}`, { method: 'PUT', headers: { authorization: 'Bearer ' + token } });
    console.log(`Google sitemap    HTTP ${put.status} ${put.status === 204 ? '✓ resubmitted' : '✖ ' + (await put.text()).slice(0, 200)}`);

    const list = await (await fetch(base, { headers: { authorization: 'Bearer ' + token } })).json();
    for (const s of list.sitemap || []) {
      console.log(`  ${s.path}`);
      console.log(`    last downloaded by Google: ${s.lastDownloaded || 'never'} · ${(s.contents || []).map(c => c.submitted + ' urls').join(', ')} · ${s.errors || 0} errors, ${s.warnings || 0} warnings`);
    }
  } catch (e) {
    console.log(`Google sitemap    ✖ ${e.message}`);
  }
})();
