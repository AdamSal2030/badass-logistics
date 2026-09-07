#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — single build entrypoint

   WHY THIS EXISTS:
   The generators overwrite the programmatic pages, which WIPES every
   post-build link pass. On 2026-09-03 someone ran build-service-cities
   without re-running the linkers; the contextual trailer strips vanished
   from all 113 heavy-haul city pages and nobody noticed for four weeks.
   The trailer hubs sat at position 49–79 the whole time.

   Running the steps in the wrong order, or skipping the tail, is the
   single most expensive recurring mistake in this repo. So: one command.

   RUN:  node build.js            (full rebuild, then verify)
         node build.js --verify   (verify only — no writes)
   =========================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VERIFY_ONLY = process.argv.includes('--verify');

// Order matters. Generators first (they overwrite), link passes last.
const STEPS = [
  ['build-locations.js',     'city/location pages + locations grid + sitemap'],
  ['build-states.js',        'state hub pages + state chips'],
  ['build-service-cities.js','440 service x city pages + 125 state hubs'],
  ['build-trailer-types.js', '7 trailer-type hubs + heavy-haul trailer grid'],
  ['build-blog.js',          'field-guide articles + blog index'],
  ['seo-polish.js',          'head/footer upgrades for hand-written pages'],
  ['link-trailer-hubs.js',   'LINK PASS — trailer hub mesh'],
  ['link-city-mesh.js',      'LINK PASS — lateral nearby-city mesh'],
];

function run(script, desc) {
  const p = path.join(__dirname, script);
  if (!fs.existsSync(p)) { console.error(`  ✖ missing ${script}`); process.exit(1); }
  process.stdout.write(`\n▸ ${script}  — ${desc}\n`);
  try {
    const out = execSync(`node ${JSON.stringify(p)}`, { cwd: __dirname, encoding: 'utf8' });
    out.trim().split('\n').filter(Boolean).forEach(l => console.log('   ' + l));
  } catch (e) {
    console.error(`  ✖ ${script} failed:\n${e.stdout || ''}${e.stderr || ''}`);
    process.exit(1);
  }
}

