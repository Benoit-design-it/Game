// Make No Promises — ambiance sonore.
// Tout est synthétisé avec Web Audio : aucun fichier à charger.
// Un bourdon grave porte le poids (tension qui monte avec les promesses, son étouffé
// par l'évitement) ; chaque geste du jeu a son propre son.
window.MNP_AUDIO = (() => {
  'use strict';

  const KEY = 'mnp.sound.v1';
  const AC = window.AudioContext || window.webkitAudioContext;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === 'off'; } catch { /* stockage indisponible */ }

  let ctx = null;
  let out, wet, droneLevel, duck, droneFilter, tension, air, whiteNoise;
  const level = { weight: 0, avoid: 0 };

  const ready = () => !!ctx && !muted;

  function noiseBuffer(seconds, brown) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  }

  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function osc(freq, type, gain, dest, detune = 0) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.value = gain;
    o.connect(g);
    g.connect(dest);
    o.start();
    return o;
  }

  function start() {
    if (!AC) return;
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new AC(); } catch { ctx = null; return; }

    const comp = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);
    out = ctx.createGain();
    out.gain.value = muted ? 0 : 0.9;
    out.connect(comp);

    const verb = ctx.createConvolver();
    verb.buffer = impulse(3.8, 2.4);
    wet = ctx.createGain();
    wet.gain.value = 0.4;
    wet.connect(verb);
    verb.connect(out);

    whiteNoise = noiseBuffer(2, false);

    // Bourdon : quinte grave, légèrement désaccordée.
    droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 420;
    droneFilter.Q.value = 0.8;
    droneLevel = ctx.createGain();
    droneLevel.gain.value = 0;
    duck = ctx.createGain();
    duck.gain.value = 1;
    droneFilter.connect(droneLevel);
    droneLevel.connect(duck);
    duck.connect(out);
    duck.connect(wet);
    osc(55, 'sine', 0.5, droneFilter);
    osc(82.4, 'triangle', 0.16, droneFilter, -4);
    osc(110, 'sine', 0.12, droneFilter, 5);
    osc(164.8, 'sine', 0.05, droneFilter, 3);

    // Tension : une seconde mineure qui frotte contre le bourdon, proportionnelle au poids.
    tension = ctx.createGain();
    tension.gain.value = 0;
    tension.connect(droneFilter);
    osc(58.27, 'sine', 0.6, tension);
    osc(116.54, 'triangle', 0.25, tension, 7);

    // Le filtre respire lentement.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 90;
    lfo.connect(lfoDepth);
    lfoDepth.connect(droneFilter.frequency);
    lfo.start();

    // Souffle de la salle.
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(6, true);
    n.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 260;
    nf.Q.value = 0.6;
    air = ctx.createGain();
    air.gain.value = 0;
    n.connect(nf);
    nf.connect(air);
    air.connect(out);
    n.start();

    reset();
  }

  // Niveau de base du bourdon et du souffle (utilisé au départ et à chaque nouvelle partie).
  function reset() {
    if (!ctx) return;
    const t = ctx.currentTime;
    droneLevel.gain.cancelScheduledValues(t);
    droneLevel.gain.setTargetAtTime(0.16, t, 2.5);
    air.gain.cancelScheduledValues(t);
    air.gain.setTargetAtTime(0.05, t, 3);
    duck.gain.cancelScheduledValues(t);
    duck.gain.setTargetAtTime(1, t, 1);
    apply();
  }

  function apply() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const w = Math.min(1, level.weight / 30);
    const a = Math.min(1, level.avoid / 6);
    tension.gain.setTargetAtTime(w * 0.24, t, 2);
    droneFilter.frequency.setTargetAtTime(Math.max(140, 420 + w * 260 - a * 280), t, 2);
  }

  function update(weight, avoid) {
    level.weight = weight;
    level.avoid = avoid;
    apply();
  }

  // ---------------------------------------------------------------- briques

  function tone(freq, o = {}) {
    if (!ready()) return;
    const t = ctx.currentTime + (o.at || 0);
    const a = o.a ?? 0.01, d = o.d ?? 2, peak = o.gain ?? 0.08;
    const src = ctx.createOscillator();
    src.type = o.type || 'sine';
    src.frequency.setValueAtTime(freq, t);
    if (o.glideTo) src.frequency.exponentialRampToValueAtTime(o.glideTo, t + a + d);
    if (o.detune) src.detune.value = o.detune;
    let node = src;
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.lp;
      node.connect(f);
      node = f;
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    node.connect(g);
    route(g, o);
    src.start(t);
    src.stop(t + a + d + 0.1);
  }

  function noise(o = {}) {
    if (!ready()) return;
    const t = ctx.currentTime + (o.at || 0);
    const dur = o.dur ?? 0.03;
    const src = ctx.createBufferSource();
    src.buffer = whiteNoise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.freq ?? 3000, t);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + dur);
    f.Q.value = o.q ?? 1;
    const g = ctx.createGain();
    const a = o.a ?? 0.002;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur);
    src.connect(f);
    f.connect(g);
    route(g, o);
    src.start(t, Math.random() * 1.5);
    src.stop(t + a + dur + 0.05);
  }

  function route(node, o) {
    let last = node;
    if (o.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = o.pan;
      node.connect(p);
      last = p;
    }
    last.connect(out);
    const send = o.wet ?? 0.5;
    if (send) {
      const s = ctx.createGain();
      s.gain.value = send;
      last.connect(s);
      s.connect(wet);
    }
  }

  function bell(freq, o = {}) {
    const g = o.gain ?? 0.06, d = o.d ?? 3;
    [[1, 1], [2.01, 0.45], [3.03, 0.22], [4.21, 0.1]].forEach(([m, k]) =>
      tone(freq * m, { ...o, gain: g * k, d: d / Math.sqrt(m), a: 0.004 }));
  }

  function thud(o = {}) {
    tone(o.freq ?? 110, { glideTo: 36, a: 0.004, d: 0.7, gain: o.gain ?? 0.28, wet: 0.35, at: o.at, pan: o.pan });
    noise({ type: 'lowpass', freq: 380, dur: 0.18, gain: (o.gain ?? 0.28) * 0.5, at: o.at, wet: 0.2, pan: o.pan });
  }

  function ducking(to, hold) {
    if (!ready()) return;
    const t = ctx.currentTime;
    duck.gain.cancelScheduledValues(t);
    duck.gain.setTargetAtTime(to, t, 0.5);
    duck.gain.setTargetAtTime(1, t + hold, 1.8);
  }

  // ---------------------------------------------------------------- événements

  const on = {
    // Une branche de réalité s'ouvre.
    branch(type) {
      if (type === 'promise') bell(659.3, { gain: 0.07, d: 3.5 });
      else if (type === 'think') {
        // Suspendu : deux notes qui frottent et ne se résolvent pas.
        tone(587.3, { a: 0.9, d: 5, gain: 0.035 });
        tone(622.3, { a: 1.2, d: 5, gain: 0.02, at: 0.3 });
      } else if (type === 'delegate') {
        bell(440, { gain: 0.05 });
        bell(329.6, { gain: 0.035, at: 0.5, pan: -0.4 });
      } else if (type === 'refuse') thud();
      else if (type === 'future') bell(880, { gain: 0.025, at: 0.9, wet: 1.2, pan: 0.3 });
      else if (type === 'broken') { on.crack(0.6); bell(466.2, { gain: 0.04, detune: -30, at: 0.2 }); }
    },

    // La pierre se fend : crépitements proportionnels à l'avancée des fissures.
    crack(amount) {
      const n = 3 + Math.round(Math.min(1.5, amount) * 14);
      const span = 0.25 + Math.min(1.5, amount) * 0.9;
      for (let i = 0; i < n; i++) {
        noise({
          type: 'highpass', freq: 1500 + Math.random() * 3500, q: 0.7,
          dur: 0.004 + Math.random() * 0.02, gain: 0.04 + Math.random() * 0.1,
          at: Math.random() * span, pan: (Math.random() - 0.5) * 0.5, wet: 0.3,
        });
      }
      tone(46, { type: 'triangle', a: 0.05, d: 0.4 + span, gain: 0.05 + Math.min(1, amount) * 0.08, lp: 300, wet: 0.4 });
    },

    // Une chaîne se tend.
    chain() {
      for (let i = 0; i < 3; i++) {
        [1180, 1710, 2390, 3170].forEach((f) =>
          tone(f * (0.95 + Math.random() * 0.1), { a: 0.002, d: 0.35, gain: 0.012, at: i * 0.13, pan: 0.35, wet: 0.6 }));
      }
    },

    // Les fissures reculent.
    heal() {
      tone(392, { a: 0.7, d: 3, gain: 0.03 });
      tone(587.3, { a: 1, d: 3, gain: 0.02, at: 0.2 });
    },

    arrive() { noise({ type: 'lowpass', freq: 260, sweepTo: 900, dur: 1.6, a: 0.6, gain: 0.035, wet: 0.6, pan: -0.5 }); },

    // Écouter : le bourdon s'efface un moment.
    listen() {
      ducking(0.5, 3);
      tone(261.6, { a: 0.4, d: 1.6, gain: 0.02 });
    },

    presence() {
      ducking(0.4, 4);
      [196, 293.7, 392].forEach((f, i) => tone(f, { a: 1.3, d: 3.8, gain: 0.028, at: i * 0.15 }));
    },

    // Le silence s'installe.
    hush() { ducking(0.3, 6); },

    steps(dir) {
      for (let i = 0; i < 6; i++) {
        tone(92, { glideTo: 52, a: 0.003, d: 0.16, gain: 0.07 * (1 - i / 7), at: 0.2 + i * 0.42, pan: dir * (0.15 + i / 7), wet: 0.4 });
      }
    },

    whoosh() { noise({ type: 'bandpass', freq: 700, sweepTo: 180, dur: 1.3, a: 0.3, gain: 0.05, q: 0.8, wet: 0.8 }); },

    // Le menu se grippe.
    jam() {
      tone(110, { type: 'square', a: 0.005, d: 0.3, gain: 0.03, lp: 700, wet: 0.2 });
      tone(116.5, { type: 'square', a: 0.005, d: 0.3, gain: 0.03, lp: 700, wet: 0.2 });
    },

    loop() { thud({ gain: 0.14 }); },

    // Le fil se dénoue.
    release() {
      if (!ready()) return;
      const t = ctx.currentTime;
      tension.gain.setTargetAtTime(0, t, 1.5);
      tone(220, { glideTo: 440, a: 1.2, d: 4, gain: 0.04 });
      [440, 554.4, 659.3].forEach((f, i) => bell(f, { gain: 0.025, at: 1.5 + i * 0.7, d: 5 }));
    },

    ending(kind) {
      if (!ready()) return;
      const t = ctx.currentTime;
      if (kind === 'free') {
        droneLevel.gain.setTargetAtTime(0.06, t, 3);
        [220, 277.2, 329.6, 440].forEach((f, i) => tone(f, { a: 2.2, d: 7, gain: 0.025, at: i * 0.4 }));
      } else if (kind === 'weight') {
        tension.gain.setTargetAtTime(0.3, t, 2);
        [55, 58.3, 82.4].forEach((f) => tone(f, { type: 'triangle', a: 2, d: 8, gain: 0.07, lp: 400 }));
      } else {
        // Personne : presque plus rien.
        droneLevel.gain.setTargetAtTime(0.008, t, 3);
        air.gain.setTargetAtTime(0.02, t, 3);
      }
    },
  };

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch { /* idem */ }
    if (ctx) out.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.3);
  }

  function play(name, ...args) {
    if (!ready() || !on[name]) return;
    try { on[name](...args); } catch { /* le son ne doit jamais bloquer le jeu */ }
  }

  return { start, reset, update, play, setMuted, get muted() { return muted; } };
})();
