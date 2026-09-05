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

Theme #1 is being transformed into an authentic Classic Macintosh System 7.5.3 / Platinum desktop environment. The other four dimensions remain construction placeholders unless a later request expands them.

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
- `idea-board`: runs `apps/idea-board/server.js`.
- `start:all`: starts the portfolio and Idea-Board through `concurrently`.

Verified service URLs:

- Portfolio: `http://localhost:5173`
- Idea-Board: `http://localhost:3000`

### Port decision

The supplied transformation prompt specified `projects.json.localUrl` as port `5000`, but the verified Idea-Board server hardcodes port `3000`. The user explicitly selected option 2: use the existing verified port `3000`. Keep the project data and iframe URL on port `3000` unless the user explicitly changes this decision.

The Idea-Board server currently listens with:

```js
const port = 3000;
```

## Current architecture

- `index.html`: Vite document shell.
- `src/main.js`: application state, rendering, data-driven windows, desktop interactions, menus, theme switching, and recruiter view.
- `src/styles.css`: all portfolio presentation and responsive behavior.
- `src/data/profile.json`: personal profile, education, awards, certifications, and skills.
- `src/data/career.json`: career and project experience entries.
- `src/data/projects.json`: interactive project metadata, with Idea-Board first.
- `public/resume-placeholder.pdf`: temporary download asset until the user supplies a real CV.
- `public/screenshots/project-placeholder.svg`: legacy career-art asset; remove or stop using it when the Classic Mac view no longer needs it.
- `NOTES.md`: setup and launch instructions for developers.
- `context.md`: this persistent instruction and project-state file; future agents must read it first.
- `.gitignore`: ignores `node_modules/`, `dist/`, environment files, and `apps/`.

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

## Classic Macintosh requirements

### Desktop

- Theme #1 must look like Classic Apple Macintosh System 7.5.3 / Platinum, not Windows 98 or a generic modern dashboard.
- Wallpaper: 50% dithered gray canvas using the System 7 pattern.
- Fixed top menu bar, approximately 24–28px high, white with a black bottom border.
- Left menu elements: rainbow Apple logo, File, Edit, View, Special, Help.
- Right menu elements: live 12-hour clock, dimension switcher, Recruiter Quick View toggle.
- Other dimensions must show: `Dimension under construction - Switch to Retro OS to experience the active theme.` or the Classic Mac equivalent only when the user later changes that requirement.

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
- Idea-Board.app wraps an iframe to `http://localhost:3000`.
- Recruiter Quick View is modern, high-contrast, one-page, data-driven, and includes a prominent CV download button.

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
5. Verify Idea-Board HTTP 200 and `/api/ideas` HTTP 200 on `http://localhost:3000`.
6. Exercise changed behavior through the actual runtime when tooling permits.
7. Search changed source for TODO/FIXME/stub markers and obsolete generic desktop badges.
8. Report any unavailable browser or visual verification explicitly instead of claiming it passed.
9. Stop local services after verification when the user asks to inspect the work.

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
