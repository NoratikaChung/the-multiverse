# The Multiverse Repository Context

> **Required first read:** Any human, agent, automation, or AI working in this repository MUST read this file before inspecting or changing code. Keep this file current as implementation decisions, runtime contracts, verification evidence, and user instructions change.

## Scope and repository boundary

- The only permitted work area is this repository directory: `the-multiverse/`.
- Do not read, edit, commit, or push the workspace repository for application work.
- Do not modify sibling application repositories.
- The nested Idea-Board checkout lives at `apps/idea-board/` and is intentionally ignored by the portfolio repository.
- `apps/idea-board/` is a separate nested Git repository cloned from `https://github.com/NoratikaChung/Idea-Board.git`.
- The portfolio repository remote is `https://github.com/NoratikaChung/the-multiverse.git`.

## User operating instructions

- Do not commit or push changes unless the user explicitly asks for it in the current conversation.
- After completing requested changes and verification, stop and let the user inspect the changes.
- Never commit to the workspace repository.
- Keep all changes inside `the-multiverse/`.
- Do not invent personal profile data. Use the supplied verified Noratika Chung data or later user-provided updates.
- Use evidence-first engineering: inspect the current code, reuse established behavior where appropriate, make the smallest complete change, and verify behavior by running the application rather than reasoning only.
- Do not leave TODO, FIXME, fake fallback, empty stub, or misleading scaffold code.
- For non-trivial changes, build and run the relevant application and report exact verification results and limitations.
- Maintain this context file as part of every future change so another session can resume accurately.

## Product objective

The Multiverse is a multi-theme developer portfolio with an interactive project showcase. Stage 1 uses a Vite vanilla JavaScript application and a nested Idea-Board application.

- Pixel RPG is the default landing dimension. Theme #1 supports two retro operating-system flavors: Windows 95/98 and the preserved Classic Macintosh System 7.5.3 / Platinum experience. Theme #2 is the interactive Three.js developer desk, Theme #3 is the procedural 2D Pixel RPG overworld, Theme #4 is the Watercolor Sketchbook, Theme #5 is the functional Neural Core orbital node map, and Theme #6 is the Megastructure Elevator vertical parallax journey.

The OS flavor is persisted in `localStorage` under `retro_os_flavor`. A first visit defaults to `win95`; switching between `win95` and `mac` happens without a page reload.

## Runtime and package commands

Run commands from `the-multiverse/`:

```bash
npm install
npm install --prefix apps/idea-board
npm run dev
npm run idea-board
npm run start:all
npm run build
```

Root scripts:

- `dev`: starts Vite on port `5173`.
- `build`: creates the Vite production build in ignored `dist/`.
- `idea-board`: runs `scripts/start-idea-board.mjs`.
- `start:all`: starts the portfolio and Idea-Board through `concurrently`.

Verified service URLs:

- Portfolio: `http://localhost:5173`
- Idea-Board public proxy: `http://localhost:5000`
- Idea-Board internal upstream: `http://localhost:3000`

### Port decision

The latest dual-OS requirement explicitly changed the public Idea-Board URL to port `5000`. The upstream nested server remains unchanged on port `3000`; `scripts/start-idea-board.mjs` starts it and proxies the complete application and API through port `5000`. Both OS iframe windows use `http://localhost:5000`.

## Current architecture

