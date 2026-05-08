(function () {
  const STORAGE_KEY = 'ji-theme';
  const DARK = 'dark';
  const LIGHT = 'light';
  const DARK_THEME_COLOR = '#15130f';
  const LIGHT_THEME_COLOR = '#f5f0e8';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      // Storage can be unavailable in some private browsing contexts.
    }
  }

  function applyTheme(theme, persist) {
    const next = theme === DARK ? DARK : LIGHT;
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === DARK ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);

    const toggle = document.querySelector('[data-ji-theme-toggle]');
    if (toggle) {
      const isDark = next === DARK;
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.textContent = isDark ? 'Light' : 'Dark';
    }

    if (persist) saveTheme(next);
    window.dispatchEvent(new CustomEvent('ji-theme-change', { detail: { theme: next } }));
  }

  function getTheme() {
    return document.documentElement.dataset.theme === DARK ? DARK : LIGHT;
  }

  function toggleTheme() {
    applyTheme(getTheme() === DARK ? LIGHT : DARK, true);
  }

  function installToggle() {
    if (document.querySelector('[data-ji-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ji-theme-toggle';
    button.setAttribute('data-ji-theme-toggle', '');
    button.addEventListener('click', toggleTheme);
    document.body.appendChild(button);
    applyTheme(getTheme(), false);
  }

  window.JITheme = {
    get: getTheme,
    set: (theme) => applyTheme(theme, true),
    toggle: toggleTheme
  };

  applyTheme(getStoredTheme() || LIGHT, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installToggle);
  } else {
    installToggle();
  }
})();
