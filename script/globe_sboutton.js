// Fichier : globe_sboutton.js
(function() {
    const container = document.getElementById('globe-sans-boutons');
    if (!container) return;

    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // SÉCURITÉ CSS : On force le canvas à ne jamais déborder du carré
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    container.appendChild(canvas);

    let width, height, radius;
    function resize() {
        // On prend la taille réelle calculée par le navigateur dans le CSS
        width = canvas.width = container.clientWidth || 300;
        height = canvas.height = container.clientHeight || 350;
        radius = Math.min(width, height) * 0.4;
    }
    
    // Double déclenchement pour éviter le bug du chargement Flexbox
    resize();
    setTimeout(resize, 100); 
    
    window.addEventListener('resize', resize);

    let angleX = 0.3;
    let angleY = 0;
    let isDragging = false;
    let previousMouseX, previousMouseY;

    const points = [];
    for (let lat = -80; lat <= 80; lat += 20) {
        const radLat = (lat * Math.PI) / 180;
        for (let lon = 0; lon < 360; lon += 18) {
            const radLon = (lon * Math.PI) / 180;
            points.push({
                x: Math.cos(radLat) * Math.sin(radLon),
                y: Math.sin(radLat),
                z: Math.cos(radLat) * Math.cos(radLon)
            });
        }
    }

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
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

    function animate() {
        ctx.clearRect(0, 0, width, height);

        if (!isDragging) {
            angleY += 0.002;
        }

        const cx = width / 2;
        const cy = height / 2;

        const transformedPoints = points.map(p => {
            let y1 = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
            let z1 = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
            let x2 = p.x * Math.cos(angleY) - z1 * Math.sin(angleY);
            let z2 = p.x * Math.sin(angleY) + z1 * Math.cos(angleY);
            return { x: x2, y: y1, z: z2 };
        }).sort((a, b) => a.z - b.z);

        transformedPoints.forEach(p => {
            if (p.z < -0.1) return; 

            const screenX = cx + p.x * radius;
            const screenY = cy - p.y * radius;
            const size = (p.z + 1) * 2;

            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
})();