# Coding Conventions

**Analysis Date:** 2026-07-29

## Naming Patterns

**Files:**
- JavaScript files: `camelCase.js` (e.g., `eventPointManager.js`, `languageSwitcher.js`, `translations.js`).
- Stylesheet files: `kebab-case.scss` (e.g., `pixel-text.scss`).
- Shader files: `lowerCase.glsl` (e.g., `vertex.glsl`, `fragment.glsl`).

**Classes:**
- PascalCase (e.g., `Experience`, `Hero`, `IntroDialog`, `I18nManager`).

**Functions:**
- camelCase (e.g., `startIntroContentLoop`, `setupEventPoints`, `initCSS2DRenderer`). Use verbs as prefixes indicating actions.

**Variables:**
- camelCase (e.g., `dialogContainer`, `lastInteractionTime`, `cameraOffset`).
- Constants: UPPER_SNAKE_CASE (e.g., `GRAVITY`).

## Code Style

**Formatting:**
- Semi-colon-free style (lines end without semicolons).
- Single quotes for strings (e.g. `'ready'`, `'click'`).
- 2-space indentation.
- Enforced automatically by Prettier (v3.3.3) and ESLint rules.

**Linting:**
- Anthony Fu's ESLint config (`@antfu/eslint-config`) is utilized to maintain styling consistency across the codebase.
- Ignored paths are configured under `ignores` in `eslint.config.js`.

## Import Organization

**Order:**
1. External package imports (e.g., `import * as THREE from 'three'`, `import gsap from 'gsap'`).
2. Standard Library/Node imports (e.g., `import path from 'node:path'`).
3. Local class and component imports (e.g., `import Experience from '../experience.js'`, `import Hero from './hero.js'`).
4. Stylesheet imports at the application entry point (e.g., `import '../css/global.css'`).

**Path Aliases:**
- Standard relative imports (`./` or `../`) are used; path aliases like `@/` are not configured.

## Error Handling

**Patterns:**
- Console warnings (`console.warn`) or checks to verify the existence of objects/animations before interacting (e.g., `if (this.animation.clips.length === 0)` or `if (canvas) { new Three(canvas) }`).
- Fallbacks for unconfigured/unrecognized elements (e.g., `if (!content) { console.warn(...) }`).

## Logging

**Framework:**
- Native console outputs (`console.log`, `console.warn`, `console.error`) are used during initialization and error handling.

## Comments

**When to Comment:**
- Crucial equations (e.g. coordinates or physics equations) and complex shader operations.
- JSDoc-style comments for class methods, specifying parameters and purpose.
- Dual Chinese & English commenting is seen across key system modules (e.g. `// 初始化对话框管理器`, `// Setup`).

---

*Convention analysis: 2026-07-29*
 