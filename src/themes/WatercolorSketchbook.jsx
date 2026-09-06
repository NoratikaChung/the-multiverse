const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const listMarkup = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
const tagMarkup = (tags = []) => tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

const spreadNames = ['Story & Bio', 'Career Notes', 'The Lab', 'Postcard'];

function storySpread(profile) {
  const skillSwatches = Object.entries(profile.skills).map(([group, skills], index) => `<div class="watercolor-swatch swatch-${index % 4}"><strong>${escapeHtml(group)}</strong><span>${skills.map(escapeHtml).join(' · ')}</span></div>`).join('');
  return `<div class="sketch-spread sketch-spread-story">
    <article class="sketch-page sketch-page-left">
      <span class="page-number">01 / FIELD LOG</span>
      <div class="washi-tape tape-blue"></div>
      <div class="polaroid-card">
        <div class="polaroid-portrait" aria-hidden="true"><span>NC</span><i></i><i></i><i></i></div>
        <p>Field Log: Noratika Chung</p>
        <small>Kuala Lumpur · systems & stories</small>
      </div>
      <p class="ink-kicker">OBSERVATION // THE BUILDER</p>
      <h2>Make useful things feel alive.</h2>
      <p class="hand-copy">${escapeHtml(profile.bio)}</p>
      <div class="ink-rule"></div>
      <p class="margin-note">Preferred name: ${escapeHtml(profile.preferredName)}<br>${escapeHtml(profile.location)}</p>
      <a class="paperclip-note" href="${escapeHtml(profile.cvPath)}" download="Noratika-Chung-Resume.pdf"><span class="paperclip" aria-hidden="true">⌇</span><strong>Download Official Resume (PDF)</strong><small>clip this parchment to your quest log ↗</small></a>
    </article>
    <article class="sketch-page sketch-page-right">
      <span class="page-number">02 / HONORS</span>
      <div class="watercolor-wash wash-sage"></div>
      <div class="gold-seal" aria-label="Gold medal award seal"><span>GOLD<br>MEDAL</span></div>
      <p class="ink-kicker">FIELD NOTES // EDUCATION</p>
      <h2>University of Science Malaysia</h2>
      <p class="hand-copy"><strong>${escapeHtml(profile.education.degree)}</strong><br>${escapeHtml(profile.education.period)}</p>
      <div class="cgpa-note"><span>CGPA</span><strong>${escapeHtml(profile.education.cgpa)}</strong><small>First-Class academic background</small></div>
      <h3 class="section-label">Collected honors</h3>
      <ul class="hand-list">${listMarkup(profile.awards.map((award) => `${award.title} — ${award.detail}`))}</ul>
      <h3 class="section-label">Technical swatches</h3>
      <div class="swatch-grid">${skillSwatches}</div>
    </article>
  </div>`;
}

function careerSpread(career) {
  const cards = career.map((entry, index) => {
    const metric = entry.highlights?.find((highlight) => highlight.includes('87%'));
    return `<article class="career-sketch-card career-card-${index}">
      <div class="career-card-heading"><span class="blueprint-index">0${index + 1}</span><div><p class="ink-kicker">${escapeHtml(entry.period)}</p><h3>${escapeHtml(entry.role)}</h3><p class="company-line">${escapeHtml(entry.company)} · ${escapeHtml(entry.location)}</p></div></div>
      ${index === 0 ? '<span class="assignment-stamp">CURRENT ASSIGNMENT</span>' : ''}
      <p>${escapeHtml(entry.summary)}</p>
      ${metric ? `<p class="metric-highlight"><strong>87% server monitoring time reduction</strong><span>${escapeHtml(metric)}</span></p>` : ''}
      <ul class="hand-list">${listMarkup(entry.highlights ?? [])}</ul>
      <div class="blueprint-tags">${tagMarkup(entry.tags)}</div>
    </article>`;
  }).join('');
  return `<div class="sketch-spread sketch-spread-career">
    <article class="sketch-page sketch-page-left blueprint-page">
      <span class="page-number">03 / CASE STUDIES</span>
      <div class="blueprint-grid-art" aria-hidden="true"><span></span><span></span><span></span></div>
      <p class="ink-kicker">ARCHITECTURAL CASE STUDIES</p>
      <h2>Systems with a human center.</h2>
      <p class="hand-copy">A loose collection of engineering notes, delivery maps, and the small decisions that make a platform trustworthy.</p>
      <div class="blueprint-diagram" aria-hidden="true"><div class="diagram-node">people</div><div class="diagram-arrow">→</div><div class="diagram-node">systems</div><div class="diagram-arrow">→</div><div class="diagram-node">impact</div></div>
      <p class="margin-note">Drawn from the workbench · 2024—now</p>
      <div class="washi-tape tape-ochre"></div>
    </article>
    <article class="sketch-page sketch-page-right career-page">
      <span class="page-number">04 / ENGINEERING NOTES</span>
      <div class="career-card-stack">${cards}</div>
    </article>
  </div>`;
}

