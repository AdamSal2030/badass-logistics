# Badass Logistics

**Live site: [badasslogistics.com](https://badasslogistics.com)**

One-stop industrial logistics — [industrial rigging](https://badasslogistics.com/services/rigging), [heavy haul trucking](https://badasslogistics.com/services/heavy-haul), and [machinery moving](https://badasslogistics.com/services/machinery-moving). 88 locations, all 50 states. Founded 2022.

> `services/dispatching` and `services/freight-moving` are deliberately orphaned — live by URL but unlinked site-wide. Don't relink them; the site is positioned as rigging & heavy-haul.

## Stack

Plain static HTML/CSS on GitHub Pages — no framework, no build step for the core pages. Node generators produce the programmatic pages:

| Script | Output |
|---|---|
| `build-locations.js` | 128 city/location pages + `locations.html` grid + `sitemap.xml` |
| `build-states.js` | state hub pages + state chips (run after build-locations) |
| `build-service-cities.js` | 565 service × city pages (incl. 113 heavy-haul) |
| `build-trailer-types.js` | 7 trailer-type hubs + trailer grid in `services/heavy-haul.html` |
| `build-blog.js` | 47 field-guide articles + blog index |
| `seo-polish.js` | idempotent head/footer upgrades for hand-written pages |
| `link-trailer-hubs.js` | trailer-hub internal link mesh — link pass |
| `link-city-mesh.js` | lateral nearby-city mesh on all 440 service-city pages — link pass |
| `build.js` | **single entrypoint** — runs every step above in order, then verifies |
| `ping-search-engines.js` | IndexNow (Bing) + Google sitemap resubmit — run after a content push |

Data lives in `data/locations.json` (88 entries) + `data/site.json`. Rebuild everything:

```bash
node build.js            # full rebuild + verify
node build.js --verify   # verify only, no writes
```

**Always build with `node build.js`.** Never run a generator on its own.

The generators OVERWRITE the programmatic pages, which wipes every post-build
link pass. That has now bitten this repo twice:

* **2026-08-11** — `machinery-moving.html` shipped with zero links to its 88
  city children after losing its sentinel pair.
* **2026-09-03** — a bare `build-service-cities.js` run wiped the contextual
  trailer strips off all 113 heavy-haul city pages. Nobody noticed for four
  weeks; the trailer hubs sat at position 49–79 the entire time and
  `/services/step-deck-trailer` was still at 77.8 in the 2026-09-05 GSC pull.

`build.js` runs the generators first and the link passes last, then refuses to
exit clean if the result is wrong. It checks: both link passes actually landed,
every internal link resolves (51k+, relative and absolute), the machinery-moving
pillar still carries its city cards, and titles/descriptions are present and
unique. All passes are idempotent and sentinel-guarded, so re-running is safe.

### Internal link mesh

`link-city-mesh.js` fixes the problem found in the 2026-09-05 GSC pull: service
city pages linked UP to their state hub and ACROSS to sibling services in the
same city, but never laterally to each other. Equity pooled in the 25 state hubs
and never reached the money pages —
`/services/machinery-moving/savannah-ga` ranked 10.6 on
"machinery movers savannah ga" (103 impressions, 0 clicks) with **two** inbound
internal links. The mesh adds a "nearby coverage" block to all 440 service-city
pages linking the 6 closest cities in the same service (same state first, then
same region per `data/metros.json`), with the real city+service phrase as anchor
text. Median in-body inbound links per money page went 2 → 9.

## Reporting

`node gsc-report.js 28` prints the Search Console scoreboard and appends a row
to `data/gsc-trend.csv`. Needs `gsc-key.json` (service-account key, git-ignored).

After pushing content, `node ping-search-engines.js` submits the changed URLs to
IndexNow (Bing/Yandex) and resubmits the sitemap to Google. Pass paths explicitly
(`node ping-search-engines.js /blog/new-post`) or let it default to today's
`lastmod` entries. GitHub Pages has no ping hook, so without this the site waits
to be recrawled — the trailer hubs sat 4 weeks between crawls.

> Each pillar page (`services/<svc>.html`) must keep its `<!--*_METROS_START-->`
> sentinel pair — that is where `build-service-cities.js` writes the 88 city-card
> links. `machinery-moving.html` lost its pair at some point and silently shipped
> with zero links to its city children until 2026-08-11.

© 2022–2026 Badass Logistics.
