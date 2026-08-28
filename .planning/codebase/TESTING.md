# Testing Patterns

**Analysis Date:** 2026-07-29

## Test Framework

**Runner:**
- Playwright (v1.46.0)
- Config: `playwright.config.js`

**Assertion Library:**
- Playwright assertions (e.g. `expect(locator).toHaveText()`)

**Run Commands:**
```bash
yarn test:chrome       # Run Chrome E2E tests in headed mode
yarn test:firefox      # Run Firefox E2E tests in headed mode
yarn test:safari       # Run WebKit (Safari) E2E tests in headed mode
```

## Test File Organization

**Location:**
- Located in `tests/` folder in the project root.

**Naming:**
- Named using `[feature].test.js` pattern (e.g., `tests/browsers.test.js`).

**Structure:**
```
[project-root]/
└── tests/
    └── browsers.test.js   # Main E2E browser smoke test
```

## Test Structure

**Suite Organization:**
```javascript
import { test } from '@playwright/test'
import _config from '../_config'

const HOST = _config.server.host
const PORT = _config.server.port

test('Test description', async ({ page }) => {
  await page.goto(`http://${HOST}:${PORT}`)
  // Test code here...
})
```

## Mocking

- No mock configurations are currently defined in the E2E test suite.

## Fixtures and Factories

- No test data factories or database fixtures exist (fully static application).

## Coverage

- No coverage tools are configured.

## Test Types

**E2E / Browser Smoke Tests:**
- Playwright is used to load the index page at the development server's address (`http://localhost:3000`) and test page load success.

---

*Testing analysis: 2026-07-29*
 
