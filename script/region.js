/* ============================================================
   region.js — Comportement partagé des pages îles :
   slider horizontal, pop-up détail, carrousel média latéral.
   Paramétré par l'attribut data-playlist du <aside> :
   JSON [{type:'image'|'video', url:'...'}, ...]
   ============================================================ */
(function () {
  'use strict';

  /* ---------- SLIDER HORIZONTAL ---------- */
  function slideHorizontal(direction) {
    const track = document.getElementById('foodTrack');
    if (!track) return;
    const amount = 320 * direction;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }
  window.slideHorizontal = slideHorizontal;

  /* ---------- POP-UP DÉTAIL (reconnaissance de session) ---------- */
  const modal = document.getElementById('foodModal');
  const pTitle = document.getElementById('popup-title');
  const pDesc = document.getElementById('popup-desc');
  const pLink = document.getElementById('popup-link');

  function openFoodPopup(title, description, targetPage) {
    if (!modal) return;
    pTitle.textContent = title;
    pDesc.textContent = description;
    pLink.href = targetPage;

    // Déjà ouvert cette session ? on reste dans le même onglet.
    if (sessionStorage.getItem('deja_ouvert_' + title)) {
      pLink.setAttribute('target', '_self');
    } else {
      pLink.setAttribute('target', '_blank');
    }

    // Au clic, on mémorise la visite.
    pLink.onclick = function () {
      sessionStorage.setItem('deja_ouvert_' + title, 'true');
    };

    modal.classList.add('active');
  }
  window.openFoodPopup = openFoodPopup;

  function hidePopup() {
    if (modal) modal.classList.remove('active');
  }
  window.hidePopup = hidePopup;

  function closeFoodPopup(e) {
    if (e.target === modal) hidePopup();
  }
  window.closeFoodPopup = closeFoodPopup;

  /* ---------- CARROUSEL MÉDIA LATÉRAL ---------- */
  const aside = document.querySelector('.kayak-pub-sidebar');
  if (aside) {
    let playlist = [];
    try {
      playlist = JSON.parse(aside.getAttribute('data-playlist') || '[]');
    } catch (err) {
      console.warn('Playlist invalide :', err);
    }

    const imgTag = document.getElementById('ad-image');
    const videoTag = document.getElementById('ad-video');
    let currentIndex = 0;
    let timer = null;

    function advanceIndex() {
      currentIndex = (currentIndex + 1) % playlist.length;
    }

    function playNextMedia() {
      if (!playlist.length) return;
      clearTimeout(timer);
      videoTag.onended = null;
      imgTag.classList.remove('active-media');
      videoTag.classList.remove('active-media');

      const media = playlist[currentIndex];
      if (media.type === 'image') {
        imgTag.src = media.url;
        imgTag.classList.add('active-media');
        timer = setTimeout(() => { advanceIndex(); playNextMedia(); }, 2500);
      } else if (media.type === 'video') {
        videoTag.src = media.url;
        videoTag.classList.add('active-media');
        videoTag.load();
        videoTag.play().catch(() => {/* en attente d'une interaction utilisateur */});
        videoTag.onended = function () { advanceIndex(); playNextMedia(); };
      }
    }

    window.addEventListener('DOMContentLoaded', playNextMedia);
  }
})();
