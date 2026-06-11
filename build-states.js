#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — STATE hub page generator
   Writes locations/<state-name>.html for every state that has
   at least one city in data/locations.json, and injects a
   "Browse by state" chip row into locations.html (sentinels).

   Run AFTER build-locations.js (which owns sitemap.xml and
   already emits the /locations/<state>.html sitemap entries):
     node build-locations.js && node build-states.js
   =========================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const locations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locations.json'), 'utf8'));

const STATE = {
  CA: { name: 'California', region: 'the West', ix: 'I-5, I-10, I-15 and I-80' },
  OR: { name: 'Oregon', region: 'the West', ix: 'I-5 and I-84' },
  WA: { name: 'Washington', region: 'the West', ix: 'I-5, I-90 and I-82' },
  NV: { name: 'Nevada', region: 'the West', ix: 'I-15 and I-80' },
  AZ: { name: 'Arizona', region: 'the Mountain West', ix: 'I-10, I-17 and I-40' },
  NM: { name: 'New Mexico', region: 'the Mountain West', ix: 'I-25, I-40 and I-10' },
  CO: { name: 'Colorado', region: 'the Mountain West', ix: 'I-25, I-70 and I-76' },
  UT: { name: 'Utah', region: 'the Mountain West', ix: 'I-15, I-80 and I-70' },
  ID: { name: 'Idaho', region: 'the Mountain West', ix: 'I-84, I-86 and I-15' },
  MT: { name: 'Montana', region: 'the Mountain West', ix: 'I-90, I-94 and I-15' },
  WY: { name: 'Wyoming', region: 'the Mountain West', ix: 'I-25, I-80 and I-90' },
  ND: { name: 'North Dakota', region: 'the Plains', ix: 'I-29 and I-94' },
  NE: { name: 'Nebraska', region: 'the Plains', ix: 'I-80 and I-29' },
  MN: { name: 'Minnesota', region: 'the Plains', ix: 'I-35, I-90 and I-94' },
  MO: { name: 'Missouri', region: 'the Plains', ix: 'I-70, I-44, I-35 and I-29' },
  WI: { name: 'Wisconsin', region: 'the Great Lakes', ix: 'I-94, I-43 and I-90' },
  IL: { name: 'Illinois', region: 'the Great Lakes', ix: 'I-55, I-80, I-90 and I-94' },
  IN: { name: 'Indiana', region: 'the Great Lakes', ix: 'I-65, I-70 and I-69' },
  MI: { name: 'Michigan', region: 'the Great Lakes', ix: 'I-75, I-94 and I-96' },
  OH: { name: 'Ohio', region: 'the Great Lakes', ix: 'I-70, I-71, I-75 and I-90' },
  TX: { name: 'Texas', region: 'the South Central', ix: 'I-10, I-20, I-35 and I-45' },
  OK: { name: 'Oklahoma', region: 'the South Central', ix: 'I-35, I-40 and I-44' },
  AR: { name: 'Arkansas', region: 'the South Central', ix: 'I-40, I-30 and I-55' },
  LA: { name: 'Louisiana', region: 'the South Central', ix: 'I-10, I-12, I-20 and I-49' },
  MS: { name: 'Mississippi', region: 'the Southeast', ix: 'I-55, I-20, I-10 and I-59' },
  AL: { name: 'Alabama', region: 'the Southeast', ix: 'I-65, I-20, I-10 and I-59' },
  TN: { name: 'Tennessee', region: 'the Southeast', ix: 'I-40, I-65, I-24 and I-75' },
  GA: { name: 'Georgia', region: 'the Southeast', ix: 'I-75, I-85, I-20 and I-95' },
  SC: { name: 'South Carolina', region: 'the Southeast', ix: 'I-95, I-26, I-85 and I-20' },
  NC: { name: 'North Carolina', region: 'the Southeast', ix: 'I-40, I-85, I-95 and I-77' },
  FL: { name: 'Florida', region: 'the Southeast', ix: 'I-95, I-75, I-10 and I-4' },
  KY: { name: 'Kentucky', region: 'the Southeast', ix: 'I-65, I-64, I-75 and I-71' },
  VA: { name: 'Virginia', region: 'the Southeast', ix: 'I-95, I-64, I-81 and I-66' },
  MD: { name: 'Maryland', region: 'the Northeast', ix: 'I-95, I-70 and I-83' },
  PA: { name: 'Pennsylvania', region: 'the Northeast', ix: 'I-76, I-80, I-81 and I-95' },
  NY: { name: 'New York', region: 'the Northeast', ix: 'I-87, I-90, I-95 and I-81' },
  MA: { name: 'Massachusetts', region: 'the Northeast', ix: 'I-90, I-95 and I-93' },
};

