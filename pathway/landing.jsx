// Landing page + pathway tracker.
const { ItalicTitle, GlossText, DiffBadge, Btn, FlowDots, MetaChip } = window;

function Landing({ modules, completed, onOpen, onStart }) {
  const meta = window.PATHWAY.meta;
  const doneCount = modules.filter(m => completed.includes(m.slug)).length;
  const pct = Math.round((doneCount / modules.length) * 100);
  // first incomplete = recommended / resume target
  const nextIdx = modules.findIndex(m => !completed.includes(m.slug));
  const resumeModule = nextIdx >= 0 ? modules[nextIdx] : modules[0];
  const started = doneCount > 0;

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow"><window.Icons.Sparkle size={14} />{meta.eyebrow}</span>
          <h1 className="hero-title">
            <ItalicTitle title={meta.title} word="Language" />
          </h1>
          <p className="hero-intro">{meta.intro}</p>
          <div className="hero-meta">
            <MetaChip icon={window.Icons.Clock}>Est. {meta.estTime}</MetaChip>
            <MetaChip icon={window.Icons.Layers}>{meta.moduleCount} modules</MetaChip>
            <MetaChip icon={window.Icons.Dot}>{meta.level}</MetaChip>
          </div>
          <div className="hero-cta">
            <Btn kind="primary" size="lg" icon={window.Icons.Play}
              onClick={() => onOpen(resumeModule)} iconRight={window.Icons.ArrowRight}>
              {started ? "Resume pathway" : "Start the pathway"}
            </Btn>
            {started && (
              <span className="hero-resume">Up next · <strong>{resumeModule.title}</strong></span>
            )}
          </div>
        </div>
        <div className="hero-aside">
          <QuickStartCard />
        </div>
      </section>

      {/* Who it's for */}
      <section className="who">
        <h2 className="section-label">Who it's for</h2>
        <div className="who-grid">
          {meta.audience.map((a, i) => (
            <div className="who-card" key={i}>
              <span className="who-card-label">{a.label}</span>
              <span className="who-card-note">{a.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* The pathway */}
      <section className="path">
        <div className="path-head">
          <h2 className="section-label">The pathway</h2>
          <div className="path-progress">
            <span className="path-progress-text">{doneCount} of {modules.length} complete</span>
            <span className="progress-track"><span className="progress-fill" style={{ width: pct + "%" }} /></span>
          </div>
        </div>

        <ol className="path-list">
          {modules.map((m, i) => {
            const isDone = completed.includes(m.slug);
            const isNext = i === nextIdx;
            return (
              <li key={m.slug} className={"path-item" + (isDone ? " is-done" : "") + (isNext ? " is-next" : "")}>
                <div className="path-rail">
                  <span className="path-node">
                    {isDone ? <window.Icons.Check size={16} /> : <span className="path-node-num">{String(m.num).padStart(2, "0")}</span>}
                  </span>
                  {i < modules.length - 1 && <span className="path-connector" />}
                </div>
                <button className="path-card" onClick={() => onOpen(m)}>
                  <div className="path-card-main">
                    <div className="path-card-top">
                      {m.kind === "capstone" && <span className="capstone-tag"><window.Icons.Sparkle size={12} />Capstone</span>}
                      {isNext && !isDone && <span className="next-tag">Next recommended</span>}
                      {isDone && <span className="done-tag"><window.Icons.CheckCircle size={13} />Complete</span>}
                    </div>
                    <h3 className="path-card-title">
                      <ItalicTitle title={m.title} word={m.titleWord} />
                    </h3>
                    <p className="path-card-goal">{m.goal}</p>
                    <div className="path-card-meta">
                      <DiffBadge level={m.difficulty} />
                      <MetaChip icon={window.Icons.Clock}>{m.time}</MetaChip>
                      {m.linksTo && <span className="links-tag"><window.Icons.ArrowRight size={12} />Links to live device</span>}
                    </div>
                  </div>
                  <div className="path-card-side">
                    <FlowDots />
                    <span className="path-card-cta">{isDone ? "Review" : isNext ? "Begin" : "Open"}<window.Icons.ArrowRight size={15} /></span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Ready for more */}
      <section className="more">
        <div className="more-inner">
          <div>
            <h2 className="more-title">Ready for more?</h2>
            <p className="more-text">
              Once the pathway feels solid, step into the full vocabulary — Coker's 18 devices.
              Start with the beginner-friendly ones below.
            </p>
          </div>
          <div className="more-chips">
            <span className="more-chip">Change-Running <em>Beginner</em></span>
            <span className="more-chip">3–♭9 <em>Beginner</em></span>
            <span className="more-chip">Bebop Lick <em>Beginner</em></span>
            <span className="more-chip more-chip-all">Explore all 18 <window.Icons.ArrowRight size={14} /></span>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickStartCard() {
  return (
    <div className="qstart">
      <div className="qstart-thumb">
        <span className="qstart-play"><window.Icons.Play size={22} /></span>
        <span className="qstart-time">2:30</span>
        <div className="qstart-waves" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} style={{ height: (20 + Math.abs(Math.sin(i * 0.9)) * 60) + "%" }} />
          ))}
        </div>
      </div>
      <div className="qstart-body">
        <span className="qstart-eyebrow"><window.Icons.Video size={14} />Quick-start</span>
        <span className="qstart-title">Welcome — start here</span>
        <span className="qstart-note">A 2-minute hello and a walk through your first module.</span>
      </div>
    </div>
  );
}

window.Landing = Landing;
