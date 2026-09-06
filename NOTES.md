# The Multiverse Portfolio

> Before changing this repository, read [`context.md`](./context.md). It contains the persistent project requirements, user constraints, architecture decisions, and verification contract for future sessions.

This repository must remain the only application path modified by portfolio work. Do not commit or push unless the user explicitly requests it.

## Current integration decision

Idea-Board's nested server remains on internal port `3000`. The tracked `scripts/start-idea-board.mjs` launcher exposes it through a public proxy on port `5000`, which is the URL used by both OS flavors.

Theme #1 defaults to Windows 95. Use the global OS Flavor switcher to change to Classic Mac System 7. The selected flavor persists in browser `localStorage` under `retro_os_flavor`.

## Unified header layout

`src/components/Header.jsx` owns the fixed 32px header, Mac menus, branding, OS flavor switcher, dimension switcher, Recruiter Quick View control, and stable-width live clock. The header root remains mounted while desktop and dialog regions rerender.

Windows work area: `top: 32px`, `bottom: 28px`.

Mac work area: `top: 32px`, `bottom: 0`.

Window dragging is clamped below the fixed header. Keep the header root outside OS-specific desktop markup when extending the UI.

## Theme #2: Interactive 3D Desk

The `3D Desk` dimension is implemented in `src/themes/ThreeDDesk.jsx` using Three.js and native `OrbitControls`. It mounts beneath the persistent 32px Header and builds the room, desk, monitor, career corkboard, profile notebook, printer, and contact mug procedurally.

Select an object to focus the camera and open its detail overlay:

- Monitor: launches Idea-Board in an iframe at `http://localhost:5000`.
- Corkboard: displays the career timeline from `src/data/career.json`.
- Notebook: displays education, awards, and skills from `src/data/profile.json`.
- Printer: triggers the placeholder CV download and shows a download control.
- Mug: displays email, GitHub, and LinkedIn links.

Use `Reset View` to return to the overview camera. Leaving the dimension explicitly disposes the renderer, controls, scene resources, listeners, and animation frame before another theme is rendered.

## Theme #3: Pixel RPG Overworld

The `Pixel RPG` dimension is implemented in `src/themes/PixelRPG.jsx` with a procedural HTML5 Canvas map called Nora's Realm. It does not load external image assets. Grass, water, paths, buildings, trees, fences, the player, and the courier are drawn from pixel primitives.

Controls:

- WASD or Arrow keys: move in four directions.
- SPACE or E: interact with the nearest marked object.
- Click or tap the map: walk toward the selected point.
- On-screen D-pad and `A / Action`: touch-friendly movement and interaction.

Explore the Grand Archives for career history, the Pixel Arcade for Idea-Board, the Wizard's Academy for profile data, the Town Courier for the CV download, and the Communication Beacon outside Nora's Cottage for contact links. The game loop and all keyboard, pointer, and touch listeners are disposed when changing dimensions.

## Theme #4: Watercolor Sketchbook

The `Sketchbook` dimension is implemented in `src/themes/WatercolorSketchbook.jsx`. It presents the portfolio as an open field journal on a warm drafting table, using CSS textures, watercolor washes, hand-drawn cards, bookmark ribbons, and responsive paper spreads.

The four spreads are:

- Story & Bio: profile, biography, education, honors, skills, and CV download.
- Career Notes: all records from `src/data/career.json`, including the Micron 87% metric.
- The Lab: embedded Idea-Board plus a 200×200 watercolor doodler.
- Postcard: direct email, GitHub, and LinkedIn links.

Use the bookmark ribbons or Prev/Next controls to navigate. The theme removes its delegated controls and doodler/page timers when switching dimensions.
## Theme #5: Neural Core

The `Neural Core` dimension is implemented in `src/themes/NeuralCore.jsx` as an open orbital node map floating in a deep obsidian void. A Canvas-rendered rotating icosahedron and drifting data particles provide the ambient field; four semantic satellite buttons expose focused channels for identity, missions, Idea-Board, and data uplink.

Each channel opens one spacious frosted holographic slate and returns to the ambient orbit with `[ ⨉ RETURN TO ORBIT ]`. All content uses the verified profile, career, project, and CV data. The component preserves native Web Audio hover/click effects, keyboard operation, reduced-motion behavior, and explicit disposal of listeners, animation frames, timers, and audio context.
## Theme #6: Megastructure Elevator

The `Megastructure` dimension is implemented in `src/themes/Megastructure.jsx` as an internal full-page vertical journey beneath the fixed Header. Four viewport-height floors form the elevator shaft: Operator Cockpit, Mission Archives, Neural Simulation Bay, and Data Extraction Port.

The theme owns a Canvas parallax engine for drifting particles, neon conduits, and a perspective grid. Its scroll container updates the elevator level HUD and depth readout. Floor content is data-driven from the verified profile, career, project, contact, and CV sources. The theme removes its scroll, resize, click, animation, and download timers during disposal.
## Prerequisites

- Node.js 20 or newer
- npm
- Git

## First-time setup

From the repository root:

```bash
git clone https://github.com/NoratikaChung/Idea-Board.git apps/idea-board
npm install
npm install --prefix apps/idea-board
```

The `apps/` directory is intentionally ignored by the portfolio repository because Idea-Board is a nested Git repository.

## Run the full environment

From the repository root:

```bash
npm run start:all
```

This starts both applications:

- Portfolio: <http://localhost:5173>
- Idea-Board public proxy: <http://localhost:5000>
- Idea-Board internal upstream: <http://localhost:3000>
 
Theme #1 starts in Windows 95 unless a previous OS preference is stored. Switching to System 7 or back to Windows 95 does not reload the page.
Press `Ctrl+C` to stop both development servers.

## Run either application separately

Portfolio only:

```bash
npm run dev
```

Idea-Board only:

```bash
npm run idea-board
```

## Build the portfolio

```bash
npm run build
```

The production output is written to `dist/`, which is ignored by Git.
