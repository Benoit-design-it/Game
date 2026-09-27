// Make No Promises — encre vive.
// Les silhouettes sont peintes par une simulation (PixiJS, WebGL) : l'eau se répand le long
// des fibres du papier, emporte le pigment vers les bords, puis s'évapore et le fixe.
// Moins il y a eu de promesses, plus l'encre est humide et bave.
// La silhouette SVG reste en place, invisible, pour les clics. Sans WebGL, ou sans rendu
// en virgule flottante, le jeu garde son rendu SVG.
window.MNP_INK = (() => {
  'use strict';

  const KEY = 'mnp.ink.v2';
  // Boîte de la silhouette dans ses propres coordonnées (pieds à l'origine).
  const BOX = { x0: -150, y0: -350, x1: 150, y1: 24 };
  const SCALE = 1.25; // pixels de simulation par unité de scène
  const MW = Math.round((BOX.x1 - BOX.x0) * SCALE);
  const MH = Math.round((BOX.y1 - BOX.y0) * SCALE);
  const STEPS = 3600;       // pas de simulation avant que l'encre soit sèche
  const PER_FRAME = 8;
  const INK = [0.106, 0.102, 0.09];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch { /* stockage indisponible */ }

  let ok = false, app = null, canvas = null, scene = null, target = null;
  let rtA, rtB, maskTexture, initMesh, stepMesh, stepShader, showMesh, showShader;
  let active = 0, hasVisitor = false, idle = 0, size = { w: 0, h: 0 };

  // ---------------------------------------------------------------- shaders

  const MESH_VS = `
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aUvs;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
varying vec2 vUvs;
void main() {
  vUvs = aUvs;
  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}`;

  // État de la simulation : R = pigment en suspension, G = eau, B = pigment fixé.
  const INIT_FS = `
precision highp float;
varying vec2 vUvs;
uniform sampler2D uMask;
uniform sampler2D uFibers;
uniform float uWet;
void main() {
  vec4 m = texture2D(uMask, vUvs);
  float f = texture2D(uFibers, vUvs).r;
  // Encre sèche : le pinceau saute les creux du papier.
  float brush = mix(1.0, smoothstep(0.38, 0.62, f), (1.0 - uWet) * 0.5);
  float pig = m.b * brush * 1.1;
  float water = m.r * (0.08 + 1.5 * uWet) * (1.0 - m.g);
  gl_FragColor = vec4(pig * (1.0 - m.g), water, 0.0, 1.0);
}`;

  const STEP_FS = `
precision highp float;
varying vec2 vUvs;
uniform sampler2D uState;
uniform sampler2D uFibers;
uniform sampler2D uMask;
uniform vec2 uTexel;
uniform float uDry;
float fiber(vec2 uv) { return texture2D(uFibers, uv).r; }
float perm(vec2 uv) {
  return (0.2 + 0.8 * fiber(uv)) * (1.0 - texture2D(uMask, uv).g);
}
// L'eau n'entre dans le papier sec que par les fibres les plus absorbantes : filaments.
float gate(float wa, float wb, float fa, float fb) {
  float dryF = wa < wb ? fa : fb;
  return mix(smoothstep(0.5, 0.72, dryF), 1.0, smoothstep(0.0, 0.035, min(wa, wb)));
}
void main() {
  vec2 dx = vec2(uTexel.x, 0.0), dy = vec2(0.0, uTexel.y);
  vec4 c = texture2D(uState, vUvs);
  vec4 n = texture2D(uState, vUvs - dy), s = texture2D(uState, vUvs + dy);
  vec4 e = texture2D(uState, vUvs + dx), w = texture2D(uState, vUvs - dx);
  float pc = perm(vUvs);
  float fc = fiber(vUvs);
  float pn = 0.5 * (pc + perm(vUvs - dy)) * gate(c.g, n.g, fc, fiber(vUvs - dy));
  float ps = 0.5 * (pc + perm(vUvs + dy)) * gate(c.g, s.g, fc, fiber(vUvs + dy));
  float pe = 0.5 * (pc + perm(vUvs + dx)) * gate(c.g, e.g, fc, fiber(vUvs + dx));
  float pw = 0.5 * (pc + perm(vUvs - dx)) * gate(c.g, w.g, fc, fiber(vUvs - dx));

  // Eau : diffusion capillaire le long des fibres.
  float water = c.g + 0.22 * (pn * (n.g - c.g) + ps * (s.g - c.g) + pe * (e.g - c.g) + pw * (w.g - c.g));

  // Pigment : ne circule qu'entre cases mouillées.
  float mn = pn * clamp(min(n.g, c.g) * 4.0, 0.0, 1.0), ms = ps * clamp(min(s.g, c.g) * 4.0, 0.0, 1.0);
  float me = pe * clamp(min(e.g, c.g) * 4.0, 0.0, 1.0), mw = pw * clamp(min(w.g, c.g) * 4.0, 0.0, 1.0);
  float pig = c.r + 0.2 * (mn * (n.r - c.r) + ms * (s.r - c.r) + me * (e.r - c.r) + mw * (w.r - c.r));

  // L'eau qui file vers les bords emporte le pigment : c'est ce qui fonce le pourtour.
  float k = 0.9;
  float outF = k * (mn * max(0.0, c.g - n.g) + ms * max(0.0, c.g - s.g) + me * max(0.0, c.g - e.g) + mw * max(0.0, c.g - w.g));
  float inF = k * (mn * max(0.0, n.g - c.g) * n.r + ms * max(0.0, s.g - c.g) * s.r + me * max(0.0, e.g - c.g) * e.r + mw * max(0.0, w.g - c.g) * w.r);
  pig += inF - min(outF, 0.9) * c.r;

  // Évaporation, plus rapide là où les fibres boivent moins.
  water = max(0.0, water - uDry * (0.7 + 0.6 * (1.0 - pc)));

  // En séchant, le pigment se fixe.
  float thin = 1.0 - smoothstep(0.0, 0.16, water);
  float dep = max(pig, 0.0) * (0.003 + 0.14 * thin);
  pig = max(pig - dep, 0.0);
  gl_FragColor = vec4(pig, water, c.b + dep, 1.0);
}`;

  const SHOW_FS = `
precision highp float;
varying vec2 vUvs;
uniform sampler2D uState;
uniform sampler2D uFibers;
uniform sampler2D uMask;
uniform vec3 uInk;
uniform float uAlpha;
void main() {
  vec4 c = texture2D(uState, vUvs);
  float f = texture2D(uFibers, vUvs).r;
  float pig = c.b + c.r * 0.9;
  float d = 1.0 - exp(-pig * (1.3 + 0.8 * f));
  // Encore mouillée, l'encre paraît un peu plus sombre.
  d = min(1.0, d * (1.0 + 0.12 * smoothstep(0.0, 0.2, c.g)));
  d *= 1.0 - texture2D(uMask, vUvs).g;
  float a = clamp(d, 0.0, 1.0) * uAlpha;
  gl_FragColor = vec4(uInk * a, a);
}`;

  // ---------------------------------------------------------------- papier et masque

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Fibres du papier : des milliers de brins courts, plus ou moins perméables.
  function makeFibers() {
    const c = document.createElement('canvas');
    c.width = MW;
    c.height = MH;
    const x = c.getContext('2d');
    x.fillStyle = 'rgb(128,128,128)';
    x.fillRect(0, 0, MW, MH);
    const r = rng(7919);
    for (let i = 0; i < 9; i++) {
      const g = x.createRadialGradient(r() * MW, r() * MH, 0, r() * MW, r() * MH, 60 + r() * 120);
      const light = r() < 0.5;
      g.addColorStop(0, light ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)');
      g.addColorStop(1, 'rgba(128,128,128,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, MW, MH);
    }
    for (let i = 0; i < 3200; i++) {
      const px = r() * MW, py = r() * MH, a = r() * Math.PI, L = 6 + r() * 36;
      x.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.06 + r() * 0.2})` : `rgba(0,0,0,${0.05 + r() * 0.16})`;
      x.lineWidth = 0.5 + r() * 1.3;
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + (r() - 0.5) * 8, py + Math.sin(a) * L * 0.5 + (r() - 0.5) * 8, px + Math.cos(a) * L, py + Math.sin(a) * L);
      x.stroke();
    }
    return c;
  }

  const maskCanvas = document.createElement('canvas');
  const layerCanvas = document.createElement('canvas');
  maskCanvas.width = layerCanvas.width = MW;
  maskCanvas.height = layerCanvas.height = MH;

  // Une forme : { ellipse: [cx, cy, rx, ry, rotDeg] } | { d } | { d, stroke: largeur }.
  function paint(ctx, shape, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (shape.ellipse) {
      const [cx, cy, rx, ry, rot] = shape.ellipse;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, ((rot || 0) * Math.PI) / 180, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape.stroke) {
      ctx.lineWidth = shape.stroke;
      ctx.lineCap = 'round';
      ctx.stroke(new Path2D(shape.d));
    } else {
      ctx.fill(new Path2D(shape.d));
    }
  }

  function toMask(ctx, m) {
    ctx.setTransform(SCALE, 0, 0, SCALE, -BOX.x0 * SCALE, -BOX.y0 * SCALE);
    if (m) ctx.transform(...m);
  }

  // Masque : R = couverture, B = couverture × densité d'encre, G = réserves (papier nu).
  // Chaque couche est peinte seule (union sans surcharge aux raccords), puis additionnée.
  function drawMask(spec) {
    const mc = maskCanvas.getContext('2d');
    const lc = layerCanvas.getContext('2d');
    mc.setTransform(1, 0, 0, 1, 0, 0);
    mc.globalCompositeOperation = 'source-over';
    mc.fillStyle = '#000';
    mc.fillRect(0, 0, MW, MH);
    for (const L of spec.layers) {
      if (L.cover <= 0.001) continue;
      lc.setTransform(1, 0, 0, 1, 0, 0);
      lc.clearRect(0, 0, MW, MH);
      toMask(lc, L.m);
      const color = `rgb(${Math.round(255 * L.cover)},0,${Math.round(255 * L.cover * L.dens)})`;
      for (const s of L.shapes) paint(lc, s, color);
      mc.setTransform(1, 0, 0, 1, 0, 0);
      mc.globalCompositeOperation = 'lighter';
      mc.drawImage(layerCanvas, 0, 0);
    }
    for (const H of spec.holes || []) {
      if (H.strength <= 0.001) continue;
      toMask(mc, H.m);
      for (const s of H.shapes) paint(mc, s, `rgb(0,${Math.round(255 * H.strength)},0)`);
    }
  }

  // ---------------------------------------------------------------- mise en place

  function init(sceneEl, visitorEl) {
    scene = sceneEl;
    target = visitorEl;
    try {
      if (!window.PIXI) throw new Error('PixiJS absent');
      canvas = document.createElement('canvas');
      canvas.id = 'ink';
      canvas.setAttribute('aria-hidden', 'true');
      scene.after(canvas);
      app = new PIXI.Application({
        view: canvas, width: 10, height: 10, backgroundAlpha: 0, antialias: false,
        resolution: Math.min(2, window.devicePixelRatio || 1), autoDensity: true, autoStart: false,
      });
      const r = app.renderer;
      const gl = r.gl;
      if (!gl || r.context.webGLVersion !== 2) throw new Error('WebGL 2 indisponible');
      if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) {
        throw new Error('rendu en virgule flottante indisponible');
      }
      const opts = { width: MW, height: MH, format: PIXI.FORMATS.RGBA, type: PIXI.TYPES.HALF_FLOAT };
      rtA = PIXI.RenderTexture.create(opts);
      rtB = PIXI.RenderTexture.create(opts);
      maskTexture = PIXI.Texture.from(maskCanvas);
      const fiberTexture = PIXI.Texture.from(makeFibers());
      const geom = new PIXI.Geometry()
        .addAttribute('aVertexPosition', [0, 0, MW, 0, MW, MH, 0, MH], 2)
        .addAttribute('aUvs', [0, 0, 1, 0, 1, 1, 0, 1], 2)
        .addIndex([0, 1, 2, 0, 2, 3]);
      initMesh = new PIXI.Mesh(geom, PIXI.Shader.from(MESH_VS, INIT_FS, { uMask: maskTexture, uFibers: fiberTexture, uWet: 1 }));
      stepShader = PIXI.Shader.from(MESH_VS, STEP_FS, {
        uState: rtA, uFibers: fiberTexture, uMask: maskTexture, uTexel: [1 / MW, 1 / MH], uDry: 0.0006,
      });
      stepMesh = new PIXI.Mesh(geom, stepShader);
      showShader = PIXI.Shader.from(MESH_VS, SHOW_FS, { uState: rtA, uFibers: fiberTexture, uMask: maskTexture, uInk: INK, uAlpha: 0 });
      showMesh = new PIXI.Mesh(geom, showShader);
      showMesh.visible = false;
      app.stage.addChild(showMesh);

      // Vérifie que la carte graphique accepte vraiment de peindre en virgule flottante.
      r.render(initMesh, { renderTexture: rtA, clear: true });
      r.renderTexture.bind(rtA);
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      r.renderTexture.bind(null);
      if (status !== gl.FRAMEBUFFER_COMPLETE) throw new Error('texture de simulation refusée');

      app.ticker.add(tick);
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); teardown('contexte WebGL perdu'); });
      ok = true;
    } catch (err) {
      teardown(err && err.message);
    }
    apply();
    return ok;
  }

  function teardown(reason) {
    if (reason) console.warn('Encre vive désactivée :', reason);
    ok = false;
    try { if (app) app.destroy(false); } catch { /* déjà détruit */ }
    app = null;
    if (canvas) canvas.remove();
    canvas = null;
    apply();
  }

  function apply() {
    const live = ok && enabled;
    document.documentElement.classList.toggle('ink-live', live);
    if (!canvas) return;
    canvas.hidden = !live;
    if (live) wake(); else app.stop();
  }

  // ---------------------------------------------------------------- simulation

  function step() {
    stepShader.uniforms.uState = rtA;
    app.renderer.render(stepMesh, { renderTexture: rtB, clear: true });
    [rtA, rtB] = [rtB, rtA];
  }

  // Aligne le calque d'encre sur la scène, et la silhouette peinte sur la silhouette SVG.
  function fit() {
    const game = scene.parentElement.getBoundingClientRect();
    const rr = scene.getBoundingClientRect();
    if (rr.width !== size.w || rr.height !== size.h) {
      size = { w: rr.width, h: rr.height };
      app.renderer.resize(Math.max(1, rr.width), Math.max(1, rr.height));
    }
    canvas.style.left = `${rr.left - game.left}px`;
    canvas.style.top = `${rr.top - game.top}px`;
    const ctm = target.getScreenCTM();
    if (!ctm) return;
    const x0 = ctm.a * BOX.x0 + ctm.c * BOX.y0 + ctm.e - rr.left;
    const y0 = ctm.b * BOX.x0 + ctm.d * BOX.y0 + ctm.f - rr.top;
    const x1 = ctm.a * BOX.x1 + ctm.c * BOX.y1 + ctm.e - rr.left;
    const y1 = ctm.b * BOX.x1 + ctm.d * BOX.y1 + ctm.f - rr.top;
    showMesh.position.set(x0, y0);
    showMesh.scale.set((x1 - x0) / MW, (y1 - y0) / MH);
  }

  function tick() {
    if (active > 0) {
      const n = Math.min(PER_FRAME, active);
      for (let i = 0; i < n; i++) step();
      active -= n;
    }
    fit();
    let alpha = parseFloat(target.getAttribute('opacity') || '0');
    // Même indice qu'en SVG : survolée, la silhouette pâlit à peine.
    if (target.matches('.listenable:hover, .listenable:focus-visible')) alpha *= 0.82;
    showShader.uniforms.uState = rtA;
    showShader.uniforms.uAlpha = alpha;
    showMesh.visible = hasVisitor && alpha > 0.002;
    // Rien à peindre ni à faire sécher : on laisse la carte graphique au repos.
    if (!showMesh.visible && active <= 0) {
      if (++idle > 20) app.stop();
    } else idle = 0;
  }

  function wake() {
    if (ok && enabled && app && !app.ticker.started) { idle = 0; app.start(); }
  }

  // Pose une nouvelle goutte : la silhouette du tour.
  function setVisitor(spec) {
    if (!ok) return;
    drawMask(spec);
    maskTexture.baseTexture.update();
    initMesh.shader.uniforms.uWet = Math.max(0.04, Math.min(1, spec.wet));
    app.renderer.render(initMesh, { renderTexture: rtA, clear: true });
    active = STEPS;
    hasVisitor = true;
    if (reduced) {
      // Sans animation : on fait sécher l'encre en quelques centaines de pas, d'un coup.
      stepShader.uniforms.uDry = 0.0072;
      for (let i = 0; i < 300; i++) step();
      stepShader.uniforms.uDry = 0.0006;
      active = 0;
    }
    wake();
  }

  function clear() {
    hasVisitor = false;
    active = 0;
  }

  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* idem */ }
    apply();
  }

  function setFilter(f) { if (canvas) canvas.style.filter = f; }

  return {
    init, setVisitor, clear, wake, setEnabled, setFilter,
    get enabled() { return enabled; },
    get available() { return ok; },
    get live() { return ok && enabled; },
  };
})();
