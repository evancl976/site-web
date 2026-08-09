const canvas = document.getElementById('globeCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('globeTooltip');
const activeTitle = document.getElementById('active-country-title');
const globeContainer = document.querySelector('.globe-container');

const countries = [
    { nom: "Mayotte", lat: -12.82, lon: 45.16, flag: "🇾🇹", url: "Page/Mayotte.html", halo: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px #ffffff)" },
    { nom: "Guyane", lat: 3.93, lon: -53.12, flag: "🇬🇫", url: "Page/Guyane.html", halo: "drop-shadow(-3px 0 5px #ffd800) drop-shadow(3px 0 5px #00843a)" },
    { nom: "Guadeloupe", lat: 16.26, lon: -61.55, flag: "🇬🇵", url: "Page/Guadeloupe.html", halo: "drop-shadow(-3px 0 5px #002395) drop-shadow(3px 0 5px #000000)" },
    { nom: "Martinique", lat: 14.64, lon: -61.02, flag: "🇲🇶", url: "Page/Martinique.html", halo: "drop-shadow(-4px 0 5px #ef3340) drop-shadow(0 0 5px #009a44) drop-shadow(4px 0 5px #000000)" },
    { nom: "La Réunion", lat: -21.11, lon: 55.53, flag: "🇷🇪", url: "Page/La-reunion.html", halo: "drop-shadow(-3px 0 5px #002395) drop-shadow(3px 0 5px #ffd800)" }
];

// Couleurs du globe selon le thème (nuit = bleu/or, clair = orange)
function themeColors() {
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    atmosphere: light ? 'rgba(120, 80, 30, 0.15)' : 'rgba(0, 15, 30, 0.3)',
    grid: light ? 'rgba(224, 123, 57, 0.25)' : 'rgba(0, 180, 255, 0.15)',
    marker: light ? '#e07b39' : 'gold',
    markerCurrent: '#fff',
    ring: light ? 'rgba(224, 123, 57, 0.5)' : 'rgba(255, 255, 255, 0.5)'
  };
}

let currentIndex = 0;
let currentRotX = 0, currentRotY = 0;
let viewRotX = 0, viewRotY = 0;

let currentRadius = 195;
let targetRadius = 195;

let mouseX = 0, mouseY = 0;
let hoveredCountry = null;
let isHoveringCanvas = false;
let isPausedByKeyboard = false;
let autoRotationTimer;

// Synchronise les boutons d'îles avec le globe (grossit + scintille l'actif)
function updateIslandButtons() {
    const buttons = document.querySelectorAll('.island-btn-flag');
    buttons.forEach((btn, i) => {
        if (i === currentIndex) {
            // Bouton actif : mis en evidence (style inline, prioritaire)
            btn.style.transform = 'scale(1.12)';
            btn.style.boxShadow = '0 0 22px var(--globe-glow)';
            btn.style.borderColor = 'var(--island-active)';
            btn.style.background = 'var(--panel)';
            if (btn.querySelector('img')) {
                const halo = (countries[i] && countries[i].halo) ? countries[i].halo : 'drop-shadow(0 0 6px var(--island-active))';
                btn.querySelector('img').style.filter = halo + ' brightness(1.15)';
            }
            if (btn.querySelector('span')) {
                btn.querySelector('span').style.color = 'var(--island-active)';
                btn.querySelector('span').style.fontWeight = '800';
            }
        } else {
            // Bouton normal : on retire la mise en evidence
            btn.style.transform = '';
            btn.style.boxShadow = '';
            btn.style.borderColor = '';
            btn.style.background = '';
            if (btn.querySelector('img')) {
                btn.querySelector('img').style.filter = 'none';
            }
            if (btn.querySelector('span')) {
                btn.querySelector('span').style.color = '';
                btn.querySelector('span').style.fontWeight = '';
            }
        }
    });
}

function updateTargetRotation() {
    const target = countries[currentIndex];
    currentRotY = target.lon * (Math.PI / 180);
    currentRotX = -target.lat * (Math.PI / 180);

    activeTitle.innerText = target.flag + " " + target.nom;
    updateIslandButtons();

    // Effet de zoom / saut mécanique
    targetRadius = 215;
    setTimeout(() => { targetRadius = 195; }, 400);
}

// Clic sur un bouton d'ile :
//  - 1er clic (ou clic sur une autre ile) => place l'ile sur la carte (map)
//  - 2eme clic sur la MEME ile deja selectionnee => ouvre la page web
let lastClickedIndex = -1;
let lastClickTime = 0;
function islandClick(index) {
    const now = Date.now();
    if (index === lastClickedIndex && (now - lastClickTime) < 400) {
        // Double-clic detecte (2 clics rapproches) => ouvre la page
        openIslandPage(index);
        lastClickedIndex = -1;
        return;
    }
    // Clic simple => place l'ile sur la carte
    currentIndex = index;
    updateTargetRotation();
    resetTimer();
    updateIslandButtons();
    lastClickedIndex = index;
    lastClickTime = now;
}

// Ouvre la page web de l'ile (double-clic ou 2eme clic)
function openIslandPage(index) {
    window.location.href = countries[index].url;
}

function nextCountry() {
    currentIndex = (currentIndex + 1) % countries.length;
    updateTargetRotation();
    resetTimer();
}

function prevCountry() {
    currentIndex = (currentIndex - 1 + countries.length) % countries.length;
    updateTargetRotation();
    resetTimer();
}

function startTimer() {
    autoRotationTimer = setInterval(() => {
        if (!hoveredCountry && !isHoveringCanvas && !isPausedByKeyboard) {
            nextCountry();
        }
    }, 5000);
}

function resetTimer() {
    clearInterval(autoRotationTimer);
    startTimer();
}

// Gestion des touches Clavier
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        isPausedByKeyboard = !isPausedByKeyboard;
    } else if (e.key === 'ArrowRight') {
        nextCountry();
    } else if (e.key === 'ArrowLeft') {
        prevCountry();
    }
});

