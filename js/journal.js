import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, orderBy, query, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
    authDomain: "helper-e10b2.firebaseapp.com",
    projectId: "helper-e10b2",
    storageBucket: "helper-e10b2.firebasestorage.app",
    messagingSenderId: "131536876451",
    appId: "1:131536876451:web:eeaef494c83dfc4849e016",
    measurementId: "G-KPM4SEVG8R"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let lenis;
let currentPage = 1;
const totalPages = 6;
let isScrolling = false;

// --- ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ DOM ---
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    setupEventListeners();
    loadCurrentArt();
    initCarousel();
    populateVoiceList();
    loadTopPlayers();
    switchForumTab('wellness');
});

// --- LENIS SETUP ---
function initLenis() {
    if (typeof Lenis === 'undefined') {
        console.error('Lenis library not loaded! Check the script tag in HTML.');
        return;
    }

    const wrapper = document.getElementById('journalWrapper');
    if (!wrapper) return;

    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'horizontal', // Горизонтальный скролл
        gestureDirection: 'horizontal', // Реагирует на свайпы влево-вправо
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: true, // Включаем плавность для тачскринов
        touchMultiplier: 2,
        infinite: false,
        target: wrapper, // Скроллим именно этот контейнер
    });

    // Синхронизация анимации
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Обновление активной точки при скролле
    lenis.on('scroll', ({ scroll }) => {
        const width = window.innerWidth;
        const newPage = Math.round(scroll / width) + 1;
        
        if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
            updateActivePage(newPage);
        }
    });
}

// --- НАВИГАЦИЯ ---
window.scrollToPage = function(pageNum) {
    if (!lenis) return;
    
    const width = window.innerWidth;
    const targetPosition = (pageNum - 1) * width;
    
    lenis.scrollTo(targetPosition, {
        offset: 0,
        immediate: false,
        duration: 1.5, // Чуть быстрее для кликов по меню
        easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
    });
    
    updateActivePage(pageNum);
    closeAllModals(); // Закрываем модалку при выборе пункта
};

function updateActivePage(pageNum) {
    currentPage = pageNum;
    document.querySelectorAll('.page-dot').forEach(dot => dot.classList.remove('active'));
    const activeDot = document.querySelector(`.page-dot[data-page="${pageNum}"]`);
    if (activeDot) activeDot.classList.add('active');
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---
function setupEventListeners() {
    // Клавиша Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // Клик вне модалки
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    // Табы форума
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab) switchForumTab(tab);
        });
    });

    // Инпуты
    const stylerInput = document.getElementById('stylerInput');
    if (stylerInput) stylerInput.addEventListener('input', updateStylerPreview);

    const ttsInput = document.getElementById('ttsInput');
    if (ttsInput) ttsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') speakText();
    });
    
    // Пересчет ширины при ресайзе окна (чтобы скролл не сбивался)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if(lenis) {
                const currentScroll = lenis.scroll;
                const width = window.innerWidth;
                const newPage = Math.round(currentScroll / width);
                // Небольшая коррекция позиции, если нужно, но Lenis обычно справляется сам
            }
        }, 200);
    });
}

// --- ФУНКЦИИ МОДАЛОК ---
window.openContentsModal = function() {
    const modal = document.getElementById('contentsModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('Modal #contentsModal not found');
    }
};

window.closeAllModals = function() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    const pMenu = document.getElementById('pinterestMenu');
    if (pMenu) pMenu.style.display = 'none';
};

window.openArchiveModal = () => document.getElementById('archiveModal')?.classList.add('active');
window.openPaintModal = () => document.getElementById('paintModal')?.classList.add('active');
window.openTwitterModal = () => document.getElementById('twitterModal')?.classList.add('active');
window.openSpotifyModal = () => document.getElementById('spotifyModal')?.classList.add('active');

