import './styles.css';
import profile from './data/profile.json';
import career from './data/career.json';
import projects from './data/projects.json';

const app = document.querySelector('#app');
const ideaBoard = projects.find((project) => project.id === 'idea-board');

const windowCatalog = {
  about: { title: 'About Me.txt', icon: 'TXT', kind: 'about' },
  career: { title: 'Career Work', icon: 'DOC', kind: 'career' },
  apps: { title: 'Arcade / Apps', icon: 'APP', kind: 'apps' },
  idea: { title: 'Idea-Board', icon: 'WEB', kind: 'idea' },
};

const state = {
  theme: 'retro',
  startMenu: false,
  quickView: false,
  activeWindow: 'about',
  windowOrder: ['about'],
  windows: {
    about: { minimized: false, maximized: false },
  },
  positions: {},
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const tagMarkup = (tags) => tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

function openWindow(id) {
  if (!windowCatalog[id]) return;
  if (!state.windows[id]) {
    state.windows[id] = { minimized: false, maximized: false };
    state.windowOrder.push(id);
  } else {
    state.windows[id].minimized = false;
  }
  state.activeWindow = id;
  state.startMenu = false;
  render();
}

function windowContents(kind) {
  if (kind === 'about') {
    return `
      <section class="window-copy about-copy">
        <p class="eyebrow">PERSONAL FILE // 001</p>
        <h2>${escapeHtml(profile.name)}</h2>
        <p class="window-lead">${escapeHtml(profile.title)}</p>
        <p>${escapeHtml(profile.shortBio)}</p>
        <div class="contact-grid">
          <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>
          <a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>
      </section>`;
  }

  if (kind === 'career') {
    return `
      <section class="window-copy career-copy">
        <p class="eyebrow">ARCHIVE // CAREER WORK</p>
        <h2>Selected transmissions</h2>
        <div class="career-list">
          ${career.map((entry) => `
            <article class="career-entry">
              <img src="${escapeHtml(entry.screenshot)}" alt="Project placeholder for ${escapeHtml(entry.title)}" />
              <div>
                <p class="entry-date">${escapeHtml(entry.date)}</p>
                <h3>${escapeHtml(entry.title)}</h3>
                <p class="entry-meta">${escapeHtml(entry.role)} · ${escapeHtml(entry.company)}</p>
                <p>${escapeHtml(entry.description)}</p>
                <div class="tag-row">${tagMarkup(entry.tags)}</div>
              </div>
            </article>`).join('')}
        </div>
      </section>`;
  }

  if (kind === 'apps') {
    return `
      <section class="window-copy apps-copy">
        <p class="eyebrow">ARCADE // INTERACTIVE PROJECTS</p>
        <h2>Choose an experience</h2>
        <div class="project-grid">
          ${projects.map((project) => `
            <article class="project-card">
              <div class="project-card-top"><span class="project-type">${escapeHtml(project.type)}</span><span aria-hidden="true">◆</span></div>
              <h3>${escapeHtml(project.title)}</h3>
              <p>${escapeHtml(project.description)}</p>
              <div class="tag-row">${tagMarkup(project.tags)}</div>
              ${project.id === 'idea-board'
                ? '<button class="os-button primary" data-action="open-window" data-window="idea">Launch Idea-Board</button>'
                : '<button class="os-button" type="button" disabled>Coming soon</button>'}
            </article>`).join('')}
        </div>
      </section>`;
  }

  return `
    <section class="idea-shell">
      <div class="iframe-note">
        <span>LOCAL SERVICE // ${escapeHtml(ideaBoard.localUrl)}</span>
        <button class="os-button" data-action="open-external" type="button">Open in browser</button>
      </div>
      <iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive application" loading="lazy"></iframe>
    </section>`;
}

function renderDesktopIcon(id, label, icon, action = 'open-window') {
  return `<button class="desktop-icon" data-action="${action}" data-window="${id}" type="button">
    <span class="desktop-icon-glyph ${icon.toLowerCase()}" aria-hidden="true">${icon}</span>
    <span>${label}</span>
  </button>`;
}

function renderWindow(id, index) {
  const config = windowCatalog[id];
  const windowState = state.windows[id];
  const position = state.positions[id] ?? { left: 100 + index * 28, top: 92 + index * 22 };
  const classes = ['os-window'];
  if (windowState.minimized) classes.push('is-minimized');
  if (windowState.maximized) classes.push('is-maximized');
  if (state.activeWindow === id) classes.push('is-active');
  const style = windowState.maximized ? '' : `left: ${position.left}px; top: ${position.top}px; z-index: ${state.activeWindow === id ? 50 : index + 2};`;

  return `<article class="${classes.join(' ')}" data-window="${id}" style="${style}" aria-label="${escapeHtml(config.title)}">
    <header class="window-titlebar" data-drag-handle="true">
      <span class="window-title"><span class="window-title-icon" aria-hidden="true">${config.icon}</span>${escapeHtml(config.title)}</span>
      <div class="window-controls">
        <button class="window-control" data-action="minimize-window" data-window="${id}" aria-label="Minimize ${escapeHtml(config.title)}" type="button">_</button>
        <button class="window-control" data-action="maximize-window" data-window="${id}" aria-label="Maximize ${escapeHtml(config.title)}" type="button">□</button>
        <button class="window-control close" data-action="close-window" data-window="${id}" aria-label="Close ${escapeHtml(config.title)}" type="button">×</button>
      </div>
    </header>
    <div class="window-body">${windowContents(config.kind)}</div>
  </article>`;
}

function renderResumeDialog() {
  return `<dialog class="resume-dialog" id="resume-dialog" aria-labelledby="resume-title">
    <div class="resume-page">
      <div class="resume-actions">
        <button class="os-button" data-action="close-quick-view" type="button">Close quick view</button>
        <a class="os-button primary" href="${escapeHtml(profile.cvPath)}" download>Download PDF</a>
      </div>
      <header class="resume-header">
        <div><p class="eyebrow">RECRUITER QUICK VIEW</p><h2 id="resume-title">${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.title)}</p></div>
        <div class="resume-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><a href="${escapeHtml(profile.github)}">GitHub</a><a href="${escapeHtml(profile.linkedin)}">LinkedIn</a></div>
      </header>
      <section class="resume-section"><h3>Profile</h3><p>${escapeHtml(profile.shortBio)}</p></section>
      <section class="resume-section"><h3>Experience</h3>${career.map((entry) => `<article class="resume-entry"><div><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.company)} · ${escapeHtml(entry.role)}</span></div><time>${escapeHtml(entry.date)}</time><p>${escapeHtml(entry.description)}</p><div class="tag-row">${tagMarkup(entry.tags)}</div></article>`).join('')}</section>
      <section class="resume-section"><h3>Selected projects</h3><div class="resume-projects">${projects.map((project) => `<span><strong>${escapeHtml(project.title)}</strong> — ${escapeHtml(project.description)}</span>`).join('')}</div></section>
    </div>
  </dialog>`;
}