- `index.html`: Vite document shell.
- `src/main.js`: localStorage OS state, stable shell/viewport rendering, data-driven windows, Windows 95 and Mac desktops, taskbars/menus, drag/focus behavior, dimension switching, and recruiter view.
- `src/styles.css`: Windows 95 and Classic Mac presentation, responsive behavior, beveled frames, wallpaper, and scrollbar styling.
- `src/data/profile.json`: personal profile, education, awards, certifications, and skills.
- `src/data/career.json`: career and project experience entries.
- `src/data/projects.json`: interactive project metadata, with Idea-Board first, local URL on port `5000`, and production URL on `ideaboard.noratikachung.com`.
- `scripts/start-idea-board.mjs`: starts the ignored Idea-Board checkout on port `3000` and proxies it to public port `5000`.
- `src/themes/ThreeDDesk.jsx`: framework-free Three.js scene with OrbitControls, procedural desk objects, raycasting, data-driven inspection overlays, camera focus transitions, and explicit disposal.
- `three`: runtime dependency used by Theme #2; the 3D theme is mounted only for `state.theme === 'desk'` and disposed before leaving it.
- `src/themes/PixelRPG.jsx`: procedural Canvas 2D overworld with tile collision, keyboard/pointer/touch controls, NPC and building interactions, typewriter dialogue, location banners, data-driven overlays, and explicit disposal.
- `src/themes/WatercolorSketchbook.jsx`: DOM-based watercolor sketchbook with four data-driven spreads, bookmark and Prev/Next navigation, Idea-Board iframe, CV download, watercolor doodler, page-turn animation, and explicit disposal.
- `src/themes/NeuralCore.jsx`: framework-free orbital Canvas node map with rotating icosahedron, ambient particles, semantic satellite buttons, focused profile/career/Idea-Board/CV slates, native Web Audio, reduced-motion handling, and explicit disposal.
- `src/themes/Megastructure.jsx`: internal scroll-owned four-floor elevator journey with Canvas particle/conduit/perspective parallax, level HUD, data-driven mission archives, full-width Idea-Board chamber, contact relays, CV extraction, reduced-motion handling, and explicit disposal.
- `vite.config.js`: intentional Three.js vendor chunking and a 600 kB warning threshold for the existing Three.js runtime payload.
- `public/resume-placeholder.pdf`: temporary download asset until the user supplies a real CV.
- `public/screenshots/project-placeholder.svg`: legacy career-art asset; remove or stop using it when no longer needed.
- `NOTES.md`: setup and launch instructions for developers.
- `context.md`: this persistent instruction and project-state file; future agents must read it first.
- `.gitignore`: ignores `node_modules/`, `dist/`, environment files, and `apps/`.
- `src/data/project-url.js`: shared Vite environment resolver selecting each project's local or production URL.
- `vercel.json`: Vite SPA fallback rewrite for direct portfolio routes on Vercel.
- `DEPLOYMENT.md`: permanent Vercel architecture standards for backend, frontend, domain, and WebSocket projects.

## User-supplied verified profile data

The current requested values are:

- Name: Noratika Chung
- Preferred name: Nora
- Title: Full-Stack Software Engineer
- Location: Kuala Lumpur, Malaysia
- Email: `cnoratika@gmail.com`
- GitHub: `https://github.com/NoratikaChung`
- LinkedIn: `https://www.linkedin.com/in/noratika-chung-8b2570219/`
- Degree: BSc Computer Science in Software Engineering (Hons.)
- Institution: University of Science Malaysia (USM)
- CGPA: 3.46
- Education period: Oct 2021 - Sept 2025
- Awards: Gold Medal Award – USM PIXEL 2025; Gold Medal – VIC 2024; Dean's List Awards; Yeoh Fung Kee & Wong Yew Nyong USM Scholarship.
- Certifications: AWS Certified AI Practitioner; Microsoft Azure AI Fundamentals; Microsoft Azure Developer Associate.
- Skill groups: frontend, backend, cloudDevOps, database, and aiMachineLearning as defined in `src/data/profile.json`.

Career entries:

1. K3 Advisory Group — Software Engineer — Dec 2025 - Present.
2. Micron Technology — IT Automation Engineer Intern — Mar 2024 - Sept 2024; includes the 87% server monitoring reduction metric.
3. Final Year Project (USM) — MoodMatch — 2024 - 2025; Gold Medal winner at USM PIXEL 2025.
4. Microsoft Certificate Bootcamp Capstone — QuickAid Azure — 2024.

## Dual OS requirements

### Windows 95 default

- Theme #1 defaults to Windows 95/98 when `retro_os_flavor` is absent or invalid.
- Use solid `#008080` teal wallpaper and MS Sans Serif/Tahoma-style labels.
- Desktop icons: My Computer, Recycle Bin, Idea-Board.exe, About_Nora.txt, Resume.pdf, and Boot Macintosh System 7.exe.
- Bottom taskbar: raised Start button with Windows flag, active window buttons, inset speaker/clock tray.
- Start menu: Programs, Documents, Switch to Mac OS, Download CV, and Shut Down.
- Windows must support drag, focus promotion, minimize, maximize/restore, close, title-bar menus, and classic scrollbar treatment.
- Idea-Board.exe loads the public proxy at `http://localhost:5000`.

### OS switching

- Global controls show Windows 95 and System 7 flavor buttons beside the dimension switcher.
- Windows desktop shortcut boots to Macintosh.
- Macintosh desktop shortcut and Special menu boot to Windows 95.
- Switching calls `localStorage.setItem('retro_os_flavor', flavor)` and re-renders without page reload.


