/* ============================================================
   theme.js — Bascule Jour / Nuit pour le confort visuel.
   - Détecte l'heure au premier chargement (jour 7h–19h => clair)
   - Mémorise le choix de l'utilisateur (localStorage)
   - Le bouton .theme-toggle bascule et sauvegarde
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'site-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.textContent = (theme === 'light') ? '🌙' : '☀️';
      btn.setAttribute('aria-label',
        (theme === 'light') ? 'Passer en mode nuit' : 'Passer en mode jour');
    }
  }

  function current() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function autoTheme() {
    var h = new Date().getHours();
    // Jour : 7h00 à 18h59 -> clair, sinon nuit
    return (h >= 7 && h < 19) ? 'light' : 'dark';
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    apply(saved || autoTheme());
  }

  // Exposé global pour le bouton
  window.toggleTheme = function () {
    var next = (current() === 'light') ? 'dark' : 'light';
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ----- Navbar : NON collee au debut, se colle au scroll vers le bas -----
  function setupStickyNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    // Cree un espace reserve pour compenser quand la navbar passe en fixed
    var spacer = document.createElement('div');
    spacer.className = 'nav-spacer';
    nav.insertAdjacentElement('afterend', spacer);

    function sync() {
      if (window.scrollY > 10) {
        nav.classList.add('is-stuck');
        spacer.style.height = nav.offsetHeight + 'px';
      } else {
        nav.classList.remove('is-stuck');
        spacer.style.height = '0px';
      }
    }
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStickyNav);
  } else {
    setupStickyNav();
  }

})();
