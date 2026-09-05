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
  context.font = options.font ?? 'bold 11px monospace';
  context.textAlign = options.align ?? 'left';
  context.textBaseline = options.baseline ?? 'alphabetic';
  context.fillStyle = options.shadow ?? '#17233d';
  context.fillText(text, x + 2, y + 2);
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
  context.fillStyle = 'rgba(28, 28, 49, .35)';
  context.fillRect(x + 7, y + 9, width, height);

  if (kind === 'archives') {
    context.fillStyle = '#6b7289';
    context.fillRect(x, y + 22, width, height - 22);
    context.fillStyle = '#929ab2';
    context.fillRect(x + 7, y + 31, width - 14, height - 31);
    context.fillStyle = '#4b405c';
    context.beginPath();
    context.moveTo(x - 6, y + 23);
    context.lineTo(x + width / 2, y - 19);
    context.lineTo(x + width + 6, y + 23);
    context.closePath();
    context.fill();
    context.fillStyle = '#d9c78b';
    context.fillRect(x + 12, y + 4, width - 24, 15);
    drawPixelText(context, 'ARCHIVES', x + width / 2, y + 15, { align: 'center', font: 'bold 9px monospace', color: '#282b42' });
    context.fillStyle = '#4c526d';
    for (let column = 0; column < 4; column += 1) context.fillRect(x + 19 + column * 47, y + 54, 19, height - 78);
    context.fillStyle = '#342b43';
    context.fillRect(x + width / 2 - 18, y + height - 49, 36, 49);
    context.fillStyle = '#e8d99d';
    context.fillRect(x + width / 2 - 27, y + height - 9, 54, 5);
  } else if (kind === 'arcade') {
    context.fillStyle = '#672f71';
    context.fillRect(x, y + 22, width, height - 22);
    context.fillStyle = '#b9468f';
    context.fillRect(x + 8, y + 31, width - 16, 10);
    context.fillStyle = '#2e285a';
    context.beginPath();
    context.moveTo(x - 8, y + 24);
    context.lineTo(x + 20, y - 20);
    context.lineTo(x + width - 20, y - 20);
    context.lineTo(x + width + 8, y + 24);
    context.closePath();
    context.fill();
    context.fillStyle = '#43e0bb';
    context.fillRect(x + 24, y + 2, width - 48, 14);
    drawPixelText(context, 'ARCADE', x + width / 2, y + 13, { align: 'center', font: 'bold 9px monospace', color: '#152443' });
    context.fillStyle = '#1c2449';
    context.fillRect(x + 24, y + 58, width - 48, height - 92);
    context.fillStyle = '#f7cc57';
    context.fillRect(x + width / 2 - 5, y + 76, 10, 10);
    context.fillStyle = '#5c6ddd';
    context.fillRect(x + width / 2 - 30, y + 99, 60, 7);
    context.fillStyle = '#ee687b';
    context.fillRect(x + width / 2 + 13, y + 82, 7, 7);
    context.fillStyle = '#332b58';
    context.fillRect(x + width / 2 - 36, y + height - 66, 72, 49);
    context.fillStyle = '#80e3cf';
    context.fillRect(x + width / 2 - 26, y + height - 57, 52, 23);
    context.fillStyle = '#f7cc57';
    context.fillRect(x + width / 2 - 4, y + height - 29, 8, 7);
  } else if (kind === 'academy') {
    context.fillStyle = '#79534e';
    context.fillRect(x + 13, y + 44, width - 26, height - 44);
    context.fillStyle = '#b36e58';
    context.beginPath();
    context.moveTo(x + width / 2, y - 32);
    context.lineTo(x + width - 2, y + 44);
    context.lineTo(x + 2, y + 44);
    context.closePath();
    context.fill();
    context.fillStyle = '#e1b76f';
    context.fillRect(x + width / 2 - 15, y + 8, 30, 15);
    drawPixelText(context, 'ACADEMY', x + width / 2, y + 20, { align: 'center', font: 'bold 8px monospace', color: '#423650' });
    context.fillStyle = '#302946';
    context.fillRect(x + width / 2 - 17, y + height - 44, 34, 44);
    context.fillStyle = '#83c8bd';
    context.fillRect(x + 29, y + 64, 18, 22);
    context.fillRect(x + width - 47, y + 64, 18, 22);
  } else {
    context.fillStyle = '#b76b52';
    context.fillRect(x, y + 23, width, height - 23);
    context.fillStyle = '#4c4564';
    context.beginPath();
    context.moveTo(x - 8, y + 25);
    context.lineTo(x + width / 2, y - 15);
    context.lineTo(x + width + 8, y + 25);
    context.closePath();
    context.fill();
    context.fillStyle = '#e8b85e';
    context.fillRect(x + 13, y + 10, width - 26, 12);
    drawPixelText(context, title, x + width / 2, y + 19, { align: 'center', font: 'bold 8px monospace', color: '#382c49' });
    context.fillStyle = '#35415e';
    context.fillRect(x + width / 2 - 17, y + height - 42, 34, 42);
  }
  context.fillStyle = '#f0d27c';
  context.fillRect(x + width / 2 - 6, y + height - 15, 4, 4);
}

