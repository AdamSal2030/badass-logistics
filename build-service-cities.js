#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — SERVICE × CITY matrix generator
   Templatized from the signed-off gold-standard page
   services/cnc-machine-movers/detroit-mi.html.

   Produces services/<service-slug>/<city-slug>.html for each
   (service, metro) in the WAVES config below, then:
     - rewrites each service pillar's "metros" grid (sentinels)
     - appends the service×city URLs to sitemap.xml (idempotent)
     - writes data/service-cities.json (manifest)

   UNIQUENESS ENGINE: every page weaves the metro's REAL local
   data — industry angle (data/metros.json), nearby suburbs
   (data/locations.json), and the state's Interstates + DOT
   permit language — so pages are genuinely local, not token-swaps.

   Run order:  node build-locations.js && node build-states.js &&
               node build-blog.js && node build-service-cities.js && node seo-polish.js
   Re-run any time:  node build-service-cities.js
   =========================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const locations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locations.json'), 'utf8'));
const metrosFile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/metros.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);
const DOMAIN = site.domain;

// ---- state facts (interstates + name) for routing/permits ----
const STATE = {
  CA:{name:'California',ix:'I-5, I-10, I-15 and I-80'}, OR:{name:'Oregon',ix:'I-5 and I-84'}, WA:{name:'Washington',ix:'I-5, I-90 and I-82'}, NV:{name:'Nevada',ix:'I-15 and I-80'},
  AZ:{name:'Arizona',ix:'I-10, I-17 and I-40'}, NM:{name:'New Mexico',ix:'I-25, I-40 and I-10'}, CO:{name:'Colorado',ix:'I-25, I-70 and I-76'}, UT:{name:'Utah',ix:'I-15, I-80 and I-70'},
  ID:{name:'Idaho',ix:'I-84, I-86 and I-15'}, MT:{name:'Montana',ix:'I-90, I-94 and I-15'}, WY:{name:'Wyoming',ix:'I-25, I-80 and I-90'}, ND:{name:'North Dakota',ix:'I-29 and I-94'},
  NE:{name:'Nebraska',ix:'I-80 and I-29'}, MN:{name:'Minnesota',ix:'I-35, I-90 and I-94'}, MO:{name:'Missouri',ix:'I-70, I-44, I-35 and I-29'}, WI:{name:'Wisconsin',ix:'I-94, I-43 and I-90'},
  IL:{name:'Illinois',ix:'I-55, I-80, I-90 and I-94'}, IN:{name:'Indiana',ix:'I-65, I-70 and I-69'}, MI:{name:'Michigan',ix:'I-75, I-94 and I-96'}, OH:{name:'Ohio',ix:'I-70, I-71, I-75 and I-90'},
  TX:{name:'Texas',ix:'I-10, I-20, I-35 and I-45'}, OK:{name:'Oklahoma',ix:'I-35, I-40 and I-44'}, AR:{name:'Arkansas',ix:'I-40, I-30 and I-55'}, LA:{name:'Louisiana',ix:'I-10, I-12, I-20 and I-49'},
  MS:{name:'Mississippi',ix:'I-55, I-20, I-10 and I-59'}, AL:{name:'Alabama',ix:'I-65, I-20, I-10 and I-59'}, TN:{name:'Tennessee',ix:'I-40, I-65, I-24 and I-75'}, GA:{name:'Georgia',ix:'I-75, I-85, I-20 and I-95'},
  SC:{name:'South Carolina',ix:'I-95, I-26, I-85 and I-20'}, NC:{name:'North Carolina',ix:'I-40, I-85, I-95 and I-77'}, FL:{name:'Florida',ix:'I-95, I-75, I-10 and I-4'}, KY:{name:'Kentucky',ix:'I-65, I-64, I-75 and I-71'},
  VA:{name:'Virginia',ix:'I-95, I-64, I-81 and I-66'}, MD:{name:'Maryland',ix:'I-95, I-70 and I-83'}, PA:{name:'Pennsylvania',ix:'I-76, I-80, I-81 and I-95'}, NY:{name:'New York',ix:'I-87, I-90, I-95 and I-81'}, MA:{name:'Massachusetts',ix:'I-90, I-95 and I-93'},
};
const stateName = (st) => (STATE[st] && STATE[st].name) || st;
const interstates = (st) => (STATE[st] && STATE[st].ix) || 'the Interstate system';