## Unified header and layout contract

- `src/components/Header.jsx` is the dedicated framework-free Vite component for all top navigation, dimension switching, OS flavor switching, recruiter quick view, Mac menus, and the live clock.
- The Header root is created once and remains mounted while the viewport and dialogs rerender.
- Header geometry is fixed at `top: 0`, `left: 0`, `width: 100%`, `height: 32px`, and `z-index: 9999`.
- Windows work area is fixed from `top: 32px` to `bottom: 28px`; the Windows taskbar is fixed at 28px.
- Mac work area is fixed from `top: 32px` to the bottom of the viewport.
- Window dragging is clamped to the work-area origin so title bars remain below the fixed header.
- The OS switcher reserves its width outside the Retro dimension with hidden visibility so right-side controls retain stable coordinates.

### Desktop icons

Do not use generic text badges, colored squares, or labels like `[TXT]`, `[DOC]`, `[APP]`, or `[WEB]` as the desktop icon artwork.

Required inline pixel-art SVG icon types, using a 32x32 viewBox scaled to approximately 48x48px:

1. Macintosh HD: beige horizontal external drive, slot, black bezel, green LED.
2. System Folder / The Lab: beige folder, rounded tab, dark outline, blue/gray system emblem.
3. Idea-Board.app: retro Macintosh computer with a board or paintbrush on screen.
4. About Nora.txt: white document with dog-eared corner and ruled lines.
5. Resume.pdf: folded document with red accent and download arrow/glyph.
6. Trash / Contact Me: wireframe corrugated metal System 7 trash can with ridges, handles, and lid.

Icon labels use a pixel-friendly font and white text with a crisp black outline. Selected icons use a classic inverted black label background. Icons must be keyboard accessible and open their designated windows.

### Macintosh system UI

- Apple logo opens About This Computer with Nora's system information, CGPA, and bio summary.
- File menu includes Download CV.
- Special menu includes Restart behavior and Switch Theme access.
- Window title bars use six horizontal black/gray pinstripes with a centered white/gray title block.
- Windows include classic close and zoom boxes, draggable title bars, focus/z-index promotion, double/beveled borders, and classic scrollbar styling.
- Macintosh HD / Career window uses Finder-like list content.
- About Nora.txt uses SimpleText-like content containing education, all awards, certifications, and grouped skills.
- Idea-Board.app wraps an iframe to the public proxy at `http://localhost:5000`; the nested upstream remains on `http://localhost:3000`.
- Recruiter Quick View is modern, high-contrast, one-page, data-driven, and includes a prominent CV download button.

### Three-dimensional desk requirements

- Theme #2 is mounted inside the existing `viewport-root` beneath the fixed 32px Header.
- `src/themes/ThreeDDesk.jsx` owns its Three.js scene, renderer, OrbitControls, animation frame, listeners, raycaster, tooltip, and object-detail modal.
- Interactive objects use `userData` metadata and are data-backed by `profile.json`, `career.json`, and the first `projects.json` entry.
- Monitor opens Idea-Board at `http://localhost:5000`; corkboard opens career history; notebook opens profile data; printer downloads `/resume-placeholder.pdf`; mug opens contact links.
- Leaving Theme #2 cancels animation, disposes controls, renderer, geometries, materials, textures, and listeners, then clears the mount.

### Three-dimensional desk accessibility

- The Reset View and modal controls are semantic keyboard controls.
- Object meaning is exposed through the visible HUD tooltip and modal headings; pointer hover is supplemental feedback.
- The Idea-Board iframe has a descriptive title, and Escape closes object-detail overlays.

### Pixel RPG requirements

- Theme #3 mounts inside the existing `viewport-root` beneath the fixed 32px Header and uses no external image assets.
- `src/themes/PixelRPG.jsx` owns the procedural map, static canvas layer, game loop, camera, player movement, collision rectangles, courier NPC, interaction prompt, dialogue, overlays, controls, and listeners.
- The Archives, Arcade, Academy, Courier, and Communication Beacon are data-bound to the existing profile, career, projects, CV, and Idea-Board contracts.
- Keyboard movement uses WASD and arrow keys; SPACE/E activates nearby interactions; pointer/touch path clicks and the on-screen D-pad provide accessible alternatives.
- Leaving Theme #3 cancels the animation frame, removes keyboard, pointer, and touch listeners, clears the canvases, closes overlays, and clears the mount.

### Pixel RPG accessibility

