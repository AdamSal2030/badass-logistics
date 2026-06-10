#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — blog generator
   Reads data/site.json + the POSTS array below and writes:
     - blog/<slug>.html      (one article per post, full schema)
     - blog/index.html       (the blog hub)
   Keep POST slugs in sync with BLOG_POSTS in build-locations.js
   (that file owns the sitemap). Re-run:  node build-blog.js
   =========================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const OG = `${site.domain}/assets/img/og-default.jpg`;

const NAV = `
<div class="topbar"><div class="wrap"><div>📍 48 locations nationwide &nbsp;·&nbsp; <strong>HQ:</strong> ${site.hqCity}, ${site.hqState}</div><div><a href="tel:${site.phoneHref}">📞 ${site.phone}</a> &nbsp;·&nbsp; <a href="../contact.html"><strong>Get a Quote</strong></a></div></div></div>
<header class="site-header"><div class="wrap">
  <a class="logo" href="../index.html"><span class="brand"><span class="l1">BADASS</span><span class="l2">LOGISTICS</span></span></a>
  <button class="nav-toggle" aria-label="Menu" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
  <nav class="main" id="nav">
    <a href="../index.html">Home</a><a href="../services/rigging.html">Rigging</a><a href="../services/heavy-haul.html">Heavy Haul</a><a href="../services/dispatching.html">Dispatch</a><a href="../services/freight-moving.html">Freight Moving</a><a href="../locations.html">Locations</a><a href="../blog/index.html">Blog</a><a href="../about.html">About</a>
    <a class="btn" style="font-size:14px;padding:9px 16px;box-shadow:3px 3px 0 var(--ink)" href="../contact.html">Get a Quote</a>
  </nav>
</div></header>`;

const FOOTER = `
<footer><div class="wrap"><div class="cols">
  <div><h4>Badass Logistics</h4><p style="opacity:.85;max-width:280px;">Rigging, heavy haul, dispatch &amp; freight moving. One-stop shop for everything oversized and overweight.</p></div>
  <div><h4>Services</h4><a href="../services/rigging.html">Industrial Rigging</a><a href="../services/heavy-haul.html">Heavy Haul Transport</a><a href="../services/dispatching.html">Truck Dispatching</a><a href="../services/freight-moving.html">Freight Moving</a></div>
  <div><h4>Company</h4><a href="../about.html">About Us</a><a href="../locations.html">Locations</a><a href="../blog/index.html">Blog</a><a href="../contact.html">Contact</a></div>
  <div><h4>Headquarters</h4><address>${site.hqStreet}<br>${site.hqCity}, ${site.hqState} ${site.hqZip}<br><a href="tel:${site.phoneHref}">${site.phone}</a><br><a href="mailto:${site.email}">${site.email}</a></address></div>
</div><div class="legal"><span>© 2026 Badass Logistics. All rights reserved.</span><span class="hand">made to move heavy things.</span></div></div></footer>`;

const BLOG_CSS = `<style>
  .blog-hero { padding:60px 0 30px; border-bottom:3px solid var(--ink); background:var(--paper,#f7f4ea); }
  .post { max-width:820px; margin:0 auto; }
  .post .meta { font-family:"Barlow",sans-serif; font-weight:600; font-size:14px; letter-spacing:.5px; text-transform:uppercase; color:var(--yellow-deep); margin-bottom:10px; }
  .post-body h2 { font-family:"Anton",sans-serif; font-size:30px; margin:38px 0 12px; line-height:1.15; }
  .post-body h3 { font-size:22px; margin:26px 0 8px; }
  .post-body p, .post-body li { font-size:18px; line-height:1.7; }
  .post-body ul { margin:10px 0 10px 22px; }
  .post-body li { margin-bottom:7px; }
  .post-body a { color:var(--yellow-deep); text-decoration:underline; font-weight:600; }
  .keyfacts { border:3px solid var(--ink); box-shadow:var(--shadow); background:var(--white); padding:22px 26px; margin:26px 0; }
  .keyfacts h3 { margin-top:0; }
  .post-img { width:100%; border:3px solid var(--ink); box-shadow:var(--shadow); margin:8px 0 6px; display:block; }
  .blog-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:22px; margin-top:30px; }
  .blog-card { border:3px solid var(--ink); box-shadow:var(--shadow); background:var(--white); text-decoration:none; color:var(--ink); display:flex; flex-direction:column; overflow:hidden; transition:transform .08s; }
  .blog-card:hover { transform:translate(-2px,-2px); }
  .blog-card .thumb { height:160px; background-size:cover; background-position:center; border-bottom:3px solid var(--ink); }
  .blog-card .pad { padding:18px 20px 22px; }
  .blog-card .cat { font-family:"Barlow",sans-serif; font-weight:700; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:var(--yellow-deep); }
  .blog-card h3 { font-family:"Anton",sans-serif; font-size:21px; line-height:1.2; margin:6px 0 8px; }
  .blog-card p { font-size:15px; opacity:.85; margin:0; }
  .related { border-top:3px solid var(--ink); margin-top:46px; padding-top:24px; }
  .related a { display:inline-block; margin:0 10px 10px 0; background:var(--ink); color:var(--white); padding:8px 14px; box-shadow:3px 3px 0 var(--yellow-deep); text-decoration:none; font-weight:700; font-size:15px; }
  .related a:hover { background:var(--yellow-deep); color:var(--ink); }
</style>`;

