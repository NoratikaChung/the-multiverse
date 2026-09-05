import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const listMarkup = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
const tagMarkup = (tags = []) => tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

function materialColor(material, color) {
  material.color.set(color);
  if ('roughness' in material) material.roughness = 0.72;
  if ('metalness' in material) material.metalness = 0.08;
  return material;
}

function disposeMaterial(material) {
  if (!material) return;
  Object.values(material).forEach((value) => {
    if (value?.isTexture) value.dispose();
  });
  material.dispose();
}

function disposeObject(object) {
  object.traverse((node) => {
    if (!node.isMesh && !node.isLine) return;
    node.geometry?.dispose();
    if (Array.isArray(node.material)) node.material.forEach(disposeMaterial);
    else disposeMaterial(node.material);
  });
}

function createBox(width, height, depth, color, options = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = materialColor(new THREE.MeshStandardMaterial({ color }), color);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function createCylinder(radiusTop, radiusBottom, height, color, radialSegments = 12) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const material = materialColor(new THREE.MeshStandardMaterial({ color }), color);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createTexturedPaper(width, height, color = 0xf8f1dc) {
  const paper = createBox(width, 0.035, height, color, { castShadow: false });
  paper.rotation.x = -0.02;
  return paper;
}

export function createThreeDDesk({ container, profile, career, ideaBoard }) {
  const root = document.createElement('section');
  root.className = 'three-desk';
  root.setAttribute('aria-label', 'Interactive 3D developer desk');
  root.innerHTML = `
    <canvas class="three-desk-canvas" aria-label="Interactive 3D desk scene"></canvas>
    <div class="three-desk-hud" aria-live="polite">
      <p class="three-desk-kicker">DIMENSION 02 // DEVELOPER DESK</p>
      <h1>Nora's workspace</h1>
      <p>Orbit the desk, then select an object to inspect a dimension of the portfolio.</p>
    </div>
    <div class="three-desk-tooltip" hidden></div>
    <button class="three-desk-reset" data-desk-action="reset" type="button">↺ Reset View</button>
    <div class="three-desk-modal" data-desk-modal hidden role="dialog" aria-modal="true" aria-labelledby="three-desk-modal-title">
      <div class="three-desk-modal-card">
        <header class="three-desk-modal-header">
          <h2 id="three-desk-modal-title"></h2>
          <button class="three-desk-modal-close" data-desk-action="close-modal" type="button" aria-label="Close object details">×</button>
        </header>
        <div class="three-desk-modal-body" data-desk-modal-body></div>
      </div>
    </div>`;
  container.replaceChildren(root);

  const canvas = root.querySelector('.three-desk-canvas');
  const tooltip = root.querySelector('.three-desk-tooltip');
  const modal = root.querySelector('[data-desk-modal]');
  const modalTitle = root.querySelector('#three-desk-modal-title');
  const modalBody = root.querySelector('[data-desk-modal-body]');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101a2a);
  scene.fog = new THREE.Fog(0x101a2a, 18, 35);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const defaultCameraPosition = new THREE.Vector3(10, 8, 12);
  const defaultTarget = new THREE.Vector3(0, 2.5, -0.4);
  camera.position.copy(defaultCameraPosition);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 7;
  controls.maxDistance = 17;
  controls.minPolarAngle = 0.42;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.target.copy(defaultTarget);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xb8d9ff, 0x172034, 1.55));
  const keyLight = new THREE.DirectionalLight(0xffe6c4, 2.4);
  keyLight.position.set(4, 11, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 12;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);
  const lampLight = new THREE.PointLight(0xffae58, 7, 9, 2);
  lampLight.position.set(-3.4, 4.4, 0.2);
  lampLight.castShadow = true;
  scene.add(lampLight);

  const floor = createBox(24, 0.2, 18, 0x202a3d, { castShadow: false });
  floor.position.set(0, -0.1, 1);
  scene.add(floor);
  const wall = createBox(24, 12, 0.18, 0x26334a, { castShadow: false });
  wall.position.set(0, 5.9, -4.1);
  scene.add(wall);
  const floorGrid = new THREE.GridHelper(24, 24, 0x53617b, 0x2d3a50);
  floorGrid.position.set(0, 0.02, 1);
  floorGrid.material.opacity = 0.38;
  floorGrid.material.transparent = true;
  scene.add(floorGrid);

  const desk = new THREE.Group();
  desk.name = 'Desk';
  const deskTop = createBox(10, 0.42, 4.2, 0x7b4b35);
  deskTop.position.y = 2.45;
  desk.add(deskTop);
  const deskEdge = createBox(10.15, 0.18, 0.18, 0xa76a42);
  deskEdge.position.set(0, 2.2, 2.02);
  desk.add(deskEdge);
  [-4.15, 4.15].forEach((x) => {
    [-1.35, 1.35].forEach((z) => {
      const leg = createBox(0.32, 2.35, 0.32, 0x343b4b);
      leg.position.set(x, 1.18, z);
      desk.add(leg);
    });
  });
  scene.add(desk);

  const interactive = [];
  let hovered = null;
  let pointer = new THREE.Vector2();
  let animationFrame = 0;
  let disposed = false;
  let transition = null;
  let modalOpen = false;
  let lastFocused = null;

  function registerInteractive(group, metadata) {
    group.userData.interactive = metadata;
    group.traverse((node) => {
      node.userData.interactiveRoot = group;
      node.userData.interactive = metadata;
    });
    interactive.push(group);
    return group;
  }

  function markHighlight(group, active) {
    group.traverse((node) => {
      if (!node.isMesh || !node.material) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (!material.emissive) return;
        if (node.userData.baseEmissive === undefined) node.userData.baseEmissive = material.emissive.getHex();
        material.emissive.setHex(active ? 0x2d668c : node.userData.baseEmissive);
        material.emissiveIntensity = active ? 0.7 : 0;
      });
    });
  }

  function monitorObject() {
    const group = new THREE.Group();
    group.position.set(-0.3, 2.72, -0.55);
    const frame = createBox(4.5, 2.65, 0.32, 0x303b4d);
    frame.position.y = 1.35;
    group.add(frame);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.02, 2.1),
      new THREE.MeshBasicMaterial({ color: 0x3bb5c7 })
    );
    screen.position.set(0, 1.35, 0.18);
    group.add(screen);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.66, 1.75),
      new THREE.MeshBasicMaterial({ color: 0x10283e, transparent: true, opacity: 0.72 })
    );
    glow.position.set(0, 1.35, 0.19);
    group.add(glow);
    for (let index = 0; index < 5; index += 1) {
      const line = createBox(2.5 - index * 0.23, 0.045, 0.02, index === 0 ? 0x7ce9d5 : 0x6484a0, { castShadow: false });
      line.position.set(-0.2, 1.95 - index * 0.27, 0.22);
      group.add(line);
    }
    const stand = createBox(0.42, 1.1, 0.4, 0x3e4b60);
    stand.position.set(0, -0.05, 0);
    group.add(stand);
    const base = createBox(1.8, 0.16, 0.8, 0x3e4b60);
    base.position.set(0, -0.58, 0);
    group.add(base);
    desk.add(group);
    return registerInteractive(group, { type: 'monitor', title: 'Idea-Board', hint: 'Launch Idea-Board' });
  }

  function corkboardObject() {
    const group = new THREE.Group();
    group.position.set(-4.8, 5.1, -3.82);
    const board = createBox(4.6, 2.8, 0.18, 0xa86e43);
    group.add(board);
    const inner = createBox(4.2, 2.4, 0.06, 0xc58a5c);
    inner.position.z = 0.13;
    group.add(inner);
    const noteColors = [0xf7dd70, 0x8ed6d1, 0xf28a77, 0xc7a7e8, 0xf5b66b];
    [-1.45, -0.45, 0.55, 1.45].forEach((x, index) => {
      const note = createBox(0.7, 0.72, 0.05, noteColors[index], { castShadow: false });
      note.position.set(x, index % 2 ? 0.45 : -0.35, 0.19);
      note.rotation.z = (index - 1.5) * 0.05;
      group.add(note);
    });
    const pin = createCylinder(0.08, 0.08, 0.12, 0x3c4b62, 10);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(-1.45, 0.85, 0.27);
    group.add(pin);
    scene.add(group);
    return registerInteractive(group, { type: 'corkboard', title: 'Career Work', hint: 'Inspect career timeline' });
  }

  function notebookObject() {
    const group = new THREE.Group();
    group.position.set(2.05, 2.72, 0.55);
    group.rotation.y = -0.16;
    const cover = createBox(2.8, 0.1, 2.05, 0x376b76);
    cover.rotation.x = -0.08;
    group.add(cover);
    const page = createTexturedPaper(2.58, 1.82);
    page.position.y = 0.08;
    page.rotation.x = -0.08;
    group.add(page);
    for (let index = 0; index < 5; index += 1) {
      const line = createBox(1.65, 0.018, 0.025, 0x8a9aa0, { castShadow: false });
      line.position.set(-0.1, 0.12, -0.62 + index * 0.28);
      line.rotation.x = -0.08;
      group.add(line);
    }
    const pen = createCylinder(0.045, 0.045, 1.9, 0xe9c15a, 10);
    pen.rotation.z = Math.PI / 2;
    pen.rotation.x = -0.08;
    pen.position.set(1.1, 0.2, 0.85);
    group.add(pen);
    desk.add(group);
    return registerInteractive(group, { type: 'notebook', title: 'About Nora', hint: 'Open profile notebook' });
  }

  function printerObject() {
    const group = new THREE.Group();
    group.position.set(3.75, 2.75, -1.05);
    const body = createBox(2.25, 1.35, 1.8, 0x69788a);
    body.position.y = 0.68;
    group.add(body);
    const slot = createBox(1.5, 0.12, 0.07, 0x202733, { castShadow: false });
    slot.position.set(0, 0.72, 0.92);
    group.add(slot);
    const paper = createTexturedPaper(1.25, 1.15);
    paper.name = 'Printable CV';
    paper.position.set(0, 1.2, 0.9);
    paper.rotation.x = Math.PI / 2;
    group.add(paper);
    group.userData.paper = paper;
    desk.add(group);
    return registerInteractive(group, { type: 'printer', title: 'Resume.pdf', hint: 'Print and download CV' });
  }

  function contactObject() {
    const group = new THREE.Group();
    group.position.set(-3.45, 2.74, 0.65);
    const mug = createCylinder(0.52, 0.6, 0.9, 0xe8edf0, 16);
    mug.position.y = 0.45;
    group.add(mug);
    const coffee = createCylinder(0.43, 0.43, 0.03, 0x49302a, 16);
    coffee.position.y = 0.91;
    group.add(coffee);
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.09, 8, 16, Math.PI * 1.35),
      new THREE.MeshStandardMaterial({ color: 0xe8edf0 })
    );
    handle.rotation.y = Math.PI / 2;
    handle.position.set(0.55, 0.48, 0);
    group.add(handle);
    for (let index = 0; index < 3; index += 1) {
      const steam = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.025, 6, 10, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0xdde8f5, transparent: true, opacity: 0.55 })
      );
      steam.position.set(-0.15 + index * 0.18, 1.25 + index * 0.05, 0);
      steam.rotation.x = Math.PI / 2;
      group.add(steam);
    }
    desk.add(group);
    return registerInteractive(group, { type: 'contact', title: 'Contact Me', hint: 'Open contact card' });
  }

  const monitor = monitorObject();
  const corkboard = corkboardObject();
  const notebook = notebookObject();
  const printer = printerObject();
  const contact = contactObject();
  const interactiveObjects = { monitor, corkboard, notebook, printer, contact };

  const raycaster = new THREE.Raycaster();
  const focusTargets = {
    monitor: { object: monitor, offset: new THREE.Vector3(4.2, 2.6, 6.2) },
    corkboard: { object: corkboard, offset: new THREE.Vector3(4.2, 1.4, 7.2) },
    notebook: { object: notebook, offset: new THREE.Vector3(3.2, 2.1, 4.5) },
    printer: { object: printer, offset: new THREE.Vector3(3.5, 2, 4.6) },
    contact: { object: contact, offset: new THREE.Vector3(3.6, 2.1, 4.7) },
  };

  function resize() {
    if (disposed) return;
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function focusObject(type) {
    const focus = focusTargets[type];
    if (!focus) return;
    const target = new THREE.Vector3();
    focus.object.getWorldPosition(target);
    target.y += type === 'corkboard' ? 0.3 : 0.9;
    transition = {
      started: performance.now(),
      duration: 800,
      startPosition: camera.position.clone(),
      endPosition: target.clone().add(focus.offset),
      startTarget: controls.target.clone(),
      endTarget: target,
    };
  }

  function resetView() {
    transition = {
      started: performance.now(),
      duration: 800,
      startPosition: camera.position.clone(),
      endPosition: defaultCameraPosition.clone(),
      startTarget: controls.target.clone(),
      endTarget: defaultTarget.clone(),
    };
    closeModal();
  }

  function showModal(title, body) {
    lastFocused = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.hidden = false;
    modalOpen = true;
    modal.querySelector('.three-desk-modal-close').focus();
  }

  function closeModal() {
    if (!modalOpen) return;
    modal.hidden = true;
    modalOpen = false;
    modalBody.replaceChildren();
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  function showCareer() {
    showModal('Career Work', `<p class="three-desk-modal-lede">A timeline of systems, products, and experiments.</p><div class="desk-career-list">${career.map((entry) => `<article><div><p class="desk-entry-period">${escapeHtml(entry.period)}</p><h3>${escapeHtml(entry.role)}</h3><p class="desk-entry-company">${escapeHtml(entry.company)} · ${escapeHtml(entry.location)}</p></div><p>${escapeHtml(entry.summary)}</p><div class="desk-tag-row">${tagMarkup(entry.tags)}</div></article>`).join('')}</div>`);
  }

  function showProfile() {
    const skillGroups = Object.entries(profile.skills).map(([group, skills]) => `<div><h4>${escapeHtml(group)}</h4><p>${skills.map(escapeHtml).join(' · ')}</p></div>`).join('');
    showModal('About Nora', `<p class="three-desk-modal-lede">${escapeHtml(profile.bio)}</p><div class="desk-profile-grid"><section><h3>Education</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)} · CGPA ${escapeHtml(profile.education.cgpa)}<br>${escapeHtml(profile.education.period)}</p></section><section><h3>Awards</h3><ul>${listMarkup(profile.awards.map((award) => `${award.title} — ${award.detail}`))}</ul></section></div><section><h3>Skills</h3><div class="desk-skills">${skillGroups}</div></section>`);
  }

  function showContact() {
    showModal('Contact Me', `<p class="three-desk-modal-lede">Have a thoughtful project, a systems problem, or an interesting idea? Send a signal.</p><div class="desk-contact-links"><a href="mailto:${escapeHtml(profile.email)}"><strong>Email</strong><span>${escapeHtml(profile.email)}</span></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><strong>GitHub</strong><span>github.com/NoratikaChung</span></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><strong>LinkedIn</strong><span>linkedin.com/in/noratika-chung-8b2570219</span></a></div>`);
  }

  function triggerResumeDownload() {
    const link = document.createElement('a');
    link.href = profile.cvPath;
    link.download = 'Noratika-Chung-Resume.pdf';
    link.click();
  }
  function showResume() {
    showModal('Resume.pdf', `<div class="desk-resume-card"><p>The printer has prepared a placeholder CV for download.</p><a class="desk-modal-button" href="${escapeHtml(profile.cvPath)}" download="Noratika-Chung-Resume.pdf">Download CV (PDF)</a></div>`);
  }

  function showIdeaBoard() {
    showModal('Idea-Board', `<div class="desk-iframe-toolbar"><span>${escapeHtml(ideaBoard.localUrl)}</span><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">View source ↗</a></div><iframe class="desk-idea-frame" src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive application" loading="lazy"></iframe>`);
  }

  function activateObject(metadata) {
    focusObject(metadata.type);
    if (metadata.type === 'monitor') showIdeaBoard();
    else if (metadata.type === 'corkboard') showCareer();
    else if (metadata.type === 'notebook') showProfile();
    else if (metadata.type === 'printer') {
      printer.userData.paper.position.y = 1.2;
      printer.userData.paper.position.z = 0.9;
      printer.userData.paper.position.x = 0;
      printer.userData.paper.userData.printing = true;
      triggerResumeDownload();
      showResume();
      window.setTimeout(() => {
        if (!disposed && printer.userData.paper) printer.userData.paper.position.y = 1.7;
      }, 500);
    } else if (metadata.type === 'contact') showContact();
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactive, true)[0];
    const next = hit?.object?.userData.interactiveRoot ?? null;
    if (next !== hovered) {
      if (hovered) markHighlight(hovered, false);
      hovered = next;
      if (hovered) {
        markHighlight(hovered, true);
        canvas.style.cursor = 'pointer';
        tooltip.textContent = `${hovered.userData.interactive.title} · ${hovered.userData.interactive.hint}`;
        tooltip.hidden = false;
      } else {
        canvas.style.cursor = 'grab';
        tooltip.hidden = true;
      }
    }
    if (hovered) {
      tooltip.style.left = `${event.clientX - rect.left + 18}px`;
      tooltip.style.top = `${event.clientY - rect.top + 18}px`;
    }
  }

  function handleCanvasClick() {
    if (hovered) activateObject(hovered.userData.interactive);
  }

  function handleRootClick(event) {
    const action = event.target.closest('[data-desk-action]')?.dataset.deskAction;
    if (action === 'close-modal') closeModal();
    if (action === 'reset') resetView();
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') closeModal();
  }

  function animate(now = performance.now()) {
    if (disposed) return;
    animationFrame = window.requestAnimationFrame(animate);
    if (transition) {
      const progress = Math.min(1, (now - transition.started) / transition.duration);
      const eased = 1 - ((1 - progress) ** 3);
      camera.position.lerpVectors(transition.startPosition, transition.endPosition, eased);
      controls.target.lerpVectors(transition.startTarget, transition.endTarget, eased);
      if (progress >= 1) transition = null;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  canvas.addEventListener('pointermove', updatePointer);
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('pointerleave', () => {
    if (hovered) markHighlight(hovered, false);
    hovered = null;
    tooltip.hidden = true;
    canvas.style.cursor = 'grab';
  });
  root.addEventListener('click', handleRootClick);
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', handleKeydown);
  resize();
  canvas.style.cursor = 'grab';
  animationFrame = window.requestAnimationFrame(animate);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('click', handleCanvasClick);
      root.removeEventListener('click', handleRootClick);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeydown);
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      container.replaceChildren();
    },
    reset: resetView,
    objects: interactiveObjects,
  };
}
