import { getProjectUrl } from '../data/project-url.js';
const TILE_SIZE = 32;
const WORLD_COLUMNS = 56;
const WORLD_ROWS = 36;
const WORLD_WIDTH = WORLD_COLUMNS * TILE_SIZE;
const WORLD_HEIGHT = WORLD_ROWS * TILE_SIZE;
const PLAYER_RADIUS = 10;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const tagMarkup = (tags = []) => tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
const listMarkup = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function rect(x, y, width, height) {
  return { x, y, width, height };
}

function overlapsCircle(circle, box) {
  const nearestX = clamp(circle.x, box.x, box.x + box.width);
  const nearestY = clamp(circle.y, box.y, box.y + box.height);
  return Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.radius;
}

function drawPixelText(context, text, x, y, options = {}) {
  context.save();
  context.font = options.font ?? '600 15px system-ui, sans-serif';
  context.textAlign = options.align ?? 'left';
  context.textBaseline = options.baseline ?? 'alphabetic';
  context.fillStyle = options.color ?? '#fff8d6';
  context.fillText(text, x, y);
  context.restore();
}

function drawTree(context, x, y) {
  context.fillStyle = '#382f3e';
  context.fillRect(x - 4, y + 12, 9, 19);
  context.fillStyle = '#5a382d';
  context.fillRect(x - 7, y + 14, 15, 17);
  context.fillStyle = '#155942';
  context.fillRect(x - 20, y - 8, 40, 25);
  context.fillStyle = '#237a50';
  context.fillRect(x - 15, y - 18, 30, 30);
  context.fillStyle = '#38a45f';
  context.fillRect(x - 7, y - 24, 16, 17);
  context.fillStyle = '#72c56c';
  context.fillRect(x - 12, y - 12, 7, 6);
  context.fillRect(x + 7, y - 4, 6, 5);
}

function drawWaterTile(context, x, y) {
  context.fillStyle = '#236b91';
  context.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  context.fillStyle = '#2f8eb0';
  context.fillRect(x + 2, y + 5, 28, 4);
  context.fillStyle = '#52b9c5';
  context.fillRect(x + 7, y + 7, 10, 2);
  context.fillRect(x + 20, y + 22, 8, 2);
}

function drawPathTile(context, x, y, variant) {
  context.fillStyle = '#bd9b70';
  context.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  context.fillStyle = variant % 2 ? '#d2b27f' : '#aa885f';
  context.fillRect(x + 3, y + 4, 12, 4);
  context.fillRect(x + 18, y + 20, 10, 4);
  context.fillStyle = '#987653';
  context.fillRect(x + 13, y + 13, 4, 3);
}

function drawBuilding(context, building) {
  const { x, y, width, height, kind, title } = building;
  const colors = {
    archives: { wall: '#d4c8a6', trim: '#77664e', roof: '#465b74', tile: '#68819a' },
    arcade: { wall: '#c39ac5', trim: '#704b79', roof: '#534575', tile: '#796798' },
    academy: { wall: '#e0bf93', trim: '#926b50', roof: '#964f48', tile: '#be7462' },
    cottage: { wall: '#f1d1a7', trim: '#9b6952', roof: '#4a6964', tile: '#6c9182' },
  }[kind];
  const center = x + width / 2;
  const wallTop = y + 74;
  const bottom = y + height;
  context.fillStyle = '#284e3d';
  context.fillRect(x + 6, bottom - 4, width, 12);
  context.fillStyle = colors.trim;
  context.fillRect(x, wallTop, width, height - 74);
  context.fillStyle = colors.wall;
  context.fillRect(x + 8, wallTop + 6, width - 16, height - 86);
  context.fillStyle = colors.trim;
  context.fillRect(x + 7, bottom - 16, width - 14, 10);
  context.fillRect(x + 7, wallTop + 8, 8, height - 28 - 74);
  context.fillRect(x + width - 15, wallTop + 8, 8, height - 28 - 74);
  context.fillStyle = colors.roof;
  context.beginPath();
  context.moveTo(x - 12, wallTop + 4);
  context.lineTo(x + 36, y + 8);
  context.lineTo(x + width - 36, y + 8);
  context.lineTo(x + width + 12, wallTop + 4);
  context.closePath();
  context.fill();
  context.fillStyle = colors.tile;
  for (let row = 0; row < 4; row += 1) {
    const inset = 36 - row * 12;
    context.fillRect(x + inset, y + 15 + row * 15, width - inset * 2, 3);
    for (let column = 0; column < Math.floor((width - inset * 2) / 29); column += 1) {
      context.fillRect(x + inset + column * 29 + (row % 2) * 11, y + 19 + row * 15, 3, 8);
    }
  }
  context.fillStyle = '#fdf3d5';
  context.fillRect(x + 31, wallTop - 9, width - 62, 28);
  drawPixelText(context, title, center, wallTop + 10, { align: 'center', font: '700 16px system-ui, sans-serif', color: '#283342' });
  for (const windowX of [x + 34, x + width - 86]) {
    context.fillStyle = colors.trim;
    context.fillRect(windowX - 5, wallTop + 34, 62, 54);
    context.fillStyle = '#a7d8de';
    context.fillRect(windowX, wallTop + 39, 52, 42);
    context.fillStyle = '#e7f8ed';
    context.fillRect(windowX + 5, wallTop + 43, 14, 5);
    context.fillStyle = '#f7ebcb';
    context.fillRect(windowX + 24, wallTop + 39, 4, 42);
    context.fillRect(windowX, wallTop + 58, 52, 4);
    context.fillStyle = colors.trim;
    context.fillRect(windowX - 8, wallTop + 87, 68, 7);
    if (kind === 'cottage') {
      context.fillStyle = '#568455';
      context.fillRect(windowX - 3, wallTop + 80, 58, 7);
      context.fillStyle = '#ec9692';
      for (let flower = 0; flower < 5; flower += 1) context.fillRect(windowX + flower * 11, wallTop + 76, 5, 5);
    }
  }
  context.fillStyle = colors.trim;
  context.fillRect(center - 30, bottom - 88, 60, 82);
  context.fillStyle = '#344455';
  context.fillRect(center - 23, bottom - 80, 46, 74);
  context.fillStyle = '#bbd6cd';
  context.fillRect(center - 16, bottom - 73, 32, 25);
  context.fillStyle = '#f7d47f';
  context.fillRect(center + 12, bottom - 36, 5, 5);
  context.fillStyle = '#d7d1bf';
  context.fillRect(center - 35, bottom - 6, 70, 6);
  context.fillStyle = '#9c998a';
  context.fillRect(center - 40, bottom, 80, 8);
  context.fillStyle = '#f5daa0';
  for (const lanternX of [center - 44, center + 38]) {
    context.fillRect(lanternX, bottom - 65, 6, 14);
  }
  if (kind === 'archives') {
    context.fillStyle = '#f0e1bd';
    for (const columnX of [x + 17, x + width - 29]) {
      context.fillRect(columnX, wallTop + 28, 12, height - 119);
      context.fillRect(columnX - 4, wallTop + 24, 20, 7);
      context.fillRect(columnX - 4, bottom - 22, 20, 7);
    }
  }
  if (kind === 'academy' || kind === 'cottage') {
    context.fillStyle = colors.trim;
    context.fillRect(x + width - 66, y - 3, 20, 29);
    context.fillStyle = colors.wall;
    context.fillRect(x + width - 70, y - 8, 28, 7);
  }
}

