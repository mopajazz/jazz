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
          {tab === "play" && <PlayTab />}
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
// Audio examples are on hold until they sound right.
function HearTab({ module }) {
  return (
    <section className="pane">
      <div className="pane-head"><span className="pane-step"><window.Icons.Ear size={16} />Hear</span></div>
      <p className="pane-intro"><window.GlossText>{module.hear.intro}</window.GlossText></p>
      <window.ComingSoon title="Audio examples coming soon">
        We're preparing new examples for this module. Until they're ready, move on to Play and Apply.
      </window.ComingSoon>
    </section>
  );
}

function PlayTab() {
  return (
    <section className="pane">
      <div className="pane-head"><span className="pane-step"><window.Icons.Hand size={16} />Play</span></div>
      <window.ComingSoon title="Play-along coming soon">
        The backing track and record-yourself tools are being rebuilt. For now, practise along with a metronome or your favourite recording.
      </window.ComingSoon>
    </section>
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
        <a className="links-card" href={module.linksTo.href}>
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
