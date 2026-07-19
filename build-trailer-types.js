#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — TRAILER / TRUCK-TYPE hub pages
   Distinct national service pages for each heavy-haul trailer type
   (RGN, lowboy, step-deck, double-drop/stretch, flatbed, multi-axle).
   These are genuinely different topics — NOT near-duplicate city pages —
   so they rank for "RGN transport", "lowboy trailer", "step deck", etc.
   without cannibalizing the heavy-haul city matrix.

   Writes services/<slug>.html, injects a trailer-types grid into
   services/heavy-haul.html (sentinel), and appends to sitemap.xml.
   =========================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const locations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locations.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);
const DOMAIN = site.domain;
const citySlug = (city, st) => `${city.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${st.toLowerCase()}`;
const topMetros = locations.slice(0, 10);

const NAV = `
<div class="topbar"><div class="wrap"><div>📍 88 locations nationwide &nbsp;·&nbsp; <strong>All 50 states</strong></div><div><a href="tel:3072841332">📞 (307) 284-1332</a> &nbsp;·&nbsp; <a href="/contact"><strong>Get a Quote</strong></a></div></div></div>
<header class="site-header"><div class="wrap">
  <a class="logo" href="/"><span class="brand"><span class="l1">BADASS</span><span class="l2">LOGISTICS</span></span></a>
  <button class="nav-toggle" aria-label="Menu" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
  <nav class="main" id="nav">
    <a href="/">Home</a><a href="/services/rigging">Rigging</a><a href="/services/heavy-haul">Heavy Haul</a><a href="/services/machinery-moving">Machinery Moving</a><a href="/services/cnc-machine-movers">CNC Movers</a><a href="/locations">Locations</a><a href="/blog/">Blog</a><a href="/about">About</a>
    <a class="btn" style="font-size:14px;padding:9px 16px;box-shadow:3px 3px 0 var(--ink)" href="/contact">Get a Quote</a>
  </nav>
</div></header>`;
const FOOTER = `
<footer><div class="wrap"><div class="cols">
  <div><h4>Badass Logistics</h4><p style="opacity:.85;max-width:280px;">Industrial rigging &amp; heavy haul — our own crews, machinery, and rigging gear, plus a network of specialized carriers for everything oversized and overweight.</p></div>
  <div><h4>Trailer Types</h4><a href="/services/rgn-trailer">RGN Transport</a><a href="/services/lowboy-trailer">Lowboy Transport</a><a href="/services/step-deck-trailer">Step-Deck Transport</a><a href="/services/double-drop-trailer">Double-Drop &amp; Stretch</a><a href="/services/flatbed-transport">Flatbed Transport</a><a href="/services/multi-axle-transport">Multi-Axle &amp; Superload</a></div>
  <div><h4>Company</h4><a href="/about">About Us</a><a href="/locations">Locations</a><a href="/blog/">Blog</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div>
</div><div class="footer-nap"><span class="nap-name">Badass Logistics</span><span>${site.hqStreet}, ${site.hqCity}, ${site.hqState} ${site.hqZip}</span><span><a href="tel:3072841332">(307) 284-1332</a></span><span><a href="mailto:rigging@badasslogistics.com">rigging@badasslogistics.com</a></span></div></div></footer>`;

