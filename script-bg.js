const canvas = document.getElementById('neuro-bg');
const ctx = canvas.getContext('2d');
let w, h;
let stars = [];

const init = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    
    // Звезды в 3D пространстве
    stars = Array.from({length: 300}, () => {
        // Случайный оттенок белого (теплый/холодный)
        const colorType = Math.random();
        let r, g, b;
        
        if (colorType < 0.33) {
            // Холодный белый (голубоватый)
            r = 200 + Math.random() * 55;
            g = 220 + Math.random() * 35;
            b = 255;
        } else if (colorType < 0.66) {
            // Нейтральный белый
            r = 230 + Math.random() * 25;
            g = 230 + Math.random() * 25;
            b = 230 + Math.random() * 25;
        } else {
            // Теплый белый (желтоватый)
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
            brightness: Math.random() * 0.7 + 0.3, // базовая яркость
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            twinklePhase: Math.random() * Math.PI * 2
        };
    });
};

const draw = () => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    stars.forEach(star => {
        // Двигаем звезду к нам
        star.z -= 2;
        
        // Если звезда пролетела мимо, создаем новую вдалеке
        if (star.z <= 0) {
            star.z = w + 100;
            star.x = (Math.random() - 0.5) * w * 3;
            star.y = (Math.random() - 0.5) * h * 3;
            
            // Обновляем цвет для новой звезды
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
        }
        
        // Проекция 3D на 2D
        const scale = 300 / star.z;
        const screenX = (star.x * scale) + w/2;
        const screenY = (star.y * scale) + h/2;
        
        // Размер зависит от расстояния
        const size = Math.max(1, 5 * (1 - star.z / (w + 100)));
        
        // Мерцание звезды
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        
        // Яркость зависит от расстояния и мерцания
        const distanceFactor = Math.max(0.3, 1 - (star.z / (w + 100)) * 0.5);
        const finalBrightness = star.brightness * distanceFactor * twinkle;
        
        // Прозрачность (дальние звезды более прозрачные)
        const alpha = Math.min(1, finalBrightness * (1 - star.z / (w + 200)));
        
        // Рисуем звезду
        if (screenX > -20 && screenX < w + 20 && screenY > -20 && screenY < h + 20) {
            // Основная звезда
            ctx.fillStyle = `rgba(${Math.floor(star.baseR)}, ${Math.floor(star.baseG)}, ${Math.floor(star.baseB)}, ${alpha})`;
            ctx.fillRect(screenX, screenY, size, size);
            
            // Добавляем ореол для ярких звезд
            if (size > 3 && alpha > 0.5) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = `rgb(${Math.floor(star.baseR)}, ${Math.floor(star.baseG)}, ${Math.floor(star.baseB)})`;
                ctx.fillRect(screenX - 1, screenY - 1, size + 2, size + 2);
                ctx.globalAlpha = 1;
            }
            
            // Иногда добавляем хвост для очень близких звезд
            if (size > 4) {
                ctx.globalAlpha = alpha * 0.2;
                ctx.fillStyle = `rgb(${Math.floor(star.baseR)}, ${Math.floor(star.baseG)}, ${Math.floor(star.baseB)})`;
                
                // Хвост в направлении от центра
                const dirX = screenX - w/2;
                const dirY = screenY - h/2;
                const length = Math.min(20, size * 3);
                
                if (Math.abs(dirX) > Math.abs(dirY)) {
                    ctx.fillRect(screenX - (dirX > 0 ? length : -length), screenY, size, size);
                } else {
                    ctx.fillRect(screenX, screenY - (dirY > 0 ? length : -length), size, size);
                }
                
                ctx.globalAlpha = 1;
            }
        }
    });
    
    requestAnimationFrame(draw);
};

window.onresize = init;
init();
draw();