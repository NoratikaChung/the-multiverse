# ARCHITECTURAL STANDARD: VERCEL DEPLOYMENT FOR ALL ECOSYSTEM PROJECTS

> **CRITICAL DIRECTIVE FOR ANY AI AGENT WORKING IN THIS REPOSITORY:**
> All sub-projects, mini-games, and standalone apps built for "The Multiverse" ecosystem
> MUST be architected to deploy directly to Vercel with ZERO manual re-configuration.
> Whenever a new project is created or imported, the agent MUST automatically generate
> the appropriate Vercel deployment configuration.

---

### Project Type Blueprints:

1. **Node.js / Express Backend Projects (e.g., Idea-Board):**
   - MUST include a root `vercel.json` routing traffic to `@vercel/node`.
   - MUST export the Express `app` (`module.exports = app;`).
   - MUST condition `app.listen()` so it only fires outside of Vercel serverless environments.

2. **Frontend / Vite / React / Canvas / Phaser Games:**
   - MUST include standard npm build scripts: `"build": "vite build"` (or equivalent).
   - Output directory MUST be configured to `dist` or `build`.
   - Single Page Applications (SPAs) MUST include a `vercel.json` route rewrite:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```

3. **Domain & Subdomain Linking Standards:**
   - All projects will be mapped to subdomains under `noratikachung.com` (e.g., `ideaboard.noratikachung.com`).
   - The portfolio registry `src/data/projects.json` must always record:
     - `localUrl`: For localhost development loops (e.g., `http://localhost:5000`).
     - `productionUrl`: For live Vercel deployments (e.g., `https://ideaboard.noratikachung.com`).

4. **Multiplayer / WebSocket Exception Rule:**
   - If an upcoming game strictly requires persistent 24/7 WebSockets (e.g. Socket.io), Vercel serverless cannot maintain persistent sockets.
   - In that scenario, the agent must document and prepare a `render.yaml` or Dockerfile for free-tier Render deployment, while keeping the frontend client hosted on Vercel.
