(function() {
    const canvas = document.getElementById('cosmicCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.6);

    const CONFIG = {
        particleCount: prefersReducedMotion ? 90 : (isMobile ? 170 : 280),
        farCount: prefersReducedMotion ? 35 : (isMobile ? 60 : 90),
        maxDepth: 1800,
        baseSpeed: prefersReducedMotion ? 90 : (isMobile ? 175 : 235),
        focalLength: isMobile ? 430 : 520,
        centerDrift: 0.038,
        farTwinkle: 0.0018
    };

    let width = 0;
    let height = 0;
    let cssWidth = 0;
    let cssHeight = 0;
    let centerX = 0;
    let centerY = 0;
    let animationId = 0;
    let lastTime = 0;

    const target = {
        x: 0,
        y: 0,
        currentX: 0,
        currentY: 0
    };

    class WarpParticle {
        constructor(layer = 'main') {
            this.layer = layer;
            this.reset(true);
            this.seed = Math.random() * Math.PI * 2;
        }

        reset(initial = false) {
            const spread = this.layer === 'far' ? 1.35 : 2.4;
            this.x = (Math.random() - 0.5) * cssWidth * spread;
            this.y = (Math.random() - 0.5) * cssHeight * spread;
            this.z = initial ? Math.random() * CONFIG.maxDepth : CONFIG.maxDepth;
            this.prevZ = this.z;
            this.radius = this.layer === 'far' ? Math.random() * 0.8 + 0.35 : Math.random() * 1.4 + 0.55;
            this.hueShift = Math.random();
            this.alpha = this.layer === 'far' ? Math.random() * 0.5 + 0.2 : Math.random() * 0.45 + 0.45;
        }

        update(delta, now) {
            this.prevZ = this.z;
            const depthBoost = 1 + (1 - this.z / CONFIG.maxDepth) * (this.layer === 'far' ? 0.6 : 1.75);
            this.z -= CONFIG.baseSpeed * depthBoost * delta;

            if (this.layer === 'far') {
                this.alpha = 0.28 + (Math.sin(now * CONFIG.farTwinkle + this.seed) + 1) * 0.12;
            }

            if (this.z <= 1) this.reset();
        }

        draw() {
            const scale = CONFIG.focalLength / this.z;
            const prevScale = CONFIG.focalLength / this.prevZ;
            const sx = (this.x + target.currentX * 28) * scale + centerX;
            const sy = (this.y + target.currentY * 20) * scale + centerY;
            const px = (this.x + target.currentX * 28) * prevScale + centerX;
            const py = (this.y + target.currentY * 20) * prevScale + centerY;

            if (sx < -120 || sx > cssWidth + 120 || sy < -120 || sy > cssHeight + 120) {
                return;
            }

            const projectedRadius = Math.max(0.4, this.radius * scale * (this.layer === 'far' ? 0.8 : 1.2));
            const depthAlpha = Math.min(1, Math.max(0.04, 1 - this.z / CONFIG.maxDepth));
            const alpha = depthAlpha * this.alpha;
            const tailAlpha = this.layer === 'far' ? alpha * 0.08 : alpha * 0.24;

            if (this.layer !== 'far' && this.prevZ < CONFIG.maxDepth - 30) {
                ctx.strokeStyle = `rgba(255, 236, 240, ${tailAlpha})`;
                ctx.lineWidth = Math.max(0.45, projectedRadius * 0.75);
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }

            const glowRadius = projectedRadius * (this.layer === 'far' ? 3.5 : 5.5);
            const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
            gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
            gradient.addColorStop(0.22, this.layer === 'far'
                ? `rgba(201, 215, 255, ${alpha * 0.55})`
                : `rgba(255, 214, 224, ${alpha * 0.72})`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.layer === 'far'
                ? `rgba(220, 232, 255, ${alpha * 0.95})`
                : `rgba(255, 250, 252, ${Math.min(1, alpha + 0.08)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, projectedRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const farParticles = [];
    const mainParticles = [];

    function buildParticles() {
        farParticles.length = 0;
        mainParticles.length = 0;

        for (let i = 0; i < CONFIG.farCount; i++) farParticles.push(new WarpParticle('far'));
        for (let i = 0; i < CONFIG.particleCount; i++) mainParticles.push(new WarpParticle('main'));
    }

    function resize() {
        cssWidth = window.innerWidth;
        cssHeight = window.innerHeight;
        width = Math.round(cssWidth * dpr);
        height = Math.round(cssHeight * dpr);
        centerX = width / 2;
        centerY = height / 2;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        centerX = cssWidth / 2;
        centerY = cssHeight / 2;

        buildParticles();
    }

    function drawBackground() {
        const bg = ctx.createLinearGradient(0, 0, 0, cssHeight);
        bg.addColorStop(0, '#020204');
        bg.addColorStop(0.45, '#05060a');
        bg.addColorStop(1, '#09070b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        const nebula = ctx.createRadialGradient(
            centerX + target.currentX * 120,
            centerY + target.currentY * 80,
            0,
            centerX,
            centerY,
            Math.max(cssWidth, cssHeight) * 0.75
        );
        nebula.addColorStop(0, 'rgba(88, 24, 44, 0.15)');
        nebula.addColorStop(0.35, 'rgba(50, 14, 24, 0.08)');
        nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
    }

    function drawVignette() {
        const vignette = ctx.createRadialGradient(centerX, centerY, cssHeight * 0.18, centerX, centerY, cssHeight * 0.82);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.68, 'rgba(0, 0, 0, 0.1)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
    }

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = Math.min(0.033, (timestamp - lastTime) / 1000 || 0.016);
        lastTime = timestamp;

        target.currentX += (target.x - target.currentX) * CONFIG.centerDrift;
        target.currentY += (target.y - target.currentY) * CONFIG.centerDrift;

        drawBackground();

        for (let i = 0; i < farParticles.length; i++) {
            farParticles[i].update(delta, timestamp);
            farParticles[i].draw();
        }

        for (let i = 0; i < mainParticles.length; i++) {
            mainParticles[i].update(delta, timestamp);
            mainParticles[i].draw();
        }

        drawVignette();
        animationId = window.requestAnimationFrame(animate);
    }

    function handlePointerMove(event) {
        const x = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
        const y = 'touches' in event ? event.touches[0]?.clientY : event.clientY;
        if (typeof x !== 'number' || typeof y !== 'number') return;

        target.x = (x / cssWidth - 0.5) * 2;
        target.y = (y / cssHeight - 0.5) * 2;
    }

    function handlePointerLeave() {
        target.x = 0;
        target.y = 0;
    }

    resize();
    animate(0);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });
    window.addEventListener('pagehide', () => window.cancelAnimationFrame(animationId), { once: true });
})();