// ---------- TRAILER TYPES (genuinely distinct copy) ----------
const TRAILERS = [
  {
    slug:'rgn-trailer', name:'RGN Trailer Transport', h1:'RGN Trailer <span class="y">Transport</span>',
    serviceType:'RGN (Removable Gooseneck) Heavy Haul', hero:'/assets/img/rgn-load.jpg', tag:'removable gooseneck',
    lead:`The RGN is the go-to trailer for tall, heavy equipment that rolls on under its own power. The gooseneck detaches and the deck drops to the ground, turning the trailer into a ramp — so an excavator or dozer drives straight on, no crane needed.`,
    quick:`An RGN (removable gooseneck) trailer has a detachable front neck that lowers the deck to the ground so self-propelled equipment can drive on and off. Its low drop-center deck carries tall, heavy machines legally, and extra axles can be added for heavier loads.`,
    what:[`On an RGN, the front "gooseneck" hydraulically detaches and lays the front of the deck on the ground, creating a built-in ramp. Rolling stock climbs on, the neck reconnects, and the load rides on a low drop-center deck — typically around 18–24 inches off the ground — that keeps tall machines under legal height.`,
      `A standard 3-axle RGN handles roughly 40,000–50,000 lb, and by adding jeeps and boosters we push that well past 150,000 lb for heavier machines. It's the most versatile heavy-equipment trailer on the road — which is why it's the workhorse of construction and industrial moves.`],
    uses:[['Excavators &amp; Dozers','Track machines that drive on and off under their own power'],['Cranes &amp; Drills','Self-propelled equipment too tall for a step-deck'],['Wheeled Loaders &amp; Graders','Rolling stock loaded without a crane'],['Tall Heavy Machinery','Anything that needs a low deck and a drive-on ramp']],
    specs:[['Deck height','~18–24 in'],['Well length','~29 ft'],['Base config','3-axle, drive-on'],['With axles','150,000 lb+']],
    faq:[
      ['What is an RGN trailer?',`An RGN — removable gooseneck — is a heavy-haul trailer whose front neck detaches so the deck lowers to the ground as a ramp. Equipment drives on, the neck reattaches, and the low deck keeps tall, heavy machines legal.`],
      ['RGN vs lowboy — what\'s the difference?',`Both carry tall, heavy equipment on a low deck. The RGN\'s neck detaches so machines drive on and off; a classic <a href="/services/lowboy-trailer">lowboy</a> is usually crane-loaded and built for maximum height clearance. We pick whichever fits your machine and site.`],
      ['How heavy a load can an RGN carry?',`A base 3-axle RGN handles about 40,000–50,000 lb. Add jeeps and boosters and we haul well over 150,000 lb — see <a href="/services/multi-axle-transport">multi-axle &amp; superload</a> transport.`],
      ['Do you handle permits and escorts for RGN loads?',`Yes — we handle oversize/overweight permitting, route surveys, and pilot cars or escorts wherever the states along your route require them.`],
    ],
  },
  {
    slug:'lowboy-trailer', name:'Lowboy Trailer Transport', h1:'Lowboy Trailer <span class="y">Transport</span>',
    serviceType:'Lowboy Heavy Haul', hero:'/assets/img/heavyhaul-load.jpg', tag:'maximum height clearance',
    lead:`When a load is too tall for anything else, it rides a lowboy. Its ultra-low deck sits just inches off the ground, buying the vertical clearance to move machinery that would otherwise blow past legal height limits.`,
    quick:`A lowboy trailer has a very low deck — often 18–24 inches off the ground — built to haul extremely tall, heavy equipment under legal height. It's crane- or ramp-loaded and rated for heavy machinery, with axles added for heavier loads.`,
    what:[`A lowboy drops the deck between two axle sets to the lowest practical height on the road. That extra clearance is everything: a machine that would stand 15 feet tall on a flatbed can ride legally on a lowboy, avoiding height permits and low-bridge reroutes.`,
      `Lowboys are built heavy — commonly rated from 40,000 lb up into the six figures with added axles. Where an <a href="/services/rgn-trailer">RGN</a> wins on drive-on convenience, the lowboy wins on sheer height clearance and load rating for the tallest, heaviest freight.`],
    uses:[['Tall Industrial Machinery','Equipment that exceeds legal height on any other trailer'],['Transformers &amp; Vessels','Heavy, tall industrial units'],['Construction Equipment','Crane-loaded machines needing low deck height'],['Oversized Fabrications','Tall welded and cast structures']],
    specs:[['Deck height','~18–24 in'],['Height clearance','Best in class'],['Loading','Crane or ramp'],['With axles','100,000 lb+']],
    faq:[
      ['What is a lowboy trailer?',`A lowboy is a heavy-haul trailer with a very low deck between its axle sets, designed to move extremely tall, heavy equipment under legal height limits. It's the trailer of choice when clearance is the constraint.`],
      ['How tall a load can a lowboy carry legally?',`Because the deck rides so low, a lowboy can often keep a load under the 13'6" legal height that would otherwise require height permits and rerouting. Exact numbers depend on the machine and the route — we check both before we quote.`],
      ['Lowboy or RGN for my machine?',`If the equipment drives on and off, an <a href="/services/rgn-trailer">RGN</a> is usually faster. If it's crane-loaded and the priority is maximum height clearance and load rating, a lowboy. We'll match the trailer to your machine.`],
      ['Do you permit and escort lowboy loads?',`Yes — full oversize/overweight permitting, route surveys, and pilot/escort coordination across every state on the route.`],
    ],
  },
  {
    slug:'step-deck-trailer', name:'Step-Deck Transport', h1:'Step-Deck &amp; Drop-Deck <span class="y">Transport</span>',
    serviceType:'Step-Deck (Drop-Deck) Transport', hero:'/assets/img/heavyhaul-real.jpg', tag:'drop deck',
    lead:`A step-deck buys you the height a flatbed can't. Its lower rear deck lets taller freight ride legally — often with no height permit — and ramps let equipment roll right on.`,
    quick:`A step-deck (or drop-deck) trailer has an upper and a lower deck. The lower deck sits closer to the ground so freight up to roughly 10 feet tall can ship within legal height, often without a permit. Loaded by crane, forklift, or drive-on ramps.`,
    what:[`A flatbed's deck is about 5 feet up, which caps legal freight height around 8'6". A step-deck drops to roughly 3.5 feet for its long lower deck, lifting the legal ceiling to about 10 feet — enough for a lot of machinery and equipment that a flatbed simply can't carry legally.`,
      `Step-decks load from the top and sides by crane or forklift, or by ramps for rolling equipment. They're the practical middle ground between a <a href="/services/flatbed-transport">flatbed</a> and a <a href="/services/lowboy-trailer">lowboy</a> — taller freight than a flatbed, without the cost and complexity of a full drop trailer.`],
    uses:[['Forklifts &amp; Telehandlers','Roll-on equipment within step-deck height'],['Mid-Height Machinery','Freight too tall for a flatbed, not tall enough to need a lowboy'],['Palletized Tall Freight','Crated equipment above flatbed-legal height'],['Building &amp; Structural Materials','Taller loads that still need open-deck access']],
    specs:[['Lower deck height','~3.5 ft'],['Legal freight height','~10 ft'],['Loading','Crane, forklift, ramps'],['Deck length','~48–53 ft']],
    faq:[
      ['What is a step-deck trailer?',`A step-deck (drop-deck) trailer has two deck levels — a short upper deck over the kingpin and a long lower deck closer to the ground — so it can carry freight taller than a flatbed can legally haul.`],
      ['Step-deck vs flatbed — when do I need one?',`If your freight is taller than about 8'6", a <a href="/services/flatbed-transport">flatbed</a> would put it over legal height. A step-deck's lower deck keeps freight up to ~10 ft legal, often without a height permit.`],
      ['Can equipment drive onto a step-deck?',`Yes — with ramps, rolling equipment like forklifts and telehandlers loads directly onto the lower deck.`],
      ['Do you handle any permits for step-deck loads?',`When a load still runs over-dimension, we handle the permitting, routing, and escorts. Many step-deck loads ship legal with none required — we confirm before we quote.`],
    ],
  },
  {
    slug:'double-drop-trailer', name:'Double-Drop & Stretch Transport', h1:'Double-Drop &amp; Stretch <span class="y">Transport</span>',
    serviceType:'Double-Drop & Extendable Transport', hero:'/assets/img/loads/load-oversize-tank.jpg', tag:'lowest deck / longest loads',
    lead:`For the tallest loads on the road, the double-drop's center well drops the deck to its lowest point — clearing height even a step-deck can't. Add a stretch and it carries the long stuff too.`,
    quick:`A double-drop trailer has a low center "well" between the front and rear decks, giving the lowest deck height for the tallest loads — up to roughly 11'6". Stretch (extendable) versions elongate to carry very long freight like beams and blades.`,
    what:[`The double-drop's well sits between the front deck and the rear axles, dropping to around 18–24 inches. That well is where the tallest freight rides, keeping loads legal up to about 11'6" without going oversize on height. The trade-off is well length — the tall portion has to fit the well.`,
      `Stretch and extendable double-drops solve the length problem: the trailer telescopes to support very long loads end to end instead of letting them overhang. It's the trailer for freight that's both tall and long — structural steel, bridge beams, wind components, and long fabrications.`],
    uses:[['Very Tall Machinery','Freight over step-deck height that must stay legal'],['Bridge Beams &amp; Girders','Long structural steel supported end to end'],['Wind &amp; Energy Components','Blades and tower sections on stretch configs'],['Long Fabrications','Oversized welded assemblies and vessels']],
    specs:[['Well deck height','~18–24 in'],['Legal freight height','~11\'6"'],['Stretch','Extendable length'],['Loading','Crane / ramp']],
    faq:[
      ['What is a double-drop trailer?',`A double-drop has a low center well between its front and rear decks, giving the lowest deck height of any common trailer — for the tallest legal loads, up to about 11'6".`],
      ['What is a stretch or extendable trailer?',`A stretch (extendable) trailer telescopes longer to support very long freight — beams, blades, and long fabrications — so the load rides supported instead of overhanging.`],
      ['Double-drop vs lowboy?',`A <a href="/services/lowboy-trailer">lowboy</a> is built for heavy, crane-loaded equipment; a double-drop's well is optimized for the tallest freight and, in stretch form, the longest. We match the trailer to the load's height, weight, and length.`],
      ['Do these loads need permits?',`Usually — tall and long loads often run oversize. We handle permitting, route surveys, and escorts across the route.`],
    ],
  },
  {
    slug:'flatbed-transport', name:'Flatbed Transport', h1:'Flatbed <span class="y">Transport</span>',
    serviceType:'Flatbed & Open-Deck Transport', hero:'/assets/img/loads/load-flatbed-steel.jpg', tag:'open deck',
    lead:`The workhorse. A level 48–53 ft deck, loadable from every side and the top, for steel, lumber, machinery, and any freight that fits legal height — plus plenty that runs over-width.`,
    quick:`A flatbed is an open, level trailer (typically 48–53 ft) with no sides, loaded by crane or forklift from any direction. It carries legal-height freight and over-width loads — steel, lumber, pipe, machinery, and building materials.`,
    what:[`With no walls or roof, a flatbed loads from the sides, the rear, or straight down by crane — the most flexible open-deck option there is. It carries freight up to about 8'6" tall and 8'6" wide legally, and we permit and flag anything that runs wider.`,
      `Flatbeds are the default for anything that doesn't need extra height clearance: structural steel, pipe, lumber, pallets of building material, and machinery within legal height. When freight gets taller, we step up to a <a href="/services/step-deck-trailer">step-deck</a> or <a href="/services/double-drop-trailer">double-drop</a>.`],
    uses:[['Steel, Pipe &amp; Rebar','Long, heavy material loaded from the side or top'],['Lumber &amp; Building Materials','Palletized and banded freight'],['Machinery (legal height)','Equipment that fits under 8\'6"'],['Over-Width Freight','Wide loads permitted and flagged']],
    specs:[['Deck length','48–53 ft'],['Legal height','~8\'6"'],['Legal width','~8\'6"'],['Loading','Any side / top']],
    faq:[
      ['What does a flatbed trailer carry?',`Open-deck freight loaded from any direction — steel, pipe, lumber, building materials, and machinery that fits within legal height. It's the most versatile trailer for freight that doesn't need extra clearance.`],
      ['Can a flatbed haul oversize loads?',`Yes — flatbeds handle over-width freight with permits and flags. For over-height freight we move to a <a href="/services/step-deck-trailer">step-deck</a> or <a href="/services/double-drop-trailer">double-drop</a> to keep it legal.`],
      ['How tall can flatbed freight be?',`Because the deck rides about 5 ft up, flatbed freight is generally capped near 8'6" tall to stay under the 13'6" legal limit. Taller than that and you want a drop trailer.`],
      ['Do you secure and tarp flatbed loads?',`Yes — proper securement to the working load limit, plus tarping where the freight or weather calls for it.`],
    ],
  },
  {
    slug:'multi-axle-transport', name:'Multi-Axle & Superload Transport', h1:'Multi-Axle &amp; Superload <span class="y">Transport</span>',
    serviceType:'Multi-Axle & Superload Heavy Haul', hero:'/assets/img/loads/load-oversize-tank.jpg', tag:'superload',
    lead:`When a load is heavier than the rules allow, weight gets spread across more axles. Jeeps, boosters, and multi-axle configurations turn an RGN or lowboy into a superload rig that keeps the heaviest freight legal.`,
    quick:`Multi-axle transport adds axles — jeeps ahead of the trailer and boosters behind — to spread the weight of superloads across more tires and stay within per-axle limits. It's how transformers, vessels, and the heaviest machinery move legally.`,
    what:[`Every road and bridge has a per-axle weight limit. When a load's total weight would overload a standard trailer's axles, we add them: a "jeep" between the tractor and trailer, "boosters" behind, and extra rows under the deck. Spreading the weight keeps every axle legal even when the total climbs into the hundreds of thousands of pounds.`,
      `These are superloads — moves that exceed standard oversize/overweight limits and demand engineered routing, bridge analysis, and often police escorts and utility coordination. We build the axle configuration to the load and the route, working from an <a href="/services/rgn-trailer">RGN</a> or <a href="/services/lowboy-trailer">lowboy</a> base.`],
    uses:[['Transformers','Extreme-weight electrical units'],['Pressure Vessels &amp; Reactors','Heavy industrial process equipment'],['Superload Machinery','Freight beyond standard overweight limits'],['Large Fabrications','The heaviest welded and cast structures']],
    specs:[['Base','RGN / lowboy'],['Added axles','Jeeps + boosters'],['Capacity','200,000 lb+'],['Routing','Engineered / bridge-analyzed']],
    faq:[
      ['What is a multi-axle or superload move?',`A superload exceeds standard oversize/overweight limits. Multi-axle transport adds jeeps and boosters to distribute the weight across more axles so the load stays within per-axle limits and moves legally.`],
      ['How heavy can you go?',`With enough axles, well past 200,000 lb. The exact configuration depends on the load weight, its footprint, and the axle limits along the route.`],
      ['What does a superload require?',`Engineered routing and bridge analysis, state superload permits, and usually police escorts and utility coordination. We manage the whole package.`],
      ['How far ahead should I book a superload?',`As early as possible — superload permits and route approvals take time. Send weight and dimensions and we'll start the routing.`],
    ],
  },
];