// ---- lookups from existing data ----
const citySlug = (city, st) => `${city.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${st.toLowerCase()}`;
const locByKey = {}; locations.forEach(l => { locByKey[`${l.city}|${l.state}`] = l; });
const metroByKey = {}; metrosFile.metros.forEach(m => { metroByKey[`${m.city}|${m.state}`] = m; });

// ---- UNIQUENESS ENGINE: real local machining angle from the metro's industry ----
function machiningAngle(industry) {
  const i = (industry || '').toLowerCase();
  if (/auto|tool-and-die|tool and die/.test(i)) return 'the auto-supplier machine shops and tool-and-die houses';
  if (/semiconductor|silicon/.test(i)) return 'the semiconductor fabs and precision-tool shops';
  if (/aerospace|aviation|defense/.test(i)) return 'the aerospace and defense machining shops';
  if (/oil|petrochem|energy|lng|refin/.test(i)) return 'the energy-sector fabrication and machine shops';
  if (/steel|metal|foundry/.test(i)) return 'the metal-fabrication and machining shops';
  if (/port|distribution|logistics|rail/.test(i)) return 'the manufacturers and machine shops behind the freight';
  if (/ag|food/.test(i)) return 'the ag-equipment and food-processing machine shops';
  if (/pharma|biotech|medical/.test(i)) return 'the precision and medical-device machining shops';
  if (/paper|packaging|polymer|rubber|glass/.test(i)) return 'the process-line and machining shops';
  return 'the manufacturing and machine-shop base';
}

const NAVLINKS = [
  ['/services/rigging','Rigging'],['/services/heavy-haul','Heavy Haul'],['/services/machinery-moving','Machinery Moving'],
  ['/services/cnc-machine-movers','CNC Movers'],['/trailer-moves','Trailer Moves'],['/locations','Locations'],['/blog/','Blog'],['/about','About'],
];
const NAV = `
<div class="topbar"><div class="wrap"><div>📍 48 locations nationwide &nbsp;·&nbsp; <strong>All 50 states</strong></div><div><a href="tel:3072841045">📞 (307) 284-1045</a> &nbsp;·&nbsp; <a href="/contact"><strong>Get a Quote</strong></a></div></div></div>
<header class="site-header"><div class="wrap">
  <a class="logo" href="/"><span class="brand"><span class="l1">BADASS</span><span class="l2">LOGISTICS</span></span></a>
  <button class="nav-toggle" aria-label="Menu" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
  <nav class="main" id="nav">
    <a href="/">Home</a>${NAVLINKS.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')}
    <a class="btn" style="font-size:14px;padding:9px 16px;box-shadow:3px 3px 0 var(--ink)" href="/contact">Get a Quote</a>
  </nav>
</div></header>`;
const FOOTER = `
<footer><div class="wrap"><div class="cols">
  <div><h4>Badass Logistics</h4><p style="opacity:.85;max-width:280px;">Rigging, heavy haul, dispatch &amp; freight moving. One-stop shop for everything oversized and overweight.</p></div>
  <div><h4>Services</h4><a href="/services/rigging">Industrial Rigging</a><a href="/services/heavy-haul">Heavy Haul Transport</a><a href="/services/machinery-moving">Machinery Moving</a><a href="/services/cnc-machine-movers">CNC Machine Movers</a><a href="/services/dispatching">Truck Dispatching</a><a href="/services/freight-moving">Freight Moving</a></div>
  <div><h4>Company</h4><a href="/about">About Us</a><a href="/trailer-moves">Trailer Moves</a><a href="/locations">Locations</a><a href="/blog/">Blog</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div>
</div><div class="covstrip">Coverage: <a href="/locations/texas">Texas</a> · <a href="/locations/california">California</a> · <a href="/locations/florida">Florida</a> · <a href="/locations/georgia">Georgia</a> · <a href="/locations/illinois">Illinois</a> · <a href="/locations/ohio">Ohio</a> · <a href="/locations/pennsylvania">Pennsylvania</a> · <a href="/locations/new-york">New York</a> · <a href="/locations"><strong>All 48 locations →</strong></a></div><div class="footer-nap"><span class="nap-name">Badass Logistics</span><span>${site.hqStreet}, ${site.hqCity}, ${site.hqState} ${site.hqZip}</span><span><a href="tel:3072841045">(307) 284-1045</a></span><span><a href="mailto:rigging@badasslogistics.com">rigging@badasslogistics.com</a></span></div>
<div class="legal"><span>© 2022–2026 Badass Logistics. All rights reserved.</span><span class="hand">made to move heavy things.</span></div></div></footer>`;

