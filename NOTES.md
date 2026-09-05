# The Multiverse Portfolio

> Before changing this repository, read [`context.md`](./context.md). It contains the persistent project requirements, user constraints, architecture decisions, and verification contract for future sessions.

This repository must remain the only application path modified by portfolio work. Do not commit or push unless the user explicitly requests it.

## Current integration decision

Idea-Board's nested server remains on internal port `3000`. The tracked `scripts/start-idea-board.mjs` launcher exposes it through a public proxy on port `5000`, which is the URL used by both OS flavors.

Theme #1 defaults to Windows 95. Use the global OS Flavor switcher to change to Classic Mac System 7. The selected flavor persists in browser `localStorage` under `retro_os_flavor`.
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
