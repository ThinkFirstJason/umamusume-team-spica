(() => {
  'use strict';

  // Where the chorus starts in umapyoi-densetsu.mp3 (seconds). Tweak if needed.
  const CHORUS_START = 207;
  const CHARS = window.SPICA;
  const HAIR = { 'tokai-teio': '#6b3f22', 'mejiro-mcqueen': '#c7b5f0', 'vodka': '#1a1a20', 'daiwa-scarlet': '#9b2a2a' };

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
  let dpr = 1;

  function sizeTrail() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    trail.width = innerWidth * dpr; trail.height = innerHeight * dpr;
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeTrail();
  addEventListener('resize', sizeTrail);

  document.addEventListener('pointerover', e => {
    cursor.classList.toggle('is-hover', !!e.target.closest('button, a, [data-hover], .uma-card'));
  });
  addEventListener('pointerdown', () => {
    cursor.classList.add('is-down');
    for (let i = 0; i < 14; i++) spawnSpark(mouse.x, mouse.y, 4);
  });
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  function spawnSpark(x, y, force = 1) {
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

    // Arrow is exact; ring lags behind and leans away from motion for a layered parallax feel
    ringPos.x = lerp(ringPos.x, mouse.x - vx * 1.5, .2);
    ringPos.y = lerp(ringPos.y, mouse.y - vy * 1.5, .2);
    const lean = clamp(vx * 1.2, -25, 25);
    arrow.style.transform = `translate(${mouse.x - 4}px, ${mouse.y - 3}px) rotate(${lean * .4}deg)`;
    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) rotate(${lean}deg) scale(${1 + clamp(speed / 120, 0, .25)})`;

    points.push({ x: mouse.x, y: mouse.y, life: 1 });
    if (speed > 2) for (let i = 0; i < Math.min(3, speed / 12); i++) spawnSpark(mouse.x + (Math.random() - .5) * 10, mouse.y + (Math.random() - .5) * 10);

    tctx.clearRect(0, 0, innerWidth, innerHeight);
    // ribbon
    for (let i = points.length - 1; i >= 0; i--) { points[i].life -= .06; if (points[i].life <= 0) points.splice(i, 1); }
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1], p1 = points[i];
      tctx.strokeStyle = `hsla(${(140 + i * 9) % 360}, 90%, 72%, ${p1.life * .7})`;
      tctx.lineWidth = p1.life * 7;
      tctx.lineCap = 'round';
      tctx.beginPath(); tctx.moveTo(p0.x, p0.y); tctx.lineTo(p1.x, p1.y); tctx.stroke();
    }
    // sparkles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += .05; s.life -= .022; s.rot += .1;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      tctx.globalAlpha = s.life; tctx.fillStyle = s.color;
      drawStar(s.x, s.y, s.size * (0.5 + s.life * .5), s.rot);
    }
    tctx.globalAlpha = 1;
  }

  /* =========================================================
     Racecourse scene
     ========================================================= */
  const SADDLE = [['#ffffff', '#333'], ['#2b2b33', '#fff'], ['#e8323c', '#fff'], ['#2f6fe0', '#fff'],
                  ['#ffd23a', '#333'], ['#2fae5c', '#fff'], ['#ff9d2e', '#fff'], ['#ff7ab0', '#fff']];
  const stallsG = $('#stalls');
  const NS = 'http://www.w3.org/2000/svg';
  let stallMarkup = '';
  for (let i = 0; i < 8; i++) {
    const x = 538 + i * 66.5;
    const [bg, fg] = SADDLE[i];
    stallMarkup += `
      <rect x="${x}" y="612" width="62" height="78" fill="#f2f6fa"/>
      <rect x="${x}" y="612" width="62" height="78" fill="url(#gateFrame)" opacity=".12"/>
      <line x1="${x + 31}" y1="616" x2="${x + 31}" y2="688" stroke="#b9c7d6" stroke-width="2"/>
      <rect x="${x + 6}" y="646" width="50" height="9" fill="#ffd23a"/>
      <circle cx="${x + 31}" cy="630" r="10" fill="${bg}" stroke="#ccd" stroke-width="1.5"/>
      <text x="${x + 31}" y="635" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="13" fill="${fg}">${i + 1}</text>
      <rect x="${x - 4}" y="606" width="6" height="88" fill="url(#gateFrame)"/>`;
  }
  stallsG.innerHTML = stallMarkup + `<rect x="1062" y="606" width="6" height="88" fill="url(#gateFrame)"/>`;

  const petals = $('.petals');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.left = `${Math.random() * 110}%`;
    p.style.animationDuration = `${9 + Math.random() * 10}s`;
    p.style.animationDelay = `${-Math.random() * 18}s`;
    p.style.transform = `scale(${.6 + Math.random() * .8})`;
    petals.appendChild(p);
  }

  const intro = $('#intro');
  const tilt = $('.tilt');
  // Each layer zooms toward the gate at its own rate; SVG layers zoom via viewBox so they stay crisp
  const GATE = { x: 800, y: 652 };
  const layers = [...document.querySelectorAll('.layer')].map(el => ({
    el, depth: +el.dataset.depth, zoom: +el.dataset.zoom, svg: el.querySelector(':scope > svg')
  }));
  const gateClose = $('.gate-close');
  const introCopy = $('.intro-copy');
  let progress = 0, smooth = 0, opened = false;

  addEventListener('scroll', () => {
    if (opened) return;
    const max = intro.offsetHeight - innerHeight;
    progress = clamp(scrollY / max);
    if (progress > .9 && !body.classList.contains('is-booting')) openGate();
  }, { passive: true });

  function sceneFrame() {
    if (body.classList.contains('is-revealed')) return;
    mouse.sx = lerp(mouse.sx, mouse.nx, .06);
    mouse.sy = lerp(mouse.sy, mouse.ny, .06);
    smooth = opened ? smooth : lerp(smooth, progress, .1);

    const z = easeInOut(map(smooth, 0, .82));
    const scale = Math.pow(10, z);

    const calm = 1 - z * .8; // parallax settles as we approach the gate
    tilt.style.transform = `perspective(1400px) rotateY(${mouse.sx * 3 * calm}deg) rotateX(${-mouse.sy * 2 * calm}deg)`;
    for (const l of layers) {
      const ls = Math.pow(scale, l.zoom);
      const shift = `translate3d(${-mouse.sx * l.depth * calm}px, ${-mouse.sy * l.depth * .6 * calm}px, 0)`;
      if (l.svg) {
        const w = 1600 / ls, h = 900 / ls;
        l.svg.setAttribute('viewBox', `${GATE.x - GATE.x / ls} ${GATE.y - GATE.y / ls} ${w} ${h}`);
        l.el.style.transform = shift;
      } else {
        l.el.style.transform = `${shift} scale(${ls})`;
      }
    }
    introCopy.style.opacity = 1 - map(smooth, 0, .12);

    if (!opened) {
      const g = map(smooth, .6, .82);
      gateClose.style.opacity = g;
      gateClose.style.transform = `scale(${1.25 - g * .25}) translate(${-mouse.sx * 8}px, ${-mouse.sy * 5}px)`;
    }
  }

  /* =========================================================
     Gate opening + gacha burst
     ========================================================= */
  const burst = $('#burst');
  const confetti = $('#confetti');
  const cctx = confetti.getContext('2d');
  let confettiBits = [], confettiOn = false;

  function startConfetti() {
    confetti.width = innerWidth * dpr; confetti.height = innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    confettiBits = Array.from({ length: reduceMotion ? 40 : 180 }, () => {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 14 + 4;
      return {
        x: innerWidth / 2, y: innerHeight / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4,
        w: Math.random() * 10 + 6, h: Math.random() * 6 + 4, rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
        color: SPARK_COLORS[(Math.random() * 4) | 0], shape: Math.random() < .25 ? 'star' : 'rect'
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
      if (c.y < innerHeight + 20) alive++;
      cctx.save(); cctx.translate(c.x, c.y); cctx.rotate(c.rot); cctx.fillStyle = c.color;
      if (c.shape === 'star') {
        cctx.beginPath();
        for (let i = 0; i < 5; i++) {
          cctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * c.w, -Math.sin((18 + i * 72) * Math.PI / 180) * c.w);
          cctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * c.w * .45, -Math.sin((54 + i * 72) * Math.PI / 180) * c.w * .45);
        }
        cctx.closePath(); cctx.fill();
      } else {
        cctx.fillRect(-c.w / 2, -c.h / 2 * Math.cos(c.rot * 2), c.w, c.h * Math.cos(c.rot * 2));
      }
      cctx.restore();
    }
    if (!alive) { confettiOn = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  function playChorus() {
    try {
      song.currentTime = CHORUS_START;
      song.volume = 0;
      const p = song.play();
      if (p) p.catch(() => {});
      const t0 = performance.now();
      const fade = now => {
        song.volume = clamp((now - t0) / 900) * .85;
        if (now - t0 < 900) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    } catch { /* audio not ready */ }
  }

  function openGate() {
    if (opened) return;
    opened = true;
    body.classList.add('is-locked');
    gateClose.style.opacity = 1;
    gateClose.style.transform = 'none';
    gateClose.classList.add('is-shake');

    setTimeout(() => {
      gateClose.classList.add('is-open');
      playChorus();
      burst.classList.add('is-on');
      startConfetti();
    }, 380);

    setTimeout(() => {
      body.classList.add('is-revealed');
      body.classList.remove('is-locked');
      scrollTo(0, 0);
      dealCards();
    }, 380 + 3050);

    setTimeout(() => burst.classList.remove('is-on'), 380 + 3500);
  }

  function resetIntro() {
    closeDetail(true);
    song.pause();
    opened = false; progress = 0; smooth = 0;
    gateClose.classList.remove('is-open', 'is-shake');
    gateClose.style.opacity = 0;
    body.classList.remove('is-revealed');
    scrollTo(0, 0);
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
     Cards
     ========================================================= */
  const grid = $('#cardGrid');

  function silhouette(hair) {
    const body = '#140a28';
    return `<svg class="silhouette" viewBox="0 0 200 400" aria-hidden="true">
      <path d="M126 236 Q196 280 172 386 Q156 318 116 262Z" fill="${hair}"/>
      <path d="M58 92 Q52 28 100 28 Q148 28 142 92 Q146 148 154 178 Q128 166 122 124 L78 124 Q72 166 46 178 Q54 148 58 92Z" fill="${hair}"/>
      <g fill="${body}" opacity=".4">
        <path d="M72 126 Q56 170 48 222 Q55 230 62 222 Q72 176 86 140Z"/>
        <path d="M128 126 Q144 170 152 222 Q145 230 138 222 Q128 176 114 140Z"/>
        <path d="M78 262 L76 386 Q86 394 95 386 L97 268Z"/><path d="M103 268 L105 386 Q114 394 124 386 L122 262Z"/>
        <rect x="90" y="100" width="20" height="24" rx="6"/>
        <path d="M70 124 Q100 112 130 124 L136 200 Q152 232 168 268 Q100 286 32 268 Q48 232 64 200Z"/>
        <ellipse cx="100" cy="80" rx="30" ry="33"/>
      </g>
      <g fill="${hair}">
        <path d="M70 60 L58 8 L96 40Z"/><path d="M130 60 L142 8 L104 40Z"/>
        <path d="M68 74 Q72 40 100 44 Q128 40 132 74 Q120 60 112 66 Q104 54 96 64 Q86 56 80 68 Q74 62 68 74Z"/>
      </g>
      <path d="M66 52 L60 20 L82 42Z M134 52 L140 20 L118 42Z" fill="rgba(255,255,255,.25)"/>
    </svg>`;
  }

  function faceMarkup(c) {
    if (c.card) return `<img src="${c.card}" alt="${c.name} trading card" loading="lazy" draggable="false">`;
    const [first, ...rest] = c.name.split(' ');
    const g1 = c.horse.g1.length;
    return `<div class="gen-card" style="--c1:${c.color};--c2:${c.color2}">
      <svg class="shoe" style="right:8%;top:30%" viewBox="0 0 40 40"><path d="M10 34 C3 24 4 10 20 6 C36 10 37 24 30 34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>
      <svg class="shoe" style="left:30%;top:58%;transform:rotate(-20deg)" viewBox="0 0 40 40"><path d="M10 34 C3 24 4 10 20 6 C36 10 37 24 30 34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>
      ${silhouette(HAIR[c.id] || '#5a3a2a')}
      <div class="frame"></div>
      <div class="vname" style="font-size:min(15cqw, ${(146 / c.name.length).toFixed(2)}cqw)">${rest.length ? first + ' ' + rest.join(' ') : first}<small>[${c.epithet}]</small></div>
      <div class="meta">Racing Career:<br>${c.horse.career.replace(/\s/g, '')}<br>G1 wins: ${g1}</div>
      <div class="soon">ART COMING SOON</div>
    </div>`;
  }

  function attachTilt(el, target = el, strength = 1) {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      target.style.setProperty('--rx', `${(.5 - y) * 18 * strength}deg`);
      target.style.setProperty('--ry', `${(x - .5) * 22 * strength}deg`);
      target.style.setProperty('--gx', `${x * 100}%`);
      target.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      target.style.setProperty('--rx', '0deg');
      target.style.setProperty('--ry', '0deg');
    });
  }

  CHARS.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'uma-card';
    b.style.setProperty('--c', c.color);
    b.setAttribute('aria-label', `View ${c.name}`);
    b.innerHTML = `<div class="face">${faceMarkup(c)}</div><div class="shine"></div><span class="tag">${c.name}</span>`;
    b.addEventListener('click', () => openDetail(i, b));
    b.addEventListener('animationend', () => { b.style.animation = 'none'; b.style.opacity = 1; });
    attachTilt(b);
    grid.appendChild(b);
  });

  function dealCards() {
    [...grid.children].forEach((card, i) => {
      card.style.animation = 'none';
      card.style.opacity = '';
      void card.offsetWidth;
      card.style.animation = '';
      card.style.animationDelay = `${.15 + i * .09}s`;
    });
  }

  /* =========================================================
     Detail view
     ========================================================= */
  const detail = $('#detail');
  const detailBg = $('.detail-bg');
  const dpCard = $('.dp-card');
  const portrait = $('.detail-portrait');
  let current = -1, sourceCard = null, flying = false;

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
    dpCard.innerHTML = faceMarkup(c) + '<div class="shine"></div>';
  }

  function restartInfoAnim() {
    detail.classList.remove('is-open');
    void detail.offsetWidth;
    detail.classList.add('is-open');
  }

  function fly(fromRect, toRect, html, duration, fromRot = 0, toRot = 0) {
    const f = document.createElement('div');
    f.className = 'fly-card';
    f.innerHTML = html;
    Object.assign(f.style, { left: '0px', top: '0px', width: `${toRect.width}px`, height: `${toRect.height}px` });
    document.body.appendChild(f);
    const sx = fromRect.width / toRect.width, sy = fromRect.height / toRect.height;
    const anim = f.animate([
      { transform: `translate(${fromRect.left}px, ${fromRect.top}px) scale(${sx}, ${sy}) rotate(${fromRot}deg)`, borderRadius: '14px' },
      { transform: `translate(${lerp(fromRect.left, toRect.left, .5)}px, ${Math.min(fromRect.top, toRect.top) - 40}px) scale(${lerp(sx, 1, .6)}, ${lerp(sy, 1, .6)}) rotate(${(fromRot + toRot) / 2 - 6}deg)`, offset: .5 },
      { transform: `translate(${toRect.left}px, ${toRect.top}px) scale(1) rotate(${toRot}deg)`, borderRadius: '22px' }
    ], { duration: reduceMotion ? 1 : duration, easing: 'cubic-bezier(.6, 0, .2, 1)', fill: 'forwards' });
    f.style.transformOrigin = '0 0';
    return anim.finished.then(() => f.remove());
  }

  function openDetail(i, card) {
    if (flying) return;
    flying = true;
    current = i; sourceCard = card;
    fillDetail(i);
    const from = card.querySelector('.face').getBoundingClientRect();
    detail.style.setProperty('--ox', `${from.left + from.width / 2}px`);
    detail.style.setProperty('--oy', `${from.top + from.height / 2}px`);
    detail.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    dpCard.style.opacity = 0;
    restartInfoAnim();
    const to = dpCard.getBoundingClientRect();
    card.style.visibility = 'hidden';
    fly(from, to, faceMarkup(CHARS[i]), 750).then(() => {
      dpCard.style.opacity = 1;
      flying = false;
      $('#backBtn').focus({ preventScroll: true });
    });
  }

  function closeDetail(instant = false) {
    if (!detail.classList.contains('is-open') || (flying && !instant)) return;
    const card = sourceCard;
    const done = () => {
      if (card) card.style.visibility = '';
      flying = false;
      if (card && !instant) card.focus({ preventScroll: true });
    };
    detail.classList.remove('is-open');
    detail.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    if (instant || !card) { done(); return; }
    flying = true;
    const from = dpCard.getBoundingClientRect();
    dpCard.style.opacity = 0;
    const to = card.querySelector('.face').getBoundingClientRect();
    fly(from, to, faceMarkup(CHARS[current]), 600).then(done);
  }

  function step(dir) {
    if (flying) return;
    const n = (current + dir + CHARS.length) % CHARS.length;
    if (sourceCard) sourceCard.style.visibility = '';
    sourceCard = grid.children[n];
    sourceCard.style.visibility = 'hidden';
    current = n;
    fillDetail(n);
    restartInfoAnim();
    dpCard.animate([
      { transform: `rotateY(${dir * -90}deg) scale(.9)`, opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: reduceMotion ? 1 : 450, easing: 'cubic-bezier(.25, 1.3, .5, 1)' });
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
  attachTilt(portrait, dpCard, .8);

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

  const loadStart = firstVisit && !reduceMotion ? 2500 : 300;
  const loadDur = firstVisit && !reduceMotion ? 1800 : 700;
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
    confettiFrame();
    requestAnimationFrame(loop);
  })();
})();
