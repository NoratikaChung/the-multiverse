import './styles.css';
import { createHeader, updateHeader } from './components/Header.jsx';
import profile from './data/profile.json';
import career from './data/career.json';
import projects from './data/projects.json';
import { createThreeDDesk } from './themes/ThreeDDesk.jsx';

const app = document.querySelector('#app');
const ideaBoard = projects.find((project) => project.id === 'idea-board');
const validOsFlavors = ['win95', 'mac'];
const storedOsFlavor = window.localStorage.getItem('retro_os_flavor');

const state = {
  osFlavor: validOsFlavors.includes(storedOsFlavor) ? storedOsFlavor : 'win95',
  theme: 'retro',
  menu: null,
  startMenu: false,
  quickView: false,
  aboutComputer: false,
  selectedIcon: 'about',
  activeWindow: 'about',
  windowOrder: ['about'],
  windows: { about: { minimized: false, maximized: false } },
  positions: {},
  notice: '',
};
let threeDDesk;
let headerElement;

const macCatalog = {
  about: { title: 'About Nora.txt', icon: 'document', kind: 'about' },
  career: { title: 'Macintosh HD', icon: 'hard-drive', kind: 'career' },
  lab: { title: 'The Lab', icon: 'folder', kind: 'lab' },
  idea: { title: 'Idea-Board.app', icon: 'application', kind: 'idea' },
  contact: { title: 'Contact Me', icon: 'trash', kind: 'contact' },
};

