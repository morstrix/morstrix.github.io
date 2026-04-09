// background.js - универсальный звёздный фон для всех страниц
(function() {
    'use strict';
    
    // Создаём canvas, если его нет
    let canvas = document.getElementById('neuro-bg');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'neuro-bg';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.insertBefore(canvas, document.body.firstChild);
    }
    
    const ctx = canvas.getContext('2d');
    let w, h;
    let stars = [];
    let animationId = null;
    let isPageVisible = true;
    
    // Настройки
    const CONFIG = {
        STAR_COUNT: 300,
        SPEED: 2,
        MIN_SIZE: 1,
        MAX_SIZE: 5,
        TWINKLE_SPEED: 0.03
    };
    
    // Инициализация звёзд
    const initStars = () => {
        stars = Array.from({length: CONFIG.STAR_COUNT}, () => {
            // Случайный цвет звезды
            const colorType = Math.random();
            let r, g, b;
            
            if (colorType < 0.33) {
                // Холодный (голубоватый)
                r = 200 + Math.random() * 55;
                g = 220 + Math.random() * 35;
                b = 255;
            } else if (colorType < 0.66) {
                // Нейтральный
                r = 230 + Math.random() * 25;
                g = 230 + Math.random() * 25;
                b = 230 + Math.random() * 25;
            } else {
                // Тёплый (желтоватый)
                r = 255;
                g = 230 + Math.random() * 25;
                b = 200 + Math.random() * 55;
            }
            
            return {
                x: (Math.random() - 0.5) * w * 3,
                y: (Math.random() - 0.5) * h * 3,
                z: Math.random() * w + 50,
                baseR: r,
                baseG: g,
                baseB: b,
                brightness: Math.random() * 0.4 + 0.6,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            };
        });
    };
    
    // Обновление размера canvas
    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        
        // Пересоздаём звёзды при изменении размера
        if (stars.length > 0) {
            initStars();
        }
    };
    
    // Отрисовка звезды
    const drawStar = (star) => {
        // Движение к зрителю
        star.z -= CONFIG.SPEED;
        
        // Пересоздаём звезду, если улетела
        if (star.z <= 0) {
            star.z = w + 100;
            star.x = (Math.random() - 0.5) * w * 3;
            star.y = (Math.random() - 0.5) * h * 3;
            
            // Обновляем цвет
            const colorType = Math.random();
            if (colorType < 0.33) {
                star.baseR = 200 + Math.random() * 55;
                star.baseG = 220 + Math.random() * 35;
                star.baseB = 255;
            } else if (colorType < 0.66) {
                star.baseR = 230 + Math.random() * 25;
                star.baseG = 230 + Math.random() * 25;
                star.baseB = 230 + Math.random() * 25;
            } else {
                star.baseR = 255;
                star.baseG = 230 + Math.random() * 25;
                star.baseB = 200 + Math.random() * 55;
            }
            return;
        }
        
        // 3D проекция
        const scale = 300 / star.z;
        const screenX = (star.x * scale) + w/2;
        const screenY = (star.y * scale) + h/2;
        
        // Размер зависит от расстояния
        const size = Math.min(CONFIG.MAX_SIZE, Math.max(CONFIG.MIN_SIZE, 5 * (1 - star.z / (w + 100))));
        
        // Мерцание
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const distanceFactor = 1 - (star.z / (w + 100));
        const finalBrightness = star.brightness * distanceFactor * twinkle;
        const alpha = Math.min(1, finalBrightness * 1.5);
        
        // Рисуем только видимые звёзды
        if (screenX > -20 && screenX < w + 20 && screenY > -20 && screenY < h + 20) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${Math.floor(star.baseR)}, ${Math.floor(star.baseG)}, ${Math.floor(star.baseB)})`;
            ctx.fillRect(screenX, screenY, size, size);
            
            // Ореол для ярких звёзд
            if (size > 3 && alpha > 0.5) {
                ctx.globalAlpha = alpha * 0.4;
                ctx.fillRect(screenX - 1, screenY - 1, size + 2, size + 2);
            }
        }
    };
    
    // Анимация
    const draw = () => {
        if (!isPageVisible) return;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        
        stars.forEach(drawStar);
        
        animationId = requestAnimationFrame(draw);
    };
    
    // Обработка видимости страницы (экономия ресурсов)
    const handleVisibilityChange = () => {
        isPageVisible = !document.hidden;
        if (isPageVisible && !animationId) {
            draw();
        }
    };
    
    // Запуск
    const init = () => {
        resize();
        initStars();
        draw();
        
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
    };
    
    // Очистка при выгрузке страницы
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
    
    // Стартуем когда DOM загружен
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
