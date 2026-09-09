(() => {
  'use strict';
  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.textContent = theme === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre');
    });
  };
  let theme = 'light';
  try { const saved = localStorage.getItem('site-theme'); if (['light', 'dark'].includes(saved)) theme = saved; } catch (_) {}
  apply(theme);
  document.addEventListener('DOMContentLoaded', () => apply(document.documentElement.dataset.theme));
  window.toggleTheme = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('site-theme', next); } catch (_) {}
  };
})();
