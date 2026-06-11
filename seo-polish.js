#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — static-page SEO polish (idempotent)
   Applies sitewide head/nav/footer upgrades to the hand-written
   static pages that aren't produced by a generator:
     - real phone (from site.json) in place of the placeholder
     - Blog link in nav + footer
     - Open Graph / Twitter / theme-color / robots meta
     - BreadcrumbList JSON-LD on service pages
     - loading="lazy" on content <img>
   Safe to re-run.  node seo-polish.js
   =========================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const OG = `${site.domain}/assets/img/og-default.jpg`;

const FILES = [
  'index.html', 'about.html', 'contact.html', 'locations.html',
  'services/rigging.html', 'services/heavy-haul.html',
  'services/dispatching.html', 'services/freight-moving.html',
];

// "From the field guide" — 3 matched blog articles per service page.
const SERVICE_READS = {
  'services/rigging.html': [
    { u: '../blog/what-is-industrial-rigging.html', t: 'rigging-crane.jpg', h: 'What Is Industrial Rigging?', p: 'What riggers do, the equipment they use, and why every lift is an engineering problem first.' },
    { u: '../blog/how-to-move-a-cnc-machine.html', t: 'loads/load-machine-loadout.jpg', h: 'How to Move a CNC Machine', p: 'OEM prep, toe jacks and skates, lift points, air-ride transport, and re-leveling at the destination.' },
    { u: '../blog/how-to-move-an-mri-machine.html', t: 'mri-real.jpg', h: 'How to Move an MRI Machine', p: 'Magnet weight, cryogens, shock and tilt limits — how a scanner move actually gets done.' },
  ],
  'services/heavy-haul.html': [
    { u: '../blog/how-much-does-heavy-haul-cost.html', t: 'heavyhaul-hero.jpg', h: 'How Much Does Heavy Haul Cost?', p: 'The levers that actually move an oversized quote — and how to get a real number fast.' },
    { u: '../blog/how-to-ship-an-excavator.html', t: 'rgn-load.jpg', h: 'How to Ship an Excavator', p: 'Matching the machine to the trailer, the permits it triggers, and how loading works.' },
    { u: '../blog/pilot-car-escort-requirements.html', t: 'loads/load-oversize-tank.jpg', h: 'Pilot Car & Escort Requirements', p: 'When your load legally needs escorts, what they do, and why they decide your delivery date.' },
  ],
  'services/dispatching.html': [
    { u: '../blog/truck-dispatcher-vs-freight-broker.html', t: 'dispatch-agent.jpg', h: 'Dispatcher vs Freight Broker', p: 'Who each one works for, what they legally can do, and which one an owner-operator needs.' },
    { u: '../blog/hot-shot-trucking-explained.html', t: 'dispatch-truck.jpg', h: 'Hot Shot Trucking Explained', p: 'The one-ton-and-gooseneck game: what fits, what it requires, and when it beats a semi.' },
    { u: '../blog/ltl-vs-ftl-freight.html', t: 'brokerage-dryvan.jpg', h: 'LTL vs FTL Freight', p: 'Pallet thresholds, transit time, and handling risk — which mode the math really favors.' },
  ],
  'services/freight-moving.html': [
    { u: '../blog/ltl-vs-ftl-freight.html', t: 'brokerage-dryvan.jpg', h: 'LTL vs FTL Freight', p: 'Real decision rules for when less-than-truckload saves money and when it costs you.' },
    { u: '../blog/what-is-drayage.html', t: 'loads/load-reels-container.jpg', h: 'What Is Drayage?', p: 'Port-to-door container moves — and how to keep demurrage and per diem at zero.' },
    { u: '../blog/flatbed-vs-step-deck-vs-rgn-trailers.html', t: 'brokerage-flatbed.jpg', h: 'Flatbed vs Step Deck vs RGN', p: 'Deck height decides everything. Which trailer your freight actually needs.' },
  ],
};
const SERVICE_NAMES = {
  'services/rigging.html': 'Industrial Rigging',
  'services/heavy-haul.html': 'Heavy Haul Transport',
  'services/dispatching.html': 'Truck Dispatching',
  'services/freight-moving.html': 'Freight Moving',
};

