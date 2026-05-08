// 07-practice-tweaks.jsx
// Tweaks panel for the Practice Tools page. The page itself is plain JS — this
// React island lives entirely inside #tweaks-root and just calls the page's
// existing setTempo / setCycle / setQuality / setBars and toggles the sound
// checkboxes. Defaults are sourced from the EDITMODE-marked JSON below so the
// host can persist edits to disk.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "startTempo": 120,
  "startCycle": "fourths",
  "startQuality": "ii-V-I",
  "startBars": 2,
  "soundClick": true,
  "soundChord": true,
  "soundBass": true,
  "soundCountin": false,
  "accent": "rouge",
  "displayFont": "playfair",
  "showHints": true,
  "showCycleRail": true,
  "panelDensity": "regular"
}/*EDITMODE-END*/;

// ── accent + font theming ────────────────────────────────────────────────
const ACCENTS = {
  rouge:  { rouge: '#7d1f2c', gold: '#b97824', goldDeep: '#6e3f12', green: '#1f5a4b' },
  indigo: { rouge: '#2c3e7d', gold: '#7a6a2a', goldDeep: '#3f4a12', green: '#1f4a5a' },
  teal:   { rouge: '#0f5f5b', gold: '#b97824', goldDeep: '#6e3f12', green: '#1f5a4b' },
  ember:  { rouge: '#9c3416', gold: '#c89324', goldDeep: '#6e3f12', green: '#3a5a1f' },
  noir:   { rouge: '#2a2a2a', gold: '#8a7e64', goldDeep: '#3a3328', green: '#3a3a3a' },
};
const FONT_STACKS = {
  playfair: '"Playfair Display", Georgia, serif',
  serif:    'Georgia, "Iowan Old Style", "Times New Roman", serif',
  grotesk:  '"Inter", "Helvetica Neue", Arial, sans-serif',
  mono:     '"DM Mono", "SFMono-Regular", Consolas, monospace',
};

function applyTweaks(t) {
  const root = document.documentElement;
  const a = ACCENTS[t.accent] || ACCENTS.rouge;
  root.style.setProperty('--rouge', a.rouge);
  root.style.setProperty('--gold', a.gold);
  root.style.setProperty('--gold-deep', a.goldDeep);
  root.style.setProperty('--green', a.green);
  root.style.setProperty('--display', FONT_STACKS[t.displayFont] || FONT_STACKS.playfair);

  // hint row + cycle rail visibility
  document.querySelectorAll('.hint-row').forEach(el => {
    el.style.display = t.showHints ? '' : 'none';
  });
  const rail = document.querySelector('.cycle-rail');
  if (rail) rail.style.display = t.showCycleRail ? '' : 'none';

  // density (compresses panel padding + chord card)
  document.body.dataset.density = t.panelDensity;
}

// inject density CSS once
(function injectDensityCSS() {
  if (document.getElementById('twk-density-css')) return;
  const s = document.createElement('style');
  s.id = 'twk-density-css';
  s.textContent = `
    body[data-density="compact"] .panel { padding: 1.1rem 1.25rem; }
    body[data-density="compact"] .chord-now { padding: 1.4rem 1.5rem 1.25rem; }
    body[data-density="compact"] .chord-symbol-xl { font-size: clamp(3.4rem, 9vw, 5.8rem); }
    body[data-density="compact"] .control-group { margin-bottom: .9rem; }
    body[data-density="comfy"] .panel { padding: 2.1rem 2.4rem; }
    body[data-density="comfy"] .chord-now { padding: 2.6rem 2.6rem 2.2rem; }
    body[data-density="comfy"] .control-group { margin-bottom: 1.8rem; }
  `;
  document.head.appendChild(s);
})();

function PracticeTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme + visibility live
  React.useEffect(() => { applyTweaks(t); }, [t]);

  // When defaults change (e.g. user persisted them), push into the page state
  // ONLY on the very first render — after that, the user's live interactions
  // with the page's own controls are authoritative. We don't want every
  // accent-swatch click to also reset the chord position.
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (typeof setCycle === 'function')   setCycle(t.startCycle);
    if (typeof setQuality === 'function') setQuality(t.startQuality);
    if (typeof setBars === 'function')    setBars(t.startBars);
    if (typeof setTempo === 'function')   setTempo(t.startTempo);
    // sound toggles
    const sync = (id, on) => {
      const el = document.getElementById(id);
      if (el && el.checked !== on) {
        el.checked = on;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    sync('t-click',   t.soundClick);
    sync('t-chord',   t.soundChord);
    sync('t-bass',    t.soundBass);
    sync('t-countin', t.soundCountin);
  }, [t.startCycle, t.startQuality, t.startBars, t.startTempo,
      t.soundClick, t.soundChord, t.soundBass, t.soundCountin]);

  // Helpers that update the page AND persist the value
  const onTempo = (v) => { setTweak('startTempo', v); if (typeof setTempo === 'function') setTempo(v); };
  const onCycle = (v) => { setTweak('startCycle', v); if (typeof setCycle === 'function') setCycle(v); };
  const onQuality = (v) => { setTweak('startQuality', v); if (typeof setQuality === 'function') setQuality(v); };
  const onBars = (v) => { setTweak('startBars', Number(v)); if (typeof setBars === 'function') setBars(Number(v)); };
  const onSound = (k, key, on) => {
    setTweak(key, on);
    const el = document.getElementById('t-' + k);
    if (el) { el.checked = on; el.dispatchEvent(new Event('change', { bubbles: true })); }
  };

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Practice defaults" />
      <TweakSlider label="Tempo" value={t.startTempo} min={40} max={280} unit=" bpm"
                   onChange={onTempo} />
      <TweakSelect label="Cycle" value={t.startCycle}
                   options={[
                     { value: 'fourths',         label: 'Cycle of Fourths' },
                     { value: 'fifths',          label: 'Cycle of Fifths'  },
                     { value: 'chromatic',       label: 'Chromatic ↑'      },
                     { value: 'chromatic-down',  label: 'Chromatic ↓'      },
                   ]}
                   onChange={onCycle} />
      <TweakSelect label="Quality" value={t.startQuality}
                   options={[
                     { value: 'ii-V-I', label: 'ii–V–I' },
                     { value: 'maj7',   label: 'maj7'   },
                     { value: 'dom7',   label: '7'      },
                     { value: 'm7',     label: 'm7'     },
                     { value: 'm7b5',   label: 'm7♭5'   },
                     { value: 'dim7',   label: '°7'     },
                   ]}
                   onChange={onQuality} />
      <TweakRadio label="Bars / chord" value={String(t.startBars)}
                  options={['1','2','4','8']}
                  onChange={onBars} />

      <TweakSection label="Sound" />
      <TweakToggle label="Click"    value={t.soundClick}   onChange={(v)=>onSound('click','soundClick',v)} />
      <TweakToggle label="Chord"    value={t.soundChord}   onChange={(v)=>onSound('chord','soundChord',v)} />
      <TweakToggle label="Bass"     value={t.soundBass}    onChange={(v)=>onSound('bass','soundBass',v)} />
      <TweakToggle label="Count-in" value={t.soundCountin} onChange={(v)=>onSound('countin','soundCountin',v)} />

      <TweakSection label="Theme" />
      <TweakSelect label="Accent" value={t.accent}
                   options={[
                     { value: 'rouge',  label: 'Rouge & Gold' },
                     { value: 'indigo', label: 'Indigo'        },
                     { value: 'teal',   label: 'Teal'          },
                     { value: 'ember',  label: 'Ember'         },
                     { value: 'noir',   label: 'Noir'          },
                   ]}
                   onChange={(v)=>setTweak('accent', v)} />
      <TweakSelect label="Display font" value={t.displayFont}
                   options={[
                     { value: 'playfair', label: 'Playfair Display' },
                     { value: 'serif',    label: 'Georgia'          },
                     { value: 'grotesk',  label: 'Sans (Inter)'     },
                     { value: 'mono',     label: 'DM Mono'          },
                   ]}
                   onChange={(v)=>setTweak('displayFont', v)} />
      <TweakRadio label="Density" value={t.panelDensity}
                  options={['compact','regular','comfy']}
                  onChange={(v)=>setTweak('panelDensity', v)} />

      <TweakSection label="Layout" />
      <TweakToggle label="Show shortcut hints" value={t.showHints}
                   onChange={(v)=>setTweak('showHints', v)} />
      <TweakToggle label="Show cycle rail"     value={t.showCycleRail}
                   onChange={(v)=>setTweak('showCycleRail', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<PracticeTweaks />);
