// ==================== LOGICA SUPPORT/HELPER ====================
// Функция генерации 8-битного звука
const playSound = (type) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } 
};

let currentSystem = 'support';
let touchStartX = 0;
let isSwiping = false;
let swipeDetected = false;

const windowEl = document.getElementById('futuristicWindow');
const slideSupport = document.getElementById('slideSupport');
const slideHelper = document.getElementById('slideHelper');
const indicator1 = document.getElementById('indicator1');
const indicator2 = document.getElementById('indicator2');

function switchTo(system) {
    if (system === currentSystem) return;
    
    if (typeof playSound === 'function') playSound('select');

    if (navigator.vibrate) {
        navigator.vibrate([20, 10, 20]); 
    }

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
    
    windowEl.style.transform = 'scale(0.96)';
    setTimeout(() => {
        windowEl.style.transform = 'scale(1)';
    }, 100);
}

function enterSystem() {
    const url = currentSystem === 'support' ? 'support.html' : 'helper.html';
    windowEl.style.transform = 'scale(0.95)';
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    setTimeout(() => {
        window.location.href = url;
    }, 200);
}

if (windowEl) {
    windowEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!swipeDetected) enterSystem();
    });

    windowEl.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
        swipeDetected = false;
    }, {passive: true});

    windowEl.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
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
            if (swipeDistance > 0) switchTo('support');
            else switchTo('helper');
        }
        isSwiping = false;
    }, {passive: true});

    let mouseStartX = 0;
    let isDragging = false;

    windowEl.addEventListener('mousedown', (e) => {
        mouseStartX = e.clientX;
        isDragging = true;
        swipeDetected = false;
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
            if (diff > 0) switchTo('support');
            else switchTo('helper');
        }
        isDragging = false;
    });

    if (indicator1) indicator1.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTo('support');
    });

    if (indicator2) indicator2.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTo('helper');
    });
}

// ==================== ДИНАМИКА ФОРУМА ====================
(function() {
    const words = ["wellness", "travel", "english", "money", "radio"];
    // Теперь находим конкретный span по ID, который мы добавили в HTML
    const wordElement = document.getElementById('dynamicWord');
    
    if (wordElement) {
        let i = 0;
        setInterval(() => {
            i = (i + 1) % words.length;
            // Обновляем текст напрямую
            wordElement.textContent = words[i];
        }, 2000);
    }
})();

// ==================== ПЛАВНЫЙ ПЕРЕХОД ДЛЯ ВСЕХ ССЫЛОК ====================
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !link.target) {
            e.preventDefault();
            
            if (navigator.vibrate) navigator.vibrate(10);
            
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        }
    });
});

// Найди этот кусок в конце index.js и замени его:
document.addEventListener('DOMContentLoaded', () => {
    // Привязываем элементы
    const finalPopup = document.getElementById('instaModal');
    const finalPopupTitle = document.getElementById('finalPopupTitle');
    const finalPopupIcons = document.getElementById('finalPopupIcons');
    const finalClosePopup = document.getElementById('finalClosePopup');

    // index.js (Отрезок кода внутри document.addEventListener('DOMContentLoaded', ...))

    const socialData = {
        instagram: {
            title: "TEAM",
            // Мы меняем HTML содержимое попапа
            content: `
                <div class="insta-grid" style="display:flex; gap:30px; justify-content:center; margin-top:20px;">
                    
                    <a href="a.html" class="popup-team-member" style="text-align:center; text-decoration:none; color:#fff;">
                        <div class="popup-icon-wrap">
                            <img src="assets/a.png" alt="Ada Feed" class="popup-icon-img">
                        </div>
                        <span style="font-size:8px;">designer</span>
                    </a>

                    <a href="x.html" class="popup-team-member" style="text-align:center; text-decoration:none; color:#fff;">
                        <div class="popup-icon-wrap">
                            <img src="assets/x.png" alt="Dev Feed" class="popup-icon-img">
                        </div>
                        <span style="font-size:8px;">developer</span>
                    </a>

                </div>
            `
        }
    };

    // Остальной код (openSocialPopup, closeSocialPopup) оставляем БЕЗ ИЗМЕНЕНИЙ.

    function openSocialPopup(type) {
        const data = socialData[type];
        if (!data || !finalPopup) return;
        
        if (finalPopupTitle) finalPopupTitle.textContent = data.title;
        if (finalPopupIcons) finalPopupIcons.innerHTML = data.content;
        
        finalPopup.style.display = 'flex'; // Принудительно показываем
        finalPopup.classList.add('active');
    }

    function closeSocialPopup() {
        if (finalPopup) {
            finalPopup.style.display = 'none';
            finalPopup.classList.remove('active');
        }
    }

    // Вешаем клик на все триггеры
    document.querySelectorAll('.social-trigger').forEach(trigger => {
        trigger.onclick = (e) => {
            const type = trigger.getAttribute('data-type');
            openSocialPopup(type);
        };
    });

    if (finalClosePopup) finalClosePopup.onclick = closeSocialPopup;
});

// РАДИО КНОПКА
const radioBtn = document.getElementById('radioBtn');
const radioModal = document.getElementById('radioModal');
if (radioBtn) {
    radioBtn.onclick = () => {
        radioModal.classList.add('active');
    };
}