#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — SERVICE × CITY matrix generator (config-driven)
   Templatized from the signed-off gold-standard CNC/Detroit page.

   Produces services/<service-slug>/<city-slug>.html for each
   (service, metro) in WAVES, then rewrites each pillar's metro grid
   (sentinels), appends URLs to sitemap.xml (idempotent), and writes
   data/service-cities.json.

   UNIQUENESS ENGINE: every page weaves the metro's REAL local data —
   industry phrase (data/metros.json) + nearby suburbs (data/locations.json)
   + state Interstates/DOT permits — and each SERVICE supplies genuinely
   distinct copy so same-city pages across services don't cannibalize.

   Add a service: add a SERVICES{} block + a WAVES{} entry. ('ALL' = all 48.)
   Run AFTER build-locations.js (it owns sitemap.xml). Re-run any time.
   =========================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const locations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locations.json'), 'utf8'));
const metrosFile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/metros.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);
const DOMAIN = site.domain;

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
const interstatesOf = (st) => (STATE[st] && STATE[st].ix) || 'the Interstate system';
const citySlug = (city, st) => `${city.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${st.toLowerCase()}`;
const locByKey = {}; locations.forEach(l => { locByKey[`${l.city}|${l.state}`] = l; });
const metroByKey = {}; metrosFile.metros.forEach(m => { metroByKey[`${m.city}|${m.state}`] = m; });
const ALL_KEYS = locations.map(l => `${l.city}|${l.state}`);

// shared real-industry detector → a sector phrase every service can frame its own way
function industryPhrase(industry) {
  const i = (industry || '').toLowerCase();
  if (/auto|tool-and-die|tool and die/.test(i)) return 'automotive and tool-and-die';
  if (/semiconductor|silicon/.test(i)) return 'semiconductor and precision-tool';
  if (/aerospace|aviation|defense/.test(i)) return 'aerospace and defense';
  if (/oil|petrochem|energy|lng|refin/.test(i)) return 'energy and petrochemical';
  if (/steel|metal|foundry/.test(i)) return 'steel and metal-fabrication';
  if (/ag\b|agriculture|food/.test(i)) return 'ag-equipment and food-processing';
  if (/pharma|biotech|medical/.test(i)) return 'pharma and medical-device';
  if (/paper|packaging|polymer|rubber|glass/.test(i)) return 'process-industry';
  if (/port|distribution|logistics|rail/.test(i)) return 'distribution and manufacturing';
  return 'manufacturing';
}

const NAVLINKS = [['/services/rigging','Rigging'],['/services/heavy-haul','Heavy Haul'],['/services/machinery-moving','Machinery Moving'],['/services/cnc-machine-movers','CNC Movers'],['/locations','Locations'],['/blog/','Blog'],['/about','About']];
const NAV = `
<div class="topbar"><div class="wrap"><div>📍 48 locations nationwide &nbsp;·&nbsp; <strong>All 50 states</strong></div><div><a href="tel:3072841332">📞 (307) 284-1332</a> &nbsp;·&nbsp; <a href="/contact"><strong>Get a Quote</strong></a></div></div></div>
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
  <div><h4>Services</h4><a href="/services/rigging">Industrial Rigging</a><a href="/services/heavy-haul">Heavy Haul Transport</a><a href="/services/machinery-moving">Machinery Moving</a><a href="/services/cnc-machine-movers">CNC Machine Movers</a><a href="/services/plant-relocation">Plant Relocation</a><a href="/services/dispatching">Truck Dispatching</a><a href="/services/freight-moving">Freight Moving</a></div>
  <div><h4>Company</h4><a href="/about">About Us</a><a href="/locations">Locations</a><a href="/blog/">Blog</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div>
</div><div class="covstrip">Coverage: <a href="/locations/texas">Texas</a> · <a href="/locations/california">California</a> · <a href="/locations/florida">Florida</a> · <a href="/locations/georgia">Georgia</a> · <a href="/locations/illinois">Illinois</a> · <a href="/locations/ohio">Ohio</a> · <a href="/locations/pennsylvania">Pennsylvania</a> · <a href="/locations/new-york">New York</a> · <a href="/locations"><strong>All 48 locations →</strong></a></div><div class="footer-nap"><span class="nap-name">Badass Logistics</span><span>${site.hqStreet}, ${site.hqCity}, ${site.hqState} ${site.hqZip}</span><span><a href="tel:3072841332">(307) 284-1332</a></span><span><a href="mailto:rigging@badasslogistics.com">rigging@badasslogistics.com</a></span></div>
<div class="legal"><span>© 2022–2026 Badass Logistics. All rights reserved.</span><span class="hand">made to move heavy things.</span></div></div></footer>`;

