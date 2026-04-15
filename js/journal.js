import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// --- FIREBASE ---
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
const db = getFirestore(app);

// --- LENIS — ПЛАВНЫЙ ЛЮКС ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'horizontal',
    gestureOrientation: 'horizontal',
    smoothWheel: true,
    smoothTouch: true,
    touchMultiplier: 1.5,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Синхронизация точек
let currentPage = 1;
const totalPages = 6;

function updateActivePage(pageNum) {
    currentPage = pageNum;
    document.querySelectorAll('.page-dot').forEach(dot => dot.classList.remove('active'));
    const activeDot = document.querySelector(`.page-dot[data-page="${pageNum}"]`);
    if (activeDot) activeDot.classList.add('active');
}

lenis.on('scroll', ({ scroll }) => {
    const pageWidth = window.innerWidth;
    const newPage = Math.round(scroll / pageWidth) + 1;
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
        updateActivePage(newPage);
    }
});

window.scrollToPage = (pageNum) => {
    const target = (pageNum - 1) * window.innerWidth;
    lenis.scrollTo(target, { immediate: false });
    updateActivePage(pageNum);
};

// Блокировка вертикального колеса (чтобы не конфликтовало)
window.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
    }
}, { passive: false });

// --- ФУНКЦИИ СТРАНИЦ ---
// Page 1
function loadCurrentArt() {
    const saved = localStorage.getItem('morstrix_current_art');
    if (saved) {
        const img = document.getElementById('currentArtPreview');
        if (img) img.src = saved;
    }
}
window.openArchiveModal = () => document.getElementById('archiveModal').classList.add('active');
window.openPaintModal = () => document.getElementById('paintModal').classList.add('active');
window.togglePinterestMenu = () => {
    const menu = document.getElementById('pinterestMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
};
window.openPinterestModal = () => {
    document.getElementById('pinterestModal').classList.add('active');
    window.togglePinterestMenu();
    if (!document.querySelector('#pinterest-js')) {
        const script = document.createElement('script');
        script.id = 'pinterest-js';
        script.src = '//assets.pinterest.com/js/pinit.js';
        script.async = true;
        document.body.appendChild(script);
    }
};

// Page 2
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    let idx = 0;
    setInterval(() => {
        slides[idx].classList.remove('active');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('active');
    }, 3000);
}
window.openTwitterModal = () => document.getElementById('twitterModal').classList.add('active');

// Page 3
const FONT_MAP = {
    'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ',
    'n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'
};
function updateStylerPreview() {
    const input = document.getElementById('stylerInput');
    const preview = document.getElementById('stylerPreview');
    if (!input || !preview) return;
    let text = input.value.toLowerCase();
    let result = '';
    for (let ch of text) result += FONT_MAP[ch] || ch;
    preview.textContent = result || 'Preview will appear here';
}
window.copyToClipboard = () => {
    const preview = document.getElementById('stylerPreview');
    if (preview?.textContent) {
        navigator.clipboard?.writeText(preview.textContent).then(() => alert('Copied!'));
    }
};
window.downloadArchive = () => {
    const a = document.createElement('a');
    a.href = 'assets/morstrix_archive.zip';
    a.download = 'morstrix_archive.zip';
    a.click();
};

// Page 4
let voices = [];
function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    const select = document.getElementById('voiceSelect');
    if (!select) return;
    select.innerHTML = voices.map((v, i) => `<option value="${i}">${v.name} (${v.lang})</option>`).join('');
}
speechSynthesis.onvoiceschanged = populateVoiceList;
window.speakText = () => {
    const text = document.getElementById('ttsInput')?.value.trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const idx = document.getElementById('voiceSelect')?.value;
    if (voices[idx]) utterance.voice = voices[idx];
    speechSynthesis.speak(utterance);
    const status = document.getElementById('ttsStatus');
    if (status) {
        status.textContent = 'Speaking...';
        utterance.onend = () => status.textContent = '';
    }
};
window.openSpotifyModal = () => document.getElementById('spotifyModal').classList.add('active');

// Page 5
async function loadTopPlayers() {
    const container = document.getElementById('topPlayersList');
    if (!container) return;
    try {
        const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(10));
        const snap = await getDocs(q);
        container.innerHTML = '';
        let rank = 1;
        snap.forEach(doc => {
            const d = doc.data();
            container.innerHTML += `<div class="player-item"><span>${rank++}. ${d.name || 'ANON'}</span><span>${d.score}</span></div>`;
        });
    } catch {
        container.innerHTML = '<div class="player-item">No data</div>';
    }
}

// Page 6
const forumContents = {
    wellness: { h: 'WELLNESS', t: 'Wellness content...' },
    interior: { h: 'INTERIOR', t: 'Interior design trends...' },
    radio: { h: 'RADIO', t: 'Radio station updates...' },
    itai: { h: 'ITALIAN', t: 'Italian culture...' },
    english: { h: 'ENGLISH', t: 'English community...' },
    design: { h: 'DESIGN', t: 'Design theory...' },
    tattoo: { h: 'TATTOO', t: 'Tattoo art...' },
    money: { h: 'MONEY', t: 'Financial literacy...' },
    barbering: { h: 'BARBER', t: 'Barbering techniques...' }
};
function switchForumTab(tab) {
    const c = forumContents[tab] || forumContents.wellness;
    document.getElementById('forumHeader').textContent = c.h;
    document.getElementById('forumText').textContent = c.t;
}
window.openTelegramForum = () => window.open('https://t.me/morstrix', '_blank');
window.openSupportModal = () => {
    const modal = document.getElementById('supportModal');
    const container = document.getElementById('telegram-comments');
    modal.classList.add('active');
    container.innerHTML = '';
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-comments', 'morstrix/71');
    script.setAttribute('data-width', '100%');
    script.setAttribute('data-height', '700px');
    container.appendChild(script);
};

// Модалки
window.closeAllModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    const menu = document.getElementById('pinterestMenu');
    if (menu) menu.style.display = 'none';
};
window.openContentsModal = () => document.getElementById('contentsModal').classList.add('active');

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeAllModals(); });
});

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentArt();
    initCarousel();
    populateVoiceList();
    loadTopPlayers();
    const stylerInput = document.getElementById('stylerInput');
    if (stylerInput) stylerInput.addEventListener('input', updateStylerPreview);
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchForumTab(btn.dataset.tab));
    });
    switchForumTab('wellness');
});
