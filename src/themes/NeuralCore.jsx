const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const nodes = [
  { id: 'alpha', number: '01', label: 'OPERATOR IDENTITY', angle: -Math.PI / 2, accent: '#00f0ff' },
  { id: 'beta', number: '02', label: 'MISSION ARCHIVES', angle: Math.PI, accent: '#ffb000' },
  { id: 'gamma', number: '03', label: 'SIMULATION: IDEA-BOARD', angle: 0, accent: '#ff3cac' },
  { id: 'delta', number: '04', label: 'DATA UPLINK & CV', angle: Math.PI / 2, accent: '#a87cff' },
];

const icosahedronVertices = [
  [-1, 1.618, 0], [1, 1.618, 0], [-1, -1.618, 0], [1, -1.618, 0],
  [0, -1, 1.618], [0, 1, 1.618], [0, -1, -1.618], [0, 1, -1.618],
  [1.618, 0, -1], [1.618, 0, 1], [-1.618, 0, -1], [-1.618, 0, 1],
];
const icosahedronEdges = [];
for (let first = 0; first < icosahedronVertices.length; first += 1) {
  for (let second = first + 1; second < icosahedronVertices.length; second += 1) {
    const distance = Math.hypot(
      icosahedronVertices[first][0] - icosahedronVertices[second][0],
      icosahedronVertices[first][1] - icosahedronVertices[second][1],
      icosahedronVertices[first][2] - icosahedronVertices[second][2],
    );
    if (distance < 2.1) icosahedronEdges.push([first, second]);
  }
}

const skillMarkup = (profile) => Object.entries(profile.skills).map(([group, skills]) => `<div class="neural-skill"><h4>${escapeHtml(group)}</h4><p>${skills.map(escapeHtml).join(' · ')}</p></div>`).join('');
const awardMarkup = (profile) => profile.awards.map((award) => `<li><strong>${escapeHtml(award.title)}</strong><span>${escapeHtml(award.detail)}</span></li>`).join('');
const tagMarkup = (tags = []) => tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

function missionTabs(career, activeId) {
  return career.map((entry) => `<button class="neural-mission-tab ${entry.id === activeId ? 'is-active' : ''}" data-neural-action="mission-tab" data-career-id="${escapeHtml(entry.id)}" type="button" role="tab" aria-selected="${entry.id === activeId}">${escapeHtml(entry.company)}</button>`).join('');
}

function missionContent(entry) {
  const metric = entry.highlights.find((highlight) => highlight.includes('87%'));
  return `<div class="neural-mission-heading"><div><p class="neural-slate-kicker">${escapeHtml(entry.period)} // ${escapeHtml(entry.location)}</p><h3>${escapeHtml(entry.role)}</h3><p>${escapeHtml(entry.company)}</p></div>${metric ? `<strong class="neural-metric">${escapeHtml(metric)}</strong>` : ''}</div><p class="neural-mission-summary">${escapeHtml(entry.summary)}</p><ul class="neural-highlight-list">${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul><div class="neural-tag-list">${tagMarkup(entry.tags)}</div>`;
}

