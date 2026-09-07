#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — lateral city mesh

   THE PROBLEM (found in the 2026-09-05 GSC pull):
   Every service-city page links UP to its state hub and ACROSS to its
   four sibling services in the same city — but cities never link to
   each other. Link equity pools in the 25 state hubs and never reaches
   the individual money pages. /services/machinery-moving/savannah-ga
   sits at position 10.6 on "machinery movers savannah ga" (103 impr,
   0 clicks) with exactly TWO inbound internal links.

   THE FIX: a lateral "nearby coverage" block on all 440 service-city
   pages linking to the 6 geographically closest cities in the SAME
   service — same state first, then same region (data/metros.json).
   That turns ~2 inbound links per money page into ~8-14, and the
   anchor text is the real city+service phrase we're trying to rank.

   Copy is varied off each metro's own `industry` field so 440 blocks
   don't read as one boilerplate paragraph.

   Idempotent — safe to re-run. Re-run it after ANY city rebuild:
   build-service-cities.js overwrites these pages and wipes the mesh.

   RUN:  node link-city-mesh.js
   =========================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

const S = '<!--CITY_MESH_START-->', E = '<!--CITY_MESH_END-->';

const SERVICES = {
  'machinery-moving':   { label: 'machinery moving', anchor: 'Machinery Movers' },
  'rigging':            { label: 'industrial rigging', anchor: 'Industrial Rigging' },
  'heavy-haul':         { label: 'heavy haul',        anchor: 'Heavy Haul' },
  'cnc-machine-movers': { label: 'CNC machine moving', anchor: 'CNC Machine Movers' },
  'plant-relocation':   { label: 'plant relocation',  anchor: 'Plant Relocation' },
};

const cities = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/service-cities.json'), 'utf8'));
const metros = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/metros.json'), 'utf8')).metros;

const metaOf = new Map();
for (const m of metros) metaOf.set(`${m.city.toLowerCase()}|${m.state.toUpperCase()}`, m);

// Group the city pages by service.
const byService = new Map();
for (const c of cities) {
  if (!SERVICES[c.service]) continue;
  if (!byService.has(c.service)) byService.set(c.service, []);
  byService.get(c.service).push(c);
}

// Nearest peers: same state ranks above same region; ties break on metro rank
// (bigger metros first) so every page links at least one page people search for.
function nearest(target, pool, n = 6) {
  const tm = metaOf.get(`${target.city.toLowerCase()}|${target.state.toUpperCase()}`);
  if (!tm) return [];
  return pool
    .filter(c => c.url !== target.url)
    .map(c => {
      const m = metaOf.get(`${c.city.toLowerCase()}|${c.state.toUpperCase()}`);
      if (!m) return null;
      let score;
      if (m.state.toUpperCase() === tm.state.toUpperCase()) score = 0;
      else if (m.region === tm.region) score = 1;
      else return null;
      return { c, m, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.m.rank - b.m.rank)
    .slice(0, n)
    .map(x => x.c);
}

// Intro copy keyed off the metro's real industrial driver — keeps 440 blocks
// from reading as one duplicated sentence.
function intro(target, svc, peers) {
  const tm = metaOf.get(`${target.city.toLowerCase()}|${target.state.toUpperCase()}`);
  const sameState = peers.filter(p => p.state.toUpperCase() === target.state.toUpperCase()).length;
  const driver = tm && tm.industry ? tm.industry : null;
  const where = `${target.city}, ${target.state}`;

  if (driver && sameState >= 2) {
    return `Plenty of ${where} work — ${driver} — moves across state lines before it lands. `
         + `We run the same ${svc.label} crews and permits through these ${target.state} and regional markets:`;
  }
  if (driver) {
    return `${where} runs on ${driver}, and almost none of it stays put. `
         + `Same crews, same permits, same ${svc.label} standards in the markets nearest you:`;
  }
  return `Loads out of ${where} rarely stop at the county line. `
       + `We cover ${svc.label} in the neighboring markets too:`;
}

let added = 0, already = 0, noAnchor = 0, noPeers = 0;

for (const [service, svc] of Object.entries(SERVICES)) {
  const pool = byService.get(service) || [];
  for (const target of pool) {
    const file = path.join(ROOT, target.url.replace(/^\//, '') + '.html');
    if (!fs.existsSync(file)) continue;

    let html = fs.readFileSync(file, 'utf8');
    if (html.includes(S)) { already++; continue; }

    const peers = nearest(target, pool, 6);
    if (peers.length < 2) { noPeers++; continue; }

    const links = peers.map(p =>
      `<a href="${p.url}">${svc.anchor} in ${p.city}, ${p.state}</a>`
    ).join('\n    ');

    // Only 25 of the 40 covered states have a hub page — never emit a 404.
    const hubSlug = stateSlug(target.state);
    const hubExists = fs.existsSync(path.join(ROOT, 'services', service, hubSlug + '.html'));
    const stateHub = `/services/${service}/${hubSlug}`;
    const block =
`<section class="bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);"><div class="wrap">
  ${S}
  <span class="section-tag hand">nearby coverage</span>
  <h2 class="section-title">We work the markets around ${target.city}</h2>
  <p class="section-intro">${intro(target, svc, peers)}</p>
  <div class="tt-grid">
    ${links}${hubExists ? `\n    <a href="${stateHub}"><strong>All ${target.state} coverage →</strong></a>` : ''}
  </div>
  ${E}
</div></section>

`;
    const ANCHOR = '<section class="notes-bg">';
    if (!html.includes(ANCHOR)) { noAnchor++; continue; }
    html = html.replace(ANCHOR, block + ANCHOR);
    fs.writeFileSync(file, html);
    added++;
  }
}

function stateSlug(abbr) {
  const NAMES = { AL:'alabama',AZ:'arizona',AR:'arkansas',CA:'california',CO:'colorado',CT:'connecticut',
    FL:'florida',GA:'georgia',ID:'idaho',IL:'illinois',IN:'indiana',IA:'iowa',KS:'kansas',KY:'kentucky',
    LA:'louisiana',MD:'maryland',MA:'massachusetts',MI:'michigan',MN:'minnesota',MS:'mississippi',
    MO:'missouri',NE:'nebraska',NV:'nevada',NJ:'new-jersey',NM:'new-mexico',NY:'new-york',
    NC:'north-carolina',OH:'ohio',OK:'oklahoma',OR:'oregon',PA:'pennsylvania',SC:'south-carolina',
    TN:'tennessee',TX:'texas',UT:'utah',VA:'virginia',WA:'washington',WI:'wisconsin',WV:'west-virginia' };
  return NAMES[abbr.toUpperCase()] || abbr.toLowerCase();
}

console.log(`✓ Lateral city mesh added to ${added} pages`);
if (already)  console.log(`  · ${already} already had it (idempotent skip)`);
if (noPeers)  console.log(`  ! ${noPeers} had fewer than 2 regional peers`);
if (noAnchor) console.log(`  ! ${noAnchor} missing the notes-bg anchor`);
