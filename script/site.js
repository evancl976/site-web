(() => {
  'use strict';
  const recipes = window.RECIPES || [];
  const base = new URL('../', document.currentScript.src);
  const url = path => new URL(path, base).href;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const key = 'outremer-favorites';
  let favorites = [];
  let storageAvailable = true;
  try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); favorites = Array.isArray(saved) ? saved.filter(item => recipes.some(r => r.url === item)) : []; } catch (_) { storageAvailable = false; }
  let toastTimer;
  const toast = message => {
    const node = document.querySelector('.toast');
    if (!node) return;
    node.textContent = message; node.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 3200);
  };
  function updateFavorites() {
    document.querySelectorAll('[data-favorite]').forEach(button => {
      const active = favorites.includes(button.dataset.favorite);
      const recipe = recipes.find(r => r.url === button.dataset.favorite);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Retirer' : 'Ajouter'} ${recipe?.title || 'ce plat'} ${active ? 'des' : 'aux'} favoris`);
      button.textContent = button.classList.contains('favorite-button') ? (active ? '♥' : '♡') : (active ? '♥ Retirer des favoris' : '♡ Ajouter aux favoris');
    });
    document.querySelectorAll('.fav-count').forEach(node => { node.textContent = favorites.length || ''; });
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const id = button.dataset.favorite;
    if (!recipes.some(r => r.url === id)) return;
    const removed = favorites.includes(id);
    favorites = removed ? favorites.filter(item => item !== id) : [...favorites, id];
    try { localStorage.setItem(key, JSON.stringify(favorites)); } catch (_) { storageAvailable = false; }
    if (document.querySelector('[data-catalog="favoris"]')) render();
    updateFavorites();
    toast((removed ? 'Plat retiré des favoris.' : 'Plat ajouté aux favoris.') + (storageAvailable ? '' : ' Sauvegarde disponible uniquement pendant cette visite.'));
  });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    try { const saved = JSON.parse(event.newValue || '[]'); favorites = Array.isArray(saved) ? saved.filter(id => recipes.some(r => r.url === id)) : []; } catch (_) { favorites = []; }
    if (document.querySelector('[data-catalog="favoris"]')) render();
    updateFavorites();
  });
  const toggle = document.querySelector('.site-nav__toggle');
  const menu = document.querySelector('.site-nav__links');
  function closeMenu() { menu?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Ouvrir le menu'); }
  toggle?.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); });
  menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-nav')) closeMenu(); });
  window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  // Turn legacy clickable recipe tiles into ordinary keyboard-accessible links.
  document.querySelectorAll('.dish-mini-card[onclick]').forEach(tile => {
    const target = tile.getAttribute('onclick').match(/location.href=['"]([^'"]+)/)?.[1];
    if (!target) return;
    const link = document.createElement('a'); link.className = tile.className; link.href = target;
    link.innerHTML = tile.innerHTML; tile.replaceWith(link);
  });
  document.querySelectorAll('.mot-cliquable[onclick]').forEach(node => {
    node.setAttribute('role', 'button'); node.tabIndex = 0;
    node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); node.click(); } });
  });
  // Keep accessibility state in step with the existing learning controls.
  const refreshPanels = () => {
    document.querySelectorAll('.accordion-trigger').forEach(button => button.setAttribute('aria-expanded', String(button.closest('.tech-card').classList.contains('active'))));
    document.querySelectorAll('[onclick*="toggleDish"]').forEach(button => {
      const id = button.getAttribute('onclick').match(/toggleDish\(['"]([^'"]+)/)?.[1];
      if (!id) return;
      button.setAttribute('aria-controls', id); button.setAttribute('aria-expanded', String(document.getElementById(id)?.classList.contains('active')));
    });
  };
  document.querySelectorAll('.tech-card,.info-cachee').forEach(node => new MutationObserver(refreshPanels).observe(node, {attributes:true, attributeFilter:['class']}));
  refreshPanels();
  if (typeof window.showMode === 'function') window.showMode('ecrit');
  const catalog = document.querySelector('[data-catalog]');
  const input = document.querySelector('#recipe-query');
  const select = document.querySelector('#region-filter');
  const results = document.querySelector('#catalog-results');
  const extraPages = [{title:'Apprendre à créer un site web',url:'Page/Apprendre.html',text:'apprendre html css javascript cours video'}, {title:'Fiche technique du projet',url:'Page/Info.html',text:'fiche technique code architecture globe bac'}];
  function card(recipe) {
    return `<article class="recipe-card"><a class="recipe-card__image" href="${url(recipe.url)}"><img src="${url('images/' + recipe.image)}" alt="${escape(recipe.title)}" loading="lazy" width="600" height="450"></a><button class="favorite-button" data-favorite="${recipe.url}" aria-label="Ajouter aux favoris" aria-pressed="false">♡</button><div class="recipe-card__body"><span class="eyebrow">${escape(recipe.region)}</span><h3><a href="${url(recipe.url)}">${escape(recipe.title)}</a></h3><p>${escape(recipe.description)}</p><a class="text-link" href="${url(recipe.url)}">Découvrir le plat <span aria-hidden="true">↗</span></a></div></article>`;
  }
  function render() {
    if (!catalog) return;
    const mode = catalog.dataset.catalog;
    const tokens = normalize(input.value).split(' ').filter(Boolean);
    const isCategory = !['recettes','favoris','recherche'].includes(mode);
    const found = recipes.filter(recipe => (!isCategory || recipe.category === mode) && (mode !== 'favoris' || favorites.includes(recipe.url)) && (!select.value || recipe.regionId === select.value) && tokens.every(word => normalize([recipe.title,recipe.region,recipe.description].join(' ')).includes(word)));
    const pages = mode === 'recherche' && tokens.length && !select.value ? extraPages.filter(page => tokens.every(word => normalize(page.title+' '+page.text).includes(word))) : [];
    results.innerHTML = found.map(card).join('') + pages.map(page => `<article class="recipe-card"><div class="recipe-card__body"><p class="eyebrow">LES COULISSES</p><h3><a href="${url(page.url)}">${escape(page.title)}</a></h3><a class="text-link" href="${url(page.url)}">Ouvrir la page ↗</a></div></article>`).join('');
    const count = found.length + pages.length;
    document.querySelector('.result-count').textContent = `${count} résultat${count !== 1 ? 's' : ''}`;
    const empty = document.querySelector('#catalog-empty'); empty.hidden = count > 0;
    let title = 'Aucun résultat pour cette recherche.';
    let message = 'Essayez un autre mot ou choisissez un autre territoire.';
    if (['desserts','boissons'].includes(mode)) { title = 'La suite du voyage se prépare.'; message = 'Cette collection ne contient pas encore de fiches. Découvrez les entrées, plats et accompagnements déjà disponibles.'; }
    else if (mode === 'favoris' && favorites.length === 0) { title = 'Votre carnet attend ses premières saveurs.'; message = 'Touchez le cœur sur un plat pour le retrouver ici. Vos favoris sont enregistrés dans ce navigateur.'; }
    empty.innerHTML = `<h2>${title}</h2><p>${message}</p><a class="btn-primary" href="${url('Page/recettes.html')}">Explorer toutes les recettes ↗</a>`;
    updateFavorites();
  }
  function syncQuery() {
    const next = new URL(location.href);
    input.value.trim() ? next.searchParams.set('q', input.value.trim()) : next.searchParams.delete('q');
    select.value ? next.searchParams.set('territoire', select.value) : next.searchParams.delete('territoire');
    try { history.replaceState(null, '', next); } catch (_) {}
    render();
  }
  if (catalog) {
    const params = new URLSearchParams(location.search); input.value = params.get('q') || ''; select.value = params.get('territoire') || '';
    input.addEventListener('input', syncQuery); select.addEventListener('change', syncQuery);
    document.querySelector('.catalog-search').addEventListener('submit', event => { event.preventDefault(); syncQuery(); });
    render();
  }
  updateFavorites();
})();
/* Media d'evasion conserve sur les pages de territoires. */
(() => {
  const file = decodeURIComponent(location.pathname.split('/').pop() || '').toLowerCase();
  const destinations = {
    'guadeloupe.html': {name:'Guadeloupe', zone:'Les Antilles', image:'guadeloupe-paysage1.jpg', video:'guadeloupe-trip.mp4', slides:['guadeloupe-paysage1.jpg','guadeloupe-paysage2.jpg','guadeloupe-paysage3.jpg','guadeloupe-paysage4.jpg']},
    'martinique.html': {name:'Martinique', zone:'Les Antilles', image:'martinique-paysage1.jpg', video:'martinique-trip.mp4', slides:['martinique-paysage1.jpg','martinique-paysage2.jpg','martinique-paysage3.jpg','martinique-paysage4.jpg']},
    'la-reunion.html': {name:'La Réunion', zone:'Océan Indien', image:'la-reunion-paysage1.jpg', video:'la-reunion-trip.mp4', slides:['la-reunion-paysage1.jpg','la-reunion-paysage2.jpg','la-reunion-paysage3.jpg','la-reunion-paysage4.jpg']},
    'mayotte.html': {name:'Mayotte', zone:'Océan Indien', image:'mayotte-paysage1.jpg', video:'mayotte-trip.mp4', slides:['mayotte-paysage1.jpg','mayotte-paysage2.jpg','mayotte-paysage3.jpg','mayotte-paysage4.jpg']},
    'guyane.html': {name:'Guyane', zone:'Amérique du Sud', image:'guyane-paysage1.jpg', video:'guyane-trip.mp4', slides:['guyane-paysage1.jpg','guyane-paysage2.jpg','guyane-paysage3.jpg','guyane-paysage4.jpg']}
  };
  const destination = destinations[file];
  if (!destination || document.querySelector('.territory-media')) return;
  const root = '../';
  const section = document.createElement('section');
  section.className = 'territory-media';
  section.setAttribute('aria-labelledby', 'territory-media-title');
  section.setAttribute('aria-roledescription', 'diaporama');
  section.innerHTML = `<div class="travel-card"><div class="travel-card__stage"><video class="travel-card__video" muted playsinline preload="metadata" poster="${root}images/${destination.image}" aria-label="Vidéo de découverte de ${destination.name}"><source src="${root}videos/${destination.video}" type="video/mp4"></video><img class="travel-card__photo" hidden src="${root}images/${destination.image}" alt="Paysage de ${destination.name}"><div class="travel-card__heading"><p>ÉVASION · ${destination.zone}</p><h2 id="territory-media-title">${destination.name}</h2></div><button class="travel-card__sound" type="button" aria-label="Activer le son" aria-pressed="false">Son désactivé</button></div><div class="travel-card__toolbar"><span class="travel-card__status">Vidéo · 1 / 5</span><div class="travel-card__dots" aria-label="Choisir une vue">${['Vidéo', ...destination.slides.map((_, i) => 'Photo ' + (i + 1))].map((label, i) => `<button type="button" data-slide="${i}" aria-label="${label}" aria-pressed="${i === 0}"><span></span></button>`).join('')}</div><div class="travel-card__actions"><button type="button" data-prev aria-label="Vue précédente">←</button><button type="button" data-pause aria-label="Mettre le diaporama en pause">Pause</button><button type="button" data-next aria-label="Vue suivante">→</button></div></div></div>`;
  const grid = document.querySelector('.recipe-grid');
  if (grid) {
    const layout = document.createElement('div');
    layout.className = 'destination-content';
    grid.before(layout);
    layout.append(grid, section);
  } else document.querySelector('main')?.append(section);
  const video = section.querySelector('video');
  const photo = section.querySelector('img');
  const pause = section.querySelector('[data-pause]');
  const sound = section.querySelector('.travel-card__sound');
  const dots = [...section.querySelectorAll('[data-slide]')];
  let index = 0;
  let timer;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  function updatePause() {
    pause.textContent = playing ? 'Pause' : 'Lecture';
    pause.setAttribute('aria-label', playing ? 'Mettre le diaporama en pause' : 'Lancer le diaporama');
  }
  function stop() { clearTimeout(timer); video.pause(); }
  function resume() {
    stop();
    if (!playing || !visible || document.hidden) return;
    if (index === 0) {
      video.play().catch(() => {
        if (index !== 0 || !playing || !visible || document.hidden) return;
        playing = false;
        updatePause();
      });
    } else timer = setTimeout(() => show(index + 1), 6000);
  }
  function show(next) {
    stop();
    index = (next + 5) % 5;
    video.hidden = index !== 0;
    photo.hidden = index === 0;
    sound.hidden = index !== 0;
    if (index === 0) video.currentTime = 0;
    else {
      photo.src = `${root}images/${destination.slides[index - 1]}`;
      photo.alt = `Paysage de ${destination.name}, photo ${index}`;
    }
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
    section.querySelector('.travel-card__status').textContent = `${index === 0 ? 'Vidéo' : 'Photo'} · ${index + 1} / 5`;
    resume();
  }
  pause.addEventListener('click', () => { playing = !playing; updatePause(); resume(); });
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    sound.textContent = video.muted ? 'Son désactivé' : 'Son activé';
    sound.setAttribute('aria-label', video.muted ? 'Activer le son' : 'Couper le son');
    sound.setAttribute('aria-pressed', String(!video.muted));
  });
  section.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  section.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.slide))));
  video.addEventListener('ended', () => { if (playing) show(1); });
  video.addEventListener('error', () => show(1));
  video.querySelector('source').addEventListener('error', () => show(1));
  document.addEventListener('visibilitychange', resume);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, {threshold: 0.15}).observe(section);
  updatePause();
})();
/* Démarrage vidéo robuste : l’autoplay muet reste actif même avec un réglage de mouvement réduit. */
(() => {
  document.querySelectorAll('.travel-card').forEach(card => {
    const video = card.querySelector('.travel-card__video');
    if (!video) return;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    let visible = false;
    const start = () => {
      if (!visible || document.hidden || video.hidden) return;
      video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }, {threshold: 0.1});
    observer.observe(card);
    video.addEventListener('loadeddata', start);
    card.querySelector('[data-pause]')?.addEventListener('click', () => {
      if (card.querySelector('[data-pause]').textContent === 'Pause') start();
    });
  });
})();