export function createNeuralCore({ container, profile, career, ideaBoard }) {
  const root = document.createElement('main');
  root.className = 'neural-core';
  root.setAttribute('aria-labelledby', 'neural-core-title');
  root.innerHTML = `
    <canvas class="neural-core-canvas" aria-hidden="true"></canvas>
    <div class="neural-core-atmosphere" aria-hidden="true"></div>
    <header class="neural-core-header">
      <div><p class="neural-core-kicker">THE MULTIVERSE // DIMENSION 05</p><h1 id="neural-core-title">NEURAL CORE <span>◌ ONLINE</span></h1></div>
      <button class="neural-audio-toggle" data-neural-action="audio-toggle" type="button" aria-pressed="false">AUDIO FX: OFF</button>
    </header>
    <p class="neural-core-instruction">Select a node to open a focused channel.</p>
    <div class="neural-orbit-nodes" aria-label="Neural Core channels">
      ${nodes.map((node) => `<button class="neural-node neural-node-${node.id}" data-neural-node="${node.id}" data-neural-action="open-node" type="button" aria-label="${escapeHtml(`[ ${node.number} // ${node.label} ]`)}"><span class="neural-node-orb" aria-hidden="true"></span><span class="neural-node-label">[ ${escapeHtml(node.number)} // ${escapeHtml(node.label)} ]</span></button>`).join('')}
    </div>
    <div class="neural-core-readout" aria-live="polite"><span class="neural-readout-dot" aria-hidden="true"></span><span data-neural-status>ORBITAL FIELD // STABLE</span></div>
    <div class="neural-slate-layer" hidden>
      <section class="neural-slate" role="dialog" aria-modal="true" aria-labelledby="neural-slate-title">
        <button class="neural-return" data-neural-action="return" type="button">[ ⨉ RETURN TO ORBIT ]</button>
        <div class="neural-slate-content" data-neural-slate-content></div>
      </section>
    </div>
  `;
  container.replaceChildren(root);

  const canvas = root.querySelector('.neural-core-canvas');
  const context = canvas.getContext('2d');
  const nodeLayer = root.querySelector('.neural-orbit-nodes');
  const slateLayer = root.querySelector('.neural-slate-layer');
  const slateContent = root.querySelector('[data-neural-slate-content]');
  const status = root.querySelector('[data-neural-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = Array.from({ length: 52 }, (_, index) => ({
    x: (index * 71.37) % 1,
    y: (index * 43.91) % 1,
    depth: 0.25 + ((index * 17) % 75) / 100,
    size: 0.4 + (index % 3) * 0.45,
    phase: index * 1.73,
  }));
  let width = 0;
  let height = 0;
  let animationFrame;
  let disposed = false;
  let rotation = 0;
  let focusAmount = 0;
  let focusTarget = 0;
  let activeNode;
  let activeMissionId = career[0]?.id;
  let lastFocused;
  let hoveredNode;
  let audioEnabled = false;
  let audioContext;
  let downloadTimer;

  function playTone(frequency = 460, duration = 0.06) {
    if (!audioEnabled || disposed) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ??= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function resize() {
    const bounds = root.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }

  function rotateVertex(vertex, angle) {
    const [x, y, z] = vertex;
    const cosY = Math.cos(angle);
    const sinY = Math.sin(angle);
    const rotatedX = x * cosY - z * sinY;
    const rotatedZ = x * sinY + z * cosY;
    const cosX = Math.cos(angle * 0.63);
    const sinX = Math.sin(angle * 0.63);
    return [rotatedX, y * cosX - rotatedZ * sinX, y * sinX + rotatedZ * cosX];
  }

  function project(vertex, centerX, centerY, scale) {
    const depth = 7 / (7 - vertex[2]);
    return { x: centerX + vertex[0] * scale * depth, y: centerY - vertex[1] * scale * depth, depth };
  }

  function nodePosition(node, time) {
    const orbitRadius = Math.min(width, height) * 0.29 * (1 - focusAmount * 0.24);
    const organicX = Math.sin(time * 0.00045 + node.angle * 2) * Math.min(width, height) * 0.018;
    const organicY = Math.cos(time * 0.00037 + node.angle * 3) * Math.min(width, height) * 0.014;
    const centerX = width / 2;
    const centerY = height / 2;
    return {
      x: centerX + Math.cos(node.angle + rotation * 0.08) * orbitRadius + organicX,
      y: centerY + Math.sin(node.angle + rotation * 0.08) * orbitRadius + organicY,
    };
  }

  function positionNodes(time) {
    nodes.forEach((node) => {
      const position = nodePosition(node, time);
      const element = root.querySelector(`[data-neural-node="${node.id}"]`);
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
    });
  }

  function draw(time) {
    if (!width || !height || disposed) return;
    const centerX = width / 2;
    const centerY = height / 2;
    const pulse = 1 + Math.sin(time * 0.0012) * 0.045;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#05070c';
    context.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      const driftX = Math.sin(time * 0.00007 + particle.phase) * 15 * particle.depth;
      const driftY = Math.cos(time * 0.00005 + particle.phase) * 10 * particle.depth;
      context.globalAlpha = 0.12 + particle.depth * 0.36;
      context.fillStyle = particle.depth > 0.72 ? '#00f0ff' : '#8794aa';
      context.beginPath();
      context.arc(particle.x * width + driftX, particle.y * height + driftY, particle.size, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;

    const coreScale = Math.min(width, height) * 0.082 * pulse * (1 + focusAmount * 0.28);
    const projected = icosahedronVertices.map((vertex) => project(rotateVertex(vertex, rotation), centerX, centerY, coreScale));
    nodes.forEach((node) => {
      const position = nodePosition(node, time);
      const glow = 0.24 + (Math.sin(time * 0.002 + node.angle) + 1) * 0.1;
      const gradient = context.createLinearGradient(centerX, centerY, position.x, position.y);
      gradient.addColorStop(0, `rgba(0,240,255,${glow})`);
      gradient.addColorStop(1, `${node.accent}22`);
      context.strokeStyle = gradient;
      context.lineWidth = hoveredNode === node.id ? 2.4 : 1.1;
      context.setLineDash([5, 9]);
      context.lineDashOffset = -time * 0.018;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(position.x, position.y);
      context.stroke();
    });
    context.setLineDash([]);

    context.save();
    context.shadowBlur = 22 + pulse * 12;
    context.shadowColor = '#00f0ff';
    context.strokeStyle = `rgba(0,240,255,${0.7 + focusAmount * 0.2})`;
    context.lineWidth = 1.2;
    icosahedronEdges.forEach(([first, second]) => {
      context.beginPath();
      context.moveTo(projected[first].x, projected[first].y);
      context.lineTo(projected[second].x, projected[second].y);
      context.stroke();
    });
    context.restore();
    context.beginPath();
    context.fillStyle = 'rgba(0,240,255,.12)';
    context.arc(centerX, centerY, coreScale * 0.48, 0, Math.PI * 2);
    context.fill();
    positionNodes(time);
  }

  function animate(time) {
    if (disposed) return;
    rotation += reducedMotion.matches ? 0 : 0.003;
    focusAmount += (focusTarget - focusAmount) * (reducedMotion.matches ? 1 : 0.08);
    draw(time);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function alphaSlate() {
    return `<p class="neural-slate-kicker">CHANNEL 01 // OPERATOR IDENTITY</p><h2 id="neural-slate-title">Noratika Chung</h2><p class="neural-slate-lede">${escapeHtml(profile.title)} · ${escapeHtml(profile.location)}</p><div class="neural-identity-grid"><section><h3>Academic clearance</h3><p><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.institution)}<br>${escapeHtml(profile.education.period)} · CGPA ${escapeHtml(profile.education.cgpa)}</p></section><section><h3>Honors archive</h3><ul class="neural-award-list">${awardMarkup(profile)}</ul></section></div><section class="neural-skill-section"><h3>Technical map</h3><div class="neural-skill-grid">${skillMarkup(profile)}</div></section>`;
  }

  function betaSlate() {
    const entry = career.find((candidate) => candidate.id === activeMissionId) ?? career[0];
    return `<p class="neural-slate-kicker">CHANNEL 02 // MISSION ARCHIVES</p><h2 id="neural-slate-title">Mission dossier</h2><div class="neural-mission-tabs" role="tablist" aria-label="Mission dossiers">${missionTabs(career, entry.id)}</div><div class="neural-mission-detail" data-neural-mission-detail>${missionContent(entry)}</div>`;
  }

  function gammaSlate() {
    return `<p class="neural-slate-kicker">CHANNEL 03 // SIMULATION LINK</p><h2 id="neural-slate-title">Idea-Board</h2><p class="neural-slate-lede">Collaborative real-time board for brainstorming and clustering ideas.</p><div class="neural-idea-frame"><div><span>LIVE CHAMBER // ${escapeHtml(ideaBoard.localUrl)}</span><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">SOURCE ↗</a></div><iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive brainstorming application" loading="lazy"></iframe></div>`;
  }

  function deltaSlate() {
    return `<p class="neural-slate-kicker">CHANNEL 04 // DATA UPLINK & CV</p><h2 id="neural-slate-title">Direct communication relays</h2><div class="neural-contact-grid"><a href="mailto:${escapeHtml(profile.email)}"><span>EMAIL</span><strong>${escapeHtml(profile.email)}</strong><b aria-hidden="true">↗</b></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>github.com/NoratikaChung</strong><b aria-hidden="true">↗</b></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>linkedin.com/in/noratika-chung</strong><b aria-hidden="true">↗</b></a></div><div class="neural-dossier"><div><span class="neural-slate-kicker">HIGH-VOLTAGE EXTRACTION</span><h3>CV.PDF</h3><p data-neural-download-status>Ready for extraction.</p></div><button data-neural-action="download-resume" type="button">[ ⬇ EXTRACT DOSSIER (PDF) ]</button><div class="neural-download-track" aria-hidden="true"><span data-neural-download-progress></span></div></div>`;
  }

  function renderSlate() {
    if (activeNode === 'alpha') slateContent.innerHTML = alphaSlate();
    if (activeNode === 'beta') slateContent.innerHTML = betaSlate();
    if (activeNode === 'gamma') slateContent.innerHTML = gammaSlate();
    if (activeNode === 'delta') slateContent.innerHTML = deltaSlate();
  }

  function openNode(id) {
    activeNode = id;
    lastFocused = document.activeElement;
    focusTarget = 1;
    root.classList.add('is-focused');
    status.textContent = `${nodes.find((node) => node.id === id)?.label ?? 'CHANNEL'} // FOCUSED`;
    renderSlate();
    slateLayer.hidden = false;
    slateLayer.querySelector('.neural-return').focus();
    playTone(620, 0.09);
  }

  function closeSlate() {
    activeNode = undefined;
    focusTarget = 0;
    root.classList.remove('is-focused');
    slateLayer.hidden = true;
    status.textContent = 'ORBITAL FIELD // STABLE';
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  function updateAudioButton() {
    const button = root.querySelector('[data-neural-action="audio-toggle"]');
    button.setAttribute('aria-pressed', String(audioEnabled));
    button.textContent = `AUDIO FX: ${audioEnabled ? 'ON' : 'OFF'}`;
  }

  function downloadResume() {
    const button = root.querySelector('[data-neural-action="download-resume"]');
    const progress = root.querySelector('[data-neural-download-progress]');
    const statusText = root.querySelector('[data-neural-download-status]');
    let percentage = 0;
    window.clearInterval(downloadTimer);
    button.disabled = true;
    statusText.textContent = 'Extracting dossier... 0%';
    downloadTimer = window.setInterval(() => {
      percentage += 20;
      progress.style.width = `${percentage}%`;
      statusText.textContent = percentage >= 100 ? 'Extraction complete. Download ready.' : `Extracting dossier... ${percentage}%`;
      if (percentage >= 100) {
        window.clearInterval(downloadTimer);
        downloadTimer = undefined;
        const link = document.createElement('a');
        link.href = profile.cvPath;
        link.download = 'Noratika-Chung-Resume.pdf';
        link.click();
        button.disabled = false;
      }
    }, 90);
  }

  function handleClick(event) {
    const target = event.target.closest('[data-neural-action]');
    if (!target || !root.contains(target)) return;
    const action = target.dataset.neuralAction;
    if (action === 'open-node') openNode(target.dataset.neuralNode);
    if (action === 'return') closeSlate();
    if (action === 'audio-toggle') {
      audioEnabled = !audioEnabled;
      updateAudioButton();
      if (audioEnabled) playTone(760, 0.08);
    }
    if (action === 'mission-tab') {
      activeMissionId = target.dataset.careerId;
      root.querySelector('[data-neural-mission-detail]').innerHTML = missionContent(career.find((entry) => entry.id === activeMissionId) ?? career[0]);
      root.querySelectorAll('.neural-mission-tab').forEach((tab) => {
        const selected = tab.dataset.careerId === activeMissionId;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
      playTone(540, 0.07);
    }
    if (action === 'download-resume') {
      downloadResume();
      playTone(720, 0.08);
    }
  }

  function handlePointerOver(event) {
    const target = event.target.closest('[data-neural-node]');
    if (!target || !root.contains(target)) return;
    const id = target.dataset.neuralNode;
    hoveredNode = id;
    target.classList.add('is-hovered');
    status.textContent = `${nodes.find((node) => node.id === id)?.label ?? 'CHANNEL'} // READY`;
    playTone(360, 0.045);
  }

  function handlePointerOut(event) {
    const target = event.target.closest('[data-neural-node]');
    if (!target || target.contains(event.relatedTarget)) return;
    target.classList.remove('is-hovered');
    if (hoveredNode === target.dataset.neuralNode) hoveredNode = undefined;
    if (!activeNode) status.textContent = 'ORBITAL FIELD // STABLE';
  }

  function handleFocus(event) {
    const target = event.target.closest('[data-neural-node]');
    if (target) playTone(360, 0.045);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && activeNode) closeSlate();
  }

  root.addEventListener('click', handleClick);
  root.addEventListener('pointerover', handlePointerOver);
  root.addEventListener('pointerout', handlePointerOut);
  root.addEventListener('focusin', handleFocus);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', resize);
  resize();
  if (reducedMotion.matches) draw(0);
  else animationFrame = window.requestAnimationFrame(animate);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(downloadTimer);
      root.removeEventListener('click', handleClick);
      root.removeEventListener('pointerover', handlePointerOver);
      root.removeEventListener('pointerout', handlePointerOut);
      root.removeEventListener('focusin', handleFocus);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', resize);
      if (audioContext) {
        audioContext.close();
        audioContext = undefined;
      }
      container.replaceChildren();
    },
  };
}
