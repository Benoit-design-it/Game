// Make No Promises — prototype 1.
// Logique : état, rendu SVG du poids, cycle des demandes, mécanique « rester et écouter ».
(() => {
  'use strict';

  const C = window.MNP_CONTENT;
  const SAVE_KEY = 'mnp.save.v1';
  const META_KEY = 'mnp.meta.v1';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const params = new URLSearchParams(location.search);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- stockage

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ } },
    del(key) { try { localStorage.removeItem(key); } catch { /* idem */ } },
  };
  if (params.has('reset')) { store.del(SAVE_KEY); store.del(META_KEY); }

  function newState() {
    return {
      turn: 0,
      weight: C.inheritedWeight, // poids hérité : on ne part jamais de zéro
      promiseCount: 0,           // réponses prises dans le menu (les cinq types)
      listenCount: 0,            // « rester et écouter » menés jusqu'au bout
      avoidCount: 0,             // v2 : silence, fuite, regard détourné
      avoidMarks: [],            // v2 : { kind: 'silence' | 'fuite' | 'deni' }
      branches: [],              // { type, seed, visitor }
      suspended: 0,              // branches « j'y réfléchis », jamais refermées
      owedYes: false,            // « refuser mais promettre la suivante » en attente
      familyIndex: 0,
      history: [],               // { visitor, choice }
      recurring: { appearances: 0, recognition: 0, released: false },
    };
  }

  let state = newState();
  let meta = store.get(META_KEY) || { runs: [] };
  const save = () => store.set(SAVE_KEY, state);

  // ---------------------------------------------------------------- utilitaires

  const $ = (sel) => document.querySelector(sel);
  const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
  const wait = (ms) => new Promise((res) => setTimeout(res, reducedMotion ? 0 : ms));

  function svg(tag, attrs = {}, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function rng(seed) {
    let a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function tween(ms, fn) {
    return new Promise((res) => {
      if (reducedMotion) { fn(1); res(); return; }
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        fn(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  // ---------------------------------------------------------------- formes

  // Contour du protagoniste (origine : centre de la tête). La silhouette récurrente
  // finit par porter exactement ce contour, en miroir.
  const SELF = {
    head: { rx: 23, ry: 28, rot: -9 },
    body: 'M -12 24 C -26 30 -52 30 -62 50 C -72 72 -70 110 -68 142 L 68 142 C 70 112 72 84 64 64 C 56 46 30 38 12 25 Z',
    arm: 'M -56 52 C -68 66 -76 78 -80 88',
    robe: 'M -68 142 C -70 190 -76 250 -80 290 L 80 290 C 76 250 70 190 68 142 Z',
  };
  const PROTAG = { x: 748, y: 268 };
  const HAND = { x: PROTAG.x - 80, y: PROTAG.y + 88 }; // là où le fil est noué
  const FEET_Y = 540;
  const HEAD_H = 290;
  const VISITOR_X = 300;

  function drawSelf(parent, attrs) {
    const g = svg('g', attrs, parent);
    svg('ellipse', { cx: 0, cy: 0, rx: SELF.head.rx, ry: SELF.head.ry, transform: `rotate(${SELF.head.rot})` }, g);
    svg('path', { d: SELF.body }, g);
    return g;
  }

  function drawArm(parent, d, width = 15) {
    return svg('path', { d, fill: 'none', 'stroke-width': width, 'stroke-linecap': 'round' }, parent);
  }

  // Silhouette générique, informe, pieds à l'origine.
  function genShape(seed) {
    const r = rng(seed);
    const H = 272 + r() * 40;
    const lean = (r() - 0.5) * 22;
    const hr = 20 + r() * 8;
    const hry = hr * (1.08 + r() * 0.18);
    const tilt = (r() - 0.5) * 18;
    const sh = 46 + r() * 24;
    const neckY = -H + hry - 2;
    const shY = neckY + 20 + r() * 12;
    const waist = 36 + r() * 26;
    const hem = 54 + r() * 44;
    const d = [
      `M ${lean - 9} ${neckY}`,
      `C ${lean - sh * 0.55} ${shY - 6} ${lean - sh} ${shY} ${lean - sh + 2} ${shY + 26}`,
      `C ${-waist - 6} ${shY + 90} ${-waist} -90 ${-hem} 0`,
      `L ${hem} 0`,
      `C ${waist} -90 ${waist + 6} ${shY + 90} ${lean + sh - 2} ${shY + 26}`,
      `C ${lean + sh} ${shY} ${lean + sh * 0.55} ${shY - 6} ${lean + 9} ${neckY}`,
      'Z',
    ].join(' ');
    return { head: { cx: lean, cy: -H, rx: hr, ry: hry, rot: tilt }, d, shoulder: { x: lean + sh - 6, y: shY + 20 } };
  }

  // ---------------------------------------------------------------- scène statique

  const el = {
    scene: $('#scene'),
    branches: $('#branches'),
    cracksBack: $('#cracks-back'),
    cracksFront: $('#cracks-front'),
    chains: $('#chains'),
    runMarks: $('#run-marks'),
    avoidMarks: $('#avoid-marks'),
    thread: $('#thread'),
    knot: $('#knot'),
    visitor: $('#visitor'),
    visitorBody: $('#visitor-body'),
    visitorFeatures: $('#visitor-features'),
    disp: $('#f-visitor-disp'),
    blur: $('#f-visitor-blur'),
    vignette: $('#vignette'),
    presence: $('#presence'),
    lines: $('#lines'),
    choices: $('#choices'),
    cont: $('#continue'),
    panel: $('#panel'),
    title: $('#title-screen'),
    ending: $('#ending-screen'),
    debug: $('#debug'),
  };

  // Protagoniste
  const protagShape = drawSelf($('#protagonist-shape'), { fill: '#0b0b0f', stroke: '#4a4550', 'stroke-width': 1, 'stroke-opacity': 0.5 });
  const protagArmG = svg('g', { transform: `translate(${PROTAG.x} ${PROTAG.y})` }, $('#protagonist-arm'));
  drawArm(protagArmG, SELF.arm).setAttribute('stroke', '#0b0b0f');
  void protagShape;

  // Fissures : chacune apparaît à partir d'un seuil de poids.
  const CRACKS = [
    ['back', 'M 760 96 L 755 124 L 764 150 L 757 176 L 762 200', 0],
    ['front', 'M 640 506 L 610 522 L 578 520 L 540 544', 1],
    ['back', 'M 696 200 L 712 214 L 706 236 L 718 252', 3],
    ['front', 'M 880 506 L 912 528 L 952 536', 5],
    ['back', 'M 826 176 L 810 196 L 818 216 L 806 238', 6],
    ['front', 'M 680 440 L 692 458 L 684 476 L 694 498', 8],
    ['back', 'M 760 122 L 774 140 L 770 162 L 786 182 L 780 206', 9],
    ['front', 'M 700 528 L 680 556 L 642 570 L 600 598', 11],
    ['front', 'M 840 440 L 830 462 L 842 480 L 834 498', 13],
    ['back', 'M 730 152 L 740 172 L 734 196 L 744 214', 14],
    ['front', 'M 820 528 L 850 562 L 846 600', 16],
    ['front', 'M 540 544 L 480 550 L 430 568 L 370 566', 19],
    ['front', 'M 600 598 L 540 612 L 460 606', 22],
    ['front', 'M 670 406 L 700 414 L 730 408', 25],
    ['front', 'M 370 566 L 300 580 L 220 574 L 120 590', 28],
  ].map(([layer, d, th]) => {
    const parent = layer === 'back' ? el.cracksBack : el.cracksFront;
    const node = svg('path', { d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, parent);
    return { node, th };
  });

  // Chaînes : chacune se tend à partir d'un seuil de poids.
  const CHAINS = [
    { a: [661, 420], c: [592, 525], b: [548, 568], th: 0 },
    { a: [859, 420], c: [928, 525], b: [972, 568], th: 4 },
    { a: [693, 236], c: [618, 330], b: [596, 520], th: 10 },
    { a: [827, 236], c: [902, 330], b: [924, 520], th: 16 },
    { a: [760, 470], c: [728, 560], b: [690, 614], th: 23 },
  ].map(({ a, b, c, th }) => {
    const g = svg('g', { opacity: 0 }, el.chains);
    const q = (t) => [
      (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
      (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
    ];
    const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 10);
    for (let i = 0; i <= n; i++) {
      const [x, y] = q(i / n);
      const [x2, y2] = q(Math.min(1, (i + 1) / n));
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      svg('ellipse', { cx: x, cy: y, rx: i % 2 ? 6.5 : 3, ry: 3.4, transform: `rotate(${ang} ${x} ${y})` }, g);
    }
    return { node: g, th };
  });

  // ---------------------------------------------------------------- branches

  const BRANCH_STYLE = {
    promise:  { stroke: '#caa55a', width: 1.2, opacity: 0.6 },
    think:    { stroke: '#8d8da0', width: 1.1, opacity: 0.5, dash: '2 7' },
    delegate: { stroke: '#7f95b8', width: 1.1, opacity: 0.55 },
    refuse:   { stroke: '#8a4a42', width: 1.3, opacity: 0.55 },
    future:   { stroke: '#d9ccb0', width: 1, opacity: 0.45, dash: '1 5' },
    broken:   { stroke: '#4a434f', width: 1.6, opacity: 0.8 },
  };

  function drawBranch(b, animate) {
    const r = rng(b.seed);
    const st = BRANCH_STYLE[b.type];
    const g = svg('g', {}, el.branches);
    const sx = 715 + r() * 90, sy = 150 + r() * 50;
    const ex = 30 + r() * 940, ey = 18 + r() * 260;
    const c1 = [sx + (r() - 0.5) * 140, sy - 60 - r() * 80];
    const c2 = [ex + (r() - 0.5) * 160, ey + 40 + r() * 80];
    const bez = (t) => [0, 1].map((k) =>
      (1 - t) ** 3 * [sx, sy][k] + 3 * (1 - t) ** 2 * t * c1[k] + 3 * (1 - t) * t * t * c2[k] + t ** 3 * [ex, ey][k]);

    let d;
    if (b.type === 'refuse') {
      // Réalité figée : trajet anguleux, rigide.
      d = `M ${sx} ${sy}`;
      for (let i = 1; i <= 4; i++) {
        const [x, y] = bez(i / 4);
        d += ` L ${x + (i < 4 ? (r() - 0.5) * 40 : 0)} ${y + (i < 4 ? (r() - 0.5) * 30 : 0)}`;
      }
    } else if (b.type === 'broken') {
      const [mx, my] = bez(0.5), [nx, ny] = bez(0.56);
      d = `M ${sx} ${sy} L ${mx} ${my} M ${nx + 6} ${ny - 4} L ${ex} ${ey}`;
    } else {
      d = `M ${sx} ${sy} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${ex} ${ey}`;
    }

    const path = svg('path', {
      d, stroke: st.stroke, 'stroke-width': st.width, 'stroke-linecap': 'round', opacity: st.opacity,
    }, g);
    if (st.dash) path.setAttribute('stroke-dasharray', st.dash);

    if (b.type === 'delegate') {
      const [nx, ny] = bez(0.45); // le proche qui porte la promesse à ta place
      svg('circle', { cx: nx, cy: ny, r: 3.2, fill: st.stroke }, g);
    }
    if (b.type === 'promise' || b.type === 'delegate') {
      svg('circle', { cx: ex, cy: ey, r: 2.4, fill: st.stroke, filter: 'url(#f-glow)' }, g);
    } else if (b.type === 'think' || b.type === 'future') {
      svg('circle', { cx: ex, cy: ey, r: 3, fill: 'none', stroke: st.stroke, 'stroke-width': 1 }, g);
    } else if (b.type === 'refuse') {
      svg('path', { d: `M ${ex - 3} ${ey - 3} L ${ex + 3} ${ey + 3} M ${ex + 3} ${ey - 3} L ${ex - 3} ${ey + 3}`, stroke: st.stroke, 'stroke-width': 1.3 }, g);
    }

    if (animate && !reducedMotion) {
      if (st.dash) {
        g.style.opacity = 0;
        requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transition = 'opacity 3s'; g.style.opacity = 1; }));
      } else {
        path.setAttribute('pathLength', 1);
        path.style.strokeDasharray = 1;
        path.style.strokeDashoffset = 1;
        g.querySelectorAll('circle').forEach((c) => { c.style.opacity = 0; });
        requestAnimationFrame(() => requestAnimationFrame(() => {
          path.style.strokeDashoffset = 0;
          g.querySelectorAll('circle').forEach((c) => { c.style.transitionDelay = '2.6s'; c.style.opacity = 1; });
        }));
      }
    }
  }

  function addBranch(type, visitor) {
    const b = { type, visitor, seed: hash(`${visitor}:${type}:${state.branches.length}:${meta.runs.length}`) };
    state.branches.push(b);
    drawBranch(b, true);
  }

  // ---------------------------------------------------------------- rendu du poids

  function render() {
    const w = state.weight;
    for (const c of CRACKS) c.node.style.strokeDashoffset = 1 - clamp((w - c.th) / 4);
    for (const ch of CHAINS) ch.node.style.opacity = w >= ch.th ? 1 : 0;
    el.vignette.style.opacity = (0.42 + clamp(w / 30) * 0.5).toFixed(3);
    renderAvoidMarks();
    renderDebug();
  }

  // Marques des parties précédentes, gravées sur la marche.
  function renderRunMarks() {
    el.runMarks.replaceChildren();
    meta.runs.slice(-16).forEach((run, i) => {
      const x = 644 + i * 15, y = 507;
      if (run.ending === 'free') {
        svg('line', { x1: x, y1: y - 4, x2: x, y2: y + 4, stroke: '#cfc4a8', 'stroke-width': 1, opacity: 0.6 }, el.runMarks);
      } else if (run.ending === 'void') {
        svg('circle', { cx: x, cy: y, r: 4, fill: 'none', stroke: '#55555c', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, el.runMarks);
      } else {
        svg('rect', { x: x - 3, y: y - 4, width: 6, height: 8, fill: '#5a2f2b' }, el.runMarks);
      }
    });
  }

  // Marques d'évitement (v2) : ternes, creuses, différentes des promesses.
  function renderAvoidMarks() {
    el.avoidMarks.replaceChildren();
    state.avoidMarks.forEach((m, i) => {
      const r = rng(`avoid:${i}`);
      svg('circle', {
        cx: 640 + r() * 240, cy: 525 + r() * 60, r: 6 + r() * 5,
        fill: 'none', stroke: '#4d4d52', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.7,
      }, el.avoidMarks);
    });
  }

  function renderDebug() {
    if (!params.has('debug')) return;
    el.debug.hidden = false;
    const s = state;
    el.debug.textContent = [
      `tour         ${s.turn + 1}/${C.visitors.length}`,
      `poids        ${s.weight.toFixed(2)}`,
      `promesses    ${s.promiseCount}`,
      `écoutes      ${s.listenCount}`,
      `en suspens   ${s.suspended}`,
      `oui dû       ${s.owedYes}`,
      `branches     ${s.branches.length}`,
      `récurrente   app=${s.recurring.appearances} reco=${s.recurring.recognition.toFixed(2)}`,
      `parties      ${meta.runs.map((r) => r.ending).join(', ') || '—'}`,
    ].join('\n');
  }

  // ---------------------------------------------------------------- silhouette

  const vis = { x: -140, o: 0, attached: false };

  function threadPath() {
    const hx = HAND.x, hy = HAND.y;
    if (vis.attached) {
      const vx = vis.x + 80, vy = FEET_Y - HEAD_H + 88;
      const mx = (hx + vx) / 2;
      return `M ${hx} ${hy} C ${hx - 20} ${hy + 150} ${mx + 70} 578 ${mx} 578 S ${vx + 12} ${vy + 150} ${vx} ${vy}`;
    }
    return `M ${hx} ${hy} C ${hx - 20} ${hy + 150} 560 548 480 552 S 120 546 -40 548`;
  }

  function applyVisitor() {
    el.visitor.setAttribute('transform', `translate(${vis.x} ${FEET_Y})`);
    el.visitor.setAttribute('opacity', vis.o.toFixed(3));
    el.thread.setAttribute('d', threadPath());
  }

  function setFilter(disp, blur) {
    el.disp.setAttribute('scale', disp.toFixed(2));
    el.blur.setAttribute('stdDeviation', blur.toFixed(2));
  }

  function buildVisitor(v) {
    el.visitorBody.replaceChildren();
    el.visitorFeatures.replaceChildren();
    const fill = '#1d1d26', rim = '#8e8a98';

    if (v.recurring) {
      // La silhouette récurrente : une forme informe qui glisse vers le contour du protagoniste.
      const rec = state.recurring.recognition;
      const blob = genShape('fil');
      const bg = svg('g', { fill, stroke: rim, 'stroke-width': 1.2, 'stroke-opacity': 0.25, opacity: 1 - rec }, el.visitorBody);
      svg('ellipse', { cx: blob.head.cx, cy: blob.head.cy, rx: blob.head.rx, ry: blob.head.ry, transform: `rotate(${blob.head.rot} ${blob.head.cx} ${blob.head.cy})` }, bg);
      svg('path', { d: blob.d }, bg);
      drawArm(bg, `M ${blob.shoulder.x} ${blob.shoulder.y} Q ${blob.shoulder.x + 16} ${blob.shoulder.y + 18} 80 ${-HEAD_H + 88}`, 13).setAttribute('stroke', fill);

      const self = svg('g', { transform: `translate(0 ${-HEAD_H}) scale(-1 1)`, opacity: rec }, el.visitorBody);
      drawSelf(self, { fill, stroke: rim, 'stroke-width': 1.2, 'stroke-opacity': 0.6 * rec });
      svg('path', { d: SELF.robe, fill }, self);
      drawArm(self, SELF.arm).setAttribute('stroke', fill);

      setFilter(42 * (1 - rec) + (rec >= 1 ? 0 : 2), 7 * (1 - rec) + 0.4);
      vis.attached = true;
    } else {
      // Silhouette ordinaire : se précise à mesure que les promesses s'accumulent.
      const clarity = clamp(0.06 + state.promiseCount / 10);
      const s = genShape(v.id);
      const g = svg('g', { fill, stroke: rim, 'stroke-width': 1.2, 'stroke-opacity': clarity * 0.7 }, el.visitorBody);
      svg('ellipse', { cx: s.head.cx, cy: s.head.cy, rx: s.head.rx, ry: s.head.ry, transform: `rotate(${s.head.rot} ${s.head.cx} ${s.head.cy})` }, g);
      svg('path', { d: s.d }, g);
      const eyes = svg('g', { fill: '#d8cfbd', opacity: (clarity ** 1.6 * 0.75).toFixed(3) }, el.visitorFeatures);
      const ey = s.head.cy - 2;
      svg('circle', { cx: s.head.cx - 7, cy: ey, r: 1.8 }, eyes);
      svg('circle', { cx: s.head.cx + 7, cy: ey, r: 1.8 }, eyes);
      if (clarity > 0.5) {
        svg('path', {
          d: `M ${s.head.cx - 5} ${ey + 13} Q ${s.head.cx} ${ey + 15} ${s.head.cx + 5} ${ey + 13}`,
          fill: 'none', stroke: '#d8cfbd', 'stroke-width': 1, opacity: ((clarity - 0.5) * 1.2).toFixed(3),
        }, el.visitorFeatures);
      }
      setFilter(42 * (1 - clarity) + 2, 7 * (1 - clarity) + 0.6);
      vis.attached = false;
    }
  }

  async function enterVisitor() {
    vis.x = -140; vis.o = 0; applyVisitor();
    await tween(1800, (k) => { vis.x = -140 + (VISITOR_X + 140) * k; vis.o = k; applyVisitor(); });
  }

  async function leaveVisitor() {
    const x0 = vis.x;
    await tween(1600, (k) => { vis.x = x0 - (x0 + 160) * k; vis.o = 1 - k; applyVisitor(); });
    vis.attached = false;
    applyVisitor();
  }

  async function approachVisitor(to) {
    const x0 = vis.x;
    await tween(1400, (k) => { vis.x = x0 + (to - x0) * k; applyVisitor(); });
  }

  function setListenable(on) {
    el.visitor.classList.toggle('listenable', on);
    el.visitor.setAttribute('tabindex', on ? '0' : '-1');
  }

  function flashPresence() {
    el.presence.style.transition = 'none';
    el.presence.style.opacity = 1;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.presence.style.transition = '';
      el.presence.style.opacity = 0;
    }));
  }

  // ---------------------------------------------------------------- texte

  let typing = null;
  let continueResolver = null;

  function clearLines() { el.lines.replaceChildren(); }

  function say(text, cls) {
    return new Promise((res) => {
      const p = document.createElement('p');
      p.className = cls;
      el.lines.appendChild(p);
      while (el.lines.children.length > 7) el.lines.firstElementChild.remove();
      const done = () => {
        clearInterval(timer);
        p.textContent = text;
        typing = null;
        el.lines.scrollTop = el.lines.scrollHeight;
        res();
      };
      let i = 0;
      let timer = null;
      if (reducedMotion) { done(); return; }
      typing = { finish: done };
      timer = setInterval(() => {
        p.textContent = text.slice(0, ++i);
        el.lines.scrollTop = el.lines.scrollHeight;
        if (i >= text.length) done();
      }, 24);
    });
  }

  function waitContinue() {
    el.cont.hidden = false;
    return new Promise((res) => {
      continueResolver = () => { continueResolver = null; el.cont.hidden = true; res(); };
    });
  }

  // ---------------------------------------------------------------- menu

  const buttons = {};
  C.choices.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.choice = c.id;
    b.innerHTML = `<span class="key">${i + 1}</span>`;
    b.appendChild(document.createTextNode(c.label));
    b.addEventListener('click', () => onChoice(c.id));
    el.choices.appendChild(b);
    buttons[c.id] = b;
  });

  function showChoices(on) {
    el.choices.classList.toggle('hidden', !on);
    if (on) enableChoices(true);
  }

  function enableChoices(on) {
    for (const [id, b] of Object.entries(buttons)) {
      b.disabled = !on || (cur && cur.jam.dead.has(id));
    }
  }

  function resetButtons() {
    for (const b of Object.values(buttons)) { b.classList.remove('dead', 'shake'); b.disabled = false; }
  }

  // ---------------------------------------------------------------- déroulé

  let cur = null;   // contexte du tour en cours
  let busy = false;

  async function runTurn() {
    const v = C.visitors[state.turn];
    save();
    cur = { v, heard: 0, resolved: false, jam: { fails: 0, dead: new Set() } };
    busy = true;
    clearLines();
    resetButtons();
    showChoices(false);
    setListenable(false);

    if (v.recurring) {
      state.recurring.appearances = v.recurring;
      state.recurring.recognition = v.final
        ? 1
        : clamp([0.08, 0.3][v.recurring - 1] + state.weight * 0.01 + state.promiseCount * 0.01, 0, 0.8);
    }
    render();
    buildVisitor(v);
    await enterVisitor();

    if (state.owedYes && !v.final) await say(C.ui.owedReminder, 'aside');
    await say(`« ${v.request} »`, 'visitor');
    busy = false;
    showChoices(true);
    setListenable(true);
  }

  function fillText(s, v, family) {
    return s.replace(/\{yes\}/g, v.yes || '').replace(/\{no\}/g, v.no || '').replace(/\{family\}/g, family || '');
  }

  function onChoice(id) {
    if (!cur || cur.resolved || busy || typing) return;
    if (cur.v.final) jam(id); else resolveClassic(id);
  }

  // Les cinq réponses du menu : toutes ajoutent du poids, toutes créent une branche.
  async function resolveClassic(id) {
    const v = cur.v;
    cur.resolved = true;
    busy = true;
    showChoices(false);
    setListenable(false);

    let family = null;
    if (id === 'delegate') family = C.family[state.familyIndex++ % C.family.length];
    const reply = C.replies[id];
    await say(`— ${fillText(reply.say, v, family)}`, 'self');

    state.weight += C.weights[id];
    state.promiseCount++;
    state.history.push({ visitor: v.id, choice: id });

    let owedMsg = null;
    if (state.owedYes) {
      state.owedYes = false;
      if (id === 'promise') owedMsg = C.ui.owedKept;
      else {
        state.weight += C.owedBroken;
        owedMsg = C.ui.owedBroken;
        addBranch('broken', v.id);
      }
    }

    if (id === 'double') {
      addBranch('refuse', v.id);
      addBranch('future', v.id);
      state.owedYes = true;
    } else {
      addBranch(id, v.id);
    }
    if (id === 'think') state.suspended++;

    render();
    if (owedMsg) await say(owedMsg, 'aside');
    await say(fillText(reply.out, v, family), 'outcome');
    await leaveVisitor();
    await waitContinue();
    advance();
  }

  // « Rester et écouter » : cliquer sur la silhouette plutôt que sur le menu.
  async function onListen() {
    if (!cur || cur.resolved || busy || typing) return;
    const v = cur.v;
    busy = true;
    enableChoices(false);
    el.visitor.classList.remove('leaning');
    void el.visitor.getBBox();
    el.visitor.classList.add('leaning');

    const line = v.listen[cur.heard++];
    await say(line === '…' ? '…' : `« ${line} »`, 'listen');

    if (cur.heard >= v.listen.length) {
      if (v.final) resolveFinal(); else resolvePresence();
      return;
    }
    busy = false;
    enableChoices(true);
  }

  async function resolvePresence() {
    const v = cur.v;
    cur.resolved = true;
    showChoices(false);
    setListenable(false);
    state.listenCount++;
    state.weight = Math.max(0, state.weight - C.listenRelief);
    state.history.push({ visitor: v.id, choice: 'listen' });
    flashPresence();
    render();
    await wait(600);
    await say(C.ui.listenEnd, 'outcome');
    await leaveVisitor();
    await waitContinue();
    advance();
  }

  // Dernière apparition : le menu se grippe.
  async function jam(id) {
    const v = cur.v;
    const btn = buttons[id];
    busy = true;
    enableChoices(false);
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
    cur.jam.fails++;

    if (id === 'refuse') {
      await say(`— ${C.final.refuseSay}`, 'self');
      await wait(400);
      await say(`« ${v.request} »`, 'visitor');
    } else {
      await say(C.final.jam[id], 'aside');
      cur.jam.dead.add(id);
      btn.classList.add('dead');
    }

    if (cur.jam.fails >= 2 && vis.x < 470) await approachVisitor(Math.min(470, vis.x + 60));
    busy = false;
    enableChoices(true);
  }

  async function resolveFinal() {
    const v = cur.v;
    cur.resolved = true;
    showChoices(false);
    setListenable(false);
    state.history.push({ visitor: v.id, choice: 'listen' });
    state.recurring.released = true;
    state.weight = Math.max(0, state.weight - C.inheritedWeight);
    await wait(900);
    el.thread.style.opacity = 0;
    el.knot.style.opacity = 0;
    flashPresence();
    render();
    await say(C.final.release, 'outcome');
    await wait(1500);
    await tween(2600, (k) => { vis.o = 1 - k; applyVisitor(); });
    await waitContinue();
    finishGame();
  }

  function advance() {
    state.weight += state.suspended * C.suspendedDrift; // les « j'y réfléchis » continuent de peser
    state.turn++;
    busy = false;
    if (state.turn >= C.visitors.length) finishGame(); else runTurn();
  }

  function computeEnding() {
    if (state.avoidCount >= C.avoidThreshold && state.avoidCount > state.listenCount) return 'void';
    if (state.listenCount >= C.freeListenThreshold) return 'free';
    return 'weight';
  }

  function finishGame() {
    const ending = computeEnding();
    meta.runs.push({ ending, branches: state.branches.length, weight: Math.round(state.weight * 10) / 10 });
    store.set(META_KEY, meta);
    store.del(SAVE_KEY);
    renderRunMarks();
    renderDebug();
    clearLines();

    const E = C.endings[ending];
    $('#ending-title').textContent = E.title;
    const box = $('#ending-text');
    box.replaceChildren();
    E.text.forEach((t, i) => {
      const p = document.createElement('p');
      p.textContent = t.replace(/\{branches\}/g, state.branches.length);
      p.style.animationDelay = `${0.8 + i * 1.6}s`;
      box.appendChild(p);
    });
    el.ending.hidden = false;
    el.ending.classList.remove('fading');
    el.ending.dataset.ending = ending;
  }

  // ---------------------------------------------------------------- mise en place

  function resetScene() {
    el.branches.replaceChildren();
    state.branches.forEach((b) => drawBranch(b, false));
    el.thread.style.opacity = '';
    el.knot.style.opacity = '';
    vis.x = -140; vis.o = 0; vis.attached = false;
    applyVisitor();
    clearLines();
    showChoices(false);
    renderRunMarks();
    render();
  }

  async function begin(resume) {
    const saved = store.get(SAVE_KEY);
    state = resume && saved ? Object.assign(newState(), saved) : newState();
    resetScene();
    el.title.classList.add('fading');
    el.ending.classList.add('fading');
    await wait(1400);
    el.title.hidden = true;
    el.ending.hidden = true;
    runTurn();
  }

  $('#btn-start').addEventListener('click', () => begin(false));
  $('#btn-resume').addEventListener('click', () => begin(true));
  $('#btn-again').addEventListener('click', () => begin(false));
  el.cont.addEventListener('click', (e) => { e.stopPropagation(); if (continueResolver) continueResolver(); });

  el.visitor.addEventListener('click', onListen);
  el.visitor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onListen(); }
  });

  el.panel.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (typing) typing.finish();
    else if (continueResolver) continueResolver();
  });

  document.addEventListener('keydown', (e) => {
    if (!el.title.hidden || !el.ending.hidden) return;
    const onControl = e.target.closest && (e.target.closest('button') || e.target === el.visitor);
    if (e.key === ' ' || e.key === 'Enter') {
      if (onControl) return;
      e.preventDefault();
      if (typing) typing.finish();
      else if (continueResolver) continueResolver();
      return;
    }
    const idx = Number(e.key) - 1;
    if (idx >= 0 && idx < C.choices.length && !el.choices.classList.contains('hidden')) {
      const b = buttons[C.choices[idx].id];
      if (!b.disabled) onChoice(C.choices[idx].id);
    }
  });

  // En portrait, on resserre le cadre sur la silhouette et le trône.
  function fitScene() {
    const r = el.scene.getBoundingClientRect();
    const portrait = r.width / Math.max(1, r.height) < 1.2;
    el.scene.setAttribute('viewBox', portrait ? '200 60 720 540' : '0 0 1000 620');
  }
  window.addEventListener('resize', fitScene);
  fitScene();

  // État d'ouverture : le poids hérité est déjà visible derrière l'écran titre.
  if (store.get(SAVE_KEY)) $('#btn-resume').hidden = false;
  resetScene();

  // Accès pour les tests automatisés.
  window.MNP = { get state() { return state; }, get meta() { return meta; } };
})();