const cleanUrls = (x) => x
  .split('badasslogistics.com/index.html').join('badasslogistics.com/')
  .split('="../index.html"').join('="/"')
  .split('="/index.html"').join('="/"')
  .split('="index.html"').join('="/"')
  .split('blog/index.html').join('blog/')
  .split('.html"').join('"')
  .split('.html#').join('#')
  .split('.html</loc>').join('</loc>');

const citySlug = (city, st) =>
  `${city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${st.toLowerCase()}`;
const stateSlug = (st) => STATE[st].name.toLowerCase().replace(/ /g, '-');

const HEROES = ['heavyhaul-hero.jpg', 'rigging-hero.jpg', 'heavyhaul-real.jpg', 'brokerage-hero.jpg', 'rigging-crane2.jpg', 'dispatch-hero.jpg'];
const BANDS  = ['rigging-crane.jpg', 'rgn-load.jpg', 'heavyhaul-load.jpg', 'brokerage-flatbed.jpg', 'dispatch-truck.jpg', 'brokerage-truck.jpg'];
const pick = (arr, i) => arr[i % arr.length];

const NAV = `
<div class="topbar"><div class="wrap"><div>📍 48 locations nationwide &nbsp;·&nbsp; <strong>All 50 states</strong></div><div><a href="tel:${site.phoneHref}">📞 ${site.phone}</a> &nbsp;·&nbsp; <a href="../contact.html"><strong>Get a Quote</strong></a></div></div></div>
<header class="site-header"><div class="wrap">
  <a class="logo" href="../index.html"><span class="brand"><span class="l1">BADASS</span><span class="l2">LOGISTICS</span></span></a>
  <button class="nav-toggle" aria-label="Menu" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
  <nav class="main" id="nav">
    <a href="../index.html">Home</a><a href="../services/rigging.html">Rigging</a><a href="../services/heavy-haul.html">Heavy Haul</a><a href="../services/dispatching.html">Dispatch</a><a href="../services/freight-moving.html">Freight Moving</a><a href="../trailer-moves">Trailer Moves</a><a href="../locations.html">Locations</a><a href="../blog/index.html">Blog</a><a href="../about.html">About</a>
    <a class="btn" style="font-size:14px;padding:9px 16px;box-shadow:3px 3px 0 var(--ink)" href="../contact.html">Get a Quote</a>
  </nav>
</div></header>`;

const FOOTER = `
<footer><div class="wrap"><div class="cols">
  <div><h4>Badass Logistics</h4><p style="opacity:.85;max-width:280px;">Rigging, heavy haul, dispatch &amp; freight moving. One-stop shop for everything oversized and overweight.</p></div>
  <div><h4>Services</h4><a href="../services/rigging.html">Industrial Rigging</a><a href="../services/heavy-haul.html">Heavy Haul Transport</a><a href="../services/machinery-moving.html">Machinery Moving</a><a href="../services/dispatching.html">Truck Dispatching</a><a href="../services/freight-moving.html">Freight Moving</a></div>
  <div><h4>Company</h4><a href="../about.html">About Us</a><a href="../trailer-moves">Trailer Moves</a><a href="../locations.html">Locations</a><a href="../blog/index.html">Blog</a><a href="../contact.html">Contact</a><a href="../privacy.html">Privacy</a></div>
  <div><h4>Contact</h4><address><a href="tel:${site.phoneHref}">${site.phone}</a><br><a href="mailto:${site.email}">${site.email}</a></address></div>
</div><div class="covstrip">Coverage: <a href="../locations/texas.html">Texas</a> · <a href="../locations/california.html">California</a> · <a href="../locations/florida.html">Florida</a> · <a href="../locations/georgia.html">Georgia</a> · <a href="../locations/illinois.html">Illinois</a> · <a href="../locations/ohio.html">Ohio</a> · <a href="../locations/pennsylvania.html">Pennsylvania</a> · <a href="../locations/new-york.html">New York</a> · <a href="../locations.html"><strong>All 48 locations →</strong></a></div>
<div class="legal"><span>© 2022–2026 Badass Logistics. All rights reserved.</span><span class="hand">made to move heavy things.</span></div></div></footer>`;

