// "See" tab diagrams — animated, schematic. window.Diagram switches on type.
function BeatGrid({ slots, labels }) {
  return (
    <div className="bg-grid">
      {slots.map((on, i) => (
        <div key={i} className={"bg-cell" + (labels && labels[i] === "beat" ? " is-beat" : "")}>
          {on && <span className={"bg-note" + (on === 2 ? " is-off" : "")} />}
        </div>
      ))}
    </div>
  );
}

function SwingDiagram() {
  return (
    <div className="dg dg-swing">
      <div className="dg-row">
        <div className="dg-caption"><span className="dg-tag">Straight</span> even — stiff</div>
        <div className="swing-lane">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className="swing-ball straight" style={{ left: (i * 12.5) + "%" }} />
          ))}
          <div className="swing-beats">{[0,1,2,3].map(i => <span key={i} style={{ left: (i*25)+"%" }}>{i+1}</span>)}</div>
        </div>
      </div>
      <div className="dg-row">
        <div className="dg-caption"><span className="dg-tag accent">Swung</span> long–short — alive</div>
        <div className="swing-lane">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const pair = i % 2; const beat = Math.floor(i / 2);
            const pos = beat * 25 + (pair === 0 ? 0 : 16.6);
            return <span key={i} className={"swing-ball swung" + (pair ? " short" : " long")} style={{ left: pos + "%", animationDelay: (i * 0.12) + "s" }} />;
          })}
          <div className="swing-beats">{[0,1,2,3].map(i => <span key={i} style={{ left: (i*25)+"%" }}>{i+1}</span>)}</div>
        </div>
      </div>
    </div>
  );
}

function TripletDiagram() {
  return (
    <div className="dg dg-trip">
      <div className="dg-sub">One beat, three even notes — swing keeps the 1st and 3rd.</div>
      <div className="trip-lane">
        {[0, 1, 2, 3].map((beat) => (
          <div key={beat} className="trip-beat">
            <span className="trip-n is-kept" />
            <span className="trip-n is-skipped" />
            <span className="trip-n is-kept" />
            <span className="trip-beat-num">{beat + 1}</span>
          </div>
        ))}
      </div>
      <div className="trip-legend">
        <span><span className="dot kept" />played</span>
        <span><span className="dot skipped" />felt, not played</span>
      </div>
    </div>
  );
}

function CompingDiagram() {
  // Charleston: hit on beat 1 and the "and" of 2
  const cells = [1, 0, 0, 2, 0, 0, 0, 0]; // 8 eighths
  return (
    <div className="dg dg-comp">
      <div className="dg-sub">The Charleston — one of jazz's foundational comping rhythms.</div>
      <div className="comp-lane">
        {cells.map((c, i) => (
          <div key={i} className={"comp-cell" + (i % 2 === 0 ? " is-down" : "")}>
            {c > 0 && <span className={"comp-hit" + (c === 2 ? " accent" : "")} style={{ animationDelay: (i * 0.1) + "s" }} />}
          </div>
        ))}
      </div>
      <div className="comp-counts">
        {["1","&","2","&","3","&","4","&"].map((c, i) => <span key={i} className={c.match(/\d/) ? "is-beat" : ""}>{c}</span>)}
      </div>
    </div>
  );
}

function Ladder({ degrees, accentIdx }) {
  return (
    <div className="dg dg-ladder">
      <div className="ladder">
        {degrees.map((d, i) => (
          <div key={i} className={"rung" + (accentIdx && accentIdx.includes(i) ? " is-accent" : "")} style={{ animationDelay: (i * 0.08) + "s" }}>
            <span className="rung-deg">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BluesScaleDiagram() {
  return (
    <div className="dg">
      <div className="dg-sub">Six notes. The ♭5 is the 'blue note' — pass through it.</div>
      <Ladder degrees={["1", "♭3", "4", "♭5", "5", "♭7"]} accentIdx={[3]} />
    </div>
  );
}

function PentatonicDiagram() {
  return (
    <div className="dg">
      <div className="dg-sub">Five notes, no half-steps. The cell <strong>1-2-3-5</strong> is highlighted.</div>
      <Ladder degrees={["1", "2", "3", "5", "6"]} accentIdx={[0, 1, 2, 3]} />
    </div>
  );
}

function ChordTonesDiagram() {
  return (
    <div className="dg dg-chordtones">
      <div className="dg-sub">Land on chord tones (filled) on strong beats — pass through the rest.</div>
      <div className="ct-row">
        {["R", "2", "3", "4", "5", "6", "7"].map((n, i) => {
          const isTone = [0, 2, 4, 6].includes(i);
          return <span key={i} className={"ct-note" + (isTone ? " is-tone" : "")} style={{ animationDelay: (i*0.07)+"s" }}>{n}</span>;
        })}
      </div>
    </div>
  );
}

function SevenThreeDiagram() {
  return (
    <div className="dg dg-73">
      <div className="dg-sub">The ♭7 of <strong>ii</strong> falls a half-step to the 3 of <strong>V</strong>.</div>
      <div className="st-row">
        <div className="st-chord">
          <span className="st-chord-name">Dm7 <em>(ii)</em></span>
          <span className="st-note from">♭7 = C</span>
        </div>
        <div className="st-arrow"><window.Icons.ArrowRight size={20} /><span>half step down</span></div>
        <div className="st-chord">
          <span className="st-chord-name">G7 <em>(V)</em></span>
          <span className="st-note to">3 = B</span>
        </div>
      </div>
    </div>
  );
}

function BluesFormDiagram() {
  // 12-bar blues: I I I I | IV IV I I | V IV I V
  const bars = ["I","I","I","I","IV","IV","I","I","V","IV","I","V"];
  return (
    <div className="dg dg-form">
      <div className="dg-sub">12 bars · three four-bar phrases · three chords.</div>
      <div className="form-grid">
        {bars.map((b, i) => (
          <div key={i} className={"form-bar chord-" + b} style={{ animationDelay: (i * 0.05) + "s" }}>
            <span className="form-bar-num">{i + 1}</span>
            <span className="form-bar-chord">{b}</span>
          </div>
        ))}
      </div>
      <div className="form-legend">
        <span className="chord-I"><span className="sw" />I · home</span>
        <span className="chord-IV"><span className="sw" />IV · color</span>
        <span className="chord-V"><span className="sw" />V · turnaround</span>
      </div>
    </div>
  );
}

function Diagram({ type }) {
  switch (type) {
    case "swing": return <SwingDiagram />;
    case "triplet": return <TripletDiagram />;
    case "comping": return <CompingDiagram />;
    case "bluesscale": return <BluesScaleDiagram />;
    case "pentatonic": return <PentatonicDiagram />;
    case "chordtones": return <ChordTonesDiagram />;
    case "seventhree": return <SevenThreeDiagram />;
    case "bluesform": return <BluesFormDiagram />;
    default: return null;
  }
}

window.Diagram = Diagram;
