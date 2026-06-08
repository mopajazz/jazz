// App root — routing, completion persistence, dark mode.
function App() {
  const modules = window.PATHWAY.modules;
  const [view, setView] = React.useState({ name: "landing" }); // in-memory so frames navigate independently
  const [completed, setCompleted] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("ji_pathway_done") || "[]"); } catch { return []; }
  });
  const [dark, setDark] = React.useState(() => {
    try { return localStorage.getItem("ji_pathway_dark") === "1"; } catch { return false; }
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("ji_pathway_dark", dark ? "1" : "0"); } catch {}
  }, [dark]);

  const persist = (next) => {
    try { localStorage.setItem("ji_pathway_done", JSON.stringify(next)); } catch {}
  };

  const toggleComplete = (slug) => {
    setCompleted((c) => {
      const next = c.includes(slug) ? c.filter(s => s !== slug) : [...c, slug];
      persist(next);
      return next;
    });
  };

  const openModule = (m) => { setView({ name: "module", slug: m.slug }); window.scrollTo(0, 0); };
  const goHome = () => { setView({ name: "landing" }); window.scrollTo(0, 0); };

  const current = view.name === "module" ? modules.find(m => m.slug === view.slug) : null;

  return (
    <div className="app">
      <window.TopNav onHome={goHome} dark={dark} onToggleDark={() => setDark(d => !d)} />
      <main className="main">
        {view.name === "landing" && (
          <window.Landing modules={modules} completed={completed} onOpen={openModule} />
        )}
        {view.name === "module" && current && (
          <window.ModuleScreen
            module={current}
            modules={modules}
            completed={completed}
            onToggleComplete={toggleComplete}
            onOpen={openModule}
            onHome={goHome}
          />
        )}
      </main>
      <footer className="site-foot">
        <span>Jazz Interactive · A pedagogical project inspired by Jerry Coker's <em>Elements of the Jazz Language</em></span>
        <span className="site-foot-meta">© 2026 · Beta Phase 1</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