// ---------- verification: the checks that would have caught the Sep 3 regression ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'content-drafts'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function verify() {
  console.log('\n══ VERIFY ═══════════════════════════════════════════');
  const files = walk(__dirname);
  let fail = 0;

  // 1. every link pass actually landed
  const SERVICE_DIRS = ['heavy-haul', 'machinery-moving', 'rigging', 'cnc-machine-movers', 'plant-relocation'];
  const cityRe = /-[a-z]{2}\.html$/;

  const hh = fs.existsSync(path.join(__dirname, 'services/heavy-haul'))
    ? fs.readdirSync(path.join(__dirname, 'services/heavy-haul')).filter(n => n.endsWith('.html')) : [];
  const hhStrip = hh.filter(n =>
    fs.readFileSync(path.join(__dirname, 'services/heavy-haul', n), 'utf8').includes('<!--TRAILER_STRIP_START-->')).length;
  const ok1 = hh.length > 0 && hhStrip === hh.length;
  console.log(`${ok1 ? '✓' : '✖'} trailer strip: ${hhStrip}/${hh.length} heavy-haul pages`);
  if (!ok1) fail++;

  let meshTotal = 0, meshHas = 0;
  for (const d of SERVICE_DIRS) {
    const dir = path.join(__dirname, 'services', d);
    if (!fs.existsSync(dir)) continue;
    for (const n of fs.readdirSync(dir).filter(x => x.endsWith('.html') && cityRe.test(x))) {
      meshTotal++;
      if (fs.readFileSync(path.join(dir, n), 'utf8').includes('<!--CITY_MESH_START-->')) meshHas++;
    }
  }
  const ok2 = meshTotal > 0 && meshHas === meshTotal;
  console.log(`${ok2 ? '✓' : '✖'} city mesh: ${meshHas}/${meshTotal} service-city pages`);
  if (!ok2) fail++;

  // 2. no broken internal links
  const has = (u) => {
    u = u.split('#')[0].split('?')[0];
    if (!u.startsWith('/')) return true;
    if (u.endsWith('/')) u += 'index.html';
    const p = path.join(__dirname, u.replace(/^\//, ''));
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
    if (fs.existsSync(p + '.html')) return true;
    if (fs.existsSync(p) && fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'index.html'))) return true;
    return false;
  };
  const broken = new Map();
  let checked = 0;
  for (const f of files) {
    // Strip <script>/<style> first: JS that builds markup contains href="' + fn() + '"
    // fragments that are not links and would report as false breaks.
    const html = fs.readFileSync(f, 'utf8')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
    for (const m of html.matchAll(/href="([^"]+)"/g)) {
      const raw = m[1];
      if (/^(https?:|mailto:|tel:|#|javascript:|data:)/i.test(raw)) continue;
      checked++;
      // Resolve relative hrefs against the page's own directory.
      const target = raw.startsWith('/')
        ? raw
        : '/' + path.relative(__dirname, path.resolve(path.dirname(f), raw.split('#')[0].split('?')[0]));
      if (!has(target)) {
        const key = `${raw}  (from /${path.relative(__dirname, f)})`;
        broken.set(key, (broken.get(key) || 0) + 1);
      }
    }
  }
  const ok3 = broken.size === 0;
  console.log(`${ok3 ? '✓' : '✖'} internal links: ${checked} checked, ${broken.size} broken`);
  if (!ok3) { fail++; [...broken].slice(0, 15).forEach(([u, c]) => console.log(`     ${c}x ${u}`)); }

  // 3. the machinery-moving regression from 2026-08-11 — pillar must keep its city cards
  const pillar = path.join(__dirname, 'services/machinery-moving.html');
  if (fs.existsSync(pillar)) {
    // Pillars link their city cards with RELATIVE hrefs ("machinery-moving/akron-oh"),
    // so match both forms — an absolute-only pattern reports a false regression.
    const ph = fs.readFileSync(pillar, 'utf8');
    const n = new Set(
      [...ph.matchAll(/href="(?:\/services\/)?machinery-moving\/([a-z-]+)"/g)].map(m => m[1])
    ).size;
    const ok4 = n >= 50;
    console.log(`${ok4 ? '✓' : '✖'} machinery-moving pillar city links: ${n} (expect 50+)`);
    if (!ok4) fail++;
  }

  // 4. titles + descriptions present and unique
  const titles = new Map(), descs = new Map();
  let noTitle = 0, noDesc = 0;
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const t = html.match(/<title>([\s\S]*?)<\/title>/);
    const d = html.match(/name="description"\s+content="([\s\S]*?)"/);
    if (!t) noTitle++; else titles.set(t[1].trim(), (titles.get(t[1].trim()) || 0) + 1);
    // noindex pages (404, thank-you) never surface in search — a description is moot.
    const noindex = /name="robots"[^>]*content="[^"]*noindex/i.test(html);
    if (!d) { if (!noindex) noDesc++; } else descs.set(d[1].trim(), (descs.get(d[1].trim()) || 0) + 1);
  }
  const dupT = [...titles.values()].filter(v => v > 1).length;
  const dupD = [...descs.values()].filter(v => v > 1).length;
  const ok5 = noTitle === 0 && dupT === 0;
  console.log(`${ok5 ? '✓' : '✖'} titles: ${files.length} pages, ${noTitle} missing, ${dupT} duplicated`);
  console.log(`${noDesc === 0 && dupD === 0 ? '✓' : '!'} descriptions: ${noDesc} missing, ${dupD} duplicated (noindex pages exempt)`);
  if (!ok5) fail++;

  console.log('═════════════════════════════════════════════════════');
  if (fail) { console.error(`✖ ${fail} check(s) FAILED — do not deploy.`); process.exit(1); }
  console.log('✓ All checks passed.\n');
}

if (!VERIFY_ONLY) {
  console.log('Badass Logistics — full rebuild');
  for (const [s, d] of STEPS) run(s, d);
}
verify();