// ---------- SERVICES (genuinely distinct copy per vertical) ----------
const SERVICES = {
  'cnc-machine-movers': {
    name:'CNC Machine Movers', serviceType:'CNC Machine Moving', hero:'/assets/img/loads/load-machine-loadout.jpg', band:'/assets/img/rigging-crane.jpg',
    tag:'cnc machine movers', quote:'CNC', coverageNoun:'Machine-tool moves',
    lead:(c)=>`${c.city}'s ${c.angle} shops run on CNC — and their tolerances don't get a day off. We move VMCs, HMCs, lathes, and full machine shops across the ${c.city} metro, lifted from the OEM's points, hauled on air-ride, and re-leveled to spec so the spindle cuts true the morning you power back up.`,
    introH2:(c)=>`Machine-tool moving in ${c.CS}`,
    introPs:(c)=>[
      `${c.metro?`${c.city}'s industrial base — ${c.metro.industry} — runs on CNC.`:`${c.city} runs on CNC.`} Machining centers, lathes, grinders, and the job shops that feed them count on precision, and when one of those machines has to move it can't be muscled like a pallet. It's an instrument that holds ten-thousandths, and it has to come back online holding them.`,
      `That's the job Badass Logistics is built for in ${c.city}. We pull the manufacturer's lift and jacking data before a wrench turns, protect the ways, lock the axes and spindle, and move on air skates and air-ride — then set, level, and square the machine to spec. Because we run <a href="/services/rigging">rigging</a> and <a href="/services/heavy-haul">heavy haul</a> in-house, an oversized machining center gets moved and permitted without a hand-off.`,
    ],
    movesH2:(c)=>`${c.city} CNC &amp; machine-tool moves`,
    moves:[['production machining','Production Machining','VMCs, HMCs, and transfer lines'],['turning','CNC Lathes','Flat-bed and slant-bed lathes and multi-axis turning centers'],['grinding','Grinders &amp; EDM','Surface, cylindrical, and CNC grinders plus wire and sinker EDM'],['cells &amp; shops','Full Shop Relocations','Multi-machine cells and complete machine-shop moves']],
    faq:(c)=>[
      [`Do you move CNC machines in ${c.city}?`,`Yes — CNC machine moving throughout ${c.CS} and the surrounding metro, serving ${c.angle} machine shops. Single machines, cells, and full shop relocations. <a href="/contact">Get a quote →</a>`],
      [`How much does it cost to move a CNC machine in ${c.city}?`,`It depends on weight and class, rigging access at both shops, distance across the metro, and the disconnect and re-level work involved. Send the model and both floor layouts and we'll turn a ${c.city} quote around fast.`],
      [`Can you handle ${c.stName} oversize permits?`,`Yes — when a crated machine runs over legal dimensions on ${c.ix}, we handle ${c.stName} DOT permitting, routing, and escorts as part of the move.`],
      [`Do you re-level the machine after transit?`,`Always — set on the new pad and squared to the builder's spec before hand-off, ready for OEM ramp-up and first cut.`],
    ],
    pillarFile:'services/cnc-machine-movers.html', sentinel:'CNC_METROS', cardNoun:'CNC movers',
  },

  'machinery-moving': {
    name:'Machinery Movers', serviceType:'Machinery Moving', hero:'/assets/img/loads/load-machine-loadout.jpg', band:'/assets/img/heavyhaul-load.jpg',
    tag:'machinery movers', quote:'Machinery', coverageNoun:'Machinery moves',
    lead:(c)=>`Every hour a ${c.city} production floor sits idle costs money. From ${c.angle} plants to job shops, we rig, haul, and set industrial machinery across the ${c.city} metro — one accountable crew from disconnect to re-level, built to get your line back up on schedule.`,
    introH2:(c)=>`Machinery moving in ${c.CS}`,
    introPs:(c)=>[
      `Most machinery moves fail in the gaps — the rigger who only lifts, the carrier who only drives, the installer who shows up to a machine that was moved wrong. Across ${c.metro?`${c.city}'s ${c.metro.industry} base`:`the ${c.city} metro`}, Badass Logistics closes those gaps by running rigging, transport, and reinstallation as one job with one crew.`,
      `Presses, generators, compressors, production lines, a single machine between bays or a full <a href="/services/plant-relocation">plant relocation</a> — we plan it on paper first, move it on air skates and air-ride, and set and level it to spec at the new floor. Oversized loads get <a href="/services/heavy-haul">permitted and hauled</a> in-house, no hand-off.`,
    ],
    movesH2:(c)=>`What we move in ${c.city}`,
    moves:[['forming','Presses &amp; Fabrication','Stamping presses, press brakes, shears, and injection molding machines'],['power','Generators &amp; Compressors','Generator sets, compressors, switchgear, and plant utilities'],['machining','CNC &amp; Machine Tools','VMCs, lathes, and machining centers — see <a href="/services/cnc-machine-movers">CNC moving</a>'],['lines','Production Lines','Full lines and multi-machine cells, sequenced around production']],
    faq:(c)=>[
      [`Do you move industrial machinery in ${c.city}?`,`Yes — single machines, multi-machine cells, and full production-line moves throughout ${c.CS} and the surrounding metro, serving its ${c.angle} base. <a href="/contact">Get a quote →</a>`],
      [`How do you keep our downtime short?`,`Everything is decided before rig day — path of travel, floor loads, gear, and sequence — and the move is scheduled around your production calendar in ${c.city}, nights and weekends included, so the floor is down only for the move window.`],
      [`Can you handle ${c.stName} oversize permits?`,`Yes — when a load runs over legal dimensions on ${c.ix}, we handle ${c.stName} DOT permitting, routing, and escorts as part of the move.`],
      [`Do you reinstall and level the machine?`,`Yes — set on the new pad and leveled to the manufacturer's spec before hand-off, ready for recommissioning.`],
    ],
    pillarFile:'services/machinery-moving.html', sentinel:'MM_METROS', cardNoun:'machinery movers',
  },

  'plant-relocation': {
    name:'Plant Relocation', serviceType:'Plant & Factory Relocation', hero:'/assets/img/heavyhaul-hero.jpg', band:'/assets/img/rgn-load.jpg',
    tag:'plant & factory relocation', quote:'Plant Relocation', coverageNoun:'Plant moves',
    lead:(c)=>`When a ${c.city} ${c.angle} operation expands, consolidates, or relocates, the whole floor moves — production lines, machines, utilities and all. We plan and run full plant and production-line relocations across the ${c.city} metro, sequenced so the line is down only for the move window, not a day longer.`,
    introH2:(c)=>`Plant &amp; factory relocation in ${c.CS}`,
    introPs:(c)=>[
      `A plant move isn't one big lift — it's dozens of moves in the right order: disconnect, teardown, sequenced transport, reinstall, recommission. Get the sequence wrong and the new floor sits half-built while production bleeds. Across ${c.metro?`${c.city}'s ${c.metro.industry} sector`:`the ${c.city} metro`}, Badass Logistics owns the whole project with one accountable crew.`,
      `We map the path of travel and floor loadings at both sites, tear down and label, <a href="/services/heavy-haul">haul</a> oversized machines on permitted routes, and <a href="/services/machinery-moving">rig and set</a> every machine back to spec in the new layout. Single line, full facility, or a multi-site consolidation — one plan, one team, one schedule.`,
    ],
    movesH2:(c)=>`${c.city} plant &amp; line relocation`,
    moves:[['production lines','Production Lines','Sequenced teardown, transport, and reinstall of complete lines'],['machine cells','Machine Cells','Multi-machine cells relocated and re-leveled in the new layout'],['utilities','Plant Utilities','Compressors, dust collection, conveyors, and support equipment'],['consolidation','Multi-Site Moves','Consolidating two floors into one, or splitting to a new building']],
    faq:(c)=>[
      [`Do you handle full plant relocations in ${c.city}?`,`Yes — single production lines, machine cells, and complete facility relocations throughout ${c.CS} and the surrounding metro, serving its ${c.angle} base. <a href="/contact">Get a quote →</a>`],
      [`How do you minimize downtime on a ${c.city} plant move?`,`The whole project is planned before teardown — path of travel, floor loads, machine sequence, and a schedule built around your production calendar so the line is down only for the move window.`],
      [`Can you move oversized machines and handle ${c.stName} permits?`,`Yes — oversized loads are hauled in-house on permitted ${c.stName} DOT routes via the ${c.ix} corridors, with escorts where required.`],
      [`Do you reinstall the line in the new building?`,`Yes — every machine is set, leveled, and squared to spec in the new layout, ready for recommissioning. We hand off a floor that's ready to run.`],
    ],
    pillarFile:'services/plant-relocation.html', sentinel:'PR_METROS', cardNoun:'plant relocation',
  },

  'rigging': {
    name:'Industrial Rigging', serviceType:'Industrial Rigging', hero:'/assets/img/rigging-hero.jpg', band:'/assets/img/rigging-crane2.jpg',
    tag:'rigging company', quote:'Rigging', coverageNoun:'Rigging jobs',
    lead:(c)=>`When a machine is too heavy, too tall, or too tight to move safely, ${c.city} calls a rigger. Badass Logistics plans and executes precision lifts, machine setting, and heavy moves across the ${c.city} metro — from a few hundred pounds to 200,000 lbs and beyond, rigged, hauled, and set by one accountable crew.`,
    introH2:(c)=>`Industrial rigging in ${c.CS}`,
    introPs:(c)=>[
      `${c.metro?`${c.city}'s ${c.metro.industry} base`:`The ${c.city} metro`} runs on machines that can't be muscled onto a truck — presses, machining centers, transformers, and production lines that have to come off the floor, through the door, and onto a trailer without a scratch. That's rigging: engineered lifts, air skates and gantries, and a crew that measures every doorway before anything moves.`,
      `Badass Logistics rigs it like an engineering problem and runs it like a road crew across ${c.city}. We plan the pick, protect the floors, and set the load to spec — and because we run <a href="/services/heavy-haul">heavy haul</a> and <a href="/services/machinery-moving">machinery moving</a> in-house, an oversized lift gets permitted, hauled, and reset without a hand-off.`,
    ],
    movesH2:(c)=>`What we rig in ${c.city}`,
    moves:[['machine setting','Machine Setting','Setting and leveling machinery onto pads and foundations to spec'],['heavy lifts','Heavy &amp; Critical Lifts','Crane, gantry, and jack-and-slide lifts up to 200,000 lbs and beyond'],['plant equipment','Plant Equipment','Presses, generators, transformers, and production-line machinery'],['tight access','Tight-Access Moves','Skating machines through doorways, up mezzanines, and out of packed floors']],
    faq:(c)=>[
      [`Do you offer rigging services in ${c.city}?`,`Yes — industrial rigging, machine setting, and heavy lifts throughout ${c.CS} and the surrounding metro, serving its ${c.angle} base. Single machines to full production lines. <a href="/contact">Get a quote →</a>`],
      [`How heavy a load can you rig in ${c.city}?`,`From a few hundred pounds to 200,000 lbs and beyond. We size the gear — cranes, gantries, skates, and jack-and-slide — to the load and the site, and plan every pick before rig day.`],
      [`Can you handle ${c.stName} oversize permits and transport?`,`Yes — when a rigged load runs over legal dimensions on ${c.ix}, we handle ${c.stName} DOT permitting, routing, and escorts and haul it in-house, no hand-off.`],
      [`Do you set and level the machine after the lift?`,`Yes — we set the load on its new pad or foundation and level it to the manufacturer's spec, ready for recommissioning.`],
    ],
    pillarFile:'services/rigging.html', sentinel:'RIG_METROS', cardNoun:'riggers',
  },
};