function render() {
  const isRetro = state.theme === 'retro';
  app.innerHTML = `
    <div class="site-shell ${isRetro ? 'retro-theme' : 'placeholder-theme'}" data-theme="${state.theme}">
      <nav class="dimension-switcher" aria-label="Dimension switcher">
        <div class="theme-buttons">
          ${[['retro', 'Retro OS'], ['desk', '3D Desk'], ['rpg', 'Pixel RPG'], ['sketch', 'Sketchbook'], ['hud', 'Cyber HUD']].map(([id, label]) => `<button class="theme-button ${state.theme === id ? 'active' : ''}" data-action="theme" data-theme="${id}" aria-pressed="${state.theme === id}" type="button">${label}${state.theme === id ? ' (Active)' : ''}</button>`).join('')}
        </div>
        <button class="quick-toggle" data-action="quick-view" type="button" aria-haspopup="dialog"><span class="toggle-indicator" aria-hidden="true"></span>Recruiter Quick View</button>
      </nav>
      ${isRetro ? `
        <main class="desktop" aria-label="Retro OS desktop">
          <div class="desktop-icons">
            ${renderDesktopIcon('about', 'About Me.txt', 'TXT')}
            ${renderDesktopIcon('career', 'Career Work', 'DOC')}
            ${renderDesktopIcon('apps', 'Arcade / Apps', 'APP')}
            ${renderDesktopIcon('idea', 'Idea-Board', 'WEB')}
            <a class="desktop-icon" href="${escapeHtml(profile.cvPath)}" download><span class="desktop-icon-glyph pdf" aria-hidden="true">PDF</span><span>Download CV.pdf</span></a>
          </div>
          <div class="window-layer">${state.windowOrder.filter((id) => state.windows[id]).map((id, index) => renderWindow(id, index)).join('')}</div>
        </main>
        <footer class="taskbar">
          <button class="start-button" data-action="toggle-start" type="button" aria-expanded="${state.startMenu}"><span class="start-mark" aria-hidden="true">◆</span> Start</button>
          <div class="taskbar-tabs" aria-label="Open windows">${state.windowOrder.filter((id) => state.windows[id]).map((id) => `<button class="taskbar-tab ${state.activeWindow === id ? 'active' : ''}" data-action="restore-window" data-window="${id}" type="button">${windowCatalog[id].icon} ${escapeHtml(windowCatalog[id].title)}</button>`).join('')}</div>
          <time class="clock" id="clock" aria-label="Current time"></time>
        </footer>
        ${state.startMenu ? `<aside class="start-menu" aria-label="Start menu"><div class="start-banner">THE<br><strong>MULTIVERSE</strong></div><div class="start-items"><button data-action="open-window" data-window="about" type="button">▣ About Me.txt</button><button data-action="open-window" data-window="career" type="button">▤ Career Work</button><button data-action="open-window" data-window="apps" type="button">▦ Arcade / Apps</button><button data-action="quick-view" type="button">▥ Recruiter Quick View</button><a href="${escapeHtml(profile.cvPath)}" download>▧ Download CV.pdf</a></div></aside>` : ''}` : `<main class="construction-screen"><div class="construction-card"><span class="construction-mark" aria-hidden="true">✦</span><p class="eyebrow">DIMENSION ${escapeHtml(state.theme.toUpperCase())}</p><h1>Dimension under construction</h1><p>Switch to Retro OS to experience the active theme.</p><button class="os-button primary" data-action="theme" data-theme="retro" type="button">Return to Retro OS</button></div></main>`}
      ${renderResumeDialog()}
    </div>`;

  if (state.quickView) {
    const dialog = document.querySelector('#resume-dialog');
    dialog.addEventListener('close', () => {
      if (state.quickView) {
        state.quickView = false;
        render();
      }
    }, { once: true });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      dialog.close();
    }, { once: true });
    dialog.showModal();
  }
  updateClock();
  bindDragHandlers();
}

