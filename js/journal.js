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
getAnalytics(app);
const db = getFirestore(app);

// --- DOM ELEMENTS ---
const wrapper = document.getElementById('journalWrapper');
const horizontal = document.getElementById('journalHorizontal');

// --- LENIS SETUP (HARDCODED HORIZONTAL) ---
// Важно: target указывает на наш контейнер, а не на window
const lenis = new Lenis({
    wrapper: wrapper, // Скроллим только этот элемент
    content: horizontal,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'horizontal',
    gestureDirection: 'horizontal',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- БЛОКИРОВКА ВЕРТИКАЛЬНОГО СКРОЛЛА (ДЛЯ ТЕЛЕФОНОВ) ---
// Предотвращаем стандартный скролл браузера вверх-вниз
window.addEventListener('touchmove', (e) => {
    // Если модалка открыта - разрешаем скроллить внутри неё
    if (document.querySelector('.modal-overlay.active')) return;
    
    // Иначе блокируем всё, кроме горизонтального жеста внутри нашего враппера
    // Lenis сам разберется с направлением, но мы страхуем
}, { passive: false });

window.addEventListener('wheel', (e) => {
    if (document.querySelector('.modal-overlay.active')) return;
    // Если скролл больше вертикальный чем горизонтальный - блокируем
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
    }
}, { passive: false });


// --- NAVIGATION LOGIC ---
let currentPage = 1;
const totalPages = 6;

// Функция перехода к странице (работает и из модалки ЗМІСТ)
window.scrollToPage = function(pageNum) {
    // Закрываем модалку ЗМІСТ если она открыта
    const contentsModal = document.getElementById('contentsModal');
    if (contentsModal && contentsModal.classList.contains('active')) {
        contentsModal.classList.remove('active');
    }

    // Вычисляем позицию: (номер страницы - 1) * ширина экрана
    const width = window.innerWidth;
    const targetPosition = (pageNum - 1) * width;

    // Скроллим через Lenis
    lenis.scrollTo(targetPosition, {
        offset: 0,
        immediate: false, // Плавная прокрутка
        duration: 1.2
    });

    updateActivePage(pageNum);
}

function updateActivePage(pageNum) {
    currentPage = pageNum;
    document.querySelectorAll('.page-dot').forEach(dot => dot.classList.remove('active'));
    const activeDot = document.querySelector(`.page-dot[data-page="${pageNum}"]`);
    if (activeDot) activeDot.classList.add('active');
}

// Синхронизация точек при ручном скролле
lenis.on('scroll', ({ scroll }) => {
    const width = window.innerWidth;
    // Округляем до ближайшей страницы
    const newPage = Math.round(scroll / width) + 1;
    
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
        updateActivePage(newPage);
    }
});

// --- PAGE FUNCTIONS ---

// Page 1: Art & Pinterest
function loadCurrentArt() {
    const savedArt = localStorage.getItem('morstrix_current_art');
    if (savedArt) {
        const img = document.getElementById('currentArtPreview');
        if (img) img.src = savedArt;
    }
}

window.openArchiveModal = () => {
    const modal = document.getElementById('archiveModal');
    if(modal) modal.classList.add('active');
}

window.openPaintModal = () => {
    const modal = document.getElementById('paintModal');
    if(modal) modal.classList.add('active');
}

window.togglePinterestMenu = () => {
    const menu = document.getElementById('pinterestMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    }
}

window.openPinterestModal = () => {
    const modal = document.getElementById('pinterestModal');
    if (modal) {
        modal.classList.add('active');
        window.togglePinterestMenu();
        if (!document.querySelector('#pinterest-js')) {
            const script = document.createElement('script');
            script.id = 'pinterest-js';
            script.src = '//assets.pinterest.com/js/pinit.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }
}

// Page 2: Carousel & Twitter
function initCarousel() {
    let currentIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 3000);
}

window.openTwitterModal = () => {
    const modal = document.getElementById('twitterModal');
    if(modal) modal.classList.add('active');
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

window.copyToClipboard = () => {
    const preview = document.getElementById('stylerPreview');
    if (preview && preview.textContent) {
        navigator.clipboard.writeText(preview.textContent).then(() => alert('Copied!'));
    }
}

window.downloadArchive = () => {
    const link = document.createElement('a');
    link.href = 'assets/morstrix_archive.zip';
    link.download = 'morstrix_archive.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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
if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = populateVoiceList;

window.speakText = () => {
    const textInput = document.getElementById('ttsInput');
    const voiceSelect = document.getElementById('voiceSelect');
    const statusDiv = document.getElementById('ttsStatus');
    if (!textInput || !voiceSelect || !statusDiv) return;
    
    const text = textInput.value;
    if (text.trim()) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voices[voiceSelect.value]) utterance.voice = voices[voiceSelect.value];
        speechSynthesis.speak(utterance);
        statusDiv.textContent = 'Speaking...';
        utterance.onend = () => statusDiv.textContent = 'Finished.';
    }
}

window.openSpotifyModal = () => {
    const modal = document.getElementById('spotifyModal');
    if(modal) modal.classList.add('active');
}

// Page 5: Top Players
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
            item.innerHTML = `<span>${rank}. ${data.name || 'UNKNOWN'}</span> <span>${data.score || 0}</span>`;
            container.appendChild(item);
            rank++;
        });
    } catch (error) {
        console.log("Firebase error, using mock data");
        const mockData = [
            { name: 'PLAYER1', score: 999 }, { name: 'PLAYER2', score: 888 },
            { name: 'PLAYER3', score: 777 }, { name: 'PLAYER4', score: 666 },
            { name: 'PLAYER5', score: 555 }
        ];
        container.innerHTML = '';
        mockData.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.innerHTML = `<span>${index + 1}. ${player.name}</span> <span>${player.score}</span>`;
            container.appendChild(item);
        });
    }
}

// Page 6: Forum
const forumContents = {
    wellness: { header: 'WELLNESS', text: 'Wellness content and discussions...' },
    interior: { header: 'INTERIOR', text: 'Interior design trends...' },
    radio: { header: 'RADIO', text: 'Radio station updates...' },
    itai: { header: 'ITALIAN', text: 'Italian culture...' },
    english: { header: 'ENGLISH', text: 'English community...' },
    design: { header: 'DESIGN', text: 'Design theory...' },
    tattoo: { header: 'TATTOO', text: 'Tattoo art...' },
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

window.openSupportModal = () => {
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

// Global Modal Functions
window.closeAllModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        if(modal) modal.classList.remove('active');
    });
    const pMenu = document.getElementById('pinterestMenu');
    if (pMenu) pMenu.style.display = 'none';
}

window.openContentsModal = () => {
    const modal = document.getElementById('contentsModal');
    if(modal) modal.classList.add('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeAllModals();
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeAllModals();
    });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Принудительно задаем ширину, чтобы Lenis понял размеры
    if(horizontal) {
        // Убеждаемся, что flex-контейнер растянут
        horizontal.style.width = 'max-content';
    }

    loadCurrentArt();
    initCarousel();
    populateVoiceList();
    loadTopPlayers();
    
    const stylerInput = document.getElementById('stylerInput');
    if (stylerInput) stylerInput.addEventListener('input', updateStylerPreview);
    
    const ttsInput = document.getElementById('ttsInput');
    if (ttsInput) ttsInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.speakText(); });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab) switchForumTab(tab);
        });
    });
    
    switchForumTab('wellness');
    
    // Пересчет размеров при повороте экрана
    window.addEventListener('resize', () => {
        lenis.resize();
        // Возвращаем на текущую страницу после ресайза
        scrollToPage(currentPage);
    });
});
