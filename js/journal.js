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

// --- LENIS HORIZONTAL SETUP ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'horizontal', // Ключевое: горизонтальное направление
    gestureDirection: 'horizontal', // Реагирует только на горизонтальные свайпы/колесо
    smooth: true,
    mouseMultiplier: 1, // Чувствительность мыши
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Синхронизация времени для анимации
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- НАВИГАЦИЯ И СОСТОЯНИЕ ---
let currentPage = 1;
const totalPages = 6;
const wrapper = document.getElementById('journalWrapper');

// Функция плавного скролла к странице
window.scrollToPage = function(pageNum) {
    if (!wrapper) return;
    const pageWidth = window.innerWidth;
    const targetPosition = (pageNum - 1) * pageWidth;
    
    // Lenis scrollTo для горизонтального скролла
    lenis.scrollTo(targetPosition, {
        offset: 0,
        immediate: false 
    });
    
    updateActivePage(pageNum);
};

function updateActivePage(pageNum) {
    currentPage = pageNum;
    document.querySelectorAll('.page-dot').forEach(dot => dot.classList.remove('active'));
    const activeDot = document.querySelector(`.page-dot[data-page="${pageNum}"]`);
    if (activeDot) activeDot.classList.add('active');
}

// Слушаем событие скролла от Lenis для обновления точек
lenis.on('scroll', ({ scroll }) => {
    if (!wrapper) return;
    
    // Вычисляем текущую страницу на основе позиции скролла
    const pageWidth = window.innerWidth;
    const newPage = Math.round(scroll / pageWidth) + 1;
    
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
        updateActivePage(newPage);
    }
});

// Обработка колесика мыши (чтобы вертикальное колесо крутило горизонтально)
window.addEventListener('wheel', (e) => {
    // Если скролл больше по вертикали, чем по горизонтали (обычное колесо)
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        lenis.scroll(e.deltaY); // Передаем вертикальное движение в горизонтальный скроллер Lenis
    }
}, { passive: false });


// --- СТРАНИЦА 1: ART & PINTEREST ---
function loadCurrentArt() {
    const savedArt = localStorage.getItem('morstrix_current_art');
    if (savedArt) {
        const img = document.getElementById('currentArtPreview');
        if (img) img.src = savedArt;
    }
}

window.openArchiveModal = function() {
    const modal = document.getElementById('archiveModal');
    if (modal) modal.classList.add('active');
}

window.openPaintModal = function() {
    const modal = document.getElementById('paintModal');
    if (modal) modal.classList.add('active');
}

window.togglePinterestMenu = function() {
    const menu = document.getElementById('pinterestMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    }
}

window.openPinterestModal = function() {
    const modal = document.getElementById('pinterestModal');
    if (modal) {
        modal.classList.add('active');
        window.togglePinterestMenu();

        // Динамическая загрузка скрипта Pinterest
        if (!document.querySelector('#pinterest-js')) {
            const script = document.createElement('script');
            script.id = 'pinterest-js';
            script.src = '//assets.pinterest.com/js/pinit.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }
}

// --- СТРАНИЦА 2: TWITTER CAROUSEL ---
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

window.openTwitterModal = function() {
    const modal = document.getElementById('twitterModal');
    if (modal) modal.classList.add('active');
}

// --- СТРАНИЦА 3: FONTS ---
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
    for (let char of text) {
        result += FONT_MAP[char] || char;
    }
    preview.textContent = result || 'Preview will appear here';
}

window.copyToClipboard = function() {
    const preview = document.getElementById('stylerPreview');
    if (preview && preview.textContent) {
        navigator.clipboard.writeText(preview.textContent).then(() => {
            alert('Copied to clipboard!');
        });
    }
}

window.downloadArchive = function() {
    const link = document.createElement('a');
    link.href = 'assets/morstrix_archive.zip';
    link.download = 'morstrix_archive.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- СТРАНИЦА 4: SOUND ---
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
    const voiceIndex = voiceSelect.value;

    if (text.trim()) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voices[voiceIndex]) {
            utterance.voice = voices[voiceIndex];
        }

        speechSynthesis.speak(utterance);
        statusDiv.textContent = 'Speaking...';

        utterance.onend = () => { statusDiv.textContent = 'Finished.'; };
        utterance.onerror = () => { statusDiv.textContent = 'Error.'; };
    }
}

