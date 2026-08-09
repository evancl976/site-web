/* ============================================================
   dish.js — Toggle générique des sections "En savoir plus"
   sur les pages recettes. S'utilise avec data-toggle="idCible".
   ============================================================ */
(function () {
  'use strict';

  window.toggleDish = function (targetId) {
    const box = document.getElementById(targetId);
    if (box) box.classList.toggle('active');
  };

  // Compatibilité avec les anciens appels nommés par plat
  // (toggleAccras, toggleBokit, etc.) : redirige vers l'id ciblé.
  document.querySelectorAll('[data-toggle]').forEach((el) => {
    el.addEventListener('click', () => {
      window.toggleDish(el.getAttribute('data-toggle'));
    });
  });
})();