function statePage(st, cities, idx, allStates) {
  const meta = STATE[st];
  const name = meta.name;
  const slug = stateSlug(st);
  const hero = pick(HEROES, idx);
  const band = pick(BANDS, idx + 3);
  const pageUrl = `${site.domain}/locations/${slug}.html`;
  const mapQ = encodeURIComponent(name + ', USA');

  const cityNames = cities.map(c => c.city);
  const cityList = cityNames.length > 1
    ? cityNames.slice(0, -1).join(', ') + ' and ' + cityNames[cityNames.length - 1]
    : cityNames[0];
  const industries = [...new Set(cities.map(c => c.hub))].join(', ');
  const townsSample = [...new Set(cities.flatMap(c => (c.near || []).slice(0, 4)))].slice(0, 10);
  const plural = cities.length > 1;

  // neighbor states = same region, excluding self
  const neighbors = allStates.filter(s => s !== st && STATE[s].region === meta.region);

  const title = `${name} Heavy Haul, Rigging &amp; Freight Services | Badass Logistics`;
  const desc = `Heavy haul trucking, industrial rigging, truck dispatching, and freight moving across ${name} — based out of ${cityList}. Oversize/overweight permits, machinery moving, FTL &amp; LTL. Fast quotes.`;

  const svcSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Heavy Haul, Rigging & Freight Services",
    "areaServed": { "@type": "State", "name": name },
    "provider": { "@type": "LocalBusiness", "@id": site.domain + "/#organization", "name": site.brand, "telephone": site.phone, "email": site.email, "url": site.domain + "/" },
    "description": `${site.brand} provides rigging, heavy haul, dispatch and freight moving throughout ${name}.`
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${site.domain}/` },
      { "@type": "ListItem", "position": 2, "name": "Locations", "item": `${site.domain}/locations.html` },
      { "@type": "ListItem", "position": 3, "name": name, "item": pageUrl }
    ]
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `Do you cover all of ${name}?`, "acceptedAnswer": { "@type": "Answer", "text": `Yes — statewide. Our ${name} coverage runs out of ${cityList} and reaches every corner of the state, with the national network behind it for cross-country moves.` } },
      { "@type": "Question", "name": `Can you handle oversize and overweight permits in ${name}?`, "acceptedAnswer": { "@type": "Answer", "text": `Yes. We handle ${name} DOT oversize/overweight permitting, route surveys, clearance checks, and pilot-car or escort coordination as part of every heavy haul move.` } },
      { "@type": "Question", "name": `What cities do you serve in ${name}?`, "acceptedAnswer": { "@type": "Answer", "text": `${plural ? 'Our ' + name + ' pages cover ' + cityList : 'Our ' + name + ' hub is ' + cityList} — and we work statewide, including ${townsSample.slice(0, 5).join(', ')} and beyond.` } },
      { "@type": "Question", "name": `How fast can you quote a ${name} load?`, "acceptedAnswer": { "@type": "Answer", "text": `Send dimensions, weight, pickup, and destination and we typically turn ${name} quotes around the same day.` } }
    ]
  };

  const cityCards = cities.map(c => `
    <a class="svc-card" href="${citySlug(c.city, c.state)}.html"><span class="num hand">${c.state} — ${c.hub}</span><h3>${c.city}, ${c.state}</h3><p>${(c.near || []).slice(0, 4).join(' · ')}${(c.near || []).length ? ' &amp; more' : ''}</p><span class="more">${c.city} rigging &amp; heavy haul</span></a>`).join('');

  const neighborChips = neighbors.map(s => `<a href="${stateSlug(s)}.html">${STATE[s].name}</a>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141414">
<link rel="canonical" href="${pageUrl}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="Statewide ${name} heavy haul, rigging, dispatch &amp; freight moving. Fast quotes, permits handled.">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${site.domain}/assets/img/og-default.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="Statewide ${name} heavy haul, rigging, dispatch &amp; freight moving.">
<meta name="twitter:image" content="${site.domain}/assets/img/og-default.jpg">
<link rel="sitemap" type="application/xml" href="${site.domain}/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap"></noscript>
<link rel="icon" href="../assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
<link rel="preload" as="image" href="../assets/img/${hero}" fetchpriority="high">
<link rel="stylesheet" href="../css/styles.css">
<style>
  .map-frame { border:3px solid var(--ink); box-shadow:var(--shadow); background:var(--white); overflow:hidden; }
  .map-frame iframe { width:100%; height:380px; border:0; display:block; filter:grayscale(.15) contrast(1.05); }
  .metros { display:flex; flex-wrap:wrap; gap:10px; margin-top:22px; }
  .metros a { background:var(--ink); color:var(--white); border:2px solid var(--ink); box-shadow:3px 3px 0 var(--yellow-deep); padding:7px 14px; font-weight:700; font-size:15px; text-decoration:none; }
  .metros a:hover { background:var(--yellow-deep); color:var(--ink); }
</style>
<script type="application/ld+json">
${JSON.stringify(svcSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faq, null, 2)}
</script>
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="../index.html">Home</a> / <a href="../locations.html">Locations</a> / ${name}</div>

<section class="page-hero photo" style="background-image:url('../assets/img/${hero}')"><div class="wrap">
  <span class="section-tag hand">// statewide — ${name.toLowerCase()}</span>
  <h1>${name} <span class="y">Heavy Haul, Rigging &amp; Freight</span></h1>
  <p class="lead">Rigging, heavy haul transportation, truck dispatching, and freight moving across ${name} — anchored in ${cityList} and working statewide. If it is oversized, overweight, or on a deadline, it is our kind of load.</p>
  <div class="cta-row" style="margin-top:24px;"><a class="btn" href="../contact.html">Get a ${name} Quote</a></div>
</div>
  <span class="annot hand tag warn a1">${st} • STATEWIDE</span>
  <span class="annot hand a4">${meta.ix.split(',')[0]} CORRIDOR ✓</span>
</section>

<section class="notes-bg">
  <span class="bgnote" style="top:12%;right:5%;transform:rotate(-4deg)">${st} DOT PERMITS ✓</span>
  <span class="bgnote" style="top:48%;left:3%;transform:rotate(3deg)">${meta.ix} CORRIDORS</span>
  <span class="bgnote" style="bottom:12%;right:7%;transform:rotate(-3deg)">STATEWIDE ✓</span>
  <div class="wrap prose">
  <h2>Heavy haul &amp; rigging across ${name}</h2>
  <p>${site.brand} runs rigging, heavy haul, dispatch, and freight moving throughout ${name}, with local coverage built around ${cityList}. The state's freight moves on the ${meta.ix} corridors, and our crews move with it — machinery, oversize loads, plant relocations, and everyday FTL and LTL freight in the ${industries} ${plural ? 'markets' : 'market'}.</p>
  <p>Every oversize or overweight move through ${name} needs to be legal on every mile: state permits, routing around restricted bridges, travel-time windows, and escorts where dimensions require them. We handle the ${name} DOT paperwork, the route survey, and the pilot cars as part of the job — read our <a href="../blog/oversize-load-permits-guide.html">permit guide</a> and <a href="../blog/how-much-does-heavy-haul-cost.html">cost guide</a> for what to expect, then send us the load.</p>
</div></section>

<section class="bg-paper notes-bg" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);">
  <span class="bgnote" style="top:10%;right:4%;transform:rotate(-4deg)">RIG · HAUL · DISPATCH · FREIGHT</span>
  <span class="bgnote" style="top:52%;left:3%;transform:rotate(3deg)">NEAREST CREW →</span>
  <span class="bgnote" style="bottom:10%;right:6%;transform:rotate(-3deg)">OVERSIZE • OVERWEIGHT</span>
  <div class="wrap">
  <span class="section-tag hand">where we work in ${name}</span>
  <h2 class="section-title">${name} ${plural ? 'cities' : 'coverage'}</h2>
  <div class="grid-services">${cityCards}
  </div>
  ${townsSample.length ? `<p style="margin-top:24px;font-weight:600;">Also moving freight near ${townsSample.join(', ')} — and everywhere in between. <a href="../contact.html" style="color:var(--yellow-deep);text-decoration:underline;">Tell us where</a>.</p>` : ''}
