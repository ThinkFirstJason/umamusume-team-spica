// Builds the Tokyo Racecourse scene once at load. Everything is drawn in a
// 1600x900 space with a single vanishing point off to the right, so the
// grandstand recedes at an angle like the anime establishing shot.
(() => {
  'use strict';

  const VP = { x: 1720, y: 395 };          // vanishing point (horizon at y=395)
  const STAND_X = -60;                      // grandstand facade plane
  const ROOF_X = 170;                       // roof edge overhangs toward the track
  const D_FAR = 4.4;                        // depth where the grandstand ends
  const RAIL_NEAR = { x: 330, y: 900 };     // outer rail where it meets the bottom edge

  const f = n => n.toFixed(1);
  const P = (X, Y, d) => [VP.x + (X - VP.x) / d, VP.y + (Y - VP.y) / d];
  const towardVP = ([x, y], d) => [VP.x + (x - VP.x) / d, VP.y + (y - VP.y) / d];
  const path = (pts, attrs = '') => `<path d="M${pts.map(p => `${f(p[0])} ${f(p[1])}`).join(' L')}Z" ${attrs}/>`;
  const line = (a, b, attrs) => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" ${attrs}/>`;
  const band = (X, Ya, Yb, d0, d1, attrs) => path([P(X, Ya, d0), P(X, Ya, d1), P(X, Yb, d1), P(X, Yb, d0)], attrs);
  const depths = (from, to, step) => { const out = []; for (let d = from; d <= to + 1e-6; d += step) out.push(d); return out; };

  /* ---------------- Sky ---------------- */
  const sky = `
    <defs>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1f6fd6"/><stop offset=".45" stop-color="#4f9fea"/>
        <stop offset=".8" stop-color="#a9d6f6"/><stop offset="1" stop-color="#e3f3fb"/>
      </linearGradient>
      <radialGradient id="sunG" cx=".86" cy=".12" r=".55">
        <stop offset="0" stop-color="#fffbe8" stop-opacity=".9"/><stop offset=".3" stop-color="#fff6d0" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#skyG)"/>
    <rect width="1600" height="900" fill="url(#sunG)"/>`;

  /* ---------------- Clouds (anime cumulus) ---------------- */
  function cloud(cx, cy, s, flip = 1) {
    const puffs = [[0, 0, 60], [55, -25, 52], [110, -5, 58], [160, 10, 40], [-55, 12, 42], [30, 30, 50], [95, 32, 46]];
    const base = `M${f(cx - 100 * s)} ${f(cy + 40 * s)} Q${f(cx + 40 * s * flip)} ${f(cy + 70 * s)} ${f(cx + 210 * s)} ${f(cy + 40 * s)} Z`;
    return `<g>
      ${puffs.map(([x, y, r]) => `<circle cx="${f(cx + x * s * flip)}" cy="${f(cy + y * s + 8 * s)}" r="${f(r * s)}" fill="#c4d6f2"/>`).join('')}
      ${puffs.map(([x, y, r]) => `<circle cx="${f(cx + x * s * flip - 6 * s)}" cy="${f(cy + y * s - 4 * s)}" r="${f(r * s * .92)}" fill="#fff"/>`).join('')}
      <path d="${base}" fill="#d7e3f6"/>
    </g>`;
  }
  const clouds = cloud(1150, 150, 1.25) + cloud(1450, 260, .8, -1) + cloud(920, 300, .55) + cloud(1380, 70, .6) + cloud(1300, 340, .45, -1);

  /* ---------------- Far horizon ---------------- */
  let far = `
    <path d="M1300 395 L1395 318 Q1405 310 1415 318 L1520 395Z" fill="#b9cdea"/>
    <path d="M1378 332 L1395 318 Q1405 310 1415 318 L1432 332 L1420 329 L1410 337 L1400 328 L1390 336Z" fill="#f4f8ff"/>
    <path d="M1180 398 Q1210 372 1240 386 Q1265 364 1300 382 Q1330 366 1360 384 Q1395 366 1430 386 Q1470 368 1505 388 Q1545 370 1580 388 Q1600 380 1620 386 L1620 402 L1180 402Z" fill="#5fa86a"/>
    <path d="M1180 400 Q1300 392 1620 396 L1620 404 L1180 404Z" fill="#4d9558"/>
    <g fill="#e9eef8"><rect x="1468" y="300" width="10" height="96"/><rect x="1440" y="286" width="66" height="34" rx="3"/></g>
    <rect x="1444" y="290" width="58" height="26" fill="#2f8f5a"/>
    <g fill="#d4dbec"><rect x="1220" y="372" width="40" height="22"/><rect x="1530" y="366" width="34" height="28"/><rect x="1566" y="374" width="30" height="20"/></g>`;

  /* ---------------- Ground: plaza + turf + rail + gate ---------------- */
  const railAt = d => towardVP([RAIL_NEAR.x, RAIL_NEAR.y], d);
  let ground = `
    <defs>
      <linearGradient id="plazaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cfc4"/><stop offset="1" stop-color="#efe2cf"/></linearGradient>
      <linearGradient id="turfG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bd65a"/><stop offset=".5" stop-color="#55b947"/><stop offset="1" stop-color="#2f9a3e"/></linearGradient>
      <linearGradient id="gateG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7488"/><stop offset="1" stop-color="#2e3442"/></linearGradient>
      <linearGradient id="stallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4256"/><stop offset="1" stop-color="#1f2533"/></linearGradient>
      <pattern id="stallMesh" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M4.5 0 V5 M0 4.5 H5" stroke="#c9d0e0" stroke-width="1"/></pattern>
    </defs>
    <rect y="395" width="1600" height="505" fill="url(#plazaG)"/>`;
  // paving: lines fanning to the VP plus depth bands
  for (let x = -2200; x <= 700; x += 150) ground += line([x, 900], [VP.x, VP.y], 'stroke="#c9b9a6" stroke-width="1.4" opacity=".55"');
  for (const d of depths(1.1, 8, .45)) {
    const y = VP.y + 505 / d;
    ground += line([-50, y], [railAt(d)[0], y], `stroke="#c9b9a6" stroke-width="${f(2.2 / d + .4)}" opacity=".5"`);
  }
  ground += `<g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3">
      <ellipse cx="60" cy="990" rx="420" ry="170"/><ellipse cx="60" cy="990" rx="300" ry="120"/></g>`;
  // turf wedge with mowing stripes
  ground += path([[RAIL_NEAR.x, 900], [VP.x, VP.y], [1700, VP.y], [1700, 900]], 'fill="url(#turfG)"');
  [[500, 700], [900, 1100], [1300, 1500], [1700, 1900]].forEach(([a, b]) =>
    ground += path([[a, 900], [VP.x, VP.y], [b, 900]], 'fill="#fff" opacity=".07"'));
  // outer rail: top bar is a straight line to the VP, posts placed in depth
  ground += path([[RAIL_NEAR.x - 8, 900], [VP.x, VP.y], [RAIL_NEAR.x + 18, 900]], 'fill="#3f8f3c" opacity=".35"');
  ground += line([RAIL_NEAR.x, 900 - 44], [VP.x, VP.y], 'stroke="#fff" stroke-width="8" stroke-linecap="round"');
  for (const d of depths(1, 12, .32)) {
    const g = railAt(d);
    ground += line(g, [g[0], g[1] - 44 / d], `stroke="#fff" stroke-width="${f(Math.max(1.2, 6 / d))}"`);
  }

  // starting gate: frontal face across the track, receding slightly toward the VP
  const SADDLE = [['#ffffff', '#333'], ['#2b2b33', '#fff'], ['#e8323c', '#fff'], ['#2f6fe0', '#fff'],
                  ['#ffd23a', '#333'], ['#2fae5c', '#fff'], ['#ff9d2e', '#fff'], ['#ff7ab0', '#fff']];
  const G = { x0: 1140, x1: 1450, yt: 548, yb: 650 };
  const back = p => [VP.x + (p[0] - VP.x) * .93, VP.y + (p[1] - VP.y) * .93];
  let gate = `<g id="gate">`;
  gate += path([[G.x0 - 10, G.yb + 6], [G.x1 + 30, G.yb + 6], back([G.x1 + 30, G.yb + 6]), back([G.x0 - 10, G.yb + 6])], 'fill="#1d5e2c" opacity=".35"');
  gate += path([[G.x0, G.yt], [G.x1, G.yt], back([G.x1, G.yt]), back([G.x0, G.yt])], 'fill="#8e97ab"');
  gate += path([[G.x1, G.yt], back([G.x1, G.yt]), back([G.x1, G.yb]), [G.x1, G.yb]], 'fill="#262c3a"');
  gate += `<rect x="${G.x0}" y="${G.yt}" width="${G.x1 - G.x0}" height="18" fill="url(#gateG)"/>
    <text x="${(G.x0 + G.x1) / 2}" y="${G.yt + 13}" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="10" fill="#e8ecf5" letter-spacing="3">TOKYO RACECOURSE</text>`;
  const sw = (G.x1 - G.x0) / 8;
  SADDLE.forEach(([bg, fg], i) => {
    const x = G.x0 + i * sw;
    const y0 = G.yt + 22, y1 = G.yb - 8, mx = x + sw / 2;
    gate += `<rect x="${f(x + 3)}" y="${y0}" width="${f(sw - 6)}" height="${y1 - y0}" fill="url(#stallG)"/>
      <rect x="${f(x + 3)}" y="${y0}" width="${f(sw - 6)}" height="${y1 - y0}" fill="url(#stallMesh)" opacity=".75"/>
      <g fill="none" stroke="#e4e8f2" stroke-linecap="round">
        <path d="M${f(x + 4)} ${y0 + 28} Q${f(mx)} ${y0 + 14} ${f(x + sw - 4)} ${y0 + 28}" stroke-width="2.2"/>
        <path d="M${f(x + 4)} ${y1 - 18} Q${f(mx)} ${y1 - 32} ${f(x + sw - 4)} ${y1 - 18}" stroke-width="2.2"/>
        <path d="M${f(mx)} ${y0 + 30} C${f(mx - 9)} ${y0 + 34} ${f(mx - 8)} ${y0 + 46} ${f(mx)} ${y0 + 44} M${f(mx)} ${y0 + 30} C${f(mx + 9)} ${y0 + 34} ${f(mx + 8)} ${y0 + 46} ${f(mx)} ${y0 + 44}" stroke-width="1.6"/>
        <line x1="${f(mx)}" y1="${y0}" x2="${f(mx)}" y2="${y1}" stroke-width="1.4" opacity=".8"/>
      </g>
      <rect x="${f(x + 3)}" y="${y0}" width="${f(sw - 6)}" height="${y1 - y0}" fill="none" stroke="#dfe4ee" stroke-width="2"/>
      <circle cx="${f(mx)}" cy="${y1 + 1}" r="6" fill="${bg}" stroke="#c9d0dc" stroke-width="1.2"/>
      <text x="${f(mx)}" y="${y1 + 4.5}" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="8" fill="${fg}">${i + 1}</text>
      <rect x="${f(x - 2)}" y="${G.yt + 16}" width="5" height="${G.yb - G.yt - 16}" fill="url(#gateG)"/>`;
  });
  gate += `<rect x="${G.x1 - 3}" y="${G.yt + 16}" width="5" height="${G.yb - G.yt - 16}" fill="url(#gateG)"/>
    <rect x="${G.x0 - 4}" y="${G.yb - 2}" width="${G.x1 - G.x0 + 8}" height="7" rx="3" fill="#262c3a"/>
    <circle cx="${G.x0 + 14}" cy="${G.yb + 1}" r="7" fill="#2b2b33"/><circle cx="${G.x1 - 14}" cy="${G.yb + 1}" r="7" fill="#2b2b33"/></g>`;
  ground += gate;

  /* ---------------- Grandstand ---------------- */
  const X = STAND_X;
  let stand = `
    <defs>
      <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6dcf7"/><stop offset=".45" stop-color="#5b9ad8"/><stop offset="1" stop-color="#2d4c94"/></linearGradient>
      <linearGradient id="underG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d3f7e"/><stop offset="1" stop-color="#6c70b4"/></linearGradient>
      <linearGradient id="seatG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c86c8"/><stop offset="1" stop-color="#b3bce8"/></linearGradient>
      <linearGradient id="roofEdgeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9cfe8"/></linearGradient>
    </defs>`;
  // roof underside spans from the facade top to the overhanging roof edge
  stand += path([P(X, -60, .8), P(X, -60, D_FAR + .25), P(ROOF_X, -190, D_FAR + .25), P(ROOF_X, -190, .8)], 'fill="url(#underG)"');
  for (const d of depths(.8, D_FAR + .25, .18)) stand += line(P(X, -60, d), P(ROOF_X, -190, d), `stroke="#8d92d0" stroke-width="${f(3 / d + .5)}" opacity=".8"`);
  for (let k = 1; k < 4; k++) {
    const t = k / 4;
    stand += line(P(X + (ROOF_X - X) * t, -60 - 130 * t, .8), P(X + (ROOF_X - X) * t, -60 - 130 * t, D_FAR + .25), 'stroke="#9ea3dc" stroke-width="2" opacity=".6"');
  }
  // roof edge band + top lip
  stand += band(ROOF_X, -190, -232, .8, D_FAR + .25, 'fill="url(#roofEdgeG)"');
  stand += band(ROOF_X, -232, -246, .8, D_FAR + .25, 'fill="#e3e7f7"');
  stand += path([P(ROOF_X, -190, D_FAR + .25), P(ROOF_X, -246, D_FAR + .25), P(X, -120, D_FAR + .25), P(X, -60, D_FAR + .25)], 'fill="#b8bee0"');

  const tiers = [
    [-60, 40, 'glass'], [40, 72, 'slab'], [72, 212, 'seat'], [212, 246, 'slab'],
    [246, 330, 'glass'], [330, 360, 'slab'], [360, 520, 'seat'], [520, 560, 'wall'], [560, 640, 'concourse']
  ];
  const fills = { glass: 'url(#glassG)', slab: '#f3f4fb', seat: 'url(#seatG)', wall: '#e9ebf7', concourse: '#3a3f72' };
  for (const [a, b, kind] of tiers) {
    stand += band(X, a, b, .8, D_FAR, `fill="${fills[kind]}"`);
    if (kind === 'slab' || kind === 'wall') stand += band(X, b - 6, b, .8, D_FAR, 'fill="#c3c7e4"');
    if (kind === 'seat') {
      for (let y = a + 8; y < b - 4; y += 7) stand += line(P(X, y, .8), P(X, y, D_FAR), `stroke="#58609f" stroke-width="1.4" opacity=".55"`);
      stand += band(X, b - 12, b, .8, D_FAR, 'fill="#f6f7fd"');
      stand += band(X, a, a + 14, .8, D_FAR, 'fill="#2f3170" opacity=".45"'); // overhang shadow
    }
    if (kind === 'glass') {
      for (const d of depths(1, D_FAR, .55)) {
        stand += path([P(X, a + 6, d), P(X, a + 6, d + .12), P(X, b - 4, d + .3), P(X, b - 4, d + .18)], 'fill="#fff" opacity=".18"');
      }
    }
  }
  // columns / aisles in perspective
  for (const d of depths(.8, D_FAR, .2)) {
    const w = .022;
    stand += band(X, -60, 40, d, d + w, 'fill="#e8ebfa"');
    stand += band(X, 246, 330, d, d + w, 'fill="#e8ebfa"');
    stand += band(X, 72, 212, d, d + w * .8, 'fill="#c6c9f0" opacity=".8"');
    stand += band(X, 360, 520, d, d + w * .8, 'fill="#c6c9f0" opacity=".8"');
    stand += band(X, 560, 640, d, d + w * 1.4, 'fill="#e6e8f6"');
  }
  // far end cap + low annex building
  stand += path([P(X, -60, D_FAR), P(X, 640, D_FAR), P(X - 220, 640, D_FAR + .35), P(X - 220, -60, D_FAR + .35)], 'fill="#cfd3ee"');
  stand += band(X - 40, 420, 640, D_FAR + .35, D_FAR + 2.2, 'fill="#f0f1fa"');
  stand += band(X - 40, 420, 450, D_FAR + .35, D_FAR + 2.2, 'fill="#b9bee0"');
  stand += band(X - 40, 470, 600, D_FAR + .35, D_FAR + 2.2, 'fill="#6e86c8"');
  // facade base shadow on the plaza
  stand += path([P(X, 640, .8), P(X, 640, D_FAR), P(X + 140, 640, D_FAR), P(X + 140, 640, .8)], 'fill="#6a6496" opacity=".22"');

  /* ---------------- Foreground: canopy + lamps ---------------- */
  let fg = `
    <defs>
      <linearGradient id="canopyG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c7c9e8"/><stop offset="1" stop-color="#8e92c6"/></linearGradient>
    </defs>`;
  const qp = (a, c, b, t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const outer = [[-80, 520], [200, 470], [380, 700]], inner = [[-80, 640], [150, 590], [310, 735]];
  fg += path([[-90, 900], [-90, 650], [330, 760], [330, 900]], 'fill="#5b5690" opacity=".16"');
  fg += `<rect x="290" y="722" width="14" height="178" fill="#e7e8f6"/><rect x="300" y="722" width="4" height="178" fill="#b9bce0"/>
    <rect x="120" y="610" width="14" height="290" fill="#e7e8f6"/><rect x="130" y="610" width="4" height="290" fill="#b9bce0"/>`;
  const up = [], lo = [];
  for (let i = 0; i <= 20; i++) { up.push(qp(...outer, i / 20)); lo.push(qp(...inner, i / 20)); }
  fg += path([...up, ...lo.reverse()], 'fill="url(#canopyG)"');
  lo.reverse();
  for (let i = 0; i <= 20; i += 2) fg += line(up[i], lo[i], 'stroke="#eef0fb" stroke-width="3"');
  fg += `<path d="M${outer[0].join(' ')} Q${outer[1].join(' ')} ${outer[2].join(' ')}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
    <path d="M${outer[0][0]} ${outer[0][1] + 9} Q${outer[1][0]} ${outer[1][1] + 9} ${outer[2][0] - 4} ${outer[2][1] + 6}" fill="none" stroke="#c4c8e6" stroke-width="4"/>`;
  for (const d of [1.05, 1.55, 2.3, 3.4, 5]) {
    const g = towardVP([60, 900], d), h = 250 / d;
    fg += `<rect x="${f(g[0] - 3 / d)}" y="${f(g[1] - h)}" width="${f(Math.max(1.5, 6 / d))}" height="${f(h)}" fill="#4b4f78"/>
      <rect x="${f(g[0] - 16 / d)}" y="${f(g[1] - h - 8 / d)}" width="${f(32 / d)}" height="${f(9 / d)}" rx="${f(3 / d)}" fill="#4b4f78"/>
      <rect x="${f(g[0] - 13 / d)}" y="${f(g[1] - h + 1 / d)}" width="${f(26 / d)}" height="${f(3 / d)}" fill="#fff6c8"/>`;
  }

  /* ---------------- Gacha gate door mesh ---------------- */
  let mesh = `<clipPath id="meshTop"><path d="M14 14 H292 V178 Q200 176 130 204 Q60 236 14 290Z"/></clipPath>
    <clipPath id="meshBot"><path d="M14 586 V424 Q120 334 292 318 V586Z"/></clipPath>`;
  let grid = '';
  for (let x = 14; x <= 292; x += 23) grid += `<line x1="${x}" y1="0" x2="${x}" y2="600"/>`;
  for (let y = 14; y <= 590; y += 23) grid += `<line x1="0" y1="${y}" x2="300" y2="${y}"/>`;
  mesh += `<g stroke-width="4" clip-path="url(#meshTop)">${grid}</g><g stroke-width="4" clip-path="url(#meshBot)">${grid}</g>`;

  const set = (id, markup) => { const el = document.getElementById(id); if (el) el.innerHTML = markup; };
  set('L-sky', sky);
  set('L-clouds', clouds);
  set('L-far', far);
  set('L-ground', ground);
  set('L-stand', stand);
  set('L-fg', fg);
  set('doorMesh', mesh);
})();
