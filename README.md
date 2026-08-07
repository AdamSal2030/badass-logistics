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
| `build-trailer-types.js` | 6 trailer-type hubs + trailer grid in `services/heavy-haul.html` |
| `build-blog.js` | 45 field-guide articles + blog index |
| `seo-polish.js` | idempotent head/footer upgrades for hand-written pages |
| `link-trailer-hubs.js` | trailer-hub internal link mesh — **must run last** |

Data lives in `data/locations.json` (88 entries) + `data/site.json`. Rebuild everything:

```bash
node build-locations.js && node build-states.js && node build-service-cities.js && node build-trailer-types.js && node build-blog.js && node seo-polish.js && node link-trailer-hubs.js
```

`link-trailer-hubs.js` runs last on purpose: the generators emit the footer
"Trailer Types" column themselves, but the contextual trailer strip on the
heavy-haul city pages and the blog cross-links are applied as a post-build
pass. All of it is idempotent and sentinel-guarded, so re-running is safe.

## Reporting

`node gsc-report.js 28` prints the Search Console scoreboard and appends a row
to `data/gsc-trend.csv`. Needs `gsc-key.json` (service-account key, git-ignored).

© 2022–2026 Badass Logistics.
