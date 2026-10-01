(() => {
  'use strict';

  // Where the chorus starts in umapyoi-densetsu.mp3 (seconds). Tweak if needed.
  const CHORUS_START = 207;
  // How far the camera pushes into the starting gate before the close-up takes over.
  const MAX_ZOOM = 5.5;
  // Left-to-right order of the line-up (Special Week in the middle).
  const LINEUP = ['gold-ship', 'vodka', 'daiwa-scarlet', 'special-week', 'silence-suzuka', 'tokai-teio', 'mejiro-mcqueen'];

  const CHARS = window.SPICA;
  const $ = (s, el = document) => el.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map = (v, a, b) => clamp((v - a) / (b - a));
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  const body = document.body;
  const song = $('#song');
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, sx: 0, sy: 0 };

  addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth * 2 - 1;
    mouse.ny = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  /* =========================================================
     Cursor: arrow + lagging horseshoe ring + sparkle trail
     ========================================================= */
  const cursor = $('.cursor');
  const arrow = $('.cursor-arrow');
  const ring = $('.cursor-ring');
  const trail = $('#trail');
  const tctx = trail.getContext('2d');
  const ringPos = { x: mouse.x, y: mouse.y };
  const lastPos = { x: mouse.x, y: mouse.y };
  const points = [];
  const sparks = [];
  const SPARK_COLORS = ['#ff8fb6', '#ffd84d', '#8fe25f', '#6fd0ff', '#ffffff'];
  let dpr = 1, trailDirty = false;

  function sizeTrail() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    trail.width = innerWidth * dpr; trail.height = innerHeight * dpr;
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeTrail();
  addEventListener('resize', sizeTrail);

  document.addEventListener('pointerover', e => {
    cursor.classList.toggle('is-hover', !!e.target.closest('button, a, [data-hover]'));
  });
  addEventListener('pointerdown', () => {
    cursor.classList.add('is-down');
    for (let i = 0; i < 14; i++) spawnSpark(mouse.x, mouse.y, 4);
  });
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  function spawnSpark(x, y, force = 1) {
    if (sparks.length > 160) return;
    const a = Math.random() * Math.PI * 2, s = (Math.random() * .8 + .2) * force;
    sparks.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - .3,
      life: 1, size: Math.random() * 4 + 2, rot: Math.random() * Math.PI,
      color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0]
    });
  }

  function drawStar(x, y, r, rot) {
    tctx.save(); tctx.translate(x, y); tctx.rotate(rot); tctx.beginPath();
    for (let i = 0; i < 4; i++) {
      tctx.lineTo(0, -r); tctx.rotate(Math.PI / 4); tctx.lineTo(0, -r * .35); tctx.rotate(Math.PI / 4);
    }
    tctx.closePath(); tctx.fill(); tctx.restore();
  }

  function cursorFrame() {
    const vx = mouse.x - lastPos.x, vy = mouse.y - lastPos.y;
    const speed = Math.hypot(vx, vy);
    lastPos.x = mouse.x; lastPos.y = mouse.y;

    // Arrow is exact; ring lags and leans away from motion for a layered parallax feel
    ringPos.x = lerp(ringPos.x, mouse.x - vx * 1.5, .2);
    ringPos.y = lerp(ringPos.y, mouse.y - vy * 1.5, .2);
    const lean = clamp(vx * 1.2, -25, 25);
    arrow.style.transform = `translate3d(${mouse.x - 4}px, ${mouse.y - 3}px, 0) rotate(${lean * .4}deg)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) rotate(${lean}deg) scale(${1 + clamp(speed / 120, 0, .25)})`;

    if (speed > .5) points.push({ x: mouse.x, y: mouse.y, life: 1 });
    if (speed > 2) for (let i = 0; i < Math.min(3, speed / 12); i++) spawnSpark(mouse.x + (Math.random() - .5) * 10, mouse.y + (Math.random() - .5) * 10);

    if (!points.length && !sparks.length) {
      if (trailDirty) { tctx.clearRect(0, 0, innerWidth, innerHeight); trailDirty = false; }
      return;
    }
    trailDirty = true;
    tctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = points.length - 1; i >= 0; i--) { points[i].life -= .07; if (points[i].life <= 0) points.splice(i, 1); }
    tctx.lineCap = 'round';
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1], p1 = points[i];
      tctx.strokeStyle = `hsla(${(140 + i * 9) % 360}, 90%, 72%, ${p1.life * .7})`;
      tctx.lineWidth = p1.life * 7;
      tctx.beginPath(); tctx.moveTo(p0.x, p0.y); tctx.lineTo(p1.x, p1.y); tctx.stroke();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += .05; s.life -= .025; s.rot += .1;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      tctx.globalAlpha = s.life; tctx.fillStyle = s.color;
      drawStar(s.x, s.y, s.size * (.5 + s.life * .5), s.rot);
    }
    tctx.globalAlpha = 1;
  }

  /* =========================================================
     Racecourse scene (layers are composited; only transforms change per frame)
     ========================================================= */
  const petals = $('.petals');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.left = `${Math.random() * 110}%`;
    p.style.animationDuration = `${9 + Math.random() * 10}s`;
    p.style.animationDelay = `${-Math.random() * 18}s`;
    petals.appendChild(p);
  }

  const intro = $('#intro');
  const stage = $('.stage');
  const tilt = $('.tilt');
  const layers = [...document.querySelectorAll('.layer')].map(el => ({ el, depth: +el.dataset.depth, zoom: +el.dataset.zoom }));
  const gateEl = document.getElementById('gate');
  const gateClose = $('.gate-close');
  const introCopy = $('.intro-copy');
  let progress = 0, smooth = 0, opened = false, hinted = false, settled = 0;
  const gatePos = { x: 0, y: 0 };

  function measureGate() {
    layers.forEach(l => { l.el.style.transform = 'none'; });
    const g = gateEl.getBoundingClientRect();
    const gx = g.left + g.width / 2, gy = g.top + g.height * .55;
    gatePos.x = gx; gatePos.y = gy;
    layers.forEach(l => {
      const r = l.el.getBoundingClientRect();
      l.el.style.transformOrigin = `${gx - r.left}px ${gy - r.top}px`;
    });
  }
  addEventListener('resize', measureGate);
  measureGate();

  addEventListener('scroll', () => {
    if (opened) return;
    const max = intro.offsetHeight - innerHeight;
    progress = clamp(scrollY / max);
    if (progress > .9 && !body.classList.contains('is-booting')) openGate();
  }, { passive: true });

  // While zooming, will-change keeps the layers on the GPU (smooth, but rastered at a
  // fixed scale). Once the scroll settles the hint is dropped so the vector art
  // re-rasters sharply at the current zoom.
  function setHint(on) {
    hinted = on;
    layers.forEach(l => { l.el.style.willChange = on ? 'transform' : 'auto'; });
  }

  function sceneFrame() {
    if (body.classList.contains('is-revealed')) return;
    mouse.sx = lerp(mouse.sx, mouse.nx, .06);
    mouse.sy = lerp(mouse.sy, mouse.ny, .06);
    if (!opened) smooth = lerp(smooth, progress, .12);

    const z = easeInOut(map(smooth, 0, .82));
    const scale = Math.pow(MAX_ZOOM, z);
    const calm = 1 - z * .85; // parallax settles as we approach the gate

    tilt.style.transform = `perspective(1600px) rotateY(${(mouse.sx * 2 * calm).toFixed(3)}deg) rotateX(${(-mouse.sy * 1.4 * calm).toFixed(3)}deg)`;
    // pan so the gate drifts to the centre of the screen as we push in
    const panX = (innerWidth / 2 - gatePos.x) * z, panY = (innerHeight / 2 - gatePos.y) * z;
    for (const l of layers) {
      const tx = panX - mouse.sx * l.depth * calm, ty = panY - mouse.sy * l.depth * .6 * calm;
      l.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${Math.pow(scale, l.zoom).toFixed(4)})`;
    }

    const copyOut = map(smooth, 0, .1);
    introCopy.style.opacity = 1 - copyOut;
    introCopy.style.transform = `translateY(${-copyOut * 40}px)`;

    if (!opened) {
      const g = map(smooth, .55, .8);
      gateClose.style.opacity = g;
      gateClose.style.transform = `scale(${(1.3 - g * .3).toFixed(4)})`;
    }

    const moving = Math.abs(progress - smooth) > .0008;
    settled = moving ? 0 : settled + 1;
    if (moving && !hinted) setHint(true);
    if (settled === 10 && hinted) setHint(false);
  }

  /* =========================================================
     Gate opening: charge up, then slam
     ========================================================= */
  const burst = $('#burst');
  const confetti = $('#confetti');
  const cctx = confetti.getContext('2d');
  let confettiBits = [], confettiOn = false;

  function startConfetti() {
    confetti.width = innerWidth * dpr; confetti.height = innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    confettiBits = Array.from({ length: reduceMotion ? 40 : 170 }, () => {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 18 + 6;
      return {
        x: innerWidth / 2, y: innerHeight / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4,
        w: Math.random() * 10 + 6, h: Math.random() * 6 + 4, rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
        color: SPARK_COLORS[(Math.random() * 4) | 0], star: Math.random() < .25
      };
    });
    confettiOn = true;
  }
  function confettiFrame() {
    if (!confettiOn) return;
    cctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const c of confettiBits) {
      c.vx *= .985; c.vy = c.vy * .985 + .22; c.x += c.vx; c.y += c.vy; c.rot += c.vr;
      if (c.y > innerHeight + 20) continue;
      alive++;
      cctx.save(); cctx.translate(c.x, c.y); cctx.rotate(c.rot); cctx.fillStyle = c.color;
      if (c.star) {
        cctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a1 = (18 + i * 72) * Math.PI / 180, a2 = (54 + i * 72) * Math.PI / 180;
          cctx.lineTo(Math.cos(a1) * c.w, -Math.sin(a1) * c.w);
          cctx.lineTo(Math.cos(a2) * c.w * .45, -Math.sin(a2) * c.w * .45);
        }
        cctx.closePath(); cctx.fill();
      } else {
        const k = Math.cos(c.rot * 2);
        cctx.fillRect(-c.w / 2, -c.h / 2 * k, c.w, c.h * k);
      }
      cctx.restore();
    }
    if (!alive) { confettiOn = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  function playChorus() {
    try {
      song.volume = 0;
      const p = song.play();
      if (p) p.catch(() => {});
      const t0 = performance.now();
      const fade = now => {
        song.volume = clamp((now - t0) / 140) * .9;
        if (now - t0 < 140) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    } catch { /* audio not ready */ }
  }

  const CHARGE_MS = reduceMotion ? 200 : 900;
  function openGate() {
    if (opened) return;
    opened = true;
    body.classList.add('is-locked');
    gateClose.style.opacity = 1;
    gateClose.style.transform = 'none';
    try { song.currentTime = CHORUS_START; } catch { /* metadata not loaded yet */ }
    gateClose.classList.add('is-charging');

    setTimeout(() => {
      gateClose.classList.remove('is-charging');
      gateClose.classList.add('is-open');
      stage.classList.add('is-punch');
      playChorus();
      burst.classList.add('is-on');
      startConfetti();
    }, CHARGE_MS);

    setTimeout(() => {
      body.classList.add('is-revealed');
      body.classList.remove('is-locked');
      scrollTo(0, 0);
      dealLineup();
    }, CHARGE_MS + 2950);

    setTimeout(() => burst.classList.remove('is-on'), CHARGE_MS + 3450);
  }

  function resetIntro() {
    closeDetail(true);
    song.pause();
    opened = false; progress = 0; smooth = 0;
    gateClose.classList.remove('is-open', 'is-charging');
    stage.classList.remove('is-punch');
    gateClose.style.opacity = 0;
    body.classList.remove('is-revealed');
    scrollTo(0, 0);
    requestAnimationFrame(measureGate);
  }
  $('#replayBtn').addEventListener('click', resetIntro);

  /* =========================================================
     Mute
     ========================================================= */
  const muteBtn = $('#muteBtn');
  function setMuted(m) {
    song.muted = m;
    muteBtn.classList.toggle('muted', m);
    muteBtn.setAttribute('aria-label', m ? 'Unmute music' : 'Mute music');
    store.set('uma-muted', m ? '1' : '0');
  }
  setMuted(store.get('uma-muted') === '1');
  muteBtn.addEventListener('click', () => setMuted(!song.muted));

  /* =========================================================
     Line-up at Tracen Academy
     ========================================================= */
  const lineup = $('#lineup');
  const tracenBg = $('.tracen-bg');
  const order = LINEUP.map(id => CHARS.findIndex(c => c.id === id));
  const tallest = Math.max(...CHARS.map(c => c.height));
  const mid = (order.length - 1) / 2;

  order.forEach((ci, pos) => {
    const c = CHARS[ci];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'uma';
    b.dataset.index = ci;
    b.style.setProperty('--h', (c.height / tallest).toFixed(3));
    b.style.setProperty('--c', c.color);
    b.style.setProperty('--in', `${(.15 + Math.abs(pos - mid) * .12).toFixed(2)}s`);
    b.style.setProperty('--delay', `${(-Math.random() * 3).toFixed(2)}s`);
    b.style.zIndex = 10 - Math.round(Math.abs(pos - mid));
    b.setAttribute('aria-label', `View ${c.name}`);
    b.innerHTML = `<img src="${c.img}" alt="${c.name} in her G1 racewear" draggable="false"><span class="plate">${c.name}<small>${c.jp}</small></span>`;
    b.addEventListener('click', () => openDetail(ci));
    b.addEventListener('animationend', e => { if (e.animationName === 'stepIn') { b.style.animation = 'none'; b.style.opacity = 1; } });
    lineup.appendChild(b);
  });
  const umaButtons = [...lineup.children];
  const buttonFor = ci => umaButtons.find(b => +b.dataset.index === ci);

  function dealLineup() {
    umaButtons.forEach(b => {
      b.style.animation = 'none';
      b.style.opacity = '';
      void b.offsetWidth;
      b.style.animation = '';
    });
    const wrap = $('.lineup-wrap');
    wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
  }

  function rosterFrame() {
    if (!body.classList.contains('is-revealed')) return;
    mouse.sx = lerp(mouse.sx, mouse.nx, .05);
    mouse.sy = lerp(mouse.sy, mouse.ny, .05);
    tracenBg.style.transform = `translate3d(${(-mouse.sx * 14).toFixed(2)}px, ${(-mouse.sy * 8).toFixed(2)}px, 0)`;
  }

  /* =========================================================
     Detail view
     ========================================================= */
  const detail = $('#detail');
  const detailBg = $('.detail-bg');
  const dpImg = $('.dp-img');
  const portrait = $('.detail-portrait');
  let current = -1, flying = false;

  function fillDetail(i) {
    const c = CHARS[i];
    detail.style.setProperty('--char', c.color);
    detail.style.setProperty('--char2', c.color2);
    detail.style.setProperty('--char-accent', c.accent);
    detailBg.dataset.name = c.name;
    $('.di-epithet').textContent = c.epithet;
    $('.di-name').textContent = c.name;
    $('.di-jp').textContent = c.jp;
    $('.di-bio').innerHTML = c.bio.map(p => `<p>${p}</p>`).join('');
    const h = c.horse;
    $('.stat-grid').innerHTML = [
      ['Born', h.born], ['Sire', h.sire], ['Dam', h.dam], ['Career', h.career], ['Record', h.record], ['G1 wins', h.g1.length]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $('.g1-list').innerHTML = h.g1.map(r => `<span class="g1"><b>G1</b>${r}</span>`).join('') + `<p class="g1-note">${h.note}</p>`;
    dpImg.src = c.img;
    dpImg.alt = `${c.name} in her G1 racewear`;
  }

  function restartInfoAnim() {
    detail.classList.remove('is-open');
    void detail.offsetWidth;
    detail.classList.add('is-open');
  }

  function fly(src, from, to, duration) {
    const f = document.createElement('img');
    f.className = 'fly-img';
    f.src = src;
    f.style.width = `${to.width}px`;
    f.style.height = `${to.height}px`;
    document.body.appendChild(f);
    const s = from.height / to.height;
    const anim = f.animate([
      { transform: `translate(${from.left}px, ${from.top}px) scale(${s})` },
      { transform: `translate(${to.left}px, ${to.top}px) scale(1)` }
    ], { duration: reduceMotion ? 1 : duration, easing: 'cubic-bezier(.6, 0, .2, 1)', fill: 'forwards' });
    return anim.finished.then(() => f.remove());
  }

  // The visible box of the character art inside an <img> (object-fit: contain, bottom-aligned)
  function artRect(img) {
    const r = img.getBoundingClientRect();
    const ar = img.naturalWidth / img.naturalHeight || .5;
    const h = Math.min(r.height, r.width / ar), w = h * ar;
    return { left: r.left + (r.width - w) / 2, top: r.bottom - h, width: w, height: h };
  }

  async function openDetail(i) {
    if (flying) return;
    flying = true;
    current = i;
    const btn = buttonFor(i);
    const srcImg = btn.querySelector('img');
    const from = srcImg.getBoundingClientRect();
    fillDetail(i);
    try { await dpImg.decode(); } catch { /* fall through */ }
    detail.style.setProperty('--ox', `${from.left + from.width / 2}px`);
    detail.style.setProperty('--oy', `${from.top + from.height / 2}px`);
    detail.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    dpImg.style.visibility = 'hidden';
    restartInfoAnim();
    const to = artRect(dpImg);
    srcImg.style.visibility = 'hidden';
    await fly(CHARS[i].img, from, to, 700);
    dpImg.style.visibility = '';
    flying = false;
    $('#backBtn').focus({ preventScroll: true });
  }

  async function closeDetail(instant = false) {
    if (!detail.classList.contains('is-open') || (flying && !instant)) return;
    const btn = buttonFor(current);
    const srcImg = btn && btn.querySelector('img');
    const from = artRect(dpImg);
    detail.classList.remove('is-open');
    detail.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    umaButtons.forEach(b => { b.querySelector('img').style.visibility = ''; });
    if (instant || !srcImg) return;
    flying = true;
    srcImg.style.visibility = 'hidden';
    await fly(CHARS[current].img, from, srcImg.getBoundingClientRect(), 550);
    srcImg.style.visibility = '';
    flying = false;
    btn.focus({ preventScroll: true });
  }

  function step(dir) {
    if (flying) return;
    const pos = order.indexOf(current);
    const n = order[(pos + dir + order.length) % order.length];
    umaButtons.forEach(b => { b.querySelector('img').style.visibility = ''; });
    buttonFor(n).querySelector('img').style.visibility = 'hidden';
    current = n;
    fillDetail(n);
    restartInfoAnim();
    dpImg.animate([
      { transform: `translateX(${dir * -80}px)`, opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: reduceMotion ? 1 : 420, easing: 'cubic-bezier(.25, 1.3, .5, 1)' });
  }

  $('#backBtn').addEventListener('click', () => closeDetail());
  $('#prevBtn').addEventListener('click', () => step(-1));
  $('#nextBtn').addEventListener('click', () => step(1));
  addEventListener('keydown', e => {
    if (!detail.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeDetail();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  portrait.addEventListener('pointermove', e => {
    const r = portrait.getBoundingClientRect();
    dpImg.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 14}deg`);
    dpImg.style.setProperty('--rx', `${(.5 - (e.clientY - r.top) / r.height) * 6}deg`);
  });
  portrait.addEventListener('pointerleave', () => {
    dpImg.style.setProperty('--rx', '0deg');
    dpImg.style.setProperty('--ry', '0deg');
  });

  /* =========================================================
     Boot sequence
     ========================================================= */
  const boot = $('#boot');
  const startBtn = $('.boot-start');
  const fill = $('.boot-fill');
  const runner = $('.boot-runner');
  const pct = $('.boot-pct');
  const firstVisit = !store.get('uma-booted');
  if (!firstVisit || reduceMotion) boot.classList.add('is-fast');

  const loadStart = firstVisit && !reduceMotion ? 1500 : 250;
  const loadDur = firstVisit && !reduceMotion ? 1500 : 600;
  const t0 = performance.now();
  (function loadTick(now) {
    const t = clamp((now - t0 - loadStart) / loadDur);
    const v = Math.round(easeInOut(t) * 100);
    fill.style.width = `${v}%`;
    runner.style.left = `${v}%`;
    pct.textContent = `${v}%`;
    if (t < 1) requestAnimationFrame(loadTick);
    else {
      pct.textContent = 'READY!';
      startBtn.classList.add('is-ready');
      startBtn.focus({ preventScroll: true });
    }
  })(t0);

  startBtn.addEventListener('click', () => {
    store.set('uma-booted', '1');
    // Prime audio inside the user gesture so the gate can play it later
    const wasMuted = song.muted;
    song.muted = true;
    const p = song.play();
    const restore = () => { song.pause(); song.muted = wasMuted; };
    if (p) p.then(restore, restore); else restore();

    for (let i = 0; i < 30; i++) spawnSpark(mouse.x, mouse.y, 6);
    boot.classList.add('is-done');
    body.classList.remove('is-booting');
    scrollTo(0, 0);
    setTimeout(() => boot.remove(), 800);
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* =========================================================
     Main loop
     ========================================================= */
  (function loop() {
    if (finePointer) cursorFrame();
    sceneFrame();
    rosterFrame();
    confettiFrame();
    requestAnimationFrame(loop);
  })();
})();
