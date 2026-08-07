#!/usr/bin/env node
/* ===========================================================
   Badass Logistics — trailer-hub internal linking

   The six trailer-type hubs (/services/rgn-trailer, lowboy-trailer,
   step-deck-trailer, double-drop-trailer, flatbed-transport,
   multi-axle-transport) shipped 2026-07-11 and were near-orphaned:
   the only inbound links were the hubs pointing at each other, plus
   trailer-selector.html and services/heavy-haul.html. Nothing from
   the homepage, the 113 heavy-haul city pages, or the trailer blog
   posts — so they indexed but sat at position 49–79.

   This script builds the missing inbound mesh:
     1. "Trailer Types" footer column on every page (sitewide link equity)
     2. Contextual trailer strip on the 113 heavy-haul city pages
     3. Contextual links from the trailer blog posts (highest topical fit)

   Idempotent — safe to re-run. Skips the two Google Ads landing pages
   (quote-rigging, quote-heavy-haul) on purpose: nav links hurt conversion.

   RUN:  node link-trailer-hubs.js
   =========================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

const TRAILERS = [
  { slug: 'rgn-trailer',          label: 'RGN Transport' },
  { slug: 'lowboy-trailer',       label: 'Lowboy Transport' },
  { slug: 'step-deck-trailer',    label: 'Step-Deck Transport' },
  { slug: 'double-drop-trailer',  label: 'Double-Drop &amp; Stretch' },
  { slug: 'flatbed-transport',    label: 'Flatbed Transport' },
  { slug: 'multi-axle-transport', label: 'Multi-Axle &amp; Superload' },
];

// Ad landing pages stay clean — no footer nav, no outbound distractions.
const SKIP = new Set(['quote-rigging.html', 'quote-heavy-haul.html', '404.html']);

const FOOTER_COL =
  '<div><h4>Trailer Types</h4>' +
  TRAILERS.map(t => `<a href="/services/${t.slug}">${t.label}</a>`).join('') +
  '</div>';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'content-drafts') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let footerAdded = 0, stripAdded = 0, blogAdded = 0, skipped = 0;

// ---------- 1. sitewide footer column ----------
for (const f of files) {
  const rel = path.relative(ROOT, f);
  if (SKIP.has(rel)) { skipped++; continue; }
  let html = fs.readFileSync(f, 'utf8');
  if (html.includes('<h4>Trailer Types</h4>')) continue;   // already has it

  const before = html;
  // Generated pages (minified) + index.html (pretty-printed) both match:
  // insert the new column immediately before the "Company" column.
  html = html.replace(/([ \t]*)<div>(\s*)<h4>Company<\/h4>/, (m, indent, ws) => {
    // Mirror the surrounding whitespace style so pretty pages stay pretty.
    const col = ws.includes('\n')
      ? `<div>${ws}<h4>Trailer Types</h4>${ws}` +
        TRAILERS.map(t => `<a href="/services/${t.slug}">${t.label}</a>`).join(ws) +
        `\n${indent}</div>\n${indent}`
      : FOOTER_COL + '\n' + indent;
    return `${indent}${col}<div>${ws}<h4>Company</h4>`;
  });

  if (html !== before) { fs.writeFileSync(f, html); footerAdded++; }
}

// ---------- 2. contextual strip on heavy-haul city pages ----------
const S = '<!--TRAILER_STRIP_START-->', E = '<!--TRAILER_STRIP_END-->';
const hhDir = path.join(ROOT, 'services', 'heavy-haul');
if (fs.existsSync(hhDir)) {
  for (const name of fs.readdirSync(hhDir).filter(n => n.endsWith('.html'))) {
    const f = path.join(hhDir, name);
    let html = fs.readFileSync(f, 'utf8');
    if (html.includes(S)) continue;                        // already has it

    // Place name straight from the page's own H1 so state hubs read right too.
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const place = m
      ? m[1].replace(/<[^>]+>/g, '').replace(/Heavy Haul(ing)?( Trucking| Transport)?( in| across)?/i, '').trim()
      : '';
    const where = place ? ` in ${place}` : '';

    const strip = `<section class="bg-paper" style="border-top:3px solid var(--ink);border-bottom:3px solid var(--ink);"><div class="wrap">
  ${S}
  <span class="section-tag hand">by trailer type</span>
  <h2 class="section-title">Which trailer your load rides on</h2>
  <p class="section-intro">Picking the trailer is half the job${where ? `, and it drives what the move costs${where}` : ''}. We run every heavy-haul configuration — matched to your load's weight, height, and length:</p>
  <div class="tt-grid">
    ${TRAILERS.map(t => `<a href="/services/${t.slug}">${t.label}</a>`).join('\n    ')}
    <a href="/trailer-selector"><strong>Not sure? Trailer selector →</strong></a>
  </div>
  ${E}
</div></section>

`;
    const anchor = '<section class="notes-bg">';
    if (html.includes(anchor)) {
      html = html.replace(anchor, strip + anchor);
      fs.writeFileSync(f, html);
      stripAdded++;
    } else {
      console.warn(`  ! no anchor in ${path.relative(ROOT, f)} — skipped strip`);
    }
  }
}

// ---------- 3. contextual links from the trailer blog posts ----------
// These are the highest topical-fit inbound links available: posts already
// ranking on trailer queries that never pointed at the money pages.
const BLOG_LINKS = {
  'step-deck-vs-drop-deck-trailers.html': ['step-deck-trailer', 'double-drop-trailer'],
  'flatbed-vs-step-deck-vs-rgn-trailers.html': ['flatbed-transport', 'step-deck-trailer', 'rgn-trailer'],
  'enclosed-vs-flatbed-transport.html': ['flatbed-transport'],
  'how-to-secure-a-load-on-a-flatbed.html': ['flatbed-transport'],
  'what-is-considered-an-oversize-load.html': ['multi-axle-transport', 'rgn-trailer'],
};
const BS = '<!--TRAILER_XLINK_START-->', BE = '<!--TRAILER_XLINK_END-->';
for (const [name, slugs] of Object.entries(BLOG_LINKS)) {
  const f = path.join(ROOT, 'blog', name);
  if (!fs.existsSync(f)) { console.warn(`  ! missing blog post ${name}`); continue; }
  let html = fs.readFileSync(f, 'utf8');
  if (html.includes(BS)) continue;

  const links = slugs.map(s => {
    const t = TRAILERS.find(x => x.slug === s);
    return `<a href="/services/${t.slug}">${t.label}</a>`;
  });
  const box = `
${BS}
<div class="tt-grid" style="margin:26px 0 8px">
  ${links.join('\n  ')}
  <a href="/services/heavy-haul"><strong>All heavy haul →</strong></a>
</div>
${BE}
`;
  // Drop it right before the post's closing CTA/related block if there is one,
  // otherwise before the footer.
  const anchor = html.includes('<div class="cta-band">') ? '<div class="cta-band">' : '<footer>';
  html = html.replace(anchor, box + anchor);
  fs.writeFileSync(f, html);
  blogAdded++;
}

console.log(`✓ Footer "Trailer Types" column added to ${footerAdded} pages (${skipped} ad/error pages skipped by design)`);
console.log(`✓ Contextual trailer strip added to ${stripAdded} heavy-haul city pages`);
console.log(`✓ Contextual cross-links added to ${blogAdded} trailer blog posts`);