// (a) cross-link each trailer hub to the most relevant blog guide — pushes authority
// to the page-3 "mover" posts that are already pulling impressions (per GSC).
const GUIDES = {
  'rgn-trailer': ['how-to-ship-an-excavator', 'How to Ship an Excavator'],
  'lowboy-trailer': ['how-to-ship-a-generator', 'How to Ship a Generator'],
  'step-deck-trailer': ['step-deck-vs-drop-deck-trailers', 'Step-Deck vs Drop-Deck Trailers'],
  'double-drop-trailer': ['step-deck-vs-drop-deck-trailers', 'Step-Deck vs Drop-Deck Trailers'],
  'flatbed-transport': ['how-to-secure-a-load-on-a-flatbed', 'How to Secure a Load on a Flatbed'],
  'multi-axle-transport': ['how-to-ship-a-generator', 'How to Ship a Generator'],
};

function schema(t){
  const url = `${DOMAIN}/services/${t.slug}`;
  const svc = {"@context":"https://schema.org","@type":"Service","serviceType":t.serviceType,"areaServed":"United States","provider":{"@type":"LocalBusiness","@id":`${DOMAIN}/#organization`,"name":site.brand,"telephone":"+1-307-284-1332","url":`${DOMAIN}/`},"description":t.quick};
  const bc = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${DOMAIN}/`},{"@type":"ListItem","position":2,"name":"Heavy Haul","item":`${DOMAIN}/services/heavy-haul`},{"@type":"ListItem","position":3,"name":t.name,"item":url}]};
  const faq = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":t.faq.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a.replace(/<[^>]+>/g,'')}}))};
  return [svc,bc,faq].map(s=>`<script type="application/ld+json">\n${JSON.stringify(s)}\n</script>`).join('\n');
}

function hubPage(t){
  const url = `${DOMAIN}/services/${t.slug}`;
  const title = `${t.name} | Heavy Haul Trailers | Badass Logistics`;
  const desc = t.quick.slice(0,155);
  const others = TRAILERS.filter(x=>x.slug!==t.slug);
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
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${DOMAIN}${t.hero}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:image" content="${DOMAIN}${t.hero}">
<link rel="sitemap" type="application/xml" href="${DOMAIN}/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap"></noscript>
<link rel="icon" href="/assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="/css/styles.css">
<style>
  .specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0;border:3px solid var(--ink);box-shadow:var(--shadow);background:var(--white);margin-top:26px}
  .specs div{padding:16px 18px;border-right:2px solid var(--ink)}
  .specs div:last-child{border-right:0}
  .specs .k{font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.7;font-weight:700}
  .specs .v{font-family:'Anton',sans-serif;font-size:22px;margin-top:4px}
  .tt-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
  .tt-grid a{background:var(--white);border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);padding:8px 14px;font-weight:700;font-size:14px;text-decoration:none;color:var(--ink)}
</style>
${schema(t)}
<link rel="preload" as="image" href="${t.hero}" fetchpriority="high">
</head>
<body>
${NAV}
<div class="wrap breadcrumb"><a href="/">Home</a> / <a href="/services/heavy-haul">Heavy Haul</a> / ${t.name}</div>

<section class="page-hero photo" style="background-image:url('${t.hero}')"><div class="wrap">
  <span class="section-tag hand">// ${t.tag}</span>
  <h1>${t.h1}</h1>
  <p class="lead">${t.lead}</p>
  <div class="cta-row" style="margin-top:24px;"><a class="btn" href="/contact">Get a ${t.name.replace(' Transport','')} Quote</a></div>
</div></section>

<section class="notes-bg"><div class="wrap prose">
  <div class="answer-box"><p><strong>Quick answer:</strong> ${t.quick}</p></div>
  <h2>What is ${/^[AEIOU]/.test(t.name)?'an':'a'} ${t.name.replace(' Transport','').replace(' &amp; Superload','').replace(' &amp; Stretch','')}?</h2>
  ${t.what.map(p=>`<p>${p}</p>`).join('\n  ')}
  <div class="specs">
    ${t.specs.map(([k,v])=>`<div><div class="k">${k}</div><div class="v">${v}</div></div>`).join('\n    ')}
  </div>
</div></section>

<section><div class="wrap">
  <span class="section-tag hand">what it hauls</span>
  <h2 class="section-title">What we move on ${/^[AEIOU]/.test(t.name)?'an':'a'} ${t.name.replace(' Transport','')}</h2>
  <div class="grid-services" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr));">
    ${t.uses.map(([h,p])=>`<div class="svc-card static"><h3>${h}</h3><p>${p}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="notes-bg"><div class="wrap prose">
  <span class="section-tag hand">questions</span>
  <h2 class="section-title" style="margin-bottom:18px">${t.name.replace(' Transport','')} FAQs</h2>
  ${t.faq.map(([q,a])=>`<details class="faq"><summary>${q}</summary><div><p>${a}</p></div></details>`).join('\n  ')}
</div></section>

<section><div class="wrap">
  <span class="section-tag hand">also available</span>
  <h2 class="section-title">Other heavy-haul trailers</h2>
  <div class="tt-grid">
    ${others.map(o=>`<a href="/services/${o.slug}">${o.name.replace(' Transport','')}</a>`).join('\n    ')}
    <a href="/services/heavy-haul"><strong>All heavy haul →</strong></a>
  </div>
  ${GUIDES[t.slug] ? `<p class="section-intro" style="margin-top:16px">Related field guide: <a href="/blog/${GUIDES[t.slug][0]}" style="color:var(--yellow-deep);text-decoration:underline;">${GUIDES[t.slug][1]} →</a></p>` : ''}
  <p class="section-intro" style="margin-top:22px">Heavy haul in your metro: ${topMetros.map(m=>`<a href="/services/heavy-haul/${citySlug(m.city,m.state)}">${m.city}</a>`).join(' · ')} · <a href="/locations"><strong>all 48 →</strong></a></p>
</div></section>

<div class="cta-band"><div class="wrap" style="padding-top:56px;padding-bottom:56px;text-align:center;">
  <h2>Not sure which trailer your load needs?</h2>
  <p>Send dimensions, weight, and pickup/drop — we'll match the trailer and quote it fast.</p>
  <a class="btn dark" href="/contact">Get a Heavy Haul Quote</a>
</div></div>
${FOOTER}
</body>
</html>`;
}

// ---------- build ----------
const outDir = path.join(ROOT, 'services');
const built = [];
for (const t of TRAILERS){
  fs.writeFileSync(path.join(outDir, `${t.slug}.html`), hubPage(t));
  built.push(`/services/${t.slug}`);
}

// inject trailer-types grid into heavy-haul.html (sentinel)
const hhPath = path.join(outDir, 'heavy-haul.html');
if (fs.existsSync(hhPath)){
  let hh = fs.readFileSync(hhPath,'utf8');
  const grid = TRAILERS.map(t=>`    <a class="svc-card" href="${t.slug}"><div class="num">// trailer</div><h3>${t.name.replace(' Transport','')}</h3><p>${t.quick.slice(0,90)}…</p><span class="more">${t.name.replace(' Transport','')} →</span></a>`).join('\n');
  const S='<!--TRAILER_TYPES_START-->', E='<!--TRAILER_TYPES_END-->';
  if (hh.includes(S) && hh.includes(E)){
    hh = hh.replace(new RegExp(`${S}[\\s\\S]*?${E}`), `${S}\n${grid}\n  ${E}`);
  } else {
    // insert a new section before the "Where we haul" metros section
    const anchor = '<section><div class="wrap">\n  <span class="section-tag hand">heavy haul by metro</span>';
    const section = `<section><div class="wrap">
  <span class="section-tag hand">by trailer type</span>
  <h2 class="section-title">Every heavy-haul trailer</h2>
  <p class="section-intro">The right trailer is half the job. We run them all — matched to your load's weight, height, and length:</p>
  <div class="grid-services" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr));">
  ${S}
${grid}
  ${E}
  </div>
</div></section>\n\n`;
    hh = hh.replace(anchor, section + anchor);
  }
  fs.writeFileSync(hhPath, hh);
}

// sitemap (idempotent, own sentinel)
const smPath = path.join(ROOT,'sitemap.xml');
if (fs.existsSync(smPath)){
  let sm = fs.readFileSync(smPath,'utf8');
  const block = built.map(u=>`  <url><loc>${DOMAIN}${u}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
  sm = sm.replace(/\s*<!--TRAILERS_START-->[\s\S]*?<!--TRAILERS_END-->/, '');
  sm = sm.replace('</urlset>', `  <!--TRAILERS_START-->\n${block}\n  <!--TRAILERS_END-->\n</urlset>`);
  fs.writeFileSync(smPath, sm);
}

console.log(`✓ Built ${TRAILERS.length} trailer-type hub pages: ${TRAILERS.map(t=>t.slug).join(', ')}`);
console.log(`✓ Injected trailer grid into heavy-haul.html + sitemap.xml`);
