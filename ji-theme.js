/* Jazz Interactive — shared dark mode toggle for the standalone lesson pages.
   Pairs with the .dark class rules in ji-polish.css. Load with `defer` after
   the inline anti-flash snippet in <head> has already set the class. */
(function () {
  function isDark() {
    return document.documentElement.classList.contains('dark');
  }
  function setDark(dark) {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('ji-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  var btn = document.getElementById('ji-theme-toggle');
  if (btn) {
    btn.addEventListener('click', function () {
      setDark(!isDark());
    });
  }

  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var stored = null;
      try { stored = localStorage.getItem('ji-theme'); } catch (err) {}
      if (!stored) setDark(e.matches);
    });
  } catch (e) {}
})();