// ---------------------------------------------------------------------------
// POSTS — each `body` is the article HTML; everything else is wrapped for you.
// ---------------------------------------------------------------------------
const POSTS = [
  {
    slug: 'how-much-does-heavy-haul-cost',
    cat: 'Heavy Haul',
    hero: 'heavyhaul-hero.jpg',
    date: '2026-05-12',
    title: 'How Much Does Heavy Haul Trucking Cost? A 2026 Pricing Guide',
    desc: 'What drives heavy haul and oversized load pricing — distance, dimensions, weight, permits, escorts and trailer type — plus how to get an accurate quote fast.',
    dek: 'There is no flat rate for an oversized load. Here is exactly what moves the number — and how to get a real quote instead of a guess.',
    body: `
<p>The honest answer to "what does heavy haul cost" is: <strong>it depends on the load and the route</strong> — and anyone who quotes you a flat per-mile rate before seeing your dimensions is guessing. A legal flatbed load and a 16-foot-wide superload are not the same job, and they should not cost the same. What you can do is understand the levers, because once you know what drives the price you can give a carrier the exact details that get you an accurate number on the first call.</p>

<h2>What actually drives heavy haul pricing</h2>
<p>Every oversized quote is built from the same handful of factors. Get these right and the rest is arithmetic.</p>
<ul>
  <li><strong>Distance and deadhead.</strong> The loaded miles matter, but so do the empty miles to reposition the right trailer to your pickup. A specialized RGN sitting three states away costs more to bring in than a flatbed down the road.</li>
  <li><strong>Dimensions.</strong> Width, height, and length each have legal limits (generally 8'6" wide, 13'6" tall, and around 53' long). Cross any one of them and you are into permit territory, which adds cost at every state line.</li>
  <li><strong>Weight and axles.</strong> Past 80,000 lbs gross you need overweight permits and often more axles to spread the load legally. More axles means a bigger, pricier trailer and sometimes a heavier tractor.</li>
  <li><strong>Permits.</strong> Oversize and overweight permits are priced per state, and a cross-country move can touch a dozen of them. Superloads can require engineering studies and bridge analysis.</li>
  <li><strong>Escorts and pilot cars.</strong> Wide or tall loads trigger pilot-car requirements, and some states require a police escort above certain thresholds. Each escort is a separate vehicle, driver, and day.</li>
  <li><strong>Route and clearances.</strong> Low bridges, weight-restricted roads, tight turns, and construction can force a longer legal route — more miles, more permits, more time.</li>
  <li><strong>Trailer type.</strong> A flatbed is cheaper than a step deck, which is cheaper than a multi-axle RGN or a perimeter trailer. The load's height and weight decide which one you actually need — see <a href="flatbed-vs-step-deck-vs-rgn-trailers.html">flatbed vs step deck vs RGN</a>.</li>
  <li><strong>Loading and rigging.</strong> If the load has to be lifted, jacked, or craned on and off, that <a href="../services/rigging.html">rigging work</a> is part of the cost too.</li>
</ul>

<div class="keyfacts">
  <h3>The three pricing tiers</h3>
  <p><strong>Legal load:</strong> within 8'6" × 13'6" × 53' and under 80,000 lbs — standard flatbed/step-deck rates, no permits.<br>
  <strong>Oversize / overweight:</strong> over one or more legal limits — add per-state permits and possibly escorts.<br>
  <strong>Superload:</strong> extreme dimensions or weight — engineered routing, bridge studies, police escorts, and sometimes utility coordination to lift lines.</p>
</div>

<h2>How to get an accurate quote (not a guess)</h2>
<p>Give us five things and we can turn a real number around fast — usually same day:</p>
<ul>
  <li>Exact <strong>dimensions</strong> (length × width × height) and <strong>weight</strong></li>
  <li><strong>Pickup and delivery</strong> locations (full addresses or at least cities)</li>
  <li>Whether it can be <strong>loaded/unloaded</strong> on its own or needs rigging or a crane</li>
  <li>Your <strong>target dates</strong> and any hard deadline</li>
  <li>A <strong>photo</strong> if you have one — it answers a dozen questions at once</li>
</ul>
<p>That is the same information our dispatchers use to spec the trailer, price the permits, and book escorts. The more precise you are, the tighter the quote.</p>

<h2>Can you make it cheaper?</h2>
<p>Sometimes. Flexible pickup dates let us combine your load with backhauls and avoid deadhead. Breaking a single superload into two permittable loads can occasionally beat the cost of police escorts and bridge studies. And routing matters — the shortest route is not always the legal or the cheapest one. We will tell you straight when there is a smarter way to move it.</p>

<p>Ready for a number? <a href="../services/heavy-haul.html">See our heavy haul service</a> or <a href="../contact.html">send us the specs for a fast quote</a>.</p>
`,
    faq: [
      { q: 'Is heavy haul priced per mile?', a: 'Loaded miles are part of it, but oversized pricing also factors in permits, escorts, trailer type, deadhead, and route restrictions — so a flat per-mile rate rarely reflects the real cost. Send dimensions and weight for an accurate quote.' },
      { q: 'Who pays for oversize permits and escorts?', a: 'Permits and pilot-car/escort costs are part of the move and are typically included in the quoted price. We handle the permitting and escort booking as part of the job.' },
      { q: 'What is considered an oversize load?', a: 'Generally anything over 8 feet 6 inches wide, 13 feet 6 inches tall, about 53 feet long, or 80,000 lbs gross. Crossing any of those limits puts the load into permit territory.' },
    ],
    related: [
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'Oversize Load Permits Guide', u: 'oversize-load-permits-guide.html' },
      { h: 'Flatbed vs Step Deck vs RGN', u: 'flatbed-vs-step-deck-vs-rgn-trailers.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'oversize-load-permits-guide',
    cat: 'Permits & Compliance',
    hero: 'heavyhaul-load.jpg',
    date: '2026-05-19',
    title: 'Oversize & Overweight Load Permits: What You Actually Need',
    desc: 'When you need an oversize or overweight permit, the legal load limits, single-trip vs annual permits, escort and pilot-car rules, and travel restrictions — explained.',
    dek: 'Cross one legal limit and you are in permit country. Here is how oversize and overweight permitting really works, state to state.',
    body: `
<p>Move a load that is too wide, too tall, too long, or too heavy and you cannot just hit the highway — you need a permit, and usually a different one in every state you pass through. Permitting is where a lot of oversized moves go sideways: wrong route, missing escort, travel-time violation. Here is what you need to know before the wheels turn.</p>

<h2>The legal limits — and where permits start</h2>
<p>On most U.S. highways, a load is "legal" (no permit) when it stays inside these limits:</p>
<div class="keyfacts">
  <h3>Standard legal limits</h3>
  <p><strong>Width:</strong> 8 feet 6 inches &nbsp;·&nbsp; <strong>Height:</strong> 13 feet 6 inches (14 feet in some western states) &nbsp;·&nbsp; <strong>Length:</strong> ~48–53 feet for the trailer &nbsp;·&nbsp; <strong>Weight:</strong> 80,000 lbs gross, with axle and bridge-formula limits underneath it.</p>
</div>
<p>Exceed any single one of those and the load is oversize and/or overweight — and it needs a permit for every jurisdiction it travels through.</p>

<h2>Types of permits</h2>
<ul>
  <li><strong>Single-trip permits.</strong> Issued for one specific load on one specific route, valid for a few days. The most common type for a one-off oversized move.</li>
  <li><strong>Annual / blanket permits.</strong> For carriers that regularly run loads within set dimensions; cheaper per trip but limited to defined limits and routes.</li>
  <li><strong>Superload permits.</strong> For extreme dimensions or weight. These can require engineering review, bridge analysis, and a longer lead time — days to weeks, not hours.</li>
</ul>

<h2>Escorts, pilot cars, and police</h2>
<p>The wider and taller the load, the more eyes it needs on the road. Thresholds vary by state, but as a rule:</p>
<ul>
  <li><strong>Pilot/escort vehicles</strong> are commonly required once a load passes roughly 12 feet wide, with a second escort added for greater widths or long lengths.</li>
  <li><strong>Height poles</strong> ride the front escort to check overpass and utility-line clearances on tall loads.</li>
  <li><strong>Police escorts</strong> can be required for the widest loads or for travel through major metro areas.</li>
</ul>

<h2>Travel restrictions you can't ignore</h2>
<p>A permit is not a blank check to drive whenever you want. States restrict oversized travel during:</p>
<ul>
  <li><strong>Night hours</strong> — many oversize loads can only move during daylight.</li>
  <li><strong>Rush hour</strong> in and around metro areas.</li>
  <li><strong>Weekends and holidays</strong> — a number of states curtail or ban oversized travel on holiday weekends.</li>
  <li><strong>Bad weather</strong> — high winds will shut down a tall or wide load.</li>
</ul>
<p>Loads also need proper <strong>"OVERSIZE LOAD" banners, red/orange flags, and lights</strong>, and overweight loads may be routed around weight-restricted bridges entirely.</p>

<h2>Who handles all this?</h2>
<p>We do. Permitting, route surveys, clearance checks, and escort coordination are part of every <a href="../services/heavy-haul.html">heavy haul move</a> we run — across all 48 of our <a href="../locations.html">locations</a> and all 50 states. You tell us the load and the lane; we make sure it is legal on every mile. Curious what the permits add to the price? See <a href="how-much-does-heavy-haul-cost.html">how heavy haul cost is calculated</a>.</p>

<p><a href="../contact.html">Send us your load and route</a> and we'll handle the paperwork.</p>
`,
    faq: [
      { q: 'Do I need a permit to haul an oversize load?', a: 'Yes. Any load over 8\'6" wide, 13\'6" tall, roughly 53\' long, or 80,000 lbs gross needs an oversize and/or overweight permit for each state it travels through. We handle the permitting as part of the move.' },
      { q: 'How long does it take to get an oversize permit?', a: 'Routine single-trip permits are often same-day or next-day. Superload permits that require bridge or route engineering can take several days to a few weeks, so build in lead time for extreme loads.' },
      { q: 'When can oversize loads travel?', a: 'Most states restrict oversized travel to daylight hours and prohibit movement during rush hour, certain holidays, and high winds. Permit conditions spell out the allowed travel windows for your specific route.' },
    ],
    related: [
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'How Much Does Heavy Haul Cost?', u: 'how-much-does-heavy-haul-cost.html' },
      { h: 'All Locations', u: '../locations.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'how-to-move-an-mri-machine',
    cat: 'Specialized Rigging',
    hero: 'mri-real.jpg',
    date: '2026-05-26',
    title: 'How to Move an MRI Machine: Rigging, Transport & Reinstallation',
    desc: 'Moving an MRI scanner is a rigging job, not a furniture move. Magnet weight, cryogens, shock/tilt sensitivity, tight-access crane-ins, and how the move actually gets done.',
    dek: 'An MRI is heavy, fragile, and ruthlessly sensitive to shock and tilt. We have moved them — here is how it really works.',
    body: `
<p>An MRI scanner is one of the hardest things you can ask a crew to move. It is heavy — a magnet can run from roughly 5,000 to well over 12,000 lbs — and at the same time it is delicate, expensive, and intolerant of shock, tilt, and temperature swings. Move it wrong and you are not paying for a scuffed crate; you are paying to re-cool a magnet or replace a multi-hundred-thousand-dollar machine. This is rigging and engineering, not a two-guys-and-a-dolly job.</p>

<figure>
  <img class="post-img" src="../assets/img/mri-real.jpg" alt="MRI scanner shrink-wrapped, chained, and secured on a flatbed during a Badass Logistics rigging and transport job at a hospital" loading="lazy" width="1500" height="1000">
  <figcaption class="hand" style="font-size:16px;opacity:.8;">One of our own MRI moves — scanner wrapped, secured, and ready to roll.</figcaption>
</figure>

<h2>Why an MRI move is different</h2>
<ul>
  <li><strong>The magnet.</strong> The superconducting magnet is the heart — and the hazard. Many moves are done with the magnet at field-off / ramped-down state, coordinated with the OEM, and some require managing or recovering <strong>cryogens (liquid helium)</strong>.</li>
  <li><strong>Shock and tilt limits.</strong> Manufacturers set strict shock-and-tilt thresholds. We use monitored, controlled lifts and air-ride transport to stay inside them, and often ship with shock indicators on the crate.</li>
  <li><strong>The fringe field.</strong> Until it is de-energized, the magnet's field is a serious safety issue around ferrous tools and equipment. Planning respects that.</li>
  <li><strong>It rarely fits the door.</strong> MRIs were often installed before the walls went up. Getting one out can mean removing windows or wall panels, or craning it in or out through the roof.</li>
</ul>

<h2>How the move actually gets done</h2>
<h3>1. Site survey and path of travel</h3>
<p>We measure everything: the machine, every doorway, corridor, elevator, and turn between the magnet room and the truck — plus floor loading along the route. Nothing is guessed. If the path does not work at ground level, we plan a crane-in or crane-out.</p>
<h3>2. Rigging the magnet out</h3>
<p>The magnet is jacked, skated, and rolled along an engineered path on air skates or rollers, or lifted under control with a gantry or crane. Tight-access and rooftop jobs are coordinated with our <a href="../services/heavy-haul.html">heavy haul</a> team so the crane, the truck, and the crew all show up on the same plan.</p>
<h3>3. Transport</h3>
<p>The scanner ships secured and shock-monitored on air-ride equipment, climate-considered, and routed to avoid rough roads where we can. Door-to-door on our own fleet means one accountable crew from the hospital floor to the new site.</p>
<h3>4. Set, place, and hand off</h3>
<p>At the destination we reverse the process — rig it in, set it on its pad, level it — and hand off to the OEM service team for ramp-up, calibration, and clinical sign-off.</p>

<div class="keyfacts">
  <h3>What drives MRI move cost</h3>
  <p>Magnet weight and model · whether it craned in/out or rolled out a door · distance and access on both ends · crane and rigging gear required · OEM coordination and cryogen handling · how much wall/window/roof work the path needs.</p>
</div>

<h2>Why experience matters here</h2>
<p>This is exactly the kind of load most carriers pass on — and exactly what we are built for. We have rigged and hauled MRI and medical equipment at live hospital sites, on tight timelines, with the machine treated like the seven-figure instrument it is. See the <a href="../services/rigging.html">MRI &amp; medical equipment rigging</a> section of our rigging service for more.</p>

<p>Moving a scanner, CT, or other imaging equipment? <a href="../contact.html">Send us the model, the floor, and the dates</a> — we'll plan the lift.</p>
`,
    faq: [
      { q: 'How much does it cost to move an MRI machine?', a: 'It depends on the magnet weight and model, the access on both ends (door-out vs. crane-in), distance, the rigging gear required, and OEM/cryogen coordination. Send the model and a site photo for an accurate quote.' },
      { q: 'Can you crane an MRI onto a hospital roof or upper floor?', a: 'Yes. When the path of travel does not work at ground level, we plan and execute a crane-in or crane-out, coordinated with our heavy haul team and the OEM service schedule.' },
      { q: 'Do you handle the helium and magnet ramp-down?', a: 'Magnet ramp-down/ramp-up and cryogen work are coordinated with the manufacturer\'s field service engineers. We handle the rigging, securement, transport, and placement around that schedule.' },
    ],
    related: [
      { h: 'Industrial Rigging', u: '../services/rigging.html' },
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'What Is Industrial Rigging?', u: 'what-is-industrial-rigging.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'flatbed-vs-step-deck-vs-rgn-trailers',
    cat: 'Equipment',
    hero: 'brokerage-flatbed.jpg',
    date: '2026-06-02',
    title: 'Flatbed vs Step Deck vs RGN: Which Trailer Does Your Load Need?',
    desc: 'Deck height decides everything. A plain-English guide to flatbed, step deck, and RGN/lowboy trailers — cargo heights, weight capacity, and when to use each.',
    dek: 'Pick the wrong trailer and your legal load becomes an oversize permit headache. Here is how deck height decides the job.',
    body: `
<p>The single most important number in choosing a heavy-haul trailer is <strong>deck height</strong> — because total height (deck + cargo) has to clear bridges. The legal ceiling is generally 13'6". So the taller your cargo, the lower the deck you need to stay legal and avoid permits. That one idea explains the whole flatbed → step deck → RGN ladder.</p>

<h2>Flatbed</h2>
<p>A standard flatbed has a deck about <strong>5 feet</strong> off the ground and runs 48–53 feet long, hauling up to roughly 48,000 lbs.</p>
<ul>
  <li><strong>Best for:</strong> cargo up to about 8'6" tall (5' deck + 8'6" load ≈ 13'6").</li>
  <li><strong>Loads:</strong> building materials, steel, machinery that is heavy but not tall, palletized freight.</li>
  <li><strong>Why pick it:</strong> cheapest specialized option, easy to load from any side or by crane.</li>
</ul>

<h2>Step deck (drop deck)</h2>
<p>A step deck drops to a lower main deck around <strong>3'6"</strong> off the ground, buying you height without a permit.</p>
<ul>
  <li><strong>Best for:</strong> cargo up to about 10 feet tall.</li>
  <li><strong>Loads:</strong> taller machinery, equipment that would push a flatbed over height, anything you want to ramp on.</li>
  <li><strong>Why pick it:</strong> ramps allow drive-on/roll-on loading; more legal height than a flatbed for a small cost bump.</li>
</ul>

<h2>RGN / lowboy</h2>
<p>A removable gooseneck (RGN), or lowboy, has the lowest deck — roughly <strong>18 to 24 inches</strong> — and the front detaches into a ramp so equipment can drive right on.</p>
<ul>
  <li><strong>Best for:</strong> the tallest cargo (around 11'6"+) and the heaviest loads.</li>
  <li><strong>Loads:</strong> excavators, dozers, cranes, large industrial machinery, anything self-propelled.</li>
  <li><strong>Why pick it:</strong> lowest deck = most height clearance; add axles (3, 4, or more) to legally carry very heavy loads.</li>
</ul>

<div class="keyfacts">
  <h3>Quick selector</h3>
  <p><strong>Under ~8'6" tall, not super heavy?</strong> Flatbed.<br>
  <strong>Up to ~10' tall?</strong> Step deck.<br>
  <strong>Over ~10' tall, very heavy, or drives on its own?</strong> RGN / multi-axle lowboy.</p>
</div>

<h2>Beyond the big three</h2>
<p>For extreme loads there are <strong>double-drop</strong> and <strong>stretch</strong> trailers for very long cargo, <strong>multi-axle</strong> and <strong>perimeter</strong> trailers for the heaviest weights, and <strong>Schnabel</strong>-type rigs for true superloads. If your load needs one of those, it almost certainly needs <a href="oversize-load-permits-guide.html">oversize permits and escorts</a> too.</p>

<p>Not sure which deck your load needs? That is our job to figure out. <a href="../services/heavy-haul.html">See heavy haul</a>, check <a href="how-much-does-heavy-haul-cost.html">what it costs</a>, or just <a href="../contact.html">send us the dimensions</a> and we'll spec the right trailer.</p>
`,
    faq: [
      { q: 'What is the difference between a step deck and an RGN?', a: 'A step deck has a fixed lower deck around 3\'6" and uses ramps to load. An RGN (removable gooseneck) drops to roughly 18–24" and the front detaches so equipment can drive straight on — better for the tallest and heaviest loads.' },
      { q: 'How tall can a load be on a flatbed?', a: 'About 8 feet 6 inches. A standard flatbed deck sits ~5 feet off the ground, and total height generally must stay under 13\'6" to remain legal without a permit.' },
      { q: 'Which trailer do I need for an excavator or dozer?', a: 'Usually an RGN or lowboy. The low deck handles the height, the detachable gooseneck lets the machine drive on, and extra axles carry the weight legally.' },
    ],
    related: [
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'Freight Moving', u: '../services/freight-moving.html' },
      { h: 'How Much Does Heavy Haul Cost?', u: 'how-much-does-heavy-haul-cost.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'what-is-industrial-rigging',
    cat: 'Rigging',
    hero: 'rigging-hero.jpg',
    date: '2026-06-06',
    title: 'What Is Industrial Rigging? A Plain-English Guide',
    desc: 'Industrial rigging explained: what riggers do, the equipment they use (cranes, gantries, jacks, skates, slings), common jobs, and why every lift is an engineering problem.',
    dek: 'Rigging is how heavy machines get lifted, moved, and set without wrecking the machine, the floor, or anyone nearby.',
    body: `
<p><strong>Industrial rigging</strong> is the planning and physical work of lifting, moving, and setting heavy machinery and equipment — safely, precisely, and usually in spaces that were never designed to get the thing in or out. If a load is too heavy for a forklift, too valuable to risk, or too awkward to muscle, you call a rigger.</p>

<h2>What riggers actually do</h2>
<p>A rigging crew moves loads that ordinary material handling can't. That breaks down into three jobs:</p>
<ul>
  <li><strong>Lift</strong> — get the load off the ground or off its foundation under full control.</li>
  <li><strong>Move</strong> — transport it across a shop floor, through a building, or onto a truck.</li>
  <li><strong>Set</strong> — place it exactly where it needs to go, then level and anchor it to spec.</li>
</ul>

<h2>The equipment</h2>
<ul>
  <li><strong>Cranes and gantries</strong> — for vertical lifts, from shop gantries to large mobile cranes.</li>
  <li><strong>Hydraulic jacks and gantry systems</strong> — to raise enormous loads in controlled increments where a crane can't reach.</li>
  <li><strong>Skates, rollers, and air skates</strong> — to slide heavy machines across a floor with precision.</li>
  <li><strong>Slings, shackles, and spreader bars</strong> — the hardware that actually connects the load to the lift, sized to the weight and the rigging plan.</li>
  <li><strong>Forklifts and versa-lifts</strong> — for the smaller end of the work.</li>
</ul>

<h2>Common rigging jobs</h2>
<ul>
  <li><strong>Machinery moving</strong> — relocating a single CNC machine, press, or generator.</li>
  <li><strong>Plant relocation</strong> — disconnecting, moving, and reinstalling an entire production line or facility.</li>
  <li><strong>Equipment installation (millwright work)</strong> — setting, leveling, and anchoring new machinery to manufacturer tolerances.</li>
  <li><strong>Specialized loads</strong> — sensitive equipment like <a href="how-to-move-an-mri-machine.html">MRI scanners and medical imaging</a> that demand monitored, shock-controlled handling.</li>
</ul>

<h2>Why it's an engineering problem first</h2>
<p>Good rigging is decided on paper before anyone touches the load. A proper plan accounts for the load's <strong>weight and center of gravity</strong>, crane <strong>load charts</strong> and radius, sling angles and rated capacities, and the <strong>floor loading</strong> along the path of travel. Skip that and you get dropped loads, cracked floors, and hurt people. That is why we measure dimensions, weights, and clearances — and why we treat every lift like the engineering job it is.</p>

<div class="keyfacts">
  <h3>Rigging vs. heavy haul — what's the difference?</h3>
  <p>Rigging is the lifting, moving, and setting of the load. <a href="../services/heavy-haul.html">Heavy haul</a> is transporting it over the road. The handoff between them is where jobs usually go wrong — which is why we do both in-house, so your machine gets rigged, hauled, and set by one accountable crew.</p>
</div>

<p>Got a machine that needs moving? <a href="../services/rigging.html">See our rigging service</a> or <a href="../contact.html">send us the specs and the site</a>.</p>
`,
    faq: [
      { q: 'What is the difference between rigging and heavy haul?', a: 'Rigging is lifting, moving, and setting a heavy load — often in tight spaces. Heavy haul is transporting it over the road. We do both in-house so one crew owns the whole move.' },
      { q: 'How heavy a load can a rigging crew move?', a: 'From a single pallet to presses and machinery over 200,000 lbs. The lift is matched to engineered rigging and the right equipment for the weight, dimensions, and access.' },
      { q: 'Do I need a rigger or a regular mover?', a: 'If the load is too heavy for a forklift, too valuable to risk, or too awkward to handle through your space, you need a rigger. Riggers bring the engineering, the gear, and the plan that ordinary movers don\'t.' },
    ],
    related: [
      { h: 'Industrial Rigging', u: '../services/rigging.html' },
      { h: 'How to Move an MRI Machine', u: 'how-to-move-an-mri-machine.html' },
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'truck-dispatcher-vs-freight-broker',
    cat: 'Dispatch',
    hero: 'dispatch-hero.jpg',
    date: '2026-06-09',
    title: 'Truck Dispatcher vs Freight Broker: What\'s the Difference?',
    desc: 'Dispatchers and brokers are not the same thing. Who each one works for, what they legally can and cannot do, and which one an owner-operator actually needs.',
    dek: 'They both touch loads and rates — but a dispatcher works for you, the carrier. A broker is the middleman. That difference is the whole point.',
    body: `
<p>Owner-operators get pitched by both "dispatchers" and "brokers," and the terms get blurred constantly. They are not the same role, and the difference is not just semantics — it changes who is on your side, who is legally responsible for what, and how you get paid.</p>

<h2>The short version</h2>
<div class="keyfacts">
  <h3>The core difference</h3>
  <p>A <strong>truck dispatcher</strong> works <em>for the carrier</em> — they are your agent, finding and booking loads on your behalf. A <strong>freight broker</strong> is the <em>middleman between the shipper and the carrier</em>, arranging transportation as an independent party. One works for you; the other sits between you and the freight.</p>
</div>

<h2>What a freight broker is</h2>
<p>A freight broker connects shippers who have freight with carriers who have trucks. Brokers operate under <strong>FMCSA broker authority</strong> (an MC number) and are required to carry a <strong>$75,000 surety bond (BMC-84)</strong>. They contract with the shipper, mark up the freight, and pay the carrier — and the spread between those two numbers is their margin. A good broker brings volume and handles the shipper relationship; the tradeoff is that they sit between you and the rate.</p>

<h2>What a truck dispatcher does</h2>
<p>A dispatcher is the carrier's back office. Working as <em>your</em> agent, a dispatcher will:</p>
<ul>
  <li><strong>Find and book loads</strong> that fit your truck, your lanes, and your home time</li>
  <li><strong>Negotiate rates</strong> on your behalf — pushing the rate up, not marking it down</li>
  <li><strong>Handle the paperwork</strong> — rate confirmations, carrier packets, BOLs, and follow-up</li>
  <li><strong>Plan routing</strong> to cut deadhead and keep the truck loaded</li>
  <li><strong>Deal with brokers and shippers</strong> so the driver can focus on driving</li>
</ul>
<p>A dispatcher acting purely as the carrier's agent generally does not need its own broker authority, because it is not brokering freight to third parties — it is representing one carrier.</p>

<h2>Which one do you need?</h2>
<p>If you are an owner-operator or small fleet and you want someone <strong>on your side of the table</strong> — keeping your wheels turning, fighting for your rate, and taking the admin off your plate — that is dispatching. If you are a shipper trying to move freight and you want someone to find capacity, that is a broker.</p>

<h2>How we dispatch</h2>
<p>We dispatch <em>for carriers</em> — you are the client, not the freight. Our <a href="../services/dispatching.html">truck dispatching service</a> sources loads, negotiates your rate up, and handles the paperwork, 24/7. And when you need actual capacity moved, our <a href="../services/freight-moving.html">freight moving</a> team can handle the load itself. Either way, you are dealing with a team that works for you.</p>

<p><a href="../contact.html">Talk to us about dispatch</a> and we'll keep your trucks loaded and rolling.</p>
`,
    faq: [
      { q: 'Is a truck dispatcher the same as a freight broker?', a: 'No. A dispatcher works for the carrier as their agent — finding loads and negotiating rates on the carrier\'s behalf. A broker is an independent middleman between shipper and carrier, operating under FMCSA broker authority and a $75,000 bond.' },
      { q: 'Does a truck dispatcher need an MC number or broker authority?', a: 'A dispatcher acting solely as the carrier\'s agent generally does not need its own broker authority, because it represents one carrier rather than brokering freight to third parties.' },
      { q: 'Do dispatchers get you better rates?', a: 'A good dispatcher negotiates on your behalf to push the rate up and reduce deadhead, and charges you a flat fee or percentage — versus a broker, whose margin comes from the spread between the shipper\'s rate and yours.' },
    ],
    related: [
      { h: 'Truck Dispatching', u: '../services/dispatching.html' },
      { h: 'Freight Moving', u: '../services/freight-moving.html' },
      { h: 'About Badass Logistics', u: '../about.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },
];

// ---------------------------------------------------------------------------
function articleHtml(post) {
  const url = `${site.domain}/blog/${post.slug}.html`;
  const faqList = post.faq.map(f => `
    <details><summary>${f.q}</summary><div class="a">${f.a}</div></details>`).join('');

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title.replace(/&amp;/g, '&'),
    "description": post.desc,
    "image": OG,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": { "@type": "Organization", "name": site.brand, "url": site.domain + "/" },
    "publisher": {
      "@type": "Organization",
      "name": site.brand,
      "logo": { "@type": "ImageObject", "url": `${site.domain}/assets/logo.png` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url }
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${site.domain}/` },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${site.domain}/blog/index.html` },
      { "@type": "ListItem", "position": 3, "name": post.title.replace(/&amp;/g, '&'), "item": url }
    ]
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map(f => ({
      "@type": "Question", "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title} | Badass Logistics</title>
<meta name="description" content="${post.desc}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141414">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${post.title}">
<meta name="twitter:description" content="${post.desc}">
<meta name="twitter:image" content="${OG}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" href="../assets/favicon.png">
<link rel="stylesheet" href="../css/styles.css">
${BLOG_CSS}
<script type="application/ld+json">
${JSON.stringify(articleSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Blog</a> / ${post.cat}</div>

<section class="page-hero photo" style="background-image:url('../assets/img/${post.hero}')"><div class="wrap">
  <span class="section-tag hand">// ${post.cat.toLowerCase()}</span>
  <h1>${post.title}</h1>
  <p class="lead">${post.dek}</p>
</div></section>

<section><div class="wrap">
  <article class="post prose post-body">
    <p class="meta">${post.cat} · ${new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    ${post.body.trim()}
    <div class="faq" style="margin-top:40px;">
      <h2>Frequently asked questions</h2>
      ${faqList}
    </div>
    <div class="related">
      <strong style="display:block;margin-bottom:12px;font-family:'Anton',sans-serif;font-size:20px;">Keep reading</strong>
      ${post.related.map(r => `<a href="${r.u}">${r.h}</a>`).join('\n      ')}
    </div>
  </article>
</div></section>

<div class="cta-band"><div class="wrap" style="padding-top:56px;padding-bottom:56px;text-align:center;">
  <h2>Got something heavy to move?</h2>
  <p>Tell us the load, the route, and the deadline. We'll handle the rest.</p>
  <a class="btn dark" href="../contact.html">Get a Free Quote</a>
</div></div>
${FOOTER}

</body>
</html>`;
}

function indexHtml() {
  const cards = POSTS.map(p => `
    <a class="blog-card" href="${p.slug}.html">
      <div class="thumb" style="background-image:url('../assets/img/${p.hero}')"></div>
      <div class="pad">
        <span class="cat">${p.cat}</span>
        <h3>${p.title}</h3>
        <p>${p.dek}</p>
      </div>
    </a>`).join('');

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Badass Logistics Blog",
    "url": `${site.domain}/blog/index.html`,
    "description": "Guides on heavy haul, rigging, oversize permits, dispatch, and freight moving from Badass Logistics.",
    "blogPost": POSTS.map(p => ({
      "@type": "BlogPosting",
      "headline": p.title.replace(/&amp;/g, '&'),
      "url": `${site.domain}/blog/${p.slug}.html`,
      "datePublished": p.date
    }))
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Heavy Haul, Rigging &amp; Freight Guides | Badass Logistics Blog</title>
<meta name="description" content="Practical guides on heavy haul cost, oversize load permits, industrial rigging, moving an MRI machine, trailer types, and truck dispatch — from the Badass Logistics crew.">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141414">
<link rel="canonical" href="${site.domain}/blog/index.html">
<meta property="og:type" content="website">
<meta property="og:title" content="Badass Logistics Blog — Heavy Haul, Rigging &amp; Freight Guides">
<meta property="og:description" content="Practical guides on heavy haul, rigging, oversize permits, dispatch, and freight moving.">
<meta property="og:url" content="${site.domain}/blog/index.html">
<meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${OG}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" href="../assets/favicon.png">
<link rel="stylesheet" href="../css/styles.css">
${BLOG_CSS}
<script type="application/ld+json">
${JSON.stringify(blogSchema, null, 2)}
</script>
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="../index.html">Home</a> / Blog</div>

<section class="page-hero"><div class="wrap">
  <span class="section-tag hand">// field notes</span>
  <h1>The <span class="y">Badass</span> Blog</h1>
  <p class="lead">No fluff — just straight answers on heavy haul cost, oversize permits, rigging, trailers, and dispatch from the crew that moves this stuff for a living.</p>
</div></section>

<section><div class="wrap">
  <div class="blog-grid">${cards}
  </div>
</div></section>

<div class="cta-band"><div class="wrap" style="padding-top:56px;padding-bottom:56px;text-align:center;">
  <h2>Got something heavy to move?</h2>
  <p>Tell us the load, the route, and the deadline. We'll handle the rest.</p>
  <a class="btn dark" href="../contact.html">Get a Free Quote</a>
</div></div>
${FOOTER}

</body>
</html>`;
}

// ---- write everything ----
const outDir = path.join(ROOT, 'blog');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
POSTS.forEach(p => fs.writeFileSync(path.join(outDir, `${p.slug}.html`), articleHtml(p)));
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml());

console.log(`✓ Built ${POSTS.length} blog articles + index in /blog`);
POSTS.forEach(p => console.log(`   - blog/${p.slug}.html`));