function drawCharacter(context, x, y, palette, direction, walkingFrame, isCourier = false) {
  const step = walkingFrame % 2 ? 3 : 0;
  const skin = isCourier ? '#d9a679' : '#f1c29a';
  context.save();
  context.translate(Math.round(x), Math.round(y));
  context.fillStyle = 'rgba(25, 25, 45, .35)';
  context.fillRect(-12, 5, 24, 6);
  context.fillStyle = palette.hair;
  context.fillRect(-9, -28, 18, 9);
  context.fillRect(-12, -23, 5, 12);
  context.fillStyle = skin;
  context.fillRect(-8, -20, 16, 12);
  context.fillStyle = '#252440';
  context.fillRect(direction === 'left' ? -6 : 3, -16, 3, 3);
  context.fillStyle = palette.body;
  context.fillRect(-10, -8, 20, 17);
  context.fillStyle = palette.accent;
  context.fillRect(-7, -4, 14, 5);
  context.fillStyle = palette.legs;
  context.fillRect(-8, 8, 6, 9 + step);
  context.fillRect(2, 8, 6, 9 + (3 - step));
  context.fillStyle = skin;
  context.fillRect(-14, -5, 4, 11);
  context.fillRect(10, -5, 4, 11);
  if (isCourier) {
    context.fillStyle = '#e6bc62';
    context.fillRect(-12, -33, 24, 5);
    context.fillRect(-8, -38, 16, 5);
    context.fillStyle = '#f6df91';
    context.fillRect(13, -2, 10, 10);
  }
  context.restore();
}