const cleanUrls = s => s
  .split('badasslogistics.com/index.html').join('badasslogistics.com/')
  .split('="../index.html"').join('="/"')
  .split('="/index.html"').join('="/"')
  .split('="index.html"').join('="/"')
  .split('blog/index.html').join('blog/')
  .split('.html"').join('"')
  .split('.html#').join('#')
  .split('.html</loc>').join('</loc>');

const grab = (re, s) => { const m = s.match(re); return m ? m[1] : ''; };

for (const rel of FILES) {
  const fp = path.join(ROOT, rel);
  let h = fs.readFileSync(fp, 'utf8');
  const before = h;
  const sub = rel.includes('/');           // a page inside services/
  const P = sub ? '../' : '';

  // 1) real phone everywhere
  h = h.split('(000) 000-0000').join(site.phone);
  h = h.split('tel:0000000000').join('tel:' + site.phoneHref);

  // 2) Blog link in nav (before the "About" nav anchor) + footer (before "Contact")
  if (!h.includes(`${P}blog/index.html`)) {
    h = h.replace(`<a href="${P}about.html">About</a>`,
                  `<a href="${P}blog/index.html">Blog</a><a href="${P}about.html">About</a>`);
    h = h.replace(`<a href="${P}contact.html">Contact</a>`,
                  `<a href="${P}blog/index.html">Blog</a><a href="${P}contact.html">Contact</a>`);
  }

  // 3) social / robots meta (only if the page has no OG yet) — inserted after canonical
  if (!/og:image/.test(h) && !/og:title/.test(h)) {
    const title = grab(/<title>([\s\S]*?)<\/title>/, h);
    const desc = grab(/<meta name="description" content="([\s\S]*?)">/, h);
    const canon = grab(/<link rel="canonical" href="([\s\S]*?)">/, h);
    const block = `
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#141414">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${OG}">`;
    h = h.replace(/(<link rel="canonical"[^>]*>)/, `$1${block}`);
  }

  // 4) BreadcrumbList JSON-LD on service pages (before </head>)
  if (SERVICE_NAMES[rel] && !/BreadcrumbList/.test(h)) {
    const canon = grab(/<link rel="canonical" href="([\s\S]*?)">/, h);
    const bc = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${site.domain}/` },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": `${site.domain}/#services` },
        { "@type": "ListItem", "position": 3, "name": SERVICE_NAMES[rel], "item": canon }
      ]
    };
    h = h.replace('</head>',
      `<script type="application/ld+json">\n${JSON.stringify(bc, null, 2)}\n</script>\n</head>`);
  }

  // 5) lazy-load content images
  h = h.replace(/<img (?!loading=)/g, '<img loading="lazy" ');

  // 6) apple-touch-icon (after favicon link)
  if (!h.includes('apple-touch-icon')) {
    h = h.replace(/(<link rel="icon"[^>]*>)/,
      `$1\n<link rel="apple-touch-icon" sizes="180x180" href="${P}assets/apple-touch-icon.png">`);
  }

  // 7) preload the LCP hero image (CSS background of .hero/.page-hero)
  if (!h.includes('rel="preload" as="image"')) {
    const hm = h.match(/class="(?:page-hero|hero) photo" style="background-image:url\('([^']+)'\)"/);
    if (hm) {
      h = h.replace('</head>', `<link rel="preload" as="image" href="${hm[1]}" fetchpriority="high">\n</head>`);
    }
  }

  // 8) "From the field guide" — related blog reads on service pages (before the CTA band)
  if (SERVICE_READS[rel] && !h.includes('From the field guide')) {
    const cards = SERVICE_READS[rel].map(c =>
      `    <a class="svc-card" href="${c.u}"><div class="thumb" style="background-image:url('../assets/img/${c.t}')"></div><span class="num hand">field guide</span><h3>${c.h}</h3><p>${c.p}</p><span class="more">Read the guide</span></a>`
    ).join('\n');
    const section = `<section><div class="wrap">
  <span class="section-tag hand">From the field guide</span>
  <h2 class="section-title">Straight answers from our blog</h2>
  <div class="grid-services" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">
${cards}
  </div>
</div></section>

<div class="cta-band">`;
    h = h.replace('<div class="cta-band">', section);
  }

  h = cleanUrls(h);
  if (h !== before) {
    fs.writeFileSync(fp, h);
    console.log(`✓ polished ${rel}`);
  } else {
    console.log(`· no change ${rel}`);
  }
}
