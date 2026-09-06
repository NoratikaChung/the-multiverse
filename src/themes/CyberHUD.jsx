const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const skillGroups = [
  ['frontend', 'FRONTEND'],
  ['backend', 'BACKEND'],
  ['cloudDevOps', 'CLOUD / DEVOPS'],
  ['aiMachineLearning', 'AI / ML'],
];

const skillMarkup = (profile) => skillGroups.map(([key, label]) => {
  const skills = profile.skills[key] ?? [];
  const signal = Math.min(96, 42 + skills.length * 7);
  return `<div class="cyber-skill"><div class="cyber-skill-label"><span>${escapeHtml(label)}</span><strong>${signal}%</strong></div><div class="cyber-meter" role="progressbar" aria-label="${escapeHtml(label)} skill signal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${signal}"><span style="--signal-width:${signal}%"></span></div><p>${skills.map(escapeHtml).join(' · ')}</p></div>`;
}).join('');

const careerTabMarkup = (career) => career.map((entry, index) => `<button class="cyber-career-tab ${index === 0 ? 'is-active' : ''}" data-cyber-action="career" data-career-id="${escapeHtml(entry.id)}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="cyber-career-terminal">[ ${escapeHtml(entry.company)} ]</button>`).join('');

function careerTerminalMarkup(entry) {
  const transcript = [
    `> ROLE: ${entry.role}`,
    `> COMPANY: ${entry.company}`,
    `> OPERATIONAL DATES: ${entry.period}`,
    `> LOCATION: ${entry.location}`,
    '',
    entry.summary,
    '',
    ...entry.highlights.map((highlight) => `> ${highlight}`),
  ].join('\n');
  return { transcript, metric: entry.highlights.find((highlight) => highlight.includes('87%')) };
}

