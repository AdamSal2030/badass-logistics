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
  'about.html', 'contact.html', 'locations.html',
  'services/rigging.html', 'services/heavy-haul.html',
  'services/dispatching.html', 'services/freight-moving.html',
];
const SERVICE_NAMES = {
  'services/rigging.html': 'Industrial Rigging',
  'services/heavy-haul.html': 'Heavy Haul Transport',
  'services/dispatching.html': 'Truck Dispatching',
  'services/freight-moving.html': 'Freight Moving',
};

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

  if (h !== before) {
    fs.writeFileSync(fp, h);
    console.log(`✓ polished ${rel}`);
  } else {
    console.log(`· no change ${rel}`);
  }
}
