// Shared UI — nav, badges, buttons, glossary popovers, tips sidebar, step icons.
const { useState, useRef, useEffect } = React;

// ── Difficulty + time pills ───────────────────────────────────────────────
function DiffBadge({ level }) {
  const map = {
    "Beginner": "beg",
    "All levels": "all",
    "Beginner → Intermediate": "bridge",
  };
  const cls = map[level] || "beg";
  return <span className={"diff diff-" + cls}>{level}</span>;
}

function MetaChip({ icon, children }) {
  const I = icon;
  return (
    <span className="metachip">{I ? <I size={15} /> : null}{children}</span>
  );
}

// ── See/Hear/Play/Apply step glyph ─────────────────────────────────────────
const STEP_META = [
  { key: "see", label: "See", icon: () => window.Icons.Eye({ size: 18 }) },
  { key: "hear", label: "Hear", icon: () => window.Icons.Ear({ size: 18 }) },
  { key: "play", label: "Play", icon: () => window.Icons.Hand({ size: 18 }) },
  { key: "apply", label: "Apply", icon: () => window.Icons.Target({ size: 18 }) },
];

function FlowDots({ size = 7 }) {
  return (
    <span className="flowdots" aria-hidden="true">
      {STEP_META.map((s, i) => (
        <span key={s.key} className="flowdot" style={{ width: size, height: size }} title={s.label} />
      ))}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────
function Btn({ kind = "primary", size = "md", icon, iconRight, children, onClick, disabled, full }) {
  const I = icon, IR = iconRight;
  return (
    <button
      className={`btn btn-${kind} btn-${size}` + (full ? " btn-full" : "")}
      onClick={onClick}
      disabled={disabled}
    >
      {I ? <I size={size === "sm" ? 16 : 18} /> : null}
      {children ? <span>{children}</span> : null}
      {IR ? <IR size={size === "sm" ? 16 : 18} /> : null}
    </button>
  );
}

// ── Glossary text: parses {{term}} and renders a tappable popover ──────────
function GlossaryTerm({ term }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const def = (window.PATHWAY.glossary || {})[term.toLowerCase()] || "";
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <span className="gloss" ref={ref}>
      <button className={"gloss-term" + (open ? " is-open" : "")} onClick={() => setOpen(o => !o)}>
        {term}
      </button>
      {open && (
        <span className="gloss-pop" role="tooltip">
          <span className="gloss-pop-term">{term}</span>
          <span className="gloss-pop-def">{def}</span>
        </span>
      )}
    </span>
  );
}

// Render a string with {{glossary}} and *italic* markers into React nodes
function GlossText({ children, className }) {
  const text = String(children || "");
  const parts = text.split(/(\{\{[^}]+\}\}|\*[^*]+\*)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        const g = p.match(/^\{\{([^}]+)\}\}$/);
        if (g) return <GlossaryTerm key={i} term={g[1]} />;
        const it = p.match(/^\*([^*]+)\*$/);
        if (it) return <em key={i}>{it[1]}</em>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </span>
  );
}

// Title with one italicized word
function ItalicTitle({ title, word, className }) {
  if (!word || !title.includes(word)) return <span className={className}>{title}</span>;
  const [before, after] = title.split(word);
  return (
    <span className={className}>{before}<em>{word}</em>{after}</span>
  );
}

// ── Top navigation ─────────────────────────────────────────────────────────
function TopNav({ onHome, dark, onToggleDark, compact }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
    { label: "Explore Devices", href: "#" },
    { label: "Beginner Pathway", active: true, onClick: onHome },
    { label: "Looping Changes", href: "#" },
    { label: "About", href: "#" },
  ];
  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="brand" onClick={onHome}>
          <span className="brand-mark">JI</span>
          <span className="brand-name">Jazz Interactive</span>
        </button>
        <nav className="nav-links">
          {items.map((it) => (
            <button
              key={it.label}
              className={"nav-link" + (it.active ? " is-active" : "")}
              onClick={it.onClick || (() => {})}
            >
              {it.label}
              {it.active && <span className="nav-link-dot" />}
            </button>
          ))}
        </nav>
        <div className="nav-right">
          <button className="iconbtn" onClick={onToggleDark} aria-label="Toggle theme">
            {dark ? <window.Icons.Sun size={18} /> : <window.Icons.Moon size={18} />}
          </button>
          <button className="iconbtn nav-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <window.Icons.X size={20} /> : <window.Icons.Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="nav-mobile">
          {items.map((it) => (
            <button key={it.label} className={"nav-mobile-link" + (it.active ? " is-active" : "")}
              onClick={() => { setMenuOpen(false); (it.onClick || (() => {}))(); }}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ── Practice tips sidebar (consistent across modules) ──────────────────────
function TipsSidebar() {
  const tips = window.PATHWAY.tips;
  return (
    <aside className="tips">
      <div className="tips-head">
        <window.Icons.Sparkle size={16} />
        <span>Practice tips</span>
      </div>
      <ul className="tips-list">
        {tips.map((t, i) => (
          <li key={i} className="tip">
            <span className="tip-head">{t.head}</span>
            <span className="tip-body">{t.body}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

Object.assign(window, {
  DiffBadge, MetaChip, Btn, GlossText, GlossaryTerm, ItalicTitle,
  TopNav, TipsSidebar, FlowDots, STEP_META,
});