function drawCharacter(context, x, y, palette, direction, walkingFrame, isCourier = false) {
  const step = [0, 2, 0, -2][walkingFrame % 4];
  const skin = isCourier ? '#d9a679' : '#edbd98';
  const sideways = direction === 'left' || direction === 'right';
  const facingLeft = direction === 'left';
  const back = direction === 'up';
  context.save();
  context.translate(Math.round(x), Math.round(y));
  context.fillStyle = 'rgba(25, 25, 45, .22)';
  context.fillRect(-11, 7, 22, 5);
  context.fillStyle = isCourier ? palette.hair : '#12141e';
  context.fillRect(sideways ? -7 : -10, -31, sideways ? 15 : 20, 20);
  if (!isCourier) {
    context.fillRect(-11, -23, 5, 23);
    context.fillRect(6, -23, 5, 23);
  }
  if (!back) {
    context.fillStyle = skin;
    context.fillRect(sideways ? (facingLeft ? -9 : -3) : -7, -23, sideways ? 12 : 14, 13);
    context.fillStyle = isCourier ? '#514133' : '#673c25';
    if (sideways) context.fillRect(facingLeft ? -8 : 6, -19, 2, 3);
    else {
      context.fillRect(-5, -19, 2, 3);
      context.fillRect(3, -19, 2, 3);
    }
    context.fillStyle = isCourier ? palette.hair : '#12141e';
    context.fillRect(-8, -29, 16, 7);
    if (sideways) context.fillRect(facingLeft ? 1 : -7, -24, 6, 15);
    else context.fillRect(-8, -23, 4, 5);
  }
  context.fillStyle = palette.body;
  context.fillRect(sideways ? -6 : -9, -10, sideways ? 12 : 18, 13);
  context.fillStyle = palette.accent;
  context.fillRect(sideways ? -6 : -9, 1, sideways ? 12 : 18, 3);
  context.fillStyle = palette.legs;
  if (isCourier) {
    context.fillRect(-7, 4, 6, 8 + step);
    context.fillRect(2, 4, 6, 8 - step);
  } else {
    context.fillRect(sideways ? -7 : -10, 4, sideways ? 14 : 20, 7);
    context.fillStyle = skin;
    context.fillRect(-6, 11, 4, 4 + step);
    context.fillRect(2, 11, 4, 4 - step);
  }
  context.fillStyle = '#29313d';
  context.fillRect(-7, 14 + step, 6, 4);
  context.fillRect(1, 14 - step, 6, 4);
  context.fillStyle = skin;
  if (sideways) context.fillRect(facingLeft ? -6 : 3, -6 + step, 4, 10);
  else {
    context.fillRect(-12, -7 + step, 4, 10);
    context.fillRect(8, -7 - step, 4, 10);
  }
  if (back && !isCourier) {
    context.fillStyle = '#12141e';
    context.fillRect(-8, -25, 16, 20);
    context.fillStyle = '#b98653';
    context.fillRect(-3, -8, 6, 2);
  }
  if (isCourier) {
    context.fillStyle = '#e6bc62';
    context.fillRect(-12, -33, 24, 5);
    context.fillRect(-8, -38, 16, 5);
    context.fillStyle = '#f6df91';
    context.fillRect(11, -3, 10, 10);
  }
  context.restore();
}

