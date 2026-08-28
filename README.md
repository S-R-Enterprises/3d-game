# 🕹️ 2.5D Pixel Art Three.js Interactive Resume

<div align="center">

[![Three.js](https://img.shields.io/badge/Three.js-r172-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4.9-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-v1.46.0-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 🎨 Preview

### 🖥️ Desktop View
![Desktop Preview](./readme.webp)

### 📱 Mobile View
![Mobile Preview](./readme2.webp)

---

## 📖 Project Introduction

This project is an interactive **2.5D pixel-style resume website** built with **Three.js**. It gamifies the presentation of personal information, projects, skills, and hobbies within a 3D pixelated island. Users control a pixel character to explore the scene, triggering interactive dialogs and collectible objects. Developed with a mobile-first approach, it features optimized touchscreen controls, responsive interfaces, and fast asset preloading.

---

## ✨ Key Features

*   🕹️ **2.5D Pixel Art Scene**: Combines 3D rendering with retro pixel art material textures, supporting free rotation and perspective adjustment.
*   🏃 **Character Control**: Control the pixel character's movement and jumping using WASD or arrow keys, complete with action animations (standing, running, sitting, etc.).
*   💬 **Dynamic Dialogues**: Floating prompts (CSS2DRenderer) automatically appear when approaching specific landmarks in the scene (bed, workbench, weapon rack, well, etc.). Pressing the F key initiates a typewriter-style interactive dialogue using `typed.js`.
*   🌗 **Day-Night Shift**: Supports one-click switching between day and night modes, adjusting light sources (hemisphere light, ambient light, directional light), shadows, and skybox sky textures in real-time.
*   🌐 **Multilingual Support**: Perfectly supports one-click switching between languages. All text guides, dialogue content, and instructions are localized.
*   📱 **Mobile-First Optimization**: Layout refactoring for touch screen devices like mobile phones, optimizing button sizes and gesture interactions, and using the `tweakpane` debugging panel for multi-platform detection.
*   ⚙️ **Physics & Collision**: Utilizes `three/addons/math/Octree` and `Capsule` for efficient physical collision detection of 3D scene geometries, preventing characters from clipping through walls or falling off the map.

---

## 🛠️ Tech Stack

*   **3D Engine**: [Three.js](https://threejs.org/) (r172) - Core 3D rendering and scene construction.
*   **Physics Collision**: Three.js Addons `Octree` & `Capsule` - Scene collider judgment.
*   **Build Tool**: [Vite](https://vitejs.dev/) (v5.4.0) - Frontend builder for extremely fast cold starts and hot updates.
*   **Animation Library**: [GSAP](https://greensock.com/gsap/) (v3.12.5) - For smooth camera transitions and UI animations.
*   **Styling Library**: [TailwindCSS](https://tailwindcss.com/) (v3.4.9) & [SASS](https://sass-lang.com/) (v1.77.8) - Atomic CSS and pixel art border animations.
*   **Testing Framework**: [Playwright](https://playwright.dev/) (v1.46.0) - Automated end-to-end (E2E) browser rendering testing.
*   **Other Components**: [typed.js](https://mattboldt.github.io/typed.js/) (typewriter effect), [tweakpane](https://cocopon.github.io/tweakpane/) (development debugging panel), [partytown](https://partytown.builder.io/) (multi-thread optimization).

---

## 📂 Architecture & Structure

The project is built on the **Singleton-based Modular Game Loop Pattern**. Its core architecture is as follows:

```
[project-root]/
├── .planning/             # GSD planning and project context design blueprints
├── public/                # Static assets (3D models .glb, material textures, action icons)
│   ├── models/            # character-soldier.glb, scene.glb, collision-world.glb
│   └── textures/          # day.webp, night.webp, noise/
├── src/                   # Source code
│   ├── css/ & scss/       # global.css & pixel style SCSS
│   ├── shaders/           # Custom GLSL Shaders for lava, ocean, and portal
│   └── js/
│       ├── index.js       # Entry file, mounts canvas, initializes guides and dialogues
│       ├── experience.js  # Core singleton (Experience), coordinates renderer, camera, time, and resize
│       ├── camera.js      # Perspective camera, includes OrbitControls
│       ├── renderer.js    # WebGL renderer, manages rendering passes and post-processing
│       ├── i18n/          # translations.js language dictionary, i18nManager.js manager
│       ├── utils/         # time.js (Tick update loop), resources.js (Resource preloading), sizes.js
│       └── world/         # 3D entities (hero.js, world.js, environment.js, eventPointManager.js)
```

---

## 🕹️ Game Controls

| Action | Function |
|:---:|---|
| **W / A / S / D** <br> or **↑ / ↓ / ← / →** | Move the character around the island |
| **SPACE** | Make the character jump |
| **F** | Interact with target area (Dialogues) |
| **R** | Reset character position if stuck |

### 📍 Interactive Zones
*   **Rest Area (`bed_area`)**: Personal resume introduction and background.
*   **Collection Area (`beer_area`)**: Collectibles and personal homepage navigation.
*   **Skills Area (`workbench_area`) / (`kitchen_area`)**: Mastered tech stack, frontend, and 3D graphics knowledge points.
*   **Projects Area (`weapon_area`)**: Practical project experience and weapon display.
*   **Life Area (`dining_area`)**: Hobbies and daily life sharing.
*   **Contact Area (`well_area`)**: WeChat, Email, and community contact methods.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/) recommended

### 1. Clone & Install
```bash
git clone https://github.com/doinel1a/vite-three-js.git
cd island
yarn install
```

### 2. Local Development Server
```bash
yarn dev
```
After running, visit: `http://localhost:3000`.
*Tip: Add `#debug` to the end of the URL to open the Tweakpane real-time scene debugging panel.*

### 3. Build for Production
```bash
yarn build
```
The generated files will be located in the `dist/` directory and can be deployed directly to any static server (e.g., Vercel, GitHub Pages, Netlify, etc.).

### 4. Run E2E Tests
```bash
# Run Chrome browser tests
yarn test:chrome

# Run Firefox browser tests
yarn test:firefox
```

---

## 🤝 Contributing

Any form of contribution and feedback is welcome!

1. Fork this repository and create a new branch (`feature/amazing-feature`).
2. Commit your changes, following the [Conventional Commits](https://www.conventionalcommits.org/) specification for your Commit Message.
3. Submit a Pull Request, wait for Review and merging.

---

## 📝 License

This project is open source under the **MIT License**.

---

> 💡 **Credits**
> - Scene models are primarily sourced from [Kenney.nl](https://kenney.nl/)'s public assets and Hyper3D AI generation.
> - Some illustrations and 2D texture assets were generated by GPT-4o.
> - This project is inspired by pixel art RPG games and interactive creative resumes.
 