// ---- SERVICES config (add a block here to expand the matrix to a new service) ----
const SERVICES = {
  'cnc-machine-movers': {
    name: 'CNC Machine Movers',
    serviceType: 'CNC Machine Moving',
    noun: 'CNC machine',
    hero: '/assets/img/loads/load-machine-loadout.jpg',
    band: '/assets/img/rigging-crane.jpg',
    tag: 'cnc machine movers',
    moves: [
      ['production machining','Production Machining','VMCs, HMCs, and transfer lines'],
      ['turning','CNC Lathes','Flat-bed and slant-bed lathes and multi-axis turning centers'],
      ['grinding','Grinders &amp; EDM','Surface, cylindrical, and CNC grinders plus wire and sinker EDM'],
      ['cells &amp; shops','Full Shop Relocations','Multi-machine cells and complete machine-shop moves'],
    ],
    pillarSentinel: 'CNC_METROS',
    pillarFile: 'services/cnc-machine-movers.html',
  },
};

function page(serviceSlug, svc, loc, metro) {
  const { city, state } = loc;
  const CS = `${city}, ${state}`;
  const slug = citySlug(city, state);
  const stName = stateName(state);
  const ix = interstates(state);
  const angle = machiningAngle(metro && metro.industry);
  const near = (loc.near || []).slice(0, 12);
  const url = `${DOMAIN}/services/${serviceSlug}/${slug}`;
  const cityHub = `/locations/${slug}`;
  const mapQ = encodeURIComponent(CS);
  const title = `${svc.name} in ${CS} | Machine Tool Moving | Badass Logistics`;
  const desc = `${svc.name} in ${CS}. We move VMCs, HMCs, lathes, and full machine shops across ${city} and the surrounding metro — OEM lift points, air-ride transport, and re-leveling to spec. Fast quotes.`;

  const svcSchema = {
    "@context":"https://schema.org","@type":"Service","serviceType":svc.serviceType,
    "areaServed":{"@type":"City","name":CS},
    "provider":{"@type":"LocalBusiness","@id":`${DOMAIN}/#organization`,"name":site.brand,"telephone":"+1-307-284-1045","url":`${DOMAIN}/`},
    "description":`${site.brand} provides ${svc.serviceType.toLowerCase()} across ${CS} and the surrounding metro — machine tools moved and re-leveled to specification.`
  };
  const breadcrumb = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":`${DOMAIN}/`},
    {"@type":"ListItem","position":2,"name":svc.name,"item":`${DOMAIN}/services/${serviceSlug}`},
    {"@type":"ListItem","position":3,"name":CS,"item":url},
  ]};
  const faq = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
    {"@type":"Question","name":`Do you move CNC machines in ${city}?`,"acceptedAnswer":{"@type":"Answer","text":`Yes — ${svc.serviceType.toLowerCase()} throughout ${CS} and the surrounding metro, serving ${angle}. Single machines, multi-machine cells, and full machine-shop relocations.`}},
    {"@type":"Question","name":`How much does it cost to move a CNC machine in ${city}?`,"acceptedAnswer":{"@type":"Answer","text":`It depends on the machine's weight and class, rigging access at both shops, the distance across the metro, and how much disconnect and re-level work is needed. Send the model and both floor layouts for an accurate ${city} quote.`}},
    {"@type":"Question","name":`Can you handle ${stName} oversize permits for a large machine?`,"acceptedAnswer":{"@type":"Answer","text":`Yes. When a crated machine exceeds legal dimensions on the ${ix} corridors, we handle the ${stName} DOT oversize/overweight permitting, routing, and escorts as part of the move.`}},
    {"@type":"Question","name":"Do you re-level the machine after the move?","acceptedAnswer":{"@type":"Answer","text":`Always. The machine is set on its new pad in ${city} and leveled and squared to the builder's specification before hand-off, ready for OEM ramp-up and first cut.`}}
  ]};

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141414">
<meta property="og:type" content="website">
<meta property="og:title" content="${svc.name} in ${CS} | Badass Logistics">
<meta property="og:description" content="${city} ${svc.serviceType.toLowerCase()} — VMCs, HMCs, lathes, and full machine shops moved and re-leveled to spec.">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${DOMAIN}${svc.hero}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${svc.name} in ${CS} | Badass Logistics">
<meta name="twitter:description" content="${city} ${svc.serviceType.toLowerCase()} — machine tools moved and re-leveled to spec.">
<meta name="twitter:image" content="${DOMAIN}${svc.hero}">
<link rel="sitemap" type="application/xml" href="${DOMAIN}/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap"></noscript>
<link rel="icon" href="/assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="/css/styles.css">
<style>
  .map-frame { border:3px solid var(--ink); box-shadow:var(--shadow); background:var(--white); overflow:hidden; }
  .map-frame iframe { width:100%; height:380px; border:0; display:block; filter:grayscale(.15) contrast(1.05); }
  .towns { display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; }
  .towns span { background:var(--white); border:2px solid var(--ink); box-shadow:3px 3px 0 var(--ink); padding:7px 14px; font-weight:600; font-size:15px; }
