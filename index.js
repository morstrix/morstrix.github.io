// --- ЛОГІКА ПЕРЕМИКАННЯ SUPPORT/HELPER ---
let currentSystem = 'support';
let touchStartX = 0;
let isSwiping = false;
let swipeDetected = false;

const windowEl = document.getElementById('futuristicWindow');
const slideSupport = document.getElementById('slideSupport');
const slideHelper = document.getElementById('slideHelper');
const indicator1 = document.getElementById('indicator1');
const indicator2 = document.getElementById('indicator2');
const systemStatus = document.getElementById('systemStatus');

// Функція перемикання
function switchTo(system) {
    if (system === currentSystem) return;
    
    if (system === 'support') {
        slideHelper.classList.remove('active');
        slideSupport.classList.add('active');
        indicator1.classList.add('active');
        indicator2.classList.remove('active');
        currentSystem = 'support';
    } else {
        slideSupport.classList.remove('active');
        slideHelper.classList.add('active');
        indicator2.classList.add('active');
        indicator1.classList.remove('active');
        currentSystem = 'helper';
    }
    
    windowEl.style.transform = 'scale(0.98)';
    setTimeout(() => {
        windowEl.style.transform = 'scale(1)';
    }, 100);
    
    if (navigator.vibrate) navigator.vibrate(10);
}

// Функція входу
function enterSystem() {
    const url = currentSystem === 'support' ? 'support.html' : 'helper.html';
    
    windowEl.style.transform = 'scale(0.95)';
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
        window.location.href = url;
    }, 200);
}

// КЛІК = ВХІД
windowEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!swipeDetected) {
        enterSystem();
    }
});

// СВАЙПИ
windowEl.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isSwiping = true;
    swipeDetected = false;
}, {passive: true});

windowEl.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    
    if (Math.abs(diff) > 5) {
        swipeDetected = true;
        const shift = Math.min(Math.max(diff, -15), 15);
        windowEl.style.transform = `translateX(${shift * 0.3}px)`;
    }
}, {passive: false});

windowEl.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    
    windowEl.style.transform = 'translateX(0)';
    
    if (Math.abs(swipeDistance) > 30) {
        swipeDetected = true;
        if (swipeDistance > 0) {
            switchTo('support');
        } else {
            switchTo('helper');
        }
    }
    
    isSwiping = false;
}, {passive: true});

// DRAG для миші
let mouseStartX = 0;
let isDragging = false;

windowEl.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isDragging = true;
    swipeDetected = false;
    e.preventDefault();
});

windowEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const diff = e.clientX - mouseStartX;
    if (Math.abs(diff) > 5) {
        swipeDetected = true;
        const shift = Math.min(Math.max(diff, -15), 15);
        windowEl.style.transform = `translateX(${shift * 0.3}px)`;
    }
});

window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    
    const diff = e.clientX - mouseStartX;
    windowEl.style.transform = 'translateX(0)';
    
    if (Math.abs(diff) > 30) {
        swipeDetected = true;
        if (diff > 0) {
            switchTo('support');
        } else {
            switchTo('helper');
        }
    }
    
    isDragging = false;
});

// КЛІК НА ІНДИКАТОРИ
indicator1.addEventListener('click', (e) => {
    e.stopPropagation();
    switchTo('support');
});

indicator2.addEventListener('click', (e) => {
    e.stopPropagation();
    switchTo('helper');
});

// --- ДИНАМІКА ФОРУМУ ---
(function() {
    const words = ["radio", "travel", "wellness", "money"];
    const decor = document.getElementById('forumDecor');
    if (decor) {
        let i = 0;
        setInterval(() => {
            i = (i + 1) % words.length;
            decor.style.setProperty('--dynamic-word', `"${words[i]}"`);
        }, 2000);
    }
})();

// ПЛАВНИЙ ПЕРЕХІД ДЛЯ ПОСИЛАНЬ
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        }
    });
});

// Запобігаємо виділенню тексту
document.addEventListener('selectstart', (e) => e.preventDefault());