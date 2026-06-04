// Fichier : globe_boutton.js
(function() {
    const container = document.getElementById('globe-avec-boutons');
    if (!container) return;

    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    let width, height, radius;
    function resize() {
        width = canvas.width = container.clientWidth;
        height = canvas.height = 300; 
        radius = Math.min(width, height) * 0.4;
    }
    resize();
    window.addEventListener('resize', resize);

    // Uniquement Île A et Île B en exemple
    const destinations = {
        ileA: { x: 0.2, y: 1.1, label: "Île A", lat: 15, lon: -61 },
        ileB: { x: -0.35, y: -1.0, label: "Île B", lat: -21, lon: 55 }
    };

    let angleX = 0;
    let angleY = 0;
    let targetX = 0;
    let targetY = 0;
    let isAnimatingToTarget = false;
    let isDragging = false;
    let previousMouseX, previousMouseY;

    const points = [];
    // 1. Génération de la grille normale
    for (let lat = -80; lat <= 80; lat += 20) {
        const radLat = (lat * Math.PI) / 180;
        for (let lon = 0; lon < 360; lon += 18) {
            const radLon = (lon * Math.PI) / 180;
            points.push({
                x: Math.cos(radLat) * Math.sin(radLon),
                y: Math.sin(radLat),
                z: Math.cos(radLat) * Math.cos(radLon),
                isIsland: false
            });
        }
    }

    // 2. Injection des points jaunes des Îles sur le globe
    Object.keys(destinations).forEach(key => {
        const isl = destinations[key];
        const radLat = (isl.lat * Math.PI) / 180;
        const radLon = (isl.lon * Math.PI) / 180;
        points.push({
            x: Math.cos(radLat) * Math.sin(radLon),
            y: Math.sin(radLat),
            z: Math.cos(radLat) * Math.cos(radLon),
            isIsland: true // Repère pour le dessiner en jaune !
        });
    });

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        isAnimatingToTarget = false;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        angleY += (e.clientX - previousMouseX) * 0.005;
        angleX += (e.clientY - previousMouseY) * 0.005;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => isDragging = false);

    // Création des 2 boutons d'exemple en dessous
    const btnWrapper = document.createElement('div');
    btnWrapper.style.display = 'flex';
    btnWrapper.style.gap = '15px';
    btnWrapper.style.marginTop = '10px';
    btnWrapper.style.zIndex = '10';

    Object.keys(destinations).forEach(key => {
        const btn = document.createElement('button');
        btn.innerText = destinations[key].label;
        btn.style.background = 'rgba(255, 215, 0, 0.15)';
        btn.style.color = '#ffd700';
        btn.style.border = '1px solid #ffd700';
        btn.style.padding = '8px 16px';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '13px';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'all 0.3s';

        btn.addEventListener('mouseover', () => {
            btn.style.background = '#ffd700';
            btn.style.color = '#000';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.background = 'rgba(255, 215, 0, 0.15)';
            btn.style.color = '#ffd700';
        });

        btn.addEventListener('click', () => {
            targetX = destinations[key].x;
            targetY = destinations[key].y;
            isAnimatingToTarget = true;
        });
        btnWrapper.appendChild(btn);
    });
    container.appendChild(btnWrapper);

    function animate() {
        ctx.clearRect(0, 0, width, height);

        if (isAnimatingToTarget && !isDragging) {
            angleX += (targetX - angleX) * 0.08;
            angleY += (targetY - angleY) * 0.08;
            if (Math.abs(targetX - angleX) < 0.001 && Math.abs(targetY - angleY) < 0.001) {
                isAnimatingToTarget = false;
            }
        } else if (!isDragging) {
            angleY += 0.001;
        }

        const cx = width / 2;
        const cy = height / 2;

        const transformedPoints = points.map(p => {
            let y1 = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
            let z1 = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
            let x2 = p.x * Math.cos(angleY) - z1 * Math.sin(angleY);
            let z2 = p.x * Math.sin(angleY) + z1 * Math.cos(angleY);
            return { x: x2, y: y1, z: z2, isIsland: p.isIsland };
        }).sort((a, b) => a.z - b.z);

        transformedPoints.forEach(p => {
            if (p.z < -0.1) return;
            const screenX = cx + p.x * radius;
            const screenY = cy - p.y * radius;
            
            // Les îles sont dessinées plus grosses
            const size = p.isIsland ? 6 : (p.z + 1) * 1.5;

            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            
            if (p.isIsland) {
                ctx.fillStyle = '#ffd700'; // POINT JAUNE POUR LES ILES
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#ffd700';
            } else {
                ctx.fillStyle = 'rgba(0, 215, 255, 0.3)'; // Grille bleue
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0; // Reset ombre
        });

        requestAnimationFrame(animate);
    }
    animate();
})();