function page(serviceSlug, svc, loc, metro) {
  const { city, state } = loc;
  const CS = `${city}, ${state}`;
  const slug = citySlug(city, state);
  const c = { city, state, CS, stName: stateName(state), ix: interstatesOf(state), angle: industryPhrase(metro && metro.industry), metro };
  const near = (loc.near || []).slice(0, 12);
  const url = `${DOMAIN}/services/${serviceSlug}/${slug}`;
  const cityHub = `/locations/${slug}`;
  const mapQ = encodeURIComponent(CS);
  const title = `${svc.name} in ${CS} | Badass Logistics`;
  const desc = `${svc.name} in ${CS}. ${svc.serviceType} across ${city} and the surrounding metro — planned, rigged, hauled on permitted routes, and re-leveled to spec. Fast quotes.`;
  const svcSchema = {"@context":"https://schema.org","@type":"Service","serviceType":svc.serviceType,"areaServed":{"@type":"City","name":CS},"provider":{"@type":"LocalBusiness","@id":`${DOMAIN}/#organization`,"name":site.brand,"telephone":"+1-307-284-1332","url":`${DOMAIN}/`},"description":`${site.brand} provides ${svc.serviceType.toLowerCase()} across ${CS} and the surrounding metro.`};
  const breadcrumb = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${DOMAIN}/`},{"@type":"ListItem","position":2,"name":svc.name,"item":`${DOMAIN}/services/${serviceSlug}`},{"@type":"ListItem","position":3,"name":CS,"item":url}]};
  const faqPairs = svc.faq(c);
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqPairs.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a.replace(/<[^>]+>/g,'')}}))};

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
<meta property="og:description" content="${svc.serviceType} in ${CS} — planned, rigged, hauled, and re-leveled to spec.">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${DOMAIN}${svc.hero}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${svc.serviceType} in ${CS} — planned, rigged, hauled, and re-leveled to spec.">
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
${JSON.stringify(faqSchema,null,2)}
</script>
<link rel="preload" as="image" href="${svc.hero}" fetchpriority="high">
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="/">Home</a> / <a href="/services/${serviceSlug}">${svc.name}</a> / ${CS}</div>

<section class="page-hero photo" style="background-image:url('${svc.hero}')"><div class="wrap">
  <span class="section-tag hand">// ${svc.tag} — ${city.toLowerCase()}</span>
  <h1>${svc.name} in <span class="y">${CS}</span></h1>
  <p class="lead">${svc.lead(c)}</p>
  <div class="cta-row" style="margin-top:24px;"><a class="btn" href="/contact">Get a ${city} ${svc.quote} Quote</a></div>
</div>
  <span class="annot hand tag warn a1">${state} • ${c.angle.split(' ')[0].toUpperCase()}</span>
  <span class="annot hand a4">${city.toUpperCase()} ✓</span>
</section>

<section><div class="wrap prose">
  <h2>${svc.introH2(c)}</h2>
  ${svc.introPs(c).map(p=>`<p>${p}</p>`).join('\n  ')}
</div></section>

<section class="bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);"><div class="wrap">
  <span class="section-tag hand">what we move in ${city}</span>
  <h2 class="section-title">${svc.movesH2(c)}</h2>
  <div class="cap-grid">
    ${svc.moves.map(([k,h,p])=>`<div class="cap"><div class="k">${k}</div><h3>${h}</h3><p>${p} across the ${city} metro.</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="notes-bg">
  <span class="bgnote" style="top:10%;right:5%;transform:rotate(-4deg)">${c.ix.split(',')[0]} CORRIDOR</span>
  <span class="bgnote" style="bottom:12%;left:4%;transform:rotate(4deg)">${state} DOT PERMIT ✓</span>
  <div class="wrap prose">
  <h2>Routes &amp; permits across the ${city} metro</h2>
  <p>Moves around ${city} run the ${c.ix} corridors that knit the metro's industrial belt together. A load that's legal-dimension just gets hauled; anything over height, width, or weight has to be legal on every mile. We handle the ${c.stName} DOT oversize/overweight permitting, route survey, clearance checks, and any escorts as part of the job — so the move reaches its new floor on a compliant route the first time.</p>
</div></section>

<section><div class="wrap">
  <span class="section-tag hand">on the map</span>
  <h2 class="section-title">${svc.name} in ${city}</h2>
  <p class="section-intro">Working throughout ${CS} and the surrounding metro — backed by a nationwide network of 48 locations when a move crosses state lines.</p>
  <div class="map-frame" style="margin-top:24px;">
    <iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${CS} ${svc.name} map" src="https://maps.google.com/maps?q=${mapQ}&z=10&output=embed"></iframe>
  </div>
</div></section>

${near.length ? `<section class="notes-bg bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);">
  <span class="bgnote" style="top:10%;right:5%;transform:rotate(-4deg)">${state}</span>
  <span class="bgnote" style="bottom:10%;left:4%;transform:rotate(4deg)">NEAREST CREW →</span>
  <div class="wrap">
  <span class="section-tag hand">metro coverage</span>
  <h2 class="section-title">${svc.coverageNoun} near ${city}</h2>
  <p class="section-intro">Service throughout ${city} and the surrounding manufacturing suburbs — including:</p>
  <div class="towns">${near.map(t=>`<span>${t}</span>`).join('')}</div>
  <p style="margin-top:22px;font-weight:600;">Moving across the metro or out of state? See <a href="${cityHub}" style="color:var(--yellow-deep);text-decoration:underline;">all our ${city} services</a> or <a href="/contact" style="color:var(--yellow-deep);text-decoration:underline;">get a quote</a>.</p>
</div></section>` : ''}

<section class="bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);"><div class="wrap">
  <span class="section-tag hand">questions</span>
  <h2 class="section-title">${city} ${svc.quote} FAQ</h2>
  <div class="faq">
    ${faqPairs.map(([q,a],i)=>`<details${i===0?' open':''}><summary>${q}</summary><div class="a">${a}</div></details>`).join('\n    ')}
  </div>
</div></section>

<div class="photo-band" style="background-image:url('${svc.band}')">
  <span class="annot hand tag a1">${city.toUpperCase()} ✓</span>
  <span class="annot hand a6">ON SCHEDULE</span>
</div>

<div class="cta-band"><div class="wrap" style="padding-top:56px;padding-bottom:56px;text-align:center;">
  <h2>Need ${svc.name.toLowerCase()} in ${city}?</h2>
  <p>Tell us what's moving and where. We'll route the nearest crew and quote it fast.</p>
  <a class="btn dark" href="/contact">Get a ${city} ${svc.quote} Quote</a>
</div></div>
${FOOTER}

</body>
</html>`;
}

// ---------- WAVES (which service × which metros) ----------
const TOP24 = ALL_KEYS.slice(); // ordered by locations.json; we slice per-service below
const WAVES = {
  'rigging': 'ALL',
  'cnc-machine-movers': 'ALL',
  'machinery-moving': metrosFile.metros.filter(m=>m.tier===1).sort((a,b)=>a.rank-b.rank).slice(0,24).map(m=>`${m.city}|${m.state}`),
  'plant-relocation':  metrosFile.metros.filter(m=>m.tier===1).sort((a,b)=>a.rank-b.rank).slice(0,24).map(m=>`${m.city}|${m.state}`),
};

// ---------- build ----------
const manifest = [];
for (const [serviceSlug, wave] of Object.entries(WAVES)) {
  const svc = SERVICES[serviceSlug];
  const keys = wave === 'ALL' ? ALL_KEYS : wave;
  const outDir = path.join(ROOT, 'services', serviceSlug);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const built = [];
  for (const key of keys) {
    const loc = locByKey[key];
    if (!loc) { console.warn(`  ! skip ${key} (${serviceSlug}) — not in locations.json`); continue; }
    const slug = citySlug(loc.city, loc.state);
    fs.writeFileSync(path.join(outDir, `${slug}.html`), page(serviceSlug, svc, loc, metroByKey[key]));
    built.push(loc);
    manifest.push({ service: serviceSlug, city: loc.city, state: loc.state, url: `/services/${serviceSlug}/${slug}` });
  }
  // pillar metro grid (sentinels)
  const pillarPath = path.join(ROOT, svc.pillarFile);
  if (fs.existsSync(pillarPath)) {
    let p = fs.readFileSync(pillarPath, 'utf8');
    const cards = built.map(l => {
      const slug = citySlug(l.city, l.state);
      return `    <a class="svc-card" href="${serviceSlug}/${slug}"><div class="num">// ${l.state}</div><h3>${l.city}, ${l.state}</h3><p>${(l.near||[]).slice(0,3).join(' · ')}</p><span class="more">${l.city} ${svc.cardNoun}</span></a>`;
    }).join('\n');
    const S = `<!--${svc.sentinel}_START-->`, E = `<!--${svc.sentinel}_END-->`;
    if (p.includes(S) && p.includes(E)) {
      p = p.replace(new RegExp(`${S}[\\s\\S]*?${E}`), `${S}\n${cards}\n  ${E}`);
      fs.writeFileSync(pillarPath, p);
    }
  }
}

fs.writeFileSync(path.join(ROOT, 'data/service-cities.json'), JSON.stringify(manifest, null, 2) + '\n');

// sitemap append (idempotent)
const smPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(smPath)) {
  let sm = fs.readFileSync(smPath, 'utf8');
  const block = manifest.map(m => `  <url><loc>${DOMAIN}${m.url}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
  sm = sm.replace(/\s*<!--SVC_CITIES_START-->[\s\S]*?<!--SVC_CITIES_END-->/, '');
  sm = sm.replace('</urlset>', `  <!--SVC_CITIES_START-->\n${block}\n  <!--SVC_CITIES_END-->\n</urlset>`);
  fs.writeFileSync(smPath, sm);
}

const byService = manifest.reduce((a,m)=>{a[m.service]=(a[m.service]||0)+1;return a;},{});
console.log(`✓ Built ${manifest.length} service×city pages:`, JSON.stringify(byService));
console.log(`✓ Updated pillar grids + sitemap.xml + data/service-cities.json`);