</div></section>

<section class="notes-bg">
  <span class="bgnote" style="top:14%;right:5%;transform:rotate(-4deg)">EVERY MILE LEGAL ✓</span>
  <span class="bgnote" style="bottom:12%;left:4%;transform:rotate(4deg)">48 LOCATIONS NATIONWIDE</span>
  <div class="wrap">
  <span class="section-tag hand">on the map</span>
  <h2 class="section-title">${name} coverage map</h2>
  <p class="section-intro">Statewide ${name} — rigging, heavy haul, dispatch, and freight moving, backed by a nationwide network of 48 locations.</p>
  <div class="map-frame" style="margin-top:24px;">
    <iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${name} heavy haul coverage map" src="https://maps.google.com/maps?q=${mapQ}&z=6&output=embed"></iframe>
  </div>
</div></section>

<div class="photo-band" style="background-image:url('../assets/img/${band}')">
  <span class="annot hand tag a1">${name.toUpperCase()} ✓</span>
  <span class="annot hand a6">OVERSIZE • OVERWEIGHT</span>
</div>

<section class="bg-paper notes-bg" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);">
  <span class="bgnote" style="top:14%;right:5%;transform:rotate(-4deg)">PERMITTED &amp; PILOTED</span>
  <span class="bgnote" style="top:52%;left:3%;transform:rotate(3deg)">MEASURE TWICE — HAUL ONCE</span>
  <span class="bgnote" style="bottom:10%;right:6%;transform:rotate(-3deg)">SAME-DAY QUOTE</span>
  <div class="wrap">
  <span class="section-tag hand">questions</span>
  <h2 class="section-title">${name} heavy haul FAQ</h2>
  <div class="faq">
    <details open><summary>Do you cover all of ${name}?</summary><div class="a">Yes — statewide, anchored in ${cityList} with the national network behind it. <a href="../contact.html">Get a quote →</a></div></details>
    <details><summary>Can you handle oversize &amp; overweight permits in ${name}?</summary><div class="a">Yes — ${name} DOT permitting, route surveys, clearances, and escort coordination are part of every heavy haul move we run.</div></details>
    <details><summary>What cities do you serve in ${name}?</summary><div class="a">${plural ? cityList + ' each have a dedicated local page below — and we work statewide.' : cityList + ' is our ' + name + ' hub — and we work statewide.'} <a href="../locations.html">All locations →</a></div></details>
    <details><summary>How fast can you quote a ${name} load?</summary><div class="a">Send dimensions, weight, pickup, and destination — ${name} quotes usually turn around same day.</div></details>
  </div>
  ${neighborChips ? `<h3 style="margin-top:34px;font-size:22px;">Nearby states we cover across ${meta.region}</h3><div class="metros">${neighborChips}</div>` : ''}
