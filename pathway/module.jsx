// Module screen — header, See/Hear/Play/Apply tabs, complete + nav.
const { useState: msU } = React;

function ModuleScreen({ module, modules, completed, onToggleComplete, onOpen, onHome }) {
  const [tab, setTab] = msU("see");
  const idx = modules.findIndex(m => m.slug === module.slug);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;
  const isDone = completed.includes(module.slug);

  const tabs = window.STEP_META;

  return (
    <div className="module">
      {/* Breadcrumb */}
      <div className="crumb">
        <button onClick={onHome}>Beginner Pathway</button>
        <span className="crumb-sep">/</span>
        <span className="crumb-cur">{String(module.num).padStart(2, "0")}</span>
        {module.kind === "capstone" && <span className="capstone-tag sm"><window.Icons.Sparkle size={11} />Capstone</span>}
      </div>

      {/* Header */}
      <header className="mod-head">
        <div className="mod-head-main">
          <span className="mod-eyebrow">Module {String(module.num).padStart(2, "0")} of {modules.length}</span>
          <h1 className="mod-title"><window.ItalicTitle title={module.title} word={module.titleWord} /></h1>
          <p className="mod-summary"><window.GlossText>{module.summary}</window.GlossText></p>
          <div className="mod-meta">
            <window.DiffBadge level={module.difficulty} />
            <window.MetaChip icon={window.Icons.Clock}>{module.time}</window.MetaChip>
            <span className="goal-chip"><window.Icons.Target size={15} />{module.goal}</span>
          </div>
        </div>
        <div className="mod-head-side">
          <button className={"complete-btn" + (isDone ? " is-done" : "")} onClick={() => onToggleComplete(module.slug)}>
            {isDone ? <window.Icons.CheckCircle size={18} /> : <span className="complete-box" />}
            <span>{isDone ? "Completed" : "Mark as complete"}</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs" role="tablist">
        {tabs.map((t, i) => {
          const I = t.icon;
          return (
            <button key={t.key} role="tab" aria-selected={tab === t.key}
              className={"tab" + (tab === t.key ? " is-active" : "")} onClick={() => setTab(t.key)}>
              <span className="tab-num">{i + 1}</span>
              <I />
              <span className="tab-label">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body: content + sidebar */}
      <div className="mod-body">
        <div className="mod-content">
          {tab === "see" && <SeeTab module={module} />}
          {tab === "hear" && <HearTab module={module} />}
          {tab === "play" && <window.Player module={module} />}
          {tab === "apply" && <ApplyTab module={module} />}

          {/* Tab nav */}
          <div className="tab-nav">
            {(() => {
              const order = ["see", "hear", "play", "apply"];
              const ti = order.indexOf(tab);
              const pv = ti > 0 ? order[ti - 1] : null;
              const nx = ti < 3 ? order[ti + 1] : null;
              return (
                <React.Fragment>
                  {pv ? <window.Btn kind="ghost" icon={window.Icons.ArrowLeft} onClick={() => setTab(pv)}>{tabs[ti-1].label}</window.Btn> : <span />}
                  {nx
                    ? <window.Btn kind="primary" iconRight={window.Icons.ArrowRight} onClick={() => setTab(nx)}>Continue to {tabs[ti+1].label}</window.Btn>
                    : <window.Btn kind="primary" icon={window.Icons.Check} onClick={() => onToggleComplete(module.slug)}>{isDone ? "Completed" : "Mark complete"}</window.Btn>}
                </React.Fragment>
              );
            })()}
          </div>
        </div>

        <div className="mod-aside">
          <window.TipsSidebar />
          <button className="confused-btn"><window.Icons.Chat size={15} />What was confusing?</button>
        </div>
      </div>

      {/* Footer module nav */}
      <nav className="mod-foot">
        {prev
          ? <button className="footnav prev" onClick={() => onOpen(prev)}>
              <window.Icons.ArrowLeft size={16} />
              <span><em>Previous</em>{prev.title}</span>
            </button>
          : <span />}
        {next
          ? <button className="footnav next" onClick={() => onOpen(next)}>
              <span><em>Next recommended</em>{next.title}</span>
              <window.Icons.ArrowRight size={16} />
            </button>
          : <button className="footnav next done" onClick={onHome}>
              <span><em>Pathway complete</em>Back to overview</span>
              <window.Icons.Sparkle size={16} />
            </button>}
      </nav>
    </div>
  );
}

// ── See ──────────────────────────────────────────────────────────────────
function SeeTab({ module }) {
  const s = module.see;
  return (
    <section className="pane">
      <div className="pane-head"><span className="pane-step"><window.Icons.Eye size={16} />See</span></div>
      <p className="pane-intro"><window.GlossText>{s.intro}</window.GlossText></p>
      <div className="diagrams">
        {s.diagrams.map((d) => <div className="diagram-frame" key={d}><window.Diagram type={d} /></div>)}
      </div>
      <ul className="pane-points">
        {s.points.map((p, i) => (
          <li key={i}><span className="point-mark" /><window.GlossText>{p}</window.GlossText></li>
        ))}
      </ul>
    </section>
  );
}

// ── Hear ─────────────────────────────────────────────────────────────────
function HearTab({ module }) {
  const h = module.hear;
  const [active, setActive] = msU(null);
  const A = window.JazzAudio;

  const clipKind = (label) => {
    const l = label.toLowerCase();
    if (l.includes("scale")) return module.slug === "pentatonic-patterns" ? "pent" : "scale";
    if (l.includes("arpeggio")) return "arpeggio";
    if (l.includes("solo")) return "solo";
    if (l.includes("phrase") || l.includes("cell") || l.includes("notes") || l.includes("resolution")) return "phrase";
    return "groove";
  };
  const durSec = (s) => { const [m, sec] = String(s).split(":").map(Number); return (m * 60 + sec) || 12; };

  const toggle = (i, clip) => {
    if (!A) return;
    if (active === i) { A.stopClips(); setActive(null); return; }
    setActive(i);
    A.playClip({
      feel: clip.feel, kind: clipKind(clip.label), quality: "maj7",
      key: module.play.keys[0], dur: durSec(clip.dur),
      onEnd: () => setActive((cur) => (cur === i ? null : cur)),
    });
  };

  React.useEffect(() => () => { if (A) A.stopClips(); }, []);

  return (
    <section className="pane">
      <div className="pane-head"><span className="pane-step"><window.Icons.Ear size={16} />Hear</span></div>
      <p className="pane-intro"><window.GlossText>{h.intro}</window.GlossText></p>
      <div className="clips">
        {h.clips.map((c, i) => <ClipCard key={i} clip={c} playing={active === i} onToggle={() => toggle(i, c)} />)}
      </div>
    </section>
  );
}

function ClipCard({ clip, playing, onToggle }) {
  return (
    <div className={"clip" + (playing ? " is-playing" : "")}>
      <button className="clip-play" onClick={onToggle}>
        {playing ? <window.Icons.Pause size={18} /> : <window.Icons.Play size={18} />}
      </button>
      <div className="clip-main">
        <div className="clip-top">
          <span className="clip-label">{clip.label}</span>
          <span className={"clip-feel feel-" + clip.feel}>{clip.feel}</span>
        </div>
        <span className="clip-desc">{clip.desc}</span>
        <div className="clip-wave" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className={playing ? "is-live" : ""}
              style={{ height: (12 + Math.abs(Math.sin(i * 0.55 + (clip.feel === "swung" ? 1 : 0))) * 75) + "%", animationDelay: (i * 28) + "ms" }} />
          ))}
        </div>
      </div>
      <span className="clip-dur">{clip.dur}</span>
    </div>
  );
}

// ── Apply ────────────────────────────────────────────────────────────────
function ApplyTab({ module }) {
  const a = module.apply;
  return (
    <section className="pane">
      <div className="pane-head"><span className="pane-step"><window.Icons.Target size={16} />Apply</span></div>
      <div className="apply-cards">
        <div className="apply-card">
          <span className="apply-card-label"><window.Icons.Hand size={15} />Try this at home</span>
          <p><window.GlossText>{a.tryAtHome}</window.GlossText></p>
        </div>
        <div className="apply-card">
          <span className="apply-card-label"><window.Icons.Ear size={15} />Real-world context</span>
          <p><window.GlossText>{a.context}</window.GlossText></p>
        </div>
      </div>
      <div className="apply-prompt">
        <span className="apply-prompt-label"><window.Icons.Mic size={16} />Your turn</span>
        <p><window.GlossText>{a.prompt}</window.GlossText></p>
      </div>
      {module.linksTo && (
        <a className="links-card" href="#">
          <div>
            <span className="links-card-label">{module.linksTo.label}</span>
            <span className="links-card-note">{module.linksTo.note}</span>
          </div>
          <window.Icons.ArrowRight size={18} />
        </a>
      )}
    </section>
  );
}

window.ModuleScreen = ModuleScreen;