function updateClock() {
  const clock = document.querySelector('#clock');
  if (clock) {
    clock.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
  }
}

function bindDragHandlers() {
  document.querySelectorAll('[data-drag-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const element = handle.closest('.os-window');
      const id = element.dataset.window;
      if (state.windows[id].maximized) return;
      state.activeWindow = id;
      element.style.zIndex = '50';
      const rect = element.getBoundingClientRect();
      const origin = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      const move = (moveEvent) => {
        const left = Math.max(12, origin.left + moveEvent.clientX - origin.x);
        const top = Math.max(52, origin.top + moveEvent.clientY - origin.y);
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        state.positions[id] = { left, top };
      };
      const end = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', end);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', end, { once: true });
    });
  });
}

document.addEventListener('click', (event) => {
  const actionElement = event.target.closest('[data-action]');
  if (state.startMenu && !event.target.closest('.start-menu') && actionElement?.dataset.action !== 'toggle-start') {
    state.startMenu = false;
    render();
    return;
  }
  if (!actionElement) return;
  const { action, window: windowId, theme } = actionElement.dataset;

  if (action === 'open-window' || action === 'restore-window') openWindow(windowId);
  if (action === 'close-window') {
    delete state.windows[windowId];
    state.windowOrder = state.windowOrder.filter((id) => id !== windowId);
    state.activeWindow = state.windowOrder.at(-1) ?? null;
    render();
  }
  if (action === 'minimize-window') {
    state.windows[windowId].minimized = true;
    state.activeWindow = state.windowOrder.findLast((id) => state.windows[id] && !state.windows[id].minimized) ?? null;
    render();
  }
  if (action === 'maximize-window') {
    state.windows[windowId].maximized = !state.windows[windowId].maximized;
    state.activeWindow = windowId;
    render();
  }
  if (action === 'toggle-start') {
    state.startMenu = !state.startMenu;
    render();
  }
  if (action === 'theme') {
    state.theme = theme;
    state.startMenu = false;
    render();
  }
  if (action === 'quick-view') {
    state.quickView = true;
    state.startMenu = false;
    render();
  }
  if (action === 'close-quick-view') {
    document.querySelector('#resume-dialog')?.close();
  }
  if (action === 'open-external') {
    window.open(ideaBoard.localUrl, '_blank', 'noopener,noreferrer');
  }
});

setInterval(updateClock, 1000);
render();