function labSpread(ideaBoard) {
  return `<div class="sketch-spread sketch-spread-lab">
    <article class="sketch-page sketch-page-left workshop-page">
      <span class="page-number">05 / THE WORKSHOP</span>
      <div class="watercolor-wash wash-cerulean"></div>
      <p class="ink-kicker">INTERACTIVE LAB // EXPERIMENT 01</p>
      <h2>Ideas want room to wander.</h2>
      <p class="hand-copy">A collaborative canvas for brainstorming, clustering thoughts, and making a little space for the unexpected.</p>
      <div class="tablet-frame">
        <div class="tablet-camera"></div>
        <div class="tablet-screen"><div class="tablet-screen-lines"></div><iframe src="${escapeHtml(ideaBoard.localUrl)}" title="Idea-Board interactive brainstorming application" loading="lazy"></iframe></div>
        <span class="tablet-home"></span>
      </div>
      <div class="lab-links"><a href="${escapeHtml(ideaBoard.localUrl)}" target="_blank" rel="noreferrer">Open full Idea-Board ↗</a><a href="${escapeHtml(ideaBoard.githubUrl)}" target="_blank" rel="noreferrer">Inspect the source ↗</a></div>
    </article>
    <article class="sketch-page sketch-page-right doodler-page">
      <span class="page-number">06 / MARGIN DOODLES</span>
      <p class="ink-kicker">A SMALL INVITATION</p>
      <h2>Leave your sketch here.</h2>
      <p class="hand-copy">Use your mouse, pen, or finger. Quick watercolor marks fade gently into the paper.</p>
      <div class="doodler-frame"><canvas class="sketchbook-doodler" width="400" height="400" aria-label="Watercolor doodler canvas"></canvas><span class="doodler-caption">your mark / ${escapeHtml(profile.preferredName)}</span></div>
      <div class="color-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <p class="margin-note">No wrong lines. Only new paths.</p>
    </article>
  </div>`;
}

function postcardSpread(profile) {
  return `<div class="sketch-spread sketch-spread-postcard">
    <article class="sketch-page sketch-page-left postcard-page">
      <span class="page-number">07 / POSTCARD</span>
      <div class="postcard-card">
        <div class="airmail-border"></div>
        <div class="postcard-topline"><span>AIR MAIL</span><span>PAR AVION</span></div>
        <div class="postcard-illustration" aria-hidden="true"><div class="sun"></div><div class="mountain mountain-back"></div><div class="mountain mountain-front"></div><div class="cabin"></div></div>
        <p class="ink-kicker">A NOTE FROM THE ROAD</p>
        <h2>Keep in touch.</h2>
        <p class="hand-copy">Hello from Nora's little corner of the multiverse. If you are building something thoughtful, I would love to hear the story.</p>
        <p class="postcard-signoff">— Nora</p>
      </div>
    </article>
    <article class="sketch-page sketch-page-right contact-page">
      <span class="page-number">08 / DELIVERY</span>
      <div class="stamp-cluster" aria-label="Decorative postage stamps"><span>KL<br>01</span><span>BUILD<br>WITH<br>CARE</span><span>✦</span></div>
      <p class="ink-kicker">DELIVERY ADDRESS // NORA</p>
      <h2>Send a signal.</h2>
      <p class="hand-copy">The quickest route to the drafting table:</p>
      <div class="postcard-links">
        <a href="mailto:${escapeHtml(profile.email)}"><span>EMAIL</span><strong>${escapeHtml(profile.email)}</strong></a>
        <a href="${escapeHtml(profile.github)}" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>NoratikaChung ↗</strong></a>
        <a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noreferrer"><span>LINKEDIN</span><strong>Noratika Chung ↗</strong></a>
      </div>
      <div class="postcard-address-lines" aria-hidden="true"><span></span><span></span><span></span></div>
      <p class="margin-note">Thank you for stopping by the sketchbook.</p>
    </article>
  </div>`;
}

