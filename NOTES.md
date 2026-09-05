# The Multiverse Portfolio

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
- Idea-Board: <http://localhost:3000>

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
