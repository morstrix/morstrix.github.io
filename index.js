// ==================== LOGICA SUPPORT/HELPER ====================
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

    // Свайпы
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

    // Мышь (Drag)
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

// ==================== СОЦИАЛЬНЫЕ СЕТИ (TEAM POPUP) ====================
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('socialPopup');
    
    // Создаем структуру попапа, если её нет
    if (!popup) {
        const newPopup = document.createElement('div');
        newPopup.id = 'socialPopup';
        newPopup.className = 'social-popup';
        newPopup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <span class="popup-title" id="popupTitle">SOCIAL</span>
                    <button class="popup-close" id="closePopup">×</button>
                </div>
                <div id="popupIcons"></div>
            </div>
        `;
        document.body.appendChild(newPopup);
    }
    
    const finalPopup = document.getElementById('socialPopup');
    const finalPopupTitle = document.getElementById('popupTitle');
    const finalPopupIcons = document.getElementById('popupIcons');
    const finalClosePopup = document.getElementById('closePopup');

    const socialData = {
        team: {
            title: 'TXT',
            content: `
                <div class="team-popup-container">
                    <a href="a.html" class="team-member">
                        <img src="a.png" alt="DES">
                        <span>designer</span>
                    </a>
                    <a href="x.html" class="team-member">
                        <img src="x.png" alt="DEV">
                        <span>developer</span>
                    </a>
                </div>
            `
        }
    };

    function openSocialPopup(type) {
        const data = socialData[type];
        if (!data) return;
        
        if (finalPopupTitle) finalPopupTitle.textContent = data.title;
        if (finalPopupIcons) finalPopupIcons.innerHTML = data.content;
        
        if (finalPopup) finalPopup.classList.add('active');
        if (navigator.vibrate) navigator.vibrate(10);
    }

    function closeSocialPopup() {
        if (finalPopup) finalPopup.classList.remove('active');
    }

    // Обработка кнопки TEAM
    document.querySelectorAll('.social-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const type = trigger.dataset.type;
            openSocialPopup(type);
        });
    });

    if (finalClosePopup) finalClosePopup.addEventListener('click', closeSocialPopup);
    
    if (finalPopup) {
        finalPopup.addEventListener('click', (e) => {
            if (e.target === finalPopup) closeSocialPopup();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSocialPopup();
    });
});

// Запрет выделения текста
document.addEventListener('selectstart', (e) => e.preventDefault());