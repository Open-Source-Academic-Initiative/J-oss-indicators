# Open Source Indicators (`mod_oss_indicators`)

A **Joomla 5** site module that renders a live, scrolling **"OSS ticker"** — a row
of open-source ecosystem indicators (GitHub stars & releases, npm downloads,
HuggingFace, critical CVEs, Mastodon servers…). Data is fetched **client-side**
from public APIs and cached in the visitor's browser. Built by the
[Open Source Academic Initiative (OpenSAI)](https://opensai.org).

Converted from a Custom HTML (`mod_custom`) block into a proper, **configurable**
namespaced module.

## Features

- Scrolling, theme-aware ticker (auto dark/light) with hover tooltips.
- **Declarative indicators** — each entry is data (`label, icon, relevance, type,
  arg, …`) resolved by a generic client-side dispatcher; **49 shipped by default**.
- Per-visit **random rotation** + **localStorage cache** (configurable TTL).
- Fully **configurable from the module admin** (see below).
- **Multi-instance safe** (each instance scoped by module id; no global DOM ids).

## Requirements

- Joomla **5.x**, PHP **8.1+**

## Installation

**Packaged zip:** zip the repo contents (manifest `mod_oss_indicators.xml` at the
zip root) → Joomla admin **System → Install → Upload Package File**.

**From source (dev):** copy into `<joomla>/modules/mod_oss_indicators/` and the
`media/mod_oss_indicators/` assets into `<joomla>/media/`, then **System →
Install → Discover**. Create an instance under **Content → Site Modules**, assign
a position, publish.

## Configuration (admin params)

| Group | Setting | Default |
|---|---|---|
| Presentation | Title, Loading text, No-data text, Tooltip heading | Spanish defaults |
| Presentation | Scroll duration (s) | 130 |
| Presentation | Indicators fetched / shown | 10 / 7 |
| Presentation | Cache (hours) | 24 |
| Theme colors | bg / text / label / border / positive / negative / neutral / tooltip | empty → built-in theme |
| Indicators | **Indicators (JSON)** | empty → built-in 49 |

### Indicator schema (JSON override)

Leave the **Indicators (JSON)** field empty to use the built-in set, or paste a
JSON array of objects:

```json
[
  { "label": "PyTorch", "icon": "🔥", "relevance": "…", "type": "gh_stars",
    "arg": "pytorch/pytorch", "value": "PyTorch", "tone": "neutral", "url": "https://pytorch.org" }
]
```

**Supported `type` values** (resolver → live value/change):

| type | `arg` | notes |
|---|---|---|
| `gh_stars` | `owner/repo` | GitHub stars → change |
| `gh_tag` | `owner/repo` | latest tag; `value` is a prefix (e.g. `"Linux "`) |
| `npm_week` | package name | npm weekly downloads |
| `gh_search` | search query | top repo; supports `{yesterday}` placeholder |
| `gh_advisory` | — | latest critical CVE advisory |
| `hf_top` | — | HuggingFace top-downloaded model |
| `mastodon` | — | active Mastodon server count |
| `static` | — | fixed `value`/`change`/`url` (no fetch) |

`tone` is one of `positive` / `negative` / `neutral` (colors the change text).

## ⚠️ Note on API rate limits

Indicators are fetched from **unauthenticated public APIs**. GitHub's anonymous
limit is **60 requests/hour per IP**, and a first visit fetches up to
`fetch_count` indicators — so heavy traffic can hit limits. The browser cache
(`cache_hours`) softens repeat visits. A future version could batch via GraphQL
or a small server-side proxy.

## Repository layout

| Path | Purpose |
|---|---|
| `mod_oss_indicators.xml` | Manifest (metadata, params, media) |
| `services/provider.php` | DI service provider |
| `src/Dispatcher/Dispatcher.php` | Entry point; builds view config |
| `src/Helper/OssIndicatorsHelper.php` | Params → config array |
| `tmpl/default.php` | Root markup + per-instance JS config |
| `media/mod_oss_indicators/css/ticker.css` | Styles |
| `media/mod_oss_indicators/js/ticker.js` | Resolvers, defaults, render |

## Author & License

- **Author:** David Toro Triana — dtorot@opensai.org
- **License:** [GNU General Public License v3.0 or later](LICENSE)

© 2026 Open Source Academic Initiative (OpenSAI).
