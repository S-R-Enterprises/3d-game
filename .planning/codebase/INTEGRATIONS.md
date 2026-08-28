# External Integrations

**Analysis Date:** 2026-07-29

## APIs & External Services

**Analytics/Monitoring:**
- Vercel Web Analytics - Used to track page views and visitor insights.
  - SDK/Client: Injected script in `index.html` (`/_vercel/insights/script.js`)

## Data Storage

**Databases:**
- None (fully static frontend application).

**Local Storage:**
- Web LocalStorage API - Used to persist the state of the user having completed the game controls guide (`hasCompletedGuide` key, read in `src/js/index.js` and set in `src/js/world/gameGuide.js`).

**File Storage:**
- Local filesystem only. 3D models (`.glb` files) and textures (`.png`, `.webp`, `.jpg`) are stored locally inside the `public/` directory and loaded dynamically by the `Resources` manager.

**Caching:**
- None configured beyond standard browser caching for static assets.

## Authentication & Identity

**Auth Provider:**
- None.

## Monitoring & Observability

**Error Tracking:**
- None.

**Logs:**
- Console logging for development diagnostics.

## CI/CD & Deployment

**Hosting:**
- Vercel / Static Hosting ready.

**CI Pipeline:**
- Husky/Commitlint hooks configured for commit verification.

## Environment Configuration

**Required env vars:**
- None required (all configurations are statically loaded from `_config.js`).

**Secrets location:**
- None (no sensitive credentials or keys needed).

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-07-29*
 