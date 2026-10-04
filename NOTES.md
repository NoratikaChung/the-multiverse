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

Both OS window types resize from their edges and corners; the lower-right handle also supports arrow-key resizing. Maximize fills the work area below the header and above the Windows taskbar.

The embedded Idea-Board iframe fills the remaining window body in both OS flavors.

Selected dimensions use blue active styling and `aria-pressed`, without an `(Active)` label suffix.

## Theme #2: Pixel RPG Overworld

The `Pixel RPG` dimension is implemented in `src/themes/PixelRPG.jsx` with a procedural HTML5 Canvas map called Nora's Realm. It does not load external image assets. Grass, water, paths, buildings, trees, fences, the player, and the courier are drawn from pixel primitives.

Controls:

- Focus the map, then use WASD or Arrow keys to move and SPACE/E to enter or inspect nearby objects.
- Click or tap the map to walk toward a destination; routes avoid solid buildings, walls, and furniture.
- Open the Location & object guide to walk to a doorway or room object, then activate its enabled Enter/Inspect button. Walking does not open content automatically.
- Hold the on-screen D-pad to move, or activate its buttons with the keyboard to walk one tile.
- Exit room walks back to the doorway if needed; activate it again when nearby to return to town.

Enter the Grand Archives to inspect career shelves, the Pixel Arcade to play Idea-Board, the Wizard's Academy to explore education and credentials, and Nora's Cottage for bio, contact, skills, and CV objects. The protagonist is a black-haired, brown-eyed woman in a cream blouse and teal outfit. Text uses clean, high-contrast fonts; the mobile map remains clear of HUD controls. Courier CV and outdoor contact interactions remain available. Theme switching disposes animation, maps, observers, overlays, and listeners.

## Theme #3: Watercolor Sketchbook

The `Sketchbook` dimension is implemented in `src/themes/WatercolorSketchbook.jsx`. It presents the portfolio as an open field journal on a warm drafting table, using CSS textures, watercolor washes, hand-drawn cards, bookmark ribbons, and responsive paper spreads.

The four spreads are:

- Story & Bio: profile, biography, education, honors, skills, and CV download.
- Career Notes: all records from `src/data/career.json`, including the Micron 87% metric.
- The Lab: embedded Idea-Board plus a 200×200 watercolor doodler.
- Postcard: direct email, GitHub, and LinkedIn links.

Use the bookmark ribbons or Prev/Next controls to navigate. The theme removes its delegated controls and doodler/page timers when switching dimensions.

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