export function createPixelRPG({ container, profile, career, ideaBoard }) {
  const ideaBoardUrl = getProjectUrl(ideaBoard);
  const root = document.createElement('section');
  root.className = 'pixel-rpg';
  root.setAttribute('aria-label', "Nora's Realm 2D pixel RPG");
  root.innerHTML = `
    <canvas class="pixel-rpg-canvas" tabindex="0" aria-label="Explore Nora's Realm" aria-describedby="pixel-rpg-instructions"></canvas>
    <div class="pixel-rpg-hud">
      <div><p class="pixel-rpg-kicker">DIMENSION 02 // NORA'S REALM</p><h1>Nora's Realm</h1></div>
      <p class="pixel-rpg-help" id="pixel-rpg-instructions"><kbd>WASD</kbd> / <kbd>ARROWS</kbd> Move · <kbd>E</kbd> / <kbd>SPACE</kbd> Inspect · Click to walk. Focus the map to use movement keys.</p>
    </div>
    <div class="pixel-rpg-room-heading" hidden><h2></h2><p></p></div>
    <div class="pixel-rpg-location" aria-live="polite"></div>
    <div class="pixel-rpg-status" role="status" aria-live="polite"></div>
    <div class="pixel-rpg-scene-controls" aria-label="Nearby location actions">
      <button data-rpg-action="interact" type="button" disabled>Explore to find an action</button>
      <button data-rpg-action="exit-room" type="button" hidden>Exit room</button>
      <button data-rpg-action="focus-map" type="button">Focus map</button>
    </div>
    <details class="pixel-rpg-guide"><summary>Location &amp; object guide</summary><div class="pixel-rpg-guide-content"></div></details>
    <div class="pixel-rpg-dialogue" hidden role="dialog" aria-modal="true" aria-labelledby="pixel-rpg-dialogue-title">
      <div class="pixel-rpg-dialogue-inner">
        <h2 id="pixel-rpg-dialogue-title"></h2>
        <p class="pixel-rpg-dialogue-text"></p>
        <div class="pixel-rpg-dialogue-options"></div>
      </div>
    </div>
    <div class="pixel-rpg-modal" hidden role="dialog" aria-modal="true" aria-labelledby="pixel-rpg-modal-title">
      <div class="pixel-rpg-modal-card">
        <header><h2 id="pixel-rpg-modal-title"></h2><button data-rpg-action="close-modal" type="button" aria-label="Close inspection">×</button></header>
        <div class="pixel-rpg-modal-body"></div>
      </div>
    </div>
    <div class="pixel-rpg-controls" aria-label="Movement controls">
      <div class="pixel-rpg-dpad">
        <button data-rpg-direction="up" type="button" aria-label="Move up">▲</button>
        <button data-rpg-direction="left" type="button" aria-label="Move left">◀</button>
        <button data-rpg-direction="down" type="button" aria-label="Move down">▼</button>
        <button data-rpg-direction="right" type="button" aria-label="Move right">▶</button>
      </div>
      <button class="pixel-rpg-action" data-rpg-action="interact" type="button" disabled><strong>A</strong><span>Inspect nearby</span></button>
    </div>`;
  container.replaceChildren(root);

  const canvas = root.querySelector('.pixel-rpg-canvas');
  const context = canvas.getContext('2d');
  const staticCanvas = document.createElement('canvas');
  const staticContext = staticCanvas.getContext('2d');
  if (!context || !staticContext) throw new Error('Pixel RPG requires a 2D canvas context.');
  const locationBanner = root.querySelector('.pixel-rpg-location');
  const status = root.querySelector('.pixel-rpg-status');
  const roomHeading = root.querySelector('.pixel-rpg-room-heading');
  const guideContent = root.querySelector('.pixel-rpg-guide-content');
  const sceneAction = root.querySelector('.pixel-rpg-scene-controls [data-rpg-action="interact"]');
  const actionButtons = [...root.querySelectorAll('[data-rpg-action="interact"]')];
  const exitButton = root.querySelector('[data-rpg-action="exit-room"]');
  const dialogue = root.querySelector('.pixel-rpg-dialogue');
  const dialogueTitle = root.querySelector('#pixel-rpg-dialogue-title');
  const dialogueText = root.querySelector('.pixel-rpg-dialogue-text');
  const dialogueOptions = root.querySelector('.pixel-rpg-dialogue-options');
  const modal = root.querySelector('.pixel-rpg-modal');
  const modalTitle = root.querySelector('#pixel-rpg-modal-title');
  const modalBody = root.querySelector('.pixel-rpg-modal-body');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;

  const buildings = [
    { id: 'archives', x: 160, y: 128, width: 352, height: 224, kind: 'archives', title: 'GRAND ARCHIVES', name: 'The Grand Archives' },
    { id: 'arcade', x: 1248, y: 128, width: 320, height: 224, kind: 'arcade', title: 'PIXEL ARCADE', name: 'The Pixel Arcade' },
    { id: 'academy', x: 160, y: 800, width: 352, height: 224, kind: 'academy', title: "WIZARD'S ACADEMY", name: "The Wizard's Academy" },
    { id: 'cottage', x: 1248, y: 800, width: 320, height: 224, kind: 'cottage', title: "NORA'S COTTAGE", name: "Nora's Cottage" },
  ];
  buildings.forEach((building) => {
    building.door = { x: building.x + building.width / 2, y: building.y + building.height + 24 };
  });
  const water = [rect(608, 64, 352, 160), rect(768, 928, 288, 160)];
  const trees = [
    [2, 3], [3, 3], [2, 13], [3, 14], [18, 11], [19, 11], [31, 9], [33, 9], [52, 3], [53, 3],
    [19, 25], [20, 26], [33, 25], [34, 26], [52, 24], [53, 24], [2, 31], [3, 32], [52, 33], [53, 33],
  ].map(([column, row]) => ({ x: column * TILE_SIZE + 16, y: row * TILE_SIZE + 16 }));
  const fences = [rect(576, 416, 160, 32), rect(1088, 416, 160, 32), rect(576, 736, 160, 32), rect(1088, 736, 160, 32)];
  const mailboxPoint = { x: buildings[3].x - 24, y: buildings[3].y + buildings[3].height - 44 };
  const player = { x: 896, y: 576, direction: 'down', walkFrame: 0, walkClock: 0 };
  const courier = { x: 896, y: 512, phase: 0 };
  const camera = { x: player.x, y: player.y };
  const pressedKeys = new Set();
  const pointerDirections = new Map();
  let currentInteractable = null;
  let currentZone = null;
  let bannerUntil = 0;
  let elapsed = 0;
  let lastFrame = performance.now();
  let animationFrame = 0;
  let disposed = false;
  let modalOpen = false;
  let dialogueState = null;
  let overlayFocus = null;
  let viewWidth = 1;
  let viewHeight = 1;
  let route = [];
  let routeIndex = 0;
  let guideActions = [];
  let navigationTitle = '';
  let outdoorReturn = null;
  const inspectRange = 76;
  const roomWidth = 960;
  const roomHeight = 704;
  const exitPoint = { x: roomWidth / 2, y: roomHeight - 64 };
  const zones = [
    { id: 'archives', name: 'The Grand Archives', box: rect(96, 64, 480, 352) },
    { id: 'arcade', name: 'The Pixel Arcade', box: rect(1184, 64, 448, 352) },
    { id: 'academy', name: "The Wizard's Academy", box: rect(96, 736, 480, 352) },
    { id: 'square', name: "Nora's Realm Town Square", box: rect(608, 352, 576, 416) },
    { id: 'cottage', name: "Nora's Cottage Lane", box: rect(1184, 736, 448, 352) },
  ];

  function object(id, title, kind, x, y, width, height, activate) {
    return { id, title, kind, box: rect(x, y, width, height), position: () => ({ x: x + width / 2, y: y + height + 38 }), action: `Inspect ${title}`, activate };
  }

  const archiveObjects = career.map((entry, index) => object(`career-${entry.id}`, entry.company, 'shelf', 88 + index * 204, 160, 156, 96, () => showCareerEntry(entry)));
  const rooms = {
    archives: {
      name: 'The Grand Archives · Reading Room', floor: '#bda27a', wall: '#cfc5ae', accent: '#576b81',
      instructions: 'Walk between the shelves. Inspect career volumes, the archive ledger, or the CV reading desk.',
      objects: [...archiveObjects,
        object('career-ledger', 'Career ledger', 'desk', 152, 428, 168, 92, showCareerModal),
        object('archive-cv', 'CV reading desk', 'desk', 636, 428, 168, 92, showResumeModal),
      ],
    },
    arcade: {
      name: 'The Pixel Arcade · Project Lounge', floor: '#82769e', wall: '#beb1d0', accent: '#644e84',
      instructions: 'Inspect the game cabinet to play Idea-Board. The project board and display cases explain the work.',
      objects: [
        object('idea-board-cabinet', 'Idea-Board cabinet', 'cabinet', 152, 164, 128, 104, showArcadeModal),
        object('project-board', 'Project design board', 'board', 406, 160, 156, 92, showProjectModal),
        object('project-case', 'Project showcase', 'case', 682, 164, 132, 92, showProjectShowcase),
        object('arcade-workbench', 'Developer workbench', 'desk', 156, 432, 168, 92, showSkillsModal),
        object('arcade-awards', 'Innovation display', 'case', 644, 432, 168, 92, showAwardsModal),
      ],
    },
    academy: {
      name: "The Wizard's Academy · Study Hall", floor: '#bdab85', wall: '#dfccb0', accent: '#8b6059',
      instructions: 'Inspect the education tome, awards cabinet, certificate shelves, and skills workbench.',
      objects: [
        object('education-tome', 'Education tome', 'desk', 136, 164, 160, 92, showEducationModal),
        object('awards-cabinet', 'Awards cabinet', 'case', 408, 164, 144, 92, showAwardsModal),
        object('certificate-shelf', 'Certificate shelves', 'shelf', 668, 164, 160, 92, showCertificationsModal),
        object('skills-workbench', 'Skills workbench', 'desk', 148, 432, 176, 92, showSkillsModal),
        object('academy-library', 'Academy reference book', 'shelf', 644, 432, 176, 92, showProfileModal),
      ],
    },
    cottage: {
      name: "Nora's Cottage · Living Room", floor: '#c39c80', wall: '#eed8ba', accent: '#528277',
      instructions: 'Make yourself at home. Inspect Nora’s portrait, contact desk, CV journal, and bookshelf.',
      objects: [
        object('nora-portrait', "Nora's portrait", 'portrait', 148, 164, 152, 92, showBioModal),
        object('contact-desk', 'Contact writing desk', 'desk', 644, 164, 168, 92, showContactModal),
        object('cottage-cv', 'CV journal', 'desk', 148, 432, 168, 92, showResumeModal),
        object('cottage-bookshelf', 'Technology bookshelf', 'shelf', 644, 432, 168, 92, showSkillsModal),
      ],
      furniture: [rect(380, 184, 200, 88)],
    },
  };
  const outdoorItems = [
    ...buildings.map((building) => ({ id: building.id, title: building.name, kind: 'door', position: () => building.door, action: `Enter ${building.name}`, activate: () => enterRoom(building.id) })),
    { id: 'courier', title: 'Town Courier', kind: 'courier', position: () => courier, action: 'Speak with the courier', activate: showCourierDialogue },
    { id: 'mailbox', title: 'Communication Beacon', kind: 'mailbox', position: () => mailboxPoint, action: 'Inspect contact links', activate: showContactModal },
  ];
  const exitItem = { id: 'exit', title: 'Exit doorway', kind: 'exit', position: () => exitPoint, action: 'Exit to the town', activate: exitRoom };
  const outdoorColliders = [...water, ...fences, ...buildings.map((building) => rect(building.x, building.y, building.width, building.height)), ...trees.map((tree) => rect(tree.x - 13, tree.y - 7, 26, 38))];
  const scenes = {
    outdoors: { id: 'outdoors', name: "Nora's Realm Town", width: WORLD_WIDTH, height: WORLD_HEIGHT, colliders: outdoorColliders, items: outdoorItems },
  };
  Object.entries(rooms).forEach(([id, room]) => {
    scenes[id] = {
      ...room, id, width: roomWidth, height: roomHeight, items: [...room.objects, exitItem],
      colliders: [rect(0, 0, roomWidth, 96), rect(0, 0, 48, roomHeight), rect(roomWidth - 48, 0, 48, roomHeight), rect(0, roomHeight - 32, roomWidth, 32), rect(64, 543, 40, 63), rect(roomWidth - 104, 543, 40, 63), ...room.objects.map((item) => item.box), ...(room.furniture ?? [])],
    };
  });
  let scene = scenes.outdoors;
  const navigationGrids = new Map();

  function announce(text) {
    if (status.textContent !== text) status.textContent = text;
  }

  function clearInput() {
    pressedKeys.clear();
    pointerDirections.clear();
    route = [];
    routeIndex = 0;
    navigationTitle = '';
    player.walkFrame = 0;
    player.walkClock = 0;
  }

  function isBlocked(x, y) {
    if (x < PLAYER_RADIUS || y < PLAYER_RADIUS || x > scene.width - PLAYER_RADIUS || y > scene.height - PLAYER_RADIUS) return true;
    return scene.colliders.some((box) => overlapsCircle({ x, y, radius: PLAYER_RADIUS }, box));
  }

  function clearSegment(from, to) {
    const steps = Math.max(1, Math.ceil(distance(from, to) / 4));
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      if (isBlocked(from.x + (to.x - from.x) * fraction, from.y + (to.y - from.y) * fraction)) return false;
    }
    return true;
  }

  function getNavigationGrid() {
    if (navigationGrids.has(scene.id)) return navigationGrids.get(scene.id);
    const cell = 16;
    const columns = Math.ceil(scene.width / cell);
    const rows = Math.ceil(scene.height / cell);
    const open = new Uint8Array(columns * rows);
    for (let index = 0; index < open.length; index += 1) {
      open[index] = isBlocked((index % columns) * cell + cell / 2, Math.floor(index / columns) * cell + cell / 2) ? 0 : 1;
    }
    const grid = { cell, columns, rows, open, previous: new Int32Array(open.length), queue: new Int32Array(open.length) };
    navigationGrids.set(scene.id, grid);
    return grid;
  }

  function navigateTo(point, title = 'the selected spot') {
    if (modalOpen || dialogueState || document.querySelector('dialog[open]')) return;
    clearInput();
    const grid = getNavigationGrid();
    const { cell, columns, rows, open, previous, queue } = grid;
    const center = (index) => ({ x: (index % columns) * cell + cell / 2, y: Math.floor(index / columns) * cell + cell / 2 });
    let start = -1;
    let goal = -1;
    let startDistance = Infinity;
    let goalDistance = Infinity;
    for (let index = 0; index < open.length; index += 1) {
      if (!open[index]) continue;
      const candidate = center(index);
      const fromPlayer = distance(candidate, player);
      if (fromPlayer < startDistance && clearSegment(player, candidate)) {
        start = index;
        startDistance = fromPlayer;
      }
      const fromGoal = distance(candidate, point);
      if (fromGoal < goalDistance) {
        goal = index;
        goalDistance = fromGoal;
      }
    }
    if (start < 0 || goal < 0) {
      announce('That spot is blocked. Choose a clear floor tile or a location in the guide.');
      return;
    }
    previous.fill(-1);
    previous[start] = start;
    queue[0] = start;
    let front = 0;
    let end = 1;
    while (front < end && previous[goal] < 0) {
      const index = queue[front++];
      const column = index % columns;
      const row = Math.floor(index / columns);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if ((!dx && !dy) || column + dx < 0 || column + dx >= columns || row + dy < 0 || row + dy >= rows) continue;
          const next = index + dx + dy * columns;
          if (!open[next] || previous[next] >= 0) continue;
          if (dx && dy && (!open[index + dx] || !open[index + dy * columns])) continue;
          previous[next] = index;
          queue[end++] = next;
        }
      }
    }
    if (previous[goal] < 0) {
      announce('There is no clear walking route to that spot. Choose another destination.');
      return;
    }
    const path = [];
    for (let index = goal; index !== start; index = previous[index]) path.push(center(index));
    path.push(center(start));
    path.reverse();
    if (!isBlocked(point.x, point.y) && clearSegment(center(goal), point)) path.push({ x: point.x, y: point.y });
    route = path;
    routeIndex = 0;
    navigationTitle = title;
    announce(`Walking to ${title}. Use movement keys or the D-pad to change course.`);
    syncState();
  }

  function buildGuide() {
    guideContent.innerHTML = `<p>${scene.id === 'outdoors' ? 'Walk to a doorway, then enter its room. Buildings contain objects to inspect.' : 'Walk to an object, then inspect it. Inspection windows close back to this room.'}</p><ul>${scene.items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><button type="button" data-rpg-action="walk-to" data-rpg-target="${escapeHtml(item.id)}">Walk to ${escapeHtml(item.title)}</button><button type="button" data-rpg-action="inspect-item" data-rpg-target="${escapeHtml(item.id)}" disabled>${escapeHtml(item.action)}</button></li>`).join('')}</ul>`;
    guideActions = [...guideContent.querySelectorAll('[data-rpg-action="inspect-item"]')].map((button) => ({ button, item: scene.items.find((item) => item.id === button.dataset.rpgTarget) }));
  }

  function syncState() {
    root.dataset.scene = scene.id;
    root.dataset.sceneName = scene.name;
    root.dataset.playerX = player.x.toFixed(2);
    root.dataset.playerY = player.y.toFixed(2);
    root.dataset.worldWidth = String(scene.width);
    root.dataset.worldHeight = String(scene.height);
    root.dataset.cameraX = camera.x.toFixed(2);
    root.dataset.cameraY = camera.y.toFixed(2);
    root.dataset.navigation = routeIndex < route.length ? 'walking' : 'idle';
    root.dataset.nearby = currentInteractable?.id ?? '';
    root.dataset.overlay = modalOpen ? 'inspection' : dialogueState ? 'dialogue' : 'none';
  }

  function cameraTarget() {
    return {
      x: scene.width <= viewWidth ? scene.width / 2 : clamp(player.x, viewWidth / 2, scene.width - viewWidth / 2),
      y: scene.height <= viewHeight ? scene.height / 2 : clamp(player.y, viewHeight / 2, scene.height - viewHeight / 2),
    };
  }

  function changeScene(next, position, restoredCamera) {
    closeOverlay(false);
    clearInput();
    scene = next;
    player.x = position.x;
    player.y = position.y;
    player.direction = scene.id === 'outdoors' ? 'down' : 'up';
    currentInteractable = null;
    currentZone = null;
    Object.assign(camera, restoredCamera ?? cameraTarget());
    roomHeading.hidden = scene.id === 'outdoors';
    roomHeading.querySelector('h2').textContent = scene.name;
    roomHeading.querySelector('p').textContent = scene.instructions ?? '';
    exitButton.hidden = scene.id === 'outdoors';
    canvas.setAttribute('aria-label', `${scene.name}. Walk using arrow keys, WASD, click destinations, or the object guide.`);
    locationBanner.textContent = scene.name;
    bannerUntil = performance.now() + 2600;
    drawStaticMap();
    buildGuide();
    updateNearestInteractable();
    syncState();
    canvas.focus({ preventScroll: true });
    draw();
  }

  function enterRoom(id) {
    const building = buildings.find((item) => item.id === id);
    if (!building || scene.id !== 'outdoors' || distance(player, building.door) > inspectRange) return;
    const doorwayCamera = {
      x: scene.width <= viewWidth ? scene.width / 2 : clamp(building.door.x, viewWidth / 2, scene.width - viewWidth / 2),
      y: scene.height <= viewHeight ? scene.height / 2 : clamp(building.door.y, viewHeight / 2, scene.height - viewHeight / 2),
    };
    outdoorReturn = { position: { ...building.door }, camera: doorwayCamera };
    changeScene(scenes[id], { x: exitPoint.x, y: exitPoint.y - 36 });
  }

  function exitRoom() {
    if (scene.id === 'outdoors' || !outdoorReturn) return;
    if (distance(player, exitPoint) > inspectRange) {
      navigateTo(exitPoint, 'the exit doorway');
      return;
    }
    const returnTo = outdoorReturn;
    outdoorReturn = null;
    changeScene(scenes.outdoors, returnTo.position, returnTo.camera);
  }

  function drawFence(target, fence) {
    target.fillStyle = '#704735';
    for (let x = fence.x; x < fence.x + fence.width; x += TILE_SIZE) {
      target.fillRect(x + 4, fence.y - 7, 7, TILE_SIZE + 14);
      target.fillRect(x + 20, fence.y - 7, 7, TILE_SIZE + 14);
    }
    target.fillStyle = '#bd754c';
    target.fillRect(fence.x, fence.y + 3, fence.width, 5);
    target.fillRect(fence.x, fence.y + 19, fence.width, 5);
  }

  function drawMailbox(target) {
    const { x, y } = mailboxPoint;
    target.fillStyle = '#533c43';
    target.fillRect(x - 3, y + 6, 6, 25);
    target.fillStyle = '#5fc0c2';
    target.fillRect(x - 17, y - 11, 34, 22);
    target.fillStyle = '#8ae0d5';
    target.fillRect(x - 13, y - 7, 26, 7);
    target.fillStyle = '#ebc65f';
    target.fillRect(x + 19, y - 5, 4, 19);
    target.fillStyle = '#e37d67';
    target.fillRect(x - 4, y - 17, 8, 7);
  }

  function drawFurniture(item) {
    const target = staticContext;
    const { x, y, width, height } = item.box;
    target.fillStyle = '#624b45';
    target.fillRect(x, y, width, height);
    target.fillStyle = '#af825a';
    target.fillRect(x + 5, y + 5, width - 10, height - 10);
    if (item.kind === 'shelf') {
      target.fillStyle = '#684936';
      target.fillRect(x + 9, y + 9, width - 18, height - 18);
      const bookColors = ['#e7c783', '#6ba1a5', '#bc7880', '#96ad76', '#af9ec9'];
      for (let row = 0; row < 2; row += 1) {
        for (let column = 0; column < Math.floor((width - 22) / 14); column += 1) {
          target.fillStyle = bookColors[(row + column) % bookColors.length];
          target.fillRect(x + 13 + column * 14, y + 13 + row * 34, 10, 24);
        }
        target.fillStyle = '#d7b182';
        target.fillRect(x + 7, y + 40 + row * 34, width - 14, 6);
      }
    } else if (item.kind === 'cabinet') {
      target.fillStyle = '#33314f';
      target.fillRect(x + 9, y + 8, width - 18, height - 16);
      target.fillStyle = '#9be0d7';
      target.fillRect(x + 20, y + 18, width - 40, 43);
      target.fillStyle = '#26344a';
      target.fillRect(x + 28, y + 26, width - 56, 27);
      target.fillStyle = '#f6d36e';
      target.fillRect(x + 30, y + 73, 10, 10);
      target.fillStyle = '#e68a95';
      target.fillRect(x + width - 46, y + 73, 8, 8);
      target.fillRect(x + width - 31, y + 73, 8, 8);
    } else if (item.kind === 'case') {
      target.fillStyle = '#a6d4d4';
      target.fillRect(x + 10, y + 10, width - 20, height - 23);
      target.fillStyle = '#f3d26e';
      for (let index = 0; index < 3; index += 1) {
        const trophyX = x + 25 + index * ((width - 50) / 3);
        target.fillRect(trophyX, y + 26, 18, 20);
        target.fillRect(trophyX + 6, y + 46, 6, 13);
        target.fillRect(trophyX + 1, y + 58, 16, 5);
      }
      target.fillStyle = '#e9f8ec';
      target.fillRect(x + 14, y + 15, width - 28, 3);
    } else if (item.kind === 'portrait') {
      target.fillStyle = '#eadbbc';
      target.fillRect(x + 9, y + 9, width - 18, height - 18);
      drawCharacter(target, x + width / 2, y + 48, { body: '#f3e2c2', accent: '#a77b4d', legs: '#34786f' }, 'down', 0);
    } else if (item.kind === 'board') {
      target.fillStyle = '#ece7d2';
      target.fillRect(x + 8, y + 8, width - 16, height - 16);
      for (let index = 0; index < 4; index += 1) {
        target.fillStyle = ['#e8be70', '#a7cdb4', '#c9afd2', '#99c5de'][index];
        target.fillRect(x + 18 + (index % 2) * 65, y + 15 + Math.floor(index / 2) * 31, 49, 23);
      }
    } else {
      target.fillStyle = '#eadebf';
      target.fillRect(x + 20, y + 15, 49, 43);
      target.fillStyle = '#ffffff';
      target.fillRect(x + 24, y + 19, 17, 33);
      target.fillRect(x + 44, y + 19, 20, 33);
      target.fillStyle = '#779084';
      target.fillRect(x + 30, y + 26, 10, 2);
      target.fillRect(x + 48, y + 26, 12, 2);
      target.fillStyle = '#314452';
      target.fillRect(x + width - 47, y + 18, 28, 27);
      target.fillStyle = '#90c8c2';
      target.fillRect(x + width - 44, y + 21, 22, 17);
    }
    target.font = '600 14px system-ui, sans-serif';
    const labelWidth = width + 24;
    const lines = [];
    let line = '';
    item.title.split(' ').forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && target.measureText(next).width > labelWidth - 16) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    lines.push(line);
    const labelHeight = lines.length * 18 + 8;
    target.fillStyle = '#283342';
    target.fillRect(x - 12, y - labelHeight - 6, labelWidth, labelHeight);
    lines.forEach((text, index) => drawPixelText(target, text, x + width / 2, y - labelHeight + 12 + index * 18, { align: 'center', font: '600 14px system-ui, sans-serif' }));
  }

  function drawInterior() {
    const target = staticContext;
    target.fillStyle = scene.wall;
    target.fillRect(0, 0, scene.width, scene.height);
    for (let row = 3; row < 21; row += 1) {
      target.fillStyle = row % 2 ? scene.floor : '#c9b49b';
      target.fillRect(48, row * 32, scene.width - 96, 32);
      target.fillStyle = 'rgba(58, 43, 48, .18)';
      target.fillRect(48, row * 32, scene.width - 96, 2);
      for (let column = 0; column < 7; column += 1) target.fillRect(48 + column * 128 + (row % 2) * 48, row * 32, 2, 32);
    }
    target.fillStyle = scene.accent;
    target.fillRect(0, 82, scene.width, 14);
    target.fillRect(32, 96, 16, scene.height - 96);
    target.fillRect(scene.width - 48, 96, 16, scene.height - 96);
    target.fillRect(0, scene.height - 32, scene.width, 32);
    for (const windowX of [148, 682]) {
      target.fillStyle = '#697c88';
      target.fillRect(windowX, 18, 130, 54);
      target.fillStyle = '#afdce2';
      target.fillRect(windowX + 6, 24, 118, 42);
      target.fillStyle = '#f8eccc';
      target.fillRect(windowX + 62, 24, 5, 42);
      target.fillRect(windowX + 6, 43, 118, 4);
    }
    target.fillStyle = '#f2e7c8';
    target.fillRect(330, 18, 300, 44);
    drawPixelText(target, scene.id === 'cottage' ? "NORA'S HOME" : buildings.find((building) => building.id === scene.id).title, scene.width / 2, 47, { align: 'center', font: '700 18px system-ui, sans-serif', color: '#283342' });
    target.fillStyle = scene.accent;
    target.fillRect(368, 324, 224, 68);
    target.fillStyle = '#e7d7ba';
    target.fillRect(376, 332, 208, 52);
    target.fillStyle = scene.accent;
    target.fillRect(398, 348, 164, 20);
    if (scene.id === 'cottage') {
      target.fillStyle = '#496d64';
      target.fillRect(380, 184, 200, 88);
      target.fillStyle = '#79a598';
      target.fillRect(390, 194, 180, 56);
      target.fillStyle = '#f4d6b0';
      target.fillRect(400, 201, 36, 33);
      target.fillRect(524, 201, 36, 33);
    }
    scene.objects.forEach(drawFurniture);
    for (const x of [84, scene.width - 84]) {
      target.fillStyle = '#7c5646';
      target.fillRect(x - 13, 584, 26, 22);
      target.fillStyle = '#4c8e60';
      target.fillRect(x - 20, 553, 40, 35);
      target.fillStyle = '#76ad75';
      target.fillRect(x - 9, 543, 18, 36);
    }
    target.fillStyle = '#273a47';
    target.fillRect(exitPoint.x - 40, scene.height - 32, 80, 32);
    target.fillStyle = '#ead8a6';
    target.fillRect(exitPoint.x - 45, scene.height - 42, 90, 10);
    target.fillStyle = '#263442';
    target.fillRect(exitPoint.x - 77, exitPoint.y - 4, 154, 27);
    drawPixelText(target, 'EXIT TO TOWN ↓', exitPoint.x, exitPoint.y + 15, { align: 'center', font: '600 14px system-ui, sans-serif' });
  }

  function drawStaticMap() {
    staticCanvas.width = scene.width;
    staticCanvas.height = scene.height;
    staticContext.imageSmoothingEnabled = false;
    if (scene.id !== 'outdoors') {
      drawInterior();
      return;
    }
    for (let row = 0; row < WORLD_ROWS; row += 1) {
      for (let column = 0; column < WORLD_COLUMNS; column += 1) {
        const x = column * TILE_SIZE;
        const y = row * TILE_SIZE;
        staticContext.fillStyle = (column + row) % 2 ? '#419e60' : '#3a9559';
        staticContext.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        staticContext.fillStyle = '#58ad66';
        if ((column * 7 + row * 11) % 5 === 0) staticContext.fillRect(x + 7, y + 13, 3, 3);
        if ((column * 3 + row * 5) % 7 === 0) staticContext.fillRect(x + 22, y + 23, 3, 2);
      }
    }
    for (let column = 0; column < WORLD_COLUMNS; column += 1) {
      drawPathTile(staticContext, column * TILE_SIZE, 544, column);
      drawPathTile(staticContext, column * TILE_SIZE, 576, column + 1);
    }
    for (let row = 0; row < WORLD_ROWS; row += 1) {
      drawPathTile(staticContext, 864, row * TILE_SIZE, row);
      drawPathTile(staticContext, 896, row * TILE_SIZE, row + 1);
    }
    for (let column = 19; column <= 36; column += 1) {
      drawPathTile(staticContext, column * TILE_SIZE, 384, column);
      drawPathTile(staticContext, column * TILE_SIZE, 736, column + 1);
    }
    buildings.forEach((building) => {
      const firstRow = Math.floor(building.door.y / TILE_SIZE);
      const lastRow = building.y < 500 ? 17 : 33;
      for (let row = firstRow; row <= lastRow; row += 1) {
        drawPathTile(staticContext, building.door.x - 32, row * TILE_SIZE, row);
        drawPathTile(staticContext, building.door.x, row * TILE_SIZE, row + 1);
      }
    });
    water.forEach((box) => {
      for (let y = box.y; y < box.y + box.height; y += TILE_SIZE) {
        for (let x = box.x; x < box.x + box.width; x += TILE_SIZE) drawWaterTile(staticContext, x, y);
      }
    });
    fences.forEach((fence) => drawFence(staticContext, fence));
    trees.forEach((tree) => drawTree(staticContext, tree.x, tree.y));
    buildings.forEach((building) => drawBuilding(staticContext, building));
    drawMailbox(staticContext);
    staticContext.fillStyle = '#263d40';
    staticContext.fillRect(810, 460, 204, 29);
    drawPixelText(staticContext, 'TOWN SQUARE', 912, 480, { align: 'center', font: '700 16px system-ui, sans-serif' });
  }

  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    viewWidth = Math.max(1, bounds.width);
    viewHeight = Math.max(1, bounds.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewWidth * dpr);
    canvas.height = Math.floor(viewHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = false;
    Object.assign(camera, cameraTarget());
    syncState();
  }

  function updateNearestInteractable() {
    const blocked = modalOpen || dialogueState || Boolean(document.querySelector('dialog[open]'));
    let closest = null;
    let nearest = inspectRange;
    if (!blocked) {
      scene.items.forEach((item) => {
        const itemDistance = distance(player, item.position());
        if (itemDistance <= nearest) {
          closest = item;
          nearest = itemDistance;
        }
      });
    }
    currentInteractable = closest;
    actionButtons.forEach((button) => { if (button.disabled !== !closest) button.disabled = !closest; });
    const actionLabel = closest?.action ?? 'Explore to find an action';
    if (sceneAction.textContent !== actionLabel) sceneAction.textContent = actionLabel;
    exitButton.disabled = Boolean(blocked);
    const exitLabel = distance(player, exitPoint) <= inspectRange ? 'Exit room to town' : 'Walk to exit doorway';
    if (exitButton.textContent !== exitLabel) exitButton.textContent = exitLabel;
    guideActions.forEach(({ button, item }) => {
      const disabled = Boolean(blocked) || !item || distance(player, item.position()) > inspectRange;
      if (button.disabled !== disabled) button.disabled = disabled;
    });
    if (blocked) return;
    if (routeIndex < route.length) announce(`Walking to ${navigationTitle}. Use movement keys or the D-pad to change course.`);
    else if (closest) announce(`${closest.title} nearby. ${closest.action} with E, SPACE, or the action button.`);
    else announce(scene.id === 'outdoors' ? 'Explore the town. Use the location guide to walk to a building doorway.' : 'Explore the room. Use the object guide to walk to furniture and inspect it.');
  }

  function updateZone(now) {
    if (scene.id === 'outdoors') {
      const next = zones.find((zone) => player.x >= zone.box.x && player.x <= zone.box.x + zone.box.width && player.y >= zone.box.y && player.y <= zone.box.y + zone.box.height);
      if (next?.id !== currentZone?.id) {
        currentZone = next;
        if (next) {
          locationBanner.textContent = next.name;
          bannerUntil = now + 2600;
        }
      }
    }
    locationBanner.classList.toggle('is-visible', now < bannerUntil);
  }

  function movePlayer(dx, dy, dt, maxDistance = Infinity) {
    const magnitude = Math.hypot(dx, dy);
    if (!magnitude) return;
    player.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
    const step = Math.min(145 * dt, maxDistance);
    const deltaX = dx / magnitude * step;
    const deltaY = dy / magnitude * step;
    const oldX = player.x;
    const oldY = player.y;
    if (!isBlocked(player.x + deltaX, player.y)) player.x += deltaX;
    if (!isBlocked(player.x, player.y + deltaY)) player.y += deltaY;
    if (player.x === oldX && player.y === oldY) {
      route = [];
      return;
    }
    if (!reducedMotion) {
      player.walkClock += dt;
      if (player.walkClock >= 0.14) {
        player.walkClock = 0;
        player.walkFrame += 1;
      }
    }
  }

  function update(dt, now) {
    elapsed += dt;
    const externalDialog = Boolean(document.querySelector('dialog[open]'));
    if (externalDialog) clearInput();
    if (scene.id === 'outdoors' && !reducedMotion && !externalDialog && !modalOpen && !dialogueState) {
      courier.phase += dt * 0.8;
      courier.x = 896 + Math.sin(courier.phase) * 56;
      courier.y = 512 + Math.sin(courier.phase * 0.7) * 20;
    }
    if (!modalOpen && !dialogueState && !externalDialog) {
      const directions = new Set(pointerDirections.values());
      const left = pressedKeys.has('ArrowLeft') || pressedKeys.has('a') || directions.has('left');
      const right = pressedKeys.has('ArrowRight') || pressedKeys.has('d') || directions.has('right');
      const up = pressedKeys.has('ArrowUp') || pressedKeys.has('w') || directions.has('up');
      const down = pressedKeys.has('ArrowDown') || pressedKeys.has('s') || directions.has('down');
      const dx = Number(right) - Number(left);
      const dy = Number(down) - Number(up);
      if (dx || dy) {
        route = [];
        movePlayer(dx, dy, dt);
      } else if (routeIndex < route.length) {
        const next = route[routeIndex];
        const remaining = distance(player, next);
        if (remaining < 0.5) routeIndex += 1;
        else movePlayer(next.x - player.x, next.y - player.y, dt, remaining);
      } else player.walkFrame = 0;
    }
    if (dialogueState && dialogueState.visibleCharacters < dialogueState.text.length) {
      dialogueState.visibleCharacters = Math.min(dialogueState.text.length, dialogueState.visibleCharacters + dt * 58);
      dialogueText.textContent = dialogueState.text.slice(0, Math.floor(dialogueState.visibleCharacters));
    }
    const target = cameraTarget();
    const smoothing = reducedMotion ? 1 : Math.min(1, dt * 8);
    camera.x += (target.x - camera.x) * smoothing;
    camera.y += (target.y - camera.y) * smoothing;
    updateNearestInteractable();
    updateZone(now);
    syncState();
  }

  function draw() {
    context.fillStyle = '#202e3c';
    context.fillRect(0, 0, viewWidth, viewHeight);
    context.save();
    context.translate(Math.round(viewWidth / 2 - camera.x), Math.round(viewHeight / 2 - camera.y));
    context.drawImage(staticCanvas, 0, 0);
    if (scene.id === 'outdoors') {
      if (!reducedMotion) water.forEach((box) => {
        for (let y = box.y; y < box.y + box.height; y += TILE_SIZE) {
          for (let x = box.x; x < box.x + box.width; x += TILE_SIZE) {
            const offset = Math.sin(elapsed * 3 + x * 0.02 + y * 0.01) * 4;
            context.fillStyle = '#70d5d2';
            context.fillRect(x + 6 + offset, y + 8, 10, 2);
          }
        }
      });
      drawCharacter(context, courier.x, courier.y, { hair: '#f3d270', body: '#c34c61', accent: '#f3cb66', legs: '#4f557b' }, 'down', reducedMotion ? 0 : Math.floor(elapsed * 5), true);
      context.fillStyle = '#263442';
      context.fillRect(courier.x - 38, courier.y - 60, 76, 24);
      drawPixelText(context, 'Courier', courier.x, courier.y - 43, { align: 'center', font: '600 14px system-ui, sans-serif' });
    }
    drawCharacter(context, player.x, player.y, { body: '#f3e2c2', accent: '#a77b4d', legs: '#34786f' }, player.direction, player.walkFrame);
    context.restore();
    if (currentInteractable) {
      const point = currentInteractable.position();
      const prompt = currentInteractable.kind === 'door' ? 'E · Enter room' : currentInteractable.kind === 'exit' ? 'E · Exit to town' : 'E · Inspect';
      const x = clamp(point.x - camera.x + viewWidth / 2, 90, Math.max(90, viewWidth - 90));
      const y = clamp(point.y - camera.y + viewHeight / 2 - 49, 36, Math.max(36, viewHeight - 45));
      context.fillStyle = '#263442';
      context.fillRect(x - 87, y - 20, 174, 30);
      drawPixelText(context, prompt, x, y, { align: 'center', font: '600 16px system-ui, sans-serif' });
    }
  }

  function downloadResume() {
    const link = document.createElement('a');
    link.href = profile.cvPath;
    link.download = 'Noratika-Chung-Resume.pdf';
    link.click();
  }

  function setOverlayInert(activeLayer = null) {
    [...root.children].forEach((child) => { child.inert = Boolean(activeLayer) && child !== activeLayer; });
  }

  function handleOverlayFocus(event) {
    if (disposed || document.querySelector('dialog[open]')) return;
    const activeLayer = modalOpen ? modal : dialogueState ? dialogue : null;
    if (activeLayer && !activeLayer.contains(event.target)) activeLayer.querySelector('button')?.focus({ preventScroll: true });
  }

  function closeOverlay(restoreFocus = true) {
    const wasOpen = modalOpen || dialogueState;
    modal.hidden = true;
    dialogue.hidden = true;
    modalOpen = false;
    dialogueState = null;
    modalBody.replaceChildren();
    dialogueOptions.replaceChildren();
    clearInput();
    setOverlayInert();
    const target = overlayFocus;
    overlayFocus = null;
    updateNearestInteractable();
    syncState();
    if (wasOpen && restoreFocus && !disposed) {
      if (target instanceof HTMLElement && target.isConnected && !target.disabled && !target.closest('[hidden]')) target.focus({ preventScroll: true });
      else canvas.focus({ preventScroll: true });
    }
  }

  function showModal(title, body) {
    clearInput();
    overlayFocus = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.hidden = false;
    modalOpen = true;
    setOverlayInert(modal);
    updateNearestInteractable();
    syncState();
    modal.querySelector('[data-rpg-action="close-modal"]').focus({ preventScroll: true });
  }

  function showCourierDialogue() {
    clearInput();
    overlayFocus = document.activeElement;
    const text = 'Welcome to Nora’s Realm! Explore the four rooms to discover her work. I also carry her CV for your journey.';
    dialogueState = { text, visibleCharacters: reducedMotion ? text.length : 0 };
    dialogueTitle.textContent = 'Town Courier';
    dialogueText.textContent = reducedMotion ? text : '';
    dialogueOptions.innerHTML = '<button data-rpg-action="download-cv" type="button">Download CV (PDF)</button><button data-rpg-action="farewell" type="button">Return to exploring</button>';
    dialogue.hidden = false;
    setOverlayInert(dialogue);
    updateNearestInteractable();
    syncState();
    dialogueOptions.querySelector('button').focus({ preventScroll: true });
  }

  function careerMarkup(entries) {
    return `<div class="pixel-rpg-career-list">${entries.map((entry) => `<article><div><p class="pixel-rpg-period">${escapeHtml(entry.period)}</p><h3>${escapeHtml(entry.role)}</h3><p>${escapeHtml(entry.company)} · ${escapeHtml(entry.location)}</p></div><div><p>${escapeHtml(entry.summary)}</p><ul>${listMarkup(entry.highlights)}</ul></div><div class="pixel-rpg-tags">${tagMarkup(entry.tags)}</div></article>`).join('')}</div>`;
  }

  function educationMarkup() {
    return `<section><h3>Education</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)}<br>${escapeHtml(profile.education.period)}</p></section>`;
  }

  function awardsMarkup() {
    return `<section><h3>Awards and scholarship</h3><ul>${listMarkup(profile.awards.map((award) => `${award.title} — ${award.detail}`))}</ul></section>`;
  }

  function certificationsMarkup() {
    return `<section><h3>Certifications</h3><ul>${listMarkup(profile.certifications)}</ul></section>`;
  }

  function skillsMarkup() {
    const labels = { frontend: 'Frontend', backend: 'Backend', cloudDevOps: 'Cloud & DevOps', database: 'Databases', aiMachineLearning: 'AI & machine learning' };
    return `<section class="pixel-rpg-skill-grid">${Object.entries(profile.skills).map(([group, values]) => `<div><h3>${escapeHtml(labels[group] ?? group)}</h3><p>${values.map(escapeHtml).join(' · ')}</p></div>`).join('')}</section>`;
  }

  function showCareerEntry(entry) { showModal(`${entry.company} · Career volume`, careerMarkup([entry])); }
  function showCareerModal() { showModal('Career ledger', `<p class="pixel-rpg-lede">Nora's engineering milestones, preserved in the Grand Archives.</p>${careerMarkup(career)}`); }
  function showEducationModal() { showModal('Education tome', educationMarkup()); }
  function showAwardsModal() { showModal('Awards cabinet', awardsMarkup()); }
  function showCertificationsModal() { showModal('Certificate shelves', certificationsMarkup()); }
  function showSkillsModal() { showModal('Technology & skills', skillsMarkup()); }
  function showProfileModal() { showModal('Academy reference book', `${educationMarkup()}${awardsMarkup()}${certificationsMarkup()}${skillsMarkup()}`); }
  function showBioModal() { showModal("Meet Nora", `<p class="pixel-rpg-lede">${escapeHtml(profile.name)}</p><h3>${escapeHtml(profile.title)}</h3><p>${escapeHtml(profile.location)}</p><p>${escapeHtml(profile.bio)}</p>`); }
  function showResumeModal() { showModal('CV journal', `<p class="pixel-rpg-lede">${escapeHtml(profile.name)} · ${escapeHtml(profile.title)}</p><p>Take a copy of Nora's CV with you.</p><div class="pixel-rpg-contact-links"><a href="${escapeHtml(profile.cvPath)}" download="Noratika-Chung-Resume.pdf"><strong>Download CV (PDF)</strong><span>Noratika Chung's résumé</span></a></div>`); }
  function showProjectModal() { showModal(ideaBoard.title, `<p class="pixel-rpg-lede">${escapeHtml(ideaBoard.tagline)}</p><p>${escapeHtml(ideaBoard.description)}</p><div class="pixel-rpg-tags">${tagMarkup(ideaBoard.tags)}</div><div class="pixel-rpg-contact-links"><a href="${escapeHtml(ideaBoardUrl)}" target="_blank" rel="noreferrer"><strong>Open live Idea-Board</strong><span>${escapeHtml(ideaBoardUrl)}</span></a><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer"><strong>View project source</strong><span>GitHub repository</span></a></div>`); }
  function showProjectShowcase() { showModal('Project showcase', careerMarkup(career.filter((entry) => entry.id === 'moodmatch-ai' || entry.id === 'quickaid-azure'))); }
  function showArcadeModal() { showModal('Idea-Board · Playable cabinet', `<div class="pixel-rpg-iframe-bar"><a href="${escapeHtml(ideaBoardUrl)}" target="_blank" rel="noreferrer">Open Idea-Board in a tab ↗</a><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">Source ↗</a></div><iframe class="pixel-rpg-iframe" src="${escapeHtml(ideaBoardUrl)}" title="Idea-Board interactive brainstorming application" loading="lazy"></iframe>`); }
  function showContactModal() { showModal('Contact writing desk', `<p class="pixel-rpg-lede">Get in touch with Nora.</p><div class="pixel-rpg-contact-links"><a href="mailto:${escapeHtml(profile.email)}"><strong>Email</strong><span>${escapeHtml(profile.email)}</span></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><strong>GitHub</strong><span>${escapeHtml(profile.github)}</span></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><strong>LinkedIn</strong><span>${escapeHtml(profile.linkedin)}</span></a></div>`); }

  function activateInteraction(item = currentInteractable) {
    if (modalOpen || dialogueState || document.querySelector('dialog[open]')) return;
    if (item && distance(player, item.position()) <= inspectRange) item.activate();
  }

  function handleKeydown(event) {
    if (document.querySelector('dialog[open]')) return;
    if (modalOpen || dialogueState) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
      } else if (event.key === 'Tab') {
        const layer = modalOpen ? modal : dialogue;
        const focusable = [...layer.querySelectorAll('button, a[href], iframe, input, textarea, select, [tabindex="0"]')].filter((element) => !element.disabled && !element.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      return;
    }
    if (event.target !== canvas || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      pressedKeys.add(key);
      route = [];
    } else if ((key === ' ' || key === 'e') && !event.repeat) {
      event.preventDefault();
      activateInteraction();
    } else if (key === 'Escape') clearInput();
  }

  function handleKeyup(event) {
    pressedKeys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  }

  function handleCanvasPointer(event) {
    if (event.button !== 0 || modalOpen || dialogueState || document.querySelector('dialog[open]')) return;
    canvas.focus({ preventScroll: true });
    const bounds = canvas.getBoundingClientRect();
    const point = { x: event.clientX - bounds.left + camera.x - viewWidth / 2, y: event.clientY - bounds.top + camera.y - viewHeight / 2 };
    const clicked = scene.items.find((item) => {
      if (item.box && point.x >= item.box.x && point.x <= item.box.x + item.box.width && point.y >= item.box.y && point.y <= item.box.y + item.box.height + 24) return true;
      const position = item.position();
      if (item.kind === 'door') return Math.abs(point.x - position.x) <= 42 && point.y >= position.y - 105 && point.y <= position.y + 24;
      return distance(point, position) < 32;
    });
    navigateTo(clicked?.position() ?? { x: clamp(point.x, PLAYER_RADIUS, scene.width - PLAYER_RADIUS), y: clamp(point.y, PLAYER_RADIUS, scene.height - PLAYER_RADIUS) }, clicked?.title);
  }

  function handleRootClick(event) {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest('[data-rpg-action], [data-rpg-direction]');
    if (!target || target.disabled) return;
    const action = target.dataset.rpgAction;
    if (action === 'interact') activateInteraction();
    else if (action === 'exit-room') exitRoom();
    else if (action === 'focus-map') canvas.focus({ preventScroll: true });
    else if (action === 'close-modal' || action === 'farewell') closeOverlay();
    else if (action === 'download-cv') { downloadResume(); closeOverlay(); }
    else if (action === 'walk-to' || action === 'inspect-item') {
      const item = scene.items.find((candidate) => candidate.id === target.dataset.rpgTarget);
      if (!item) return;
      if (action === 'walk-to') navigateTo(item.position(), item.title);
      else activateInteraction(item);
    } else if (target.dataset.rpgDirection && event.detail === 0) {
      const vector = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[target.dataset.rpgDirection];
      const point = { x: player.x + vector[0] * 32, y: player.y + vector[1] * 32 };
      if (clearSegment(player, point)) navigateTo(point, 'the next floor tile');
    }
  }

  function handleRootPointerdown(event) {
    if (!(event.target instanceof Element) || modalOpen || dialogueState || document.querySelector('dialog[open]')) return;
    const button = event.target.closest('[data-rpg-direction]');
    if (!button) return;
    event.preventDefault();
    route = [];
    pointerDirections.set(event.pointerId, button.dataset.rpgDirection);
    button.setPointerCapture?.(event.pointerId);
  }

  function handleRootPointerup(event) { pointerDirections.delete(event.pointerId); }
  function handleFocusOut(event) { if (event.target === canvas) pressedKeys.clear(); }
  function handleVisibility() { if (document.hidden) clearInput(); }
  function handleMotionChange(event) {
    reducedMotion = event.matches;
    player.walkFrame = 0;
    if (reducedMotion && dialogueState) {
      dialogueState.visibleCharacters = dialogueState.text.length;
      dialogueText.textContent = dialogueState.text;
    }
  }

  function animate(now) {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    update(dt, now);
    draw();
    animationFrame = window.requestAnimationFrame(animate);
  }

  drawStaticMap();
  buildGuide();
  resize();
  updateNearestInteractable();
  syncState();
  draw();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  window.addEventListener('resize', resize);
  window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('focusin', handleOverlayFocus);
  motionPreference.addEventListener('change', handleMotionChange);
  root.addEventListener('keydown', handleKeydown);
  root.addEventListener('keyup', handleKeyup);
  root.addEventListener('focusout', handleFocusOut);
  canvas.addEventListener('pointerdown', handleCanvasPointer);
  root.addEventListener('click', handleRootClick);
  root.addEventListener('pointerdown', handleRootPointerdown);
  root.addEventListener('pointerup', handleRootPointerup);
  root.addEventListener('pointercancel', handleRootPointerup);
  root.addEventListener('lostpointercapture', handleRootPointerup);
  canvas.style.cursor = 'crosshair';
  canvas.style.touchAction = 'none';
  root.querySelector('.pixel-rpg-dpad').style.touchAction = 'none';
  animationFrame = window.requestAnimationFrame(animate);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', clearInput);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('focusin', handleOverlayFocus);
      motionPreference.removeEventListener('change', handleMotionChange);
      root.removeEventListener('keydown', handleKeydown);
      root.removeEventListener('keyup', handleKeyup);
      root.removeEventListener('focusout', handleFocusOut);
      canvas.removeEventListener('pointerdown', handleCanvasPointer);
      root.removeEventListener('click', handleRootClick);
      root.removeEventListener('pointerdown', handleRootPointerdown);
      root.removeEventListener('pointerup', handleRootPointerup);
      root.removeEventListener('pointercancel', handleRootPointerup);
      root.removeEventListener('lostpointercapture', handleRootPointerup);
      closeOverlay(false);
      navigationGrids.clear();
      context.clearRect(0, 0, viewWidth, viewHeight);
      staticCanvas.width = 0;
      staticCanvas.height = 0;
      container.replaceChildren();
    },
  };
}