</div></section>

<div class="cta-band"><div class="wrap" style="padding-top:56px;padding-bottom:56px;text-align:center;">
  <h2>Moving something through ${name}?</h2>
  <p>Tell us the load and the lane. We will route the nearest crew and quote it fast.</p>
  <a class="btn dark" href="../contact.html">Get a ${name} Quote</a>
</div></div>
${FOOTER}

</body>
</html>`;
}

// ---- build ----
const byState = {};
locations.forEach(l => { (byState[l.state] = byState[l.state] || []).push(l); });
const states = Object.keys(byState).sort((a, b) => STATE[a].name.localeCompare(STATE[b].name));

const outDir = path.join(ROOT, 'locations');
states.forEach((st, i) => {
  fs.writeFileSync(path.join(outDir, `${stateSlug(st)}.html`), cleanUrls(statePage(st, byState[st], i, states)));
});
console.log(`✓ Built ${states.length} state hub pages in /locations`);

// ---- inject "Browse by state" chips into locations.html (idempotent) ----
const locPath = path.join(ROOT, 'locations.html');
let locHtml = fs.readFileSync(locPath, 'utf8');
const chips = states.map(st => `<a href="locations/${stateSlug(st)}.html">${STATE[st].name}</a>`).join('');
const block = `<!--STATE_CHIPS_START-->
  <div style="margin-top:38px;">
    <span class="section-tag hand">browse by state</span>
    <h2 class="section-title" style="font-size:28px;">Statewide coverage pages</h2>
    <div class="metros" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;">${chips}</div>
    <style>.metros a{background:var(--ink);color:var(--white);border:2px solid var(--ink);box-shadow:3px 3px 0 var(--yellow-deep);padding:7px 14px;font-weight:700;font-size:15px;text-decoration:none;}.metros a:hover{background:var(--yellow-deep);color:var(--ink);}</style>
  </div>
  <!--STATE_CHIPS_END-->`;
if (locHtml.includes('<!--STATE_CHIPS_START-->')) {
  locHtml = locHtml.replace(/<!--STATE_CHIPS_START-->[\s\S]*?<!--STATE_CHIPS_END-->/, block);
} else {
  locHtml = locHtml.replace('<!--LOC_GRID_END-->', `<!--LOC_GRID_END-->\n  ${block}`);
}
fs.writeFileSync(locPath, cleanUrls(locHtml));
console.log('✓ Injected state chips into locations.html');
console.log('  States:', states.map(s => STATE[s].name).join(', '));
