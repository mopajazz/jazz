/* Jazz Interactive — shared audio engine for the lesson pages.
   The same sound as the practice page (07): a modelled piano, a plucked
   upright bass and a small room, all synthesised with no audio files.

     JIAudio.ctx()                       the AudioContext (made on first use)
     JIAudio.bus()                       master input, for anything extra
     JIAudio.piano(freq, t, dur, vel)    one piano note; vel ~0.85 is a comping touch
     JIAudio.bass(freq, t, dur, vel)     bass note on the pitch class of freq,
                                         placed in the E2–D♯3 register
     JIAudio.warm()                      render notes ahead of time (runs on load)
*/
(function () {
  let ctx = null, masterBus = null, pianoBus = null, bassBus = null;
  let pianoBufs = {}, bassBufs = {}, pianoFloorWave = null, pianoFloorScale = 1;

  function ensureCtx() {
    if (!ctx) initAudioGraph(new (window.AudioContext || window.webkitAudioContext)());
    return ctx;
  }

  // Called from a click, so the browser lets the context start
  function getCtx() {
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Piano and bass each get their own bus, plus a send into a small room.
  function initAudioGraph(c) {
    ctx = c;
    pianoBufs = {}; bassBufs = {};
    makePianoFloor();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.18;
    // About 4dB above the practice page: the lessons are often heard on a
    // laptop or phone speaker, and a busy lick over a chord still peaks
    // under 0.8.
    const out = ctx.createGain();
    out.gain.value = 1.1;
    comp.connect(out); out.connect(ctx.destination);
    masterBus = comp;

    const room = ctx.createConvolver();
    room.buffer = makeRoomIR();
    room.connect(comp);

    pianoBus = ctx.createGain();
    pianoBus.connect(comp);
    const pianoSend = ctx.createGain();
    pianoSend.gain.value = 0.25;
    pianoBus.connect(pianoSend); pianoSend.connect(room);

    // Upright body: a bump around 100Hz, and a finger's rounded top end
    const body = ctx.createBiquadFilter();
    body.type = 'peaking'; body.frequency.value = 100; body.Q.value = 1.2; body.gain.value = 3;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 1800; tone.Q.value = 0.5;
    body.connect(tone); tone.connect(comp);
    const bassSend = ctx.createGain();
    bassSend.gain.value = 0.08;
    tone.connect(bassSend); bassSend.connect(room);
    bassBus = body;
  }

  // Room reverb from a generated impulse: decaying noise that gets darker as
  // it dies, about 1.2s long.
  function makeRoomIR() {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * 1.2), pre = Math.floor(rate * 0.012);
    const ir = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const t = (i - pre) / rate;
        const k = Math.min(0.9, 0.2 + t * 0.9);
        lp += (1 - k) * ((Math.random() * 2 - 1) - lp);
        d[i] = lp * Math.exp(-t * 5.5);
      }
    }
    return ir;
  }

  function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function freqMidi(f) { return Math.round(69 + 12 * Math.log2(f / 440)); }

  /* ── Piano ──
     Each note is six partials. A real string is a little stiff, so its upper
     partials run slightly sharp, and they die faster than the fundamental, so
     the note darkens as it rings. Partials 1–2 get a quieter twin about a
     cent off, like the unison strings on one key. Rendered once per pitch
     into a buffer; one plain oscillator underneath holds a quiet floor so a
     long chord stays audible. */
  // [amplitude, prompt decay (s), tail decay (s), tail floor]
  const PIANO_PARTIALS = [
    [1.00, 0.30, 1.6, 0.22],
    [0.55, 0.22, 1.2, 0.10],
    [0.30, 0.15, 0.9, 0.03],
    [0.18, 0.10, 0.6, 0],
    [0.10, 0.07, 0.4, 0],
    [0.05, 0.05, 0.3, 0],
  ];
  const PIANO_STIFFNESS = 0.0004;
  const PIANO_LEVEL = 0.067;
  const PIANO_BUF_SEC = 3.5;

  function makePianoFloor() {
    const real = new Float32Array(4), imag = new Float32Array(4);
    PIANO_PARTIALS.slice(0, 3).forEach(([amp, , , floor], i) => { imag[i + 1] = amp * floor; });
    pianoFloorWave = ctx.createPeriodicWave(real, imag);
    // the browser scales the wave to a peak of 1; find the true peak to undo that
    let pk = 0;
    for (let s = 0; s < 2048; s++) {
      const ph = 2 * Math.PI * s / 2048;
      pk = Math.max(pk, Math.abs(imag[1] * Math.sin(ph) + imag[2] * Math.sin(2 * ph) + imag[3] * Math.sin(3 * ph)));
    }
    pianoFloorScale = pk;
  }

  function pianoBuffer(midi) {
    if (pianoBufs[midi]) return pianoBufs[midi];
    const freq = midiFreq(midi);
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * PIANO_BUF_SEC);
    const buf = ctx.createBuffer(1, len, rate);
    const out = buf.getChannelData(0);
    const atk = Math.floor(rate * 0.003);

    PIANO_PARTIALS.forEach(([amp, prompt, tail, floor], i) => {
      const n = i + 1;
      const f = n * freq * Math.sqrt(1 + PIANO_STIFFNESS * n * n);
      if (f > rate * 0.45) return;
      const voices = [[f, amp]];
      if (n <= 2) {
        const cents = (0.4 + Math.random() * 0.8) * (Math.random() < 0.5 ? -1 : 1);
        voices.push([f * Math.pow(2, cents / 1200), amp * 0.35]);
      }
      const t2 = atk + Math.floor(rate * prompt * 3);
      const kPrompt = Math.exp(-1 / (rate * prompt)), kTail = Math.exp(-1 / (rate * tail));
      voices.forEach(([vf, va]) => {
        const w = 2 * Math.PI * vf / rate, c2 = 2 * Math.cos(w);
        let prev = -Math.sin(w), cur = 0, env = 0; // sine by recurrence
        for (let s = 0; s < len; s++) {
          if (s < atk) env = s / atk;
          else if (s < t2) env = 0.4 + (env - 0.4) * kPrompt;
          else env = floor + (env - floor) * kTail;
          out[s] += va * (env - floor * (s < atk ? s / atk : 1)) * cur;
          const next = c2 * cur - prev; prev = cur; cur = next;
        }
      });
    });

    // hammer: a very short knock of band-passed noise
    const w0 = 2 * Math.PI * Math.min(freq * 5, 6000) / rate, alpha = Math.sin(w0) / 1.4;
    const b0 = alpha / (1 + alpha), a1 = -2 * Math.cos(w0) / (1 + alpha), a2 = (1 - alpha) / (1 + alpha);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const hAtk = rate * 0.001;
    for (let s = 0, m = Math.floor(rate * 0.05); s < m; s++) {
      const x = Math.random() * 2 - 1;
      const y = b0 * (x - x2) - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      out[s] += 0.6 * y * (s < hAtk ? s / hAtk : Math.exp(-(s - hAtk) / (rate * 0.008)));
    }

    // the tail hands off smoothly to the floor; stored relative to the floor's level
    const fade = Math.floor(rate * 0.4);
    for (let s = 0; s < fade; s++) out[len - 1 - s] *= s / fade;
    for (let s = 0; s < len; s++) out[s] /= pianoFloorScale;
    return (pianoBufs[midi] = buf);
  }

  function piano(freq, t, dur, vel) {
    const c = getCtx();
    if (vel == null) vel = 0.85;
    const midi = freqMidi(freq);
    const end = t + Math.max(dur, 0.1);
    const note = c.createGain();
    note.gain.setValueAtTime(PIANO_LEVEL * vel * pianoFloorScale, t);
    note.gain.setTargetAtTime(0, end, 0.12); // dampers down
    note.connect(pianoBus);

    const src = c.createBufferSource();
    src.buffer = pianoBuffer(midi);
    src.connect(note);
    src.start(t); src.stop(end + 0.9);

    const floor = c.createOscillator();
    floor.setPeriodicWave(pianoFloorWave);
    floor.frequency.value = midiFreq(midi);
    floor.connect(note);
    floor.start(t); floor.stop(end + 0.9);
  }

  /* ── Bass ──
     Karplus–Strong plucked string: a pluck travels around a loop one period
     long, losing a little energy each trip, more in the highs. Tuned with an
     allpass so pitch is exact. Rendered once per pitch and cached. */
  const BASS_BUF_SEC = 4;
  const BASS_T60 = 3.5;      // seconds for the fundamental to die away
  const BASS_TOP_T60 = 0.45; // seconds for the overtones around 1kHz
  const BASS_LEVEL = 0.56;

  function bassBuffer(midi) {
    if (bassBufs[midi]) return bassBufs[midi];
    const freq = midiFreq(midi);
    const rate = ctx.sampleRate;
    const period = rate / freq;
    const ring = (T) => Math.pow(10, -3 / (T * freq)); // loop gain per trip for a T60 of T
    const lpGain = (p, w) => (1 - p) / Math.sqrt((1 - p) * (1 - p) + 2 * p * (1 - Math.cos(w)));

    // loop lowpass: choose the pole that gives ~1kHz its ring time
    const w1 = 2 * Math.PI * 1000 / rate;
    let lo = 0, hi = 0.999, p = 0.5;
    for (let k = 0; k < 40; k++) {
      p = (lo + hi) / 2;
      if (lpGain(p, w1) > ring(BASS_TOP_T60)) lo = p; else hi = p;
    }
    const w0 = 2 * Math.PI * freq / rate;
    const lpDelay = Math.atan2(p * Math.sin(w0), 1 - p * Math.cos(w0)) / w0;
    const N = Math.floor(period - lpDelay) - 1;
    const d = period - lpDelay - N; // the leftover 1–2 samples go to the allpass
    const C = (1 - d) / (1 + d);
    const rho = Math.min(0.9999, ring(BASS_T60) / lpGain(p, w0));

    // the pluck: a finger pulls the string about a fifth of the way from the bridge
    const line = new Float32Array(N);
    const pos = 0.22;
    let mean = 0;
    for (let i = 0; i < N; i++) {
      const x = i / N;
      line[i] = (x < pos ? x / pos : (1 - x) / (1 - pos)) + (Math.random() * 2 - 1) * 0.1;
      mean += line[i];
    }
    mean /= N;
    for (let i = 0; i < N; i++) line[i] -= mean;

    const len = Math.floor(rate * BASS_BUF_SEC);
    const buf = ctx.createBuffer(1, len, rate);
    const out = buf.getChannelData(0);
    let idx = 0, lp = 0, apIn = 0, apOut = 0;
    for (let n = 0; n < len; n++) {
      const x = line[idx];
      out[n] = x;
      lp = (1 - p) * x + p * lp;
      apOut = C * lp + apIn - C * apOut;
      apIn = lp;
      line[idx] = rho * apOut;
      idx = idx + 1 === N ? 0 : idx + 1;
    }

    // finger meeting string: a short, low knock
    let th = 0;
    for (let n = 0, m = Math.floor(rate * 0.04); n < m; n++) {
      th += 0.05 * ((Math.random() * 2 - 1) - th);
      out[n] += th * 1.5 * Math.exp(-n / (rate * 0.008));
    }
    const fadeIn = Math.floor(rate * 0.002), fadeOut = Math.floor(rate * 0.03);
    for (let n = 0; n < fadeIn; n++) out[n] *= n / fadeIn;
    for (let n = 0; n < fadeOut; n++) out[len - 1 - n] *= n / fadeOut;
    let peak = 0;
    for (let n = 0; n < len; n++) peak = Math.max(peak, Math.abs(out[n]));
    for (let n = 0; n < len; n++) out[n] /= peak;
    return (bassBufs[midi] = buf);
  }

  // E2 up to D♯3: low enough to be a bass, high enough that a phone speaker
  // still carries it
  function bassMidi(freq) {
    const pc = ((freqMidi(freq) % 12) + 12) % 12;
    const m = 48 + pc;
    return m > 51 ? m - 12 : m;
  }

  function bass(freq, t, dur, vel) {
    const c = getCtx();
    if (vel == null) vel = 1;
    const src = c.createBufferSource();
    src.buffer = bassBuffer(bassMidi(freq));
    // plucked firmly, a string starts a hair sharp and settles
    src.playbackRate.setValueAtTime(1.004, t);
    src.playbackRate.linearRampToValueAtTime(1, t + 0.08);
    const g = c.createGain();
    const end = t + Math.max(dur, 0.3);
    g.gain.setValueAtTime(BASS_LEVEL * vel * (0.94 + Math.random() * 0.08), t);
    g.gain.setTargetAtTime(0, end, 0.04);
    src.connect(g); g.connect(bassBus);
    src.start(t);
    src.stop(end + 0.3);
  }

  // Each note is built once, which takes a moment. Build the lessons' whole
  // range a pitch at a time after the page loads, so the first play of a
  // phrase doesn't stall or drift while its notes are made. The context is
  // made here but stays suspended until the first click.
  const WARM_BASS = [40, 51], WARM_PIANO = [48, 88]; // E2–D♯3; C3–E6
  const queue = [];
  let draining = false, warmed = false;
  function warm() {
    if (warmed) return;
    warmed = true;
    try { ensureCtx(); } catch (e) { return; }
    for (let m = WARM_BASS[0]; m <= WARM_BASS[1]; m++) queue.push(bassBuffer.bind(null, m));
    // middle of the keyboard first: that's where chords and tunes start
    const keys = [];
    for (let m = WARM_PIANO[0]; m <= WARM_PIANO[1]; m++) keys.push(m);
    keys.sort((a, b) => Math.abs(a - 64) - Math.abs(b - 64));
    keys.forEach(m => queue.push(pianoBuffer.bind(null, m)));
    if (!draining) drain();
  }
  function drain() {
    const job = queue.shift();
    if (!job) { draining = false; return; }
    draining = true;
    job();
    setTimeout(drain, 0);
  }

  if (document.readyState === 'complete') setTimeout(warm, 300);
  else window.addEventListener('load', () => setTimeout(warm, 300));

  window.JIAudio = {
    ctx: getCtx,
    bus: function () { getCtx(); return masterBus; },
    piano: piano,
    bass: bass,
    warm: warm,
  };
})();