</style>
<script type="application/ld+json">
${JSON.stringify(svcSchema,null,2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb,null,2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faq,null,2)}
</script>
<link rel="preload" as="image" href="${svc.hero}" fetchpriority="high">
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="/">Home</a> / <a href="/services/${serviceSlug}">${svc.name}</a> / ${CS}</div>

<section class="page-hero photo" style="background-image:url('${svc.hero}')"><div class="wrap">
  <span class="section-tag hand">// ${svc.tag} — ${city.toLowerCase()}</span>
  <h1>${svc.name} in <span class="y">${CS}</span></h1>
  <p class="lead">${city} runs on ${angle} — and their tolerances don't get a day off. We move VMCs, HMCs, lathes, and full machine shops across the ${city} metro, lifted from the OEM's points, hauled on air-ride, and re-leveled to spec so the spindle cuts true the morning you power back up.</p>
  <div class="cta-row" style="margin-top:24px;"><a class="btn" href="/contact">Get a ${city} CNC Quote</a></div>
</div>
  <span class="annot hand tag warn a1">${state} • MACHINE TOOLS</span>
  <span class="annot hand a4">${city.toUpperCase()} ✓</span>
</section>

<section><div class="wrap prose">
  <h2>Machine-tool moving in ${CS}</h2>
  <p>${(metro && metro.industry) ? `${city}'s industrial base — ${metro.industry} — runs on CNC.` : `${city} runs on CNC.`} Machining centers, lathes, grinders, and the job shops that feed them count on precision, and when one of those machines has to move — a line consolidation, a shop expansion, a new building — it can't be muscled like a pallet. It's an instrument that holds ten-thousandths, and it has to come back online holding them.</p>
  <p>That's the job Badass Logistics is built for in ${city}. We pull the manufacturer's lift and jacking data before a wrench turns, protect the ways, lock the axes and spindle, and move on air skates and air-ride — then set, level, and square the machine to spec at the new floor. One accountable crew from disconnect to first cut, and because we run <a href="/services/rigging">rigging</a> and <a href="/services/heavy-haul">heavy haul</a> in-house, an oversized machining center gets moved and permitted without a hand-off.</p>
