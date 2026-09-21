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
  const [recError, setRecError] = uS(null);
  const [takeUrl, setTakeUrl] = uS(null);
  const [playingTake, setPlayingTake] = uS(false);
  const [section, setSection] = uS(0); // 0=Head, 1=Solo 1, 2=Solo 2 (capstone only)

  const mediaRecorderRef = uR(null);
  const mediaStreamRef = uR(null);
  const chunksRef = uR([]);
  const takeAudioRef = uR(null);
  const takeUrlRef = uR(null);
  uE(() => { takeUrlRef.current = takeUrl; }, [takeUrl]);

  const totalBars = cfg.sections ? 36 : 4; // 3 choruses of the same 12-bar blues form
  const swing = variation !== "Straight 8ths";
  const ghost = variation === "Add Ghost Notes";
  const A = window.JazzAudio;
  const loopStart = cfg.sections ? section * 12 : 0;
  const loopEnd = cfg.sections ? loopStart + 12 : totalBars;

  // Start / stop the audio transport
  uE(() => {
    if (!A) return;
    if (playing) {
      A.start({
        tempo, key, quality: "maj7", swing, ghost, countIn, bars: totalBars, sounds,
        progression: cfg.sections ? "blues12" : null, loopStart, loopEnd,
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
    if (A && playing) A.update({ tempo, key, swing, ghost, sounds, loopStart, loopEnd });
  }, [tempo, key, swing, ghost, sounds, playing, loopStart, loopEnd]);

  const jumpToSection = (i) => {
    setSection(i);
    setBar(1);
    if (A && playing) A.seek(i * 12);
  };

  const nearestPreset = TEMPO_PRESETS.reduce((a, b) => Math.abs(b.bpm - tempo) < Math.abs(a.bpm - tempo) ? b : a);

  const toggleSound = (k) => setSounds((s) => ({ ...s, [k]: !s[k] }));

  // For the capstone's 12-bar blues, show the chord actually sounding this
  // bar instead of a fixed symbol; every other module keeps the old maj7 display.
  const barInChorus = cfg.sections ? ((bar - 1) % 12 + 12) % 12 : null;
  const chordNow = cfg.sections && A ? A.chordForBar(key, barInChorus) : { root: key, quality: "maj7" };
  const chordQLabel = chordNow.quality === "dom7" ? "7" : chordNow.quality;
  const displayBar = cfg.sections ? barInChorus + 1 : bar;
  const displayTotal = cfg.sections ? 12 : totalBars;

  const doRecord = async () => {
    if (recording) {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
      return;
    }
    setRecError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
        setTakeUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
        setRecording(false);
      };
      if (takeUrlRef.current) { URL.revokeObjectURL(takeUrlRef.current); setTakeUrl(null); }
      mr.start();
      setRecording(true);
      if (!playing) setPlaying(true);
    } catch (err) {
      setRecError(
        err && err.name === "NotAllowedError"
          ? "Microphone access was denied. Allow microphone access in your browser to record."
          : "Couldn't access the microphone on this device."
      );
    }
  };

  // Play back the actual recorded take
  uE(() => {
    const el = takeAudioRef.current;
    if (!el) return;
    if (playingTake) {
      if (playing) setPlaying(false);
      el.currentTime = 0;
      el.play().catch(() => setPlayingTake(false));
    } else {
      el.pause();
    }
    // eslint-disable-next-line
  }, [playingTake]);

  // Release the mic and any object URL if the module changes or this unmounts
  uE(() => {
    return () => {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
    };
  }, []);

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
            <div className="np-chord">{chordNow.root}<span className="np-chord-q">{chordQLabel}</span></div>
            <div className="np-bar">{counting ? "Count-in\u2026" : "Bar " + displayBar + " of " + displayTotal}</div>
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
          <button className="transport-btn ghost wide" onClick={() => { setPlaying(false); setBar(1); setBeat(0); setSection(0); }}>
            <window.Icons.Reset size={18} /><span>Reset</span>
          </button>
        </div>
        {cfg.sections && (
          <div className="loop-row">
            <span className="loop-label">Loop section</span>
            <div className="loop-segs">
              {["Head", "Solo 1", "Solo 2"].map((label, i) => (
                <button key={label} className={"loop-seg" + (section === i ? " is-active" : "")}
                  onClick={() => jumpToSection(i)} aria-pressed={section === i}>
                  {label}
                </button>
              ))}
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
              <span>{recording ? "Stop & save take" : takeUrl ? "Record again" : "Record yourself"}</span>
            </button>
            <span className="record-note">
              {recError ? recError : recording ? "Recording… play along with the track." : "Capture a take and play it back against the groove."}
            </span>
          </div>
          {takeUrl && !recording && (
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
              <audio ref={takeAudioRef} src={takeUrl} onEnded={() => setPlayingTake(false)} style={{ display: "none" }} />
            </div>
          )}
        </div>
      )}

      <p className="player-foot"><window.Icons.Dot size={10} /> Audio is synthesized live in your browser — click, chord &amp; bass with a swung ride.</p>
    </div>
  );
}

window.Player = Player;