window.togglePinterestMenu = function() {
    const menu = document.getElementById('pinterestMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    }
};

window.openPinterestModal = function() {
    const modal = document.getElementById('pinterestModal');
    if (modal) {
        modal.classList.add('active');
        window.togglePinterestMenu();
        
        // Динамическая загрузка Pinterest
        if (!document.querySelector('#pinterest-js')) {
            const script = document.createElement('script');
            script.id = 'pinterest-js';
            script.src = '//assets.pinterest.com/js/pinit.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }
};

window.openSupportModal = function() {
    const modal = document.getElementById('supportModal');
    const container = document.getElementById('telegram-comments');
    if (modal && container) {
        modal.classList.add('active');
        if (container.innerHTML.trim() === '') {
            const script = document.createElement('script');
            script.async = true;
            script.src = "https://telegram.org/js/telegram-widget.js?22";
            script.setAttribute('data-telegram-comments', 'morstrix/71');
            script.setAttribute('data-width', '100%');
            script.setAttribute('data-height', '700px');
            container.appendChild(script);
        }
    }
};

// --- ЛОГИКА СТРАНИЦ ---

// Page 1: Art
function loadCurrentArt() {
    const savedArt = localStorage.getItem('morstrix_current_art');
    const img = document.getElementById('currentArtPreview');
    if (savedArt && img) img.src = savedArt;
}

// Page 2: Carousel
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    let currentIndex = 0;
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 3000);
}

// Page 3: Fonts
const FONT_MAP = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
    'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
};

function updateStylerPreview() {
    const input = document.getElementById('stylerInput');
    const preview = document.getElementById('stylerPreview');
    if (!input || !preview) return;
    let text = input.value.toLowerCase();
    let result = '';
    for (let char of text) result += FONT_MAP[char] || char;
    preview.textContent = result || 'Preview will appear here';
}

window.copyToClipboard = function() {
    const preview = document.getElementById('stylerPreview');
    if (preview && preview.textContent) {
        navigator.clipboard.writeText(preview.textContent).then(() => alert('Copied!'));
    }
};

window.downloadArchive = function() {
    const link = document.createElement('a');
    link.href = 'assets/morstrix_archive.zip';
    link.download = 'morstrix_archive.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Page 4: Sound
let voices = [];
function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

window.speakText = function() {
    const textInput = document.getElementById('ttsInput');
    const voiceSelect = document.getElementById('voiceSelect');
    const statusDiv = document.getElementById('ttsStatus');
    if (!textInput || !voiceSelect || !statusDiv) return;

    const text = textInput.value;
    if (text.trim()) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voices[voiceSelect.value]) utterance.voice = voices[voiceSelect.value];
        statusDiv.textContent = 'Speaking...';
        speechSynthesis.speak(utterance);
        utterance.onend = () => statusDiv.textContent = 'Finished.';
        utterance.onerror = () => statusDiv.textContent = 'Error.';
    }
};

// Page 5: Top Players
async function loadTopPlayers() {
    const container = document.getElementById('topPlayersList');
    if (!container) return;

    try {
        const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            container.innerHTML = '';
            let rank = 1;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = 'player-item';
                item.textContent = `${rank}. ${data.name || 'UNKNOWN'} ${data.score || 0}`;
                container.appendChild(item);
                rank++;
            });
            return;
        }
        throw new Error("Empty");
    } catch (error) {
        // Fallback mock data
        const mockData = [
            { name: 'PLAYER1', score: 999 }, { name: 'PLAYER2', score: 888 },
            { name: 'PLAYER3', score: 777 }, { name: 'PLAYER4', score: 666 },
            { name: 'PLAYER5', score: 555 }
        ];
        container.innerHTML = '';
        mockData.forEach((player, i) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.textContent = `${i + 1}. ${player.name} ${player.score}`;
            container.appendChild(item);
        });
    }
}

// Page 6: Forum
const forumContents = {
    wellness: { header: 'WELLNESS', text: 'Wellness content and discussions...' },
    interior: { header: 'INTERIOR', text: 'Interior design trends...' },
    radio: { header: 'RADIO', text: 'Radio station updates...' },
    itai: { header: 'ITALIAN', text: 'Italian culture insights...' },
    english: { header: 'ENGLISH', text: 'English community discussions...' },
    design: { header: 'DESIGN', text: 'Design theory and news...' },
    tattoo: { header: 'TATTOO', text: 'Tattoo art and culture...' },
    money: { header: 'MONEY', text: 'Financial literacy...' },
    barbering: { header: 'BARBER', text: 'Barbering techniques...' }
};

function switchForumTab(tab) {
    const content = forumContents[tab] || forumContents.wellness;
    const headerEl = document.getElementById('forumHeader');
    const textEl = document.getElementById('forumText');
    if (headerEl) headerEl.textContent = content.header;
    if (textEl) textEl.textContent = content.text;
}

window.openTelegramForum = () => window.open('https://t.me/morstrix', '_blank');