- D-pad, Action, dialogue-option, modal-close, external-link, and CV controls are semantic buttons or links with accessible names.
- Dialogue and modal overlays move focus to their controls, cycle Tab focus within the active overlay, close with Escape, and restore focus to the opening control.
- Canvas-only state is supplemented with live status text and visible HTML HUD controls.

### Watercolor Sketchbook requirements

- Theme #4 mounts inside the existing `viewport-root` beneath the fixed 32px Header and uses CSS gradients and DOM/SVG-like primitives rather than external image assets.
- `src/themes/WatercolorSketchbook.jsx` owns the drafting desk shell, sketchbook spreads, navigation state, page-turn timer, doodler canvas, doodler timers, and event listeners.
- Story, honors, career notes, lab, Idea-Board, CV, and postcard content are data-bound to the existing profile, career, projects, and public asset contracts.
- Leaving Theme #4 clears page-turn and doodler timers, removes delegated pointer/click listeners, and clears the mount.

### Watercolor Sketchbook accessibility

- Bookmark tabs, page navigation, CV download, Idea-Board links, and contact links use semantic buttons or anchors with visible focus states.
- Active spread tabs expose `aria-current`, spread changes are announced through a live status region, and reduced-motion removes the page-turn animation.

## Accessibility and interaction requirements

- Prefer semantic buttons, links, headings, landmarks, and native dialog behavior.
- Every control needs an accessible name and visible focus state.
- All actions must be keyboard operable; dragging cannot be the only way to use a window.
- Use Escape to close modal dialogs safely and restore focus when practical.
- Do not rely on color, position, drag, motion, or audio alone to communicate state.
- Respect `prefers-reduced-motion`.
- Give the Idea-Board iframe a descriptive title.
- Use useful alt text for non-decorative imagery; SVG UI icons can be aria-hidden when their adjacent labels provide the name.

## Verification contract

Before reporting completion for a change:

1. Ensure required files are non-empty and JSON parses.
2. Run `npm run build`.
3. Run `npm run start:all` in the background and inspect logs.
4. Verify portfolio HTTP 200 on `http://localhost:5173`.
5. Verify Idea-Board HTTP 200 and `/api/ideas` HTTP 200 on `http://localhost:5000`; the launcher must also keep the upstream on `http://localhost:3000`.
6. Exercise changed behavior through the actual runtime when tooling permits.
7. Search changed source for TODO/FIXME/stub markers and obsolete generic desktop badges.
8. Report any unavailable browser or visual verification explicitly instead of claiming it passed.
9. Stop local services after verification when the user asks to inspect the work.
- Verify `.unified-header` remains a single mounted root while state changes rerender the viewport.
- Verify the header remains 32px tall and the Windows/Mac work areas begin at 32px.
- Verify right-side controls reserve stable geometry when OS flavor or dimensions change.
- Verify drag clamping keeps window title bars below the header.
- Verify Theme #2 mounts beneath the Header, marks `3D Desk` active, and does not remount during recruiter dialog updates.
- Verify leaving and re-entering Theme #2 calls Three.js cleanup and creates a fresh renderer and animation loop.
- Verify raycast object metadata covers monitor, corkboard, notebook, printer, and contact interactions.
- Verify Theme #3 mounts beneath the Header, marks `Pixel RPG` active, and does not remount during recruiter dialog updates.
- Verify player keyboard, pointer path, touch, and D-pad controls respect collision boundaries.
- Verify Archive, Arcade, Academy, Courier, and Communication Beacon interactions use the expected data and URLs.
- Verify leaving and re-entering Theme #3 removes its animation, keyboard, pointer, and touch listeners and creates a fresh game loop.
- Verify Theme #4 mounts beneath the Header, marks `Sketchbook` active, and does not remount during recruiter dialog updates.
- Verify all four bookmark tabs and Prev/Next controls update the active spread and page-turn state.
- Verify profile, awards, skills, career, Idea-Board, CV, and contact content use the existing data and URLs.
- Verify leaving and re-entering Theme #4 removes delegated pointer/click listeners and all page/doodler timers.
- Verify Theme #5 mounts beneath the Header, marks `🌐 Neural Core` active, and does not remount during recruiter dialog updates.
- Verify all four orbital nodes open the correct focused slate with the corresponding profile, career, Idea-Board, contact, and CV data.
- Verify the orbital view removes the crowded 2×2 grid, preserves generous negative space, and keeps the core, satellites, vector lines, and particle field responsive.
- Verify `[ ⨉ RETURN TO ORBIT ]`, Escape, keyboard node activation, audio toggle, hover/click effects, reduced motion, and disposal behavior.
- Verify Theme #6 mounts beneath the Header, marks `⚡ Megastructure` active, and owns an internal four-floor vertical scroll surface.
- Verify the elevator HUD updates through `LEVEL: 01` to `LEVEL: 04`, with parallax particles, conduits, and perspective grid responding to scroll.
- Verify mission archives use all four career records, the Idea-Board chamber uses `http://localhost:5000`, and the extraction port uses verified contact and CV data.
- Verify switching through all six dimensions disposes each interactive theme without stale listeners, animation frames, timers, or broken viewport styles.

