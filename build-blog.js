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
<div class="topbar"><div class="wrap"><div>📍 48 locations nationwide &nbsp;·&nbsp; <strong>All 50 states</strong></div><div><a href="tel:${site.phoneHref}">📞 ${site.phone}</a> &nbsp;·&nbsp; <a href="../contact.html"><strong>Get a Quote</strong></a></div></div></div>
<header class="site-header"><div class="wrap">
  <a class="logo" href="../index.html"><span class="brand"><span class="l1">BADASS</span><span class="l2">LOGISTICS</span></span></a>
  <button class="nav-toggle" aria-label="Menu" onclick="document.getElementById('nav').classList.toggle('open')">☰</button>
  <nav class="main" id="nav">
    <a href="../index.html">Home</a><a href="../services/rigging.html">Rigging</a><a href="../services/heavy-haul.html">Heavy Haul</a><a href="../services/machinery-moving.html">Machinery Moving</a><a href="../locations.html">Locations</a><a href="../blog/index.html">Blog</a><a href="../about.html">About</a>
    <a class="btn" style="font-size:14px;padding:9px 16px;box-shadow:3px 3px 0 var(--ink)" href="../contact.html">Get a Quote</a>
  </nav>
</div></header>`;

const FOOTER = `
<footer><div class="wrap"><div class="cols">
  <div><h4>Badass Logistics</h4><p style="opacity:.85;max-width:280px;">Industrial rigging &amp; heavy haul — our own crews, machinery, and rigging gear, plus a network of specialized carriers for everything oversized and overweight.</p></div>
  <div><h4>Services</h4><a href="../services/rigging.html">Industrial Rigging</a><a href="../services/heavy-haul.html">Heavy Haul Transport</a><a href="../services/machinery-moving.html">Machinery Moving</a><a href="../services/cnc-machine-movers.html">CNC Machine Movers</a><a href="../services/plant-relocation.html">Plant Relocation</a></div>
  <div><h4>Company</h4><a href="../about.html">About Us</a><a href="../locations.html">Locations</a><a href="../blog/index.html">Blog</a><a href="../contact.html">Contact</a><a href="../privacy.html">Privacy</a></div>
  