// Position de la souris réajustée
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseenter', () => { isHoveringCanvas = true; });
canvas.addEventListener('mouseleave', () => { isHoveringCanvas = false; hoveredCountry = null; });

canvas.addEventListener('click', () => {
    if (hoveredCountry) {
        window.location.href = hoveredCountry.url;
    } else {
        window.location.href = countries[currentIndex].url;
    }
});

function drawGlobe() {
    viewRotX += (currentRotX - viewRotX) * 0.08;
    viewRotY += (currentRotY - viewRotY) * 0.08;
    currentRadius += (targetRadius - currentRadius) * 0.1;

    // Synchronisation de la taille du conteneur et du canvas
    let dynamicSize = Math.round(currentRadius * 2);
    canvas.width = dynamicSize;
    canvas.height = dynamicSize;

    globeContainer.style.width = `${dynamicSize}px`;
    globeContainer.style.height = `${dynamicSize}px`;
    globeContainer.style.backgroundSize = `${dynamicSize * 2}px ${dynamicSize}px`;

    const cx = dynamicSize / 2;
    const cy = dynamicSize / 2;

    // Déplacement de la texture de la carte (TERRE qui défile via le fond CSS)
    let bgOffsetX = -(viewRotY / (Math.PI * 2)) * (dynamicSize * 2);
    let bgOffsetY = -(viewRotX / Math.PI) * dynamicSize;
    globeContainer.style.backgroundPosition = `calc(50% + ${bgOffsetX}px) calc(50% + ${bgOffsetY}px)`;

    const tc = themeColors();

    // Teinte de fond de l'atmosphère (Légère transparence pour voir la carte dessous)
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isPausedByKeyboard ? 'rgba(230, 30, 30, 0.2)' : tc.atmosphere;
    ctx.fill();

    ctx.strokeStyle = tc.grid;
    ctx.lineWidth = 1;

    // Grille des Latitudes
    for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let lastPoint = null;
        for (let lon = -180; lon <= 180; lon += 5) {
            let p = project(lat, lon, cx, cy, currentRadius);
            if (p.visible) {
                if (!lastPoint) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
                lastPoint = p;
            } else lastPoint = null;
        }
        ctx.stroke();
    }

    // Grille des Longitudes
    for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath();
        let lastPoint = null;
        for (let lat = -90; lat <= 90; lat += 5) {
            let p = project(lat, lon, cx, cy, currentRadius);
            if (p.visible) {
                if (!lastPoint) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
                lastPoint = p;
            } else lastPoint = null;
        }
        ctx.stroke();
    }

    // Dessin des marqueurs des îles
    let matchFound = null;
    countries.forEach((country, index) => {
        let p = project(country.lat, country.lon, cx, cy, currentRadius);
        if (p.visible) {
            let dist = Math.sqrt((mouseX - p.x) ** 2 + (mouseY - p.y) ** 2);
            let isCurrent = (index === currentIndex);

            if (dist < 15) matchFound = country;

            ctx.beginPath();
            ctx.arc(p.x, p.y, isCurrent ? 8 : 5, 0, 2 * Math.PI);
            ctx.fillStyle = isCurrent ? tc.markerCurrent : tc.marker;
            ctx.shadowBlur = isCurrent ? 15 : 8;
            ctx.shadowColor = tc.marker;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isCurrent) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 14 + Math.sin(Date.now() / 150) * 4, 0, 2 * Math.PI);
                ctx.strokeStyle = tc.ring;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    });

    // OMBRAGE DE SPHÈRE AMÉLIORÉ (Laisse passer la blancheur des pôles)
    let gradient = ctx.createRadialGradient(cx - currentRadius / 3, cy - currentRadius / 3, 10, cx, cy, currentRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    if (isPausedByKeyboard) {
        gradient.addColorStop(0.8, 'rgba(100, 0, 0, 0.15)');
        gradient.addColorStop(1, 'rgba(30, 0, 0, 0.7)');
    } else {
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Gestion de l'affichage de l'infobulle
    let currentCountryProj = project(countries[currentIndex].lat, countries[currentIndex].lon, cx, cy, currentRadius);

    if (matchFound) {
        hoveredCountry = matchFound;
        canvas.style.cursor = 'pointer';
        tooltip.style.opacity = '1';
        tooltip.style.left = (mouseX + 20) + 'px';
        tooltip.style.top = (mouseY - 20) + 'px';
        tooltip.innerHTML = `<span style="font-size:24px;">${matchFound.flag}</span> <b>${matchFound.nom}</b><br><span style="font-size:11px;color:gold;">Cliquez pour voir</span>`;
    } else if (isPausedByKeyboard && currentCountryProj.visible) {
        hoveredCountry = countries[currentIndex];
        canvas.style.cursor = 'pointer';
        tooltip.style.opacity = '1';
        tooltip.style.left = (currentCountryProj.x + 20) + 'px';
        tooltip.style.top = (currentCountryProj.y - 20) + 'px';
        tooltip.innerHTML = `<span style="font-size:24px;">${countries[currentIndex].flag}</span> <b>${countries[currentIndex].nom}</b><br><span style="font-size:11px;color:gold;">Défilement suspendu</span>`;
    } else {
        if (!isHoveringCanvas) hoveredCountry = null;
        canvas.style.cursor = 'default';
        tooltip.style.opacity = '0';
    }

    requestAnimationFrame(drawGlobe);
}

function project(lat, lon, cx, cy, r) {
    let radLat = lat * (Math.PI / 180);
    let radLon = lon * (Math.PI / 180);

    let x = r * Math.cos(radLat) * Math.sin(radLon);
    let y = -r * Math.sin(radLat);
    let z = r * Math.cos(radLat) * Math.cos(radLon);

    let x1 = x * Math.cos(viewRotY) - z * Math.sin(viewRotY);
    let z1 = x * Math.sin(viewRotY) + z * Math.cos(viewRotY);

    let y2 = y * Math.cos(viewRotX) - z1 * Math.sin(viewRotX);
    let z2 = y * Math.sin(viewRotX) + z1 * Math.cos(viewRotX);

    return { x: x1 + cx, y: y2 + cy, visible: z2 > 0 };
}

updateTargetRotation();
startTimer();
drawGlobe();

// Expose l'index de l'ile active pour la navbar (goToIsland)
window.currentIslandIndex = currentIndex;
setInterval(function () { window.currentIslandIndex = currentIndex; }, 500);
