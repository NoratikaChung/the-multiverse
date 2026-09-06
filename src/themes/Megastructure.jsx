const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const tagMarkup = (tags = []) => tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

function missionMarkup(career) {
  return career.map((entry, index) => {
    const metric = entry.highlights.find((highlight) => highlight.includes('87%'));
    return `<article class="mega-mission-card"><div class="mega-card-index">0${index + 1}</div><div class="mega-mission-heading"><p class="mega-kicker">${escapeHtml(entry.period)} // ${escapeHtml(entry.location)}</p><h3>${escapeHtml(entry.company)}</h3><p>${escapeHtml(entry.role)}</p></div>${metric ? `<strong class="mega-metric">${escapeHtml(metric)}</strong>` : ''}<p class="mega-mission-summary">${escapeHtml(entry.summary)}</p><ul>${entry.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul><div class="mega-tags">${tagMarkup(entry.tags)}</div></article>`;
  }).join('');
}

export function createMegastructure({ container, profile, career, ideaBoard }) {
  const root = document.createElement('main');
  root.className = 'megastructure';
  root.setAttribute('aria-labelledby', 'mega-title');
  root.innerHTML = `
    <canvas class="mega-parallax-canvas" aria-hidden="true"></canvas>
    <div class="mega-ambient-layer" aria-hidden="true"></div>
    <div class="mega-shaft-hud"><span class="mega-shaft-label">ELEVATOR SHAFT // <strong data-mega-level>LEVEL: 01</strong></span><span class="mega-shaft-track" aria-hidden="true"><i data-mega-progress></i></span><span data-mega-depth>DEPTH 0000m</span></div>
    <div class="mega-scroll-note" aria-live="polite"><span class="mega-live-dot" aria-hidden="true"></span><span data-mega-status>DESCENT READY</span></div>
    <section class="mega-floor mega-floor-cockpit" id="mega-floor-01" data-mega-floor="1">
      <div class="mega-floor-inner mega-cockpit-inner"><p class="mega-kicker">FLOOR 01 // OPERATOR COCKPIT</p><h1 id="mega-title">${escapeHtml(profile.name)}<br><span>// ${escapeHtml(profile.title).toUpperCase()}</span></h1><p class="mega-hero-lede">Architecting resilient systems and thoughtful digital experiences from ${escapeHtml(profile.location)}.</p><div class="mega-hero-facts"><span>USM // CGPA ${escapeHtml(profile.education.cgpa)}</span><span>PIXEL 2025 // GOLD MEDAL</span><span>VIC 2024 // GOLD MEDAL</span></div><button class="mega-descend-prompt" data-mega-action="floor" data-floor="2" type="button">[ ▾ SCROLL DOWN TO DESCEND SHAFT ]</button></div>
    </section>
    <section class="mega-floor mega-floor-missions" id="mega-floor-02" data-mega-floor="2">
      <div class="mega-floor-inner"><div class="mega-section-heading"><div><p class="mega-kicker">FLOOR 02 // DECLASSIFIED MISSION ARCHIVES</p><h2>Systems with a human center.</h2></div><span class="mega-section-code">ARCHIVE // 04 RECORDS</span></div><div class="mega-mission-grid">${missionMarkup(career)}</div></div>
    </section>
    <section class="mega-floor mega-floor-simulation" id="mega-floor-03" data-mega-floor="3">
      <div class="mega-floor-inner"><div class="mega-section-heading"><div><p class="mega-kicker">FLOOR 03 // NEURAL SIMULATION BAY</p><h2>Give ideas room to move.</h2></div><a class="mega-section-link" href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">SOURCE ↗</a></div><div class="mega-simulation-frame"><div class="mega-simulation-bar"><span>LIVE CHAMBER // ${escapeHtml(ideaBoard.localUrl)}</span><span>UPLINK NOMINAL</span></div><iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive brainstorming application" loading="lazy"></iframe></div></div>
    </section>
    <section class="mega-floor mega-floor-uplink" id="mega-floor-04" data-mega-floor="4">
      <div class="mega-floor-inner mega-uplink-inner"><div><p class="mega-kicker">FLOOR 04 // DATA EXTRACTION PORT</p><h2>Open a direct channel.</h2><p class="mega-uplink-lede">The elevator has reached the ground floor. Establish a relay or extract the complete professional dossier.</p></div><div class="mega-relays"><a href="mailto:${escapeHtml(profile.email)}"><span>EMAIL</span><strong>${escapeHtml(profile.email)}</strong><b aria-hidden="true">↗</b></a><a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>github.com/NoratikaChung</strong><b aria-hidden="true">↗</b></a><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>linkedin.com/in/noratika-chung</strong><b aria-hidden="true">↗</b></a></div><div class="mega-dossier"><span class="mega-kicker">HIGH-VOLTAGE EXTRACTION // CV.PDF</span><p data-mega-download-status>Ready for extraction.</p><button data-mega-action="download-resume" type="button">[ ⬇ DOWNLOAD DOSSIER: RESUME.PDF ]</button><div class="mega-download-track" aria-hidden="true"><i data-mega-download-progress></i></div></div></div>
    </section>
  `;
  container.replaceChildren(root);

  const canvas = root.querySelector('.mega-parallax-canvas');
  const context = canvas.getContext('2d');
  const levelReadout = root.querySelector('[data-mega-level]');
  const depthReadout = root.querySelector('[data-mega-depth]');
  const progress = root.querySelector('[data-mega-progress]');
  const status = root.querySelector('[data-mega-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = Array.from({ length: 68 }, (_, index) => ({
    x: (index * 61.7) % 1,
    y: (index * 37.4) % 1,
    size: 0.5 + (index % 3) * 0.45,
    depth: 0.25 + ((index * 19) % 70) / 100,
    phase: index * 1.41,
  }));
  let width = 0;
  let height = 0;
  let scrollPosition = 0;
  let animationFrame;
  let downloadTimer;
  let disposed = false;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = root.clientWidth;
    height = root.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }

  function draw(time) {
    if (!width || !height || disposed) return;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#05070c';
    context.fillRect(0, 0, width, height);
    const scrollFactor = scrollPosition / Math.max(height, 1);
    const drift = reducedMotion.matches ? 0 : time * 0.00003;

    particles.forEach((particle) => {
      const x = particle.x * width + Math.sin(drift * 8 + particle.phase) * 16 * particle.depth;
      const y = ((particle.y * height - scrollPosition * (0.12 + particle.depth * 0.16)) % height + height) % height;
      context.globalAlpha = 0.12 + particle.depth * 0.35;
      context.fillStyle = particle.depth > 0.72 ? '#00f0ff' : '#718095';
      context.fillRect(x, y, particle.size, particle.size);
    });
    context.globalAlpha = 1;

    const vanishingX = width * 0.5;
    const vanishingY = height * (0.45 + Math.sin(scrollFactor * 0.8) * 0.03);
    context.lineWidth = 1;
    for (let index = -11; index <= 11; index += 1) {
      const bottomX = width / 2 + index * width * 0.1;
      context.strokeStyle = index % 3 === 0 ? 'rgba(0,240,255,.18)' : 'rgba(54,93,120,.16)';
      context.beginPath();
      context.moveTo(vanishingX, vanishingY);
      context.lineTo(bottomX, height);
      context.stroke();
    }
    for (let index = 0; index < 14; index += 1) {
      const y = ((vanishingY + index * 75 - scrollPosition * 0.24) % (height + 90) + height + 90) % (height + 90);
      context.strokeStyle = `rgba(0,240,255,${0.06 + (index % 4) * 0.025})`;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.strokeStyle = 'rgba(255,176,0,.24)';
    context.lineWidth = 2;
    [0.12, 0.88].forEach((position) => {
      context.beginPath();
      context.moveTo(width * position, 0);
      context.lineTo(width * position + Math.sin(scrollFactor) * 35, height);
      context.stroke();
    });
  }

  function animate(time) {
    if (disposed) return;
    draw(time);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function updateLevel() {
    const levelHeight = Math.max(root.clientHeight, 1);
    const level = Math.min(4, Math.max(1, Math.floor(scrollPosition / levelHeight) + 1));
    levelReadout.textContent = `LEVEL: 0${level}`;
    depthReadout.textContent = `DEPTH ${String(Math.round(scrollPosition / 2)).padStart(4, '0')}m`;
    progress.style.width = `${((level - 1) / 3) * 100}%`;
    status.textContent = level === 1 ? 'DESCENT READY' : `FLOOR 0${level} // ACCESS GRANTED`;
  }

  function handleScroll() {
    scrollPosition = root.scrollTop;
    updateLevel();
    draw(0);
  }

  function scrollToFloor(floor) {
    const target = root.querySelector(`[data-mega-floor="${floor}"]`);
    if (!target) return;
    root.scrollTo({ top: target.offsetTop, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function downloadResume() {
    const button = root.querySelector('[data-mega-action="download-resume"]');
    const statusText = root.querySelector('[data-mega-download-status]');
    const downloadProgress = root.querySelector('[data-mega-download-progress]');
    let percentage = 0;
    window.clearInterval(downloadTimer);
    button.disabled = true;
    statusText.textContent = 'Preparing dossier... 0%';
    downloadTimer = window.setInterval(() => {
      percentage += 20;
      downloadProgress.style.width = `${percentage}%`;
      statusText.textContent = percentage >= 100 ? 'Dossier extracted. Download ready.' : `Preparing dossier... ${percentage}%`;
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
    const actionTarget = event.target.closest('[data-mega-action]');
    if (!actionTarget || !root.contains(actionTarget)) return;
    if (actionTarget.dataset.megaAction === 'floor') scrollToFloor(actionTarget.dataset.floor);
    if (actionTarget.dataset.megaAction === 'download-resume') downloadResume();
  }

  root.addEventListener('scroll', handleScroll, { passive: true });
  root.addEventListener('click', handleClick);
  window.addEventListener('resize', resize);
  resize();
  updateLevel();
  if (reducedMotion.matches) draw(0);
  else animationFrame = window.requestAnimationFrame(animate);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearInterval(downloadTimer);
      root.removeEventListener('scroll', handleScroll);
      root.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      container.replaceChildren();
    },
  };
}