const winCatalog = {
  about: { title: 'About_Nora.txt - Notepad', icon: 'win-document', kind: 'about' },
  career: { title: 'My Computer - Career Work', icon: 'computer', kind: 'career' },
  idea: { title: 'Idea-Board.exe', icon: 'win-application', kind: 'idea' },
  contact: { title: 'Recycle Bin - Contact Me', icon: 'recycle', kind: 'contact' },
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const tagsMarkup = (tags = []) => tags.map((tag) => `<span class="data-tag">${escapeHtml(tag)}</span>`).join('');
const catalog = () => (state.osFlavor === 'win95' ? winCatalog : macCatalog);

const iconMarkup = (name, className = '') => {
  const common = `class="pixel-icon ${className}" viewBox="0 0 32 32" role="img" aria-hidden="true" shape-rendering="crispEdges"`;
  const icons = {
    'hard-drive': `<svg ${common}><path fill="#e4d8bb" stroke="#111" d="M3 9h26v15H3z"/><path fill="#b9a889" stroke="#111" d="M5 11h22v7H5z"/><path fill="#171717" d="M7 13h18v3H7z"/><path fill="#e9e1ca" d="M6 20h20v2H6z"/><circle cx="25" cy="21" r="1.5" fill="#39a84a" stroke="#111"/></svg>`,
    folder: `<svg ${common}><path fill="#e0d2ae" stroke="#111" d="M3 8h10l2 3h14v14H3z"/><path fill="#f1e8cc" stroke="#111" d="M4 12h24v12H4z"/><path fill="#9aa6ae" stroke="#111" d="M13 15h6v6h-6z"/><path fill="#315a76" d="M14 16h4v1h-4zm0 2h4v1h-4z"/></svg>`,
    application: `<svg ${common}><path fill="#d9cba8" stroke="#111" d="M4 19h24v8H4z"/><path fill="#b5c1bd" stroke="#111" d="M7 7h18v14H7z"/><path fill="#fff" d="M9 9h14v9H9z"/><path fill="#5d8ca0" d="M10 10h12v7H10z"/><path fill="#f4db4f" d="M14 12h4v3h-4z"/><path fill="#d9cba8" stroke="#111" d="M2 27h28v2H2z"/><path fill="#222" d="M25 5l3 2-5 4-2-1z"/><path fill="#ef7b36" d="M23 10l-2 2-1-1 2-2z"/></svg>`,
    document: `<svg ${common}><path fill="#fff" stroke="#111" d="M6 2h14l6 6v22H6z"/><path fill="#c8c8c8" stroke="#111" d="M20 2v7h7"/><path fill="#111" d="M10 13h12v1H10zm0 4h12v1H10zm0 4h12v1H10zm0 4h8v1h-8z"/></svg>`,
    resume: `<svg ${common}><path fill="#fff" stroke="#111" d="M6 2h14l6 6v22H6z"/><path fill="#d9584b" stroke="#111" d="M20 2v7h7"/><path fill="#d9584b" d="M14 12h4v8h3l-5 5-5-5h3z"/></svg>`,
    trash: `<svg ${common}><path fill="#b8b8b8" stroke="#111" d="M7 9h18l-2 19H9z"/><path fill="#d7d7d7" stroke="#111" d="M5 6h22v4H5z"/><path fill="#b8b8b8" stroke="#111" d="M11 3h10l2 3H9z"/><path fill="none" stroke="#555" d="M11 11v15m4-15v15m4-15v15m4-15v15"/><path fill="#777" d="M3 28h26v2H3z"/></svg>`,
    computer: `<svg ${common}><path fill="#d8c59f" stroke="#111" d="M3 19h26v9H3z"/><path fill="#e8e0c9" stroke="#111" d="M7 4h18v16H7z"/><path fill="#111" d="M9 6h14v11H9z"/><path fill="#1084d0" d="M10 7h12v9H10z"/><path fill="#c0c0c0" d="M11 23h10v2H11z"/><path fill="#fff" opacity=".6" d="M8 5h16v1H8z"/></svg>`,
    recycle: `<svg ${common}><path fill="#4f9b55" stroke="#111" d="M7 8h18l-2 20H9z"/><path fill="#7bc16a" stroke="#111" d="M5 5h22v4H5z"/><path fill="#2d6f3d" d="M10 12h3v12h-3zm5 0h3v12h-3zm5 0h3v12h-3z"/><path fill="#fff" d="M11 7l3-4 2 2-2 2zm7-2l4 1-1 3-3-2zm-7 18l-3-3 2-2 2 3z"/></svg>`,
    'win-application': `<svg ${common}><path fill="#c0c0c0" stroke="#111" d="M3 21h26v7H3z"/><path fill="#c0c0c0" stroke="#111" d="M6 5h20v17H6z"/><path fill="#000080" d="M8 7h16v3H8z"/><path fill="#fff" d="M8 10h16v10H8z"/><path fill="#008080" d="M9 11h14v8H9z"/><path fill="#fff" d="M11 13h4v1h-4zm5 2h5v1h-5z"/><path fill="#111" d="M2 28h28v2H2z"/></svg>`,
    'win-document': `<svg ${common}><path fill="#fff" stroke="#111" d="M5 2h16l6 6v23H5z"/><path fill="#1084d0" d="M7 11h18v2H7zm0 4h18v2H7zm0 4h18v2H7zm0 4h12v2H7z"/><path fill="#c0c0c0" stroke="#111" d="M21 2v7h6"/></svg>`,
    floppy: `<svg ${common}><path fill="#1b3f8d" stroke="#111" d="M4 3h23l2 2v24H4z"/><path fill="#c0c0c0" d="M8 4h13v8H8z"/><path fill="#111" d="M10 5h9v5h-9z"/><path fill="#fff" d="M9 16h14v10H9z"/><path fill="#1084d0" d="M11 18h10v2H11z"/><path fill="#777" d="M11 22h10v1H11z"/></svg>`,
    speaker: `<svg ${common}><path fill="#111" d="M4 12h6l7-6v20l-7-6H4z"/><path fill="none" stroke="#111" stroke-width="2" d="M21 12c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/></svg>`,
    windows: `<svg ${common}><path fill="#ed3b3b" d="M3 4h11v11H3z"/><path fill="#4e9bd1" d="M16 3h13v12H16z"/><path fill="#f1cc3c" d="M3 17h11v11H3z"/><path fill="#55a453" d="M16 17h13v12H16z"/></svg>`,
  };
  return icons[name] ?? icons.document;
};

const rainbowAppleMarkup = () => `<svg class="apple-logo" viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges"><path fill="#111" d="M17 6c1-3 3-4 5-4 0 2-1 4-3 5 3 0 5 3 5 6 0 5-4 10-7 10-2 0-3-1-5-1s-3 1-5 1c-3 0-7-5-7-11 0-5 3-8 7-8 2 0 4 2 5 2 1 0 3-2 5-2z"/><path fill="#ed3b3b" d="M3 12h4v5H3z"/><path fill="#f39b37" d="M7 10h4v9H7z"/><path fill="#f4d33f" d="M11 9h4v11h-4z"/><path fill="#55ae53" d="M15 9h4v11h-4z"/><path fill="#4385bd" d="M19 10h4v9h-4z"/><path fill="#8f5ab2" d="M23 12h2v5h-2z"/><path fill="#55ae53" d="M14 4c1-2 3-3 5-3-1 2-2 3-4 4z"/></svg>`;

function setOsFlavor(flavor) {
  if (!validOsFlavors.includes(flavor)) return;
  state.osFlavor = flavor;
  window.localStorage.setItem('retro_os_flavor', flavor);
  state.menu = null;
  state.startMenu = false;
  state.quickView = false;
  state.aboutComputer = false;
  state.selectedIcon = 'about';
  state.activeWindow = 'about';
  state.windowOrder = ['about'];
  state.windows = { about: { minimized: false, maximized: false } };
  state.positions = {};
  render();
}

function openWindow(id) {
  if (!catalog()[id]) return;
  if (!state.windows[id]) {
    state.windows[id] = { minimized: false, maximized: false };
    state.windowOrder.push(id);
  }
  state.windows[id].minimized = false;
  state.activeWindow = id;
  state.selectedIcon = id;
  state.menu = null;
  state.startMenu = false;
  render();
}

function closeWindow(id) {
  delete state.windows[id];
  state.windowOrder = state.windowOrder.filter((windowId) => windowId !== id);
  state.activeWindow = state.windowOrder.findLast((windowId) => state.windows[windowId] && !state.windows[windowId].minimized) ?? null;
  render();
}

function downloadResume(event) {
  event?.preventDefault();
  const link = document.createElement('a');
  link.href = profile.cvPath;
  link.download = 'Noratika-Chung-Resume.pdf';
  link.click();
}

function sharedAboutContent() {
  const skillGroups = Object.entries(profile.skills).map(([group, skills]) => `<div class="skill-group"><h4>${escapeHtml(group)}</h4><p>${skills.map(escapeHtml).join(' · ')}</p></div>`).join('');
  return `<p class="document-kicker">${state.osFlavor === 'win95' ? 'NOTEPAD DOCUMENT' : 'PERSONAL FILE // SIMPLETEXT'}</p><h2>${escapeHtml(profile.name)}</h2><p class="document-subtitle">${escapeHtml(profile.title)} · ${escapeHtml(profile.location)}</p><p>${escapeHtml(profile.bio)}</p><section class="document-section"><h3>Education</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)} · CGPA ${escapeHtml(profile.education.cgpa)} · ${escapeHtml(profile.education.period)}</p></section><section class="document-section"><h3>Awards & scholarships</h3><ul>${profile.awards.map((award) => `<li><strong>${escapeHtml(award.title)}</strong><br><span>${escapeHtml(award.detail)}</span></li>`).join('')}</ul></section><section class="document-section"><h3>Certifications</h3><ul>${profile.certifications.map((certification) => `<li>${escapeHtml(certification)}</li>`).join('')}</ul></section><section class="document-section"><h3>Technical skills</h3><div class="skill-grid">${skillGroups}</div></section>`;
}

function careerContent() {
  return `<section class="finder-view"><div class="address-bar"><span>Address</span><strong>C:\\Career\\Experience</strong></div><header class="finder-toolbar"><span>My Computer</span><span>${career.length} objects</span></header><div class="finder-columns"><span>Name</span><span>Type</span><span>Modified</span></div><div class="career-list">${career.map((entry) => `<article class="career-entry"><div class="file-row"><span class="file-row-icon">${iconMarkup(state.osFlavor === 'win95' ? 'win-document' : 'document')}</span><div><h3>${escapeHtml(entry.role)}</h3><p>${escapeHtml(entry.company)} · ${escapeHtml(entry.location)}</p></div></div><div class="career-period">${escapeHtml(entry.period)}</div><div class="career-detail"><p>${escapeHtml(entry.summary)}</p><ul>${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul><div class="tag-row">${tagsMarkup(entry.tags)}</div></div></article>`).join('')}</div></section>`;
}

function ideaContent() {
  return `<section class="idea-shell"><div class="iframe-toolbar"><span>${escapeHtml(ideaBoard.localUrl)}</span><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a></div><iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive application" loading="lazy"></iframe><div class="status-bar">${escapeHtml(ideaBoard.title)} · local application · ready</div></section>`;
}

function labContent() {
  return `<section class="lab-view"><p class="document-kicker">SYSTEM FOLDER // THE LAB</p><h2>Interactive experiments</h2><article class="lab-project"><div class="lab-project-icon">${iconMarkup('application')}</div><div><h3>${escapeHtml(ideaBoard.title)}</h3><p class="project-tagline">${escapeHtml(ideaBoard.tagline)}</p><p>${escapeHtml(ideaBoard.description)}</p><div class="tag-row">${tagsMarkup(ideaBoard.tags)}</div><div class="project-actions"><button class="retro-button primary" data-action="open-window" data-window="idea" type="button">Open Idea-Board</button><a class="retro-button" href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">View source</a></div></div></article></section>`;
}

function contactContent() {
  return `<section class="contact-view"><div class="contact-trash">${iconMarkup(state.osFlavor === 'win95' ? 'recycle' : 'trash')}</div><p class="document-kicker">CONTACT CARD // NORA</p><h2>Let's connect.</h2><p>Have a thoughtful project, a systems problem, or an interesting idea? Send a signal.</p><div class="contact-links"><a href="mailto:${escapeHtml(profile.email)}"><strong>Email</strong><span>${escapeHtml(profile.email)}</span></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><strong>GitHub</strong><span>github.com/NoratikaChung</span></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><strong>LinkedIn</strong><span>linkedin.com/in/noratika-chung-8b2570219</span></a></div></section>`;
}

function renderWindowContent(kind) {
  if (kind === 'about') return `<article class="${state.osFlavor === 'win95' ? 'notepad-document' : 'simpletext-document'}">${sharedAboutContent()}</article>`;
  if (kind === 'career') return careerContent();
  if (kind === 'idea') return ideaContent();
  if (kind === 'lab') return labContent();
  return contactContent();
}

function renderDesktopIcon(id, label, iconName, action = 'open-window') {
  const selected = state.selectedIcon === id;
  if (action === 'download') return `<a class="desktop-icon ${selected ? 'is-selected' : ''}" href="${escapeHtml(profile.cvPath)}" download data-action="download-resume" data-icon="${id}"><span class="desktop-icon-art">${iconMarkup(iconName)}</span><span class="icon-label">${label}</span></a>`;
  return `<button class="desktop-icon ${selected ? 'is-selected' : ''}" data-action="${action}" data-window="${id}" type="button"><span class="desktop-icon-art">${iconMarkup(iconName)}</span><span class="icon-label">${label}</span></button>`;
}

function renderWindow(id, index) {
  const config = catalog()[id];
  const windowState = state.windows[id];
  const position = state.positions[id] ?? { left: state.osFlavor === 'win95' ? 150 + index * 28 : 138 + index * 32, top: state.osFlavor === 'win95' ? 75 + index * 24 : 60 + index * 24 };
  const active = state.activeWindow === id;
  const classes = [state.osFlavor === 'win95' ? 'win-window' : 'mac-window'];
  if (active) classes.push('is-active');
  if (windowState.minimized) classes.push('is-minimized');
  if (windowState.maximized) classes.push('is-maximized');
  const style = windowState.maximized ? '' : `left:${position.left}px;top:${position.top}px;z-index:${active ? 50 : index + 2};`;
  if (state.osFlavor === 'win95') return `<article class="${classes.join(' ')}" data-window="${id}" style="${style}" aria-label="${escapeHtml(config.title)}"><header class="win-titlebar" data-drag-handle="true"><span class="win-title-text">${iconMarkup(config.icon, 'title-icon')}${escapeHtml(config.title)}</span><div class="win-controls"><button class="win-control" data-action="minimize-window" data-window="${id}" type="button" aria-label="Minimize ${escapeHtml(config.title)}">_</button><button class="win-control" data-action="zoom-window" data-window="${id}" type="button" aria-label="Maximize ${escapeHtml(config.title)}">□</button><button class="win-control close" data-action="close-window" data-window="${id}" type="button" aria-label="Close ${escapeHtml(config.title)}">X</button></div></header><nav class="win-window-menu" aria-label="${escapeHtml(config.title)} menu"><button type="button">File</button><button type="button">Edit</button><button type="button">Search</button><button type="button">Help</button></nav><div class="win-window-body">${renderWindowContent(config.kind)}</div></article>`;
  return `<article class="${classes.join(' ')}" data-window="${id}" style="${style}" aria-label="${escapeHtml(config.title)}"><header class="mac-titlebar" data-drag-handle="true"><button class="window-box close-box" data-action="close-window" data-window="${id}" type="button" aria-label="Close ${escapeHtml(config.title)}"></button><span class="window-title">${escapeHtml(config.title)}</span><span class="mac-window-actions"><button class="window-box minimize-box" data-action="minimize-window" data-window="${id}" type="button" aria-label="Minimize ${escapeHtml(config.title)}">_</button><button class="window-box zoom-box" data-action="zoom-window" data-window="${id}" type="button" aria-label="Zoom ${escapeHtml(config.title)}"></button></span></header><div class="mac-window-body">${renderWindowContent(config.kind)}</div></article>`;
}


function renderWindowsStartMenu() {
  if (!state.startMenu) return '';
  return `<aside class="win-start-menu" aria-label="Start menu"><div class="win-start-banner"><strong>Windows</strong><span>95</span></div><div class="win-start-items"><button data-action="start-submenu" type="button">Programs <span>▶</span></button><button data-action="open-window" data-window="career" type="button">Documents <span>▶</span></button><button data-action="set-os" data-os="mac" type="button">Switch to Mac OS</button><button data-action="download-resume" type="button">Download CV</button><button data-action="shutdown" type="button">Shut Down...</button></div></aside>`;
}


function renderDialogs() {
  const about = state.aboutComputer ? `<dialog class="system-dialog" id="about-computer" aria-labelledby="about-computer-title"><div class="dialog-titlebar"><h2 id="about-computer-title">About This Computer</h2><button class="window-box close-box" data-action="close-dialog" data-dialog="about-computer" type="button" aria-label="Close About This Computer"></button></div><div class="dialog-content"><div class="about-computer-mark">${rainbowAppleMarkup()}</div><h3>Macintosh Portfolio System 7.5.3</h3><p><strong>${escapeHtml(profile.name)}</strong> · ${escapeHtml(profile.title)}</p><p>${escapeHtml(profile.bio)}</p><dl class="system-specs"><div><dt>Memory</dt><dd>First-Class academic background</dd></div><div><dt>Education</dt><dd>USM · CGPA ${escapeHtml(profile.education.cgpa)}</dd></div><div><dt>Location</dt><dd>${escapeHtml(profile.location)}</dd></div></dl></div><div class="dialog-actions"><button class="retro-button" data-action="restart" type="button">Restart</button><button class="retro-button primary" data-action="close-dialog" data-dialog="about-computer" type="button">Close</button></div></dialog>` : '';
  const quick = state.quickView ? `<dialog class="quick-dialog" id="quick-view" aria-labelledby="quick-view-title"><div class="quick-page"><div class="quick-actions"><button class="retro-button" data-action="close-dialog" data-dialog="quick-view" type="button">Close quick view</button><a class="retro-button primary" href="${escapeHtml(profile.cvPath)}" download>Download CV (PDF)</a></div><header class="quick-header"><div><p class="document-kicker">RECRUITER QUICK VIEW</p><h2 id="quick-view-title">${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.title)} · ${escapeHtml(profile.location)}</p></div><div class="quick-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><a href="${escapeHtml(profile.github)}">GitHub</a><a href="${escapeHtml(profile.linkedin)}">LinkedIn</a></div></header><section class="quick-section"><h3>Profile</h3><p>${escapeHtml(profile.bio)}</p></section><section class="quick-section"><h3>Experience</h3>${career.map((entry) => `<article class="quick-entry"><strong>${escapeHtml(entry.role)}</strong><span>${escapeHtml(entry.company)} · ${escapeHtml(entry.period)}</span><p>${escapeHtml(entry.summary)}</p><ul>${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul></article>`).join('')}</section><section class="quick-section"><h3>Education & credentials</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)} · CGPA ${escapeHtml(profile.education.cgpa)} · ${escapeHtml(profile.education.period)}</p><div class="quick-columns"><div><strong>Certifications</strong><ul>${profile.certifications.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div><strong>Core skills</strong><p>${Object.values(profile.skills).flat().map(escapeHtml).join(' · ')}</p></div></div></section></div></dialog>` : '';
  return `${about}${quick}`;
}

function renderWin95() {
  return `<div class="win95-desktop"><main class="win-desktop-surface" aria-label="Windows 95 desktop"><div class="win-desktop-icons">${renderDesktopIcon('career', 'My Computer', 'computer')}${renderDesktopIcon('contact', 'Recycle Bin', 'recycle')}${renderDesktopIcon('idea', 'Idea-Board.exe', 'win-application')}${renderDesktopIcon('about', 'About_Nora.txt', 'win-document')}${renderDesktopIcon('resume', 'Resume.pdf', 'resume', 'download')}${renderDesktopIcon('boot-mac', 'Boot Macintosh System 7.exe', 'floppy', 'set-os-mac')}</div><div class="win-window-layer">${state.windowOrder.filter((id) => state.windows[id]).map((id, index) => renderWindow(id, index)).join('')}</div><div class="desktop-notice" aria-live="polite">${escapeHtml(state.notice)}</div></main><footer class="win-taskbar"><button class="win-start-button" data-action="toggle-start" aria-expanded="${state.startMenu}" type="button">${iconMarkup('windows', 'start-icon')}<strong>Start</strong></button><div class="win-taskbar-tabs" aria-label="Open windows">${state.windowOrder.filter((id) => state.windows[id]).map((id) => `<button class="win-taskbar-tab ${state.activeWindow === id ? 'active' : ''} ${state.windows[id].minimized ? 'minimized' : ''}" data-action="restore-window" data-window="${id}" type="button">${iconMarkup(catalog()[id].icon, 'task-icon')}${escapeHtml(catalog()[id].title)}</button>`).join('')}</div><div class="win-tray"><span class="speaker-icon">${iconMarkup('speaker')}</span></div></footer>${renderWindowsStartMenu()}</div>`;
}

function renderMac() {
  return `<div class="classic-mac"><main class="mac-desktop" aria-label="Classic Macintosh desktop"><div class="mac-desktop-icons">${renderDesktopIcon('career', 'Macintosh HD', 'hard-drive')}${renderDesktopIcon('lab', 'The Lab', 'folder')}${renderDesktopIcon('idea', 'Idea-Board.app', 'application')}${renderDesktopIcon('about', 'About Nora.txt', 'document')}${renderDesktopIcon('resume', 'Resume.pdf', 'resume', 'download')}${renderDesktopIcon('boot-win', 'Boot to Windows 95', 'floppy', 'set-os-win')}</div><div class="mac-window-layer">${state.windowOrder.filter((id) => state.windows[id]).map((id, index) => renderWindow(id, index)).join('')}</div><button class="mac-desktop-icon trash-shortcut ${state.selectedIcon === 'contact' ? 'is-selected' : ''}" data-action="open-window" data-window="contact" type="button"><span class="desktop-icon-art">${iconMarkup('trash')}</span><span class="icon-label">Contact Me</span></button><div class="desktop-notice" aria-live="polite">${escapeHtml(state.notice)}</div></main></div>`;
}

function handleHeaderAction(action, data) {
  if (action === 'set-os') setOsFlavor(data.os);
  else if (action === 'theme') {
    state.theme = data.theme;
    state.menu = null;
    render();
  } else if (action === 'menu-toggle') {
    state.menu = state.menu === data.menu ? null : data.menu;
    render();
  } else if (action === 'quick-view') {
    state.quickView = true;
    render();
  } else if (action === 'download-resume') downloadResume();
  else if (action === 'about-computer') {
    state.aboutComputer = true;
    state.menu = null;
    render();
  } else if (action === 'restart') {
    state.menu = null;
    state.aboutComputer = false;
    state.notice = `${state.osFlavor === 'win95' ? 'Windows 95' : 'Macintosh'} restarted. Welcome back, Nora.`;
    state.windowOrder = ['about'];
    state.windows = { about: { minimized: false, maximized: false } };
    state.activeWindow = 'about';
    render();
  }
}

function currentClockText() {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

function render() {
  const isRetro = state.theme === 'retro';
  const isThreeDDesk = state.theme === 'desk';
  let shell = app.querySelector('.site-shell');
  if (!shell) {
    shell = document.createElement('div');
    shell.innerHTML = '<div class="header-root"></div><div class="viewport-root"></div><div class="dialog-root"></div>';
    app.replaceChildren(shell);
    headerElement = createHeader({ onAction: handleHeaderAction });
    shell.querySelector('.header-root').append(headerElement);
  }
  shell.className = `site-shell ${isRetro ? (state.osFlavor === 'win95' ? 'win95-shell' : 'mac-shell') : 'placeholder-theme'}`;
  shell.dataset.theme = state.theme;
  updateHeader(headerElement, { currentTheme: state.theme, osFlavor: state.osFlavor, menu: state.menu, clockText: currentClockText() });
  const viewport = shell.querySelector('.viewport-root');
  if (isThreeDDesk) {
    if (!threeDDesk) {
      viewport.innerHTML = '<main class="three-desk-viewport" aria-label="Three-dimensional developer desk"><div class="three-desk-mount"></div></main>';
      threeDDesk = createThreeDDesk({ container: viewport.querySelector('.three-desk-mount'), profile, career, ideaBoard });
    }
  } else {
    if (threeDDesk) {
      threeDDesk.dispose();
      threeDDesk = undefined;
    }
    viewport.innerHTML = isRetro ? (state.osFlavor === 'win95' ? renderWin95() : renderMac()) : `<main class="construction-screen"><div class="construction-card"><p class="document-kicker">DIMENSION ${escapeHtml(state.theme.toUpperCase())}</p><h1>Dimension under construction</h1><p>Switch to Retro OS to experience the active theme.</p><button class="retro-button primary" data-action="theme" data-theme="retro" type="button">Return to Retro OS</button></div></main>`;
  }
  shell.querySelector('.dialog-root').innerHTML = renderDialogs();
  updateClock();
  bindWindowInteractions();
  bindDialogs();
}

function updateClock() {
  const clock = document.querySelector('#unified-clock');
  if (clock) clock.textContent = currentClockText();
}

function bindWindowInteractions() {
  document.querySelectorAll('.win-window, .mac-window').forEach((element) => {
    element.addEventListener('pointerdown', () => {
      const id = element.dataset.window;
      if (!state.windows[id]) return;
      state.activeWindow = id;
      state.windows[id].minimized = false;
      element.style.zIndex = '50';
      document.querySelectorAll('.win-window, .mac-window').forEach((windowElement) => windowElement.classList.toggle('is-active', windowElement === element));
    });
  });
  document.querySelectorAll('[data-drag-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const element = handle.closest('.win-window, .mac-window');
      const id = element.dataset.window;
      if (state.windows[id].maximized) return;
      state.activeWindow = id;
      element.style.zIndex = '50';
      const rect = element.getBoundingClientRect();
      const origin = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      const move = (moveEvent) => {
        const left = Math.max(4, origin.left + moveEvent.clientX - origin.x);
        const top = Math.max(4, origin.top + moveEvent.clientY - origin.y);
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
  if (state.menu && !event.target.closest('.unified-header')) {
    state.menu = null;
    render();
    if (!target) return;
  }
  if (state.startMenu && !event.target.closest('.win-start-menu') && !event.target.closest('[data-action="toggle-start"]')) {
    state.startMenu = false;
    render();
    if (!target) return;
  }
  if (!target) return;
  const { action, window: windowId, menu, os, theme, dialog, icon } = target.dataset;

  if (action === 'set-os') setOsFlavor(os);
  else if (action === 'set-os-mac') setOsFlavor('mac');
  else if (action === 'set-os-win') setOsFlavor('win95');
  else if (action === 'toggle-start') {
    state.startMenu = !state.startMenu;
    render();
  } else if (action === 'start-submenu') {
    state.notice = 'Programs are ready in this portfolio edition.';
    state.startMenu = false;
    render();
  } else if (action === 'open-window' || action === 'restore-window') openWindow(windowId);
  else if (action === 'minimize-window') {
    state.windows[windowId].minimized = true;
    state.activeWindow = state.windowOrder.findLast((id) => state.windows[id] && !state.windows[id].minimized) ?? null;
    render();
  } else if (action === 'close-window') closeWindow(windowId);
  else if (action === 'zoom-window') {
    state.windows[windowId].maximized = !state.windows[windowId].maximized;
    state.activeWindow = windowId;
    render();
  } else if (action === 'download-resume') downloadResume(event);
  else if (action === 'theme') {
    state.theme = theme;
    state.menu = null;
    state.startMenu = false;
    render();
  } else if (action === 'quick-view') {
    state.quickView = true;
    render();
  } else if (action === 'close-dialog') document.querySelector(`#${dialog}`)?.close();
  else if (action === 'about-computer') {
    state.aboutComputer = true;
    state.menu = null;
    render();
  } else if (action === 'restart') {
    state.menu = null;
    state.aboutComputer = false;
    state.notice = `${state.osFlavor === 'win95' ? 'Windows 95' : 'Macintosh'} restarted. Welcome back, Nora.`;
    state.windowOrder = ['about'];
    state.windows = { about: { minimized: false, maximized: false } };
    state.activeWindow = 'about';
    render();
  } else if (action === 'shutdown') {
    state.startMenu = false;
    state.notice = 'It is now safe to close this portfolio window.';
    render();
  } else if (action === 'download-icon') {
    downloadResume(event);
    state.selectedIcon = icon;
    render();
  }
});

setInterval(updateClock, 1000);
render();