## Change history

### Initial Stage 1

- Created the Vite portfolio shell.
- Added the initial Retro OS implementation.
- Added the Idea-Board nested checkout and concurrent development command.
- Added central JSON data and a placeholder CV PDF.
- Added `NOTES.md`.
- Published the initial implementation to the remote as commit `c1c57d1` only after the user explicitly requested commit and push.

### Current transformation

- User approved replacing the initial Retro OS theme with Classic Macintosh System 7.5.3 styling.
- User supplied Noratika Chung's verified credentials and requested direct JSON population.
- User explicitly selected the existing Idea-Board port `3000` over the supplied `5000` example.
 - Replaced `src/data/profile.json`, `src/data/career.json`, and `src/data/projects.json` with the supplied Noratika Chung credentials and the approved Idea-Board port `3000`.
 - Added inline pixel-art SVG icons for Macintosh HD, The Lab, Idea-Board.app, About Nora.txt, Resume.pdf, Trash, and the rainbow Apple logo.
 - Rebuilt `src/main.js` around a System 7 desktop, Macintosh menu bar, Apple/About This Computer dialog, File and Special menus, data-driven Finder/SimpleText/contact/project windows, draggable and zoomable windows, focus promotion, recruiter view, and CV download behavior.
 - Replaced `src/styles.css` with dithered gray wallpaper, Platinum menu and window chrome, pinstripe title bars, beveled controls, classic scrollbar styling, selected icon labels, responsive behavior, and reduced-motion support.
 - Updated `NOTES.md` so future developers read this context first and use Idea-Board on port `3000`.
 - Verification evidence: `npm run build` passed; portfolio `/` returned HTTP 200; Idea-Board `/` and `/api/ideas` returned HTTP 200; Idea-Board POST smoke test returned a created idea; all updated JSON parsed successfully; source contained no TODO/FIXME/stub markers or obsolete generic desktop badge implementation.
 - Browser automation remained unavailable because the shared Chromium daemon could not launch. Visual interaction verification is therefore an explicit remaining limitation; runtime and source-level checks passed.