</div><div class="covstrip">Coverage: <a href="../locations/texas.html">Texas</a> · <a href="../locations/california.html">California</a> · <a href="../locations/florida.html">Florida</a> · <a href="../locations/georgia.html">Georgia</a> · <a href="../locations/illinois.html">Illinois</a> · <a href="../locations/ohio.html">Ohio</a> · <a href="../locations/pennsylvania.html">Pennsylvania</a> · <a href="../locations/new-york.html">New York</a> · <a href="../locations.html"><strong>All 48 locations →</strong></a></div>
<div class="footer-nap"><span class="nap-name">Badass Logistics</span><span>1001 S Main St, STE 500, Kalispell, MT 59901</span><span><a href="tel:${site.phoneHref}">${site.phone}</a></span><span><a href="mailto:${site.email}">${site.email}</a></span></div><div class="legal"><span>© 2022–2026 Badass Logistics. All rights reserved.</span><span class="hand">made to move heavy things.</span></div></div></footer>`;

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
  .tldr { border:3px solid var(--ink); background:var(--yellow,#ffd21e); box-shadow:var(--shadow); padding:18px 24px; margin:6px 0 30px; }
  .tldr-tag { display:block; font-size:14px; letter-spacing:1px; text-transform:uppercase; opacity:.75; margin-bottom:4px; }
  .tldr p { font-size:19px; line-height:1.6; font-weight:600; margin:0; }
  .post-body figure { margin:26px 0; }
  .post-body figure img { width:100%; height:auto; border:3px solid var(--ink); box-shadow:var(--shadow); display:block; }
  .post-body figcaption { font-family:"Barlow",sans-serif; font-size:14px; opacity:.72; margin-top:8px; font-style:italic; }
  .post-body .takeaways { border-left:6px solid var(--yellow-deep); background:var(--paper,#f7f4ea); padding:16px 22px; margin:24px 0; }
  .post-body .takeaways h3 { margin:0 0 8px; font-size:18px; text-transform:uppercase; letter-spacing:.5px; }
  .post-body .takeaways li { margin-bottom:6px; }
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
    desc: 'Heavy haul is priced on dimensions, weight, permits, escorts, and trailer type — not a flat per-mile rate. A legal flatbed load, a permitted oversize load, and a superload are three different prices. Here is what drives the number.',
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
  <p class="hand" style="font-size:13px;opacity:.7;margin-top:8px;">Last reviewed June 2026</p>
</div>

<h2>How do you get an accurate heavy haul quote?</h2>
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

<p>Ready for a number? See our <a href="../services/heavy-haul.html">heavy haul trucking company</a> page or <a href="../contact.html">send us the specs for a fast quote</a>.</p>
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
      { h: 'Trailer Selector Tool', u: '../trailer-selector.html' },
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

<h2>What should you look for in an MRI rigging company?</h2>
<p>Look for a crew that treats the move as engineering, not muscle. In our MRI rigging work, the path of travel is surveyed before rig day — every doorway, corridor, elevator, and floor-load rating between the magnet room and the truck gets measured, and if the path does not work at ground level we plan a crane-in or crane-out instead of forcing it. The magnet itself — typically 5,000 to over 12,000 lbs for a superconducting unit — rides skates or rollers along that planned path, ships secured on air-ride equipment, and the whole schedule is coordinated with the OEM's field service engineers around ramp-down and cryogen handling. We have rigged and hauled MRI and medical equipment at live hospital sites on tight clinical timelines — the photos in this guide are from our own moves. See the <a href="../services/rigging.html">MRI &amp; medical equipment rigging</a> section of our rigging service for more.</p>

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

<h2>What equipment does a rigger use?</h2>
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
<p>At Badass Logistics, every lift starts on paper before anyone touches the load. A proper plan accounts for the load's <strong>weight and center of gravity</strong>, crane <strong>load charts</strong> and radius, sling angles and rated capacities, and the <strong>floor loading</strong> along the path of travel. Skip that and you get dropped loads, cracked floors, and hurt people. That is why we measure dimensions, weights, and clearances — and why we treat every lift like the engineering job it is.</p>

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
<p>A truck dispatcher works <em>for the carrier</em> — you are the client, not the freight. A dispatching service sources loads, negotiates the rate up, and handles the paperwork, 24/7, so the driver can focus on driving.</p>

<p><a href="../contact.html">Talk to us about dispatch</a> and we'll keep your trucks loaded and rolling.</p>
`,
    faq: [
      { q: 'Is a truck dispatcher the same as a freight broker?', a: 'No. A dispatcher works for the carrier as their agent — finding loads and negotiating rates on the carrier\'s behalf. A broker is an independent middleman between shipper and carrier, operating under FMCSA broker authority and a $75,000 bond.' },
      { q: 'Does a truck dispatcher need an MC number or broker authority?', a: 'A dispatcher acting solely as the carrier\'s agent generally does not need its own broker authority, because it represents one carrier rather than brokering freight to third parties.' },
      { q: 'Do dispatchers get you better rates?', a: 'A good dispatcher negotiates on your behalf to push the rate up and reduce deadhead, and charges you a flat fee or percentage — versus a broker, whose margin comes from the spread between the shipper\'s rate and yours.' },
    ],
    related: [
      { h: 'About Badass Logistics', u: '../about.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'how-to-ship-an-excavator',
    cat: 'Heavy Haul',
    hero: 'rgn-load.jpg',
    date: '2026-06-10',
    title: 'How to Ship an Excavator: Trailers, Permits & What It Costs',
    desc: 'Shipping an excavator the right way: choosing between RGN and lowboy, when you need oversize permits, how loading works, and what drives the transport price.',
    dek: 'A mini-ex rides a gooseneck. A 90,000-lb mining excavator is a multi-state permit project. Here is how to ship anything in between.',
    body: `
<p>Excavators are one of the most-shipped pieces of heavy equipment in the country — and one of the easiest to ship wrong. The same word covers a 7,000-lb mini-excavator and a 200,000-lb mining machine, and everything about the move (trailer, permits, escorts, price) changes with the size. Here is how to get it right the first time.</p>

<h2>Step 1: know your exact specs</h2>
<p>Before anyone can quote or plan the move, you need four numbers from the spec sheet (or a tape measure):</p>
<ul>
  <li><strong>Operating weight</strong> — not the "class," the actual pounds, with attachments.</li>
  <li><strong>Transport height</strong> — with the boom lowered and, if applicable, the cab folded.</li>
  <li><strong>Width</strong> — tracks or blade, whichever is wider.</li>
  <li><strong>Transport length</strong> — boom and stick in travel position.</li>
</ul>
<p>An inch matters here: 8'6" wide is legal almost everywhere; 8'7" needs a permit in every state it crosses. See our <a href="oversize-load-permits-guide.html">oversize permit guide</a> for the full limits.</p>

<h2>Step 2: match the machine to the trailer</h2>
<ul>
  <li><strong>Mini-excavators (under ~10,000 lbs):</strong> a heavy-duty tag or gooseneck trailer behind a one-ton — often a <a href="hot-shot-trucking-explained.html">hot shot</a> move.</li>
  <li><strong>Midi and small standard machines (10,000–25,000 lbs):</strong> step deck or small lowboy, usually still legal dimensions.</li>
  <li><strong>Standard excavators (25,000–80,000 lbs):</strong> RGN or lowboy. Height is the usual permit trigger — most 20-ton-plus machines run over 10' tall even with the boom down.</li>
  <li><strong>Large and mining-class (80,000 lbs+):</strong> multi-axle RGN, overweight permits in every state, often escorts. Some machines ship with the counterweight or boom removed and reinstalled — that's a <a href="../services/rigging.html">rigging job</a> on both ends.</li>
</ul>
<p>The RGN wins for most excavators because the detachable gooseneck turns the trailer into a ramp — the machine drives on under its own power. More in our <a href="flatbed-vs-step-deck-vs-rgn-trailers.html">trailer guide</a>.</p>

<div class="keyfacts">
  <h3>Why excavators usually need an RGN, not a flatbed</h3>
  <p>A 45,000-lb excavator is typically ~10' tall with the boom down. On a 5'-high flatbed that's 15' total — illegal everywhere. On a 2'-high RGN deck it's ~12' — legal or lightly-permitted. Deck height decides the move.</p>
</div>

<h2>Step 3: loading, securement, and the haul</h2>
<p>The machine drives onto the RGN under its own power (or gets winched if dead). Securement follows FMCSA rules: a minimum of four tie-downs on independent anchor points for heavy equipment, plus boom/attachment securement, with chains and binders rated for the load. Tracks get chocked, the blade and boom get lowered to the deck, and the operator's manual transport pins go in. Then it's a heavy haul move like any other — route, permits, and timing handled by the carrier.</p>

<h2>What it costs</h2>
<p>The same levers as all <a href="how-much-does-heavy-haul-cost.html">heavy haul pricing</a>: distance, weight class, whether dimensions trigger permits, escort requirements, and how far the right trailer has to deadhead to reach you. A legal-size mini-ex moves for a fraction of what a permitted 50-ton machine costs. Exact specs get you an exact number — guesses get you a guess.</p>

<p>Ready to move iron? See how we run <a href="../services/heavy-haul.html">heavy haul trucking for construction equipment</a> or <a href="../contact.html">send the machine's specs for a same-day quote</a>.</p>
`,
    faq: [
      { q: 'Do I need a permit to ship my excavator?', a: 'If the loaded dimensions exceed 8\'6" wide, 13\'6" total height, or 80,000 lbs gross combined weight, yes — in every state the load crosses. Most 20-ton-plus excavators trigger at least an over-height or overweight permit on an RGN.' },
      { q: 'What trailer do I need to ship an excavator?', a: 'Most standard excavators ship on an RGN or lowboy — the low deck handles the height and the detachable gooseneck lets the machine drive on. Mini-excavators can ride a heavy gooseneck or hot shot setup.' },
      { q: 'Can you ship a non-running excavator?', a: 'Yes — dead machines get winched or loaded with assist equipment instead of driving on. Tell us up front so the right gear is on the truck.' },
    ],
    related: [
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'Flatbed vs Step Deck vs RGN', u: 'flatbed-vs-step-deck-vs-rgn-trailers.html' },
      { h: 'Trailer Selector Tool', u: '../trailer-selector.html' },
      { h: 'Oversize Load Permits Guide', u: 'oversize-load-permits-guide.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'ltl-vs-ftl-freight',
    cat: 'Freight & Trucking',
    hero: 'brokerage-dryvan.jpg',
    date: '2026-06-10',
    title: 'LTL vs FTL Freight: Which One Actually Saves You Money?',
    desc: 'Less-than-truckload vs full truckload, explained with real decision rules: weight and pallet thresholds, transit time, handling risk, and when partial loads beat both.',
    dek: 'LTL is cheaper until it isn\'t. The real decision comes down to pallet count, fragility, and how much you care about the calendar.',
    body: `
<p>Every shipper learns the LTL-vs-FTL decision the expensive way: either paying for a whole truck they didn't fill, or watching a "cheap" LTL shipment arrive late, re-handled, and dinged. The rules of thumb below are how dispatchers actually make the call.</p>

<h2>The difference in one minute</h2>
<p><strong>FTL (full truckload)</strong>: the entire trailer is yours. One pickup, one delivery, nobody else's freight on board. <strong>LTL (less-than-truckload)</strong>: you pay for the space you use, and the carrier fills the rest of the trailer with other shippers' freight, routing everything through cross-dock terminals along the way.</p>

<h2>When LTL wins</h2>
<ul>
  <li><strong>1–6 pallets, under ~5,000 lbs.</strong> This is LTL's sweet spot — you'd be paying for 40 feet of empty deck on an FTL.</li>
  <li><strong>Flexible delivery windows.</strong> Terminal routing adds days and variability; if the date is soft, the savings are real.</li>
  <li><strong>Durable, well-packaged freight.</strong> LTL freight gets forklifted at every terminal. Crated and banded survives; shrink-wrap-and-hope doesn't.</li>
</ul>

<h2>When FTL wins</h2>
<ul>
  <li><strong>10+ pallets or 15,000+ lbs.</strong> At that volume the per-pallet math usually flips to FTL outright.</li>
  <li><strong>Tight deadlines.</strong> FTL is door-to-door with no terminal stops — the transit time is the drive time.</li>
  <li><strong>Fragile, high-value, or hard-to-replace freight.</strong> Zero re-handling means dramatically less damage risk. If a damaged shipment shuts your line down, FTL is cheap insurance.</li>
  <li><strong>Anything that can't be stacked or mixed</strong> — hazmat combinations, overlength pieces, freight that needs the doors opened once.</li>
</ul>

<div class="keyfacts">
  <h3>The middle path: partial / volume loads</h3>
  <p>Got 6–12 pallets? A <strong>partial truckload</strong> shares a trailer like LTL but skips the terminals — your freight stays on one truck with one or two other direct shipments. Cheaper than FTL, gentler and faster than LTL. It's one of the most underused options in freight.</p>
</div>

<h2>The hidden LTL costs people forget</h2>
<p>LTL pricing runs on freight class, dimensions, and accessorials — and the surprises live in the accessorials: liftgate fees, residential delivery, limited-access pickups, reweigh corrections, and detention. A quoted LTL rate can grow 30–40% by the time it hits your invoice. When you compare against FTL or partial, compare <em>landed</em> cost, not the base quote.</p>

<h2>How we run it</h2>
<p>We quote FTL, LTL, and partial side by side, in dry van, reefer, and flatbed — and tells you straight which one the math favors for your lane. If it's oversized, it graduates to <a href="../services/heavy-haul.html">heavy haul</a>. Either way you get one answer instead of three vendors.</p>

<p><a href="../contact.html">Send us the pallet count, weight, and lane</a> — we'll price it both ways.</p>
`,
    faq: [
      { q: 'At what weight should I switch from LTL to FTL?', a: 'As a rule of thumb, shipments over roughly 10–12 pallets or 15,000 lbs usually price better as full truckload — and partial truckload often wins in the 6–12 pallet middle zone. Compare landed cost including accessorials, not base rates.' },
      { q: 'Why did my LTL shipment take so long?', a: 'LTL freight routes through carrier terminals where it is unloaded, sorted, and reloaded between trucks. Each cross-dock adds time and variability. FTL and partial loads skip terminals entirely.' },
      { q: 'What is partial truckload?', a: 'A shared trailer without terminal handling — your freight rides with one or two other direct shipments and stays on the same truck door to door. It typically beats LTL on speed and damage risk and beats FTL on price for 6–12 pallets.' },
    ],
    related: [
      { h: 'What Is Drayage?', u: 'what-is-drayage.html' },
      { h: 'Hot Shot Trucking Explained', u: 'hot-shot-trucking-explained.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'what-is-drayage',
    cat: 'Freight & Trucking',
    hero: 'loads/load-reels-container.jpg',
    date: '2026-06-10',
    title: 'What Is Drayage? Container Trucking From Port to Door, Explained',
    desc: 'Drayage is the short-haul truck move that gets shipping containers from ports and rail ramps to warehouses. How it works, what per diem and demurrage really mean, and how to avoid the fees.',
    dek: 'Your container crossed the ocean for cheap. The last 40 miles is where the fees hide — and where drayage saves or costs you thousands.',
    body: `
<p><strong>Drayage</strong> is the short-haul trucking that moves shipping containers between a port or rail ramp and a nearby warehouse, yard, or doorstep. It's the shortest leg of an international shipment and routinely the most operationally painful — because it's where ocean schedules, terminal appointments, chassis availability, and free-time clocks all collide.</p>

<h2>How a drayage move works</h2>
<p>Drayage is the short-haul truck move that picks up your shipping container from a port terminal or rail ramp and delivers it to your warehouse — usually within about 50 miles. A credentialed driver with a TWIC card and a terminal appointment picks the box up on a chassis inside the port's free-time window, then either live-unloads at your dock or drops the container for a later pickup. The critical variable is not the truck rate; it is whether the box moves before free time expires. Miss that window and demurrage charges from the terminal and per-diem charges from the ocean carrier start stacking daily — typically $75 to several hundred dollars per container, per day. Step by step, it looks like this:</p>
<ul>
  <li><strong>Your container discharges</strong> from the vessel (or arrives at the rail ramp) and the terminal makes it available for pickup.</li>
  <li><strong>The clock starts.</strong> Terminals give a few free days ("free time") before storage charges — <strong>demurrage</strong> — begin accruing daily.</li>
  <li><strong>A drayage driver with port credentials</strong> (TWIC card, terminal appointments, UIIA interchange agreement) picks up the box on a chassis.</li>
  <li><strong>The container is delivered</strong> to your dock — either live-unloaded while the driver waits, or dropped and picked up later.</li>
  <li><strong>The empty goes back.</strong> Keep the container or chassis past the rental free time and <strong>per diem / detention</strong> charges stack daily until it's returned.</li>
</ul>

<div class="keyfacts">
  <h3>The fee glossary that saves you money</h3>
  <p><strong>Demurrage:</strong> the terminal charging you for the container sitting at the port past free time.<br>
  <strong>Per diem (detention):</strong> the ocean carrier charging you for keeping their container/chassis out too long.<br>
  <strong>Chassis split:</strong> an extra trip because the chassis wasn't where the container was.<br>
  These run from roughly $75 to several hundred dollars per container per day — and they compound fast over a weekend.</p>
  <p class="hand" style="font-size:13px;opacity:.7;margin-top:8px;">Last reviewed June 2026</p>
</div>

<h2>Why drayage goes wrong</h2>
<p>Almost every drayage horror story is a timing story: the container discharged Friday, free time ran out Tuesday, nobody had an appointment until Thursday. A good drayage operation watches vessel ETAs, books terminal appointments before the box hits the ground, secures the chassis, and lines up your dock door — so the container moves inside free time and the fee clocks never start.</p>

<h2>Drayage + everything after it</h2>
<p>A container rarely ends its journey at the first warehouse. We handle the dray, the <a href="ltl-vs-ftl-freight.html">LTL/FTL distribution</a> after deconsolidation, and — when what's inside the box is a machine — the <a href="../services/rigging.html">rigging</a> to take it off the floor and set it in place. Port cities like <a href="../locations/houston-tx.html">Houston</a>, <a href="../locations/charleston-sc.html">Charleston</a>, <a href="../locations/norfolk-va.html">Norfolk</a>, and <a href="../locations/los-angeles-ca.html">Los Angeles</a> are exactly where our drayage and heavy work overlap.</p>

<p>Got boxes hitting a port? <a href="../contact.html">send us the ETA and the delivery address</a> — we'll keep the clocks at zero.</p>
`,
    faq: [
      { q: 'What is the difference between drayage and trucking?', a: 'Drayage is a specialized subset of trucking: short-haul container moves to and from ports and rail ramps, requiring port credentials (TWIC), terminal appointments, interchange agreements, and chassis management that ordinary OTR trucking doesn\'t involve.' },
      { q: 'What is the difference between demurrage and per diem?', a: 'Demurrage is charged by the terminal for the container sitting at the port past free time. Per diem (detention) is charged by the ocean carrier for keeping the container or chassis out past its return window. Both accrue daily.' },
      { q: 'How much does drayage cost?', a: 'The truck move itself is priced by distance, port, and whether it\'s a live unload or a drop. The real budget risk is the fee side — demurrage, per diem, and chassis charges — which good scheduling avoids entirely.' },
    ],
    related: [
      { h: 'LTL vs FTL Freight', u: 'ltl-vs-ftl-freight.html' },
      { h: 'All Locations', u: '../locations.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'hot-shot-trucking-explained',
    cat: 'Dispatch',
    hero: 'loads/load-oversize-tank.jpg',
    date: '2026-06-10',
    title: 'Hot Shot Trucking Explained: When a One-Ton Beats a Semi',
    desc: 'What hot shot trucking is, the truck-and-gooseneck setup, what loads fit, CDL and MC requirements, and when hot shot beats a full-size semi on speed and price.',
    dek: 'A dually pickup, a 40-foot gooseneck, and a driver who leaves NOW. That\'s hot shot — and for the right load it beats a semi every time.',
    body: `
<p><strong>Hot shot trucking</strong> is expedited freight hauled with a medium-duty pickup (think one-ton dually) pulling a 30–40 foot gooseneck trailer, instead of a class-8 semi. It exists for one reason: when a load is urgent and doesn't need a full trailer, a hot shot leaves immediately and costs less than dispatching a semi.</p>

<h2>Where hot shot came from — and where it shines</h2>
<p>The name comes from the oilfield: a part breaks on a rig, the rig is burning thousands of dollars an hour, and somebody drives the replacement out <em>right now</em>. That's still the core use case, and it generalizes:</p>
<ul>
  <li><strong>Time-critical parts and equipment</strong> — a machine down at a plant, a contractor's skid steer needed on site tomorrow morning.</li>
  <li><strong>Small equipment moves</strong> — mini-excavators, attachments, compressors, generators, pallets of steel.</li>
  <li><strong>Loads under ~16,500 lbs and within legal dimensions</strong> — the practical ceiling for most hot shot rigs.</li>
  <li><strong>Lanes a semi doesn't want</strong> — short notice, odd hours, rural pickups, partial loads that would otherwise wait days for consolidation.</li>
</ul>

<div class="keyfacts">
  <h3>Hot shot vs. semi: the quick math</h3>
  <p>A hot shot wins when the load fits (weight under ~16,500 lbs, length under ~40') and the clock matters — you're paying for one dedicated, fast vehicle instead of waiting on semi availability. A semi wins on full loads, heavy loads, and long lanes where per-mile economics favor the big truck.</p>
</div>

<h2>The regulatory reality (it's still trucking)</h2>
<p>Hot shot is not a loophole. Run commercially across state lines and the rig needs <strong>DOT and MC operating authority</strong>, insurance, and — once the truck-plus-trailer combined weight rating crosses 26,001 lbs with a trailer over 10,000 lbs — a <strong>CDL</strong>. Hours-of-service and ELD rules apply like any other carrier. Loads still get secured to FMCSA standards, and an over-width piece on a gooseneck needs the same <a href="oversize-load-permits-guide.html">permits</a> as anything else.</p>

<h2>Where dispatch makes or breaks hot shot</h2>
<p>Hot shot economics live and die on deadhead. The truck only earns loaded, and small trucks burn margin fast running empty between jobs. That's exactly the problem a good dispatcher solves for owner-operators: keeping the calendar full, stacking loads in sensible lanes, negotiating the rate up, and handling the paperwork while the driver drives. And when a load is too big for a hot shot, we move it on the right equipment through <a href="../services/heavy-haul.html">heavy haul</a> instead of forcing it onto the wrong trailer.</p>

<p>Need something moved yesterday — or running a hot shot rig that needs loads? <a href="../contact.html">Talk to us</a>; both sides of that problem are our job.</p>
`,
    faq: [
      { q: 'How much weight can a hot shot truck haul?', a: 'Practically, most one-ton hot shot setups carry up to roughly 16,000–16,500 lbs of cargo on a 40-foot gooseneck before combined weight ratings and axle limits cap them. Heavier loads belong on a semi or an RGN.' },
      { q: 'Does hot shot trucking require a CDL?', a: 'Yes, in most commercial configurations: once the combined weight rating of the truck and trailer exceeds 26,001 lbs with a trailer rated over 10,000 lbs, interstate commercial operation requires a CDL — and DOT/MC authority, insurance, and hours-of-service rules apply regardless.' },
      { q: 'Is hot shot cheaper than regular freight?', a: 'For small, urgent loads, usually — you avoid paying for a full semi or waiting for consolidation. For full or heavy loads, a semi\'s per-mile economics win. The decision is load size plus urgency.' },
    ],
    related: [
      { h: 'Truck Dispatcher vs Freight Broker', u: 'truck-dispatcher-vs-freight-broker.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'pilot-car-escort-requirements',
    cat: 'Permits & Compliance',
    hero: 'heavyhaul-real.jpg',
    date: '2026-06-10',
    title: 'Pilot Car & Escort Requirements for Oversize Loads: The Practical Guide',
    desc: 'When an oversize load needs pilot cars, what escorts actually do, height poles, police escorts, certification rules, and why escort planning decides your delivery date.',
    dek: 'Past a certain width, your load legally cannot move without escort vehicles. Here is when that happens and how the whole system works.',
    body: `
<p>Pilot cars — escort vehicles — are the part of oversize trucking the public actually sees: the pickups with the flashing ambers and "OVERSIZE LOAD" signs bracketing something enormous on the highway. They are not decoration. Past certain dimensions they are a legal requirement in every state, and getting them wrong strands loads.</p>

<h2>What escorts actually do</h2>
<ul>
  <li><strong>Warn traffic</strong> ahead of and behind the load so vehicles aren't surprised by something 14 feet wide around a curve.</li>
  <li><strong>Run the height pole.</strong> On over-height loads, the lead car carries a flexible pole set just above load height — if the pole strikes a bridge or wire, the convoy stops before the load does. This is the single cheapest insurance in heavy haul.</li>
  <li><strong>Block and manage</strong> lane changes, turns, and bridge crossings where the load needs both lanes.</li>
  <li><strong>Communicate</strong> continuously with the driver about obstructions, traffic, and clearances the driver can't see.</li>
</ul>

<h2>When you need them</h2>
<p>Exact thresholds are set state by state, but the pattern is consistent enough to plan around:</p>
<div class="keyfacts">
  <h3>Typical escort triggers</h3>
  <p><strong>~12' wide:</strong> one escort on two-lane roads in most states; many require one on interstates too.<br>
  <strong>~14' wide:</strong> two escorts (front and rear) almost everywhere.<br>
  <strong>Over-height (over ~14'6"–15'):</strong> lead car with height pole.<br>
  <strong>Overlength (90'–100'+):</strong> rear escort in most states.<br>
  <strong>Extreme dimensions / superloads:</strong> police escort, sometimes with rolling road closures and utility crews lifting lines.</p>
</div>
<p>Because each state on the route sets its own rules, a single cross-country move can need different escort configurations in different states — the plan changes at the state line, and the <a href="oversize-load-permits-guide.html">permits</a> spell out exactly what's required where.</p>

<h2>Who can escort</h2>
<p>A growing list of states requires <strong>certified</strong> pilot car operators — trained, tested, insured, and equipped to spec (signs, flags, lights, radios, height pole, stop paddle). Certifications from one state are honored by many others, but not all; part of route planning is making sure the escorts booked are legal in every state they'll cross.</p>

<h2>Why this decides your delivery date</h2>
<p>Escorted loads move on the schedule of the most restrictive state on the route: daylight-only travel, no rush-hour metro transits, weekend and holiday bans. Add escort availability in rural areas and the difference between a clean plan and a bad one is measured in days. When we run a <a href="../services/heavy-haul.html">heavy haul move</a>, escort booking, permit conditions, and travel windows are planned as one system — so the load keeps rolling instead of waiting on a missing pilot car. It's also a meaningful line in <a href="how-much-does-heavy-haul-cost.html">what the move costs</a>: every escort is a vehicle, a driver, and a day.</p>

<p>Moving something wide, tall, or long? <a href="../contact.html">Send the dimensions and the route</a> — we'll tell you exactly what it triggers.</p>
`,
    faq: [
      { q: 'At what width does a load need a pilot car?', a: 'In most states, one escort around 12 feet wide and two escorts (front and rear) around 14 feet. Exact thresholds vary by state and road type — the permit for each state on the route specifies the requirement.' },
      { q: 'What does the height pole on a pilot car do?', a: 'It rides on the lead escort, set slightly taller than the load. If the pole strikes a bridge, sign, or wire, the convoy stops before the load hits — preventing catastrophic bridge and load damage on over-height moves.' },
      { q: 'How much does a pilot car cost?', a: 'Escorts are typically priced per mile plus daily minimums, and a multi-day move pays for each escort vehicle for the duration. On wide superloads with police escorts, escort costs can rival the freight itself — which is why they\'re factored into the quote up front.' },
    ],
    related: [
      { h: 'Oversize Load Permits Guide', u: 'oversize-load-permits-guide.html' },
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'How Much Does Heavy Haul Cost?', u: 'how-much-does-heavy-haul-cost.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'how-to-move-a-cnc-machine',
    cat: 'Rigging',
    hero: 'loads/load-machine-loadout.jpg',
    date: '2026-06-10',
    title: 'How to Move a CNC Machine Without Wrecking It',
    desc: 'Moving a CNC machine or machining center: OEM prep, rigging with toe jacks and skates, why you never lift from the wrong points, transport on air-ride, and re-leveling at the destination.',
    dek: 'A CNC machine is a precision instrument that weighs as much as a truck. Moving one is equal parts paperwork, physics, and patience.',
    body: `
<p>A CNC machine is the worst combination of properties a load can have: extremely heavy (5,000 to 60,000+ lbs), top-heavy with a high center of gravity, full of precision-ground surfaces that hold tolerances in ten-thousandths — and usually parked in the middle of a working shop with 30 inches of clearance on either side. This is precisely the job <a href="what-is-industrial-rigging.html">industrial rigging</a> exists for.</p>

<h2>Before anything moves: machine prep</h2>
<ul>
  <li><strong>Power down and lock out</strong> — electrical disconnect by a qualified electrician, air and coolant lines drained and capped.</li>
  <li><strong>Secure the moving axes.</strong> The spindle head, table, and tool changer get brought to their transport positions and locked with the OEM's shipping brackets or fabricated bracing. An unsecured axis sliding mid-lift can destroy ways and ballscrews.</li>
  <li><strong>Remove what should travel separately</strong> — tooling, chip conveyor, probes, sheet-metal guarding that blocks rigging points.</li>
  <li><strong>Photograph and document everything</strong> — connections, leveling-foot positions, alignment references — so reassembly isn't archaeology.</li>
</ul>

<h2>The lift: where machines get ruined</h2>
<p>CNC machines have <strong>designated lift points</strong> in the manual, and only those. Lift from the casting in the wrong place — or worse, pry under the sheet metal — and you twist the machine's geometry; it'll power on fine and never cut straight again. The standard rigging sequence:</p>
<ul>
  <li><strong>Toe jacks</strong> raise the machine inches at a time from the proper jacking points.</li>
  <li><strong>Machine skates</strong> (or air skates on delicate floors) go underneath, and the machine rolls along a planned, floor-load-checked path.</li>
  <li>Where a vertical lift is needed, it's a <strong>gantry or crane pick from the manual's lift points</strong>, slings padded and angles kept inside spec, with the high center of gravity respected at every step.</li>
</ul>

<div class="keyfacts">
  <h3>The numbers that matter</h3>
  <p>Weight and C.G. from the manual, not a guess · doorway and path clearances measured to the inch · floor capacity along the route · lift points per the OEM · transport on air-ride only · re-level at destination to the builder's spec before first cut.</p>
</div>

<h2>Transport and reinstallation</h2>
<p>Machining centers ride <strong>air-ride trailers</strong>, tarped or shrink-wrapped against weather, often with shock indicators on the crate. Oversized machines move as <a href="../services/heavy-haul.html">heavy haul</a> with the same permit logic as any big load. At the destination the process reverses — skate in, set on the new pad, then <strong>level to the manufacturer's spec</strong> and recommission. Leveling isn't cosmetic: machine geometry, circularity, and positioning accuracy all start from a level casting.</p>

<p>One crew that rigs it out, hauls it, and sets it back down — that's the whole point of doing <a href="../services/rigging.html">rigging</a> and transport under one roof. Moving a VMC, lathe, or a whole machine shop? <a href="../contact.html">Send us the model list and both floor plans</a> — we'll plan the move machine by machine.</p>
`,
    faq: [
      { q: 'How much does it cost to move a CNC machine?', a: 'Drivers are machine weight and size, rigging complexity at both ends (clearances, floor capacity, crane vs. skate), distance, and OEM prep requirements. A small VMC across town is a different job than a 40,000-lb horizontal machining center across the country — send the model and both site layouts for a real number.' },
      { q: 'Can I move a CNC machine with a forklift?', a: 'Only if the manual explicitly allows fork lifting at designated points and the truck has the capacity at that load center — many machines are too heavy, too top-heavy, or have no safe fork pockets. Lifting from the wrong points can permanently distort machine geometry.' },
      { q: 'Does a CNC machine need to be re-leveled after a move?', a: 'Yes, always. The machine must be set on its new foundation and leveled to the builder\'s specification before cutting — geometry, accuracy, and repeatability all depend on it. Plan for leveling and recommissioning time in the move schedule.' },
    ],
    related: [
      { h: 'Industrial Rigging', u: '../services/rigging.html' },
      { h: 'What Is Industrial Rigging?', u: 'what-is-industrial-rigging.html' },
      { h: 'How to Move an MRI Machine', u: 'how-to-move-an-mri-machine.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'how-to-ship-industrial-machinery-on-a-flatbed',
    cat: 'Heavy Haul',
    hero: 'loads/heavy-haul-industrial-enclosures-flatbed.jpg',
    date: '2026-06-27',
    title: 'How to Ship Large Industrial Machinery on a Flatbed',
    desc: 'Shipping oversized industrial equipment on a flatbed comes down to five things: the right trailer, a real load plan, blocking and bracing, secure tie-downs, and permits. Here is how a heavy, awkward machine gets from plant to plant intact.',
    dek: 'Big, heavy, awkward — and it still has to ride legal and arrive undamaged. Here is how oversized machinery moves on a flatbed, step by step.',
    tldr: 'To ship large industrial machinery on a flatbed: pick a trailer that keeps the load under 13\'6" tall (flatbed, step deck, or RGN), center the weight over the axles, block and brace against movement in every direction, strap or chain to the load\'s rated points, tarp against weather, and permit any dimension over legal limits before the wheels turn.',
    keywords: 'ship industrial machinery, flatbed shipping, heavy equipment transport, oversized machinery, load securement, machinery moving',
    howto: {
      name: 'How to Ship Large Industrial Machinery on a Flatbed',
      totalTime: 'P2D',
      steps: [
        { name: 'Spec the trailer', text: 'Choose a flatbed, step deck, or RGN based on the load height and weight so the shipment stays within the 13\'6" legal height and axle limits.' },
        { name: 'Build the load plan', text: 'Position the machine so its weight sits over the trailer axles with a low, centered center of gravity before loading.' },
        { name: 'Block and brace', text: 'Stop movement in every direction with hardwood dunnage, chocks, cleats, and cradles before applying any tie-down.' },
        { name: 'Secure to rated points', text: 'Strap or chain the load to its engineered lash points or skid, with total tie-down capacity of at least half the cargo weight, using edge protectors.' },
        { name: 'Tarp and mark', text: 'Tarp or shrink-wrap weather-sensitive equipment and add OVERSIZE LOAD banners, flags, and lights if any dimension exceeds legal limits.' },
        { name: 'Permit and route', text: 'Pull oversize and overweight permits for every state on the route, survey for clearances, and book pilot cars where required.' },
      ],
    },
    body: `
<p>A CNC machine, a dust collector the size of a truck, a transformer, a fabricated skid — sooner or later it has to leave the plant on a truck. Flatbed shipping is how most oversized industrial equipment moves, and the difference between a clean delivery and a wrecked machine is all in the prep. Here is exactly how our crews put a big, heavy, awkward load on a deck and get it there legal and intact.</p>

<figure>
  <img src="../assets/img/loads/flatbed-industrial-dust-collectors-strapped.jpg" alt="Row of industrial dust-collector housings crated on wooden skids and strapped down across a gooseneck flatbed trailer" loading="lazy" width="1131" height="848">
  <figcaption>Five industrial units, crated on skids, blocked and strapped as one stable load — a real Badass Logistics flatbed haul.</figcaption>
</figure>

<h2>1. Spec the right trailer</h2>
<p>Trailer choice comes down to two numbers: <strong>height</strong> and <strong>weight</strong>. A standard flatbed sits about five feet off the ground, so anything much over 8'6" tall on a flatbed blows past the 13'6" legal height. Drop to a <strong>step deck</strong> and you gain roughly a foot of legal height; drop to an <strong>RGN (double-drop)</strong> and you gain several feet in the well for the tallest machines. Heavier than a standard axle setup can legally carry? Now you are into multi-axle RGNs and weight permits. We match the deck to the load — see <a href="flatbed-vs-step-deck-vs-rgn-trailers.html">flatbed vs step deck vs RGN</a> for the full breakdown.</p>

<h2>2. Build the load plan before anything moves</h2>
<p>Where the machine sits on the deck is not eyeballed. The weight has to sit <strong>over the trailer axles</strong> to stay within axle limits, with the center of gravity low and centered so the rig tracks straight. For an off-center or top-heavy machine, that plan also decides where the blocking goes and which tie-down points carry the load. Get it wrong and you either overload an axle or watch the load shift on the first hard brake.</p>

<h2>3. Block, brace, and cradle</h2>
<p>Securement starts with stopping movement in every direction before a single strap goes on. That means <strong>hardwood dunnage</strong> under and around the load, chocks and cleats nailed to the deck, and cradles for anything round or tippy. Crated machinery rides on its skid; uncrated machinery gets bearing points that match its frame — never its sheet metal.</p>

<figure>
  <img src="../assets/img/loads/flatbed-load-securement-yellow-straps.jpg" alt="Yellow ratchet straps, edge protectors, and wood dunnage securing crated industrial equipment to a flatbed deck" loading="lazy" width="1131" height="848">
  <figcaption>Straps to the rated points, edge protection on every corner, dunnage carrying the weight — securement you can see.</figcaption>
</figure>

<h2>4. Strap or chain to rated points</h2>
<p>Federal cargo-securement rules set the floor: total tie-down capacity has to be at least <strong>half the cargo weight</strong>, and heavy machinery needs tie-downs rated for the job. <strong>Straps</strong> handle crated and lighter loads; <strong>chains and binders</strong> handle heavy iron and anything that has to be pinned hard to the deck. Tie to the machine's <strong>engineered lift and lash points</strong> or its skid — never over a control panel, a casting, or thin sheet metal. Edge protectors keep straps from cutting on sharp corners.</p>

<h2>5. Tarp and mark it</h2>
<p>Weather-sensitive equipment gets <strong>tarped or shrink-wrapped</strong> — electronics, machined surfaces, and painted housings do not travel naked through road spray and grit. If any dimension crosses a legal limit, the load also gets <strong>OVERSIZE LOAD banners, flags, and lights</strong>, with the exact marker requirements riding on the permit.</p>

<figure>
  <img src="../assets/img/loads/gooseneck-flatbed-industrial-tanks.jpg" alt="Industrial enclosures loaded on a gooseneck flatbed trailer, deck height chosen to keep a tall load within legal limits" loading="lazy" width="1024" height="576">
  <figcaption>Deck choice is a legal decision: the right trailer keeps a tall load under the 13'6" line without a height permit.</figcaption>
</figure>

<h2>6. Permit the load and survey the route</h2>
<p>Anything over 8'6" wide, 13'6" tall, about 53' long, or 80,000 lbs gross needs a permit in <strong>every state it passes through</strong>, and wide or tall loads may need pilot cars. The route gets surveyed for low bridges, weight-restricted roads, and tight turns before dispatch — the shortest line on the map is not always the legal one. We handle permitting and escorts as part of the move; here is <a href="oversize-load-permits-guide.html">how oversize permitting actually works</a>.</p>

<div class="takeaways">
  <h3>Bottom line</h3>
  <ul>
    <li>Trailer is chosen by height and weight — flatbed, step deck, or RGN.</li>
    <li>Weight rides over the axles; the load plan comes before the load.</li>
    <li>Block and brace first, then strap or chain to rated points.</li>
    <li>Tarp the sensitive stuff; permit and survey anything oversized.</li>
  </ul>
</div>

<p>Have a machine that needs to move? This is exactly what our <a href="../services/machinery-moving.html">machinery moving</a> and <a href="../services/heavy-haul.html">heavy haul</a> crews do every week. <a href="../contact.html">Send the dimensions, weight, and a photo</a> and we will spec the trailer and quote the lane.</p>
`,
    faq: [
      { q: 'What trailer is used to ship heavy industrial machinery?', a: 'It depends on height and weight. A standard flatbed works for loads under about 8\'6" tall; a step deck adds roughly a foot of legal height; an RGN (double-drop) carries the tallest and heaviest machines in its low well. Weight beyond standard limits moves on multi-axle RGNs with overweight permits.' },
      { q: 'How is a machine secured on a flatbed?', a: 'It is blocked and braced with dunnage, chocks, and cradles to stop movement, then strapped or chained to its rated lash points or skid. Federal rules require total tie-down capacity of at least half the cargo weight, plus edge protection and, for heavy iron, chains and binders.' },
      { q: 'Do I need a permit to ship a large machine?', a: 'Only if it crosses a legal limit — over 8\'6" wide, 13\'6" tall, about 53\' long, or 80,000 lbs gross. Then it needs an oversize and/or overweight permit for every state on the route, and wide or tall loads may require pilot cars. We handle permitting and escorts as part of the move.' },
    ],
    related: [
      { h: 'Machinery Moving', u: '../services/machinery-moving.html' },
      { h: 'Flatbed vs Step Deck vs RGN', u: 'flatbed-vs-step-deck-vs-rgn-trailers.html' },
      { h: 'Trailer Selector Tool', u: '../trailer-selector.html' },
      { h: 'How Much Does Heavy Haul Cost?', u: 'how-much-does-heavy-haul-cost.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'how-to-transport-a-ct-scanner',
    cat: 'Specialized Rigging',
    hero: 'loads/ct-scanner-medical-imaging-move.jpg',
    date: '2026-06-29',
    title: 'How to Transport a CT Scanner Without a Six-Figure Mistake',
    desc: 'A CT scanner is heavy, precision-aligned, and worth more than the truck it rides in. Moving one means de-installing to OEM spec, rigging each component out through tight hospital corridors, air-ride transport, and reinstallation with recalibration. Here is the process.',
    dek: 'Heavy, delicate, and worth more than the truck. Here is how a CT scanner comes off its pad, out of the building, and back online.',
    tldr: 'Transporting a CT scanner means de-installing the gantry and table to the manufacturer\'s procedure, protecting and rigging each component through the building on skates, hauling on an enclosed air-ride trailer with shock and tilt indicators, then reinstalling and coordinating OEM recalibration on site. It is a rigging job first and a trucking job second.',
    keywords: 'transport CT scanner, move CT scanner, medical imaging equipment moving, CT gantry rigging, hospital equipment relocation',
    body: `
<p>A CT scanner does not move like furniture. The gantry alone can run several thousand pounds, the components are precision-aligned, and the whole system is worth more than most of the vehicles on the road. Move it wrong and you are not paying for a repair — you are paying for a replacement plus the downtime of a dark imaging suite. Here is how it is done right.</p>

<h2>It is a rigging job, not a delivery</h2>
<p>The truck is the easy part. The hard part is getting a multi-thousand-pound gantry out of an imaging suite that was built <em>around</em> it — through doorways, around corners, down corridors never meant for something that size. That is <a href="../services/rigging.html">industrial rigging</a>: skates, stair-climbers, gantry lifts, and door-and-path measurements taken to the inch before anything moves.</p>

<h2>1. De-install to the manufacturer's procedure</h2>
<p>Imaging OEMs publish a de-installation procedure for a reason. The gantry and patient <strong>table</strong> come apart into defined transport components, covers come off or get protected, and moving locks go on to keep the rotating assembly from turning in transit. Skip a step here and alignment gets destroyed before the machine ever reaches the dock.</p>

<figure>
  <img src="../assets/img/loads/ct-scanner-medical-imaging-move.jpg" alt="GE Optima CT scanner gantry and patient table prepared for de-installation and rigging out of a hospital imaging suite" loading="lazy" width="1050" height="1400">
  <figcaption>A GE Optima CT scanner staged for de-install — gantry and table separated and prepped before the rig-out.</figcaption>
</figure>

<h2>2. Rig it out of the building</h2>
<p>Each component gets padded, wrapped, and moved on <strong>air-cushion skates or a stair-climber</strong> along the surveyed path. Floor protection goes down, door frames get protected, and the crew controls every pivot. This is where the clearances you measured on paper meet the real corner — and why the survey happens first.</p>

<h2>3. Transport on air-ride, monitored</h2>
<p>Imaging equipment rides on <strong>air-ride suspension</strong> only — the entire point is to keep road shock off precision components. The load is blocked, braced, and secured upright, usually with <strong>shock and tilt indicators</strong> on the crate so anyone can see if it was dropped or laid over. Sensitive electronics travel enclosed and shielded, not open to the weather.</p>

<figure>
  <img src="../assets/img/loads/ct-mri-scanner-enclosed-air-ride.jpg" alt="CT scanner shrink-wrapped and secured on lift equipment inside an enclosed air-ride trailer for hospital transport" loading="lazy" width="800" height="600">
  <figcaption>Scanner secured upright inside an enclosed trailer on air-ride — shock kept off the components, weather kept out.</figcaption>
</figure>

<h2>4. Reinstall and recalibrate</h2>
<p>At the destination the process reverses: rig in along a surveyed path, set on the pad, reassemble, and remove the moving locks. Then the <strong>OEM field engineer recalibrates</strong> and the scanner is re-qualified before it images a single patient. Our job is to deliver it undamaged and on schedule so recommissioning starts on time.</p>

<div class="takeaways">
  <h3>What actually matters</h3>
  <ul>
    <li>Follow the OEM de-install procedure — moving locks and defined components, not shortcuts.</li>
    <li>Survey the path and rig each piece out on skates; measure clearances to the inch.</li>
    <li>Air-ride, enclosed, upright, with shock and tilt indicators — every mile.</li>
    <li>Coordinate reinstall with the OEM engineer so recalibration starts on time.</li>
  </ul>
</div>

<p>Moving a CT, an <a href="how-to-move-an-mri-machine.html">MRI</a>, a C-arm, or a whole imaging department? Our <a href="../services/rigging.html">rigging</a> and <a href="../services/machinery-moving.html">machinery moving</a> crews handle medical imaging start to finish. <a href="../contact.html">Send the model and the site details</a> and we will build the plan.</p>
`,
    faq: [
      { q: 'How much does a CT scanner weigh?', a: 'It varies by model, but the gantry alone commonly runs from roughly 2,000 to over 4,500 pounds, plus the patient table and covers. That weight, combined with tight imaging-suite clearances, is why moving one is a rigging job rather than a straight delivery.' },
      { q: 'Can a CT scanner be moved without the manufacturer?', a: 'The physical de-install, rigging, transport, and reinstall are handled by a specialized rigging crew, but the final recalibration and re-qualification are performed by the OEM field engineer. Coordinating both is part of planning the move so the scanner comes back online on schedule.' },
      { q: 'What kind of truck moves a CT scanner?', a: 'An enclosed, air-ride trailer. Air-ride suspension keeps road shock off the precision components, the enclosure protects against weather and road grit, and the load rides upright and braced, usually with shock and tilt indicators on the crate.' },
    ],
    related: [
      { h: 'Industrial Rigging', u: '../services/rigging.html' },
      { h: 'How to Move an MRI Machine', u: 'how-to-move-an-mri-machine.html' },
      { h: 'Machinery Moving', u: '../services/machinery-moving.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'white-glove-freight-and-custom-crating',
    cat: 'Specialized Freight',
    hero: 'loads/crating-shrink-wrap-electrical-equipment.jpg',
    date: '2026-07-01',
    title: 'White-Glove Freight and Custom Crating, Explained',
    desc: 'Sensitive, high-value, or fragile equipment does not ship on a standard pallet and a prayer. White-glove freight means custom crating, cushioning, enclosed air-ride transport, and hand placement at the far end. Here is what you are actually paying for.',
    dek: 'When "it got there" is not good enough. Custom crating, cushioning, air-ride, and a careful set-down — how fragile, high-value freight actually ships.',
    tldr: 'White-glove freight is a service level, not a truck: fragile or high-value equipment gets custom crating and cushioning, shrink-wrap and moisture protection, enclosed air-ride transport, and hand placement (curbside, inside, or to the exact spot) at delivery — with the packaging engineered to the item, not stuffed into a standard box.',
    keywords: 'white glove freight, custom crating, shrink wrap freight, fragile equipment shipping, inside delivery, air ride transport',
    body: `
<p>Some freight cannot ride on a standard pallet wrapped in a few turns of stretch film. A sensitive electrical cabinet, a piece of lab equipment, a control console — anything fragile, precise, or expensive needs packaging built for it and handling that treats it like it matters. That service level has a name: <strong>white-glove freight</strong>. Here is what it actually includes.</p>

<figure>
  <img src="../assets/img/loads/crating-shrink-wrap-electrical-equipment.jpg" alt="Badass Logistics crew member shrink-wrapping and crating a sensitive electrical enclosure before loading for transport" loading="lazy" width="600" height="800">
  <figcaption>Custom crating in progress — the enclosure is wrapped and cased to its shape before it ever sees a truck.</figcaption>
</figure>

<h2>Custom crating, built to the item</h2>
<p>White-glove starts with a crate <strong>engineered to the load</strong>, not a stock box it half-fits. That means a wooden crate or skid sized to the equipment, internal blocking so nothing shifts, and foam or cushioning wherever impact or vibration would do damage. Heavy items get a base a forklift or pallet jack can actually pick from the right points.</p>

<h2>Wrap, cushion, and protect</h2>
<p>Inside the crate, the equipment gets <strong>shrink-wrap and moisture barriers</strong> against road spray and humidity, corner and edge protection, and cushioning tuned to how fragile it is. For electronics and machined surfaces, that protection is the difference between plug-in-and-go and a warranty claim.</p>

<figure>
  <img src="../assets/img/loads/white-glove-crated-equipment-delivery.jpg" alt="Crated and shrink-wrapped electrical equipment staged on pallets at a curbside white-glove delivery" loading="lazy" width="800" height="600">
  <figcaption>Crated, wrapped, and palletized for a controlled set-down — packaging engineered to the item, not the truck.</figcaption>
</figure>

<h2>Enclosed, air-ride transport</h2>
<p>White-glove freight rides <strong>enclosed and on air-ride</strong> — out of the weather and off the road shock. It is blocked and braced so it cannot walk around the trailer, and high-value shipments can travel with shock indicators so any rough handling is visible on arrival. It is the same standard we hold for <a href="how-to-move-an-mri-machine.html">medical imaging</a> and precision machinery.</p>

<h2>Delivery that does not stop at the tailgate</h2>
<p>Standard freight ends when the pallet hits the dock. White-glove goes further: <strong>curbside, threshold, inside, or spot placement</strong> depending on what you booked, with the crew handling the last few feet as carefully as the last few hundred miles. Packaging and debris can be removed on request so you are left with the equipment, ready to install.</p>

<figure>
  <img src="../assets/img/loads/palletized-equipment-curbside-unload.jpg" alt="Palletized, shrink-wrapped industrial equipment and a metal control cabinet set down for curbside unloading" loading="lazy" width="800" height="600">
  <figcaption>The last few feet handled with the same care as the haul — set down where it needs to go, not just dropped at a dock.</figcaption>
</figure>

<div class="takeaways">
  <h3>What "white glove" buys you</h3>
  <ul>
    <li>A crate engineered to the item — blocking, foam, and a liftable base.</li>
    <li>Shrink-wrap, moisture barriers, and cushioning against road shock and weather.</li>
    <li>Enclosed, air-ride transport, blocked and braced, shock-indicator optional.</li>
    <li>Placement past the tailgate — curbside, inside, or to the exact spot.</li>
  </ul>
</div>

<p>Have something fragile, high-value, or one-of-a-kind to move? Our rigging and <a href="../services/machinery-moving.html">machinery moving</a> crews crate it, haul it, and set it down right. <a href="../contact.html">Tell us what it is and where it is going.</a></p>
`,
    faq: [
      { q: 'What does white-glove freight mean?', a: 'It is a premium handling level for fragile, high-value, or sensitive shipments. It typically includes custom crating and cushioning, enclosed air-ride transport, and hand placement at delivery — curbside, inside, or to a specific spot — instead of a standard drop at a loading dock.' },
      { q: 'What is custom crating?', a: 'A shipping crate built to the specific item instead of a stock box. It is sized to the equipment with internal blocking, foam or cushioning where needed, moisture protection, and a base that can be safely lifted by forklift or pallet jack from the correct points.' },
      { q: 'Does white-glove include inside delivery?', a: 'It can. Depending on the service level you book, delivery ranges from curbside set-down to threshold, inside, or exact-spot placement, with packaging and debris removed on request so the equipment is left ready to install.' },
    ],
    related: [
      { h: 'Machinery Moving', u: '../services/machinery-moving.html' },
      { h: 'How to Move an MRI Machine', u: 'how-to-move-an-mri-machine.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'blocking-bracing-and-dunnage-explained',
    cat: 'How It\'s Done',
    hero: 'loads/blocking-bracing-dunnage-box-truck.jpg',
    date: '2026-06-25',
    title: 'Blocking, Bracing and Dunnage: How Heavy Loads Ride Safe',
    desc: 'Straps get the credit, but blocking and bracing do the work. Dunnage, chocks, cradles, and shoring stop a load from shifting long before a tie-down is tensioned. Here is how cargo is actually kept still in a moving trailer.',
    dek: 'Straps get the credit; blocking and bracing do the work. How dunnage, chocks, and shoring keep a heavy load from ever moving.',
    tldr: 'Blocking and bracing physically stop cargo from moving; tie-downs only hold it against the blocking. Riggers use hardwood dunnage, chocks, cleats, cradles, and shoring to lock a load fore-aft and side-to-side, then add straps or chains rated to at least half the cargo weight. The goal is a load that cannot shift on a hard brake, a sharp turn, or a rough road.',
    keywords: 'blocking and bracing, dunnage, cargo securement, load shifting, chocks, shoring, freight bracing',
    howto: {
      name: 'How to Block and Brace a Heavy Load',
      steps: [
        { name: 'Assess the load', text: 'Identify the load weight, center of gravity, and contact surfaces to decide bearing points and which directions it can move.' },
        { name: 'Set the dunnage', text: 'Lay hardwood dunnage to create level bearing points and fill the gaps under and around the load.' },
        { name: 'Block fore and aft', text: 'Nail chocks and cleats to the deck to stop the load from sliding forward under braking or backward on grades.' },
        { name: 'Brace side to side', text: 'Add shoring, bracing bars, or cradles to stop lateral movement in curves and crosswinds.' },
        { name: 'Add tie-downs', text: 'Strap or chain the load to rated points with total capacity of at least half the cargo weight, using edge protectors.' },
      ],
    },
    body: `
<p>Walk past a loaded flatbed and you notice the straps. But straps are the last thing that goes on, and on their own they do not stop a heavy load from moving — they hold it against something. That something is <strong>blocking and bracing</strong>, and it is the part of securement that actually keeps cargo still. Here is how it works.</p>

<h2>Blocking and bracing vs. tie-downs</h2>
<p>The two do different jobs. <strong>Blocking and bracing</strong> physically fill the space around a load so it cannot slide or tip — wedges, chocks, and structure that stop motion. <strong>Tie-downs</strong> (straps and chains) then clamp the load down against that structure. Rely on straps alone and a heavy machine can still rock, walk, and load-shift on a hard stop. Block it first, and the straps only have to keep it seated.</p>

<figure>
  <img src="../assets/img/loads/blocking-bracing-dunnage-box-truck.jpg" alt="Wooden dunnage, pallets, and blocking used to brace machinery inside a box truck to prevent shifting in transit" loading="lazy" width="640" height="480">
  <figcaption>Hardwood dunnage and blocking filling the gaps so nothing can slide — inside a real Badass Logistics load-out.</figcaption>
</figure>

<h2>The tools of the trade</h2>
<ul>
  <li><strong>Dunnage.</strong> Hardwood beams and blocks that carry weight, fill gaps, and create bearing points. The backbone of most bracing.</li>
  <li><strong>Chocks and cleats.</strong> Wedges nailed to a wooden deck that stop wheels, skids, and rounded loads from rolling or sliding.</li>
  <li><strong>Cradles and racks.</strong> Shaped supports for coils, pipe, tanks, and anything that will not sit flat on its own.</li>
  <li><strong>Shoring and bracing bars.</strong> Structure that braces a load against the trailer walls or a bulkhead in a van or box truck.</li>
  <li><strong>Edge protectors and friction mats.</strong> Save straps from sharp corners and add grip so the load resists sliding in the first place.</li>
</ul>

<h2>Fore-aft, side-to-side, and up</h2>
<p>A proper job controls movement in <strong>every direction</strong>. Hard braking throws a load forward; acceleration and hills push it back; curves and crosswinds shove it sideways; rough road tries to bounce it up. Each of those gets its own blocking or tie-down so no single event can start the load moving. Federal rules put a number on the down-force — total tie-down working load limit of at least half the cargo weight — but the blocking is what makes that number mean something.</p>

<figure>
  <img src="../assets/img/loads/enclosed-trailer-machinery-loaded.jpg" alt="Machinery and shrink-wrapped equipment blocked and braced inside an enclosed box trailer for damage-free transport" loading="lazy" width="640" height="480">
  <figcaption>Machinery braced and seated inside an enclosed trailer — blocked so it cannot walk, then secured.</figcaption>
</figure>

<h2>Why it matters more than the strap count</h2>
<p>A load that shifts is how equipment gets damaged, how trailers get unbalanced, and how cargo ends up on the shoulder. Good blocking and bracing is invisible when it works and obvious when it does not. It is also the difference between a machine that arrives ready to install and one that arrives with a cracked casting. This is standard on every <a href="how-to-ship-industrial-machinery-on-a-flatbed.html">machinery haul</a> and <a href="what-is-industrial-rigging.html">rigging</a> job we run.</p>

<div class="takeaways">
  <h3>The short version</h3>
  <ul>
    <li>Blocking and bracing stop movement; tie-downs hold the load against it.</li>
    <li>Dunnage, chocks, cradles, and shoring are the tools — matched to the load.</li>
    <li>Control every direction: forward, back, sideways, and up.</li>
    <li>Tie-down capacity of at least half the cargo weight is the floor, not the plan.</li>
  </ul>
</div>

<p>Want your load braced like it matters? <a href="../contact.html">Tell us what you are shipping</a> and our crews will build the securement around it.</p>
`,
    faq: [
      { q: 'What is the difference between blocking and bracing?', a: 'Blocking uses wedges, chocks, and dunnage to fill the space under and around a load so it cannot slide; bracing adds structure — shoring, bars, cradles — that holds the load against the trailer or a bulkhead. Together they stop movement so tie-downs only have to keep the load seated.' },
      { q: 'What is dunnage in shipping?', a: 'Dunnage is the hardwood beams, blocks, and boards used to support cargo, fill gaps, create bearing points, and keep a load off the deck. It is the backbone of most blocking and bracing on flatbeds, vans, and box trucks.' },
      { q: 'How many straps does a load need?', a: 'Federal rules require total tie-down working load limit of at least half the cargo weight, with a minimum number based on length and weight. But strap count alone does not secure a load — proper blocking and bracing is what stops it from shifting in the first place.' },
    ],
    related: [
      { h: 'How to Ship Industrial Machinery', u: 'how-to-ship-industrial-machinery-on-a-flatbed.html' },
      { h: 'What Is Industrial Rigging?', u: 'what-is-industrial-rigging.html' },
      { h: 'Heavy Haul Transport', u: '../services/heavy-haul.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'enclosed-vs-flatbed-transport',
    cat: 'Trailers & Equipment',
    hero: 'loads/step-deck-industrial-air-handlers.jpg',
    date: '2026-06-26',
    title: 'Enclosed vs Flatbed Transport: Which One Does Your Equipment Need?',
    desc: 'Flatbed is faster to load and handles oversized freight; enclosed protects sensitive equipment from weather, road grit, and eyes. The right call depends on size, fragility, and value. Here is how to choose.',
    dek: 'Weather and security, or size and access? The honest trade-offs between enclosed and flatbed for machinery and freight.',
    tldr: 'Choose flatbed when the load is large, heavy, or oversized and can handle the weather — it loads from any side and carries dimensions no box can. Choose enclosed (dry van, box truck, or air-ride) when the equipment is sensitive, high-value, or must stay clean and out of sight. Size and access push you to flatbed; fragility, value, and weather push you to enclosed.',
    keywords: 'enclosed vs flatbed, dry van vs flatbed, machinery transport, air ride transport, equipment shipping options',
    body: `
<p>Two loads, two very different answers. One is a 40-foot fabricated skid that will never fit in a box; the other is a rack of electronics that cannot get rained on. "Enclosed or flatbed?" is one of the first questions we ask, because the trailer decides how your equipment travels, what it costs, and whether it arrives clean. Here is how to choose.</p>

<figure>
  <img src="../assets/img/loads/step-deck-industrial-air-handlers.jpg" alt="Large industrial air-handling units strapped on a step-deck flatbed trailer staged in a gravel yard" loading="lazy" width="1131" height="848">
  <figcaption>Some loads only go one way: oversized industrial units on a step deck, open and accessible from every side.</figcaption>
</figure>

<h2>When flatbed wins</h2>
<p>Flatbed — and its cousins step deck and RGN — is the answer when <strong>size and access</strong> drive the move:</p>
<ul>
  <li><strong>Oversized or over-height loads</strong> that no box could ever enclose.</li>
  <li><strong>Heavy machinery</strong> that has to be craned or forklifted on from the side or top.</li>
  <li><strong>Long, wide, or awkward</strong> freight — structural steel, tanks, fabricated skids.</li>
  <li><strong>Fast loading</strong> from any angle, which matters on tight dock schedules.</li>
</ul>
<p>The trade-off: the load is exposed to weather and road grit unless it is tarped, and it is out in the open for anyone to see.</p>

<h2>When enclosed wins</h2>
<p>Enclosed transport — dry van, box truck, or air-ride — is the answer when <strong>protection and discretion</strong> matter:</p>
<ul>
  <li><strong>Sensitive equipment</strong> — electronics, medical imaging, precision machinery — that cannot take weather or shock.</li>
  <li><strong>High-value or proprietary</strong> freight you would rather not advertise on the highway.</li>
  <li><strong>Clean-required</strong> loads that must arrive free of dust, spray, and grime.</li>
  <li><strong>Air-ride</strong> when vibration is the enemy, as it is with <a href="how-to-transport-a-ct-scanner.html">imaging equipment</a>.</li>
</ul>
<p>The trade-off: you are limited to what fits through the doors and inside the box, and loading is usually from the rear only.</p>

<figure>
  <img src="../assets/img/loads/enclosed-trailer-machinery-loaded.jpg" alt="Machinery and shrink-wrapped equipment loaded and braced inside an enclosed trailer, protected from weather and view" loading="lazy" width="640" height="480">
  <figcaption>The other answer: sensitive equipment braced inside an enclosed trailer, out of the weather and out of sight.</figcaption>
</figure>

<h2>Enclosed vs flatbed at a glance</h2>
<div class="keyfacts">
  <h3>Quick comparison</h3>
  <p><strong>Pick flatbed for:</strong> oversized, heavy, long, or awkward loads · top and side loading · crane and forklift access · anything that will not fit in a box.<br>
  <strong>Pick enclosed for:</strong> weather-sensitive, high-value, or fragile equipment · air-ride for vibration-sensitive gear · security and discretion · clean delivery.</p>
</div>

<h2>Still not sure?</h2>
<p>The deciding questions are simple: <strong>Does it fit in a box? Can it get wet? How fragile and how valuable is it?</strong> If it is too big for a van, flatbed it and tarp what needs covering. If it fits and it is delicate, enclose it — air-ride if vibration is a risk. When a load sits on the line, we will tell you which way we would send it and why. Compare the deck options in <a href="flatbed-vs-step-deck-vs-rgn-trailers.html">flatbed vs step deck vs RGN</a>.</p>

<div class="takeaways">
  <h3>Decide in one line</h3>
  <ul>
    <li>Too big for a box or needs crane/side access → flatbed.</li>
    <li>Fragile, high-value, or must stay clean and unseen → enclosed.</li>
    <li>Vibration-sensitive → enclosed on air-ride.</li>
    <li>Exposed on a flatbed? Tarp it. Oversized? Permit it.</li>
  </ul>
</div>

<p>Tell us the load and we will match the trailer. <a href="../contact.html">Send dimensions, weight, and how fragile it is</a> for a straight recommendation and a quote.</p>
`,
    faq: [
      { q: 'Is flatbed or enclosed transport better for machinery?', a: 'It depends on the machine. Oversized or crane-loaded machinery goes on a flatbed, step deck, or RGN because it will not fit in a box and needs top or side access. Sensitive, high-value, or weather-vulnerable machinery goes enclosed, often on air-ride to control vibration.' },
      { q: 'Does flatbed freight get protected from weather?', a: 'Yes, when needed. Weather-sensitive flatbed loads are tarped or shrink-wrapped to keep off rain, spray, and grit. But if a load must stay perfectly clean, dry, or out of sight, enclosed transport is the safer choice.' },
      { q: 'What is air-ride transport?', a: 'Air-ride is an enclosed trailer with air suspension that cushions the load against road shock and vibration. It is the standard for medical imaging, electronics, and precision machinery, where vibration — not just impact — can cause damage.' },
    ],
    related: [
      { h: 'Flatbed vs Step Deck vs RGN', u: 'flatbed-vs-step-deck-vs-rgn-trailers.html' },
      { h: 'Trailer Selector Tool', u: '../trailer-selector.html' },
      { h: 'Machinery Moving', u: '../services/machinery-moving.html' },
      { h: 'White-Glove Freight & Crating', u: 'white-glove-freight-and-custom-crating.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'how-much-does-it-cost-to-move-a-cnc-machine',
    cat: 'Machinery Moving',
    hero: 'loads/enclosed-trailer-machinery-loaded.jpg',
    date: '2026-06-30',
    title: 'What Drives the Cost of Moving a CNC Machine?',
    desc: 'There is no flat rate to move a CNC machine — the price is built from weight and size, rigging complexity at both ends, distance, transport type, and prep. Here are the levers that decide the number, and how to get an accurate quote.',
    dek: 'No flat rate, no guesswork. The real levers behind a CNC machine move — and how to get a number you can trust.',
    tldr: 'The cost of moving a CNC machine is driven by its weight and dimensions, the rigging complexity at both ends (clearances, floor capacity, crane vs. skate), the distance and transport type (air-ride vs. flatbed), and prep like disconnection, crating, and re-leveling. A small VMC across town and a 40,000-lb machining center across the country are different jobs — send the model and both site layouts for a real quote.',
    keywords: 'cost to move a CNC machine, CNC machine moving cost, machinery moving quote, CNC relocation, machine rigging cost',
    body: `
<p>Ask "what does it cost to move a CNC machine" and the honest answer is the same as for any heavy haul: <strong>it depends on the machine and the two buildings it moves between</strong>. A benchtop mill and a 40,000-pound horizontal machining center are not the same job and should not carry the same price. What you can do is understand the levers — because once you know what drives the number, you can hand us the details that get you an accurate quote on the first call. We do not post flat rates, because a flat rate on a job this variable is just a wrong number waiting to happen.</p>

<h2>What actually drives the price</h2>
<ul>
  <li><strong>Weight and size.</strong> Heavier, larger machines need bigger rigging gear, more crew, and sometimes a crane instead of skates. Weight also decides the trailer and whether the load needs permits.</li>
  <li><strong>Rigging at both ends.</strong> This is the big one. Tight doorways, stairs, mezzanines, low ceilings, soft or weight-limited floors, and a long push from the machine pad to the truck all add labor and equipment. An easy dock-to-dock move and a machine buried three corners deep in an old building are worlds apart.</li>
  <li><strong>Distance and transport type.</strong> Loaded miles matter, and so does how it rides — a precision machine on an <a href="enclosed-vs-flatbed-transport.html">air-ride enclosed trailer</a> is a different cost than an open flatbed.</li>
  <li><strong>Disconnection and prep.</strong> Draining coolant and hydraulics, retracting axes, protecting the control, and setting shipping brackets per the manual. Some shops do this themselves; some want it handled.</li>
  <li><strong>Crating and protection.</strong> Oversized or delicate machines may need <a href="white-glove-freight-and-custom-crating.html">custom crating</a>, shrink-wrap, and shock protection.</li>
  <li><strong>Reinstall and leveling.</strong> Setting the machine on its new pad and <strong>leveling it to the builder's spec</strong> — because geometry and accuracy start from a level casting — is part of most moves.</li>
</ul>

<figure>
  <img src="../assets/img/loads/crating-shrink-wrap-electrical-equipment.jpg" alt="Sensitive machine control enclosure being shrink-wrapped and crated before a machinery move" loading="lazy" width="600" height="800">
  <figcaption>Prep and crating are real cost drivers — how a machine is protected depends on how sensitive it is.</figcaption>
</figure>

<h2>How to get an accurate quote</h2>
<p>Give us these and we can turn a real number around fast:</p>
<ul>
  <li>Machine <strong>make, model, weight, and dimensions</strong> (the spec sheet is perfect).</li>
  <li><strong>Both site layouts</strong> — doorway widths, path to the truck, stairs or elevators, floor type, and dock access.</li>
  <li>Whether you need <strong>disconnection, crating, and re-leveling</strong> or just the transport.</li>
  <li><strong>Pickup and delivery</strong> locations and your target dates.</li>
  <li>A few <strong>photos</strong> of the machine and the path out — they answer a dozen questions at once.</li>
</ul>
<p>That is the same information our crews use to size the rigging gear, spec the trailer, and price the labor. The more precise you are, the tighter the quote — and the fewer surprises on move day.</p>

<h2>Can you make it cheaper?</h2>
<p>Sometimes. Doing your own disconnection and reconnection saves labor if your team is set up for it. Flexible dates let us schedule efficiently. And a clear path out — cleared aisles, a removed door, a known floor rating — cuts the rigging time that drives a big share of the cost. We will tell you straight where the savings are and where cutting a corner will cost you a machine.</p>

<div class="takeaways">
  <h3>The short version</h3>
  <ul>
    <li>No flat rate — weight, rigging difficulty, distance, and prep set the price.</li>
    <li>Rigging at both ends (clearances, floors, crane vs. skate) is usually the biggest lever.</li>
    <li>Send the model, both site layouts, and photos for an accurate quote.</li>
    <li>Level to spec at the destination — it is part of a proper move, not an extra.</li>
  </ul>
</div>

<p>Moving one machine or a whole shop? Our <a href="../services/cnc-machine-movers.html">CNC machine movers</a> and <a href="../services/machinery-moving.html">machinery moving</a> crews rig it, haul it, and set it back to spec. <a href="../contact.html">Send the model list and both floor plans</a> for a real number. For the how-to side, see <a href="how-to-move-a-cnc-machine.html">how to move a CNC machine without wrecking it</a>.</p>
`,
    faq: [
      { q: 'How much does it cost to move a CNC machine?', a: 'There is no flat rate. The cost is built from the machine\'s weight and size, the rigging difficulty at both ends (doorways, floors, stairs, crane vs. skate), the distance and transport type, and prep like disconnection, crating, and re-leveling. Send the model and both site layouts for an accurate quote.' },
      { q: 'What makes a CNC move more expensive?', a: 'Rigging difficulty is usually the biggest factor: tight or upstairs locations, weight-limited floors, low ceilings, and a long push to the truck all add labor and equipment. Heavier machines, air-ride transport, custom crating, and full disconnect-and-reinstall service also raise the price.' },
      { q: 'Can I save money by preparing the machine myself?', a: 'Often, yes. Handling your own disconnection and reconnection, clearing the path out, and being flexible on dates all reduce the labor and time that drive the cost — as long as the prep is done correctly to protect the machine.' },
    ],
    related: [
      { h: 'CNC Machine Movers', u: '../services/cnc-machine-movers.html' },
      { h: 'How to Move a CNC Machine', u: 'how-to-move-a-cnc-machine.html' },
      { h: 'Machinery Moving', u: '../services/machinery-moving.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },

  {
    slug: 'plant-relocation-checklist',
    cat: 'Plant Relocation',
    hero: 'loads/gooseneck-flatbed-industrial-tanks.jpg',
    date: '2026-07-02',
    title: 'Plant Relocation: The Checklist for Moving an Entire Facility',
    desc: 'Moving a plant is not one big move — it is dozens of coordinated moves in the right order, with the least downtime. Here is the checklist: survey and tag, sequence by production priority, disconnect, rig, transport, and recommission.',
    dek: 'Moving a whole facility is a sequencing problem, not a muscle problem. The checklist for relocating a plant with the least downtime.',
    tldr: 'A plant relocation is planned backward from production: survey and tag every asset, sequence the move so the last machine out is the first back online, then disconnect, rig, transport on the right trailers, and recommission in order. Downtime — not distance — is the real cost, so the plan protects the production schedule first.',
    keywords: 'plant relocation, factory move, facility relocation, machinery moving, industrial move, production line move',
    howto: {
      name: 'How to Relocate a Plant',
      steps: [
        { name: 'Survey and tag assets', text: 'Walk the facility and inventory every machine with its weight, dimensions, utilities, and exit path; tag each asset and map it to the new floor plan.' },
        { name: 'Sequence the move', text: 'Build the schedule backward from production so the equipment needed first at the new site is set first and shut down last at the old site.' },
        { name: 'Disconnect and prep', text: 'Power down, lock out, drain, and disconnect each machine, set shipping brackets, and label everything to match the new floor plan.' },
        { name: 'Rig and transport', text: 'Rig each machine out along its surveyed path and load it on the right trailer for its size and sensitivity, moving oversized pieces as permitted heavy haul.' },
        { name: 'Set and recommission', text: 'Rig machines into place, level to the manufacturer spec, reconnect utilities, and recommission in production order.' },
      ],
    },
    body: `
<p>Relocating a plant is not one heroic heavy lift — it is <strong>dozens of moves in the right order</strong>, run so the business loses as little production as possible. The machines are the easy part. The hard part is sequencing: what comes down first, what ships when, and what has to be running again by Monday. Here is the checklist we work from.</p>

<figure>
  <img src="../assets/img/loads/gooseneck-flatbed-industrial-tanks.jpg" alt="Industrial process equipment loaded on a gooseneck flatbed during a plant relocation" loading="lazy" width="1024" height="576">
  <figcaption>One asset of many — plant relocation is this, repeated in a planned sequence across a whole facility.</figcaption>
</figure>

<h2>1. Survey and tag every asset</h2>
<p>Before anything moves, the facility gets walked and inventoried: every machine, its weight and dimensions, its utilities (power, air, water, data), and its condition. Each asset is <strong>tagged</strong> and mapped to a spot on the new floor plan. This is also where the exit path for each machine gets measured — doorways, aisles, docks, floor ratings.</p>

<h2>2. Sequence the move around production</h2>
<p>This is where a plant move is won or lost. The schedule is built <strong>backward from production</strong>: whatever needs to be running first at the new site is planned to arrive and be set first, which often means it is the <em>last</em> thing shut down at the old site. Non-critical and warehouse items move first as a dry run; the production line moves in a tight, staged window.</p>

<figure>
  <img src="../assets/img/loads/heavy-haul-industrial-enclosures-flatbed.jpg" alt="Large industrial equipment secured on a flatbed trailer during a staged plant relocation" loading="lazy" width="1131" height="848">
  <figcaption>Production equipment staged and moved in sequence — the plan decides load order, not the loading dock.</figcaption>
</figure>

<h2>3. Disconnect and prep</h2>
<p>Machines get powered down, locked out, drained, and disconnected from utilities — often with the plant's maintenance team or the OEM handling the technical side. Axes are retracted, shipping brackets set, controls protected, and everything <strong>labeled to match the new floor plan</strong> so reconnection is not a guessing game.</p>

<h2>4. Rig, load, and transport</h2>
<p>Each machine is rigged out along its surveyed path and loaded on the <strong>right trailer for its size and sensitivity</strong> — flatbed and RGN for the heavy iron, <a href="enclosed-vs-flatbed-transport.html">enclosed air-ride</a> for anything precision or delicate. Oversized pieces move as <a href="../services/heavy-haul.html">heavy haul</a> with permits and escorts. The convoy is sequenced so machines arrive in install order, not in a pile.</p>

<h2>5. Set, level, and recommission</h2>
<p>At the new site, machines are rigged into place, set on their pads, and <strong>leveled to spec</strong>, then reconnected to utilities and recommissioned in production order. The goal the whole way through: the line comes back up on schedule, not "eventually."</p>

<div class="takeaways">
  <h3>The checklist, condensed</h3>
  <ul>
    <li>Survey, weigh, and tag every asset; map it to the new floor plan.</li>
    <li>Sequence backward from production — last out is first back online.</li>
    <li>Disconnect and label so reconnection is not guesswork.</li>
    <li>Match each machine to the right trailer; move oversized as heavy haul.</li>
    <li>Set, level to spec, reconnect, and recommission in order.</li>
  </ul>
</div>

<p>Planning a move? Our <a href="../services/plant-relocation.html">plant relocation</a> and <a href="../services/machinery-moving.html">machinery moving</a> crews handle the survey, the sequence, the <a href="../services/rigging.html">rigging</a>, and the transport as one project. <a href="../contact.html">Send us your asset list and both floor plans</a> and we will build the move plan.</p>
`,
    faq: [
      { q: 'How do you minimize downtime in a plant relocation?', a: 'By sequencing the move backward from production. The equipment that must run first at the new site is planned to arrive and be set first — which usually means it is the last thing shut down at the old site — while non-critical items move first. Careful labeling and a staged convoy keep reconnection fast.' },
      { q: 'How long does it take to relocate a plant?', a: 'It depends on the number and size of machines, the complexity of disconnection and reinstallation, and how much downtime the business can absorb. A tightly sequenced move can shrink the production gap significantly; the survey and asset list are what let us give a realistic schedule.' },
      { q: 'Who disconnects and reconnects the machines?', a: 'The technical disconnection and reconnection are typically handled by the plant\'s maintenance team or the equipment OEM, while our crews handle rigging, loading, transport, and setting machines on their new pads. We coordinate the sequence so both sides line up.' },
    ],
    related: [
      { h: 'Plant Relocation', u: '../services/plant-relocation.html' },
      { h: 'Machinery Moving', u: '../services/machinery-moving.html' },
      { h: 'Industrial Rigging', u: '../services/rigging.html' },
      { h: 'Get a Quote', u: '../contact.html' },
    ],
  },
  {
    slug: "how-to-move-a-press-brake",
    cat: "Machinery Moving",
    hero: "loads/step-deck-industrial-air-handlers.jpg",
    date: "2026-07-02",
    title: "How to Move a Press Brake Without Wrecking It",
    desc: "Press brakes are top-heavy machines that tip before they warn you. Ram locking, rigging points, skates, trailer choice, and securement — from the dispatch desk.",
    dek: "A press brake doesn't fall over slowly. Here's the full playbook for moving a top-heavy machine — from locking the ram to the first test bend at the new address.",
    tldr: "Press brakes carry most of their weight in the top third of the frame, so tipping is the main risk in any move. Lock and block the ram, pull the tooling, rig only from the engineered frame points, skate slowly on rated equipment, and measure loaded height before booking a trailer — a step deck or RGN often keeps a tall brake legal. The move isn't finished until the machine is re-leveled and test bends run clean.",
    keywords: ["how to move a press brake", "press brake rigging", "machinery moving", "press brake transport", "machine skates", "step deck trailer", "press brake leveling"],
    howto: {"name": "How to Move a Press Brake Without Tipping It", "steps": [{"name": "Verify weight and center of gravity", "text": "Pull the manufacturer's rigging print or manual. Nameplate weight rarely includes added tooling, backgauge upgrades, or sheet followers. If no CoG data exists, treat the machine as top-heavy by default and rig accordingly."}, {"name": "Lock and block the ram", "text": "Lower the ram onto hardwood blocking or to the manufacturer's shipping position, engage mechanical safety locks if fitted, and strap the ram to the frame so it cannot drift. Remove all punches and dies and crate them separately."}, {"name": "Rig from engineered frame points", "text": "Lift only from the machined holes or lifting eyes in the side frames, using rated shackles and slings, with a spreader bar where geometry requires vertical pulls. Never fork under the bed unless the manufacturer shows rated fork pockets."}, {"name": "Skate it slowly", "text": "Raise the machine an inch at a time with toe jacks, cribbing as you go. Use skates rated well above machine weight, keep the load centered, lay steel plate over joints and soft floor, and never side-load the machine to steer it."}, {"name": "Load low and chain it down", "text": "Measure true loaded height first. If the machine goes over 13'6\" on a flatbed, spec a step deck or RGN. Chain directly to the frame lift points over hardwood dunnage, keeping every chain off the ram and cylinders."}, {"name": "Set, level, and test", "text": "Level the bed along and across with a machinist level to spec, shim and anchor per the manual, re-check after settling, verify ram parallelism and crowning, and run test bends across the full bed before production."}]},
    body: "<p>A press brake is one of the worst machines in a fab shop to move casually. The footprint is narrow front to back, the frame is tall, and most of the mass — ram, hydraulic cylinders, crown, drive — sits in the top third of the machine. That geometry means a press brake doesn't slide or drop when a move goes wrong. It tips. And a tipping press brake gives you almost no warning and no chance to stop it.</p><p>Here's how we plan these moves from the dispatch desk, and what we tell shops before the riggers show up.</p><h2>Start with real weight and a real center of gravity</h2><p>Press brakes run from a few thousand pounds for a small machine to well north of 100,000 pounds for big tandem hydraulics. The nameplate is a starting point, not an answer — it usually reflects the machine as it left the factory, before tooling racks, sheet followers, upgraded backgauges, and light curtains were bolted on.</p><p>The center of gravity matters more than the number. On most hydraulic brakes it sits well above mid-height because the cylinders, crown, and ram all live at the top. Get the manufacturer's rigging print if it exists; it shows lift points and CoG. If it doesn't, your rigger should treat the machine as top-heavy by default.</p><h2>Lock the ram or don't move it</h2><p>An unlocked hydraulic ram drifts once pressure bleeds off, and a ram that shifts in transit changes the machine's balance while it's chained to a moving trailer. Before the machine leaves its anchors:</p><ul><li><strong>Lower the ram</strong> onto hardwood blocking on the bed, or to the manufacturer's specified shipping position.</li><li><strong>Engage mechanical safety locks</strong> where fitted, and strap the ram to the frame so it cannot creep.</li><li><strong>Pull the tooling.</strong> Punches and dies ship separately, boxed and labeled. Never transport a brake with tooling in the clamps.</li><li><strong>Secure or remove the backgauge</strong>, disconnect and cap lines per the manual, and strap down the control pendant.</li></ul><h2>Rig the frame, not the bed</h2><p>Most press brakes have engineered lifting points — machined holes through the side frames or lifting eyes on the housings. Those are the only places a crane or gantry should pick from: rated shackles in the frame holes, slings sized for the actual load, and a spreader bar when the geometry needs it, so the slings pull vertical instead of crushing inward against the cylinders.</p><p>Forks under the bed are how brakes get tipped and beds get sprung. Unless the manufacturer specifically shows fork pockets with a rated capacity, keep forklifts on the tooling crates and nothing else.</p><h2>Skating: slow is the whole technique</h2><p>Inside the building, machinery skates are usually the right call, and the rules that keep a top-heavy machine upright on them are boring and absolute. Toe jacks lift an inch at a time with cribbing following the load up. Skates are rated comfortably above machine weight and placed so the load is centered. Steel plate goes over expansion joints, trench covers, and any floor you don't trust. Push slow, pull straight, and never side-load the machine to steer it. Every degree of dock slope or ramp is tilt added to a machine already living near its tipping point.</p><h2>Trailer choice is a height problem first</h2><p>The legal envelope on most US routes is roughly 8'6\" wide, 13'6\" tall, and 80,000 pounds gross. Height is what usually bites on a press brake. A standard flatbed deck sits around five feet off the pavement, so a machine much over eight and a half feet tall goes over-height the moment it's loaded. A step deck buys back roughly a foot and a half of that; an RGN, with its well down near two feet, can keep even a tall brake inside the legal envelope.</p><p>Nail down true loaded height before the truck is booked, because it drives everything downstream: whether permits are needed, which states want escorts, and whether the route has to be checked for low structures. Those are the real cost drivers on a press brake move — dimensions, not miles.</p><figure><img src=\"../assets/img/loads/blocking-bracing-dunnage-box-truck.jpg\" alt=\"Hardwood blocking, bracing, and dunnage supporting heavy cargo on a trailer deck\" loading=\"lazy\" width=\"640\" height=\"480\"><figcaption>Hardwood dunnage under the frame spreads a press brake's weight across the deck and gives the chains something to pull the machine down onto.</figcaption></figure><h2>Securement: chains, dunnage, and nothing on the ram</h2><p>Heavy machinery rides on chains and binders, not straps, tied directly to the same frame holes used for rigging. Federal securement rules generally require the combined working load limit of the tiedowns to reach at least half the cargo weight — on a top-heavy machine, competent carriers go past that minimum. Hardwood dunnage under the frame spreads the load across the deck. Keep every chain off the ram, the cylinders, and any machined surface, and protect the bed and ram faces from road weather — a corroded bed face is a rework bill waiting at the destination.</p><h2>The move isn't done until it's re-leveled</h2><p>A press brake bends accurately because its bed is flat, level, and untwisted. Transport, skating, and a new slab all change that. On the other end: set the machine, level along and across the bed with a machinist level to the manufacturer's spec, shim, anchor if the manual calls for it, then let it settle and re-check. Verify ram parallelism and crowning, then run test bends across the full bed length before production parts. If test parts show angle variation end to end, the machine is twisted — and the fix is leveling, not the controller.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Press brakes are top-heavy by design; tipping, not dropping, is the failure mode to plan against.</li><li>Lock and block the ram, pull the tooling, and rig only from the engineered frame points.</li><li>Loaded height decides the trailer — step decks and RGNs exist for exactly this machine.</li><li>Chain to the frame over hardwood dunnage; nothing bears on the ram, cylinders, or machined surfaces.</li><li>The move ends at the first good test bend, not at delivery — budget time for leveling and calibration.</li></ul></div>",
    faq: [{"q": "Can you move a press brake with a forklift?", "a": "Only if the manufacturer documents rated fork pockets and the truck has the capacity at that load center — and most press brakes have neither. Forking under the bed of a top-heavy machine is a common cause of tipped brakes and sprung beds. The standard methods are machinery skates with toe jacks, or a crane or gantry picking from the engineered frame holes."}, {"q": "Does a press brake move need oversize permits?", "a": "It depends on the loaded dimensions, not the machine alone. The general legal envelope is 8'6\" wide, 13'6\" tall, and 80,000 pounds gross, and height is the usual trigger: a tall brake on a standard flatbed can go over-height even though the same machine rides legal on a step deck or RGN. Measuring true height before booking the trailer is what keeps permits, escorts, and route restrictions to a minimum."}, {"q": "Why does a press brake have to be re-leveled after a move?", "a": "Bend accuracy depends on a flat, untwisted bed. Transport stress and a new floor both introduce twist, which shows up as angle variation from one end of a part to the other. After setting the machine, it should be leveled to the manufacturer's spec with a machinist level, allowed to settle, re-checked, and verified with test bends across the full bed length before production runs."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "Industrial Rigging", "u": "../services/rigging.html"}, {"h": "How to Move a CNC Machine", "u": "how-to-move-a-cnc-machine.html"}, {"h": "Blocking, Bracing & Dunnage", "u": "blocking-bracing-and-dunnage-explained.html"}],
  },
  {
    slug: "how-to-prepare-a-machine-for-shipping",
    cat: "Machinery Moving",
    hero: "loads/white-glove-crated-equipment-delivery.jpg",
    date: "2026-07-02",
    title: "How to Prepare a Machine for Shipping: The Pre-Move Checklist",
    desc: "A blunt pre-shipping checklist for machinery: drain the coolant, lock every axis, set shipping brackets, verify weight and dimensions, clear the path out.",
    dek: "The truck is the easy part. Machine moves are won or lost in the week before it arrives — here is the prep work, straight from the dispatch desk.",
    tldr: "Before the riggers arrive: verify true weight and shipped dimensions off the data plate, drain the coolant sump, home and mechanically lock every axis, pull tooling and the control pendant, install shipping brackets, grease and wrap the ways and spindle, photograph everything, and clear a measured path to the door.",
    keywords: ["how to prepare a machine for shipping", "machine shipping preparation", "CNC shipping brackets", "drain coolant before shipping", "machinery moving checklist", "machine rigging prep"],
    howto: {"name": "Prepare a Machine for Shipping in 6 Steps", "steps": [{"name": "Confirm weight and dimensions", "text": "Pull the weight from the data plate or the manufacturer's spec sheet and measure the machine as it will ship, including the skid and anything still bolted on. These numbers decide the trailer, the rigging plan, and whether permits are needed."}, {"name": "Drain coolant and loose fluids", "text": "Pump the coolant sump dry, empty the chip conveyor tray, and remove chips. Follow the manual on hydraulic and lube reservoirs — some drain, some ship sealed. Dispose of used coolant per local regulations."}, {"name": "Home, retract, and lock every axis", "text": "Send each axis to the transport position the manual specifies, then lock it mechanically with the factory axis locks or solid wood blocking so nothing drifts under road vibration."}, {"name": "Remove or secure loose items", "text": "Empty the tool carousel and turret, remove chuck jaws and probes, dismount the control pendant and monitors, and band or bolt every door and cover shut. Bag and label all hardware."}, {"name": "Set shipping brackets and protect precision surfaces", "text": "Bolt in the factory shipping brackets on the spindle head and counterweight, coat exposed ways with way oil or grease, and wrap the spindle nose. No brackets? Tell the movers ahead of time so they can block and brace."}, {"name": "Document and clear the path", "text": "Photograph all four sides, the data plate, and every existing mark. Then measure doorways and aisles against shipped dimensions, verify floor capacity along the route, and clear the aisle before the crew arrives."}]},
    body: "<p>Most machine moves don't go sideways on the truck. They go sideways in the week before the truck shows up &mdash; coolant still in the sump, a toolchanger left loaded, a machine nobody actually weighed. From the dispatch desk, the pattern is consistent: shops that prep load out in a morning; shops that don't burn a full day and sometimes a spindle. Here is the checklist we wish every shop worked through before a <a href=\"../services/machinery-moving.html\">machinery move</a>.</p>\n\n<h2>Start with the real weight and dimensions</h2>\n<p>Every downstream decision &mdash; trailer type, rigging gear, crew size, route, permits &mdash; hangs on two numbers you should nail down first. The legal envelope on US highways is generally <strong>8'6\" wide, 13'6\" tall, about 53' of trailer length, and 80,000 lbs gross</strong>. A machine that pushes the load past any of those thresholds changes the plan: step-deck or RGN instead of flatbed, permit lead time, possibly escorts. Pull the weight off the data plate or the manufacturer's spec sheet, never from memory. Then measure the machine as it will actually ship &mdash; on its skid, with brackets and anything still bolted to it. \"Around nine feet tall\" is not a dimension. It is a low bridge waiting to happen.</p>\n\n<h2>Drain coolant and loose fluids</h2>\n<p>Standing coolant is the most common prep failure we see. It sloshes, it leaks through door seams onto the trailer deck, and on a tilted machine it finds the electrical cabinet. Pump the sump dry, empty the chip conveyor tray, and pull the chips &mdash; wet swarf is dead weight you don't want and a cleanup you really don't want. Hydraulic and lube reservoirs are machine-specific: some manufacturers say drain, some say leave sealed. Check the manual and tell your move coordinator which way you went. Dispose of used coolant per local regulations, not down the floor drain.</p>\n\n<h2>Home, retract, and lock every axis</h2>\n<p>Under power, the servos hold everything where it belongs. On a trailer, nothing holds anything. Send each axis to the position the manual specifies for transport &mdash; typically Z fully retracted, the table centered or at a stated coordinate &mdash; then lock it mechanically. That means the factory <strong>shipping brackets</strong> on the spindle head and counterweight if you still have them, or solid wood blocking and steel banding if you don't. Vertical machining centers are the classic failure: an unbraced head walking down its ballscrew across hundreds of miles of expansion joints. If the brackets are long gone, say so up front &mdash; a competent <a href=\"../services/rigging.html\">rigging crew</a> can block and brace on site, but only if they know before load day.</p>\n\n<h2>Strip the loose stuff</h2>\n<p>Anything that can move, will. Empty the tool carousel and the turret. Remove chuck jaws, vises, tailstock centers, and probes. Dismount the control pendant and any monitor on an articulating arm &mdash; pendants shear off in transit, and a replacement is a lead-time problem, not a parts-counter problem. Band or bolt every door, cover, and sheet-metal panel shut; painter's tape is not securement. Bag the hardware, label the bags, and tape them inside the electrical cabinet. If it ships loose, it ships crated &mdash; not rattling around inside the enclosure.</p>\n\n<figure><img src=\"../assets/img/loads/crating-shrink-wrap-electrical-equipment.jpg\" alt=\"Electrical control equipment crated and shrink-wrapped for machinery shipping\" loading=\"lazy\" width=\"600\" height=\"800\"><figcaption>Controls, pendants, and loose panels ship crated and shrink-wrapped &mdash; never loose inside the machine.</figcaption></figure>\n\n<h2>Protect the precision surfaces</h2>\n<p>Exposed ways, ballscrews, and the spindle taper are what make the machine worth moving in the first place. Coat exposed way surfaces with way oil or a light grease. Wrap the spindle nose and put a plug or a covered tool in the taper. If the machine rides an open deck, settle the shrink-wrap and tarping plan with the movers before load day &mdash; road film and rain on bare cast iron is corrosion, and corrosion on a way surface is a rebuild conversation. This matters double for <a href=\"../services/cnc-machine-movers.html\">CNC equipment</a>, where thousandths are the product.</p>\n\n<h2>Photograph everything</h2>\n<p>Before anyone touches the machine, shoot it: all four sides, the data plate, the control screen showing hours, every existing ding, close-ups of the ways and spindle. Two minutes with a phone establishes condition at pickup and ends every condition argument at delivery before it starts. Shoot again after prep, with brackets and banding visible, so the receiving end knows exactly what to remove and where.</p>\n\n<h2>Clear the path out</h2>\n<p>The crew can move the machine; they cannot move your building. Measure every doorway, dock, and aisle against the shipped dimensions &mdash; height on the skid included. Confirm the floor along the route takes the point loads of machine skates under full weight. Clear the aisle of pallets, benches, and product the day before, not while the crew stands there. If the machine has to come out through a wall panel or over a dock edge at an angle, that is planning, not improvisation &mdash; flag it when you <a href=\"../contact.html\">request a quote</a>, and read <a href=\"how-to-move-a-cnc-machine.html\">how to move a CNC machine</a> for what happens on the rigging side once your prep is done.</p>\n\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n<li>Verified weight and shipped dimensions drive the trailer, the rigging plan, and permits &mdash; pull them from the data plate and a tape measure, not memory.</li>\n<li>Drain the coolant, lock every axis, and bracket the spindle head. Transport vibration destroys anything left free to move.</li>\n<li>Pendant off, tooling out, doors banded, photos of everything &mdash; before the crew arrives, not after.</li>\n<li>Missing shipping brackets and tight exit paths are solvable, but only if the movers know before load day.</li>\n</ul></div>",
    faq: [{"q": "Do I need to drain the hydraulic oil too, or just the coolant?", "a": "Coolant always comes out — it sloshes, leaks, and contaminates everything it touches. Hydraulic and way-lube reservoirs are machine-specific: some manufacturers require draining, others want the sealed system left alone so it doesn't ingest air or debris. Check the manual for your exact model and tell the move coordinator what you did, so the crew knows what is still wet."}, {"q": "What if I no longer have the factory shipping brackets?", "a": "It happens constantly — brackets get scrapped years before the machine sells. A competent rigging crew can fabricate wood blocking and steel banding on site to immobilize the spindle head, counterweight, and axes. The only unforgivable version is a free-floating head nobody mentioned. Flag missing brackets when you book the move, not when the truck is at the dock."}, {"q": "Who handles prep — the shop or the machinery movers?", "a": "Split responsibility, and it should be in writing. The movers handle rigging, loading, securement, and transport coordination. Internal prep — fluids, tooling removal, axis locks, brackets — is typically the shop's job or a hired service tech's, because it requires powering the machine and knowing its controls. Confirm the scope line by line before load day so nothing falls in the gap."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "CNC Machine Movers", "u": "../services/cnc-machine-movers.html"}, {"h": "How to Move a CNC Machine", "u": "how-to-move-a-cnc-machine.html"}, {"h": "Get a Quote", "u": "../contact.html"}],
  },
  {
    slug: "how-to-transport-a-transformer",
    cat: "Heavy Haul",
    hero: "heavyhaul-load.jpg",
    date: "2026-07-02",
    title: "How to Transport a Transformer: Trailer, Permits, and Rigging by Weight Class",
    desc: "Transformers ship upright on flatbeds, step-decks, RGNs, or multi-axle trailers by weight, with impact recorders, tilt limits, and rigging planned at both ends.",
    dek: "A transformer is the one load where a single hard bump can total the cargo without leaving a mark on it. Here is how the move actually gets planned, from the dispatch desk.",
    tldr: "Transformers move upright, always. Match the trailer to the shipping weight: flatbed for distribution units, step-deck when height gets tight, RGN for heavy substation units, multi-axle platforms for large power transformers. Mount tri-axial impact recorders, secure only at manufacturer tie-down points, pull overweight permits early, and plan the rigging at both ends before the truck is booked.",
    keywords: "transformer transport, heavy haul transformer, transformer shipping, impact recorder, RGN trailer, transformer rigging, oversize load permits",
    howto: {"name": "How to Transport a Power Transformer", "steps": [{"name": "Pull the nameplate and transport drawing", "text": "Get the shipping weight (with or without oil), dimensions, center of gravity, designated lift points, and the manufacturer's tilt limit. Every downstream decision comes off this sheet."}, {"name": "Match the unit to the trailer", "text": "Run the height math off deck height and the weight math off axle count. Flatbed for distribution units, step-deck when height is tight, RGN for heavy substation units, multi-axle platform for large power transformers."}, {"name": "Book permits and survey the route", "text": "Overweight is usually the trigger before oversize. File state-by-state permits, order bridge analysis where required, and drive or desk-survey the route for low wires, weak structures, and turn radii."}, {"name": "Rig it on and keep it level", "text": "Crane or gantry lift using the manufacturer's lift lugs only, with spreader bars to control sling angles. The unit stays within its tilt limit through the entire pick."}, {"name": "Mount recorders and secure the load", "text": "Fix a tri-axial impact recorder to the tank and chain the unit at its designated tie-down points. Never bear on radiators, bushings, or conservator piping."}, {"name": "Offload, read the recorder, then sign", "text": "Reverse the rigging plan at destination, download the impact recorder, and inspect before anyone signs a clean delivery receipt. The readout is your evidence either way."}]},
    body: "<p>A transformer is not general freight. It is top-heavy, it is often full of mineral oil, and the core-and-coil assembly inside the tank does not tolerate impact. You can drop a crate of steel fittings off a dock and lose nothing. Put a hard shock into a transformer and you can shift windings, crack porcelain, and buy yourself a factory teardown — with zero visible damage on the outside of the tank.</p><p>That is why transformer moves get planned backwards from the nameplate, not forwards from the truck. Here is how we run them.</p><h2>Why a transformer is its own problem</h2><p>Three things separate a transformer from ordinary machinery. <strong>First, the center of gravity sits high</strong> — the core and coils are dense and mounted well up in the tank, so the load wants to tip. <strong>Second, many units ship wet.</strong> Smaller transformers travel filled with insulating oil, which adds real weight and can slosh; large power transformers are typically drained and shipped under a dry-air or nitrogen blanket, then filled on site. <strong>Third, the internals are shock-sensitive.</strong> Manufacturers publish g-force limits and tilt limits for transit, and warranty claims routinely hinge on whether the move stayed inside them.</p><h2>Weight classes and the trailer that matches</h2><p>Trailer selection is weight and height math, nothing else. Working buckets:</p><ul><li><strong>Pad-mount and distribution units:</strong> a few hundred pounds up to several tons. Standard flatbed, fully legal load. The job is securement and upright handling, not permits.</li><li><strong>Small substation transformers:</strong> roughly five to twenty-plus tons. Flatbed or step-deck. Watch height — a flatbed deck sits around five feet off the ground, so a tall unit can push past the 13'6\" legal ceiling. A step-deck buys back over a foot of clearance.</li><li><strong>Power transformers in the mid range:</strong> once the combined rig approaches the 80,000 lb federal gross limit, you are into overweight permitting and a removable gooseneck (RGN) or lowboy, often with flip axles added to spread the load.</li><li><strong>Large power transformers:</strong> multi-axle platform trailers, dual-lane configurations, and superload-class permitting with route surveys and bridge engineering. Some long legs move by rail with trucks handling the first and last miles.</li></ul><figure><img src=\"../assets/img/loads/load-oversize-tank.jpg\" alt=\"Oversize transformer tank secured upright on a multi-axle heavy-haul trailer\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>The tank rides upright and chained at the manufacturer's tie-down points — never off radiators or bushings.</figcaption></figure><h2>Impact recorders and the upright rule</h2><p>Every serious transformer move carries a tri-axial impact recorder bolted to the tank. It logs shock events in all three axes for the entire trip, and it gets downloaded at delivery before anyone signs. If the manufacturer's g-limit was exceeded, the receiver knows before the unit is energized — not after a failure in service.</p><p>The upright rule is absolute. Transformers travel vertical, inside a tilt tolerance that is often only a few degrees. Laying one over can displace the core, damage internal bracing, and disturb the oil or gas blanket. If a unit will not fit upright on a flatbed, the answer is a lower deck, not a lower angle.</p><h2>Permits: weight drives the file</h2><p>Most transformer permit work is triggered by weight before dimensions. Anything pushing the rig past 80,000 lbs gross needs overweight permits in every state it crosses, and axle loadings have to satisfy each state's bridge formula — which is why axles get added even when the trailer could technically carry the weight. Dimensional permits stack on top when the unit exceeds 8'6\" wide or 13'6\" tall on the trailer. Escorts, curfews, and route restrictions all flow from the permit file. Our <a href=\"oversize-load-permits-guide.html\">permits guide</a> covers the mechanics; the short version is that permits are lead time, and lead time is booked before the truck is.</p><h2>Rigging on and rigging off</h2><p>The lift is planned from the transport drawing. Slings go on the manufacturer's lift lugs — nowhere else — with spreader bars sized to keep sling angles inside spec. Depending on site access, that means a hydraulic crane, a gantry system over the pad, or jack-and-slide for the final set. Bushings and radiators are usually removed and crated separately on larger units, because they are the first things to break and the last things you want load-bearing. Securement follows the same logic: chains to designated tie-down points, with <a href=\"blocking-bracing-and-dunnage-explained.html\">blocking and bracing</a> carrying the base, never the cooling fins. Both ends of the move — <a href=\"../services/heavy-haul.html\">the haul</a> and <a href=\"../services/rigging.html\">the rigging</a> — get coordinated as one plan, because a trailer the destination crane cannot unload is a planning failure, not bad luck.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Transformers ride upright, inside the manufacturer's tilt limit, every mile.</li><li>Trailer choice is weight and height math: flatbed, step-deck, RGN, then multi-axle platform as the numbers climb.</li><li>Tri-axial impact recorders travel on the tank and get read before sign-off.</li><li>Overweight permitting usually triggers before oversize — file early, route around weak bridges.</li><li>Rig only from designated lift lugs and tie-down points; radiators and bushings carry nothing.</li></ul></div><p>Moving a transformer soon? Send us the nameplate data and the transport drawing and we will coordinate the trailer, permits, and rigging at both ends. <a href=\"../contact.html\">Get a quote</a>.</p>",
    faq: [{"q": "Can a transformer be shipped lying on its side?", "a": "No. Transformers travel upright within a manufacturer-specified tilt tolerance, often only a few degrees. Laying a unit over can shift the core-and-coil assembly, damage internal bracing, and disturb the oil or gas blanket. If it will not clear 13'6\" upright on a flatbed, the fix is a lower deck — step-deck or RGN — not a lower angle."}, {"q": "Do transformers ship full of oil?", "a": "Smaller distribution and substation units typically ship filled with insulating oil, which adds meaningful weight to the trailer math. Large power transformers are usually drained and shipped under a dry-air or nitrogen blanket, with the oil processed and filled on site. The nameplate and transport drawing state the actual shipping condition and weight — plan from those, not the installed weight."}, {"q": "When does a transformer move need permits?", "a": "When the loaded rig exceeds 80,000 lbs gross, or the load exceeds 8'6\" wide or 13'6\" tall on the trailer. Weight is the usual trigger for transformers. Overweight permits are issued state by state, axle loadings must satisfy each state's bridge formula, and the largest units fall into superload territory with route surveys, escorts, and bridge engineering."}],
    related: [{"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "Industrial Rigging", "u": "../services/rigging.html"}, {"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "Blocking, Bracing & Dunnage", "u": "blocking-bracing-and-dunnage-explained.html"}],
  },
  {
    slug: "machine-leveling-and-alignment",
    cat: "Specialized Rigging",
    hero: "loads/enclosed-trailer-machinery-loaded.jpg",
    date: "2026-07-02",
    title: "Machine Leveling and Alignment After a Move (and Why It Matters)",
    desc: "Why a machine cuts bad parts until it's re-leveled to the builder's spec after a move: bed twist, circularity, foundations, thermal drift, and test cuts.",
    dek: "Accuracy specs are written for a level casting. Set the machine down wrong and the geometry goes with it — here's what re-leveling actually restores.",
    tldr: "Every accuracy spec on a machine tool assumes the casting is leveled to the builder's installation spec. After a move, twist in the base shows up as taper, out-of-round bores, and lost squareness. Re-level on the correct pads with a precision level, respect the foundation and settling time, then prove the machine with a test cut before releasing production.",
    keywords: ["machine leveling after a move", "machine tool alignment", "precision machinist level", "leveling pads and feet", "machine foundation and anchoring", "bed twist and taper", "requalification test cut"],
    body: "<p>A machine that held tenths at the old plant and can't hold two thou at the new one usually isn't damaged. It's twisted. Machine tools are built on one quiet assumption: the casting sits the way the builder's assembly floor had it — ways scraped, gibs fitted, squareness verified with the bed dead level. Set that same casting on a slab that's off across the footprint and you've changed the machine's geometry without touching a single component.</p><p>From the dispatch desk, leveling is the handoff. Our job on a <a href=\"../services/machinery-moving.html\">machinery moving</a> project is to land the machine on its marks, on the correct pads, over a floor that can carry it. Your millwright or the OEM tech brings it back to spec. Here's why that second half decides whether the move actually worked.</p><h2>Geometry starts with a level casting</h2><p>Every number on the builder's accuracy sheet — positioning, repeatability, circularity, squareness — was measured with the machine leveled per the installation manual. Level isn't about gravity or coolant drainage. It's the reference state for the entire geometry stack: twist the base and the ways twist with it, and everything riding on those ways inherits the error.</p><p>The symptoms are predictable. A lathe bed with twist cuts taper — the classic two-collar test bar mics fat on one end no matter how good the operator is. A machining center with a racked base loses squareness between axes, so circular interpolation turns bores into subtle ovals; a ballbar plot shows it as a tilted ellipse long before the CMM flags a bad part. Positioning accuracy goes with it, because the scales and screws are now measuring travel along a bent reference.</p><figure><img src=\"../assets/img/loads/load-machine-loadout.jpg\" alt=\"Rigging crew loading out a machining center — placement at the new facility is the start of installation, not the end\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Set-down is the start of installation, not the finish. Accuracy comes back when the machine is re-leveled and requalified to the builder's spec.</figcaption></figure><h2>Feet, pads, and what carries the weight</h2><p>How the machine meets the floor matters as much as where. Builders specify the support system for a reason:</p><ul><li><strong>Three-point mounts</strong> self-define a plane — the machine can sit out of level, but the floor can't twist it. Common on smaller, stiff-casting machines.</li><li><strong>Multi-point jack screws and wedge pads</strong> are the opposite case. On a long-bed lathe or grinder with ten or twelve support points, twist gets dialed in or out one foot at a time, following the builder's sequence and load pattern.</li><li><strong>Isolation pads</strong> are spec'd for the machine's weight and vibration profile. Soft rubber under a machine the builder wants on steel wedges will let it walk out of level as it runs.</li></ul><p>Reusing whatever the machine sat on at the old plant is a gamble. Pads take a set, wedges disappear during teardown, and the new slab is not the old slab.</p><h2>The level itself</h2><p>A carpenter's level has no business near this work. Precision machinist levels are graduated in fractions of a thousandth of an inch per foot — sensitive enough that a person walking past moves the bubble — and electronic levels read finer still and log the numbers. The manual says where they go: machined reference surfaces, the table, the ways, checked in both axes. Never sheet-metal covers. If the installation crew shows up with a torpedo level, the machine is being positioned, not leveled.</p><h2>Foundation and anchoring</h2><p>The best leveling job dies on a bad slab. Builders publish foundation requirements — thickness, reinforcement, sometimes an isolated pour cut off from forklift traffic — and a machine expected to hold real tolerance needs them honored. A cracked or thin slab flexes under the machine and under everything that drives past it. Anchoring is machine-specific: some castings must be anchored and grouted to reach rated accuracy, while others are meant to float on their mounts, and hard-bolting those warps the base. Slab evaluation, coring, and grout cure time are schedule items and real cost drivers on a relocation — far cheaper to plan than to discover.</p><h2>Thermal movement and settling</h2><p>Level on installation day is not level three weeks later. Concrete compresses under new point loads, so the level should be rechecked after the machine has been sitting — ideally running — for a couple of weeks. Temperature moves things too: a machine measured cold at seven in the morning is not the machine cutting warm at noon, and accuracy specs are written for thermal equilibrium. Shops holding tight tolerances recheck seasonally, because the building itself moves.</p><h2>Requalifying with a test cut</h2><p>A centered bubble is a precondition, not proof. After leveling comes geometry — tram the spindle, sweep the table, run a ballbar or laser where the work demands it — and after geometry comes the only verdict that counts: a test cut in the material you actually run. Bore a hole and measure roundness. Face a surface and check flatness. Turn the test bar and mic both ends. The machine is back in service when the part says so, not when the bubble does.</p><p>If a relocation is coming, plan the set-down and the requalification as one schedule, not two. Badass Logistics coordinates the <a href=\"../services/rigging.html\">rigging</a>, transport, and placement so the machine lands where the millwright needs it. Read <a href=\"how-to-move-a-cnc-machine.html\">How to Move a CNC Machine</a> for the transport side, or <a href=\"../contact.html\">get a quote</a> to talk through your move.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Every accuracy spec assumes the casting is leveled to the builder's installation spec — a twisted base makes bad parts with nothing visibly broken.</li><li>Use the builder's specified pads, support points, and leveling sequence. Reused or wrong mounts are a common cause of post-move drift.</li><li>Precision machinist or electronic levels only, on machined reference surfaces, in both axes.</li><li>Recheck level after the slab and machine settle under load, and again seasonally for tight-tolerance work.</li><li>Requalify with geometry checks and a test cut before releasing production — the part is the proof.</li></ul></div>",
    faq: [{"q": "Does a machine need re-leveling if it only moved across the shop?", "a": "Yes. Any pick and set changes the support conditions — different slab section, disturbed pads, new load distribution. The move distance is irrelevant; the casting is now sitting on a different plane than the one its geometry was qualified on. Short moves skip the truck, not the leveling."}, {"q": "Do riggers level the machine, or does a millwright?", "a": "Both, in sequence. The rigging crew places the machine on its marks, on the correct pads, and rough-levels it so it sits stable and safe. Precision leveling to the builder's spec and geometry requalification are millwright or OEM service work. The mistake is treating them as separate projects — coordinate them as one schedule so the machine isn't sitting idle between crews."}, {"q": "How soon after installation should level be rechecked?", "a": "After the slab has taken the new point loads and the machine has run — commonly a couple of weeks of production. Concrete compresses, pads seat, and the building's temperature cycle shows up in the readings. For tight-tolerance work, many shops put a seasonal recheck on the maintenance calendar."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "CNC Machine Movers", "u": "../services/cnc-machine-movers.html"}, {"h": "How to Move a CNC Machine", "u": "how-to-move-a-cnc-machine.html"}, {"h": "Industrial Rigging", "u": "../services/rigging.html"}],
  },
  {
    slug: "rgn-vs-lowboy-trailers",
    cat: "Trailers & Equipment",
    hero: "rgn-load.jpg",
    date: "2026-07-02",
    title: "RGN vs Lowboy Trailers: What's the Difference?",
    desc: "RGN and lowboy aren't the same trailer. Learn how removable gooseneck trailers differ from fixed-neck lowboys in deck height, loading, axles, and capacity.",
    dek: "Every RGN is a lowboy, but not every lowboy is an RGN. The neck decides whether your machine drives on under its own power or waits on a crane.",
    tldr: "A lowboy is any drop-well trailer built to keep tall, heavy loads under the 13'6\" height limit; an RGN is a lowboy whose gooseneck detaches so the deck becomes a front-loading ramp. Book an RGN for operable equipment that drives on, a fixed-neck lowboy for craned machinery where trailer weight and deck length matter, and add axles — not a different trailer name — when the load runs past legal gross weight.",
    keywords: "RGN trailer, lowboy trailer, removable gooseneck, RGN vs lowboy, hydraulic detachable gooseneck, heavy haul trailers, lowboy deck height",
    body: "<p>Call five carriers about moving an excavator and you will hear \"lowboy\" and \"RGN\" thrown around like they are the same trailer. They are not. The difference decides whether your machine drives on under its own power or hangs off a crane, whether it clears bridges without an over-height permit, and how much of the legal gross weight is left for the load itself. Here is the distinction, straight from the dispatch desk.</p><h2>Lowboy is the family. RGN is one member of it.</h2><p>A lowboy is any semi-trailer whose deck drops into a well between the gooseneck and the rear axles. The whole point is deck height. A standard flatbed rides around five feet off the ground; a lowboy well typically sits 18 to 24 inches up. With the common legal height limit at 13'6\", that low well is what lets an 11-foot-tall machine run the interstate as a legal-height load instead of a permitted one.</p><p>\"RGN\" — removable gooseneck — describes how the front of the trailer works, not how low it sits. On an RGN, the neck detaches from the deck. The tractor pulls forward, the front of the deck drops to the ground, and the trailer becomes its own loading ramp. Every RGN is a lowboy. Not every lowboy is an RGN.</p><h2>Fixed-neck lowboys: lighter, longer deck, rear-load only</h2><p>A fixed gooseneck (FGN) lowboy keeps its neck permanently attached. That buys a lighter trailer — less structure, no detach hardware — and since the 80,000-pound gross limit covers tractor, trailer, and cargo combined, every pound of trailer you shed goes back to payload. Fixed necks also tend to give the lowest ride height and more usable deck for the same overall length.</p><p>The tradeoff is loading. Nothing drives on from the front. Your options are rear ramps, a dock, or a crane setting the piece from above. For a dead press or a transformer that is getting rigged and lifted anyway, that costs you nothing. For an operable dozer, it is the wrong tool.</p><h2>RGNs: the trailer that turns into a ramp</h2><p>Drop the neck and the front edge of the deck sits on the ground at a shallow angle. Tracked and wheeled equipment — excavators, dozers, pavers, scrapers, rough-terrain forklifts — walks straight on, gets chained down over the well, and the neck pins back on. No crane, no dock, no portable ramps to wrestle.</p><p>Two versions matter when you book one:</p><ul><li><strong>Mechanical RGN:</strong> the neck detaches using the tractor's motion and manual work. Lighter and simpler, but slower to cycle, and it wants firm, level ground.</li><li><strong>Hydraulic RGN (HRGN):</strong> hydraulics raise, lower, and detach the neck, and many can adjust deck height on the fly to shave inches off a tight load. Faster and more forgiving on rough sites, but the hydraulics add trailer weight that comes straight out of payload.</li></ul><figure><img src=\"../assets/img/loads/load-lowboy-warehouse.jpg\" alt=\"Lowboy trailer staged at a warehouse for machinery loading\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>A lowboy staged at the dock. The drop well between neck and rear axles is what keeps tall machinery under the 13'6\" limit.</figcaption></figure><h2>Axles are where capacity actually comes from</h2><p>Neither name tells you what the trailer can legally carry. Capacity comes from axle count and spacing, not the badge on the neck. Under the 80,000-pound gross limit, a tandem-axle lowboy handles mid-weight machines all day. Past that, you do not switch trailer families — you add axles: a flip axle at the rear, a jeep dolly between tractor and neck, a booster behind the trailer. This is where RGNs take over. The removable neck is built to pin into jeeps and accept boosters, which is why nearly every serious multi-axle configuration on the road is built around an RGN. Overweight loads then run on permits calculated from those axle spacings, state by state.</p><h2>Which trailer the load actually calls for</h2><ul><li><strong>Operable tracked or wheeled equipment:</strong> RGN. Drive it on, chain it down, go. Default for excavators, dozers, and loaders.</li><li><strong>Dead or non-running machinery being craned:</strong> fixed-neck lowboy. You are lifting anyway, and the lighter trailer buys payload and deck length.</li><li><strong>Tall but not especially heavy pieces:</strong> either works — check deck height against the machine and compare a step deck before committing to lowboy equipment at all.</li><li><strong>Loads above legal gross:</strong> multi-axle RGN with jeep and booster, permits, and possibly escorts. Engineered-move territory.</li></ul><h2>What moves the cost</h2><p>No amounts here — just the levers. RGNs, especially hydraulic and multi-axle units, are scarcer than flatbeds and step decks, so lane and timing matter more. Over-dimensional loads add state permits; overweight adds axle-based permitting; some routes require escort vehicles or surveys. Loading method counts too: a machine that drives on loads in minutes, while a crane lift means coordinating rigging crews at both ends. When Badass Logistics coordinates a lowboy move, those are the levers behind the quote.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Lowboy is any drop-well trailer; an RGN is a lowboy whose neck detaches so equipment drives on from the front.</li><li>Fixed-neck lowboys run lighter with more deck for the length, but load only from the rear or by crane.</li><li>Hydraulic RGNs cycle faster and adjust deck height; the hardware costs payload.</li><li>Capacity scales with axles — flip axles, jeeps, boosters — plus permits, not a different trailer name.</li><li>Operable equipment gets an RGN. Craned machinery gets a fixed neck. Above legal gross, it becomes an engineered multi-axle move.</li></ul></div>",
    faq: [{"q": "Is an RGN the same thing as a lowboy?", "a": "An RGN is one type of lowboy. Lowboy describes any trailer with a drop well between the gooseneck and rear axles; RGN means the gooseneck detaches so the front of the deck drops to the ground and equipment can drive on. Every RGN is a lowboy, but fixed-neck lowboys are not RGNs."}, {"q": "Can you drive equipment onto a fixed-neck lowboy?", "a": "Not from the front — the fixed gooseneck blocks it. Fixed-neck lowboys load from the rear with ramps, from a dock, or by crane from above. If the machine needs to drive on under its own power from ground level, spec an RGN."}, {"q": "How tall can a load ride on a lowboy without over-height permits?", "a": "With the common 13'6\" legal height limit and a well deck typically 18 to 24 inches off the ground, most lowboys legally carry cargo in the range of roughly 11 to 11.5 feet tall. Exact clearance depends on the specific trailer and the route, so confirm deck height before booking."}],
    related: [{"h": "Flatbed vs Step Deck vs RGN", "u": "flatbed-vs-step-deck-vs-rgn-trailers.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "How to Ship Industrial Machinery on a Flatbed", "u": "how-to-ship-industrial-machinery-on-a-flatbed.html"}, {"h": "Get a Quote", "u": "../contact.html"}],
  },
  {
    slug: "what-is-a-millwright",
    cat: "Specialized Rigging",
    hero: "rigging-hero.jpg",
    date: "2026-07-02",
    title: "What Is a Millwright — and Where They Fit in a Machine Move",
    desc: "What millwrights do — install, level, align, dismantle, and reassemble precision machinery — how the trade differs from rigging, and when a move needs both.",
    dek: "Riggers move the mass. Millwrights make the machine run again. Here is where the line sits between the two trades — and why most production machine moves need both.",
    tldr: "Millwrights install, level, align, dismantle, and reassemble precision machinery. Riggers move the weight. A rigging scope ends when the machine sits on its new footprint; a millwright scope ends when it holds tolerance under load. Any machine going back into production needs both trades, sequenced in the right order under one plan.",
    keywords: ["millwright", "millwright vs rigger", "machinery installation", "machine leveling and alignment", "machinery moving", "plant relocation", "industrial rigging"],
    body: "<p>A machine move is really two jobs. The first is moving mass: getting a 38,000-pound machining center off its foundation, across the floor, onto a trailer, and set down at the new plant without dropping it or racking the frame. The second is making that machine produce parts again — level, aligned, anchored, and holding tolerance. Riggers own the first job. Millwrights own the second. A steady share of the calls that hit our dispatch desk asking for one actually need both, so here is the plain-English version of who does what.</p><h2>What a millwright actually does</h2><p>A millwright is a precision industrial mechanic. The trade sits between heavy construction and machining: strong enough to wrestle a gearbox into position, precise enough to measure the result in thousandths of an inch. On a machine move, the work breaks into five buckets:</p><ul><li><strong>Installation.</strong> Setting the machine on its foundation, placing and torquing anchor bolts, shimming the base, and grouting where the spec calls for it.</li><li><strong>Leveling.</strong> Bringing the machine bed level and flat with machinist levels and laser instruments. This is not carpenter-level work — precision machine tools are commonly leveled to tolerances measured in thousandths of an inch per foot. A bed that sits twisted cuts scrap, wears unevenly, and drifts out of spec.</li><li><strong>Alignment.</strong> Shaft and coupling alignment between motors, gearboxes, and driven equipment using dial indicators or laser rigs. Misalignment kills bearings quietly, months after the move.</li><li><strong>Dismantling.</strong> Taking a machine apart for transport the right way: draining fluids, blocking axes and counterweights, match-marking mating parts, capping lines, and documenting the teardown so reassembly is not a guessing game.</li><li><strong>Reassembly and startup support.</strong> Putting it back together, verifying geometry, and supporting first power-up so the machine goes back to making parts instead of warranty claims.</li></ul><h2>What rigging covers — and where the line sits</h2><p>Rigging is the discipline of moving heavy loads under control. A rigging crew works out weight and center of gravity, selects the crane, gantry, forklift, or skate system, plans the travel path, checks floor loading, and executes the pick and the set. Riggers answer one question: how do we move this safely. Millwrights answer a different one: how does this run again.</p><p>The overlap is real — many millwrights carry rigging qualifications, and good machinery-moving crews field people who do both. But the finish line differs. A rigging scope is complete when the machine sits on its new footprint. A millwright scope is complete when the spindle runs true under load. If your scope of work stops at \"set in place,\" nobody on the job owns the second part — and that gap is where recommissioning problems live.</p><h2>How both trades sequence through a machine move</h2><ul><li><strong>Millwright first.</strong> Disconnect power, air, coolant, and data with the plant's electricians; drain and cap; block moving elements; pull whatever must come off for transport.</li><li><strong>Riggers out.</strong> Lift or skate the machine off its foundation, travel it to the dock, and load it with proper blocking and securement.</li><li><strong>Transport.</strong> Most dismantling decisions are trailer decisions. Stay inside the general legal envelope — roughly 8'6\" wide, 13'6\" tall, and 80,000 pounds gross — and the machine moves as standard freight. Go over, and the move needs oversize permits, defined routes, and sometimes escorts. Pulling a column or splitting a press bed is often what keeps a load legal.</li><li><strong>Riggers in.</strong> Offload, travel to the final footprint, and set the machine on its foundation.</li><li><strong>Millwright last.</strong> Reassemble, anchor, grout, level, align, reconnect, and support startup.</li></ul><figure><img src=\"../assets/img/rigging-crane.jpg\" alt=\"Crane and rigging crew lifting industrial machinery during a machine move\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Rigging gets the machine on and off the truck. Millwright work is everything before the pick and after the set.</figcaption></figure><h2>When a job needs both — and when rigging alone is enough</h2><p>Plan on both trades when the machine is going back into production: CNC machining centers, grinders, presses, injection molders, and anything with an alignment-critical drivetrain or a leveling spec in the install manual. Production lines add sequencing on top — machines have to come back online in the order the process runs.</p><p>Rigging alone can be enough when the machine is skidded and self-contained, headed to storage or auction rather than production, or when the buyer's own maintenance team handles recommissioning. Be honest about which case you are in. \"We'll level it ourselves later\" works fine for a shop press and badly for a five-axis machining center.</p><h2>What drives cost and schedule</h2><p>No two machine moves price the same, but the drivers are consistent: how much dismantling the machine needs to travel legally, how tight the leveling and alignment spec is, whether the foundation needs anchors or grout with cure time, whether the OEM requires certified installation to keep the warranty intact, and how narrow the downtime window is. One coordinated plan covering rigging, transport, and millwright work beats three contractors pointing at each other.</p><p>That coordination is the job at Badass Logistics: we scope the move, line up the rigging and millwright crews, arrange the transport leg, and sequence the handoffs so the machine that left your floor making parts arrives ready to do the same.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Riggers move the mass; millwrights make the machine run. One scope ends at set-in-place, the other at holds-tolerance.</li><li>Any machine returning to production needs millwright work: leveling, alignment, anchoring, startup support.</li><li>Dismantling is usually a transport decision — staying inside roughly 8'6\" wide, 13'6\" tall, and 80,000 pounds gross keeps the load legal.</li><li>Put both trades in one coordinated scope so no gap opens between machine set and machine running.</li></ul></div>",
    faq: [{"q": "Is a millwright the same as a rigger?", "a": "No. Rigging is moving heavy loads under control — picks, travel paths, securement. Millwright work is precision: installing, leveling, aligning, and reassembling machinery so it runs in spec. Many pros carry both skill sets, but the scopes end in different places, and your contract should name both."}, {"q": "Do I need a millwright if the machine is only going into storage?", "a": "Usually not for the move itself — rigging and transport handle a skidded, self-contained machine fine. But a proper millwright teardown before storage, with fluids drained, axes blocked, and parts match-marked, makes the eventual reinstall far cleaner and faster."}, {"q": "Who handles the transport leg between plants?", "a": "That is a freight coordination job. Badass Logistics arranges the trucking alongside the rigging and millwright crews and sequences all three, so the trailer shows up when the machine is ready to load and the install crew is waiting at the other end."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "Industrial Rigging", "u": "../services/rigging.html"}, {"h": "What Is Industrial Rigging?", "u": "what-is-industrial-rigging.html"}, {"h": "Plant Relocation", "u": "../services/plant-relocation.html"}],
  },
  {
    slug: "what-is-a-superload",
    cat: "Heavy Haul",
    hero: "loads/gooseneck-flatbed-industrial-tanks.jpg",
    date: "2026-07-02",
    title: "What Is a Superload? Thresholds, Permits, Escorts & Engineering Explained",
    desc: "A superload exceeds a state's routine oversize permit limits — often 16 ft wide or 200,000 lbs — and triggers bridge analysis, escorts, and long lead times.",
    dek: "Past a certain size, the state stops selling permits and starts reviewing engineering.",
    tldr: "A superload is a load that exceeds a state's routine oversize/overweight permit envelope — commonly around 16 feet wide, 16 feet high, or 200,000 pounds gross, though every state draws its own lines. It requires individual bridge analysis, a physical route survey, escorts (often police), utility coordination, and weeks to months of lead time.",
    keywords: "superload, superload permits, heavy haul, oversize load, bridge analysis, route survey, superload escort requirements",
    body: "<p>Every state will sell a routine oversize permit in minutes through an online portal. A superload is the freight that breaks that system. The state stops auto-issuing and starts reviewing — your specific load, your specific trailer, every specific bridge on your route. That's the working definition from the dispatch side: a superload is any load big enough or heavy enough that an engineer has to approve it before it moves.</p><h2>Legal, Oversize, Superload: Three Tiers</h2><p>Standard legal freight in the US tops out around 8'6\" wide, 13'6\" tall (14' across much of the West), a 53' trailer, and 80,000 lbs gross vehicle weight. Cross any one of those numbers and you need an oversize or overweight permit.</p><p>Most permit loads live in the second tier. States publish pre-approved envelopes — dimension and weight limits under which permits issue automatically, often the same day. A 12' wide excavator on an RGN is paperwork, not a project.</p><p>A superload exceeds the routine envelope. Every state draws its own line, but common triggers sit around <strong>16' wide, 16' high, or 200,000 lbs gross</strong>, with length thresholds that vary widely. The same transformer can be a routine permit in one state and a superload in the next — and since permits issue state by state, the strictest state on your route sets your schedule.</p><figure><img src=\"../assets/img/loads/heavy-haul-industrial-enclosures-flatbed.jpg\" alt=\"Oversize industrial enclosures chained down on a flatbed trailer for heavy-haul transport\" loading=\"lazy\" width=\"1131\" height=\"848\"><figcaption>Once dimensions clear the routine permit envelope, the state stops selling permits and starts reviewing engineering.</figcaption></figure><h2>Bridge Analysis: Why the Engineering Comes First</h2><p>Gross weight isn't what breaks bridges — concentrated weight is. State bridge engineers model your exact axle configuration — axle count, spacing, weight per axle — against every structure on the proposed route. That analysis is why superload trailers get long: 13-axle stretches, 19-axle perimeter frames, dual-lane transporters that put two full trailer widths under one load. The goal never changes: spread the weight until no single point exceeds what the span was built to carry.</p><p>Sometimes the answer comes back conditional — cross this bridge alone, centered on the deck, at walking speed, traffic held at both ends. Those conditions get written into the permit, and police enforce them on move day.</p><h2>The Route Survey</h2><p>Before the application goes in, someone physically drives the route. Not a map app — a truck with a height pole. The survey documents:</p><ul><li><strong>Vertical clearances</strong> — overpasses, sign gantries, traffic signals, and every wire crossing the road</li><li><strong>Horizontal pinch points</strong> — bridge rails, work zones, medians, toll plazas</li><li><strong>Turning geometry</strong> — whether a long combination can actually make the ramp, the roundabout, the plant gate</li><li><strong>Obstructions that have to move</strong> — signals on span wires, signs, low limbs</li></ul><p>Many states require the survey report with the superload application. Skip it and you find the 15'9\" wire at 2 a.m. with a 16'4\" load under it.</p><h2>Permits: Individual Review, Not Auto-Issue</h2><p>A superload permit is an engineering submission, not a form. The application routes through the permit office, the bridge division, sometimes district maintenance — and they review that one load on that one route. Dimensions lock to the permit; change the trailer or add a foot of height and the review starts over. Multi-state moves multiply all of it, because each state runs its own review on its own clock. Our <a href=\"oversize-load-permits-guide.html\">oversize load permits guide</a> covers the routine tier — superloads sit above everything in it.</p><h2>Escorts, Police, and Utility Crews</h2><p>Routine oversize loads take pilot cars. Superloads take a convoy:</p><ul><li><strong>Escort vehicles</strong> front and rear, with a height-pole car running ahead of anything over-height</li><li><strong>Police escorts</strong>, mandatory in most states above certain dimensions or on certain routes — scheduled around agency availability, which you don't control</li><li><strong>Utility crews</strong> to lift or de-energize power, phone, and cable lines, and to swing traffic signals out of the way and reinstall them behind the load</li><li><strong>Travel windows</strong> — daylight-only on rural stretches, night-only through cities, no weekends, no holidays, full stop for weather</li></ul><p>Utility coordination is what blows schedules. Every power company, telecom, and municipality schedules its own crews, and a route with forty wire lifts needs forty commitments that all hold on the same day.</p><h2>Lead Times: Weeks to Months</h2><p>A routine oversize permit issues in minutes to days. A superload runs weeks to months, driven by the number of states crossed, the number of bridges requiring individual analysis, utility and police scheduling, and seasonal restrictions — northern states impose spring-thaw weight limits that can close routes for weeks. None of it compresses well. The best move a shipper can make is bringing the transport team in while the load is still on the drawing board: shipping in two sections, dropping deck height, or relocating lift points can knock a move down a full permit tier.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>A superload exceeds a state's routine oversize/overweight permit envelope — commonly around 16' wide, 16' high, or 200,000 lbs gross, but every state sets its own thresholds.</li><li>Superload permits are individually engineered: bridge analysis on your exact axle configuration plus a physical route survey.</li><li>Plan for police escorts, utility line lifts, restricted travel windows, and weeks-to-months lead times — the strictest state on the route sets the schedule.</li><li>Involve the transport coordinator before the load is built; a design change is easier than a route change.</li></ul></div><p>If you have a drawing with 16' of anything on it, start the conversation now — not when it ships. We coordinate superload moves end to end: engineering, permits, surveys, escorts, and the carriers and rigging crews that run this class of equipment every week. See our <a href=\"../services/heavy-haul.html\">heavy haul transport</a> page or <a href=\"../contact.html\">get a quote</a>.</p>",
    faq: [{"q": "What's the difference between an oversize load and a superload?", "a": "An oversize load exceeds legal dimensions (8'6\" wide, 13'6\" tall, ~53' long, 80,000 lbs gross) but fits inside a state's pre-approved permit envelope, so permits issue automatically. A superload exceeds that envelope and gets individual review — bridge analysis, route approval, and permit conditions written for that one load on that one route."}, {"q": "How much lead time does a superload move need?", "a": "Plan on weeks to months, not days. The clock is driven by the number of states crossed, bridges requiring individual engineering analysis, utility crew scheduling for line lifts, police escort availability, and seasonal road restrictions. Multi-state superloads should be in planning before the load is even built."}, {"q": "Who decides whether police escorts are required for a superload?", "a": "Each state — and sometimes the municipality — sets escort requirements as permit conditions based on dimensions, weight, and route. Above certain thresholds, law-enforcement escorts are mandatory and scheduled through the agency, and their availability often dictates the move date rather than the other way around."}],
    related: [{"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "Pilot Car & Escort Requirements", "u": "pilot-car-escort-requirements.html"}, {"h": "How Much Does Heavy Haul Cost?", "u": "how-much-does-heavy-haul-cost.html"}],
  },
  {
    slug: "what-is-project-cargo",
    cat: "Freight & Trucking",
    hero: "brokerage-flatbed.jpg",
    date: "2026-07-02",
    title: "What Is Project Cargo? Moving Oversized, Complex Shipments",
    desc: "What project cargo is, why it's different from standard freight, and how oversized multi-piece industrial moves get engineered, permitted, and coordinated.",
    dek: "Project cargo isn't a big truckload. It's an engineered program of permits, trailers, rigging, and sequencing — and if one piece slips, the whole project feels it.",
    tldr: "Project cargo is large, high-value, usually multi-piece freight tied to a capital project — plant builds, energy equipment, process vessels. Unlike standard freight, it has to be engineered before it's booked: route surveys, state-by-state permits, specialized trailers, rigging at both ends, and a delivery sequence dictated by the install schedule. One coordinator owns the whole chain from drawing to final set.",
    keywords: "project cargo, oversized freight, heavy haul, breakbulk shipping, rigging, plant relocation, freight coordination",
    body: "<p>Ask ten people in freight what project cargo is and you'll get ten answers. From the dispatch desk, the definition is simple: project cargo is any shipment that has to be <strong>engineered instead of just booked</strong>. It's the big, heavy, high-value, usually multi-piece freight tied to a capital project — a plant build, a substation, a mine expansion, a refinery turnaround — where the cargo, the route, the equipment, and the delivery order all get planned as one program.</p><p>Standard freight lives inside the legal envelope: roughly 8'6\" wide, 13'6\" tall, about 53' of trailer, and 80,000 lbs gross vehicle weight. You book a truck, it loads, it delivers. Project cargo breaks that model in at least one direction — a single piece that blows past the envelope, or forty pieces that only work if they arrive in the right sequence.</p><h2>What actually qualifies as project cargo</h2><ul><li><strong>Energy equipment</strong> — turbines, generators, transformers, wind tower sections, nacelles</li><li><strong>Process equipment</strong> — pressure vessels, reactors, columns, boilers, heat exchangers</li><li><strong>Heavy machinery</strong> — presses, crushers, mills, kilns, complete production lines</li><li><strong>Fabricated structures</strong> — bridge girders, modular skids, pre-assembled pipe racks, storage tanks</li></ul><p>Size isn't the only trigger. A <a href=\"../services/plant-relocation.html\">plant relocation</a> that fills forty trailers is project cargo even when most loads are legal-dimension, because the machining centers have to land before the walls close in and the press line has to arrive in install order. The moment sequencing matters, you've left standard freight territory.</p><figure><img src=\"../assets/img/loads/gooseneck-flatbed-industrial-tanks.jpg\" alt=\"Industrial tanks chained and secured on a gooseneck flatbed trailer for a multi-piece project cargo move\" loading=\"lazy\" width=\"1024\" height=\"576\"><figcaption>Industrial tanks secured on a gooseneck flatbed — one truckload out of many on a typical multi-piece project move.</figcaption></figure><h2>Five things that separate it from standard freight</h2><p><strong>1. Engineering comes first.</strong> Before any truck gets booked, someone verifies the piece's weight, dimensions, and center of gravity against deck ratings and axle spacing. Overweight loads trigger axle-loading calculations. The heaviest moves can require engineered bridge reviews in some states. Lift plans get drawn for both ends before a wheel turns.</p><p><strong>2. The equipment is specialized.</strong> RGNs, multi-axle lowboys, stretch flatbeds, hydraulic platform trailers, dolly systems — the trailer is chosen off the drawing, not off what's parked nearby. A tall vessel that clears on a double-drop won't clear on a standard flatbed, and an overweight load may need extra axles just to spread the footprint legally.</p><p><strong>3. Permits and escorts rule the calendar.</strong> Every state issues its own oversize/overweight permits with its own approved routes, curfews, escort rules, and travel windows. Tall loads can require a height pole car and utility crews to lift wires. Permits get sequenced across every state on the route — one denial or route restriction can reroute the entire move.</p><p><strong>4. Multiple modes, one plan.</strong> The heaviest piece may ride barge or rail while everything else runs over the road, with a laydown yard and a crane transfer in between. Every mode change is its own rigging job with its own lift plan.</p><p><strong>5. Rigging is part of the shipment, not an afterthought.</strong> Pieces get disconnected, skated out of buildings, lifted, blocked, and secured at origin — then set by crane or gantry at destination, often into a scheduled window the installation crew is standing by for. A late piece doesn't just cost a delivery date; it idles millwrights and crane time.</p><h2>How an end-to-end move gets coordinated</h2><p>It starts with data: verified dimensions, weights, drawings, and center-of-gravity marks for every piece — not estimates off a spec sheet. Then the route survey, which for the biggest pieces means physically driving the route, measuring bridge clearances, and checking turn radii at every interchange. Equipment gets matched to each piece, permits get filed state by state, and escort and utility work gets scheduled around curfews and travel windows.</p><p>Then execution: rigging crews load out at origin, trucks run their permitted windows, and the destination crane sets each piece in install order. The value of a single coordinator — the <a href=\"../services/heavy-haul.html\">heavy haul</a> and brokerage role — is that carriers, riggers, permit services, and the site schedule all answer to one plan. When the schedule moves, one desk re-sequences everything instead of five vendors pointing at each other.</p><h2>What drives the cost</h2><p>No two project moves price the same, but the drivers are consistent: how far the piece exceeds the legal envelope (which dictates axle count, permits, and escorts), how many states the route crosses, whether bridge engineering or route modifications are required, the crane and rigging scope at both ends, laydown or storage between modes, and how compressed the schedule is. Weight and width cost money. Surprises cost more. The cheapest project move is the one measured correctly the first time.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Project cargo is freight that has to be engineered, not just booked — oversized, overweight, high-value, or sequence-critical multi-piece moves.</li><li>Anything past 8'6\" wide, 13'6\" tall, ~53' long, or 80,000 lbs gross leaves standard freight and enters permit territory.</li><li>Permits, escorts, route surveys, and rigging windows drive the schedule — start with verified dimensions and weights, not estimates.</li><li>One coordinator owning carriers, riggers, and permits end to end is what keeps a forty-load program on sequence.</li></ul></div><p>Planning a plant build, equipment install, or multi-piece industrial move? Start with the drawings and <a href=\"../contact.html\">get a quote</a> — or if your load fits on a single trailer, read our guide on <a href=\"how-to-ship-industrial-machinery-on-a-flatbed.html\">shipping industrial machinery on a flatbed</a>.</p>",
    faq: [{"q": "Is project cargo the same thing as heavy haul?", "a": "No. Heavy haul is one discipline inside project cargo — moving a single overdimensional or overweight piece on specialized trailers. Project cargo is the whole program: multiple pieces, multiple trailers or modes, rigging at both ends, and a delivery sequence tied to an installation schedule. A single transformer move is heavy haul; that transformer plus the switchgear, skids, and control buildings arriving in set order is project cargo."}, {"q": "How far in advance should a project cargo move be planned?", "a": "As early as possible — ideally while the equipment is still being fabricated. The longest lead items are permits and engineering on the heaviest pieces: superload permits, bridge reviews, and utility coordination for wire lifts all take longer than booking trucks. Route surveys can also change the plan entirely, so locking dimensions and weights early prevents re-permitting later."}, {"q": "Does every piece in a project move need oversize permits?", "a": "No. Only pieces that exceed the legal envelope — generally 8'6\" wide, 13'6\" tall, about 53' long, or 80,000 lbs gross — need oversize/overweight permits. Legal-dimension pieces move as standard freight. But they still get sequenced into the same delivery plan, because the install schedule doesn't care which loads were permitted."}],
    related: [{"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "Plant Relocation", "u": "../services/plant-relocation.html"}, {"h": "How to Ship Industrial Machinery on a Flatbed", "u": "how-to-ship-industrial-machinery-on-a-flatbed.html"}],
  },
  {
    slug: "how-to-move-a-lathe",
    cat: "Machinery Moving",
    hero: "loads/load-machine-loadout.jpg",
    date: "2026-07-03",
    title: "How to Move a Metal Lathe Without Twisting the Bed",
    desc: "How to move a metal lathe without twisting the bed: weights, rigging points, tailstock and chuck prep, skating, air-ride vs flatbed, and re-leveling to spec.",
    dek: "Long, headstock-heavy, and allergic to twist — a lathe move is won or lost at the rigging points and finished with a machinist level.",
    tldr: "Rig a lathe from the bed casting or factory lift points — never the ways, leadscrew, or feed rod. Pull the chuck, tailstock, and steady rests, lock the carriage at the headstock, skate on three points of support, ship precision machines air-ride, and re-level both ends of the bed to matching readings before the first cut.",
    keywords: "how to move a metal lathe, lathe rigging, engine lathe transport, machinery skates, lathe bed twist, machinery moving, air-ride machinery transport",
    howto: {"name": "How to Move a Metal Lathe", "steps": [{"name": "Document and weigh", "text": "Pull the builder's plate and manual. Record weight, swing, distance between centers, and overall length, and locate the factory lift points. Note that the headstock end carries well over half the weight."}, {"name": "Strip the machine", "text": "Remove the chuck, steady rests, follow rests, and tooling and crate them separately. Remove the tailstock or lock and strap it at the far end. Run the carriage tight to the headstock, lock it, and strap it. Oil and wrap the ways."}, {"name": "Rig from the casting", "text": "Sling the bed casting with hardwood softeners and a spreader bar, or set padded forks under the bed from the tailstock end or the back. Never load the ways, leadscrew, feed rod, or chip pan. Center the lift on the headstock bias."}, {"name": "Skate on three points", "text": "Toe-jack the machine only as high as needed and set two skates under the headstock end and one steerable skate under the tailstock end. Three points cannot rock the bed into a twist. Sweep the route and walk it slow."}, {"name": "Load and secure", "text": "Use an air-ride trailer for toolroom and CNC-grade lathes; a flatbed or step deck with solid blocking works for rough heavy engine lathes. Chain through the base or foot holes, never over the bed. Shrink wrap and tarp against road spray."}, {"name": "Re-level and verify", "text": "At destination, set a precision machinist level across the ways at both ends and adjust the leveling screws until the readings match, removing all twist. Take a light test cut and measure for taper, then recheck the level after the machine settles."}]},
    body: "<p>A lathe is one long precision casting with everything else bolted to it. Every cut the machine will ever make rides on the geometry ground into that bed at the factory. Twist it during a move — wrong lift point, uneven skating, a hard set-down — and the machine turns a taper into every part until somebody re-levels it. Here is how our <a href=\"../services/machinery-moving.html\">machinery moving</a> crews handle them: nothing touches the ways from door to door.</p>\n\n<h2>Know what you are moving</h2>\n<p>\"Metal lathe\" covers a huge range. A 12x36 bench machine weighs a few hundred pounds. A 14x40 engine lathe typically runs 2,000 to 3,000 pounds. A Monarch 10EE toolroom lathe packs over 3,000 pounds into the footprint of a desk, and turret lathes and hollow-spindle oilfield machines run 10,000 to 20,000 pounds and beyond. Pull the builder's plate and manual before anyone touches the machine. Nearly every lathe rides legal — inside 8'6\" wide, 13'6\" tall, and 80,000 pounds gross — so the problem is rarely permits. It is geometry.</p>\n<p>One number matters more than gross weight: headstock bias. The headstock — spindle, gearbox, motor — puts well over half the weight at one end. The center of gravity is nowhere near the middle of the bed, and every lift, skate, and tie-down decision starts there.</p>\n\n<h2>Rig from the casting, never the ways</h2>\n<p>The ways are the finished surfaces the carriage and tailstock ride on. Nothing bears on them. No slings, no forks, no chains, no boots. Same rule for the leadscrew, feed rod, and control rod running along the front of the bed — a forklift coming in from the operator side will bend all three before the driver feels a thing.</p>\n<ul>\n<li><strong>Slings:</strong> around the bed casting between headstock and carriage and near the tailstock end, with hardwood softeners, run to a spreader bar so they pull vertical instead of pinching the ways.</li>\n<li><strong>Forklift:</strong> padded forks under the bed or base webs from the back or the tailstock end, load centered on the headstock bias — not the middle of the bed.</li>\n<li><strong>Factory points:</strong> many lathes have cast lifting bosses or threaded lift holes. If the manual shows them, use them.</li>\n</ul>\n\n<h2>Strip it before it rolls</h2>\n<p><strong>Chuck:</strong> comes off. A large four-jaw hangs serious weight cantilevered off the spindle nose, and every pothole hammers that leverage into the spindle bearings. On a threaded nose it can also unscrew itself in transit. It rides in its own crate.</p>\n<p><strong>Tailstock:</strong> remove and crate it, or lock it down hard at the far end of the bed and strap it. A loose tailstock is a battering ram on rails.</p>\n<p><strong>Steady rests and follow rests:</strong> off, wrapped, crated. <strong>Carriage:</strong> run it up tight to the headstock, lock it, strap it — rolling mass over the center of gravity, not loose at mid-bed.</p>\n<p>Then coat the ways in way oil or rust preventive and wrap the machine. Bare cast iron flash-rusts in one humid night on the road.</p>\n\n<figure><img src=\"../assets/img/loads/crating-shrink-wrap-electrical-equipment.jpg\" alt=\"Industrial equipment shrink-wrapped and crated for machinery transport\" loading=\"lazy\" width=\"600\" height=\"800\"><figcaption>Everything you strip off the lathe — chuck, tailstock, steady rests — gets wrapped and crated, and rides separately from the machine.</figcaption></figure>\n\n<h2>Skate on three points, not four</h2>\n<p>Machinery skates get the lathe to the door, and this is where beds get twisted. Three points of support cannot rock: two skates under the headstock end, one steerable skate under the tailstock. Four skates on a floor that is not dead flat means the bed spends part of the trip bridging a diagonal — twist, applied under full machine weight. Toe-jack under the casting, lift only as high as the skates need, sweep the route, walk it slow.</p>\n\n<h2>Air-ride van or flatbed</h2>\n<p>A toolroom or CNC-grade lathe wants an air-ride trailer — the suspension soaks up the shock loads a stiff-sprung deck passes straight into the spindle bearings and ways. A rough heavy engine lathe travels fine on a flatbed or step deck with solid blocking, chained through the base or foot holes — never over the bed, never near the leadscrew. Shrink wrap under a tarp keeps road spray off the machined surfaces either way. The same discipline applies to machining centers — see <a href=\"how-to-move-a-cnc-machine.html\">how to move a CNC machine</a>.</p>\n\n<h2>Re-level to spec or the move is not finished</h2>\n<p>Setting the lathe on the new floor is not the end of the job. Put a precision machinist level — typical sensitivity 0.0005 inches per 10 inches per division — across the ways at the headstock end, then the tailstock end, and adjust the leveling screws until both readings match. Matching matters more than absolute level: equal readings mean no twist. Then prove it with metal — a light cut on a test bar, measured for taper. Recheck after a week or two as the machine settles. Full procedure in our <a href=\"machine-leveling-and-alignment.html\">machine leveling and alignment</a> guide, or <a href=\"../contact.html\">get a quote</a> and we bring the level.</p>\n\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n<li>Nothing touches the ways, the leadscrew, or the feed rod — rig from the bed casting or the factory lift points.</li>\n<li>Chuck, tailstock, steady rests: off the machine and crated. Carriage locked tight against the headstock.</li>\n<li>The headstock carries well over half the weight — plan every lift, skate, and chain around that bias.</li>\n<li>Three points of support beat four on any floor that is not dead flat.</li>\n<li>The move is done when a machinist level reads the same at both ends of the bed and a test cut runs true.</li>\n</ul></div>",
    faq: [{"q": "Can you move a metal lathe with a forklift?", "a": "Yes, if the forks go under the bed casting or base — padded, approaching from the back or the tailstock end, never from the operator side where the leadscrew and feed rod run. Set the load center on the headstock end, which carries well over half the weight, and never lift against the ways or the chip pan."}, {"q": "Does the chuck have to come off before shipping a lathe?", "a": "Yes. A heavy chuck cantilevered off the spindle nose turns every road shock into a hammer blow on the spindle bearings, and on a threaded spindle nose it can spin itself loose in transit. Pull it, crate it, and ship it alongside the tailstock, steady rests, and tooling."}, {"q": "How do you check a lathe for bed twist after a move?", "a": "Set a precision machinist level across the ways at the headstock end and again at the tailstock end, then adjust the leveling screws until both readings match — equal readings mean the bed carries no twist. Confirm with a light test cut on a bar and measure for taper. Recheck the level after a week or two as the machine settles into the floor."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "CNC Machine Movers", "u": "../services/cnc-machine-movers.html"}, {"h": "How to Move a CNC Machine", "u": "how-to-move-a-cnc-machine.html"}, {"h": "Machine Leveling and Alignment", "u": "machine-leveling-and-alignment.html"}],
  },
  {
    slug: "how-to-move-a-mobile-home",
    cat: "Heavy Haul",
    hero: "loads/load-modular-building.jpg",
    date: "2026-07-03",
    title: "How to Move a Mobile or Modular Home: Permits, Toters, and Setup",
    desc: "Single, double, or triple-wide — every manufactured home moves as an oversize load. What permits, escorts, toter trucks, prep, and setup actually involve.",
    dek: "Every manufactured home is over legal width before it leaves the pad. Here's the whole job — permits, escorts, toters, prep, and setup — section by section.",
    tldr: "Mobile and modular homes exceed the 8'6\" federal legal width by design, so every move is a permitted, escorted oversize haul in every state it crosses. Multi-section homes split at the marriage line and move one section per toter truck. Prep — utilities, skirting, HVAC, marriage-line wrap — and setup — blocking, leveling, rejoining, inspection — are as much of the job as the drive.",
    keywords: "mobile home transport, modular home moving, manufactured home movers, toter truck, oversize load permits, double wide transport, mobile home setup",
    howto: {"name": "How to Move a Mobile or Modular Home", "steps": [{"name": "Measure and document the home", "text": "Record width at the eaves, loaded height at the roof peak, length including the hitch, section count, and the HUD data plate or serial number. Every permit on the route is written off these numbers, so measure the real house — not the brochure."}, {"name": "Order permits and escorts for every state on the route", "text": "Width over 8'6\" makes the home oversize everywhere, so each state issues its own permit with its own approved routing and escort rules. If loaded height runs close to 13'6\", order a route survey for bridges, signals, and power lines."}, {"name": "Prep the home for transport", "text": "Have licensed trades disconnect and cap electric, water, sewer, and gas or propane. Remove skirting, decks, steps, awnings, and carports. Disconnect the HVAC condenser, secure the interior, and wrap each open marriage-line side in weatherproof sheeting."}, {"name": "Inspect and rebuild the running gear", "text": "Homes that have sat for years need axles, hubs, tires, brakes, and the hitch checked — and often replaced — before they can roll. The toter couples to the home's own chassis, so the chassis has to be roadworthy first."}, {"name": "Haul each section separately", "text": "One section per toter: a double-wide is two oversize moves, a triple-wide is three. Travel runs daylight hours under most state permits, with weekend and holiday curfews, pilot cars in position, and sections arriving in the order the set crew needs them."}, {"name": "Set, rejoin, and inspect at the destination", "text": "Block, level, and anchor each section per the wind zone on the data plate. Close the marriage line, reconnect crossover ducts, wiring, and plumbing, hook utilities back up, reinstall skirting, and pass the local inspection before occupancy."}]},
    body: "<p>A manufactured home is the one load that's oversize before anyone measures it. Legal limits on US highways run 8'6\" wide, 13'6\" tall, about 53' long, and 80,000 lbs gross. Mobile and modular homes are almost always over legal width by design — the house is built wider than the road allows, on purpose, because that's what makes it a house. So every home move is a permitted, escorted oversize haul in every state it touches. Here's the whole job, from the dispatch desk.</p><figure><img src=\"../assets/img/heavyhaul-hero.jpg\" alt=\"Oversize load with escort vehicles moving down an open US highway\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Every manufactured home on the road is an oversize load by design — permitted, escorted, and routed before the wheels turn.</figcaption></figure><h2>Count the sections, count the hauls</h2><p>A single-wide is one box on one steel chassis: one trip, one permit set per state. A double-wide is two sections built to join at the marriage line — it splits at that factory seam, and each half moves as its own oversize load with its own permits and its own escorts. A triple-wide is three separate hauls. Nobody moves a multi-section home joined; it doesn't fit on any road and it isn't engineered to travel that way. Plan the schedule around that: a triple-wide is three oversize moves that all have to land at the same site, in the right order.</p><p>Modular homes differ on paper — built to state and local building code instead of the federal HUD code — but on the road they get the same treatment. Sections travel on carriers or their own frames, they're over legal width, and two-story sections can push height too. Anything scaling close to 13'6\" loaded means a route survey for bridges, signals, and power lines, sometimes with a utility crew standing by to lift wires. Not sure where your home lands? Start with <a href=\"what-is-considered-an-oversize-load.html\">What Is Considered an Oversize Load?</a></p><h2>The toter: built for exactly this job</h2><p>HUD-code homes don't ride a lowboy — they roll on their own axles and tires, towed by a toter: a heavy truck purpose-built or converted for home transport, with a short wheelbase for tight park streets, ballast over the drive axles for traction, and a heavy hitch matched to the home's coupler. It's the same discipline as any <a href=\"../services/heavy-haul.html\">heavy haul transport</a> move — weight, clearance, routing — applied to a load that flexes and catches wind. And because many homes sit for years between moves, the running gear gets inspected first. Dry-rotted tires, seized hubs, and missing axles get found in the driveway, not on the interstate.</p><h2>Prep: what happens before the truck shows up</h2><p>Most blown schedules on home moves are prep failures, not transport failures. Before move day: utilities disconnected and capped by licensed trades — electric at the meter, water, sewer, gas or propane. Skirting comes off completely so crews can reach the frame and hitch. Decks, steps, porches, awnings, and attached carports come off; none of it travels with the house. The HVAC condenser is disconnected and moved separately, and on multi-section homes the crossover ductwork and wiring under the floor are split. Inside, secure everything — tape cabinet doors, brace appliances, empty the shelves. Then each section's open marriage-line side gets sheeted in weatherproof plastic, because that wall of your house is about to run down the highway exposed.</p><h2>Permits and escorts, every state, every time</h2><p>Since the width is over legal everywhere, every state on the route issues its own oversize permit with its own approved routing, and most restrict travel to daylight hours with weekend and holiday curfews. Escort rules scale with width — at typical home widths, expect pilot cars front and rear, and the widest sections trigger police escort in some states. The rules change at every state line, so a multi-state home move is really a chain of separate permits stitched into one continuous route. Our <a href=\"oversize-load-permits-guide.html\">Oversize Load Permits Guide</a> and <a href=\"pilot-car-escort-requirements.html\">Pilot Car & Escort Requirements</a> pages break down how the pieces fit. We coordinate all of it — permits, escorts, routing, timing — so the sections keep moving instead of sitting at a border waiting on paperwork.</p><h2>Setup: delivery is the halfway point</h2><p>When the toter stops, the job is half done. Sections get backed or winched onto the prepared pad or foundation, blocked, leveled, and anchored per the wind zone on the home's data plate. Multi-section homes are rejoined at the marriage line — structure fastened, roof cap closed, crossover ducts, wiring, and plumbing reconnected. Utilities hook back up, skirting goes back on, and the local jurisdiction inspects before anyone moves in. The best thing an owner can do for setup day is site prep: a firm, level, accessible pad. Soft ground stops a toter faster than any permit office.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Every mobile or modular home exceeds the 8'6\" legal width — every move is permitted and escorted in every state it crosses.</li><li>Multi-section homes move one section per truck: a double-wide is two oversize hauls, a triple-wide is three.</li><li>Prep kills more schedules than transport — utilities, skirting, decks, HVAC, and marriage-line wrap all happen before the toter arrives.</li><li>Setup is half the job: blocking, leveling, anchoring, rejoining, and inspection before anyone moves in.</li></ul></div><p>Moving a single, double, or triple-wide? <a href=\"../contact.html\">Get a Quote</a> with the width at the eaves, the height at the peak, and both addresses — we'll build the plan: permits, escorts, toter, and set crew.</p>",
    faq: [{"q": "Can a double-wide mobile home be moved in one piece?", "a": "No. Multi-section homes are built to separate at the marriage line for transport. Each section moves as its own oversize load with its own permits and escorts — a double-wide is two hauls, a triple-wide is three. The sections are rejoined, sealed, and reconnected at the destination."}, {"q": "Do I need permits to move a mobile home a short distance?", "a": "Yes. Any manufactured home wider than 8'6\" is oversize on any public road, so even a move across town requires a state oversize permit — and many counties add a local moving permit and proof of ownership before the home can leave the lot."}, {"q": "What kind of truck moves a mobile home?", "a": "A toter — a heavy truck purpose-built or converted for home transport, with a short wheelbase, ballasted drive axles, and a heavy hitch that couples to the home's own chassis. HUD-code homes roll on their own axles and tires, which is why the running gear gets inspected, and often rebuilt, before the move."}],
    related: [{"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "Pilot Car & Escort Requirements", "u": "pilot-car-escort-requirements.html"}, {"h": "What Is Considered an Oversize Load?", "u": "what-is-considered-an-oversize-load.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "how-to-ship-a-bulldozer",
    cat: "Heavy Haul",
    hero: "rgn-load.jpg",
    date: "2026-07-03",
    title: "How to Ship a Bulldozer: From Compact Dozers to D11-Class Superloads",
    desc: "How to ship a bulldozer, from compact dozers to D11-class: RGN vs lowboy, overweight permits, blade and ripper removal, track securement, route planning.",
    dek: "Trailer selection, teardown calls, chains, and permits for every dozer size class — straight from the dispatch desk.",
    tldr: "Match the trailer to the machine's real weight and dimensions. Small dozers can travel inside the legal envelope, mid-size machines go overwidth the moment the blade is on, and anything D7-class and up is a permitted overweight load on a multi-axle RGN. Pull the blade and ripper when width or weight triggers escorts, chain to designated frame points per federal securement rules, and permit every state on the route before the tracks touch the deck.",
    keywords: "how to ship a bulldozer, bulldozer transport, dozer hauling, RGN trailer, lowboy trailer, overweight permits, heavy equipment shipping",
    howto: {"name": "How to Ship a Bulldozer", "steps": [{"name": "Pin down the real specs", "text": "Weigh the machine or pull the operating weight off the serial plate, then measure height, width, and length with every attachment installed. Quotes and permits built on brochure numbers fail at the scale house."}, {"name": "Match the trailer and axle count", "text": "RGN for drive-on loading, with a well long enough for the tracks and low enough for the height. Size the axle configuration — tri-axle, 3+1 flip, jeep and booster — to both the gross weight and the per-axle limits on the route."}, {"name": "Decide what comes off", "text": "Blade off or angled for width, ripper off for length and weight, exhaust stack or ROPS only if height forces it. Weigh teardown labor on both ends against the escorts and curfews the extra dimensions would trigger."}, {"name": "Permit every state and plan the route", "text": "Oversize and overweight permits are issued state by state. File for each state on the path, confirm escort triggers and travel curfews, and verify clearances against the actual loaded height."}, {"name": "Load and secure", "text": "Drive the machine on, center it over the axle group per the trailer's load chart, and set the parking brake. Run a minimum of four chains to designated frame points, then lower the blade and ripper to the deck and chain each separately."}, {"name": "Run the route and recheck", "text": "Escorts in position, daylight windows respected, securement rechecked within the first 50 miles and at every stop after that."}]},
    body: "<p>Nobody ships \"a bulldozer.\" You ship a compact dozer under 20,000 pounds or you ship a 230,000-pound D11, and the two jobs have almost nothing in common except the tracks. The machine's operating weight and transport dimensions decide the trailer, the axle count, the permits, and how much of the machine comes off before it rolls. Get those numbers wrong and everything downstream is wrong too.</p><h2>Know your size class first</h2><p>Small dozers — the D1-to-D3 class and their Deere and Komatsu equivalents — run under roughly 20,000 pounds and, with the blade angled or pulled, can often travel inside the legal envelope: 8'6\" wide, 13'6\" tall, under 80,000 pounds gross combined. Mid-size machines in the D4–D6 range land roughly between 20,000 and 50,000 pounds, and their blades commonly measure 10 to 13 feet — overwidth the moment they leave the yard. Large dozers, D7 through D9, run from the mid-50,000s to north of 100,000 pounds and are permitted loads every single time. At the top end, a D10 or D11 is a teardown project: a D11 runs in the neighborhood of 230,000 pounds with a universal blade over 20 feet wide, so it moves as multiple loads — hull, blade, ripper, sometimes cab and canopy — with the main hull often riding as a superload.</p><h2>Why the RGN is the default answer</h2><p>For anything that moves under its own power, a removable gooseneck trailer is the go-to, and it isn't close. Detach the neck and the front of the deck drops to the ground — the dozer walks on under its own tracks. No crane, no ramps at a bad angle. Just as important is deck height: an RGN well sits around 18 to 24 inches off the pavement, which leaves roughly 11 feet of machine height under the 13'6\" ceiling. Put the same machine on a standard flatbed and you have burned five feet of that budget before the tracks touch wood. A fixed-neck lowboy gets you the same low well but loads over the rear or by crane. The full comparison is in our <a href=\"rgn-vs-lowboy-trailers.html\">RGN vs Lowboy Trailers</a> guide.</p><figure><img src=\"../assets/img/loads/load-lowboy-warehouse.jpg\" alt=\"Lowboy trailer staged at a warehouse before an oversize heavy equipment haul\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>The low well deck is what buys you headroom under the 13'6\" ceiling — and with an RGN, the machine drives on from ground level.</figcaption></figure><h2>Weight: where legal ends</h2><p>Here is the math that surprises people. The 80,000-pound federal gross limit includes the truck and the trailer. A tractor hooked to a tri-axle RGN claims roughly half of that before the dozer ever touches the deck, which leaves a legal payload somewhere in the low-to-mid 40,000s. That covers the small class and some mid-size machines — everything else is an overweight permit. Above that, weight gets managed with axles: 3+1 flip-axle setups, four-axle trailers, then jeep-and-booster configurations that stretch the wheelbase and spread the load so each axle group stays inside state limits. A D8 or D9 hull commonly rides a multi-axle RGN with a jeep up front and a booster behind. A D11 hull is engineered-move territory — bridge analysis, specified routing, the works.</p><h2>Cutting width: blade and ripper</h2><p>The blade is almost always the widest part of the machine, and width is what triggers escorts. Many states draw the pilot-car line at 12 feet, and curfews stack up from there. On a lot of mid-size dozers, pulling the blade — or angling it where the mounting allows — drops the load below a threshold and simplifies the whole move. The blade rides flat on the same deck or follows on a flatbed. Same logic on the back end: pulling the ripper shortens overall length and sheds real weight. The tradeoff is shop time on both ends, so the call comes down to which permits, escorts, and restrictions the extra dimensions would have triggered along the specific route.</p><h2>Securement: chains and attachment discipline</h2><p>Federal securement rules (49 CFR 393.130) treat tracked equipment over 10,000 pounds as its own category: a minimum of four independent tie-downs at the machine's designated securement points, with the aggregate working load limit at no less than half the cargo weight. In practice that means grade-70 or better chain run direct to frame points — never over the tracks, never around hydraulic lines. Anything that articulates gets lowered to the deck and secured separately: blade down, ripper down, each with its own chain. Brake set, and the whole system gets rechecked within the first 50 miles.</p><h2>Route and permit planning</h2><p>Oversize and overweight permits are issued state by state, and every state on the route has its own dimension thresholds, escort triggers, travel curfews, and turnaround times — routine permits in days, superload reviews with bridge engineering in weeks. Height is the silent killer: a load over 13'6\" doesn't just need a permit, it needs a verified route with every low bridge and utility line accounted for. It is the same discipline we run when <a href=\"how-to-ship-an-excavator.html\">shipping an excavator</a>, and the state-by-state detail lives in our <a href=\"oversize-load-permits-guide.html\">Oversize Load Permits Guide</a>. If your machine needs all of the above, that is <a href=\"../services/heavy-haul.html\">Heavy Haul Transport</a> — send the model, serial number, and attachments list and <a href=\"../contact.html\">get a quote</a>.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Weigh and measure the actual machine, attachments installed, before anyone picks a trailer.</li><li>RGN is the default: ground-level drive-on loading and a low well that keeps tall machines under 13'6\".</li><li>Assume anything D6-class and up is overweight — axle count and configuration are how the load stays legal per axle.</li><li>Pulling the blade and ripper is often the simplest width and weight reduction on the table.</li><li>Four chains minimum to frame points, attachments lowered and chained separately, recheck at 50 miles.</li><li>Permits are per-state — plan the entire route before the machine leaves the pad.</li></ul></div>",
    faq: [{"q": "Can a bulldozer ship on a regular flatbed?", "a": "Small dozers under roughly 20,000 pounds sometimes can — if total height clears 13'6\" on a deck that sits around five feet up, which usually points to a step deck rather than a true flatbed. Anything mid-size and up belongs on an RGN or lowboy: the low well protects the height budget and the detachable neck lets the machine walk on under its own power instead of being craned."}, {"q": "Do I have to remove the blade to ship a dozer?", "a": "Only if the numbers say so. If the machine measures 8'6\" or under with the blade installed or angled, it travels as-is. Most mid-size and larger dozers exceed that, and pulling the blade can drop the load below escort thresholds in many states. The blade then rides flat on the same trailer or follows on a second one."}, {"q": "How long does it take to permit a bulldozer move?", "a": "It depends on the states along the route and the size of the load. Routine oversize and overweight permits typically issue in a few business days. Superload-class moves — think D10 and D11 hulls — can require bridge analysis and route surveys that take weeks. Build the permit timeline into the project schedule, not around it."}],
    related: [{"h": "How to Ship an Excavator", "u": "how-to-ship-an-excavator.html"}, {"h": "RGN vs Lowboy Trailers", "u": "rgn-vs-lowboy-trailers.html"}, {"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "how-to-ship-a-forklift",
    cat: "Machinery Moving",
    hero: "loads/load-lowboy-warehouse.jpg",
    date: "2026-07-03",
    title: "How to Ship a Forklift: Trailer, Loading, and Permits by Weight Class",
    desc: "How to ship a forklift: weight classes, flatbed vs step-deck vs lowboy, drive-on loading, mast height, chain securement, and when the big ones need permits.",
    dek: "From an 8,000-lb warehouse electric to a container handler with its own permit file — trailer choice, loading method, mast handling, and chains, straight from the dispatch desk.",
    tldr: "Weigh it and measure the lowered mast first. Warehouse electrics ride flatbeds or step decks and drive on at a dock; big pneumatics and container handlers need a lowboy, four-plus chains, and oversize/overweight permits once the load breaks 8'6\" wide, 13'6\" tall, or 80,000 lbs gross.",
    keywords: "how to ship a forklift, forklift transport, forklift shipping, lowboy trailer, step deck trailer, container handler transport, machinery moving",
    howto: {"name": "How to Ship a Forklift", "steps": [{"name": "Weigh and measure the machine", "text": "Pull the service weight off the data plate and tape the lowered mast height, overall width, and length with forks on. Those numbers drive every decision that follows."}, {"name": "Pick the trailer", "text": "Flatbed for warehouse electrics that stay under roughly 8'6\" of freight height, step deck for taller masts and mid-size pneumatics, lowboy/RGN for anything heavy enough to need ground-level loading."}, {"name": "Prep the forklift", "text": "Mast tilted full back, carriage and forks down or removed, LP tank off or valve closed, battery disconnected on electrics, parking brake set, keys with the paperwork."}, {"name": "Load it", "text": "Drive it on at a dock or up ramps rated for the machine, or straight onto an RGN at ground level. Dead units get winched or craned — never improvised."}, {"name": "Chain it down", "text": "Minimum four chains on the designated frame points, binders tight, forks chained flat to the deck or shipped separately. Combined chain rating should cover at least half the machine's weight."}, {"name": "Confirm permits before the truck rolls", "text": "If the loaded dimensions break 8'6\" wide, 13'6\" tall, or 80,000 lbs gross, verify oversize/overweight permits are issued for every state on the route before pickup day."}]},
    body: "<p>\"Ship a forklift\" covers everything from a three-wheel electric around 8,000 lbs to a container handler that outweighs the truck pulling it. Two numbers decide the whole move: service weight and lowered mast height. Get both off the data plate and a tape measure before you call anyone.</p><h2>Weight class decides everything downstream</h2><p><strong>Warehouse electrics.</strong> Sit-down counterbalance units rated 3,000&ndash;6,000 lbs. Rule of thumb: a counterbalance forklift weighs roughly 1.5 to 2 times its rated capacity, and electrics run heavy for their size because the battery doubles as counterweight. Figure 8,000&ndash;12,000 lbs in a compact footprint. These are the easy ones.</p><p><strong>IC pneumatics.</strong> Yard trucks with capacities from 5,000 lbs into the teens, service weights from the mid-teens up past 30,000 lbs. Wider stance, longer wheelbase, taller mast &mdash; every dimension starts working against you.</p><p><strong>High-capacity machines and container handlers.</strong> Big pneumatics rated 30,000 lbs and up, empty-container handlers, reach stackers. This is heavy-haul freight that happens to have forks. Some exceed legal gross weight all by themselves and ship with the mast or spreader removed as a second piece.</p><h2>Trailer choice: flatbed, step deck, or lowboy</h2><p>Deck height is the whole game. Legal loaded height is 13'6\", so the trailer decides how much machine fits under it:</p><ul><li><strong>Flatbed</strong> &mdash; deck sits about five feet up, leaving roughly 8'6\" of freight height. Handles most warehouse electrics with the mast lowered. Needs a dock or rated ramps to load.</li><li><strong>Step deck</strong> &mdash; main deck around 3'6\", buying close to ten feet of height. The default for mid-size pneumatics and any mast that won't clear on a flatbed.</li><li><strong>Lowboy/RGN</strong> &mdash; well height 18&ndash;24\", detachable gooseneck so a running machine drives on at ground level. This is where the heavy pneumatics and handlers live, on as many axles as the scale math demands.</li></ul><p>Full comparison in <a href=\"flatbed-vs-step-deck-vs-rgn-trailers.html\">Flatbed vs Step Deck vs RGN</a>.</p><figure><img src=\"../assets/img/warehouse-loadout.jpg\" alt=\"Electric warehouse forklift staged at a loading dock for transport on a flatbed trailer\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Warehouse loadout: a small electric ships simple &mdash; dock load, mast down, four chains. The big pneumatics are a different conversation.</figcaption></figure><h2>Drives on, or gets picked</h2><p>Running machine on an RGN: drive it on. Running machine on a flatbed or step deck: dock-load it or use ramps rated for the weight &mdash; and watch the breakover angle, because low-clearance electrics will high-center on a steep ramp. Dead machine, or no dock and no ramps: it gets craned or lifted by a bigger forklift, off the designated lift points, with a spreader bar keeping the rigging off the overhead guard.</p><h2>Handle the mast before it handles you</h2><p>Measure the lowered mast height with the carriage all the way down &mdash; on the actual machine, not from a brochure. The mast rides tilted full back, carriage down. On big machines the mast comes off entirely and ships flat next to the chassis; container handlers usually move with the spreader pulled. Nobody eats a bridge strike over a forklift.</p><h2>Securement: chains, four points, forks flat</h2><p>Federal cargo securement rules treat wheeled machinery over 10,000 lbs as its own category: minimum four tie-downs on the machine's designated securement points, with combined working load limit of at least half the machine's weight. Chains and binders on the frame points &mdash; not straps. Forks come down flat to the deck and get chained, or come off and ship secured separately. LP tank off or valve closed, battery disconnected on electrics, parking brake set. Same discipline we run on every machine &mdash; see <a href=\"how-to-ship-industrial-machinery-on-a-flatbed.html\">How to Ship Industrial Machinery on a Flatbed</a>.</p><h2>Drivable or dead &mdash; say it up front</h2><p>A running forklift loads in fifteen minutes. A dead one changes the entire equipment order: winch trailer, tilt deck, or a crane on both ends. Tell dispatch the truth when you book. \"It ran last month\" gets you a standard step deck and a machine that won't move onto it.</p><h2>Permits for the big ones</h2><p>The legal envelope in most states: 8'6\" wide, 13'6\" loaded height, 80,000 lbs gross combined. Warehouse electrics never touch those numbers. Big pneumatics can push width past 8'6\" across the drive tires, and container handlers blow through the weight ceiling before the trailer even enters the math. Break any threshold and it's oversize/overweight permits in every state on the route, sometimes escorts on the wide ones. That's routing and paperwork we coordinate as part of <a href=\"../services/heavy-haul.html\">Heavy Haul Transport</a> &mdash; build it into the timeline, because permits don't issue at midnight.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Service weight plus lowered mast height equals trailer choice. Get both before booking.</li><li>Warehouse electric: flatbed or step deck. Big pneumatic: step deck or lowboy. Container handler: multi-axle lowboy and a permit file.</li><li>Four chains minimum on the frame points; forks flat on the deck or off the machine.</li><li>Declare dead machines up front &mdash; wrong equipment is the most common forklift-shipping failure.</li><li>Over 8'6\" wide, 13'6\" tall, or 80,000 lbs gross means permits in every state on the route.</li></ul></div><p>We coordinate forklift moves weekly, from a single warehouse electric to machines that need their own engineering review &mdash; it's core <a href=\"../services/machinery-moving.html\">Machinery Moving</a> work. <a href=\"../contact.html\">Get a Quote</a> and have a photo of the data plate ready.</p>",
    faq: [{"q": "Can a forklift ship on a regular flatbed?", "a": "Yes, if the lowered mast keeps the freight under roughly 8'6\" of height on the deck and the weight is within the trailer's rating. Most warehouse electrics qualify. You still need a dock or rated ramps to load, since a flatbed deck sits about five feet up."}, {"q": "Do the forks come off for shipping?", "a": "On small units, usually not — they drop flat to the deck and get chained as part of securement. On larger pneumatics and container handlers, forks and attachments typically come off and ship secured separately, and on the biggest machines the mast comes off too."}, {"q": "When does shipping a forklift require permits?", "a": "When the loaded dimensions exceed 8'6\" wide or 13'6\" tall, or gross combined weight passes 80,000 lbs. Warehouse electrics never get there; large pneumatics can break width across the drive tires, and container handlers routinely break weight. Permits are issued state by state along the route, and wide loads can also require escorts."}],
    related: [{"h": "Flatbed vs Step Deck vs RGN", "u": "flatbed-vs-step-deck-vs-rgn-trailers.html"}, {"h": "How to Ship Industrial Machinery on a Flatbed", "u": "how-to-ship-industrial-machinery-on-a-flatbed.html"}, {"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "how-to-ship-a-generator",
    cat: "Machinery Moving",
    hero: "loads/load-oversize-tank.jpg",
    date: "2026-07-03",
    title: "How to Ship an Industrial Generator: Trailer, Rigging, and Securement by Weight Class",
    desc: "Gensets ship upright on the base frame — flatbed, step-deck, or RGN by weight, with fuel run down, chains on the skid, and state permits for oversize units.",
    dek: "From 50 kW towables to 2 MW containerized plants: pick the trailer by weight, lift and chain the base frame, run the fuel down, and permit anything past the legal envelope.",
    tldr: "Gensets ship upright on the base frame — flatbed to about 45,000 lbs, step-deck for tall enclosures, RGN beyond that. Run the fuel tank down, lift and chain the skid (never the enclosure), and pull per-state permits once the load passes 8'6\" wide, 13'6\" tall, or 80,000 lbs gross.",
    keywords: "ship industrial generator, genset transport, generator shipping, heavy haul generator, skid-mounted genset, oversize load permits, generator rigging",
    howto: {"name": "How to Ship an Industrial Generator", "steps": [{"name": "Pull the spec plate data", "text": "Record dry weight, wet weight, length, width, and height with the enclosure on, plus base tank capacity. Measure the widest point including louvers and lift lugs — quotes and permits are only as good as these numbers."}, {"name": "Run down fuel and prep the unit", "text": "Drain or run the base tank to near empty, disconnect and tape the battery terminals, cap the vents, latch every enclosure door, and check for fluid weeps."}, {"name": "Match the trailer to weight and height", "text": "Flatbed to roughly 45,000 lbs of cargo, step-deck when enclosure height plus deck height busts 13'6\", RGN or multi-axle lowboy for heavier or taller prime-power units."}, {"name": "Lift from the base frame", "text": "Forklift through the skid's fork pockets, or crane with a spreader bar shackled into the rated base-frame lift points. Never lift by the enclosure unless it has a verified rated lifting bail."}, {"name": "Chain the skid, then block and brace", "text": "Minimum four direct chains to the skid's tie-down points with an aggregate working load limit of at least half the cargo weight, hardwood dunnage under the rails, and edge protection everywhere chain meets steel."}, {"name": "Permit and schedule oversize units", "text": "Anything over 8'6\" wide, 13'6\" tall, or 80,000 lbs gross needs a permit from every state on the route. Measure after loading and give big packages a week of lead time."}]},
    body: "<p>A genset is a diesel engine, an alternator, and a steel base frame that usually doubles as the fuel tank. That base frame is the only part built to be lifted, chained, and hauled — ship it like general freight and you pay in dented enclosures, cracked isolators, and a warranty fight.</p>\n\n<h2>Know the weight class first</h2>\n<p>Generator moves sort into three buckets, and everything — trailer, loading gear, permits — flows from the bucket:</p>\n<ul>\n<li><strong>Portable and towable units (under roughly 5,000 lbs).</strong> The 20&ndash;50 kW rental and light-tower class. Flatbed, hotshot, or even LTL with a forklift on both ends.</li>\n<li><strong>Commercial standby gensets (5,000&ndash;25,000 lbs).</strong> The 100&ndash;500 kW skid and enclosure units behind hospitals and telecom sites. Flatbed or step-deck territory.</li>\n<li><strong>Prime-power and data-center class (25,000 lbs and up).</strong> The 750 kW to 2 MW+ packages, often in 20&ndash;40 ft sound-attenuated enclosures or ISO containers. Step-decks, RGNs, and multi-axle lowboys, usually with a crane at both ends.</li>\n</ul>\n<p>Pull the spec plate before you ask for a quote: dry weight, wet weight, length-width-height with the enclosure on, and base tank capacity. \"About the size of a pickup\" gets you the wrong trailer.</p>\n\n<h2>Fuel and fluids: run it down</h2>\n<p>Diesel weighs roughly 7 lbs per gallon, so a full 1,000-gallon base tank adds about 7,000 lbs — enough to change the trailer, the axle math, and whether the load is legal at all. Most carriers want the tank near empty; some receivers require it dry with documentation.</p>\n<ul>\n<li>Run the tank down or pump it out before pickup.</li>\n<li>Coolant and oil normally stay in, but cap every vent and check for weeps.</li>\n<li>Disconnect the batteries, tape the terminals, and latch every enclosure door.</li>\n</ul>\n\n<h2>Skid vs. enclosure: the skid does the work</h2>\n<p>The base frame is structural steel, engineered for lifting and tie-down. The enclosure is thin sheet metal over acoustic foam. Every lift and every chain goes to the skid — never to panels, roof rails, or door hinges.</p>\n<p>Some enclosures carry a rated single-point lifting bail — use it only if the data plate confirms the rating. Otherwise rig the base frame with a spreader bar so slings clear the walls. Open-skid units rig easier but need tarps or a Conestoga over the control panel and alternator.</p>\n\n<h2>Trailer choice by weight and height</h2>\n<ul>\n<li><strong>Flatbed:</strong> up to roughly 45,000 lbs of cargo. Deck sits near 5 ft, so the enclosure can stand about 8'6\" before hitting the 13'6\" legal ceiling.</li>\n<li><strong>Step-deck:</strong> same weight class, but the lower deck (around 3'6\") buys roughly 10 ft of cargo height. The default for taller enclosures.</li>\n<li><strong>RGN / lowboy:</strong> for units past roughly 40,000 lbs or 10 ft tall. The well sits near 24 inches, and added axles carry gross weights past 80,000 lbs under permit.</li>\n</ul>\n<p>The legal envelope: 8'6\" wide, 13'6\" tall, about 53 ft long, 80,000 lbs gross. Radiator packages blow the width limit more often than people expect — measure the widest point, louvers and lugs included.</p>\n\n<figure><img src=\"../assets/img/loads/flatbed-load-securement-yellow-straps.jpg\" alt=\"Skid-mounted industrial equipment chained and strapped to a flatbed trailer with edge protection\" loading=\"lazy\" width=\"1131\" height=\"848\"><figcaption>Securement goes to the base frame — with edge protection anywhere webbing or chain touches painted steel.</figcaption></figure>\n\n<h2>Loading: forklift, crane, or rigging crew</h2>\n<p>Under about 10,000 lbs, a properly rated forklift handles it — forks through the skid's fork pockets, not under the tank. Up to 25,000 lbs you are into a large-capacity lift truck or a crane with a spreader bar and rated shackles in the base-frame lift points. Above that, plan on a crane at both ends, or a <a href=\"../services/machinery-moving.html\">machinery moving</a> crew with gantries and skates when the unit starts or ends inside a building. The lift crew needs lift points, center of gravity (offset toward the engine end), and spreader dimensions before the truck shows up.</p>\n\n<h2>Securement: chain the frame</h2>\n<p>Chains and binders go to the skid's designated tie-down points or lift lugs — minimum four direct tie-downs, with an aggregate working load limit of at least half the cargo weight under federal securement rules. Straps over the enclosure roof are how you buy a new enclosure. Block the rails against slide, keep hardwood dunnage under the frame, and protect every edge — full method in our <a href=\"blocking-bracing-and-dunnage-explained.html\">blocking, bracing, and dunnage guide</a>.</p>\n\n<h2>Permits for the big units</h2>\n<p>Once the loaded dimensions pass 8'6\" wide or 13'6\" tall, or gross weight passes 80,000 lbs, every state on the route issues its own oversize/overweight permit with its own routing, travel hours, and escort thresholds. Permit dimensions must match the load exactly — measure after loading, not off the brochure. That is standard <a href=\"../services/heavy-haul.html\">heavy haul</a> work, planned a week out like a <a href=\"how-to-transport-a-transformer.html\">transformer move</a>, not a day.</p>\n\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n<li>The base frame is the shipping structure. Lift it, chain it, and block it there — never on the enclosure.</li>\n<li>Run the fuel down — a full base tank can add thousands of pounds.</li>\n<li>Flatbed to roughly 45,000 lbs, step-deck for tall enclosures, RGN or lowboy with permits beyond the 8'6\" x 13'6\" x 80,000-lb envelope.</li>\n<li>Big units need a rigging plan and per-state permits before pickup day — built on spec-plate numbers, not guesses.</li>\n</ul></div>\n\n<p>Got a genset to move — 50 kW towable or containerized 2 MW plant? Send the spec plate data and both site conditions, and we build the trailer, rigging, and permit plan around it. <a href=\"../contact.html\">Get a quote</a>.</p>",
    faq: [{"q": "Do I have to drain the fuel before shipping a generator?", "a": "Run the base tank down to near empty at minimum. Diesel adds roughly 7 lbs per gallon to the shipped weight, a full tank can push the load over legal gross, and sloshing fuel works against securement. Some receivers require the tank fully drained with documentation, so confirm before pickup day."}, {"q": "Can a generator ship on its side or on end?", "a": "No. Gensets ship upright on the base frame, period. Tipping one dumps oil and coolant where they don't belong, wrecks the vibration isolators, and can starve bearings on the next start. If height is the problem, the fix is a lower deck — step-deck or RGN — not laying the machine over."}, {"q": "Does the enclosure come off for transport?", "a": "Usually no. The enclosure protects the unit in transit and most are engineered to stay on. It ships separately only when total height can't be solved with a lower trailer, and that's a factory or millwright job — not something to improvise at the dock."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "How to Transport a Transformer", "u": "how-to-transport-a-transformer.html"}, {"h": "Blocking, Bracing & Dunnage", "u": "blocking-bracing-and-dunnage-explained.html"}],
  },
  {
    slug: "how-to-transport-a-crane",
    cat: "Heavy Haul",
    hero: "rigging-crane2.jpg",
    date: "2026-07-03",
    title: "How to Transport a Crane: Teardown, Trailers, Permits, Reassembly",
    desc: "How to transport a mobile, rough-terrain, or crawler crane: disassembly, multi-trailer loads, weight distribution, oversize permits, escorts, and reassembly.",
    dek: "A crane doesn't ship in one piece. From the dispatch desk: how the teardown, the trailer math, and the permit stack actually work.",
    tldr: "Most cranes can't legally drive to the next job. Rough-terrain cranes always ride trailers, crawlers always tear down, and even roadable truck cranes shed counterweights onto separate trucks. A crane move is a rigging plan, a multi-state permit stack, and a convoy of trailers dispatched in reassembly order — and big carbody loads often land in superload territory.",
    keywords: "crane transport, crawler crane teardown, heavy haul trailers, oversize load permits, superload, counterweight hauling, crane reassembly",
    howto: {"name": "How to Transport a Crane", "steps": [{"name": "Pull the transport drawings", "text": "Get the manufacturer's transport configuration data before anything else: exact weights, dimensions, and lift points for every removable component. This document drives the rigging plan, the trailer count, and the permit math."}, {"name": "Plan the teardown", "text": "Schedule a rigging crew and assist crane to strip counterweights, boom sections, jib, and — on larger crawlers — the crawler side frames. Weigh and measure each component as it comes off; every piece becomes its own load."}, {"name": "Match every component to a trailer", "text": "Carbody on a lowboy or RGN with added axles as needed, boom sections on step decks or stretch trailers, counterweights on heavy-rated flatbeds. Run axle-group weight calculations for each combination before booking anything."}, {"name": "Permit the route", "text": "File oversize/overweight permits in every state on the route. If any load crosses a state's superload threshold, budget extra lead time for engineering reviews, bridge analysis, and route surveys."}, {"name": "Stage escorts and run the move", "text": "Line up pilot cars for over-width, a height pole for over-height, and police escorts where states require them. Dispatch trucks in reassembly order — assist equipment and crawler frames first, counterweights last."}, {"name": "Reassemble and verify", "text": "Prep the ground with mats or pads, rebuild with the assist crane per the manufacturer's sequence, hang counterweights, and complete function checks before the first lift."}]},
    body: "<p>A crane lifts things for a living. What it does not do, outside a few narrow exceptions, is drive itself to the next job legally. The moment a crane changes sites, it stops being a lifting machine and becomes a freight problem — an oversize, overweight, multi-trailer freight problem. This is how that problem gets solved from the dispatch desk.</p><h2>Know which machine you're moving</h2><p>Three crane types, three completely different moves.</p><ul><li><strong>Truck-mounted and all-terrain cranes</strong> are built for the road, but almost never road-legal in working trim. Fully dressed, axle weights blow past what states allow. Standard practice: strip the counterweights — sometimes the jib and rigging gear too — and run them behind the crane on separate trucks.</li><li><strong>Rough-terrain cranes</strong> don't get a vote. No highway gearing, no highway suspension, no legal axle spacing. Every RT crane rides a trailer, usually a lowboy or removable gooseneck (RGN).</li><li><strong>Crawler cranes</strong> are a full teardown, every time. Boom sections come off. Counterweights come off. On bigger machines the crawler side frames come off too. What's left — the carbody — is often still the heaviest single piece on the move.</li></ul><p>The legal envelope you're fighting: 8'6\" wide, 13'6\" tall, roughly 53' of trailer, 80,000 lbs gross. A crawler carbody can bust all four at once.</p><figure><img src=\"../assets/img/rigging-crane.jpg\" alt=\"Crane being rigged and broken down into components for heavy haul transport\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Teardown is rigging work before it's trucking work: every component that comes off becomes its own load plan.</figcaption></figure><h2>The teardown</h2><p>Disassembly starts with paper: the manufacturer's transport drawings list the weight, dimensions, and lift points for every removable component. Counterweight slabs come off and stack like plates. Lattice boom breaks down into sections and inserts. Hook blocks, jibs, and spreader bars ride as loose freight. Each piece gets weighed and measured, because each piece is about to become its own load with its own permit math. Guessing at component weights is how trucks get turned around at scales.</p><h2>One crane, many trailers</h2><p>Component dictates trailer:</p><ul><li><strong>Carbody:</strong> lowboy or RGN, frequently with a jeep dolly, flip axle, or stinger added to spread the weight across more axles.</li><li><strong>Boom sections:</strong> step decks and flatbeds; long lattice sections may need stretch trailers.</li><li><strong>Counterweights:</strong> short, dense, and brutal on axle groups. Heavy-rated flatbeds, blocked and chained, weight centered over the axle spread.</li></ul><p>Sequencing is where moves fall apart. The assist crane, mats, and crawler frames have to land before the carbody, and the carbody before the counterweights — because the machine that unloads those counterweights hasn't been rebuilt yet. Dispatch trucks in reassembly order, not in whatever order they finished loading.</p><h2>Weight distribution decides the permit</h2><p>Gross weight is half the fight. States permit by axle group: how much sits on each group and how far apart the groups are. That's why a carbody move grows axles — every jeep or flip axle added spreads the same load thinner across the pavement and opens up routes a shorter combination can't legally touch. Position the load wrong on the deck and the axle numbers fail even when the total is fine.</p><h2>Permits, escorts, and superload territory</h2><p>Cross any line of the legal envelope and every state on the route wants its own oversize/overweight permit, each with its own rules on travel hours, weekends, and routing. Push far enough past the thresholds — and a big crawler carbody often does — and you're into superload territory: engineering reviews, bridge analysis, route surveys, sometimes utility crews lifting lines ahead of the load. Lead times stretch from days to weeks. Full breakdown in <a href=\"what-is-a-superload.html\">What Is a Superload?</a> and the <a href=\"oversize-load-permits-guide.html\">Oversize Load Permits Guide</a>.</p><p>Escorts scale with the load. Over-width draws pilot cars. Over-height puts a height pole out front, proving every wire and bridge before the load reaches it. Some states put law enforcement on superloads and dictate the exact hour the convoy rolls.</p><h2>Reassembly is half the job</h2><p>The move isn't done when the trucks arrive; it's done when the crane passes function checks. That means ground prep and matting rated for assembly loads, an assist crane sized for the heaviest component, boom assembled on cribbing and pinned in sequence, counterweights hung, and the manufacturer's checklist walked before the first lift. The same <a href=\"../services/rigging.html\">Industrial Rigging</a> discipline that took the machine apart puts it back together — ideally the same crew, because they know where every pin went.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Rough-terrain cranes always ride trailers, crawlers always tear down, and truck or all-terrain cranes usually shed counterweights onto separate trucks.</li><li>The legal envelope is 8'6\" wide, 13'6\" tall, ~53' long, 80,000 lbs gross — a crane carbody can exceed all four at once.</li><li>States permit by axle group, not just gross weight. Added axles open routes.</li><li>Dispatch trucks in reassembly order. Counterweights are useless before the carbody is rebuilt.</li><li>Superload thresholds vary by state and add engineering reviews and weeks of lead time — start permits before you book iron.</li></ul></div><p>Moving a crane is a coordination job: one rigging plan, a stack of state permits, and a convoy of trailers that all have to arrive in the right order. That's the work we coordinate every week. Start with <a href=\"../services/heavy-haul.html\">Heavy Haul Transport</a>, or <a href=\"../contact.html\">get a quote</a> with the make, model, and configuration — we'll build the load plan straight from the transport drawings.</p>",
    faq: [{"q": "Can a mobile crane just drive itself to the job site?", "a": "Truck-mounted and all-terrain cranes are road-capable, but in full working trim they're usually over legal axle weights, so counterweights and rigging gear ride on separate trucks. Rough-terrain cranes aren't highway-legal at all and always move by trailer."}, {"q": "How many truckloads does it take to move a crawler crane?", "a": "It depends on the machine's class and configuration. A small crawler may move in a handful of loads; large machines break into many — carbody, crawler frames, boom sections, counterweights, and rigging each traveling separately. The manufacturer's transport drawings set the real number."}, {"q": "When does a crane move become a superload?", "a": "When any dimension or weight passes a state's superload threshold, which varies state to state and sits well beyond standard oversize/overweight limits. Large crawler carbodies commonly cross that line, triggering engineering reviews, route surveys, and longer permit lead times."}],
    related: [{"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "Industrial Rigging", "u": "../services/rigging.html"}, {"h": "What Is a Superload?", "u": "what-is-a-superload.html"}, {"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}],
  },
  {
    slug: "step-deck-vs-drop-deck-trailers",
    cat: "Trailers & Equipment",
    hero: "brokerage-flatbed.jpg",
    date: "2026-07-03",
    title: "Step Deck vs Drop Deck Trailers: Are They the Same Thing?",
    desc: "Step deck and drop deck are the same trailer — two names, one spec. What the lower deck buys you in legal height, what fits on it, and when you need an RGN.",
    dek: "Yes. Same trailer, two names — three if you count \"single drop.\" Here is what the drop actually buys you, and when it is not enough.",
    tldr: "Step deck, drop deck, single drop — one trailer, three names, zero difference in the equipment. The main deck sits around 3'6\" off the ground instead of a flatbed's ~5', which leaves close to 10' of legal cargo height under the 13'6\" ceiling instead of roughly 8'6\". Taller than that, or heavy equipment that has to drive on from the front, and you are into double-drop/RGN territory.",
    keywords: "step deck trailer, drop deck trailer, step deck vs drop deck, step deck vs flatbed, single drop trailer, step deck height, RGN trailer",
    body: "<p>Short answer: yes. A step deck and a drop deck are the same trailer. So is a \"single drop.\" Different regions, different carriers, different load boards — same piece of steel. If you booked a step deck and the driver shows up with what your dock foreman calls a drop deck, nobody made a mistake. The industry just never agreed on one name.</p><h2>One trailer, three names</h2><p>The trailer has two deck levels: a short upper deck that rides over the tractor's fifth wheel, then a step down to a long main deck that runs to the rear axles. That single drop is where every name comes from. \"Step deck\" describes the step. \"Drop deck\" describes the drop. \"Single drop\" distinguishes it from a double drop, which has a second step — more on that below. Spec sheets, rate confirmations, and dispatch boards use all three interchangeably, and there is no difference in the equipment, the securement, or what it can legally carry. Anyone telling you a step deck hauls something a drop deck can't is selling confusion.</p><h2>How it differs from a flatbed</h2><p>The number that matters is deck height. A standard flatbed deck sits around 5 feet — roughly 60 inches — off the ground. Under the ~13'6\" legal height ceiling, that leaves you about 8'6\" of cargo before you need permits. A step deck's main deck drops to around 3'6\" (about 42\"), so the same ceiling leaves close to 10 feet of legal cargo height. That extra foot and a half of freight is the entire reason the trailer exists.</p><p>Everything else is familiar flatbed territory: open deck, loading from the sides or above with a forklift or crane, chains and straps to the rub rail, tarps if the freight can't take weather. The rest of the legal envelope doesn't move either — 8'6\" wide, 80,000 lbs gross vehicle weight, trailers up to roughly 53' long. The drop only buys you height. If your problem is width or weight, a step deck doesn't solve it.</p><figure><img src=\"../assets/img/loads/step-deck-industrial-air-handlers.jpg\" alt=\"Industrial air handler units chained and strapped to the main deck of a step deck trailer\" loading=\"lazy\" width=\"1131\" height=\"848\"><figcaption>Industrial air handlers on a step deck main deck. Tall enough to blow the 13'6\" ceiling from a flatbed; legal once you drop the deck 18 inches.</figcaption></figure><h2>Typical step deck numbers</h2><ul><li><strong>Overall length:</strong> 48' and 53' are the standard builds.</li><li><strong>Upper deck:</strong> roughly 10–11' long, sitting at flatbed height over the kingpin.</li><li><strong>Main deck:</strong> roughly 37–43' long at about 3'6\" deck height.</li><li><strong>Deck width:</strong> 8'6\" — same as the legal width limit, so anything wider is oversize no matter what trailer it rides on.</li><li><strong>Legal cargo height:</strong> close to 10' on the main deck before you're into permit territory.</li></ul><h2>Freight that belongs on a step deck</h2><p>The step deck's lane is anything too tall for a flatbed but under about 10 feet:</p><ul><li>Air handling units, rooftop HVAC packages, and industrial fans</li><li>CNC machines, machining centers, and press equipment in the 9–10' range</li><li>Generators, compressors, and skidded electrical enclosures</li><li>Forklifts, scissor lifts, and skid steers — many step decks carry ramps or load levelers for drive-on loading of lighter equipment</li><li>Tanks, hoppers, and fabricated structures that stand tall on a short footprint</li></ul><p>If your machine measures 9'2\" on the crane hook, a flatbed puts you at over 14' of travel height and into permit paperwork, escort math, and route surveys. The same machine on a step deck rolls legal. That's the whole decision, most days.</p><h2>When a step deck isn't enough</h2><p>Two things push you past a single drop. First, height: cargo much over 10' tall needs a lower floor. A <strong>double drop</strong> adds a second step into a well between the axles, with the deck riding roughly 18–24\" off the ground. An <strong>RGN</strong> (removable gooseneck) is a double drop whose neck detaches, so tracked and wheeled machines can climb on from the front under their own power. Second, drive-on loading of genuinely heavy iron: ramps on a step deck handle a skid steer fine, but an excavator or dozer wants the detachable neck and the low well. We break that decision down in <a href=\"rgn-vs-lowboy-trailers.html\">RGN vs Lowboy Trailers</a>, and the full three-way comparison lives in <a href=\"flatbed-vs-step-deck-vs-rgn-trailers.html\">Flatbed vs Step Deck vs RGN</a>.</p><p>One more tradeoff worth knowing: the well on a double drop shortens usable deck length and complicates forklift loading from the side. If the freight is under 10' tall, the step deck is almost always the simpler, easier-to-cover choice.</p><div class=\"takeaways\"><h3>Bottom line</h3><ul><li>Step deck = drop deck = single drop. Same trailer. Any difference you've heard is terminology, not equipment.</li><li>The drop buys legal height: close to 10' of cargo on the main deck vs roughly 8'6\" on a flatbed, under the same 13'6\" ceiling.</li><li>Standard builds run 48' and 53', with a ~42\" main deck and 8'6\" of width.</li><li>Width and weight limits don't change — 8'6\" wide and 80,000 lbs gross apply either way.</li><li>Over ~10' tall, or heavy equipment that drives on from the front: double drop or RGN, not a step deck.</li></ul></div><p>Not sure which deck your load clears on? Send us the dimensions — length, width, height, weight — and the dispatch desk will match the freight to the trailer and coordinate the haul end to end. Start with our <a href=\"../services/heavy-haul.html\">Heavy Haul Transport</a> page or <a href=\"../contact.html\">get a quote</a>.</p>",
    faq: [{"q": "Is a step deck the same as a drop deck trailer?", "a": "Yes. Step deck, drop deck, and single drop are three names for the identical trailer: a short upper deck over the fifth wheel and a lower main deck behind it. There is no difference in equipment, capacity, or securement — only in what different carriers and regions call it."}, {"q": "How tall can a load be on a step deck?", "a": "With the main deck sitting around 3'6\" off the ground, you can carry cargo close to 10' tall and stay under the ~13'6\" legal height ceiling. The same freight on a flatbed, with its ~5' deck, would be over height and into permit territory at anything past roughly 8'6\"."}, {"q": "Can equipment be driven onto a step deck?", "a": "Often, yes. Many step decks carry ramps or load levelers that handle forklifts, scissor lifts, and skid steers. For heavy tracked or wheeled machines like excavators and dozers, a removable gooseneck (RGN) is the right tool — the neck detaches so the machine climbs on from the front at a much shallower angle."}],
    related: [{"h": "Flatbed vs Step Deck vs RGN", "u": "flatbed-vs-step-deck-vs-rgn-trailers.html"}, {"h": "RGN vs Lowboy Trailers", "u": "rgn-vs-lowboy-trailers.html"}, {"h": "Enclosed vs Flatbed Transport", "u": "enclosed-vs-flatbed-transport.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "what-is-considered-an-oversize-load",
    cat: "Permits & Compliance",
    hero: "heavyhaul-real.jpg",
    date: "2026-07-03",
    title: "What Is Considered an Oversize Load? Width, Height, Length & Weight Limits",
    desc: "A load is oversize once it exceeds 8'6\" wide, 13'6\"–14' tall, or legal trailer length — and overweight past 80,000 lbs gross. Every threshold, explained.",
    dek: "Where legal freight ends and permitted freight begins: the exact width, height, length, and weight thresholds — and what happens the moment you cross one.",
    tldr: "A load is oversize when it exceeds 8'6\" in width, 13'6\" in height (14' in most western states), or legal trailer length — and overweight when it exceeds 80,000 lbs gross or federal axle limits. Anything past those numbers needs a permit from every state it crosses.",
    keywords: "oversize load, oversize load dimensions, legal truck load limits, overweight load, wide load vs oversize load, federal bridge formula, superload",
    body: "<p><strong>A load is oversize the moment it exceeds any one of these limits: 8 feet 6 inches (8'6\") wide, 13'6\" tall in most states (14' across most of the West), or the legal trailer length on its route. It is overweight above 80,000 pounds gross — or sooner, if too much of that weight sits on one axle group.</strong> Cross one line and you need a state permit. Cross several and you're into escorts, route surveys, and travel-time restrictions. Here is where every threshold sits.</p>\n<h2>Width: 8'6\" Is the Line in All 50 States</h2>\n<p>Width is the most common trigger and the most uniform. Federal rule caps legal width at 8'6\" (102 inches) on the Interstate and National Network, and every state runs the same number. At 8'7\" you are oversize — no rounding, no grace inch. Machinery is the usual offender: mid-size excavators, dozers with the blade on, and prefab skids routinely land between 9 and 12 feet. Basic single-trip permits usually cover that range; go wider and <a href=\"pilot-car-escort-requirements.html\">pilot car requirements</a> enter the picture — many states start requiring escorts somewhere between 10 and 12 feet, depending on the road.</p>\n<h2>Height: 13'6\" East, 14' West</h2>\n<p>There is no federal height limit — height is state law. The working rules from the dispatch desk:</p>\n<ul>\n<li><strong>13'6\"</strong> is the legal maximum in most eastern states.</li>\n<li><strong>14'</strong> is legal across most western states, including Texas and California, where the interstates were built with more clearance.</li>\n<li><strong>Loaded height is what counts:</strong> deck plus cargo. A 10-foot-tall machine on a standard flatbed (roughly a 5-foot deck) is over height everywhere. The same machine on a double-drop lowboy can ride legal.</li>\n</ul>\n<p>Height is also the limit that punishes mistakes hardest, because the failure mode isn't a fine — it's a bridge strike. That's why over-height moves get route surveys.</p>\n<h2>Length: The Messiest of the Four</h2>\n<p>Federal law guarantees a 48-foot semitrailer on the National Network, and 53-foot trailers are the de facto national standard. Length becomes an oversize problem three ways: the trailer exceeds the state's legal trailer length, the load overhangs the rear past the state's allowance (federal rule requires flagging rear overhang beyond 4 feet), or the total combination exceeds the state's overall-length cap. Structural steel, bridge beams, crane booms, and wind components are the usual overlength freight.</p>\n<h2>Weight: 80,000 Pounds Gross — But the Axles Decide</h2>\n<p>The federal Interstate limit is 80,000 pounds gross — tractor, trailer, and cargo combined. Gross is only half the test. Federal law also caps:</p>\n<ul>\n<li><strong>Single axles at 20,000 pounds</strong></li>\n<li><strong>Tandem axles at 34,000 pounds</strong></li>\n<li><strong>Axle groups under the Federal Bridge Formula</strong>, which ties allowable weight to the number and spacing of axles</li>\n</ul>\n<p>That's why a load can scale under 80,000 and still be illegal on one axle group, and why <a href=\"../services/heavy-haul.html\">heavy haul trailers</a> add axles instead of deck. A standard tractor and flatbed leaves roughly 45,000–48,000 pounds of legal payload; heavier freight means overweight permits, more axles, or both.</p>\n<figure><img src=\"../assets/img/loads/flatbed-industrial-dust-collectors-strapped.jpg\" alt=\"Two industrial dust collectors strapped and chained down on a flatbed trailer\" loading=\"lazy\" width=\"1131\" height=\"848\"><figcaption>Inches decide the paperwork: the same flatbed setup can be a legal load or a permitted oversize move depending on final width and loaded height.</figcaption></figure>\n<h2>Oversize vs. Overweight vs. Superload</h2>\n<p>Three terms that get mixed up on quote requests every week:</p>\n<ul>\n<li><strong>Oversize</strong> — exceeds a dimensional limit: width, height, or length. Weight can be fully legal.</li>\n<li><strong>Overweight</strong> — exceeds gross, axle, or bridge-formula weight limits. Dimensions can be fully legal; a transformer or steel coil can be overweight inside a standard trailer footprint.</li>\n<li><strong>Superload</strong> — exceeds what a state will issue on a routine oversize/overweight permit. Each state draws its own line, and crossing it means engineering review, bridge analysis, and an individually approved route instead of an automated permit. Planning starts weeks out, not days. Full breakdown in <a href=\"what-is-a-superload.html\">What Is a Superload?</a></li>\n</ul>\n<p>One move can be all three at once — wide, tall, and heavy is a normal Tuesday in this business.</p>\n<h2>\"Wide Load\" vs. \"Oversize Load\" Banners</h2>\n<p>Functionally the same warning; legally, the wording matters. Most states specify the banner read <strong>OVERSIZE LOAD</strong> — black letters on yellow, typically 7 feet long by 18 inches tall with 10-inch lettering, mounted front and rear. \"WIDE LOAD\" is the older wording, still accepted in some states, but OVERSIZE LOAD is the safe standard nationwide. Overwidth and overhanging loads also carry red or fluorescent orange flags, roughly 18 inches square, at the extreme corners. Banners and flags don't replace the permit — they're a condition of it.</p>\n<h2>Every State Draws Its Own Lines</h2>\n<p>The federal numbers set the floor; the states set everything else. Permits are issued state by state, each with its own travel hours (daylight-only is common), weekend and holiday embargoes, escort thresholds, and county or city roads the state permit doesn't cover. A 14-foot-tall load that's legal in Texas becomes a permitted move the moment it crosses into Louisiana at 13'6\". A multi-state route means multiple permits with conflicting conditions — the coordination work covered in our <a href=\"oversize-load-permits-guide.html\">oversize load permits guide</a>, and the work we handle before a truck is ever assigned. Have dimensions and weights in hand? <a href=\"../contact.html\">Send them over</a> and we'll tell you exactly what your load triggers.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n<li>Oversize starts at anything over 8'6\" wide, over 13'6\"–14' tall (state-dependent), or beyond legal trailer length.</li>\n<li>Overweight starts above 80,000 lbs gross — or above 20,000 lbs on a single axle, 34,000 lbs on a tandem, or the Federal Bridge Formula limit, whichever hits first.</li>\n<li>Superloads exceed routine permit limits and require state-specific engineering review and individually approved routes.</li>\n<li>Limits and permits are per-state: one route, multiple permits, multiple sets of rules.</li>\n</ul></div>",
    faq: [{"q": "Is a 9-foot-wide load considered oversize?", "a": "Yes. Anything over 8'6\" (102 inches) wide is oversize in all 50 states. At 9 feet wide, most states issue a routine single-trip permit without escorts, but thresholds vary — some states require a pilot car at narrower widths on two-lane roads."}, {"q": "What weight is considered overweight for a semi truck?", "a": "Anything over 80,000 pounds gross on the Interstate, over 20,000 pounds on a single axle, over 34,000 pounds on a tandem, or over the Federal Bridge Formula limit for the axle spacing — whichever is exceeded first."}, {"q": "What is the difference between a wide load and an oversize load?", "a": "They describe the same category of freight. \"Oversize load\" is the current regulatory term covering excess width, height, or length, and it's the banner wording most states require. \"Wide load\" is older wording that technically refers only to overwidth freight."}],
    related: [{"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "What Is a Superload?", "u": "what-is-a-superload.html"}, {"h": "Pilot Car & Escort Requirements", "u": "pilot-car-escort-requirements.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "california-oversize-load-permits",
    cat: "Permits & Compliance",
    hero: "heavyhaul-real.jpg",
    date: "2026-07-03",
    title: "California Oversize & Overweight Load Permits: A Shipper's Guide",
    desc: "How California oversize/overweight permits work — Caltrans single-trip permits, legal limits, STAA vs non-STAA routes, pilot cars, curfews, and superloads.",
    dek: "California's route rules are their own puzzle. Here's how Caltrans permitting really works — from the dispatch desk.",
    tldr: "California issues oversize/overweight permits through Caltrans. A load is permitted once it exceeds 8'6\" wide, 14' tall, or 80,000 lbs gross. The wrinkle is routing: California restricts oversized trucks to designated networks (STAA vs non-STAA / Terminal Access routes), so the permit is as much about the legal path as the dimensions.",
    keywords: "california oversize load permit, caltrans permit, california overweight permit, STAA route, california heavy haul, california superload",
    body: "<p>California is one of the more complex states to move oversized freight through — not because the limits are unusual, but because the state is strict about <em>which roads</em> big trucks may use. Here's how Caltrans permitting works and where shippers get tripped up.</p>\n<h2>What needs a permit</h2>\n<p>A load is legal in California up to <strong>8'6\" wide, 14' tall, and 80,000 lbs gross</strong>, with length limits that depend on the trailer and the route. Cross any of those and you need a Caltrans transportation permit for the state highways, plus separate permits from any city or county whose roads you touch.</p>\n<figure><img src=\"../assets/img/loads/flatbed-industrial-dust-collectors-strapped.jpg\" alt=\"Oversized industrial equipment strapped to a flatbed on a permitted California route\" loading=\"lazy\" width=\"1131\" height=\"848\"><figcaption>In California the permitted <em>route</em> matters as much as the dimensions — oversized trucks are held to designated networks.</figcaption></figure>\n<h2>The routing catch: STAA vs. non-STAA</h2>\n<p>This is the part that surprises out-of-state shippers. California classifies its truck routes into networks — the federal <strong>STAA</strong> network (interstates and designated highways that take the biggest legal trucks) and shorter <strong>California Legal / Terminal Access</strong> routes. Oversized and long combinations can't just take the shortest line; the permit specifies a legal path that keeps the load on roads engineered for it, around tight interchanges, low structures, and weight-restricted bridges. A route that looks fine on a map can be non-viable for a long or heavy rig.</p>\n<h2>How permits issue</h2>\n<p>Caltrans issues <strong>single-trip permits</strong> for one load on one route and <strong>annual permits</strong> for carriers running repeat oversized freight within set limits. As with every state, the permit locks to your exact dimensions and weight. Overweight loads also have to satisfy California's axle and bridge limits, which is why heavy loads add axles rather than deck.</p>\n<h2>Escorts and curfews</h2>\n<p>Pilot cars are required as the load gets wider — commonly front and/or rear escorts past certain widths, with a lead car for over-height loads. Travel is generally <strong>daylight-only</strong> for oversized loads, with curfews through the Los Angeles, San Francisco Bay Area, and San Diego metros during peak hours. Wind and weather can hold tall loads on the mountain passes.</p>\n<h2>Superloads and corridors</h2>\n<p>Extreme loads route as <a href=\"what-is-a-superload.html\">superloads</a> with engineered review and bridge analysis. Most California oversized freight runs the <strong>I-5, I-10, I-15, I-80, and Highway 99</strong> corridors linking the ports, the Central Valley, and the interstate network out of state.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>California legal limits: 8'6\" wide, 14' tall, 80,000 lbs gross — permits start past any of them.</li>\n  <li>Caltrans issues the state permit; cities and counties permit their own roads.</li>\n  <li>Routing is the hard part — oversized trucks are held to STAA / designated networks.</li>\n  <li>Pilot cars scale with width; daylight-only with metro curfews; superloads get engineered routing.</li>\n</ul></div>\n<p>We handle Caltrans permitting, route selection, and escorts as part of every California move — see <a href=\"../services/heavy-haul.html\">heavy haul transport</a> or <a href=\"../contact.html\">send your load and route</a> for a quote.</p>",
    faq: [{"q": "Who issues oversize load permits in California?", "a": "Caltrans (the California Department of Transportation) issues permits for state highways. Loads that travel on city or county roads also need permits from those local jurisdictions, so a full route can involve more than one permit."}, {"q": "What is an STAA route in California?", "a": "STAA routes are the federally designated highways that accommodate the largest legal trucks. California restricts long and oversized combinations to STAA and other designated networks, so a permitted route is chosen to keep the load on roads built for it — not simply the shortest path."}, {"q": "How tall can a load be in California?", "a": "California's legal height limit is 14 feet. Above that, the load needs an oversize permit and a height-pole escort to verify overpass and utility clearances along the route."}],
    related: [{"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "What Is Considered an Oversize Load?", "u": "what-is-considered-an-oversize-load.html"}, {"h": "Texas Oversize & Overweight Permits", "u": "texas-oversize-load-permits.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "florida-oversize-load-permits",
    cat: "Permits & Compliance",
    hero: "heavyhaul-hero.jpg",
    date: "2026-07-03",
    title: "Florida Oversize & Overweight Load Permits: A Shipper's Guide",
    desc: "How Florida oversize/overweight permits work — FDOT single-trip permits, legal limits, escort rules, daylight and holiday curfews, and hurricane-season routing.",
    dek: "Moving big freight through Florida? Here's how FDOT permitting works — from the dispatch desk.",
    tldr: "Florida issues oversize/overweight permits through FDOT. A load is permitted once it exceeds 8'6\" wide, 13'6\" tall, or 80,000 lbs gross. Single-trip permits cover most moves; escorts scale with width, travel is daylight-only with holiday curfews, and hurricane season adds routing and evacuation-window considerations.",
    keywords: "florida oversize load permit, fdot permit, florida overweight permit, florida heavy haul, florida superload, hurricane season trucking",
    body: "<p>Florida runs a heavy flow of oversized freight — construction equipment, modular structures, boats, and port cargo moving up the peninsula. Here's how the state permits it and the seasonal wrinkle that catches out-of-state shippers.</p>\n<h2>What needs a permit</h2>\n<p>A load is legal in Florida up to <strong>8'6\" wide, 13'6\" tall, and 80,000 lbs gross</strong>, with length governed by trailer and route. Note Florida holds the eastern 13'6\" height limit — a foot lower than Texas or California — so a load that ran legal-height out west can need a permit the moment it enters Florida. Cross any limit and you need an FDOT permit for state roads, plus local permits for city and county roads.</p>\n<figure><img src=\"../assets/img/loads/heavy-haul-industrial-enclosures-flatbed.jpg\" alt=\"Oversized industrial equipment on a flatbed on a permitted Florida route\" loading=\"lazy\" width=\"1131\" height=\"848\"><figcaption>Florida holds a 13'6\" legal height — lower than the western states — so height often triggers the permit.</figcaption></figure>\n<h2>How permits issue</h2>\n<p>Florida oversize/overweight permits run through the <strong>FDOT Permit Office</strong> and its online permitting system. <strong>Single-trip permits</strong> cover one load on one route; <strong>blanket/annual permits</strong> serve carriers running repeat oversized freight within set limits. The permit ties to your exact dimensions and weight, and overweight loads must satisfy Florida's axle and bridge-formula limits.</p>\n<h2>Escorts and curfews</h2>\n<p>Escort vehicles scale with width — front and/or rear pilot cars past certain widths, with a lead height-pole car for over-height loads and police escorts for the largest. Oversized travel is generally <strong>daylight-only</strong>, with curfews through the Miami, Orlando, Tampa, and Jacksonville metros during peak hours and restrictions around major holidays.</p>\n<h2>The seasonal catch: hurricane season</h2>\n<p>Florida's Atlantic hurricane season (roughly June through November) is a real planning factor for oversized freight. Storms can close routes, and during declared emergencies the state prioritizes evacuation traffic — oversized moves get held. If your move window lands in season, build in schedule cushion and confirm the route isn't under a weather hold before dispatch.</p>\n<h2>Superloads and corridors</h2>\n<p>Extreme loads route as <a href=\"what-is-a-superload.html\">superloads</a> with engineered review. Most Florida oversized freight runs the <strong>I-4, I-10, I-75, and I-95</strong> corridors and the Turnpike connecting the ports, the metros, and the routes out of state.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Florida legal limits: 8'6\" wide, 13'6\" tall, 80,000 lbs gross — height is often the trigger.</li>\n  <li>FDOT issues the state permit; cities and counties permit their own roads.</li>\n  <li>Escorts scale with width; daylight-only with metro and holiday curfews.</li>\n  <li>Hurricane season can close routes and hold oversized moves — plan schedule cushion.</li>\n</ul></div>\n<p>We handle FDOT permitting, routing, escorts, and weather-window planning as part of every Florida move — see <a href=\"../services/heavy-haul.html\">heavy haul transport</a> or <a href=\"../contact.html\">send your load and route</a> for a quote.</p>",
    faq: [{"q": "Who issues oversize permits in Florida?", "a": "The Florida Department of Transportation (FDOT) issues permits for state roads through its online permitting system. Loads traveling on city or county roads also need permits from those local jurisdictions."}, {"q": "How tall can a load be in Florida without a permit?", "a": "Florida's legal height limit is 13 feet 6 inches — lower than the 14 feet allowed in Texas and California. A load at 14 feet is legal out west but needs an oversize permit and height-pole escort once it enters Florida."}, {"q": "Does hurricane season affect oversize load moves in Florida?", "a": "It can. During Florida's June-to-November hurricane season, storms close routes and declared emergencies prioritize evacuation traffic, which holds oversized moves. Build in schedule cushion and confirm the route isn't under a weather hold before dispatching an in-season move."}],
    related: [{"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "What Is Considered an Oversize Load?", "u": "what-is-considered-an-oversize-load.html"}, {"h": "Texas Oversize & Overweight Permits", "u": "texas-oversize-load-permits.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "freight-broker-vs-forwarder-vs-3pl",
    cat: "Freight & Trucking",
    hero: "brokerage-hero.jpg",
    date: "2026-07-03",
    title: "Freight Broker vs Freight Forwarder vs 3PL: What's the Difference?",
    desc: "Freight broker vs forwarder vs 3PL, in plain English: who arranges your freight, who takes possession of it, who runs your whole supply chain — and which you need.",
    dek: "Three roles that get used interchangeably and shouldn't be. Here's who does what — from the dispatch desk.",
    tldr: "A freight broker arranges transport by matching your load to a carrier — they never touch the freight. A freight forwarder takes possession of the goods, consolidates and re-ships them (the usual choice for international/ocean/air). A 3PL is broader: they run outsourced logistics — warehousing, fulfillment, and transport — as an ongoing partner. Broker for a load, forwarder to cross a border, 3PL to run your supply chain.",
    keywords: "freight broker vs freight forwarder, freight broker vs 3pl, 3pl vs freight broker, what is a freight forwarder, freight brokerage, logistics",
    body: "<p>\"Freight broker,\" \"freight forwarder,\" and \"3PL\" get thrown around like synonyms on quote requests every week. They're not. The difference comes down to one question: <strong>who takes possession of your freight, and how much of your logistics do they run?</strong></p>\n<h2>Freight broker: the matchmaker</h2>\n<p>A freight broker <strong>arranges the transport but never takes possession of the goods</strong>. They connect you (the shipper) with a carrier that has the right equipment, insurance, and lane — and handle the booking, the paperwork, the rate, and the coordination as a single point of contact. On specialized freight — heavy haul, oversize, sensitive equipment — a good broker earns their keep by knowing which carriers can actually run your load and handling the permits and escorts. The freight goes straight from your dock onto the carrier's truck; the broker orchestrates it.</p>\n<figure><img src=\"../assets/img/brokerage-dryvan.jpg\" alt=\"Freight trailers at a distribution yard illustrating brokered transport\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>A broker matches your load to the right carrier and coordinates the move — without ever taking possession of the freight.</figcaption></figure>\n<h2>Freight forwarder: takes possession</h2>\n<p>A freight forwarder <strong>takes possession of your goods</strong> and manages their movement — often consolidating multiple shipments, handling documentation, customs, and re-shipping. Forwarders are the standard for <strong>international freight</strong>: ocean and air, customs clearance, container consolidation, and the hand-offs between modes and borders. The key legal difference from a broker is that the forwarder handles the cargo itself rather than just arranging a carrier to.</p>\n<h2>3PL: runs your logistics</h2>\n<p>A third-party logistics provider (3PL) is the broadest of the three. A 3PL <strong>runs outsourced logistics as an ongoing partner</strong> — which can include warehousing, inventory, order fulfillment, and transportation management, not just a single move. Where a broker solves one load and a forwarder moves goods across a border, a 3PL is who a company hands its whole supply-chain operation to. Many 3PLs include brokerage and forwarding among their services.</p>\n<h2>Which one do you need?</h2>\n<ul>\n  <li><strong>Broker</strong> — you have freight to move (especially specialized, heavy, or oversized) and want someone to find the right carrier and run the move.</li>\n  <li><strong>Forwarder</strong> — your freight is crossing borders, going ocean or air, or needs consolidation and customs handling.</li>\n  <li><strong>3PL</strong> — you want to outsource ongoing logistics: warehousing, fulfillment, and transportation as a managed operation.</li>\n</ul>\n<p>Badass Logistics operates on the brokerage side — coordinating carriers, permits, and equipment for <a href=\"../services/heavy-haul.html\">heavy haul</a>, <a href=\"../services/machinery-moving.html\">machinery</a>, and <a href=\"../services/freight-moving.html\">freight</a> moves, and running <a href=\"../services/dispatching.html\">dispatch</a> in-house. Related reading: <a href=\"truck-dispatcher-vs-freight-broker.html\">dispatcher vs. freight broker</a>.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Broker: arranges transport, never touches the freight. Best for moving a load.</li>\n  <li>Forwarder: takes possession, consolidates, clears customs. Best for international.</li>\n  <li>3PL: runs outsourced logistics end to end — warehousing, fulfillment, transport.</li>\n  <li>The dividing line is possession of the goods and scope of what they manage.</li>\n</ul></div>\n<p>Need freight moved or an oversized load coordinated? <a href=\"../contact.html\">Send us the details</a> for a fast quote.</p>",
    faq: [{"q": "What is the difference between a freight broker and a freight forwarder?", "a": "A freight broker arranges transport by matching your load to a carrier but never takes possession of the goods. A freight forwarder takes possession of the freight, often consolidates it, handles documentation and customs, and re-ships it — which is why forwarders are the standard for international ocean and air freight."}, {"q": "Is a 3PL the same as a freight broker?", "a": "No. A freight broker arranges individual moves. A 3PL (third-party logistics provider) runs outsourced logistics as an ongoing partner — which can include warehousing, inventory, fulfillment, and transportation management. Many 3PLs offer brokerage as one of their services, but a broker is not a full 3PL."}, {"q": "Which do I need to move a piece of heavy equipment?", "a": "A freight broker — specifically one that handles heavy haul. For a domestic oversized or heavy load, a broker finds the carrier with the right trailer and insurance, and handles the permits, routing, and escorts. A forwarder is for international/multi-modal freight, and a 3PL is for outsourcing ongoing logistics operations."}],
    related: [{"h": "Truck Dispatcher vs Freight Broker", "u": "truck-dispatcher-vs-freight-broker.html"}, {"h": "LTL vs FTL Freight", "u": "ltl-vs-ftl-freight.html"}, {"h": "Get a Quote", "u": "../contact.html"}],
  },
  {
    slug: "how-to-move-a-boiler-or-chiller",
    cat: "Machinery Moving",
    hero: "loads/load-oversize-tank.jpg",
    date: "2026-07-03",
    title: "How to Move an Industrial Boiler or Chiller",
    desc: "How to move an industrial boiler or chiller: weight and rigging, roof and mechanical-room access, trailer choice, upright handling, and reconnection.",
    dek: "Big, heavy, and usually boxed into a mechanical room. Here's how boilers and chillers actually get moved.",
    tldr: "Boilers and chillers are heavy, awkward, and often installed in tight mechanical rooms or on roofs — so the rigging (getting it out) is the hard part, not the haul. Drain and disconnect, rig it out on skates or by crane, keep it upright, move it on a flatbed or step deck by weight and height, and set it for reconnection.",
    keywords: "how to move a boiler, how to move a chiller, industrial chiller transport, boiler rigging, mechanical room equipment moving, HVAC equipment transport",
    howto: {"name": "How to Move a Boiler or Chiller", "steps": [{"name": "Get weight, dimensions, and access", "text": "Pull the operating and dry weights and measure the unit, then measure the path out — doorways, corridors, roof access, and the crane picking point. Access usually decides the whole plan."}, {"name": "Drain, disconnect, and prep", "text": "Have the trades drain water and refrigerant per code, disconnect electrical, gas, and piping, and cap lines. Chillers hold refrigerant that must be recovered by a licensed tech before the unit moves."}, {"name": "Rig it out", "text": "Skate or gantry the unit through the mechanical room, or crane it off the roof. Rig from the frame or designated lift points, keep it level, and protect coils, tubes, and controls."}, {"name": "Load by weight and height", "text": "Flatbed or step deck for most units; a step deck buys height for a tall chiller. Keep the unit upright, block and brace the base, and chain to the frame, not the shell or coils."}, {"name": "Set and reconnect", "text": "Rig into the new mechanical room or roof pad, set level on its supports, and hand off to the trades for piping, electrical, refrigerant charge, and startup."}]},
    body: "<p>Boilers and chillers are classic rigging problems: heavy machines installed in the worst possible place to get something out of — a basement mechanical room, a penthouse, or a rooftop behind a screen wall. The truck is the easy part. Getting the unit out and the new one in is the job.</p>\n<h2>Access decides the plan</h2>\n<p>Before weight or trailer, the first question is <strong>how does it get out</strong>. A rooftop chiller usually comes off by crane — which means a lift plan, a pick point, and street or lot access for the crane. A basement boiler comes out on <strong>skates through corridors and up a ramp or freight elevator</strong>, or through a knocked-out wall panel. Measure the path to the inch: doorways, turns, ceiling height, floor ratings. Many of these units were set before the walls closed in, so the exit is tighter than the entrance ever was.</p>\n<figure><img src=\"../assets/img/loads/crating-shrink-wrap-electrical-equipment.jpg\" alt=\"Industrial mechanical equipment wrapped and prepped for a rigging move out of a plant room\" loading=\"lazy\" width=\"600\" height=\"800\"><figcaption>Coils, tubes, and controls get protected — the shell and fins carry nothing during the rig-out.</figcaption></figure>\n<h2>Drain, disconnect, recover</h2>\n<p>Before anything moves, the trades drain the water side, disconnect electrical, gas, and piping, and cap the lines. <strong>Chillers hold refrigerant</strong> that has to be recovered by a licensed technician before the unit travels — that's a code and environmental requirement, not an option. Getting these disconnects sequenced with the rigging crew keeps the move from stalling.</p>\n<h2>Rigging and transport</h2>\n<p>The unit gets rigged from its <strong>frame or designated lift points</strong>, kept level, and moved on air skates or by crane. Coils, fin tubes, gauges, and control panels are fragile — they get protected and never carry load. On the truck, most boilers and chillers ride a <strong>flatbed or step deck</strong> chosen by weight and height (a tall chiller wants the step deck's lower deck), <strong>upright</strong>, blocked and braced at the base, chained to the frame. This is the same <a href=\"../services/rigging.html\">rigging</a> and <a href=\"../services/machinery-moving.html\">machinery moving</a> discipline as any heavy plant equipment.</p>\n<h2>Set and reconnect</h2>\n<p>At the destination the unit is rigged into the mechanical room or onto the roof pad, set level on its supports, and handed back to the trades for piping, electrical, refrigerant charge, and startup. Level matters — a chiller or boiler that isn't sitting right on its supports can strain connections and mounts.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Access — roof crane or skate-out through the building — decides the whole plan.</li>\n  <li>Drain, disconnect, and recover refrigerant (licensed) before the unit moves.</li>\n  <li>Rig from the frame or lift points; protect coils, tubes, and controls.</li>\n  <li>Move upright on a flatbed or step deck by weight and height; set level for reconnection.</li>\n</ul></div>\n<p>Moving a boiler, chiller, or a whole mechanical room? <a href=\"../contact.html\">Send the unit specs and both site layouts</a> and we'll plan the rig-out, haul, and set.</p>",
    faq: [{"q": "How do you get a rooftop chiller down?", "a": "Usually by crane. That means a lift plan with a rated crane, a clear pick point, and street or lot access for the crane to set up. The chiller is rigged from its frame or lift points, kept level, and lowered to a trailer staged below. Basement units come out on skates instead."}, {"q": "Does the refrigerant have to be removed before moving a chiller?", "a": "Yes. Refrigerant must be recovered by a licensed technician before the unit is transported — it's a code and environmental requirement. This is sequenced with the disconnect and rigging work so the move doesn't stall waiting on it."}, {"q": "What trailer moves an industrial boiler or chiller?", "a": "Most ride a flatbed or step deck chosen by weight and height — a step deck's lower deck buys clearance for a tall chiller. The unit travels upright, blocked and braced at the base, and chained to the frame, never to the shell or coils."}],
    related: [{"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "Industrial Rigging", "u": "../services/rigging.html"}, {"h": "How to Ship a Generator", "u": "how-to-ship-a-generator.html"}, {"h": "Blocking, Bracing & Dunnage", "u": "blocking-bracing-and-dunnage-explained.html"}],
  },
  {
    slug: "how-to-move-a-milling-machine",
    cat: "Machinery Moving",
    hero: "loads/load-machine-loadout.jpg",
    date: "2026-07-03",
    title: "How to Move a Milling Machine (Bridgeport & Knee Mills)",
    desc: "How to move a milling machine: weight and top-heavy geometry, rigging points, ram and table prep, skating, air-ride transport, and re-leveling to spec.",
    dek: "Top-heavy and precise — a mill move is won at the rigging points and finished with a level. From the dispatch desk.",
    tldr: "Knee mills like a Bridgeport run 2,000–2,500 lbs and are top-heavy, so tipping is the risk. Lower the knee and retract the table, pull the vise and tooling, lift only from the ram or factory points, skate on a low centered load, ship precision mills air-ride, and re-level the base to spec before cutting.",
    keywords: "how to move a milling machine, bridgeport mill moving, knee mill transport, mill rigging, machinery moving, machine leveling",
    howto: {"name": "How to Move a Milling Machine", "steps": [{"name": "Document and weigh", "text": "Pull the weight and dimensions and find the factory lift points. A standard knee mill runs 2,000–2,500 lbs; larger bed and CNC mills run much heavier. Note that the head and ram put the weight up high."}, {"name": "Lower the knee and secure the table", "text": "Run the knee all the way down, retract the ram in, center and lock the table, and strap the head so nothing can shift. Remove the vise, chuck, tooling, and the DRO or pendant."}, {"name": "Rig from the ram or base", "text": "Sling under the ram with a spreader and softeners, or use the factory lifting points — never the table, ways, or dials. Keep the pick centered on the top-heavy geometry."}, {"name": "Skate it low and slow", "text": "Toe-jack and set skates under the base with the load centered, keep it low, plate over floor joints, and never side-load the machine to steer it. Top-heavy machines tip, they don't slide."}, {"name": "Ship air-ride and re-level", "text": "Precision and CNC mills ride air-ride, chained to the base and wrapped against weather. At the destination, level the base with a machinist level and requalify with a test cut before production."}]},
    body: "<p>A milling machine — a Bridgeport-style knee mill or a bigger bed or CNC mill — is a precision casting with a heavy head bolted up high. That geometry makes it top-heavy, and top-heavy machines tip when a move goes wrong. Here's how our crews keep them upright and cutting true.</p>\n<h2>Weight up high is the whole problem</h2>\n<p>A standard knee mill runs <strong>2,000 to 2,500 pounds</strong>; larger bed mills and CNC machining centers run far heavier. On any of them, the <strong>head, ram, and motor sit near the top</strong>, so the center of gravity is high and the machine wants to tip long before it wants to slide. Every lift, skate, and tie-down decision starts from that.</p>\n<figure><img src=\"../assets/img/loads/crating-shrink-wrap-electrical-equipment.jpg\" alt=\"Precision machine tool wrapped and prepped for a rigging move\" loading=\"lazy\" width=\"600\" height=\"800\"><figcaption>Vise, tooling, DRO, and pendant come off and ship separately — the ways and dials carry nothing.</figcaption></figure>\n<h2>Prep before it moves</h2>\n<p>Bring the weight down and lock everything: <strong>run the knee all the way down</strong>, retract the ram, center and lock the table, and strap the head so it can't shift on the road. Remove the vise, chuck, tooling, DRO, and pendant — they hang weight in the wrong places and shear off in transit. Coat the ways with way oil and wrap them.</p>\n<h2>Rig from the ram, never the ways</h2>\n<p>The safe pick is a <strong>sling under the ram</strong> with a spreader bar and softeners, or the machine's factory lifting points if it has them. Nothing bears on the table, the ways, the leadscrews, or the handwheels — those are the parts that make the machine worth moving. Keep the lift centered on the top-heavy geometry so it doesn't want to swing.</p>\n<h2>Skate, ship, and re-level</h2>\n<p>Inside the building, <strong>machinery skates</strong> under the base, load kept low and centered, moving slow with steel plate over any floor joint. On the truck, precision and CNC mills ride <strong>air-ride</strong> to keep road shock off the spindle and ways, chained to the base and wrapped against weather. At the destination it's not done until it's re-leveled: set the base, <a href=\"machine-leveling-and-alignment.html\">level it to the builder's spec</a>, and prove it with a test cut. This is the same discipline we run <a href=\"how-to-move-a-cnc-machine.html\">moving a CNC machine</a> or <a href=\"how-to-move-a-lathe.html\">a lathe</a>.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Knee mills are top-heavy — tipping, not sliding, is the failure mode.</li>\n  <li>Drop the knee, retract the ram, lock the table, and pull the vise and tooling.</li>\n  <li>Rig from the ram or factory points; nothing touches the ways or dials.</li>\n  <li>Air-ride for precision mills, then re-level to spec and test-cut before production.</li>\n</ul></div>\n<p>Moving a mill, a machine shop, or a full production floor? It's core <a href=\"../services/machinery-moving.html\">machinery moving</a> and <a href=\"../services/cnc-machine-movers.html\">CNC moving</a> work — <a href=\"../contact.html\">send the model and both floor layouts</a>.</p>",
    faq: [{"q": "How much does a Bridgeport milling machine weigh?", "a": "A standard Bridgeport-style knee mill runs roughly 2,000 to 2,500 pounds, with the head, ram, and motor concentrated near the top. Larger bed mills and CNC machining centers weigh considerably more. The high, top-heavy weight is why tipping is the main risk in a move."}, {"q": "Where do you lift a milling machine from?", "a": "From a sling under the ram with a spreader bar and softeners, or the machine's factory lifting points if it has them. Never lift by the table, the ways, the leadscrews, or the handwheels — those precision surfaces carry no load, and the pick stays centered on the top-heavy geometry."}, {"q": "Does a milling machine need re-leveling after a move?", "a": "Yes. Once the mill is set on its new floor, the base is leveled to the builder's specification with a machinist level and the machine is requalified with a test cut before production. A base that isn't level makes inaccurate parts with nothing visibly wrong."}],
    related: [{"h": "How to Move a CNC Machine", "u": "how-to-move-a-cnc-machine.html"}, {"h": "How to Move a Lathe", "u": "how-to-move-a-lathe.html"}, {"h": "Machine Leveling and Alignment", "u": "machine-leveling-and-alignment.html"}, {"h": "CNC Machine Movers", "u": "../services/cnc-machine-movers.html"}],
  },
  {
    slug: "how-to-secure-a-load-on-a-flatbed",
    cat: "How It's Done",
    hero: "loads/flatbed-load-securement-yellow-straps.jpg",
    date: "2026-07-03",
    title: "How to Secure a Load on a Flatbed (Chains, Straps & WLL)",
    desc: "How to secure a flatbed load to federal rules: the half-the-weight tie-down math, working load limit, straps vs chains, edge protection, and the minimum count.",
    dek: "The rules that keep a load on the deck — the tie-down math, WLL, and what actually holds. From the dispatch desk.",
    tldr: "Federal rules require flatbed tie-downs with a combined working load limit (WLL) of at least half the cargo weight, plus a minimum number by length and weight, plus blocking so the load can't shift. Straps handle lighter and crated freight; chains and binders handle heavy iron. Edge protection, correct WLL, and re-checks are the difference between secured and a shoulder.",
    keywords: "how to secure a load on a flatbed, cargo securement rules, working load limit, tie down chains vs straps, WLL, flatbed load securement",
    howto: {"name": "How to Secure a Flatbed Load", "steps": [{"name": "Block and brace first", "text": "Stop the load from moving before any tie-down goes on — hardwood dunnage, chocks, cleats, and cradles fill the gaps so the cargo can't slide or roll. Tie-downs hold the load against the blocking, not the other way around."}, {"name": "Do the WLL math", "text": "Add up the working load limits of every tie-down. The combined WLL must reach at least half the cargo weight (the aggregate rule), and heavy or long items need enough tie-downs to satisfy the minimum count as well."}, {"name": "Pick straps or chains", "text": "Straps and edge protectors for crated, coiled, or lighter freight; grade-70 chains and binders for heavy machinery and iron. Match the assembly's WLL to the load, and never mix an under-rated component into the chain."}, {"name": "Tie to rated points, protect edges", "text": "Secure to the load's engineered lash points or its skid — never over a control panel, casting, or sheet metal — and put edge protection anywhere webbing or chain crosses a sharp corner."}, {"name": "Re-check the load", "text": "Inspect and re-tension within the first 50 miles and at every stop. Chains stretch, straps settle, and blocking beds in — a load that was tight at the dock loosens on the road."}]},
    body: "<p>Straps get the credit, but securement is a system: block the load so it can't move, then tie it down to a number. Get the working-load-limit math wrong and it doesn't matter how many straps you throw over it. Here's how flatbed securement actually works.</p>\n<h2>Blocking comes before tie-downs</h2>\n<p>The first job is to stop movement in every direction — <strong>hardwood dunnage, chocks, cleats, and cradles</strong> that fill the gaps so the load can't slide, roll, or tip. Tie-downs hold the load <em>against</em> that blocking; on their own they don't stop a heavy load from walking. Full detail in our <a href=\"blocking-bracing-and-dunnage-explained.html\">blocking, bracing and dunnage guide</a>.</p>\n<figure><img src=\"../assets/img/loads/blocking-bracing-dunnage-box-truck.jpg\" alt=\"Hardwood dunnage and blocking positioned before tie-downs on a loaded deck\" loading=\"lazy\" width=\"640\" height=\"480\"><figcaption>Blocking and dunnage go on first — the tie-downs hold the load against them.</figcaption></figure>\n<h2>The half-the-weight rule (WLL)</h2>\n<p>Federal cargo-securement rules run on <strong>working load limit</strong> — the rated capacity of each strap, chain, binder, and anchor point. The core requirement: the <strong>combined WLL of all the tie-downs has to be at least half the weight of the cargo</strong> (the aggregate rule). On top of that there's a <strong>minimum number</strong> of tie-downs based on the length and weight of the article. Both have to be satisfied — enough capacity <em>and</em> enough tie-downs. The WLL of an assembly is set by its weakest part, so an under-rated binder or a worn strap drags the whole number down.</p>\n<h2>Straps vs. chains</h2>\n<ul>\n  <li><strong>Straps (webbing) and edge protectors</strong> — crated equipment, coils, lumber, and lighter or finish-sensitive freight. Fast to work, easy on surfaces with corner protection.</li>\n  <li><strong>Chains and binders</strong> — heavy machinery, steel, and anything that has to be pinned hard to the deck. Grade-70 transport chain is the standard for heavy iron.</li>\n</ul>\n<p>Tie to the load's <strong>engineered lash points or its skid</strong> — never over a control panel, a machined surface, or thin sheet metal — and put <strong>edge protection</strong> anywhere webbing or chain crosses a sharp corner, which is where straps cut and fail.</p>\n<h2>Re-check on the road</h2>\n<p>A load that's tight at the dock loosens as it runs — chains stretch, straps settle, blocking beds in. Rules require an inspection and re-tension <strong>within the first 50 miles</strong> and at every stop. It's the same standard we hold on every <a href=\"how-to-ship-industrial-machinery-on-a-flatbed.html\">machinery haul</a> and <a href=\"../services/heavy-haul.html\">heavy haul</a> move.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Block and brace first; tie-downs hold the load against the blocking.</li>\n  <li>Combined tie-down WLL must be at least half the cargo weight, plus the minimum count.</li>\n  <li>Straps for lighter/crated freight; chains and binders for heavy iron.</li>\n  <li>Tie to rated points, protect every edge, and re-check within 50 miles.</li>\n</ul></div>\n<p>Want your load secured like it matters? <a href=\"../contact.html\">Tell us what you're shipping</a> and our crews build the securement around it.</p>",
    faq: [{"q": "How many tie-downs does a flatbed load need?", "a": "Two things have to be satisfied. First, the combined working load limit of all tie-downs must be at least half the cargo weight. Second, there's a minimum number based on the length and weight of the article — generally at least one tie-down for shorter/lighter items, more as length and weight increase. Proper blocking is required on top of both."}, {"q": "What is working load limit (WLL)?", "a": "Working load limit is the rated capacity of a tie-down component — the strap, chain, binder, or anchor point. The combined WLL of a load's tie-downs must reach at least half the cargo weight. An assembly's WLL is set by its weakest part, so an under-rated or worn component lowers the whole rating."}, {"q": "Should I use chains or straps to secure a load?", "a": "Straps with edge protectors for crated, coiled, and lighter or finish-sensitive freight; grade-70 chains and binders for heavy machinery, steel, and anything that must be pinned hard to the deck. Match the assembly's WLL to the load, tie to rated points, and never mix an under-rated component into the assembly."}],
    related: [{"h": "Blocking, Bracing & Dunnage", "u": "blocking-bracing-and-dunnage-explained.html"}, {"h": "How to Ship Industrial Machinery on a Flatbed", "u": "how-to-ship-industrial-machinery-on-a-flatbed.html"}, {"h": "Flatbed vs Step Deck vs RGN", "u": "flatbed-vs-step-deck-vs-rgn-trailers.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "how-to-ship-a-skid-steer",
    cat: "Machinery Moving",
    hero: "loads/load-lowboy-warehouse.jpg",
    date: "2026-07-03",
    title: "How to Ship a Skid Steer",
    desc: "How to ship a skid steer or Bobcat: weight, trailer choice, drive-on loading, attachment handling, four-point chain securement, and when permits apply.",
    dek: "Small machine, simple move — if you get the trailer, the tie-downs, and the attachments right. From the dispatch desk.",
    tldr: "Most skid steers weigh 5,000–9,000 lbs and ship legal on a flatbed, step deck, or equipment trailer — no permits. Load it drive-on, lower the bucket or attachment to the deck, set the parking brake, and chain the four designated tie-down points with a combined rating of at least half the machine weight. Bulky attachments ride separately.",
    keywords: "how to ship a skid steer, skid steer transport, bobcat hauling, ship a skid steer, skid steer movers, equipment transport",
    howto: {"name": "How to Ship a Skid Steer", "steps": [{"name": "Confirm weight and dimensions", "text": "Pull the operating weight off the machine and measure width across the tires or tracks and height with the cab. Most skid steers run 5,000–9,000 lbs and stay inside legal dimensions, but larger and tracked models can push width."}, {"name": "Pick the trailer", "text": "A flatbed, step deck, or dedicated equipment trailer handles a skid steer. Drive-on loading needs a dock or ramps rated for the weight; a running machine loads in minutes."}, {"name": "Prep the machine", "text": "Lower the bucket or attachment flat to the deck, set the parking brake, lower and lock the lift arms, and secure or remove loose items. On enclosed transport, disconnect the battery if required."}, {"name": "Chain the four points", "text": "Run a minimum of four chains to the machine's designated tie-down points — not through the arms or over hydraulic lines — with a combined working load limit of at least half the machine weight, binders tight."}, {"name": "Handle attachments and confirm legality", "text": "Bulky or wide attachments (mulchers, snow blades, grapples) ship separately, secured on the deck. If width or a large attachment pushes past 8'6\", confirm the oversize permit before pickup."}]},
    body: "<p>A skid steer is about the easiest piece of heavy equipment to ship — compact, self-loading, and almost always inside legal dimensions. That said, \"easy\" still means the right trailer, real chains, and a plan for the attachments. Here's how it goes from the dispatch desk.</p>\n<h2>Weight and size: usually legal</h2>\n<p>Most skid steers run <strong>5,000 to 9,000 pounds</strong>, and compact track loaders a bit more. At that weight and size they ship inside the legal envelope — 8'6\" wide, 13'6\" tall, 80,000 lbs gross combined — so no permits, no escorts. The two things that change that math: a <strong>wide bucket or attachment</strong> that pushes past 8'6\", or a large track loader that runs heavier and wider than a standard skid steer. Measure the actual machine with whatever's mounted on it.</p>\n<figure><img src=\"../assets/img/warehouse-loadout.jpg\" alt=\"Compact loader staged at a dock for drive-on loading onto an equipment trailer\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Drive-on and go — a running skid steer loads in minutes on a flatbed, step deck, or equipment trailer.</figcaption></figure>\n<h2>Trailer and loading</h2>\n<p>A flatbed, step deck, or dedicated equipment trailer all work. A running machine drives on from a dock or up ramps rated for the weight; a dead machine gets winched or craned. Keep the machine centered over the trailer's axles so the weight sits where it belongs.</p>\n<h2>Securement: four points, chains to the frame</h2>\n<p>Federal securement rules treat equipment over 10,000 lbs as its own category, but even lighter skid steers ride the same way: <strong>a minimum of four chains</strong> to the machine's designated tie-down points, with combined working load limit of at least half the machine weight. Lower the bucket or attachment flat to the deck, set the parking brake, and lock the lift arms. Chains go to frame points — never over the loader arms or across hydraulic lines. This is the same discipline we run when <a href=\"how-to-ship-an-excavator.html\">shipping an excavator</a>.</p>\n<h2>Attachments</h2>\n<p>The machine and its attachments are two different loads. A standard bucket rides flat and chained. Bulky or over-width attachments — mulching heads, snow pushers, grapples, augers — come off and ship separately, secured on the deck, so they don't blow the width limit or work loose in transit.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Most skid steers are legal freight — flatbed, step deck, or equipment trailer, no permits.</li>\n  <li>Drive it on, lower the attachment, set the brake, chain the four frame points.</li>\n  <li>Wide attachments and large track loaders can push width — measure before booking.</li>\n  <li>Attachments ship separately, secured on the deck.</li>\n</ul></div>\n<p>Shipping one skid steer or a fleet? It's core <a href=\"../services/machinery-moving.html\">machinery moving</a> and <a href=\"../services/heavy-haul.html\">heavy haul</a> work — <a href=\"../contact.html\">get a quote</a> with the model and any attachments.</p>",
    faq: [{"q": "What trailer do you need to ship a skid steer?", "a": "A flatbed, step deck, or dedicated equipment trailer all work for a standard skid steer. A running machine drives on from a dock or rated ramps; a dead one is winched or craned. Larger compact track loaders may want a heavier-rated trailer."}, {"q": "Do you need a permit to ship a skid steer?", "a": "Usually not. Most skid steers stay within legal dimensions and weight, so no permit is required. The exceptions are a wide bucket or attachment that pushes past 8'6\" wide, or an oversized track loader — measure the machine with everything mounted before booking."}, {"q": "How do you tie down a skid steer for transport?", "a": "A minimum of four chains to the machine's designated tie-down points, combined working load limit at least half the machine weight, with the bucket lowered flat to the deck, arms locked, and parking brake set. Chains go to frame points, never over the loader arms or hydraulic lines."}],
    related: [{"h": "How to Ship an Excavator", "u": "how-to-ship-an-excavator.html"}, {"h": "Machinery Moving", "u": "../services/machinery-moving.html"}, {"h": "Flatbed vs Step Deck vs RGN", "u": "flatbed-vs-step-deck-vs-rgn-trailers.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
  {
    slug: "how-to-transport-a-boat",
    cat: "Heavy Haul",
    hero: "brokerage-flatbed.jpg",
    date: "2026-07-03",
    title: "How to Transport a Boat or Yacht by Road",
    desc: "How to transport a boat by road: beam-driven trailer choice, oversize permits and escorts for wide hulls, shrink-wrap and support, and superload yacht moves.",
    dek: "The hull's beam decides everything. Here's how a boat moves down the highway — from the dispatch desk.",
    tldr: "Boat transport is driven by beam (width) and height. Small boats on their own trailers ride legal; anything over 8'6\" wide is an oversize load needing permits and escorts in every state, and large yachts move on hydraulic trailers as superloads. The hull gets supported to its lines, shrink-wrapped, and the height measured to the highest fixed point.",
    keywords: "how to transport a boat, boat hauling, yacht transport, boat shipping by road, oversize boat load, boat movers",
    howto: {"name": "How to Transport a Boat by Road", "steps": [{"name": "Measure beam, length, and height", "text": "Get the hull's beam (width), overall length, and height to the highest fixed point on the trailer. Beam drives permits; height decides the trailer and route clearances. Remove or fold anything that adds height where possible."}, {"name": "Choose the trailer", "text": "Small boats ride their own trailers; larger hulls move on a step deck, lowboy, or a purpose-built hydraulic boat trailer that cradles the hull and lowers deck height."}, {"name": "Support and protect the hull", "text": "Cradle or block the hull to its designed support lines so the weight isn't riding on unsupported sections, then shrink-wrap or cover to protect the finish and secure loose hardware."}, {"name": "Permit by beam", "text": "Any hull over 8'6\" wide is an oversize load — pull permits for every state on the route, and expect pilot cars as beam increases and a height-pole car for tall hulls."}, {"name": "Route, escort, and run", "text": "Survey the route for low bridges and tight turns, stage escorts, travel the permitted daylight windows, and re-check securement along the way. Large yachts move as engineered superloads."}]},
    body: "<p>Moving a boat by road is heavy-haul work dressed up as a boat. The hull is expensive, awkward, and almost always wider than a truck — and the single number that drives the whole move is the <strong>beam</strong>. Here's how it's done.</p>\n<h2>Beam and height run the job</h2>\n<p>A boat's beam is its width, and width is what turns a boat move into an oversize move. Anything over <strong>8'6\" wide</strong> — which is most boats past a small runabout — is a permitted oversize load in every state it crosses. Height is the other constraint: measured to the highest fixed point on the loaded trailer, it decides the trailer and whether the route clears every bridge and wire. Radar arches, towers, and hardtops that can fold or come off usually should.</p>\n<figure><img src=\"../assets/img/heavyhaul-hero.jpg\" alt=\"Oversized load with escorts on an open highway, illustrating a wide-beam boat transport\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>Beam over 8'6\" makes it an oversize load — permits and escorts in every state, just like any wide haul.</figcaption></figure>\n<h2>Trailer choice</h2>\n<p>Small boats ride on their own trailers behind a suitable truck. Bigger hulls move on a <strong>step deck, lowboy, or a purpose-built hydraulic boat trailer</strong> that cradles the hull and drops deck height to keep a tall boat legal. The taller and wider the hull, the lower the deck needs to sit.</p>\n<h2>Supporting the hull</h2>\n<p>A hull isn't built to carry its own weight on two points. It gets <strong>cradled or blocked to its designed support lines</strong> so the load spreads the way the boat was engineered to take it — get this wrong and you can stress or crack the hull. Then it's shrink-wrapped or covered to protect the finish and keep hatches, canvas, and hardware from working loose at highway speed.</p>\n<h2>Permits, escorts, and the big ones</h2>\n<p>Permits follow the beam, state by state, with pilot cars added as width climbs and a height-pole car ahead of tall hulls. Large yachts — wide beam, tall, and heavy — move as engineered <a href=\"what-is-a-superload.html\">superloads</a> on hydraulic trailers, with route surveys, bridge review, and sometimes utility crews lifting wires. It's the same permitting logic as any <a href=\"../services/heavy-haul.html\">heavy haul</a> move; see <a href=\"what-is-considered-an-oversize-load.html\">what counts as oversize</a> for the thresholds.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Beam drives the move — over 8'6\" wide means oversize permits in every state.</li>\n  <li>Measure height to the highest fixed point; fold or remove arches and towers.</li>\n  <li>Cradle the hull to its support lines, shrink-wrap, and secure hardware.</li>\n  <li>Large yachts move on hydraulic trailers as engineered superloads.</li>\n</ul></div>\n<p>Moving a boat or yacht? Send the beam, length, and height and we'll spec the trailer, permits, and escorts — <a href=\"../contact.html\">get a quote</a>.</p>",
    faq: [{"q": "How wide can a boat be before it needs an oversize permit?", "a": "Any hull over 8 feet 6 inches of beam is an oversize load and needs a permit in every state on the route. Most boats past a small runabout exceed that, so beam is almost always the trigger for boat transport."}, {"q": "How is a boat supported for road transport?", "a": "The hull is cradled or blocked to its designed support lines so the weight spreads the way the boat was engineered to carry it, then shrink-wrapped or covered. Supporting a hull on the wrong points can stress or crack it, so proper blocking matters as much as the tie-downs."}, {"q": "How do you move a large yacht by road?", "a": "Large yachts travel on purpose-built hydraulic trailers that cradle the hull and lower the deck height, and they move as engineered superloads — with route surveys, bridge analysis, permits in every state, escorts, and sometimes utility crews lifting overhead lines."}],
    related: [{"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "What Is Considered an Oversize Load?", "u": "what-is-considered-an-oversize-load.html"}, {"h": "What Is a Superload?", "u": "what-is-a-superload.html"}, {"h": "Pilot Car & Escort Requirements", "u": "pilot-car-escort-requirements.html"}],
  },
  {
    slug: "how-to-transport-a-storage-tank",
    cat: "Heavy Haul",
    hero: "loads/load-storage-tank.jpg",
    date: "2026-07-03",
    title: "How to Transport a Storage Tank or Pressure Vessel",
    desc: "How to transport a storage tank or pressure vessel: diameter-driven oversize permits, trailer and cradle choice, saddle support, escorts, and superload routing.",
    dek: "Diameter makes it oversize before it's even loaded. Here's how tanks and vessels move — from the dispatch desk.",
    tldr: "Tanks and vessels are oversize by diameter and often by length — so most are permitted loads. They ride cradled in saddles on a flatbed, step deck, or multi-axle trailer chosen by weight and height, secured against rolling, with permits and escorts in every state. Large-diameter vessels move as engineered superloads.",
    keywords: "how to transport a storage tank, pressure vessel transport, tank hauling, oversize tank shipping, vessel rigging, heavy haul tank",
    howto: {"name": "How to Transport a Storage Tank", "steps": [{"name": "Get diameter, length, and weight", "text": "Diameter drives width and height on the trailer, length drives permits and overhang, and weight drives the trailer and axle count. Empty and shipped weights both matter — tanks ship empty and purged."}, {"name": "Choose the trailer and deck height", "text": "Flatbed or step deck for smaller tanks, lowboy or multi-axle for large or heavy vessels. Deck height plus tank diameter has to clear 13'6\"–14' or the load is over-height and permitted."}, {"name": "Cradle and support in saddles", "text": "The tank rides in shaped saddles or cradles matched to its diameter so the round body can't roll and the shell isn't point-loaded. Nozzles, manways, and fittings get protected."}, {"name": "Secure against rolling", "text": "Chain or strap over the saddles and to the frame, block the ends, and protect the shell at every contact point. A round load that shifts is a runaway."}, {"name": "Permit, survey, and escort", "text": "Pull oversize permits for every state on the route, survey for low bridges and tight turns, and stage escorts by width and height. Large-diameter vessels route as superloads."}]},
    body: "<p>Storage tanks and pressure vessels are among the most common oversized loads on the road — and among the easiest to get wrong, because a round steel body doesn't sit still on a flat deck. Here's how tanks and vessels move.</p>\n<h2>Diameter makes it oversize</h2>\n<p>A tank's <strong>diameter drives both width and height</strong> on the trailer, and most process and storage vessels are wide enough that they're oversize the moment they're loaded. Length adds permit and overhang issues; weight decides the trailer and how many axles it needs. The legal envelope is 8'6\" wide, 13'6\"–14' tall (state-dependent), and 80,000 lbs gross — a mid-size vessel can bust all three. Tanks ship <strong>empty and purged</strong>; both the empty weight and the loaded height off the deck matter.</p>\n<figure><img src=\"../assets/img/loads/load-oversize-tank.jpg\" alt=\"Oversized storage tank cradled and secured on a heavy-haul trailer\" loading=\"lazy\" width=\"1200\" height=\"800\"><figcaption>The round body rides in shaped saddles so it can't roll and the shell isn't point-loaded.</figcaption></figure>\n<h2>Trailer and cradle</h2>\n<p>Smaller tanks ride a <strong>flatbed or step deck</strong>; large or heavy vessels move on a <strong>lowboy or multi-axle trailer</strong> that keeps the diameter under the height limit and spreads the weight. The critical piece is the support: the tank sits in <strong>shaped saddles or cradles matched to its diameter</strong>, so the round body is held from rolling and the shell isn't taking load on a single point. Nozzles, manways, and fittings get protected or removed.</p>\n<h2>Securement: stop the roll</h2>\n<p>A cylinder wants to roll, so securement is built around that: <strong>chains or straps over the saddles and down to the frame</strong>, end blocking, and shell protection at every contact point. This is textbook <a href=\"blocking-bracing-and-dunnage-explained.html\">blocking and bracing</a> — the cradles and blocking do the work, the tie-downs hold it against them.</p>\n<h2>Permits, escorts, and superloads</h2>\n<p>Because diameter usually breaks the width and height limits, tank moves are <strong>permitted in every state</strong>, with pilot cars added by width and a height-pole car for tall loads. Large-diameter columns and vessels — refinery and process equipment — move as engineered <a href=\"what-is-a-superload.html\">superloads</a> with route surveys and bridge review. It's core <a href=\"../services/heavy-haul.html\">heavy haul</a> work; see <a href=\"what-is-considered-an-oversize-load.html\">what counts as oversize</a> for the thresholds.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Diameter drives width and height — most tanks are oversize before they're loaded.</li>\n  <li>Ship empty and purged; cradle the tank in saddles matched to its diameter.</li>\n  <li>Secure against rolling — chains over the saddles, end blocking, shell protection.</li>\n  <li>Permits and escorts in every state; large vessels route as superloads.</li>\n</ul></div>\n<p>Moving a tank or vessel? Send the diameter, length, and weight and we'll spec the trailer, cradle, permits, and escorts — <a href=\"../contact.html\">get a quote</a>.</p>",
    faq: [{"q": "Why is a storage tank considered an oversize load?", "a": "Because its diameter usually exceeds the 8'6\" legal width and, combined with the deck height, the 13'6\"–14' height limit. Most process and storage vessels are oversize the moment they're loaded, which means permits and often escorts in every state on the route."}, {"q": "How is a round tank kept from rolling on a trailer?", "a": "It rides in shaped saddles or cradles matched to its diameter, chained or strapped over the saddles and down to the frame, with the ends blocked. The cradles and blocking hold the round body from rolling and spread the load so the shell isn't point-loaded."}, {"q": "Do storage tanks ship full or empty?", "a": "Empty and purged. Product weight would change the trailer and axle math and create a shifting-load hazard, and many contents can't legally travel in a tank being relocated. Both the empty shipping weight and the loaded height off the deck drive the trailer choice."}],
    related: [{"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}, {"h": "What Is Considered an Oversize Load?", "u": "what-is-considered-an-oversize-load.html"}, {"h": "Blocking, Bracing & Dunnage", "u": "blocking-bracing-and-dunnage-explained.html"}, {"h": "What Is a Superload?", "u": "what-is-a-superload.html"}],
  },
  {
    slug: "texas-oversize-load-permits",
    cat: "Permits & Compliance",
    hero: "heavyhaul-load.jpg",
    date: "2026-07-03",
    title: "Texas Oversize & Overweight Load Permits: A Shipper's Guide",
    desc: "How Texas oversize and overweight permits work — TxDMV single-trip permits, legal limits, escort and height-pole rules, curfews, and superload routing.",
    dek: "Big, wide, or heavy through Texas? Here's how the state's permitting actually works — from the dispatch desk.",
    tldr: "Texas issues oversize/overweight permits through the TxDMV (via the TxPROS system). A load is permitted once it exceeds 8'6\" wide, 14' tall, ~65' long, or 80,000 lbs gross. Single-trip permits cover most moves; escorts kick in with width, height poles with over-height, and the biggest loads route as superloads with engineered review.",
    keywords: "texas oversize load permit, texas overweight permit, txdmv permit, texas heavy haul, texas superload, txpros",
    body: "<p>Texas moves more oversized freight than almost any state in the country — energy equipment, wind components, fabricated skids, construction iron — and its permitting reflects that. If your load is crossing Texas, here's what actually triggers a permit and how the state handles it.</p>\n<h2>What needs a permit in Texas</h2>\n<p>A load is legal in Texas up to <strong>8'6\" wide, 14' tall, 65' long, and 80,000 lbs gross</strong>. Note the height — Texas allows 14 feet, a foot more than the 13'6\" you'll hit in most eastern states, which matters the moment your route crosses a state line. Exceed any of those and you're into a permit for every mile inside Texas.</p>\n<ul>\n  <li><strong>Oversize</strong> — over width, height, or length limits.</li>\n  <li><strong>Overweight</strong> — over 80,000 lbs gross, or over the axle and bridge-formula limits underneath it.</li>\n</ul>\n<figure><img src=\"../assets/img/loads/gooseneck-flatbed-industrial-tanks.jpg\" alt=\"Oversized industrial load on a flatbed trailer routed through Texas on a permitted route\" loading=\"lazy\" width=\"1024\" height=\"576\"><figcaption>Texas permits are issued per load and per route through the TxDMV — dimensions lock to the permit.</figcaption></figure>\n<h2>How permits are issued</h2>\n<p>Texas oversize/overweight permits run through the <strong>TxDMV</strong> and its online TxPROS system. <strong>Single-trip permits</strong> cover one specific load on one route and are the standard for a one-off oversized move. Carriers who run oversized freight regularly can hold <strong>annual/blanket permits</strong> within set dimension limits. The permit ties to your exact width, height, length, and weight — change the load and the permit has to change with it.</p>\n<h2>Escorts, height poles, and curfews</h2>\n<p>Escort requirements scale with the load. As a working rule in Texas: loads get a <strong>front or rear escort</strong> as width climbs past roughly 14 feet on most highways, with escorts front and rear for the widest loads, and a <strong>height-pole escort</strong> out front for anything over-height to check clearances before the load reaches them. Over-length loads pull escorts too. Travel is generally <strong>daylight-only</strong> for oversized loads, with curfews through major metros like Houston, Dallas–Fort Worth, San Antonio, and Austin during rush hours, and restrictions on some holidays.</p>\n<h2>Superloads</h2>\n<p>When a load exceeds the ceilings a routine permit covers — extreme width, height, or weight — Texas reviews it as a <strong>superload</strong>: engineered route analysis, bridge review, and sometimes utility coordination, with lead times measured in weeks, not hours. See <a href=\"what-is-a-superload.html\">what a superload is</a> for the full picture.</p>\n<h2>The routes</h2>\n<p>Most Texas oversized freight runs the <strong>I-10, I-20, I-35, and I-45</strong> corridors that connect the Gulf ports, the metros, and the Permian Basin. The permit specifies the approved route; a load that's legal-dimension can run any legal road, but anything over height or weight has to stick to the surveyed path around low bridges and weight-restricted structures.</p>\n<div class=\"takeaways\"><h3>Bottom line</h3><ul>\n  <li>Texas legal limits: 8'6\" wide, 14' tall, 65' long, 80,000 lbs gross — permits start past any of them.</li>\n  <li>Permits issue through the TxDMV / TxPROS; single-trip covers most moves.</li>\n  <li>Escorts scale with width; height poles for over-height; daylight-only with metro curfews.</li>\n  <li>Extreme loads route as superloads with engineered review and long lead times.</li>\n</ul></div>\n<p>We handle Texas DOT permitting, routing, and escorts as part of every oversized move we run through the state — see <a href=\"../services/heavy-haul.html\">heavy haul transport</a> or <a href=\"../contact.html\">send your load and route</a> for a fast quote.</p>",
    faq: [{"q": "How tall can a load be in Texas without a permit?", "a": "Texas allows a legal height of 14 feet — a foot more than the 13'6\" limit in most eastern states. Above 14 feet, the load needs an oversize permit and a height-pole escort to verify clearances on the route."}, {"q": "Who issues oversize permits in Texas?", "a": "The Texas Department of Motor Vehicles (TxDMV), through its online TxPROS permitting system. Single-trip permits cover one load on one route; carriers running regular oversized freight can hold annual permits within set limits."}, {"q": "Does Texas require escorts for oversize loads?", "a": "Yes, above certain thresholds. Escort vehicles are required as width increases (generally past ~14 feet on most highways, with front and rear escorts for the widest loads), a height-pole car runs ahead of over-height loads, and the largest superloads can require police escorts."}],
    related: [{"h": "Oversize Load Permits Guide", "u": "oversize-load-permits-guide.html"}, {"h": "What Is Considered an Oversize Load?", "u": "what-is-considered-an-oversize-load.html"}, {"h": "Pilot Car & Escort Requirements", "u": "pilot-car-escort-requirements.html"}, {"h": "Heavy Haul Transport", "u": "../services/heavy-haul.html"}],
  },
];

// ---------------------------------------------------------------------------
const cleanUrls = s => s
  .split('badasslogistics.com/index.html').join('badasslogistics.com/')
  .split('="../index.html"').join('="/"')
  .split('="/index.html"').join('="/"')
  .split('="index.html"').join('="/"')
  .split('blog/index.html').join('blog/')
  .split('.html"').join('"')
  .split('.html#').join('#')
  .split('.html</loc>').join('</loc>');

function articleHtml(post) {
  const heroAbs = `${site.domain}/assets/img/${post.hero}`;
  const url = `${site.domain}/blog/${post.slug}.html`;
  const modified = post.updated || post.date;
  const wordCount = post.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const faqList = post.faq.map(f => `
    <details><summary>${f.q}</summary><div class="a">${f.a}</div></details>`).join('');

  // AEO: answer-first "quick answer" box — the passage answer engines lift
  const tldrHtml = post.tldr ? `
    <div class="tldr" id="quick-answer">
      <span class="tldr-tag hand">// quick answer</span>
      <p>${post.tldr}</p>
    </div>` : '';

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title.replace(/&amp;/g, '&'),
    "description": post.desc,
    "image": [heroAbs],
    "datePublished": post.date,
    "dateModified": modified,
    "wordCount": wordCount,
    "articleSection": post.cat,
    "inLanguage": "en-US",
    "author": { "@type": "Organization", "name": site.brand, "url": site.domain + "/" },
    "publisher": {
      "@type": "Organization",
      "name": site.brand,
      "logo": { "@type": "ImageObject", "url": `${site.domain}/assets/logo.png` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".tldr", ".lead"] }
  };
  if (post.keywords) articleSchema.keywords = post.keywords;

  // AEO: HowTo schema for step-by-step posts (opt-in via post.howto)
  const howToSchema = post.howto ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": post.howto.name,
    "description": post.howto.desc || post.desc,
    "image": heroAbs,
    ...(post.howto.totalTime ? { "totalTime": post.howto.totalTime } : {}),
    "step": post.howto.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.name,
      "text": s.text,
      "url": `${url}#step-${i + 1}`
    }))
  } : null;
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
<meta property="og:image" content="${heroAbs}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${post.title}">
<meta name="twitter:description" content="${post.desc}">
<meta name="twitter:image" content="${heroAbs}">
<link rel="sitemap" type="application/xml" href="${site.domain}/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap"></noscript>
<link rel="icon" href="../assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
<link rel="preload" as="image" href="../assets/img/${post.hero}" fetchpriority="high">
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
</script>${howToSchema ? `
<script type="application/ld+json">
${JSON.stringify(howToSchema, null, 2)}
</script>` : ''}
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Blog</a> / ${post.cat}</div>

<section class="page-hero photo" style="background-image:url('../assets/img/${post.hero}')"><div class="wrap">
  <span class="section-tag hand">// ${post.cat.toLowerCase()}</span>
  <h1>${post.title}</h1>
  <p class="lead">${post.dek}</p>
</div>
  <span class="annot hand tag warn a1">FIELD GUIDE</span>
  <span class="annot hand a4">BY THE CREW ✓</span>
</section>

<section class="notes-bg">
  <span class="bgnote" style="top:6%;right:4%;transform:rotate(-4deg)">REAL LOADS — REAL NUMBERS</span>
  <span class="bgnote" style="top:38%;right:6%;transform:rotate(3deg)">NO FLUFF, JUST SPECS</span>
  <span class="bgnote" style="top:70%;right:4%;transform:rotate(-3deg)">FROM THE DISPATCH DESK</span>
  <div class="wrap">
  <article class="post prose post-body">
    <p class="meta">${post.cat} · By the Badass Logistics crew · ${new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${post.updated ? ` · Updated ${new Date(post.updated + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}</p>
    ${tldrHtml}
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
    "description": "Guides on heavy haul, rigging, oversize permits, machinery moving, and plant relocation from Badass Logistics.",
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
<meta property="og:description" content="Practical guides on heavy haul, rigging, oversize permits, machinery moving, and plant relocation.">
<meta property="og:url" content="${site.domain}/blog/index.html">
<meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${OG}">
<link rel="sitemap" type="application/xml" href="${site.domain}/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=Barlow:wght@400;500;600;700&display=swap"></noscript>
<link rel="icon" href="../assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
<link rel="stylesheet" href="../css/styles.css">
${BLOG_CSS}
<script type="application/ld+json">
${JSON.stringify(blogSchema, null, 2)}
</script>
</head>
<body>
${NAV}

<div class="wrap breadcrumb"><a href="../index.html">Home</a> / Blog</div>

<section class="page-hero notes-bg">
  <span class="bgnote" style="top:24%;right:5%;transform:rotate(-4deg)">MEASURED &amp; MOVED</span>
  <span class="bgnote" style="bottom:16%;right:9%;transform:rotate(3deg)">FIELD NOTES ✓</span>
  <div class="wrap">
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
POSTS.forEach(p => fs.writeFileSync(path.join(outDir, `${p.slug}.html`), cleanUrls(articleHtml(p))));
fs.writeFileSync(path.join(outDir, 'index.html'), cleanUrls(indexHtml()));

console.log(`✓ Built ${POSTS.length} blog articles + index in /blog`);
POSTS.forEach(p => console.log(`   - blog/${p.slug}.html`));
