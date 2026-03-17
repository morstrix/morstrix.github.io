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

// --- ПЛАВНИЙ ПЕРЕХІД ДЛЯ ПОСИЛАНЬ ---
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

// --- СПЛИВАЮЧЕ ВІКНО ДЛЯ СОЦМЕРЕЖ ---
const popup = document.getElementById('socialPopup');
const popupTitle = document.getElementById('popupTitle');
const popupIcons = document.getElementById('popupIcons');
const closePopup = document.getElementById('closePopup');

// SVG іконки
const socialIcons = {
    instagram: `<svg class="popup-icon" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
    </svg>`,
    
    tiktok: `<svg class="popup-icon" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.25-1.33 2.1-.1.7.07 1.42.47 2.01.39.55.96.93 1.6 1.11.82.24 1.7.13 2.41-.3.67-.41 1.07-1.11 1.14-1.89.07-2.13.05-4.27.05-6.41V0z"/>
    </svg>`,
    
    linkedin: `<svg class="popup-icon" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>`
};

const socialData = {
    ada: {
        title: 'ADA (DES)',
        links: [
            { url: 'https://instagram.com/a.mrsva', icon: socialIcons.instagram, name: 'INSTAGRAM' },
            { url: 'https://linkedin.com/in/a.mrsva', icon: socialIcons.linkedin, name: 'LINKEDIN' }
        ]
    },
    exs: {
        title: 'EX (DEV)',
        links: [
            { url: 'https://instagram.com/grimexframe', icon: socialIcons.instagram, name: 'INSTAGRAM' },
            { url: 'https://tiktok.com/@grimexframe', icon: socialIcons.tiktok, name: 'TIKTOK' }
        ]
    }
};

function openSocialPopup(type) {
    const data = socialData[type];
    if (!data) return;
    
    popupTitle.textContent = data.title;
    
    popupIcons.innerHTML = data.links.map(link => `
        <a href="${link.url}" target="_blank" class="popup-icon-link">
            ${link.icon}
            <span class="popup-icon-name">${link.name}</span>
        </a>
    `).join('');
    
    popup.classList.add('active');
    if (navigator.vibrate) navigator.vibrate(10);
}

function closeSocialPopup() {
    popup.classList.remove('active');
}

// Тригери на нижні іконки
document.querySelectorAll('.social-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const type = trigger.dataset.type;
        openSocialPopup(type);
    });
});

// Закриття попапу
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        closeSocialPopup();
    }
});

closePopup.addEventListener('click', closeSocialPopup);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
        closeSocialPopup();
    }
});

// Запобігаємо виділенню тексту
document.addEventListener('selectstart', (e) => e.preventDefault());