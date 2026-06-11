# Badass Logistics

**Live site: [badasslogistics.com](https://badasslogistics.com)**

One-stop industrial logistics — [industrial rigging](https://badasslogistics.com/services/rigging), [heavy haul trucking](https://badasslogistics.com/services/heavy-haul), [machinery moving](https://badasslogistics.com/services/machinery-moving), [truck dispatching](https://badasslogistics.com/services/dispatching), and [freight moving](https://badasslogistics.com/services/freight-moving). 48 locations, all 50 states. Founded 2022.

## Stack

Plain static HTML/CSS on GitHub Pages — no framework, no build step for the core pages. Three Node generators produce the programmatic pages:

| Script | Output |
|---|---|
| `build-locations.js` | 48 city pages + `locations.html` grid + `sitemap.xml` |
| `build-states.js` | 37 state hub pages + state chips (run after build-locations) |
| `build-blog.js` | 12 field-guide articles + blog index |
| `seo-polish.js` | idempotent head/footer upgrades for hand-written pages |

Data lives in `data/locations.json` + `data/site.json`. Rebuild everything:

```bash
node build-locations.js && node build-states.js && node build-blog.js && node seo-polish.js
```

© 2022–2026 Badass Logistics.
