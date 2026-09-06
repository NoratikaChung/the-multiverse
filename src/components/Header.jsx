const dimensions = [
  ['retro', 'Retro'],
  ['desk', '3D Desk'],
  ['rpg', 'Pixel RPG'],
  ['sketch', 'Sketchbook'],
  ['hud', '🌐 Neural Core'],
  ['megastructure', '⚡ Megastructure'],
];

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function macMenuMarkup(menu) {
  const items = {
    apple: '<button data-header-action="about-computer" type="button">About This Computer...</button>',
    file: '<button data-header-action="download-resume" type="button">Download CV</button><button type="button" disabled>Close Window</button>',
    edit: '<button type="button" disabled>Undo</button><button type="button" disabled>Copy</button>',
    view: '<button type="button" disabled>as Icons</button><button type="button" disabled>as List</button>',
    special: '<button data-header-action="restart" type="button">Restart</button><button data-header-action="set-os" data-os="win95" type="button">Boot to Windows 95</button><button data-header-action="theme" data-theme="retro" type="button">Switch Theme</button>',
    help: '<button data-header-action="about-computer" type="button">Macintosh Help</button>',
  };
  return `<div class="header-menu-popup" role="menu" aria-label="${escapeHtml(menu)} menu">${items[menu] ?? ''}</div>`;
}

function headerIcon(icon) {
  return `<span class="header-control-icon" aria-hidden="true">${icon}</span>`;
}

export function createHeader({ onAction }) {
  const header = document.createElement('header');
  header.className = 'unified-header';
  header.addEventListener('click', (event) => {
    const control = event.target.closest('[data-header-action]');
    if (!control) return;
    event.stopPropagation();
    onAction(control.dataset.headerAction, control.dataset);
  });
  return header;
}

export function updateHeader(header, { currentTheme, osFlavor, menu, clockText }) {
  const isRetro = currentTheme === 'retro';
  const isMac = isRetro && osFlavor === 'mac';
  const leftSection = isMac
    ? `<div class="header-context header-mac-context"><button class="header-apple-button" data-header-action="menu-toggle" data-menu="apple" aria-label="Apple menu" type="button">🍎</button>${['File', 'Edit', 'View', 'Special', 'Help'].map((item) => `<button class="header-menu-button" data-header-action="menu-toggle" data-menu="${item.toLowerCase()}" type="button">${item}</button>`).join('')}</div>`
    : `<div class="header-context header-brand"><span class="header-brand-mark" aria-hidden="true">✦</span><span>THE MULTIVERSE // Nora Chung</span></div>`;
  const osSwitcher = `<div class="header-os-switcher ${isRetro ? '' : 'is-hidden'}" aria-label="OS flavor"${isRetro ? '' : ' aria-hidden="true"'}><span class="header-os-label">OS:</span><button class="header-segment ${osFlavor === 'win95' ? 'active' : ''}" data-header-action="set-os" data-os="win95" aria-pressed="${osFlavor === 'win95'}" type="button">${headerIcon('🪟')} Win 95</button><button class="header-segment ${osFlavor === 'mac' ? 'active' : ''}" data-header-action="set-os" data-os="mac" aria-pressed="${osFlavor === 'mac'}" type="button">${headerIcon('🍎')} System 7</button></div>`;
  const dimensionSwitcher = `<div class="header-dimensions" aria-label="Dimension switcher">${dimensions.map(([id, label]) => `<button class="header-segment ${currentTheme === id ? 'active' : ''}" data-header-action="theme" data-theme="${id}" aria-pressed="${currentTheme === id}" type="button">${label}${currentTheme === id ? ' (Active)' : ''}</button>`).join('')}</div>`;
  header.innerHTML = `${leftSection}<div class="header-controls">${osSwitcher}${dimensionSwitcher}<button class="header-quick-view" data-header-action="quick-view" type="button">${headerIcon('📄')} Recruiter Quick View</button><time class="header-clock" id="unified-clock" aria-label="Current time">${escapeHtml(clockText)}</time></div>${isMac && menu ? macMenuMarkup(menu) : ''}`;
  header.dataset.theme = currentTheme;
  header.dataset.osFlavor = osFlavor;
  header.setAttribute('aria-label', isMac ? 'Macintosh system menu' : 'The Multiverse global navigation');
}