export function createWatercolorSketchbook({ container, profile, career, projects }) {
  const ideaBoard = projects.find((project) => project.id === 'idea-board') ?? projects[0];
  const root = document.createElement('section');
  root.className = 'watercolor-sketchbook';
  root.setAttribute('aria-label', 'Watercolor sketchbook portfolio');
  root.innerHTML = `
    <div class="sketchbook-desk-props" aria-hidden="true"><span class="desk-pencil pencil-one"></span><span class="desk-pencil pencil-two"></span><span class="desk-brush"></span><span class="desk-ruler"></span><span class="desk-paperclip"></span></div>
    <div class="sketchbook-toolbar">
      <p class="sketchbook-kicker">THE MULTIVERSE / FIELD JOURNAL 04</p>
      <p class="sketchbook-instruction">Turn the pages · follow the ribbon tabs</p>
    </div>
    <main class="sketchbook-workspace">
      <nav class="sketchbook-bookmarks" aria-label="Sketchbook spreads"></nav>
      <section class="sketchbook-book" aria-label="Open watercolor sketchbook">
        <div class="sketchbook-pages"></div>
      </section>
      <div class="sketchbook-navigation">
        <button class="sketchbook-nav-button" data-sketch-action="previous" type="button">⟵ Prev Page</button>
        <p class="sketchbook-spread-status" aria-live="polite"></p>
        <button class="sketchbook-nav-button" data-sketch-action="next" type="button">Next Page ⟶</button>
      </div>
    </main>
    <p class="sketchbook-status" aria-live="polite"></p>`;
  container.replaceChildren(root);

  const book = root.querySelector('.sketchbook-book');
  const pages = root.querySelector('.sketchbook-pages');
  const bookmarks = root.querySelector('.sketchbook-bookmarks');
  const spreadStatus = root.querySelector('.sketchbook-spread-status');
  const status = root.querySelector('.sketchbook-status');
  const previousButton = root.querySelector('[data-sketch-action="previous"]');
  const nextButton = root.querySelector('[data-sketch-action="next"]');
  let activeSpread = 0;
  let turning = false;
  let turnTimer = 0;
  let doodleFadeTimer = 0;
  let doodleDrawing = false;
  let disposed = false;
  let doodleCanvas;
  let doodleContext;
  let doodleClearTimer = 0;

  function spreadMarkup(index) {
    if (index === 0) return storySpread(profile);
    if (index === 1) return careerSpread(career);
    if (index === 2) return labSpread(ideaBoard);
    return postcardSpread(profile);
  }

  function renderBookmarks() {
    bookmarks.innerHTML = spreadNames.map((name, index) => `<button class="sketchbook-bookmark bookmark-${index}" data-sketch-spread="${index}" type="button" aria-current="${activeSpread === index ? 'page' : 'false'}">🔖 ${escapeHtml(name)}</button>`).join('');
  }

  function setupDoodler() {
    doodleCanvas = root.querySelector('.sketchbook-doodler');
    if (!doodleCanvas) {
      doodleContext = undefined;
      return;
    }
    doodleContext = doodleCanvas.getContext('2d');
    doodleContext.lineCap = 'round';
    doodleContext.lineJoin = 'round';
    doodleContext.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);
  }

  function renderSpread() {
    window.clearTimeout(doodleFadeTimer);
    window.clearTimeout(doodleClearTimer);
    pages.innerHTML = spreadMarkup(activeSpread);
    pages.dataset.spread = String(activeSpread);
    spreadStatus.textContent = `Spread ${activeSpread + 1} of ${spreadNames.length} · ${spreadNames[activeSpread]}`;
    previousButton.disabled = activeSpread === 0;
    nextButton.disabled = activeSpread === spreadNames.length - 1;
    renderBookmarks();
    setupDoodler();
  }

  function goToSpread(index) {
    if (disposed || turning || index < 0 || index >= spreadNames.length || index === activeSpread) return;
    turning = true;
    book.classList.add('is-turning');
    window.clearTimeout(turnTimer);
    turnTimer = window.setTimeout(() => {
      activeSpread = index;
      renderSpread();
      book.classList.remove('is-turning');
      turning = false;
    }, 230);
  }

  function downloadResume() {
    const link = document.createElement('a');
    link.href = profile.cvPath;
    link.download = 'Noratika-Chung-Resume.pdf';
    link.click();
    status.textContent = 'Official resume download started.';
  }

  function doodlePoint(event) {
    if (!doodleCanvas || !doodleContext) return null;
    const bounds = doodleCanvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * doodleCanvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * doodleCanvas.height,
    };
  }

  function startDoodle(event) {
    if (!event.target.closest('.sketchbook-doodler') || !doodleContext) return;
    event.preventDefault();
    const point = doodlePoint(event);
    if (!point) return;
    doodleDrawing = true;
    doodleCanvas.setPointerCapture?.(event.pointerId);
    doodleContext.strokeStyle = ['rgba(63, 133, 171, .48)', 'rgba(211, 139, 76, .48)', 'rgba(107, 151, 112, .48)', 'rgba(162, 108, 157, .42)'][Math.floor(Math.random() * 4)];
    doodleContext.lineWidth = 13;
    doodleContext.beginPath();
    doodleContext.moveTo(point.x, point.y);
    doodleContext.lineTo(point.x + 1, point.y + 1);
    doodleContext.stroke();
    scheduleDoodleFade();
  }

  function drawDoodle(event) {
    if (!doodleDrawing || !doodleContext) return;
    const point = doodlePoint(event);
    if (!point) return;
    doodleContext.lineTo(point.x, point.y);
    doodleContext.stroke();
    scheduleDoodleFade();
  }

  function endDoodle() {
    doodleDrawing = false;
  }

  function scheduleDoodleFade() {
    if (!doodleCanvas) return;
    doodleCanvas.classList.remove('is-fading');
    window.clearTimeout(doodleFadeTimer);
    window.clearTimeout(doodleClearTimer);
    doodleFadeTimer = window.setTimeout(() => {
      if (!doodleCanvas || disposed) return;
      doodleCanvas.classList.add('is-fading');
      doodleClearTimer = window.setTimeout(() => {
        if (!doodleCanvas || disposed) return;
        doodleContext?.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);
        doodleCanvas.classList.remove('is-fading');
      }, 1800);
    }, 1200);
  }

  function handleClick(event) {
    const spreadButton = event.target.closest('[data-sketch-spread]');
    if (spreadButton) {
      goToSpread(Number(spreadButton.dataset.sketchSpread));
      return;
    }
    const actionButton = event.target.closest('[data-sketch-action]');
    if (!actionButton) return;
    const action = actionButton.dataset.sketchAction;
    if (action === 'previous') goToSpread(activeSpread - 1);
    if (action === 'next') goToSpread(activeSpread + 1);
    if (action === 'download-resume') downloadResume();
  }

  root.addEventListener('click', handleClick);
  root.addEventListener('pointerdown', startDoodle);
  root.addEventListener('pointermove', drawDoodle);
  root.addEventListener('pointerup', endDoodle);
  root.addEventListener('pointercancel', endDoodle);
  root.addEventListener('pointerleave', endDoodle);
  renderSpread();

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(turnTimer);
      window.clearTimeout(doodleClearTimer);
      root.removeEventListener('click', handleClick);
      root.removeEventListener('pointerdown', startDoodle);
      root.removeEventListener('pointermove', drawDoodle);
      root.removeEventListener('pointerup', endDoodle);
      root.removeEventListener('pointercancel', endDoodle);
      root.removeEventListener('pointerleave', endDoodle);
      doodleDrawing = false;
      doodleContext = undefined;
      doodleCanvas = undefined;
      container.replaceChildren();
    },
  };
}
