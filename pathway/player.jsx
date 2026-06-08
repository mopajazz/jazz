// Interactive player — synthesized audio via window.JazzAudio.
const { useState: uS, useRef: uR, useEffect: uE } = React;

const TEMPO_PRESETS = [
  { bpm: 60, name: "Ballad" },
  { bpm: 100, name: "Med slow" },
  { bpm: 140, name: "Medium" },
  { bpm: 180, name: "Up" },
  { bpm: 240, name: "Burning" },
];

function Player({ module }) {
  const cfg = module.play;
  const [key, setKey] = uS(cfg.keys[0]);
  const [tempo, setTempo] = uS(cfg.tempoStart);
  const [variation, setVariation] = uS(cfg.variations[0]);
  const [playing, setPlaying] = uS(false);
  const [bar, setBar] = uS(1);
  const [beat, setBeat] = uS(0);
  const [counting, setCounting] = uS(false);
  const [countIn, setCountIn] = uS(true);
  const [sounds, setSounds] = uS({ click: true, chord: true, bass: true });
  const [recording, setRecording] = uS(false);
  const [hasTake, setHasTake] = uS(false);
  const [playingTake, setPlayingTake] = uS(false);

  const totalBars = cfg.sections ? 12 : 4;
  const swing = variation !== "Straight 8ths";
  const ghost = variation === "Add Ghost Notes";
  const A = window.JazzAudio;

  // Start / stop the audio transport
  uE(() => {
    if (!A) return;
    if (playing) {
      A.start({
        tempo, key, quality: "maj7", swing, ghost, countIn, bars: totalBars, sounds,
        onBeat: (br, bt, isCount) => { setCounting(!!isCount); setBar(br || 1); setBeat(bt); },
      });
    } else {
      A.stop();
      setCounting(false); setBeat(0);
    }
    return () => { if (A) A.stop(); };
    // eslint-disable-next-line
  }, [playing]);

  // Live-update the running transport when controls change
  uE(() => {
    if (A && playing) A.update({ tempo, key, swing, ghost, sounds });
  }, [tempo, key, swing, ghost, sounds, playing]);

  const nearestPreset = TEMPO_PRESETS.reduce((a, b) => Math.abs(b.bpm - tempo) < Math.abs(a.bpm - tempo) ? b : a);

  const toggleSound = (k) => setSounds((s) => ({ ...s, [k]: !s[k] }));

  const doRecord = () => {
    if (recording) { setRecording(false); setHasTake(true); }
    else { setRecording(true); setHasTake(false); if (!playing) setPlaying(true); }
  };

  // Play back the recorded take (a synth phrase) against silence
  uE(() => {
    if (!A) return;
    if (playingTake) {
      if (playing) setPlaying(false);
      A.playPhrase(key, () => setPlayingTake(false));
    }
    // eslint-disable-next-line
  }, [playingTake]);

  return (
    <div className="player">
      {/* Now playing */}
      <div className="player-stage">
        <div className="player-stage-top">
          <span className="np-label">Now playing</span>
          <span className="np-feel">{key} · {cfg.backing.split("—")[0].trim()}</span>
        </div>
        <div className="np-display">
          <button className="transport-btn ghost" onClick={() => setBar(b => b <= 1 ? totalBars : b - 1)} aria-label="Previous bar">
            <window.Icons.ArrowLeft size={20} />
          </button>
          <div className="np-center">
            <div className="np-chord">{key}<span className="np-chord-q">maj7</span></div>
            <div className="np-bar">{counting ? "Count-in\u2026" : "Bar " + bar + " of " + totalBars}</div>
            <div className="np-beats">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={"np-beat" + (playing && beat === n ? " is-on" : "") + (counting ? " is-count" : "")} />
              ))}
            </div>
          </div>
          <button className="transport-btn ghost" onClick={() => setBar(b => b >= totalBars ? 1 : b + 1)} aria-label="Next bar">
            <window.Icons.ArrowRight size={20} />
          </button>
        </div>
        <div className="transport-row">
          <button className={"transport-btn play" + (playing ? " is-playing" : "")} onClick={() => setPlaying(p => !p)}>
            {playing ? <window.Icons.Pause size={20} /> : <window.Icons.Play size={20} />}
            <span>{playing ? "Stop" : "Play"}</span>
          </button>
          <button className="transport-btn ghost wide" onClick={() => { setPlaying(false); setBar(1); setBeat(0); }}>
            <window.Icons.Reset size={18} /><span>Reset</span>
          </button>
        </div>
        {cfg.sections && (
          <div className="loop-row">
            <span className="loop-label">Loop section</span>
            <div className="loop-segs">
              <span className="loop-seg is-active">Head</span>
              <span className="loop-seg">Solo 1</span>
              <span className="loop-seg">Solo 2</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="player-controls">
        {/* Tempo */}
        <div className="ctrl">
          <div className="ctrl-head">
            <span className="ctrl-label"><window.Icons.Metronome size={15} />Tempo</span>
            <span className="ctrl-value">{tempo}<span className="ctrl-unit">bpm · {nearestPreset.name}</span></span>
          </div>
          <input type="range" className="slider" min={cfg.tempoMin} max={cfg.tempoMax} value={tempo}
            onChange={(e) => setTempo(+e.target.value)} />
          <div className="preset-row">
            {TEMPO_PRESETS.filter(p => p.bpm >= cfg.tempoMin && p.bpm <= cfg.tempoMax).map((p) => (
              <button key={p.bpm} className={"preset" + (Math.abs(tempo - p.bpm) < 6 ? " is-active" : "")}
                onClick={() => setTempo(p.bpm)}>
                <span className="preset-bpm">{p.bpm}</span><span className="preset-name">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transposition rail */}
        <div className="ctrl">
          <div className="ctrl-head">
            <span className="ctrl-label">Key</span>
            <span className="ctrl-hint">Beginner keys</span>
          </div>
          <div className="key-rail">
            {cfg.keys.map((k) => (
              <button key={k} className={"key-btn" + (key === k ? " is-active" : "")} onClick={() => setKey(k)}>{k}</button>
            ))}
            <span className="key-rail-locked" title="More keys unlock as you progress">
              <window.Icons.Lock size={13} /> +9 keys
            </span>
          </div>
        </div>

        {/* Variations */}
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-label">Variation</span></div>
          <div className="seg-row">
            {cfg.variations.map((v) => (
              <button key={v} className={"seg" + (variation === v ? " is-active" : "")} onClick={() => setVariation(v)}>{v}</button>
            ))}
          </div>
        </div>

        {/* Sound toggles + count-in */}
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-label">Sound</span></div>
          <div className="toggle-row">
            {[["click", "Click"], ["chord", "Chord"], ["bass", "Bass"]].map(([k, lbl]) => (
              <button key={k} className={"toggle" + (sounds[k] ? " is-on" : "")} onClick={() => toggleSound(k)}>
                <span className="toggle-dot" />{lbl}
              </button>
            ))}
            <button className={"toggle" + (countIn ? " is-on" : "")} onClick={() => setCountIn(c => !c)}>
              <span className="toggle-dot" />Count-in
            </button>
          </div>
        </div>
      </div>

      {/* Record yourself */}
      {cfg.record && (
        <div className="record">
          <div className="record-main">
            <button className={"rec-btn" + (recording ? " is-recording" : "")} onClick={doRecord}>
              <window.Icons.Mic size={18} />
              <span>{recording ? "Stop & save take" : hasTake ? "Record again" : "Record yourself"}</span>
            </button>
            <span className="record-note">{recording ? "Recording… play along with the track." : "Capture a take and play it back against the groove."}</span>
          </div>
          {hasTake && !recording && (
            <div className="take">
              <button className={"take-play" + (playingTake ? " is-playing" : "")} onClick={() => setPlayingTake(p => !p)}>
                {playingTake ? <window.Icons.Pause size={16} /> : <window.Icons.Play size={16} />}
              </button>
              <div className="take-wave" aria-hidden="true">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span key={i} className={playingTake ? "is-live" : ""} style={{ height: (15 + Math.abs(Math.sin(i * 0.7)) * 70) + "%", animationDelay: (i * 30) + "ms" }} />
                ))}
              </div>
              <span className="take-label">Your take</span>
            </div>
          )}
        </div>
      )}

      <p className="player-foot"><window.Icons.Dot size={10} /> Audio is synthesized live in your browser — click, chord &amp; bass with a swung ride.</p>
    </div>
  );
}

window.Player = Player;