- User approved the dual-flavor Theme #1 task with Windows 95 as default and Classic Mac as the alternate OS.
- Added `scripts/start-idea-board.mjs` to preserve the upstream Idea-Board server on port `3000` while exposing a reproducible public proxy on port `5000`.
- Rebuilt `src/main.js` with `localStorage` OS persistence under `retro_os_flavor`, Windows 95 desktop/taskbar/Start menu/window manager, and Mac boot shortcuts.
- Reworked `src/styles.css` with Windows 95 teal wallpaper, beveled taskbar/window chrome, Win95 controls, and preserved Mac styling.
- Verification evidence: `npm run build` passed; portfolio returned HTTP 200 on port `5173`; Idea-Board returned HTTP 200 for `/` and `/api/ideas` through port `5000`; POST through the proxy succeeded; launcher syntax and JSON validation passed; source-level persistence and OS implementation checks passed.
- Browser automation remained unavailable, so refresh-based localStorage and visual drag/minimize/maximize interaction checks remain an explicit limitation.
- Added a Mac minimize control with desktop-icon restoration so both OS flavors support minimize, restore, maximize, close, dragging, and focus promotion.
- Final verification after the Mac minimize change: `npm run build` passed; portfolio, Idea-Board proxy, and proxy API each returned HTTP 200; service logs showed no compile or startup errors.
- User approved extracting a permanently fixed unified Header component for all top navigation and global controls.
- Added `src/components/Header.jsx` and stable `header-root`, `viewport-root`, and `dialog-root` render regions so OS and dimension switches no longer replace the header node.
- Added fixed 32px header geometry, fixed Windows work area/taskbar offsets, fixed Mac work area offset, stable-width clock, reserved OS switcher geometry, and header-safe window dragging.
- Verification evidence: `npm run build` passed; portfolio and Idea-Board proxy/API returned HTTP 200; source checks found the dedicated Header component, fixed geometry, stable render regions, and no stale runtime header render helpers.
- Browser automation remained unavailable, so repeated visual OS-switch and drag-boundary checks remain an explicit limitation.
- User approved Theme #2 implementation using Three.js and native OrbitControls.
- Added `three` and implemented `src/themes/ThreeDDesk.jsx` with procedural low-poly desk objects, raycast hover feedback, camera focus transitions, object overlays, direct CV download, Idea-Board iframe launch, and explicit disposal.
- Integrated Theme #2 through the stable `viewport-root`; recruiter quick view continues to rerender only `dialog-root` while the desk scene remains mounted.
- Added responsive 3D desk HUD, modal, tooltip, and reset-view styling.
- User approved Theme #3 implementation as a procedural HTML5 Canvas 2D Pixel RPG overworld.
- Added `src/themes/PixelRPG.jsx` with Nora's Realm map, procedural buildings and sprites, camera follow, collision, keyboard/pointer/touch movement, courier NPC, interaction prompts, typewriter dialogue, location banners, data-driven overlays, and explicit disposal.
- Integrated Theme #3 through the stable `viewport-root` and added responsive pixel RPG HUD, D-pad, Action button, dialogue, and modal styling.
- User approved Theme #4 implementation as a Watercolor Sketchbook and directed all development to continue on `main`.
- Added `src/themes/WatercolorSketchbook.jsx` with four data-driven spreads, watercolor DOM styling, bookmark and Prev/Next navigation, Idea-Board embedding, CV download, postcard contact links, doodler canvas, page-turn animation, and explicit disposal.
- Integrated Theme #4 through the stable `viewport-root`, added responsive sketchbook styling, and configured `vite.config.js` for the existing Three.js vendor chunk.
- User approved Theme #5 as a Sci-Fi Cyberpunk Hologram HUD and directed development to continue directly on `main`.
- Added `src/themes/CyberHUD.jsx` with Canvas wireframe telemetry, pointer-reactive particles, data-driven pilot/career panels, Idea-Board simulation frame, contact uplinks, CV extraction progress, optional native Web Audio, reduced-motion handling, and explicit disposal.
- Integrated Theme #5 through the stable `viewport-root`; all theme transitions dispose prior interactive instances while recruiter quick view continues to rerender only `dialog-root`.
- Restored the `createThreeDDesk` import in `src/main.js` after the Cyber HUD integration accidentally replaced it; the desk branch now resolves its exported factory again. The regression build restored the non-empty `three-vendor` chunk at 517.63 kB.
- User approved replacing Theme #5's crowded Cyber HUD with the Neural Core orbital node map.
- Added `src/themes/NeuralCore.jsx` with a Canvas-rendered rotating icosahedron, drifting particles, four semantic satellite nodes, focused holographic slates, Idea-Board chamber, profile/career/CV data, native Web Audio, keyboard operation, reduced-motion handling, and explicit disposal.
- Replaced the Cyber HUD styles and implementation, renamed the dimension switcher label to `🌐 Neural Core`, and retained the existing `hud` theme identifier and stable `viewport-root` lifecycle.
- User approved Theme #6 as The Megastructure Elevator, a vertical parallax scroll journey with four viewport-height floors.
- Added `src/themes/Megastructure.jsx` with an internal scroll container, elevator level HUD, Canvas particle/conduit/perspective parallax, data-driven mission archives, full-width Idea-Board simulation bay, contact relays, CV extraction, reduced-motion handling, and explicit disposal.
- Added the sixth `⚡ Megastructure` dimension label, integrated its lifecycle through the stable `viewport-root`, and documented the four-floor architecture.
- Changed the initial dimension from Retro OS to Pixel RPG by setting the initial application theme state to `rpg`; Retro OS remains available through the dimension switcher and retains its OS flavor behavior.
- Added Vercel serverless configuration and CommonJS app export to the nested Idea-Board repository; local execution retains the port `3000` upstream used by the portfolio proxy.
- Added `productionUrl` registry data, shared environment-aware Idea-Board URL resolution across all six renderers, and the portfolio SPA rewrite.
- Added `DEPLOYMENT.md` as the permanent Vercel deployment rulebook for future ecosystem projects.
