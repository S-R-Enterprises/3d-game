# Codebase Concerns

**Analysis Date:** 2026-07-29

## Tech Debt

**Hardcoded Port in Playwright Config:**
- Issue: The application's server port is hardcoded to `3000` via `_config.js` and referenced in `tests/browsers.test.js`. If port 3000 is occupied during development or testing, Vite automatically starts on another port (e.g. 3001), causing Playwright tests to fail.
- Files: `_config.js`, `tests/browsers.test.js`, `playwright.config.js`
- Impact: Flaky or failing local and CI test runs.
- Fix approach: Configure Playwright to dynamically launch the Vite dev server using the `webServer` option in `playwright.config.js`, passing the dynamic server URL.

**Pause Statement in Automated Test:**
- Issue: `await page.pause()` is hardcoded inside the browser tests.
- Files: `tests/browsers.test.js:11`
- Impact: If tests are executed in a headless CI pipeline, the test will halt and hang indefinitely, causing the CI runner to time out.
- Fix approach: Remove `await page.pause()` or conditionalize it using environment flags (e.g. `if (!process.env.CI) { await page.pause() }`).

## Security Considerations

**Vercel Analytics in Local Development:**
- Risk: Loading Vercel Web Analytics scripts in local environments.
- Files: `index.html:86`
- Current mitigation: None. The script is deferred but loaded unconditionally.
- Recommendations: Only inject or execute the Vercel script when running in production (e.g., using Vite build injection filters or environment flag checks).

## Performance Bottlenecks

**Large 3D Models (.glb):**
- Problem: The main scene asset `public/models/scene.glb` is 16.0 MB, `public/models/chicken.glb` is 11.4 MB, and `public/models/coin.glb` is 8.9 MB.
- Files: `public/models/*`
- Cause: Uncompressed geometry data and embedded high-resolution textures.
- Improvement path: Compress the models using Draco compression (`gltf-pipeline -i scene.glb -o scene-opt.glb -d`) or run them through Meshopt/Ktx2 texture compression to reduce initial load times on mobile devices.

## Fragile Areas

**Collider Syncing:**
- Files: `public/models/collision-world.glb` and `public/models/scene.glb`
- Why fragile: The physics engine loads collision boundaries from a separate model (`collision-world.glb`). If visual layout elements are added, moved, or deleted in `scene.glb`, they will not have collision physics unless the collider model is manually updated and exported to match.
- Safe modification: Any modification to the island geometry must involve updating both files in Blender/3D editors and re-exporting.
- Test coverage: Gaps (no automated tests verify that colliders match visual meshes).

---

*Concerns audit: 2026-07-29*
 
