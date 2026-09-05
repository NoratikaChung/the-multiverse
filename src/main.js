import './styles.css';
import profile from './data/profile.json';
import career from './data/career.json';
import projects from './data/projects.json';

const app = document.querySelector('#app');
const ideaBoard = projects.find((project) => project.id === 'idea-board');

const windowCatalog = {
  about: { title: 'About Nora.txt', icon: 'document', kind: 'about' },
  career: { title: 'Macintosh HD', icon: 'hard-drive', kind: 'career' },
  lab: { title: 'The Lab', icon: 'folder', kind: 'lab' },
  idea: { title: 'Idea-Board.app', icon: 'application', kind: 'idea' },
  contact: { title: 'Contact Me', icon: 'trash', kind: 'contact' },
};

const state = {
  theme: 'retro',
  menu: null,
  quickView: false,
  aboutComputer: false,
  selectedIcon: 'about',
  activeWindow: 'about',
  windowOrder: ['about'],
  windows: { about: { maximized: false } },
  positions: {},
  notice: '',
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const tagsMarkup = (tags = []) => tags.map((tag) => `<span class="data-tag">${escapeHtml(tag)}</span>`).join('');

const iconMarkup = (name, className = '') => {
  const common = `class="pixel-icon ${className}" viewBox="0 0 32 32" role="img" aria-hidden="true" shape-rendering="crispEdges"`;
  const icons = {
    'hard-drive': `<svg ${common}><path fill="#e4d8bb" stroke="#111" stroke-width="1" d="M3 9h26v15H3z"/><path fill="#b9a889" stroke="#111" d="M5 11h22v7H5z"/><path fill="#171717" d="M7 13h18v3H7z"/><path fill="#e9e1ca" d="M6 20h20v2H6z"/><circle cx="25" cy="21" r="1.5" fill="#39a84a" stroke="#111"/><path fill="#fff" opacity=".45" d="M5 10h22v1H5z"/></svg>`,
    folder: `<svg ${common}><path fill="#e0d2ae" stroke="#111" d="M3 8h10l2 3h14v14H3z"/><path fill="#f1e8cc" stroke="#111" d="M4 12h24v12H4z"/><path fill="#9aa6ae" stroke="#111" d="M13 15h6v6h-6z"/><path fill="#315a76" d="M14 16h4v1h-4zm0 2h4v1h-4z"/><path fill="#fff" opacity=".5" d="M5 13h22v1H5z"/></svg>`,
    application: `<svg ${common}><path fill="#d9cba8" stroke="#111" d="M4 19h24v8H4z"/><path fill="#b5c1bd" stroke="#111" d="M7 7h18v14H7z"/><path fill="#fff" d="M9 9h14v9H9z"/><path fill="#5d8ca0" d="M10 10h12v7H10z"/><path fill="#f4db4f" d="M14 12h4v3h-4z"/><path fill="#111" d="M11 21h10v2H11z"/><path fill="#d9cba8" stroke="#111" d="M2 27h28v2H2z"/><path fill="#fff" opacity=".6" d="M8 8h16v1H8z"/><path fill="#222" d="M25 5l3 2-5 4-2-1z"/><path fill="#ef7b36" d="M23 10l-2 2-1-1 2-2z"/></svg>`,
    document: `<svg ${common}><path fill="#fff" stroke="#111" d="M6 2h14l6 6v22H6z"/><path fill="#c8c8c8" stroke="#111" d="M20 2v7h7"/><path fill="#111" d="M10 13h12v1H10zm0 4h12v1H10zm0 4h12v1H10zm0 4h8v1h-8z"/><path fill="#fff" d="M21 3v5h5z"/></svg>`,
    resume: `<svg ${common}><path fill="#fff" stroke="#111" d="M6 2h14l6 6v22H6z"/><path fill="#d9584b" stroke="#111" d="M20 2v7h7"/><path fill="#d9584b" d="M14 12h4v8h3l-5 5-5-5h3z"/><path fill="#111" d="M10 27h12v1H10z"/><path fill="#fff" d="M21 3v5h5z"/></svg>`,
    trash: `<svg ${common}><path fill="#b8b8b8" stroke="#111" d="M7 9h18l-2 19H9z"/><path fill="#d7d7d7" stroke="#111" d="M5 6h22v4H5z"/><path fill="#b8b8b8" stroke="#111" d="M11 3h10l2 3H9z"/><path fill="none" stroke="#555" d="M11 11v15m4-15v15m4-15v15m4-15v15"/><path fill="#fff" opacity=".5" d="M9 11h14v1H9z"/><path fill="#777" d="M3 28h26v2H3z"/></svg>`,
    apple: `<svg ${common}><path fill="#111" d="M17 6c1-3 3-4 5-4 0 2-1 4-3 5 3 0 5 3 5 6 0 5-4 10-7 10-2 0-3-1-5-1s-3 1-5 1c-3 0-7-5-7-11 0-5 3-8 7-8 2 0 4 2 5 2 1 0 3-2 5-2z"/><path fill="#ee3e3e" d="M10 4C8 2 8 1 8 0c2 0 4 1 5 3z"/></svg>`,
  };
  return icons[name] ?? icons.document;
};

const rainbowAppleMarkup = () => `<svg class="apple-logo" viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges"><path fill="#111" d="M17 6c1-3 3-4 5-4 0 2-1 4-3 5 3 0 5 3 5 6 0 5-4 10-7 10-2 0-3-1-5-1s-3 1-5 1c-3 0-7-5-7-11 0-5 3-8 7-8 2 0 4 2 5 2 1 0 3-2 5-2z"/><path fill="#ed3b3b" d="M3 12h4v5H3z"/><path fill="#f39b37" d="M7 10h4v9H7z"/><path fill="#f4d33f" d="M11 9h4v11h-4z"/><path fill="#55ae53" d="M15 9h4v11h-4z"/><path fill="#4385bd" d="M19 10h4v9h-4z"/><path fill="#8f5ab2" d="M23 12h2v5h-2z"/><path fill="#55ae53" d="M14 4c1-2 3-3 5-3-1 2-2 3-4 4z"/></svg>`;

function openWindow(id) {
  if (!windowCatalog[id]) return;
  if (!state.windows[id]) {
    state.windows[id] = { maximized: false };
    state.windowOrder.push(id);
  }
  state.activeWindow = id;
  state.windows[id].maximized = false;
  state.selectedIcon = id;
  state.menu = null;
  render();
}

function closeWindow(id) {
  delete state.windows[id];
  state.windowOrder = state.windowOrder.filter((windowId) => windowId !== id);
  state.activeWindow = state.windowOrder.at(-1) ?? null;
  render();
}

function windowContent(kind) {
  if (kind === 'about') {
    const skillGroups = Object.entries(profile.skills).map(([group, skills]) => `<div class="skill-group"><h4>${escapeHtml(group)}</h4><p>${skills.map(escapeHtml).join(' · ')}</p></div>`).join('');
    return `<article class="simpletext-document">
      <p class="document-kicker">PERSONAL FILE // SIMPLETEXT</p>
      <h2>${escapeHtml(profile.name)}</h2>
      <p class="document-subtitle">${escapeHtml(profile.title)} · ${escapeHtml(profile.location)}</p>
      <p>${escapeHtml(profile.bio)}</p>
      <section class="document-section"><h3>Education</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)} · CGPA ${escapeHtml(profile.education.cgpa)} · ${escapeHtml(profile.education.period)}</p></section>
      <section class="document-section"><h3>Awards & scholarships</h3><ul>${profile.awards.map((award) => `<li><strong>${escapeHtml(award.title)}</strong><br><span>${escapeHtml(award.detail)}</span></li>`).join('')}</ul></section>
      <section class="document-section"><h3>Certifications</h3><ul>${profile.certifications.map((certification) => `<li>${escapeHtml(certification)}</li>`).join('')}</ul></section>
      <section class="document-section"><h3>Technical skills</h3><div class="skill-grid">${skillGroups}</div></section>
    </article>`;
  }

  if (kind === 'career') {
    return `<section class="finder-view"><header class="finder-toolbar"><span>Macintosh HD</span><span>${career.length} items</span></header><div class="finder-columns"><span>Name</span><span>Kind</span><span>Date Modified</span></div><div class="career-list">${career.map((entry) => `<article class="career-entry"><div class="file-row"><span class="file-row-icon">${iconMarkup('document')}</span><div><h3>${escapeHtml(entry.role)}</h3><p>${escapeHtml(entry.company)} · ${escapeHtml(entry.location)}</p></div></div><div class="career-period">${escapeHtml(entry.period)}</div><div class="career-detail"><p>${escapeHtml(entry.summary)}</p><ul>${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul><div class="tag-row">${tagsMarkup(entry.tags)}</div></div></article>`).join('')}</div></section>`;
  }

  if (kind === 'lab') {
    return `<section class="lab-view"><p class="document-kicker">SYSTEM FOLDER // THE LAB</p><h2>Interactive experiments</h2><article class="lab-project"><div class="lab-project-icon">${iconMarkup('application')}</div><div><h3>${escapeHtml(ideaBoard.title)}</h3><p class="project-tagline">${escapeHtml(ideaBoard.tagline)}</p><p>${escapeHtml(ideaBoard.description)}</p><div class="tag-row">${tagsMarkup(ideaBoard.tags)}</div><div class="project-actions"><button class="mac-button primary" data-action="open-window" data-window="idea" type="button">Open Idea-Board.app</button><a class="mac-button" href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">View source</a></div></div></article></section>`;
  }

  if (kind === 'idea') {
    return `<section class="idea-shell"><div class="iframe-toolbar"><span>${escapeHtml(ideaBoard.localUrl)}</span><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a></div><iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive application" loading="lazy"></iframe><div class="status-bar">Idea-Board.app · local application · ready</div></section>`;
  }

  return `<section class="contact-view"><div class="contact-trash">${iconMarkup('trash')}</div><p class="document-kicker">CONTACT CARD // NORA</p><h2>Let's connect.</h2><p>Have a thoughtful project, a systems problem, or an interesting idea? Send a signal.</p><div class="contact-links"><a href="mailto:${escapeHtml(profile.email)}"><strong>Email</strong><span>${escapeHtml(profile.email)}</span></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><strong>GitHub</strong><span>github.com/NoratikaChung</span></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><strong>LinkedIn</strong><span>linkedin.com/in/noratika-chung-8b2570219</span></a></div></section>`;
}

function renderDesktopIcon(id, label, iconName, action = 'open-window') {
  const selected = state.selectedIcon === id;
  const element = action === 'download'
    ? `<a class="desktop-icon ${selected ? 'is-selected' : ''}" href="${escapeHtml(profile.cvPath)}" download data-action="select-download" data-icon="${id}">`
    : `<button class="desktop-icon ${selected ? 'is-selected' : ''}" data-action="${action}" data-window="${id}" type="button">`;
  return `${element}<span class="desktop-icon-art">${iconMarkup(iconName)}</span><span class="icon-label">${label}</span>${action === 'download' ? '</a>' : '</button>'}`;
}

function renderWindow(id, index) {
  const config = windowCatalog[id];
  const windowState = state.windows[id];
  const position = state.positions[id] ?? { left: 138 + index * 32, top: 60 + index * 24 };
  const active = state.activeWindow === id;
  const classes = ['mac-window'];
  if (active) classes.push('is-active');
  if (windowState.maximized) classes.push('is-maximized');
  const style = windowState.maximized ? '' : `left:${position.left}px;top:${position.top}px;z-index:${active ? 50 : index + 2};`;
  return `<article class="${classes.join(' ')}" data-window="${id}" style="${style}" aria-label="${escapeHtml(config.title)}"><header class="mac-titlebar" data-drag-handle="true"><button class="window-box close-box" data-action="close-window" data-window="${id}" type="button" aria-label="Close ${escapeHtml(config.title)}"></button><span class="window-title">${escapeHtml(config.title)}</span><button class="window-box zoom-box" data-action="zoom-window" data-window="${id}" type="button" aria-label="Zoom ${escapeHtml(config.title)}"></button></header><div class="mac-window-body">${windowContent(config.kind)}</div></article>`;
}

function renderMenuPopup() {
  if (!state.menu) return '';
  const menuItems = {
    apple: `<button data-action="about-computer" type="button">About This Computer…</button>`,
    file: `<button data-action="download" type="button">Download CV</button><button type="button" disabled>Close Window</button>`,
    edit: `<button type="button" disabled>Undo</button><button type="button" disabled>Copy</button>`,
    view: `<button type="button" disabled>as Icons</button><button type="button" disabled>as List</button>`,
    special: `<button data-action="restart" type="button">Restart</button><button data-action="switch-theme" type="button">Switch Theme</button>`,
    help: `<button data-action="about-computer" type="button">Macintosh Help</button>`,
  };
  return `<div class="menu-popup" role="menu" aria-label="${escapeHtml(state.menu)} menu">${menuItems[state.menu]}</div>`;
}

function renderDialog(id, title, content, actions = '') {
  return `<dialog class="system-dialog" id="${id}" aria-labelledby="${id}-title"><div class="dialog-titlebar"><h2 id="${id}-title">${title}</h2><button class="window-box close-box" data-action="close-dialog" data-dialog="${id}" type="button" aria-label="Close ${title}"></button></div><div class="dialog-content">${content}</div><div class="dialog-actions">${actions}<button class="mac-button primary" data-action="close-dialog" data-dialog="${id}" type="button">Close</button></div></dialog>`;
}

function renderSystemDialog() {
  if (!state.aboutComputer) return '';
  return renderDialog('about-computer', 'About This Computer', `<div class="about-computer-mark">${rainbowAppleMarkup()}</div><h3>Macintosh Portfolio System 7.5.3</h3><p><strong>${escapeHtml(profile.name)}</strong> · ${escapeHtml(profile.title)}</p><p>${escapeHtml(profile.bio)}</p><dl class="system-specs"><div><dt>Memory</dt><dd>First-Class academic background</dd></div><div><dt>Education</dt><dd>USM · CGPA ${escapeHtml(profile.education.cgpa)}</dd></div><div><dt>Location</dt><dd>${escapeHtml(profile.location)}</dd></div></dl>`, '<button class="mac-button" data-action="restart" type="button">Restart</button>');
}

function renderQuickView() {
  if (!state.quickView) return '';
  return `<dialog class="quick-dialog" id="quick-view" aria-labelledby="quick-view-title"><div class="quick-page"><div class="quick-actions"><button class="mac-button" data-action="close-dialog" data-dialog="quick-view" type="button">Close quick view</button><a class="mac-button primary" href="${escapeHtml(profile.cvPath)}" download>Download CV (PDF)</a></div><header class="quick-header"><div><p class="document-kicker">RECRUITER QUICK VIEW</p><h2 id="quick-view-title">${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.title)} · ${escapeHtml(profile.location)}</p></div><div class="quick-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><a href="${escapeHtml(profile.github)}">GitHub</a><a href="${escapeHtml(profile.linkedin)}">LinkedIn</a></div></header><section class="quick-section"><h3>Profile</h3><p>${escapeHtml(profile.bio)}</p></section><section class="quick-section"><h3>Experience</h3>${career.map((entry) => `<article class="quick-entry"><div><strong>${escapeHtml(entry.role)}</strong><span>${escapeHtml(entry.company)} · ${escapeHtml(entry.period)}</span></div><p>${escapeHtml(entry.summary)}</p><ul>${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul></article>`).join('')}</section><section class="quick-section"><h3>Education & credentials</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)} · CGPA ${escapeHtml(profile.education.cgpa)} · ${escapeHtml(profile.education.period)}</p><div class="quick-columns"><div><strong>Certifications</strong><ul>${profile.certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div><strong>Core skills</strong><p>${Object.values(profile.skills).flat().map(escapeHtml).join(' · ')}</p></div></div></section></div></dialog>`;
}

function render() {
  const classic = state.theme === 'retro';
  const dimensions = [['retro', 'Classic Mac'], ['desk', '3D Desk'], ['rpg', 'Pixel RPG'], ['sketch', 'Sketchbook'], ['hud', 'Cyber HUD']];
  app.innerHTML = `<div class="site-shell ${classic ? 'classic-mac' : 'placeholder-theme'}" data-theme="${escapeHtml(state.theme)}">${classic ? `<header class="system-menu-bar"><div class="system-left"><button class="apple-menu-button" data-action="menu-toggle" data-menu="apple" type="button" aria-label="Apple menu">${rainbowAppleMarkup()}</button>${['File', 'Edit', 'View', 'Special', 'Help'].map((menu) => `<button class="system-menu-button" data-action="menu-toggle" data-menu="${menu.toLowerCase()}" type="button">${menu}</button>`).join('')}</div><div class="system-right"><div class="dimension-switcher" aria-label="Dimension switcher">${dimensions.map(([id, label]) => `<button class="dimension-button ${state.theme === id ? 'active' : ''}" data-action="theme" data-theme="${id}" aria-pressed="${state.theme === id}" type="button">${label}${state.theme === id ? ' (Active)' : ''}</button>`).join('')}</div><button class="quick-view-button" data-action="quick-view" type="button">Recruiter Quick View</button><time id="clock" aria-label="Current time"></time></div></header>${renderMenuPopup()}<main class="mac-desktop" aria-label="Classic Macintosh desktop"><div class="desktop-icons">${renderDesktopIcon('career', 'Macintosh HD', 'hard-drive')}${renderDesktopIcon('lab', 'The Lab', 'folder')}${renderDesktopIcon('idea', 'Idea-Board.app', 'application')}${renderDesktopIcon('about', 'About Nora.txt', 'document')}${renderDesktopIcon('resume', 'Resume.pdf', 'resume', 'download')}</div><div class="window-layer">${state.windowOrder.filter((id) => state.windows[id]).map((id, index) => renderWindow(id, index)).join('')}</div><div class="desktop-notice" aria-live="polite">${escapeHtml(state.notice)}</div><button class="trash-shortcut desktop-icon ${state.selectedIcon === 'contact' ? 'is-selected' : ''}" data-action="open-window" data-window="contact" type="button"><span class="desktop-icon-art">${iconMarkup('trash')}</span><span class="icon-label">Contact Me</span></button></main>` : `<main class="construction-screen"><div class="construction-card"><p class="document-kicker">DIMENSION ${escapeHtml(state.theme.toUpperCase())}</p><h1>Dimension under construction</h1><p>Switch to Classic Mac to experience the active theme.</p><button class="mac-button primary" data-action="theme" data-theme="retro" type="button">Return to Classic Mac</button></div></main>`}<nav class="mobile-theme-bar" aria-label="Dimension switcher">${dimensions.map(([id, label]) => `<button class="dimension-button ${state.theme === id ? 'active' : ''}" data-action="theme" data-theme="${id}" type="button">${label}</button>`).join('')}</nav>${renderSystemDialog()}${renderQuickView()}</div>`;
  updateClock();
  bindWindowInteractions();
  bindDialogs();
}

function updateClock() {
  const clock = document.querySelector('#clock');
  if (clock) clock.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

function bindWindowInteractions() {
  document.querySelectorAll('.mac-window').forEach((element) => {
    element.addEventListener('pointerdown', () => {
      const id = element.dataset.window;
      state.activeWindow = id;
      element.style.zIndex = '50';
      document.querySelectorAll('.mac-window').forEach((windowElement) => windowElement.classList.toggle('is-active', windowElement === element));
    });
  });
  document.querySelectorAll('[data-drag-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const element = handle.closest('.mac-window');
      const id = element.dataset.window;
      if (state.windows[id].maximized) return;
      state.activeWindow = id;
      element.style.zIndex = '50';
      const rect = element.getBoundingClientRect();
      const origin = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      const move = (moveEvent) => {
        const left = Math.max(8, origin.left + moveEvent.clientX - origin.x);
        const top = Math.max(30, origin.top + moveEvent.clientY - origin.y);
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        state.positions[id] = { left, top };
      };
      const end = () => document.removeEventListener('pointermove', move);
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', end, { once: true });
    });
  });
}

function bindDialogs() {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (dialog.id === 'quick-view' && state.quickView) {
        state.quickView = false;
        render();
      }
      if (dialog.id === 'about-computer' && state.aboutComputer) {
        state.aboutComputer = false;
        render();
      }
    }, { once: true });
    if ((dialog.id === 'quick-view' && state.quickView) || (dialog.id === 'about-computer' && state.aboutComputer)) dialog.showModal();
  });
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (state.menu && !event.target.closest('.menu-popup') && !event.target.closest('[data-action="menu-toggle"]')) {
    state.menu = null;
    render();
    if (!target) return;
  }
  if (!target) return;
  const { action, window: windowId, menu, theme, dialog, icon } = target.dataset;

  if (action === 'menu-toggle') {
    state.menu = state.menu === menu ? null : menu;
    render();
  } else if (action === 'open-window') {
    openWindow(windowId);
  } else if (action === 'select-icon') {
    state.selectedIcon = icon;
    render();
  } else if (action === 'select-download') {
    event.preventDefault();
    state.selectedIcon = icon;
    const link = document.createElement('a');
    link.href = profile.cvPath;
    link.download = 'Noratika-Chung-Resume.pdf';
    link.click();
    render();
  } else if (action === 'close-window') {
    closeWindow(windowId);
  } else if (action === 'zoom-window') {
    state.windows[windowId].maximized = !state.windows[windowId].maximized;
    state.activeWindow = windowId;
    render();
  } else if (action === 'theme') {
    state.theme = theme;
    state.menu = null;
    render();
  } else if (action === 'quick-view') {
    state.quickView = true;
    render();
  } else if (action === 'close-dialog') {
    document.querySelector(`#${dialog}`)?.close();
  } else if (action === 'about-computer') {
    state.aboutComputer = true;
    state.menu = null;
    render();
  } else if (action === 'download') {
    const link = document.createElement('a');
    link.href = profile.cvPath;
    link.download = 'Noratika-Chung-Resume.pdf';
    link.click();
    state.menu = null;
    render();
  } else if (action === 'switch-theme') {
    state.theme = 'retro';
    state.menu = null;
    render();
  } else if (action === 'restart') {
    state.menu = null;
    state.aboutComputer = false;
    state.quickView = false;
    state.notice = 'Macintosh restarted. Welcome back, Nora.';
    state.windowOrder = ['about'];
    state.windows = { about: { maximized: false } };
    state.activeWindow = 'about';
    render();
  } else if (action === 'open-external') {
    window.open(ideaBoard.localUrl, '_blank', 'noopener,noreferrer');
  }
});

setInterval(updateClock, 1000);
render();
