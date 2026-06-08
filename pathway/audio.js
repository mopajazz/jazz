// JazzAudio — Web Audio synth engine.
// Consistent with the site: chordal playback + click + bass + a swung ride.
// No samples — everything is synthesized so it works offline.
(function () {
  const SEMI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
  const norm = (k) => String(k).replace(/♭/g, "b").replace(/♯/g, "#").trim();
  const midi = (name, oct) => (oct + 1) * 12 + (SEMI[norm(name)] ?? 0);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // scale interval sets (from root)
  const SCALES = {
    blues: [0, 3, 5, 6, 7, 10, 12],
    pent: [0, 2, 4, 7, 9, 12],
    maj7arp: [0, 4, 7, 11, 12],
  };
  const CHORD = { maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dom7: [0, 4, 7, 10] };

  const A = {
    ctx: null, master: null, comp: null,
    playing: false, timer: null,
    opts: null,
    // transport position
    bar: 0, beat: 0, eighth: 0, inCount: 0, nextTime: 0,
    clipSources: [],

    init() {
      if (this.ctx) return;
      const C = window.AudioContext || window.webkitAudioContext;
      this.ctx = new C();
      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -14; this.comp.ratio.value = 4; this.comp.attack.value = 0.003; this.comp.release.value = 0.25;
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.comp); this.comp.connect(this.ctx.destination);
    },
    resume() { this.init(); if (this.ctx.state === "suspended") this.ctx.resume(); },

    // ── voices ──────────────────────────────────────────────
    _env(node, time, a, d, peak) {
      const g = node.gain;
      g.cancelScheduledValues(time);
      g.setValueAtTime(0.0001, time);
      g.exponentialRampToValueAtTime(peak, time + a);
      g.exponentialRampToValueAtTime(0.0001, time + a + d);
    },
    chord(time, rootName, type = "maj7", dur = 1.4, gain = 0.16, dest) {
      const out = dest || this.master;
      const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.Q.value = 0.4;
      const bus = this.ctx.createGain(); bus.connect(lp); lp.connect(out);
      this._env(bus, time, 0.012, dur, gain);
      (CHORD[type] || CHORD.maj7).forEach((s, i) => {
        const m = midi(rootName, 4) + s;
        const f = mtof(m);
        const o1 = this.ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = f;
        const o2 = this.ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2; // octave shimmer
        const vg = this.ctx.createGain(); vg.gain.value = i === 0 ? 0.9 : 0.7;
        const og = this.ctx.createGain(); og.gain.value = 0.25;
        o1.connect(vg); o2.connect(og); vg.connect(bus); og.connect(bus);
        o1.start(time); o2.start(time); o1.stop(time + dur + 0.1); o2.stop(time + dur + 0.1);
        this._track(o1); this._track(o2);
      });
    },
    bass(time, rootName, dur = 0.4, gain = 0.5, dest) {
      const out = dest || this.master;
      const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = mtof(midi(rootName, 2));
      const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
      const g = this.ctx.createGain();
      o.connect(lp); lp.connect(g); g.connect(out);
      this._env(g, time, 0.008, dur, gain);
      o.start(time); o.stop(time + dur + 0.05); this._track(o);
    },
    click(time, accent, gain = 0.5, dest) {
      const out = dest || this.master;
      const o = this.ctx.createOscillator(); o.type = "triangle";
      o.frequency.value = accent ? 2000 : 1500;
      const g = this.ctx.createGain();
      o.connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(accent ? gain : gain * 0.6, time + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);
      o.start(time); o.stop(time + 0.05); this._track(o);
    },
    ride(time, gain = 0.12, dest) {
      const out = dest || this.master;
      const dur = 0.18;
      const buf = this._noise();
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
      const g = this.ctx.createGain();
      src.connect(hp); hp.connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(gain, time + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      src.start(time); src.stop(time + dur + 0.02); this._track(src);
    },
    note(time, rootName, semis, oct, dur, gain, dest) {
      const out = dest || this.master;
      const f = mtof(midi(rootName, oct) + semis);
      const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const o2 = this.ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f;
      const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      const g = this.ctx.createGain();
      o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out);
      this._env(g, time, 0.01, dur, gain);
      o.start(time); o2.start(time); o.stop(time + dur + 0.08); o2.stop(time + dur + 0.08);
      this._track(o); this._track(o2);
    },
    _noiseBuf: null,
    _noise() {
      if (this._noiseBuf) return this._noiseBuf;
      const len = this.ctx.sampleRate * 0.3;
      const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this._noiseBuf = b; return b;
    },
    _track(node) { /* fire-and-forget; GC handles it */ },

    // ── transport ───────────────────────────────────────────
    start(opts) {
      this.resume();
      this.stop();
      this.opts = Object.assign({ tempo: 100, key: "C", quality: "maj7", swing: true, ghost: false, countIn: false, bars: 4, sounds: { click: true, chord: true, bass: true }, onBeat: null }, opts);
      this.playing = true;
      this.bar = 0; this.beat = 0; this.eighth = 0;
      this.inCount = this.opts.countIn ? 4 : 0; // count-in quarters remaining
      this.nextTime = this.ctx.currentTime + 0.12;
      this._loop();
    },
    update(patch) { if (this.opts) Object.assign(this.opts, patch); },
    stop() {
      this.playing = false;
      if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    },

    _beatDur() { return 60 / (this.opts.tempo || 100); },
    _swingFrac() { return this.opts.swing ? 0.62 : 0.5; },

    _loop() {
      if (!this.playing) return;
      const ahead = this.ctx.currentTime + 0.13;
      while (this.nextTime < ahead) {
        this._schedule(this.nextTime);
        // advance an eighth
        const bd = this._beatDur();
        if (this.inCount > 0) {
          // count-in is quarter notes
          this.nextTime += bd;
          this.inCount -= 1;
          if (this.inCount === 0) { this.bar = 0; this.beat = 0; this.eighth = 0; }
        } else {
          if (this.eighth === 0) { this.nextTime += this._swingFrac() * bd; this.eighth = 1; }
          else {
            this.nextTime += (1 - this._swingFrac()) * bd; this.eighth = 0; this.beat += 1;
            if (this.beat > 3) { this.beat = 0; this.bar += 1; if (this.bar >= this.opts.bars) this.bar = 0; }
          }
        }
      }
      this.timer = setTimeout(() => this._loop(), 25);
    },

    _uiBeat(time, bar, beat, count) {
      const cb = this.opts.onBeat; if (!cb) return;
      const delay = Math.max(0, (time - this.ctx.currentTime) * 1000);
      setTimeout(() => { if (this.playing) cb(bar, beat, count); }, delay);
    },

    _schedule(time) {
      const o = this.opts, s = o.sounds || {};
      if (this.inCount > 0) {
        // count-in: just clicks
        const accent = this.inCount === 4;
        this.click(time, accent, 0.5);
        this._uiBeat(time, 0, 5 - this.inCount, true);
        return;
      }
      const downbeat = this.eighth === 0;
      const beat = this.beat, bar = this.bar;
      // ride on every eighth (swing feel lives here)
      this.ride(time, downbeat ? 0.14 : 0.09);
      if (downbeat) {
        if (s.click) this.click(time, beat === 0, 0.4);
        if (s.bass) this.bass(time, o.key, this._beatDur() * 0.9, 0.5);
        // comp: Charleston — chord on beat 0, and on the 'and of 2'
        if (s.chord && beat === 0) this.chord(time, o.key, o.quality, this._beatDur() * 2.2, 0.15);
        this._uiBeat(time, bar + 1, beat + 1, false);
      } else {
        // upbeat
        if (s.chord && beat === 1) this.chord(time, o.key, o.quality, this._beatDur() * 1.6, 0.12);
        if (o.ghost) this.note(time, o.key, [0, 3, 5][bar % 3], 4, 0.12, 0.05); // soft ghost
      }
    },

    // ── one-shots / clips ───────────────────────────────────
    stopClips() {
      this.clipSources.forEach((s) => { try { s.stop(); } catch (e) {} });
      this.clipSources = [];
      if (this._clipTimer) { clearTimeout(this._clipTimer); this._clipTimer = null; }
    },
    // play a short musical example for the Hear tab.
    // spec: { feel:'straight'|'swung', kind:'groove'|'scale'|'arpeggio'|'phrase', key, tempo, dur, onEnd }
    playClip(spec) {
      this.resume();
      this.stop();          // stop any transport
      this.stopClips();
      const key = spec.key || "C";
      const tempo = spec.tempo || (spec.feel === "straight" ? 100 : 116);
      const swing = spec.feel !== "straight";
      const bd = 60 / tempo;
      const swF = swing ? 0.62 : 0.5;
      const dur = spec.dur || 12;
      const t0 = this.ctx.currentTime + 0.08;
      const bars = Math.max(2, Math.ceil(dur / (bd * 4)));
      const scale = spec.kind === "arpeggio" ? SCALES.maj7arp : (spec.kind === "pent" ? SCALES.pent : SCALES.blues);

      let melodyIx = 0;
      const melodyPattern = spec.kind === "scale"
        ? [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1] // up & down the scale
        : spec.kind === "arpeggio"
          ? [0, 1, 2, 3, 4, 3, 2, 1]
          : [0, 2, 3, 2, 4, 3, null, 1]; // a loose phrase with a rest

      // collect via a temp gain we can also use; sources auto-tracked into clipSources
      const track = (n) => { this.clipSources.push(n); return n; };
      const mkChord = (time, d, g) => {
        const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
        const bus = this.ctx.createGain(); bus.connect(lp); lp.connect(this.master);
        this._env(bus, time, 0.012, d, g);
        (CHORD[spec.quality] || CHORD.maj7).forEach((s, i) => {
          const f = mtof(midi(key, 4) + s);
          const o1 = this.ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = f;
          const vg = this.ctx.createGain(); vg.gain.value = i === 0 ? 0.9 : 0.65; o1.connect(vg); vg.connect(bus);
          o1.start(time); o1.stop(time + d + 0.1); track(o1);
        });
      };
      const mkBass = (time, d) => {
        const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = mtof(midi(key, 2));
        const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
        const g = this.ctx.createGain(); o.connect(lp); lp.connect(g); g.connect(this.master);
        this._env(g, time, 0.008, d, 0.45); o.start(time); o.stop(time + d + 0.05); track(o);
      };
      const mkClick = (time, accent) => {
        const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = accent ? 2000 : 1500;
        const g = this.ctx.createGain(); o.connect(g); g.connect(this.master);
        g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(accent ? 0.35 : 0.22, time + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.035); o.start(time); o.stop(time + 0.05); track(o);
      };
      const mkRide = (time, g) => {
        const src = this.ctx.createBufferSource(); src.buffer = this._noise();
        const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
        const ga = this.ctx.createGain(); src.connect(hp); hp.connect(ga); ga.connect(this.master);
        ga.gain.setValueAtTime(0.0001, time); ga.gain.exponentialRampToValueAtTime(g, time + 0.005);
        ga.gain.exponentialRampToValueAtTime(0.0001, time + 0.18); src.start(time); src.stop(time + 0.2); track(src);
      };
      const mkNote = (time, semi, d, g) => {
        const f = mtof(midi(key, 4) + semi);
        const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
        const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
        const ga = this.ctx.createGain(); o.connect(lp); lp.connect(ga); ga.connect(this.master);
        this._env(ga, time, 0.01, d, g); o.start(time); o.stop(time + d + 0.08); track(o);
      };

      for (let b = 0; b < bars; b++) {
        for (let beat = 0; beat < 4; beat++) {
          const tDown = t0 + (b * 4 + beat) * bd;
          mkRide(tDown, 0.13);
          mkClick(tDown, beat === 0);
          mkBass(tDown, bd * 0.9);
          if (beat === 0) mkChord(tDown, bd * 2.2, 0.14);
          if (beat === 1) mkChord(tDown + swF * bd, bd * 1.6, 0.11);
          // upbeat ride
          mkRide(tDown + swF * bd, 0.08);
          // melody: scale/arpeggio/phrase — one note per beat (and offbeat for phrases)
          if (spec.kind === "scale" || spec.kind === "arpeggio") {
            const deg = melodyPattern[melodyIx % melodyPattern.length]; melodyIx++;
            mkNote(tDown, scale[deg % scale.length], bd * 0.8, 0.18);
          } else if (spec.kind === "phrase" || spec.kind === "solo") {
            const deg = melodyPattern[(b * 4 + beat) % melodyPattern.length];
            if (deg != null) mkNote(tDown + (beat % 2 ? swF * bd : 0), SCALES.blues[deg % SCALES.blues.length], bd * 0.7, 0.17);
          }
        }
      }
      this._clipTimer = setTimeout(() => { this.stopClips(); if (spec.onEnd) spec.onEnd(); }, dur * 1000);
      return { stop: () => this.stopClips() };
    },

    // a short melodic "take" for record-yourself playback
    playPhrase(key, onEnd) {
      this.resume(); this.stop(); this.stopClips();
      const bd = 0.5, t0 = this.ctx.currentTime + 0.05;
      const degs = [0, 2, 3, 4, 3, 2, 0, null, 2, 3, 4];
      degs.forEach((d, i) => { if (d != null) this.note(t0 + i * bd, SCALES.blues[d], 4, bd * 0.8, 0.2); });
      const dur = degs.length * bd + 0.3;
      this._clipTimer = setTimeout(() => { if (onEnd) onEnd(); }, dur * 1000);
      return { stop: () => { this.stopClips(); } };
    },
  };

  window.JazzAudio = A;
})();
