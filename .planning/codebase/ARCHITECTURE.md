<!-- refreshed: 2026-07-29 -->
# Architecture

**Analysis Date:** 2026-07-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                       Entry Point                           │
│                   `src/js/index.js`                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Experience Orchestrator                  │
│                 `src/js/experience.js`                      │
├──────────────────┬──────────────────┬───────────────────────┤
│    Camera        │    Renderer      │      Resources        │
│  `src/js/camera.js`│`src/js/renderer.js`│`src/js/utils/resources.js`│
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                         World Container                      │
│                     `src/js/world/world.js`                 │
├──────────────────┬──────────────────┬───────────────────────┤
│    Hero (Player) │   Environment    │      Area / Shaders   │
│  `src/js/world/` │`src/js/world/`   │ `src/js/world/lava.js`│
│    `hero.js`     │ `environment.js` │ `src/js/world/ocean.js`│
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Interaction & UI                       │
│    `src/js/world/eventPointManager.js` -> CSS2D Renderer    │
│  `src/js/world/introDialog.js` <-> `src/js/i18n/i18nManager.js`│
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `Experience` | Main Singleton instance representing the application core, coordinating tick updates, resizing, and scene-wide settings. | `src/js/experience.js` |
| `Camera` | Handles the viewport camera (Perspective/Orthographic camera) and OrbitControls setup. | `src/js/camera.js` |
| `Renderer` | Configures the Three.js WebGLRenderer, post-processing filters, and viewport resize behaviors. | `src/js/renderer.js` |
| `Resources` | Preloads all 3D models (`.glb`), textures, cubemaps, and audio assets before initializing the world. | `src/js/utils/resources.js` |
| `World` | Core orchestrator for scene-specific contents. Initializes environment, player, area mesh, ocean, lava, shaders, and event triggers. | `src/js/world/world.js` |
| `Hero` | Manages player controls, physics octree-based collision, bounding boxes, character animations, key bindings, and camera tracking. | `src/js/world/hero.js` |
| `Environment` | Sets up lighting (ambient, directional, spotlight), shadows, day/night transitions, and skybox/environment mapping. | `src/js/world/environment.js` |
| `EventPointManager` | Manages 3D collision triggers in space, showing user prompts (using `CSS2DRenderer`) when near objects like the workbench, weapon rack, dining table, etc. | `src/js/world/eventPointManager.js` |
| `IntroDialog` | Manages dialogue system UI, using `typed.js` to print out localized messages about the developer's experience, bio, and project info. | `src/js/world/introDialog.js` |
| `I18nManager` | Handles localization configuration (Chinese & English) and translates keys across components. | `src/js/i18n/i18nManager.js` |

## Pattern Overview

**Overall:** **Singleton-based Modular Game Loop Pattern** (popularized by Bruno Simon's Three.js Journey).

**Key Characteristics:**
- **Central Singleton (`Experience`):** Accessed globally or via constructor instantiation across classes to avoid prop-drilling core resources like scene, camera, renderer, time, etc.
- **Event-Driven Lifecycle:** Modules inherit from `EventEmitter` (`src/js/utils/event-emitter.js`) and communicate asynchronously via triggers (e.g., `sizes` emits `resize`, `time` emits `tick`, `resources` emits `ready`).
- **Separation of Concerns:** Core rendering setup is strictly isolated from scene objects, shaders, interaction elements, and dialogue overlays.

## Layers

**Orchestration Layer:**
- Purpose: Configures and manages the lifecycle of the core components.
- Location: `src/js/experience.js`, `src/js/camera.js`, `src/js/renderer.js`
- Contains: Global parameters, render loops, resize handlers.
- Depends on: Three.js core classes, sizes, time, resources.
- Used by: `src/js/index.js` (main entry point).

**World & Asset Layer:**
- Purpose: Manages 3D object instantiation, materials, animations, and physics colliders.
- Location: `src/js/world/`
- Contains: `world.js`, `hero.js`, `environment.js`, `lava.js`, `ocean.js`, `area.js`
- Depends on: Preloaded resources, Cannon.js (or Octree colliders), custom shaders.
- Used by: `Experience` class once assets are loaded.

**Interaction & Interface Layer:**
- Purpose: Tracks user input, displays UI overlays, switches languages, and shows action prompts.
- Location: `src/js/world/eventPointManager.js`, `src/js/world/introDialog.js`, `src/js/components/languageSwitcher.js`, `src/js/i18n/`
- Contains: DOM bindings, EventListeners, Typed.js transitions, HTML buttons.
- Depends on: Browser DOM API, window event listeners.
- Used by: `World` class and direct document layout.

## Data Flow

### Primary Request Path

1. **Instantiation:** `src/js/index.js` listens to page `load` and instantiates `Experience` on `<canvas id="canvas">`.
2. **Preloading:** `Experience` instantiates `Resources` with the resource list `src/js/sources.js`. The loading progress updates DOM loading bar percentages.
3. **World Setup:** Once finished, `Resources` triggers the `ready` event. `World` reacts by spawning the environment, hero character, shaders, and event triggers.
4. **Game Loop:** The `Time` module updates on every requestAnimationFrame (`tick`), causing `Experience` to update the hero (which polls keyboard/pointer movements, updates octree physics positions), update shaders, and render the scene.

### Area Dialogue Interaction Flow

1. The player walks near the workbench area (`workbench_area`).
2. `EventPointManager` updates and detects the distance between `Hero` and the workbench coordinate is below the threshold radius.
3. It spawns a CSS2D notification: "按 F 键查看技能区信息" / "Press F to view skills".
4. The user presses `F`. The interaction callback is triggered, which invokes `IntroDialog.showAreaContent('workbench_area')`.
5. `IntroDialog` reads the translation key from `I18nManager`, wipes the prior typed text, and triggers `typed.js` to animate the new dialog content onto the screen.

**State Management:**
- Application state (e.g. current language, day/night status, and guide completion) is kept in memory inside their respective managers (`I18nManager`, `DayNightManager`, etc.) and persisted to local storage (e.g., `localStorage.getItem('hasCompletedGuide')`).

## Key Abstractions

**EventEmitter:**
- Purpose: Provides custom publish/subscribe messaging capabilities.
- Examples: `src/js/utils/event-emitter.js`
- Pattern: Observer pattern.

**EventPoint:**
- Purpose: Represents a coordinate trigger in 3D space checking distance and rendering action labels.
- Examples: `src/js/world/eventPoint.js`, `src/js/world/eventPointCSS2D.js`
- Pattern: Collision detection sphere.

## Entry Points

**Main Entry:**
- Location: `src/js/index.js`
- Triggers: DOM Window 'load' event.
- Responsibilities: Queries the canvas, instantiates the main `Experience`, loads the intro dialog and game guide.

## Architectural Constraints

- **Single Event Loop:** All updates occur in `Experience.update()` triggered by the `Time` tick listener. Avoid setting separate intervals/timeouts for game loop tasks.
- **WebGL Context:** Asset loading, disposal, and rendering must follow Three.js guidelines to prevent GPU memory leaks.
- **Global Coordinates:** Collision vectors, target offsets, and camera coordinates are absolute in Three.js space. Model geometry changes must match target colliders in `sources.js`.

---

*Architecture analysis: 2026-07-29*