</div></section>

<section class="bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);"><div class="wrap">
  <span class="section-tag hand">what we move in ${city}</span>
  <h2 class="section-title">${city} CNC &amp; machine-tool moves</h2>
  <div class="cap-grid">
    ${svc.moves.map(([k,h,p])=>`<div class="cap"><div class="k">${k}</div><h3>${h}</h3><p>${p} across the ${city} metro.</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="notes-bg">
  <span class="bgnote" style="top:10%;right:5%;transform:rotate(-4deg)">${ix.split(',')[0]} CORRIDOR</span>
  <span class="bgnote" style="bottom:12%;left:4%;transform:rotate(4deg)">${state} DOT PERMIT ✓</span>
  <div class="wrap prose">
  <h2>Routes &amp; permits across the ${city} metro</h2>
  <p>Most CNC moves around ${city} run the ${ix} corridors that knit the metro's industrial belt together. A machine that's legal-dimension once crated just gets hauled; a large crated machining center that runs over height or width needs to be legal on every mile. We handle the ${stName} DOT oversize/overweight permitting, route survey, clearance checks, and any escorts as part of the job — so a five-axis cell leaving ${city} gets to its new floor on a compliant route the first time.</p>
</div></section>

<section><div class="wrap">
  <span class="section-tag hand">on the map</span>
  <h2 class="section-title">${city} CNC machine movers</h2>
  <p class="section-intro">Working throughout ${CS} and the surrounding metro — and backed by a nationwide network of 48 locations when a machine has to cross state lines.</p>
  <div class="map-frame" style="margin-top:24px;">
    <iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${CS} CNC machine movers map" src="https://maps.google.com/maps?q=${mapQ}&z=10&output=embed"></iframe>
  </div>
</div></section>

${near.length ? `<section class="notes-bg bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);">
  <span class="bgnote" style="top:10%;right:5%;transform:rotate(-4deg)">${state}</span>
  <span class="bgnote" style="bottom:10%;left:4%;transform:rotate(4deg)">NEAREST CREW →</span>
  <div class="wrap">
  <span class="section-tag hand">metro coverage</span>
  <h2 class="section-title">CNC machine moving near ${city}</h2>
  <p class="section-intro">Machine-tool moves throughout ${city} and the surrounding manufacturing suburbs — including:</p>
  <div class="towns">${near.map(t=>`<span>${t}</span>`).join('')}</div>
  <p style="margin-top:22px;font-weight:600;">Moving a machine across the metro or out of state? See <a href="${cityHub}" style="color:var(--yellow-deep);text-decoration:underline;">all our ${city} services</a> or <a href="/contact" style="color:var(--yellow-deep);text-decoration:underline;">get a quote</a>.</p>
</div></section>` : ''}

<section class="bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);"><div class="wrap">
  <span class="section-tag hand">questions</span>
  <h2 class="section-title">${city} CNC moving FAQ</h2>
  <div class="faq">
    <details open><summary>Do you move CNC machines in ${city}?</summary><div class="a">Yes — throughout ${CS} and the surrounding metro, serving ${angle}. Single machines, cells, and full shop relocations. <a href="/contact">Get a quote →</a></div></details>
    <details><summary>How much does it cost to move a CNC machine in ${city}?</summary><div class="a">It depends on weight and class, rigging access at both shops, distance across the metro, and the disconnect and re-level work involved. Send the model and both floor layouts and we'll turn a ${city} quote around fast.</div></details>
    <details><summary>Can you handle ${stName} oversize permits?</summary><div class="a">Yes — when a crated machine runs over legal dimensions on ${ix}, we handle ${stName} DOT permitting, routing, and escorts as part of the move.</div></details>
    <details><summary>Do you re-level the machine after transit?</summary><div class="a">Always — set on the new pad and squared to the builder's spec before hand-off, ready for OEM ramp-up and first cut.</div></details>
  </div>
</div></section>

<div class="photo-band" style="background-image:url('${svc.band}')">
  <span class="annot hand tag a1">${city.toUpperCase()} ✓</span>
  <span class="annot hand a6">TOLERANCE HELD</span>
</div>

<div class="cta-band"><div class="wrap" style="padding-top:56px;padding-bottom:56px;text-align:center;">
  <h2>Need a CNC machine moved in ${city}?</h2>
  <p>Send the model and both floor plans. We'll route the nearest crew and quote it fast.</p>
  <a class="btn dark" href="/contact">Get a ${city} CNC Quote</a>
</div></div>
${FOOTER}

</body>
</html>`;
}

// ---- WAVES: which (service × metros) to build this run ----
const WAVES = {
  'cnc-machine-movers': ['Detroit|MI','Chicago|IL','Houston|TX','Dallas|TX','Cleveland|OH','Charlotte|NC','Indianapolis|IN','Columbus|OH','Milwaukee|WI','Nashville|TN','Pittsburgh|PA','Minneapolis|MN'],
};

// ---- build ----
const manifest = [];
for (const [serviceSlug, keys] of Object.entries(WAVES)) {
  const svc = SERVICES[serviceSlug];
  const outDir = path.join(ROOT, 'services', serviceSlug);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  for (const key of keys) {
    const loc = locByKey[key];
    if (!loc) { console.warn(`  ! skip ${key} — not in locations.json`); continue; }
    const metro = metroByKey[key];
    const slug = citySlug(loc.city, loc.state);
    fs.writeFileSync(path.join(outDir, `${slug}.html`), page(serviceSlug, svc, loc, metro));
    manifest.push({ service: serviceSlug, city: loc.city, state: loc.state, url: `/services/${serviceSlug}/${slug}` });
  }
  // rewrite the pillar's metro grid (sentinels)
  const pillarPath = path.join(ROOT, svc.pillarFile);
  if (fs.existsSync(pillarPath)) {
    let p = fs.readFileSync(pillarPath, 'utf8');
    const cards = keys.map(k => locByKey[k]).filter(Boolean).map(l => {
      const slug = citySlug(l.city, l.state);
      return `    <a class="svc-card" href="${serviceSlug}/${slug}"><div class="num">// ${l.state}</div><h3>${l.city}, ${l.state}</h3><p>${(l.near||[]).slice(0,3).join(' · ')}</p><span class="more">${l.city} CNC movers</span></a>`;
    }).join('\n');
    const S = `<!--${svc.pillarSentinel}_START-->`, E = `<!--${svc.pillarSentinel}_END-->`;
    if (p.includes(S) && p.includes(E)) {
      p = p.replace(new RegExp(`${S}[\\s\\S]*?${E}`), `${S}\n${cards}\n  ${E}`);
      fs.writeFileSync(pillarPath, p);
    }
  }
}

// ---- write manifest ----
fs.writeFileSync(path.join(ROOT, 'data/service-cities.json'), JSON.stringify(manifest, null, 2) + '\n');

// ---- append URLs to sitemap.xml (idempotent, between sentinels) ----
const smPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(smPath)) {
  let sm = fs.readFileSync(smPath, 'utf8');
  const block = manifest.map(m =>
    `  <url><loc>${DOMAIN}${m.url}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
  const wrapped = `  <!--SVC_CITIES_START-->\n${block}\n  <!--SVC_CITIES_END-->`;
  sm = sm.replace(/\s*<!--SVC_CITIES_START-->[\s\S]*?<!--SVC_CITIES_END-->/, '');
  sm = sm.replace('</urlset>', `${wrapped}\n</urlset>`);
  fs.writeFileSync(smPath, sm);
}

console.log(`✓ Built ${manifest.length} service×city pages`);
manifest.forEach(m => console.log(`   - /services/${m.service}/${citySlug(m.city, m.state)}`));
console.log(`✓ Updated pillar metro grids + sitemap.xml + data/service-cities.json`);
