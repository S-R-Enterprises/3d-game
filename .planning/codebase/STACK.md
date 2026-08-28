# Technology Stack

**Analysis Date:** 2026-07-29

## Languages

**Primary:**
- JavaScript (ES6+) - Used for application logic, Three.js orchestration, interaction logic, and physics integration.

**Secondary:**
- HTML5 - Used for the main skeleton and structural DOM layers in `index.html`.
- CSS/SCSS - Used for custom style definitions, layout styling, and utility classes in `src/css` and `src/scss`.

## Runtime

**Environment:**
- Node.js (Vite development and build environment)

**Package Manager:**
- Yarn (v1.22.22, lockfile present at `yarn.lock`)

## Frameworks

**Core:**
- Three.js (v0.172.0) - Core 3D rendering library.
- Vite (v5.4.0) - Build tool and development server.
- TailwindCSS (v3.4.9) - Utility-first styling framework.

**Testing:**
- Playwright (v1.46.0) - End-to-end automation and browser testing framework.

**Build/Dev:**
- ESLint (v9.22.0) - Linting utility.
- Prettier (v3.3.3) - Code formatter.
- PostCSS (v8.4.41) - CSS transformation runner.

## Key Dependencies

**Critical:**
- `three` (^0.172.0) - Handles all 3D scene graph, cameras, renderers, lighting, and model loading.
- `cannon` (^0.6.2) - Physics engine to handle bounding boxes, collision detection, and dynamics.
- `gsap` (^3.12.5) - GreenSock Animation Platform for smooth, programmatic camera moves and UI transitions.
- `typed.js` (^2.1.0) - Typing animation library for dialogue text.

**Infrastructure:**
- `@builder.io/partytown` (^0.10.2) - Runs third-party scripts off the main thread (configured via `vite.config.js`).
- `vite-plugin-glsl` (^1.3.0) - Vite plugin to import and process GLSL shader files (`.glsl`, `.vert`, `.frag`).

## Configuration

**Environment:**
- Configured via `_config.js` containing host (`localhost`) and port (`3000`).

**Build:**
- `vite.config.js` - Incorporates `@vitejs/plugin-legacy`, `vite-plugin-glsl`, and `@builder.io/partytown`.
- `tailwind.config.cjs` - Configures Tailwind CSS styling parameters.
- `postcss.config.cjs` - Configures PostCSS plugins (Autoprefixer, CSSNano, PostCSS Import).
- `eslint.config.js` - Configuration for linting rules.

## Platform Requirements

**Development:**
- Node.js and Yarn installed.

**Production:**
- Built application is compiled into static assets via `yarn build` (`vite build`) and is ready to deploy to static hosts like Vercel or GitHub Pages.

---

*Stack analysis: 2026-07-29*
 