export function createPixelRPG({ container, profile, career, ideaBoard }) {
  const root = document.createElement('section');
  root.className = 'pixel-rpg';
  root.setAttribute('aria-label', "Nora's Realm 2D pixel RPG");
  root.innerHTML = `
    <canvas class="pixel-rpg-canvas" aria-label="Nora's Realm playable game map"></canvas>
    <div class="pixel-rpg-hud">
      <div><p class="pixel-rpg-kicker">DIMENSION 03 // NORA'S REALM</p><h1>Nora's Realm</h1></div>
      <p class="pixel-rpg-help"><kbd>WASD</kbd> / <kbd>ARROWS</kbd> Move · <kbd>SPACE</kbd> / <kbd>E</kbd> Interact</p>
    </div>
    <div class="pixel-rpg-location" aria-live="polite"></div>
    <div class="pixel-rpg-status" aria-live="polite"></div>
    <div class="pixel-rpg-dialogue" hidden role="dialog" aria-modal="true" aria-labelledby="pixel-rpg-dialogue-title">
      <div class="pixel-rpg-dialogue-inner">
        <h2 id="pixel-rpg-dialogue-title"></h2>
        <p class="pixel-rpg-dialogue-text"></p>
        <div class="pixel-rpg-dialogue-options"></div>
      </div>
    </div>
    <div class="pixel-rpg-modal" hidden role="dialog" aria-modal="true" aria-labelledby="pixel-rpg-modal-title">
      <div class="pixel-rpg-modal-card">
        <header><h2 id="pixel-rpg-modal-title"></h2><button data-rpg-action="close-modal" type="button" aria-label="Close RPG window">×</button></header>
        <div class="pixel-rpg-modal-body"></div>
      </div>
    </div>
    <div class="pixel-rpg-controls" aria-label="Touch movement controls">
      <div class="pixel-rpg-dpad">
        <button data-rpg-direction="up" type="button" aria-label="Move up">▲</button>
        <button data-rpg-direction="left" type="button" aria-label="Move left">◀</button>
        <button data-rpg-direction="down" type="button" aria-label="Move down">▼</button>
        <button data-rpg-direction="right" type="button" aria-label="Move right">▶</button>
      </div>
      <button class="pixel-rpg-action" data-rpg-action="interact" type="button"><strong>A</strong><span>Action</span></button>
    </div>`;
  container.replaceChildren(root);

  const canvas = root.querySelector('.pixel-rpg-canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Pixel RPG requires a 2D canvas context.');
  const staticCanvas = document.createElement('canvas');
  staticCanvas.width = WORLD_WIDTH;
  staticCanvas.height = WORLD_HEIGHT;
  const staticContext = staticCanvas.getContext('2d');
  const locationBanner = root.querySelector('.pixel-rpg-location');
  const status = root.querySelector('.pixel-rpg-status');
  const dialogue = root.querySelector('.pixel-rpg-dialogue');
  const dialogueTitle = root.querySelector('#pixel-rpg-dialogue-title');
  const dialogueText = root.querySelector('.pixel-rpg-dialogue-text');
  const dialogueOptions = root.querySelector('.pixel-rpg-dialogue-options');
  const modal = root.querySelector('.pixel-rpg-modal');
  const modalTitle = root.querySelector('#pixel-rpg-modal-title');
  const modalBody = root.querySelector('.pixel-rpg-modal-body');

  const buildings = [
    { id: 'archives', x: 5 * TILE_SIZE, y: 4 * TILE_SIZE, width: 11 * TILE_SIZE, height: 7 * TILE_SIZE, kind: 'archives', title: 'GRAND ARCHIVES' },
    { id: 'arcade', x: 39 * TILE_SIZE, y: 4 * TILE_SIZE, width: 10 * TILE_SIZE, height: 7 * TILE_SIZE, kind: 'arcade', title: 'PIXEL ARCADE' },
    { id: 'academy', x: 5 * TILE_SIZE, y: 25 * TILE_SIZE, width: 11 * TILE_SIZE, height: 7 * TILE_SIZE, kind: 'academy', title: "WIZARD'S ACADEMY" },
    { id: 'cottage', x: 39 * TILE_SIZE, y: 25 * TILE_SIZE, width: 10 * TILE_SIZE, height: 7 * TILE_SIZE, kind: 'cottage', title: "NORA'S COTTAGE" },
  ];

  const water = [rect(19 * TILE_SIZE, 2 * TILE_SIZE, 11 * TILE_SIZE, 5 * TILE_SIZE), rect(24 * TILE_SIZE, 29 * TILE_SIZE, 9 * TILE_SIZE, 5 * TILE_SIZE)];
  const trees = [
    [2, 3], [3, 3], [2, 13], [3, 14], [18, 11], [19, 11], [31, 9], [33, 9], [52, 3], [53, 3],
    [19, 25], [20, 26], [33, 25], [34, 26], [52, 24], [53, 24], [2, 31], [3, 32], [52, 33], [53, 33],
  ].map(([column, row]) => ({ x: column * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 }));
  const fences = [
    rect(18 * TILE_SIZE, 13 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE),
    rect(34 * TILE_SIZE, 13 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE),
    rect(18 * TILE_SIZE, 23 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE),
    rect(34 * TILE_SIZE, 23 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE),
  ];

  const player = { x: 28 * TILE_SIZE, y: 18 * TILE_SIZE, direction: 'down', walkFrame: 0, walkClock: 0 };
  const courier = { x: 28 * TILE_SIZE, y: 16 * TILE_SIZE, phase: 0 };
  const camera = { x: player.x, y: player.y };
  const pressedKeys = new Set();
  const pointerDirections = new Set();
  let destination = null;
  let currentInteractable = null;
  let currentZone = null;
  let bannerUntil = 0;
  let elapsed = 0;
  let lastFrame = performance.now();
  let animationFrame = 0;
  let disposed = false;
  let modalOpen = false;
  let dialogueState = null;
  let dialogueFocus = null;
  let modalFocus = null;
  let dpr = 1;
  let viewWidth = 1;
  let viewHeight = 1;

  const zones = [
    { id: 'archives', name: 'The Grand Archives', box: rect(3 * TILE_SIZE, 2 * TILE_SIZE, 15 * TILE_SIZE, 11 * TILE_SIZE) },
    { id: 'arcade', name: 'The Pixel Arcade', box: rect(37 * TILE_SIZE, 2 * TILE_SIZE, 14 * TILE_SIZE, 11 * TILE_SIZE) },
    { id: 'academy', name: "The Wizard's Academy", box: rect(3 * TILE_SIZE, 23 * TILE_SIZE, 15 * TILE_SIZE, 11 * TILE_SIZE) },
    { id: 'square', name: 'Nora\'s Realm Town Square', box: rect(19 * TILE_SIZE, 11 * TILE_SIZE, 18 * TILE_SIZE, 13 * TILE_SIZE) },
    { id: 'cottage', name: "Nora's Cottage Lane", box: rect(37 * TILE_SIZE, 23 * TILE_SIZE, 14 * TILE_SIZE, 11 * TILE_SIZE) },
  ];

  const archivePoint = { x: buildings[0].x + buildings[0].width / 2, y: buildings[0].y + buildings[0].height + 24 };
  const arcadePoint = { x: buildings[1].x + buildings[1].width / 2, y: buildings[1].y + buildings[1].height + 24 };
  const academyPoint = { x: buildings[2].x + buildings[2].width / 2, y: buildings[2].y - 24 };
  const mailboxPoint = { x: buildings[3].x - 24, y: buildings[3].y + buildings[3].height - 44 };

  const interactables = [
    { id: 'archives', title: 'Grand Archives', hint: 'Open career experience', prompt: 'Press SPACE to Enter The Archives', position: () => archivePoint, activate: () => showCareerModal() },
    { id: 'arcade', title: 'Pixel Arcade', hint: 'Launch Idea-Board', prompt: 'E  Interact', position: () => arcadePoint, activate: () => showArcadeModal() },
    { id: 'academy', title: "Wizard's Academy", hint: 'Inspect Nora\'s education', prompt: 'E  Interact', position: () => academyPoint, activate: () => showProfileModal() },
    { id: 'courier', title: 'Town Courier', hint: 'Speak with the courier', prompt: 'E  Interact', position: () => courier, activate: () => showCourierDialogue() },
    { id: 'mailbox', title: 'Communication Beacon', hint: 'Open contact links', prompt: 'E  Interact', position: () => mailboxPoint, activate: () => showContactModal() },
  ];

  function getStaticColliders() {
    const colliders = [...water, ...fences];
    buildings.forEach((building) => {
      const doorWidth = TILE_SIZE * 1.5;
      const doorX = building.x + (building.width - doorWidth) / 2;
      colliders.push(rect(building.x, building.y, building.width, building.height - TILE_SIZE));
      colliders.push(rect(building.x, building.y + building.height - TILE_SIZE, doorX - building.x, TILE_SIZE));
      colliders.push(rect(doorX + doorWidth, building.y + building.height - TILE_SIZE, building.x + building.width - doorX - doorWidth, TILE_SIZE));
    });
    trees.forEach((tree) => colliders.push(rect(tree.x - 13, tree.y - 7, 26, 38)));
    return colliders;
  }

  const colliders = getStaticColliders();

  function drawFence(contextToDraw, fence) {
    contextToDraw.fillStyle = '#704735';
    for (let x = fence.x; x < fence.x + fence.width; x += TILE_SIZE) {
      contextToDraw.fillRect(x + 4, fence.y - 7, 7, TILE_SIZE + 14);
      contextToDraw.fillRect(x + 20, fence.y - 7, 7, TILE_SIZE + 14);
    }
    contextToDraw.fillStyle = '#bd754c';
    contextToDraw.fillRect(fence.x, fence.y + 3, fence.width, 5);
    contextToDraw.fillRect(fence.x, fence.y + 19, fence.width, 5);
  }

  function drawMailbox(contextToDraw) {
    const x = mailboxPoint.x;
    const y = mailboxPoint.y;
    contextToDraw.fillStyle = '#533c43';
    contextToDraw.fillRect(x - 3, y + 6, 6, 25);
    contextToDraw.fillStyle = '#5fc0c2';
    contextToDraw.fillRect(x - 17, y - 11, 34, 22);
    contextToDraw.fillStyle = '#8ae0d5';
    contextToDraw.fillRect(x - 13, y - 7, 26, 7);
    contextToDraw.fillStyle = '#ebc65f';
    contextToDraw.fillRect(x + 19, y - 5, 4, 19);
    contextToDraw.fillStyle = '#e37d67';
    contextToDraw.fillRect(x - 4, y - 17, 8, 7);
  }

  function drawStaticMap() {
    staticContext.fillStyle = '#3c985d';
    staticContext.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
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
      drawPathTile(staticContext, column * TILE_SIZE, 17 * TILE_SIZE, column);
      drawPathTile(staticContext, column * TILE_SIZE, 18 * TILE_SIZE, column + 1);
    }
    for (let row = 0; row < WORLD_ROWS; row += 1) {
      drawPathTile(staticContext, 27 * TILE_SIZE, row * TILE_SIZE, row);
      drawPathTile(staticContext, 28 * TILE_SIZE, row * TILE_SIZE, row + 1);
    }
    for (let column = 19; column <= 36; column += 1) {
      drawPathTile(staticContext, column * TILE_SIZE, 12 * TILE_SIZE, column);
      drawPathTile(staticContext, column * TILE_SIZE, 23 * TILE_SIZE, column + 1);
    }

    water.forEach((waterRect) => {
      for (let y = waterRect.y; y < waterRect.y + waterRect.height; y += TILE_SIZE) {
        for (let x = waterRect.x; x < waterRect.x + waterRect.width; x += TILE_SIZE) drawWaterTile(staticContext, x, y);
      }
    });
    fences.forEach((fence) => drawFence(staticContext, fence));
    trees.forEach((tree) => drawTree(staticContext, tree.x, tree.y));
    buildings.forEach((building) => drawBuilding(staticContext, building));
    drawMailbox(staticContext);

    staticContext.fillStyle = 'rgba(31, 49, 57, .33)';
    staticContext.fillRect(25 * TILE_SIZE, 14 * TILE_SIZE, 7 * TILE_SIZE, 2);
    drawPixelText(staticContext, 'TOWN SQUARE', 28.5 * TILE_SIZE, 15 * TILE_SIZE, { align: 'center', font: 'bold 10px monospace', color: '#fff1bf' });
  }

  function resize() {
    if (disposed) return;
    const bounds = root.getBoundingClientRect();
    viewWidth = Math.max(1, bounds.width);
    viewHeight = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewWidth * dpr);
    canvas.height = Math.floor(viewHeight * dpr);
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = false;
  }

  function updateCamera(dt) {
    const halfWidth = viewWidth / 2;
    const halfHeight = viewHeight / 2;
    const desiredX = clamp(player.x, halfWidth, WORLD_WIDTH - halfWidth);
    const desiredY = clamp(player.y, halfHeight, WORLD_HEIGHT - halfHeight);
    const smoothing = Math.min(1, dt * 8);
    camera.x += (desiredX - camera.x) * smoothing;
    camera.y += (desiredY - camera.y) * smoothing;
  }

  function isBlocked(x, y) {
    const circle = { x, y, radius: PLAYER_RADIUS };
    if (x < PLAYER_RADIUS || y < PLAYER_RADIUS || x > WORLD_WIDTH - PLAYER_RADIUS || y > WORLD_HEIGHT - PLAYER_RADIUS) return true;
    return colliders.some((collider) => overlapsCircle(circle, collider));
  }

  function setDestination(screenX, screenY) {
    if (modalOpen || dialogueState) return;
    const worldX = screenX + camera.x - viewWidth / 2;
    const worldY = screenY + camera.y - viewHeight / 2;
    destination = { x: clamp(worldX, 0, WORLD_WIDTH), y: clamp(worldY, 0, WORLD_HEIGHT) };
  }

  function movePlayer(dx, dy, dt, followsDestination = false) {
    const magnitude = Math.hypot(dx, dy) || 1;
    const speed = 145;
    const distanceToMove = speed * dt;
    const deltaX = (dx / magnitude) * distanceToMove;
    const deltaY = (dy / magnitude) * distanceToMove;
    let moved = false;
    if (!isBlocked(player.x + deltaX, player.y)) {
      player.x += deltaX;
      moved = true;
    }
    if (!isBlocked(player.x, player.y + deltaY)) {
      player.y += deltaY;
      moved = true;
    }
    if (moved) {
      player.walkClock += dt;
      if (player.walkClock > 0.13) {
        player.walkClock = 0;
        player.walkFrame += 1;
      }
      if (!followsDestination) destination = null;
    } else if (followsDestination) {
      destination = null;
    }
    return moved;
  }

  function directionFromInput() {
    const left = pressedKeys.has('ArrowLeft') || pressedKeys.has('a') || pointerDirections.has('left');
    const right = pressedKeys.has('ArrowRight') || pressedKeys.has('d') || pointerDirections.has('right');
    const up = pressedKeys.has('ArrowUp') || pressedKeys.has('w') || pointerDirections.has('up');
    const down = pressedKeys.has('ArrowDown') || pressedKeys.has('s') || pointerDirections.has('down');
    if (left) player.direction = 'left';
    else if (right) player.direction = 'right';
    else if (up) player.direction = 'up';
    else if (down) player.direction = 'down';
    return { x: (right ? 1 : 0) - (left ? 1 : 0), y: (down ? 1 : 0) - (up ? 1 : 0) };
  }

  function updateCourier() {
    courier.phase += 0.018;
    courier.x = 28 * TILE_SIZE + Math.sin(courier.phase) * TILE_SIZE * 2.1;
    courier.y = 16 * TILE_SIZE + Math.sin(courier.phase * 0.7) * TILE_SIZE * 0.8;
  }

  function updateNearestInteractable() {
    if (modalOpen || dialogueState) {
      currentInteractable = null;
      status.textContent = '';
      return;
    }
    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    interactables.forEach((item) => {
      const itemDistance = distance(player, item.position());
      if (itemDistance < 72 && itemDistance < closestDistance) {
        closest = item;
        closestDistance = itemDistance;
      }
    });
    currentInteractable = closest;
    status.textContent = closest ? `${closest.title} nearby. Press E or SPACE to interact.` : 'Explore Nora\'s Realm and discover the marked locations.';
  }

  function updateZone(now) {
    const nextZone = zones.find((zone) => player.x >= zone.box.x && player.x <= zone.box.x + zone.box.width && player.y >= zone.box.y && player.y <= zone.box.y + zone.box.height);
    if (nextZone?.id !== currentZone?.id) {
      currentZone = nextZone;
      if (nextZone) {
        locationBanner.textContent = `Now Entering: ${nextZone.name}`;
        bannerUntil = now + 2600;
      }
    }
    locationBanner.classList.toggle('is-visible', now < bannerUntil);
  }

  function updateDialogueText() {
    if (!dialogueState) return;
    dialogueText.textContent = dialogueState.text.slice(0, Math.floor(dialogueState.visibleCharacters));
  }

  function update(dt, now) {
    elapsed += dt;
    updateCourier();
    if (!modalOpen && !dialogueState) {
      const input = directionFromInput();
      let moving = input.x !== 0 || input.y !== 0;
      const manualInput = moving;
      if (manualInput) destination = null;
      let followsDestination = false;
      if (!manualInput && destination) {
        const targetDelta = { x: destination.x - player.x, y: destination.y - player.y };
        if (Math.hypot(targetDelta.x, targetDelta.y) < 5) destination = null;
        else {
          moving = true;
          followsDestination = true;
          input.x = targetDelta.x;
          input.y = targetDelta.y;
          player.direction = Math.abs(input.x) > Math.abs(input.y) ? (input.x < 0 ? 'left' : 'right') : (input.y < 0 ? 'up' : 'down');
        }
      }
      if (moving) movePlayer(input.x, input.y, dt, followsDestination);
    }
    if (dialogueState && dialogueState.visibleCharacters < dialogueState.text.length) {
      dialogueState.visibleCharacters = Math.min(dialogueState.text.length, dialogueState.visibleCharacters + dt * 58);
      updateDialogueText();
    }
    updateCamera(dt);
    updateNearestInteractable();
    updateZone(now);
  }

  function drawWaterWaves() {
    water.forEach((waterRect) => {
      for (let y = waterRect.y; y < waterRect.y + waterRect.height; y += TILE_SIZE) {
        for (let x = waterRect.x; x < waterRect.x + waterRect.width; x += TILE_SIZE) {
          const waveOffset = Math.sin(elapsed * 3 + x * 0.02 + y * 0.01) * 4;
          context.fillStyle = '#70d5d2';
          context.fillRect(x + 6 + waveOffset, y + 8, 10, 2);
          context.fillStyle = '#3da6be';
          context.fillRect(x + 17 - waveOffset, y + 22, 8, 2);
        }
      }
    });
  }

  function drawInteractionPrompt() {
    if (!currentInteractable) return;
    const target = currentInteractable.position();
    const prompt = `[ ${currentInteractable.prompt} ]`;
    const promptWidth = Math.max(110, prompt.length * 7 + 18);
    const screenX = target.x - camera.x + viewWidth / 2;
    const screenY = target.y - camera.y + viewHeight / 2 - 42 - Math.sin(elapsed * 5) * 3;
    context.save();
    context.fillStyle = '#17233d';
    context.fillRect(screenX - promptWidth / 2, screenY - 17, promptWidth, 24);
    context.strokeStyle = '#f8df83';
    context.lineWidth = 2;
    context.strokeRect(screenX - promptWidth / 2, screenY - 17, promptWidth, 24);
    drawPixelText(context, prompt, screenX, screenY, { align: 'center', font: 'bold 10px monospace', color: '#fff5c5' });
    context.restore();
  }

  function draw(now) {
    context.clearRect(0, 0, viewWidth, viewHeight);
    context.save();
    context.translate(Math.round(viewWidth / 2 - camera.x), Math.round(viewHeight / 2 - camera.y));
    context.drawImage(staticCanvas, 0, 0);
    drawWaterWaves();
    drawCharacter(context, courier.x, courier.y, { hair: '#f3d270', body: '#d64f66', accent: '#f3cb66', legs: '#4f557b' }, 'down', Math.floor(elapsed * 5), true);
    drawPixelText(context, '!', courier.x, courier.y - 42, { align: 'center', font: 'bold 17px monospace', color: '#ffec6e' });
    drawCharacter(context, player.x, player.y, { hair: '#2b2541', body: '#5b75ca', accent: '#79d1c5', legs: '#353e75' }, player.direction, player.walkFrame);
    context.restore();
    drawInteractionPrompt();
  }

  function downloadResume() {
    const link = document.createElement('a');
    link.href = profile.cvPath;
    link.download = 'Noratika-Chung-Resume.pdf';
    link.click();
  }

  function closeDialogue() {
    dialogue.hidden = true;
    dialogueState = null;
    dialogueOptions.replaceChildren();
    const focusTarget = dialogueFocus;
    dialogueFocus = null;
    if (focusTarget instanceof HTMLElement) focusTarget.focus();
  }

  function openDialogue(title, text, options = []) {
    dialogueFocus = document.activeElement;
    dialogueState = { title, text, visibleCharacters: 0 };
    dialogueTitle.textContent = title;
    dialogueOptions.innerHTML = options.map((option) => `<button data-rpg-dialogue-action="${escapeHtml(option.action)}" type="button">${escapeHtml(option.label)}</button>`).join('');
    dialogue.hidden = false;
    updateDialogueText();
    (dialogueOptions.querySelector('button') ?? dialogue).focus();
  }

  function showCourierDialogue() {
    openDialogue('Town Courier', 'Greetings, adventurer! Take this official parchment for your quest.', [
      { action: 'download-cv', label: 'Download CV (PDF)' },
      { action: 'farewell', label: 'Farewell' },
    ]);
  }

  function closeModal() {
    if (!modalOpen) return;
    modal.hidden = true;
    modalOpen = false;
    modalBody.replaceChildren();
    const focusTarget = modalFocus;
    modalFocus = null;
    if (focusTarget instanceof HTMLElement) focusTarget.focus();
  }

  function showModal(title, body) {
    modalFocus = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.hidden = false;
    modalOpen = true;
    modal.querySelector('[data-rpg-action="close-modal"]').focus();
  }

  function showCareerModal() {
    showModal('The Grand Archives', `<p class="pixel-rpg-lede">The archive shelves preserve Nora's engineering milestones.</p><div class="pixel-rpg-career-list">${career.map((entry) => `<article><div><p class="pixel-rpg-period">${escapeHtml(entry.period)}</p><h3>${escapeHtml(entry.role)}</h3><p>${escapeHtml(entry.company)} · ${escapeHtml(entry.location)}</p></div><p>${escapeHtml(entry.summary)}</p><div class="pixel-rpg-tags">${tagMarkup(entry.tags)}</div></article>`).join('')}</div>`);
  }

  function showArcadeModal() {
    showModal('The Pixel Arcade', `<div class="pixel-rpg-iframe-bar"><span>${escapeHtml(ideaBoard.localUrl)}</span><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">Source ↗</a></div><iframe class="pixel-rpg-iframe" src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive brainstorming application" loading="lazy"></iframe>`);
  }

  function showProfileModal() {
    const skills = Object.entries(profile.skills).map(([group, values]) => `<div><h3>${escapeHtml(group)}</h3><p>${values.map(escapeHtml).join(' · ')}</p></div>`).join('');
    showModal("Wizard's Academy", `<p class="pixel-rpg-lede">The academy's oldest tome contains Nora's education, awards, certifications, and skills.</p><section><h3>Education</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)} · CGPA ${escapeHtml(profile.education.cgpa)}<br>${escapeHtml(profile.education.period)}</p></section><section><h3>Gold medals and awards</h3><ul>${listMarkup(profile.awards.map((award) => `${award.title} — ${award.detail}`))}</ul></section><section><h3>Certifications</h3><ul>${listMarkup(profile.certifications)}</ul></section><section class="pixel-rpg-skill-grid">${skills}</section>`);
  }

  function showContactModal() {
    showModal('Communication Beacon', `<p class="pixel-rpg-lede">The crystal hums with an open channel.</p><div class="pixel-rpg-contact-links"><a href="mailto:${escapeHtml(profile.email)}"><strong>Email</strong><span>${escapeHtml(profile.email)}</span></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><strong>GitHub</strong><span>github.com/NoratikaChung</span></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><strong>LinkedIn</strong><span>linkedin.com/in/noratika-chung-8b2570219</span></a></div>`);
  }

  function activateInteraction() {
    if (modalOpen) return;
    if (dialogueState) {
      if (dialogueState.visibleCharacters < dialogueState.text.length) {
        dialogueState.visibleCharacters = dialogueState.text.length;
        updateDialogueText();
      }
      return;
    }
    currentInteractable?.activate();
  }

  function handleKeydown(event) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const movementKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(key);
    if (movementKey) {
      event.preventDefault();
      pressedKeys.add(key);
    }
    if ((key === ' ' || key === 'e') && !event.repeat) {
      event.preventDefault();
      activateInteraction();
    }
    if (key === 'Tab' && (modalOpen || dialogueState)) {
      const layer = modalOpen ? modal : dialogue;
      const focusable = [...layer.querySelectorAll('button, a[href]')].filter((element) => !element.disabled);
      if (focusable.length) {
        const currentIndex = focusable.indexOf(document.activeElement);
        const nextIndex = event.shiftKey
          ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
          : (currentIndex + 1) % focusable.length;
        event.preventDefault();
        focusable[nextIndex].focus();
      }
    }
    if (key === 'Escape') {
      closeDialogue();
      closeModal();
    }
  }

  function handleKeyup(event) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    pressedKeys.delete(key);
  }

  function handleCanvasPointer(event) {
    if (event.target !== canvas) return;
    const bounds = canvas.getBoundingClientRect();
    setDestination(event.clientX - bounds.left, event.clientY - bounds.top);
  }

  function handleCanvasTouch(event) {
    if (event.target !== canvas || !event.touches[0]) return;
    event.preventDefault();
    const bounds = canvas.getBoundingClientRect();
    setDestination(event.touches[0].clientX - bounds.left, event.touches[0].clientY - bounds.top);
  }

  function handleRootClick(event) {
    const target = event.target.closest('[data-rpg-action], [data-rpg-dialogue-action]');
    if (!target) return;
    const action = target.dataset.rpgAction ?? target.dataset.rpgDialogueAction;
    if (action === 'interact') activateInteraction();
    else if (action === 'close-modal') closeModal();
    else if (action === 'download-cv') {
      downloadResume();
      closeDialogue();
    } else if (action === 'farewell') closeDialogue();
  }

  function handleRootPointerdown(event) {
    const directionButton = event.target.closest('[data-rpg-direction]');
    if (!directionButton) return;
    event.preventDefault();
    pointerDirections.add(directionButton.dataset.rpgDirection);
    directionButton.setPointerCapture?.(event.pointerId);
  }

  function handleRootPointerup(event) {
    const directionButton = event.target.closest('[data-rpg-direction]');
    if (directionButton) pointerDirections.delete(directionButton.dataset.rpgDirection);
  }

  function animate(now) {
    if (disposed) return;
    animationFrame = window.requestAnimationFrame(animate);
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    update(dt, now);
    draw(now);
  }

  drawStaticMap();
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
  canvas.addEventListener('pointerdown', handleCanvasPointer);
  canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
  root.addEventListener('click', handleRootClick);
  root.addEventListener('pointerdown', handleRootPointerdown);
  root.addEventListener('pointerup', handleRootPointerup);
  root.addEventListener('pointercancel', handleRootPointerup);
  root.addEventListener('pointerleave', handleRootPointerup);
  canvas.style.cursor = 'crosshair';
  animationFrame = window.requestAnimationFrame(animate);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
      canvas.removeEventListener('pointerdown', handleCanvasPointer);
      canvas.removeEventListener('touchstart', handleCanvasTouch);
      root.removeEventListener('click', handleRootClick);
      root.removeEventListener('pointerdown', handleRootPointerdown);
      root.removeEventListener('pointerup', handleRootPointerup);
      root.removeEventListener('pointercancel', handleRootPointerup);
      root.removeEventListener('pointerleave', handleRootPointerup);
      closeDialogue();
      closeModal();
      context.clearRect(0, 0, viewWidth, viewHeight);
      staticContext.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      container.replaceChildren();
    },
  };
}
