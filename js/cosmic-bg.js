// ===== COSMIC BACKGROUND - Pure Deep Space Stars =====
(function() {
    const canvas = document.getElementById('cosmicCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    // Оптимизация: на мобильных уменьшаем количество частиц
    const CONFIG = {
        starCount: isMobile ? 200 : 400, // больше звёзд
        warpSpeed: 2,
        starColors: ['#ffffff', '#e0f0ff', '#fff0f5'],
        repelRadius: 100,
        twinkleChance: 0.3,
        maxDepth: 2000 // увеличенная глубина для чистого пространства
    };

    let width, height, centerX, centerY;
    let mouse = { x: -1000, y: -1000 };
    let animationId;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        centerX = width / 2;
        centerY = height / 2;
        canvas.width = width;
        canvas.height = height;
    }

    // ===== STAR CLASS - Warp Speed Effect =====
    class Star {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            // 3D координаты относительно центра
            this.x = (Math.random() - 0.5) * width * 3; // шире разброс
            this.y = (Math.random() - 0.5) * height * 3;
            this.z = initial ? Math.random() * CONFIG.maxDepth : CONFIG.maxDepth;
            this.pz = this.z;

            // Размер звезды (ближе = больше)
            this.baseSize = Math.random() * 3 + 1;

            // Цвет звезды
            this.color = CONFIG.starColors[Math.floor(Math.random() * CONFIG.starColors.length)];

            // Мерцание
            this.twinkle = Math.random() < CONFIG.twinkleChance;
            this.twinkleOffset = Math.random() * Math.PI * 2;
            this.brightness = 1;
        }

        update() {
            // Сохраняем предыдущую Z для шлейфа
            this.pz = this.z;

            // Движение на камеру (warp speed) - чем ближе, тем быстрее
            const speedFactor = 1 + (CONFIG.maxDepth - this.z) / CONFIG.maxDepth * 2;
            this.z -= CONFIG.warpSpeed * speedFactor;

            // Пересоздаём звезду если она "прошла" камеру
            if (this.z < 1) {
                this.reset();
            }

            // Мерцание
            if (this.twinkle) {
                this.brightness = 0.5 + Math.sin(Date.now() * 0.005 + this.twinkleOffset) * 0.5;
            }
        }

        draw() {
            // 3D -> 2D проекция с увеличенной перспективой
            const perspective = 600;
            const scale = perspective / this.z;
            const sx = this.x * scale + centerX;
            const sy = this.y * scale + centerY;
            const px = this.x * (perspective / this.pz) + centerX;
            const py = this.y * (perspective / this.pz) + centerY;

            // Размер и прозрачность зависят от глубины
            const size = Math.max(0.3, this.baseSize * scale);
            const alpha = Math.min(1, Math.max(0.05, (CONFIG.maxDepth - this.z) / CONFIG.maxDepth)) * this.brightness;

            // Рисуем шлейф (линию от предыдущей позиции)
            if (this.pz < 1000 && alpha > 0.3) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                ctx.lineWidth = size * 0.5;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }

            // Рисуем звезду как мягкое светящееся пятно (radial gradient)
            const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.4, `rgba(255, 255, 255, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = alpha * 0.8; // более прозрачное для мягкости
            ctx.beginPath();
            // Неопределённая форма - немного искажённый круг
            const irregularity = Math.sin(Date.now() * 0.001 + this.twinkleOffset) * 0.3;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const r = size * (1 + irregularity * (i % 2 === 0 ? 1 : -1));
                const px = sx + Math.cos(angle) * r;
                const py = sy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // ===== INITIALIZATION =====
    const stars = [];

    function init() {
        resize();

        // Создаём звёзды
        for (let i = 0; i < CONFIG.starCount; i++) {
            stars.push(new Star());
        }
    }

    // ===== ANIMATION LOOP =====
    function animate() {
        // Полная очистка без trail эффекта
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Обновляем и рисуем только звёзды - чистая глубина космоса
        for (const star of stars) {
            star.update();
            star.draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    // ===== EVENT LISTENERS =====
    window.addEventListener('resize', resize);

    // ===== START =====
    init();
    animate();
})();