window.openSpotifyModal = function() {
    const modal = document.getElementById('spotifyModal');
    if (modal) modal.classList.add('active');
}

// --- СТРАНИЦА 5: TOP PLAYERS (FIREBASE) ---
async function loadTopPlayers() {
    const container = document.getElementById('topPlayersList');
    if (!container) return;

    try {
        const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) throw new Error("No data");

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
    } catch (error) {
        console.log("Firebase load failed, using mock data", error);
        const mockData = [
            { name: 'PLAYER1', score: 999 }, { name: 'PLAYER2', score: 888 },
            { name: 'PLAYER3', score: 777 }, { name: 'PLAYER4', score: 666 },
            { name: 'PLAYER5', score: 555 }, { name: 'PLAYER6', score: 444 },
            { name: 'PLAYER7', score: 333 }, { name: 'PLAYER8', score: 222 },
            { name: 'PLAYER9', score: 111 }, { name: 'PLAYER10', score: 100 }
        ];

        container.innerHTML = '';
        mockData.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.textContent = `${index + 1}. ${player.name} ${player.score}`;
            container.appendChild(item);
        });
    }
}

// --- СТРАНИЦА 6: FORUM & SUPPORT ---
const forumContents = {
    wellness: { header: 'WELLNESS', text: 'Wellness content and discussions about health, fitness, and lifestyle...' },
    interior: { header: 'INTERIOR', text: 'Interior design trends, home decor ideas, and spatial aesthetics...' },
    radio: { header: 'RADIO', text: 'Radio station updates, music recommendations, and audio culture...' },
    itai: { header: 'ITALIAN', text: 'Italian culture, design, fashion, and lifestyle insights...' },
    english: { header: 'ENGLISH', text: 'English-speaking community discussions and cultural exchanges...' },
    design: { header: 'DESIGN', text: 'Design theory, practice, and industry news from around the world...' },
    tattoo: { header: 'TATTOO', text: 'Tattoo art, artists, techniques, and cultural significance...' },
    money: { header: 'MONEY', text: 'Financial literacy, investment strategies, and economic discussions...' },
    barbering: { header: 'BARBER', text: 'Barbering techniques, grooming tips, and men\'s style culture...' }
};

function switchForumTab(tab) {
    const content = forumContents[tab] || forumContents.wellness;
    const headerEl = document.getElementById('forumHeader');
    const textEl = document.getElementById('forumText');
    if (headerEl) headerEl.textContent = content.header;
    if (textEl) textEl.textContent = content.text;
}

window.openTelegramForum = function() {
    window.open('https://t.me/morstrix', '_blank');
}

window.openSupportModal = function() {
    const modal = document.getElementById('supportModal');
    const container = document.getElementById('telegram-comments');
    if (modal && container) {
        modal.classList.add('active');
        container.innerHTML = '';
        const script = document.createElement('script');
        script.async = true;
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-comments', 'morstrix/71');
        script.setAttribute('data-width', '100%');
        script.setAttribute('data-height', '700px');
        container.appendChild(script);
    }
}

// --- ОБЩИЕ МОДАЛКИ ---
window.closeAllModals = function() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    const pMenu = document.getElementById('pinterestMenu');
    if (pMenu) pMenu.style.display = 'none';
}

window.openContentsModal = function() {
    const modal = document.getElementById('contentsModal');
    if (modal) modal.classList.add('active');
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentArt();
    initCarousel();
    populateVoiceList();
    loadTopPlayers();

    const stylerInput = document.getElementById('stylerInput');
    if (stylerInput) stylerInput.addEventListener('input', updateStylerPreview);

    const ttsInput = document.getElementById('ttsInput');
    if (ttsInput) ttsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.speakText();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab) switchForumTab(tab);
        });
    });

    switchForumTab('wellness');
    
    // Клавиша Escape закрывает модалки
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    // Клик вне модалки закрывает её
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeAllModals();
        });
    });
});