export function createCyberHUD({ container, profile, career, ideaBoard }) {
  const root = document.createElement('main');
  root.className = 'cyber-hud';
  root.setAttribute('aria-labelledby', 'cyber-hud-title');
  root.innerHTML = `
    <canvas class="cyber-hud-canvas" aria-hidden="true"></canvas>
    <div class="cyber-scanlines" aria-hidden="true"></div>
    <header class="cyber-command-header">
      <div>
        <p class="cyber-eyebrow">THE MULTIVERSE // DIMENSION 05</p>
        <h1 id="cyber-hud-title">CYBERPUNK HOLOGRAM HUD <span>// ONLINE</span></h1>
      </div>
      <div class="cyber-header-readout">
        <span>UPLINK: KUALA LUMPUR</span>
        <span>LATENCY: 04ms</span>
        <button class="cyber-audio-toggle" data-cyber-action="audio-toggle" type="button" aria-pressed="false"><span aria-hidden="true">◉</span> AUDIO FX: OFF</button>
      </div>
    </header>
    <div class="cyber-hud-grid">
      <article class="cyber-panel cyber-pilot-panel">
        <div class="cyber-panel-heading"><span class="cyber-panel-number">01</span><div><p class="cyber-eyebrow">COMMAND CENTER TELEMETRY</p><h2>PILOT IDENTIFICATION</h2></div><span class="cyber-panel-status">ACTIVE</span></div>
        <div class="cyber-pilot-copy"><div class="cyber-avatar" aria-hidden="true">NC</div><div><p class="cyber-kicker">OPERATOR ID: NORA</p><h3>${escapeHtml(profile.name)}</h3><p>${escapeHtml(profile.title)}</p></div></div>
        <dl class="cyber-readouts"><div><dt>COORDINATES</dt><dd>${escapeHtml(profile.location)}</dd></div><div><dt>ACADEMIC CLEARANCE</dt><dd>${escapeHtml(profile.education.degree)} · CGPA ${escapeHtml(profile.education.cgpa)}</dd></div><div><dt>SYSTEM STATUS</dt><dd class="cyber-status-live">ACTIVE // CORE OPERATIONAL</dd></div></dl>
        <p class="cyber-bio">${escapeHtml(profile.bio)}</p>
        <div class="cyber-award-strip"><span>USM PIXEL 2025</span><strong>GOLD MEDALIST</strong><span>VIC 2024</span><strong>GOLD MEDALIST</strong></div>
        <div class="cyber-subheading"><span>POWER ALLOCATION // SKILLS</span><span>LIVE SIGNAL</span></div>
        <div class="cyber-skills">${skillMarkup(profile)}</div>
      </article>
      <article class="cyber-panel cyber-mission-panel">
        <div class="cyber-panel-heading"><span class="cyber-panel-number">02</span><div><p class="cyber-eyebrow">ARCHIVE // ENCRYPTED ACCESS GRANTED</p><h2>DECLASSIFIED MISSION ARCHIVES</h2></div><span class="cyber-panel-status">READ ONLY</span></div>
        <div class="cyber-career-tabs" role="tablist" aria-label="Career mission archives">${careerTabMarkup(career)}</div>
        <div class="cyber-terminal-wrap"><div class="cyber-terminal-bar"><span>TERMINAL / CAREER_LOGS</span><span aria-hidden="true">■ ■ ■</span></div><pre id="cyber-career-terminal" class="cyber-terminal" role="tabpanel" aria-live="polite"></pre></div>
        <div class="cyber-mission-meta"><span data-cyber-company></span><span data-cyber-period></span></div>
        <div class="cyber-highlight" data-cyber-highlight hidden></div>
      </article>
      <article class="cyber-panel cyber-idea-panel">
        <div class="cyber-panel-heading"><span class="cyber-panel-number">03</span><div><p class="cyber-eyebrow">NEURAL SIMULATION CHAMBER</p><h2>IDEA-BOARD // LIVE</h2></div><span class="cyber-panel-status">EMBEDDED</span></div>
        <p class="cyber-panel-lede">A collaborative real-time board for brainstorming, clustering thoughts, and making room for unexpected connections.</p>
        <div class="cyber-iframe-frame"><div class="cyber-iframe-bracket cyber-bracket-top" aria-hidden="true"></div><div class="cyber-iframe-bracket cyber-bracket-bottom" aria-hidden="true"></div><div class="cyber-iframe-toolbar"><span>SIMULATION LINK // ${escapeHtml(ideaBoard.localUrl)}</span><button data-cyber-action="idea-fullscreen" type="button" aria-pressed="false">EXPAND FRAME</button></div><iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive brainstorming application" loading="lazy"></iframe></div>
        <p class="cyber-frame-status" aria-live="polite"><span class="cyber-signal-dot" aria-hidden="true"></span> VIEWPORT FRAME // CROSSHAIR LOCKED // CONNECTION READY</p>
      </article>
      <article class="cyber-panel cyber-uplink-panel">
        <div class="cyber-panel-heading"><span class="cyber-panel-number">04</span><div><p class="cyber-eyebrow">DATA UPLINK // DIRECT CHANNELS</p><h2>CONTACT / EXTRACTION</h2></div><span class="cyber-panel-status">SECURE</span></div>
        <p class="cyber-panel-lede">Open a direct channel or extract the complete professional dossier.</p>
        <div class="cyber-contact-links"><a href="mailto:${escapeHtml(profile.email)}"><span>EMAIL</span><strong>${escapeHtml(profile.email)}</strong><b aria-hidden="true">↗</b></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>github.com/NoratikaChung</strong><b aria-hidden="true">↗</b></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>linkedin.com/in/noratika-chung</strong><b aria-hidden="true">↗</b></a></div>
        <div class="cyber-cv-extract"><div class="cyber-cv-copy"><span class="cyber-kicker">HIGH-VOLTAGE DOSSIER</span><h3>CV.PDF</h3><p data-cyber-download-status>Ready for extraction.</p></div><button class="cyber-download" data-cyber-action="download-resume" type="button"><span class="cyber-download-icon" aria-hidden="true">↓</span><span>INITIATE<br>DOWNLOAD</span></button><div class="cyber-download-track" aria-hidden="true"><span data-cyber-download-progress></span></div></div>
        <p class="cyber-dockline"><span>© ${new Date().getFullYear()} NORATIKA CHUNG</span><span>ALL CHANNELS NOMINAL</span></p>
      </article>
    </div>
  `;
  container.replaceChildren(root);

  const canvas = root.querySelector('.cyber-hud-canvas');
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = Array.from({ length: 54 }, (_, index) => ({
    seed: index * 1.618,
    x: (index * 47.13) % 1,
    y: (index * 83.71) % 1,
    size: 1 + (index % 3) * 0.55,
    color: index % 5 === 0 ? '#ffb000' : index % 7 === 0 ? '#ff2c92' : '#00f0ff',
  }));
  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationFrame;
  let terminalTimer;
  let downloadTimer;
  let selectedCareerId = career[0]?.id;
  let audioEnabled = false;
  let audioContext;
  let disposed = false;

  function resizeCanvas() {
    const bounds = root.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = bounds.width;
    canvasHeight = bounds.height;
    canvas.width = Math.max(1, Math.floor(canvasWidth * ratio));
    canvas.height = Math.max(1, Math.floor(canvasHeight * ratio));
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawTelemetry(0);
  }

  function drawTelemetry(time) {
    if (!canvasWidth || !canvasHeight || disposed) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const horizon = canvasHeight * 0.51;
    const pulse = time * 0.000035;
    const gradient = context.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#080d21');
    gradient.addColorStop(0.48, '#07152b');
    gradient.addColorStop(1, '#030713');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.save();
    context.strokeStyle = 'rgba(0, 240, 255, .18)';
    context.lineWidth = 1;
    for (let index = -12; index <= 12; index += 1) {
      const bottomX = canvasWidth / 2 + index * canvasWidth * 0.09;
      context.beginPath();
      context.moveTo(canvasWidth / 2 + index * 3, horizon);
      context.lineTo(bottomX, canvasHeight);
      context.stroke();
    }
    for (let index = 0; index < 15; index += 1) {
      const depth = (index / 15 + (pulse % 0.08)) % 1;
      const y = horizon + Math.pow(depth, 2.3) * (canvasHeight - horizon + 30);
      context.strokeStyle = `rgba(0, 240, 255, ${0.08 + depth * 0.15})`;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvasWidth, y);
      context.stroke();
    }
    context.restore();

    particles.forEach((particle) => {
      const driftX = Math.sin(pulse * 8 + particle.seed) * 12;
      const driftY = Math.cos(pulse * 6 + particle.seed) * 8;
      const x = particle.x * canvasWidth + driftX;
      const y = particle.y * canvasHeight + driftY;
      const alpha = 0.22 + ((Math.sin(pulse * 10 + particle.seed) + 1) / 2) * 0.65;
      context.fillStyle = particle.color;
      context.globalAlpha = alpha;
      context.fillRect(x, y, particle.size, particle.size);
    });
    context.globalAlpha = 1;
    context.strokeStyle = 'rgba(255, 176, 0, .3)';
    context.beginPath();
    context.moveTo(canvasWidth * 0.06, canvasHeight * 0.16);
    context.lineTo(canvasWidth * 0.22, canvasHeight * 0.16);
    context.lineTo(canvasWidth * 0.27, canvasHeight * 0.23);
    context.stroke();
    context.beginPath();
    context.moveTo(canvasWidth * 0.77, canvasHeight * 0.75);
    context.lineTo(canvasWidth * 0.92, canvasHeight * 0.75);
    context.lineTo(canvasWidth * 0.96, canvasHeight * 0.68);
    context.stroke();
  }

  function animate(time) {
    drawTelemetry(time);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function playTone(frequency = 420, duration = 0.055) {
    if (!audioEnabled || disposed) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ??= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function renderCareer(entry) {
    const { transcript, metric } = careerTerminalMarkup(entry);
    const terminal = root.querySelector('#cyber-career-terminal');
    const company = root.querySelector('[data-cyber-company]');
    const period = root.querySelector('[data-cyber-period]');
    const highlight = root.querySelector('[data-cyber-highlight]');
    window.clearInterval(terminalTimer);
    terminal.textContent = '';
    company.textContent = `${entry.role} // ${entry.company}`;
    period.textContent = entry.period;
    highlight.hidden = !metric;
    highlight.textContent = metric ? `CRITICAL IMPACT // ${metric}` : '';
    let cursor = 0;
    terminalTimer = window.setInterval(() => {
      if (cursor >= transcript.length) {
        window.clearInterval(terminalTimer);
        terminalTimer = undefined;
        return;
      }
      terminal.textContent += transcript[cursor];
      cursor += 1;
    }, reducedMotion.matches ? 0 : 12);
  }

  function setCareer(id) {
    const entry = career.find((candidate) => candidate.id === id) ?? career[0];
    if (!entry) return;
    selectedCareerId = entry.id;
    root.querySelectorAll('.cyber-career-tab').forEach((tab) => {
      const active = tab.dataset.careerId === selectedCareerId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    renderCareer(entry);
    playTone(570, 0.07);
  }

  function updateAudioButton() {
    const button = root.querySelector('[data-cyber-action="audio-toggle"]');
    button.setAttribute('aria-pressed', String(audioEnabled));
    button.innerHTML = `<span aria-hidden="true">◉</span> AUDIO FX: ${audioEnabled ? 'ON' : 'OFF'}`;
  }

  function downloadResume() {
    const status = root.querySelector('[data-cyber-download-status]');
    const progress = root.querySelector('[data-cyber-download-progress]');
    const button = root.querySelector('[data-cyber-action="download-resume"]');
    window.clearInterval(downloadTimer);
    let percentage = 0;
    button.disabled = true;
    root.classList.add('is-extracting');
    status.textContent = 'Extracting dossier... 0%';
    downloadTimer = window.setInterval(() => {
      percentage += 20;
      progress.style.width = `${percentage}%`;
      status.textContent = percentage >= 100 ? 'Extraction complete. Download ready.' : `Extracting dossier... ${percentage}%`;
      if (percentage >= 100) {
        window.clearInterval(downloadTimer);
        downloadTimer = undefined;
        const link = document.createElement('a');
        link.href = profile.cvPath;
        link.download = 'Noratika-Chung-Resume.pdf';
        link.click();
        button.disabled = false;
        root.classList.remove('is-extracting');
      }
    }, 90);
  }

  function handleClick(event) {
    const button = event.target.closest('[data-cyber-action]');
    if (!button || !root.contains(button)) return;
    const action = button.dataset.cyberAction;
    if (action === 'career') setCareer(button.dataset.careerId);
    if (action === 'audio-toggle') {
      audioEnabled = !audioEnabled;
      updateAudioButton();
      if (audioEnabled) playTone(660, 0.08);
    }
    if (action === 'idea-fullscreen') {
      const expanded = root.classList.toggle('is-frame-expanded');
      button.setAttribute('aria-pressed', String(expanded));
      button.textContent = expanded ? 'COLLAPSE FRAME' : 'EXPAND FRAME';
      playTone(expanded ? 520 : 360);
    }
    if (action === 'download-resume') {
      downloadResume();
      playTone(740, 0.08);
    }
  }

  function handlePointerOver(event) {
    if (event.target.closest('button, a')) playTone(300, 0.035);
  }

  function handlePointerMove(event) {
    const bounds = root.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    root.style.setProperty('--pointer-x', `${x}%`);
    root.style.setProperty('--pointer-y', `${y}%`);
  }

  root.addEventListener('click', handleClick);
  root.addEventListener('pointerover', handlePointerOver);
  root.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  renderCareer(career[0]);
  if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(terminalTimer);
      window.clearInterval(downloadTimer);
      root.removeEventListener('click', handleClick);
      root.removeEventListener('pointerover', handlePointerOver);
      root.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resizeCanvas);
      if (audioContext) {
        audioContext.close();
        audioContext = undefined;
      }
      container.replaceChildren();
    },
  };
}
