// --- FIREBASE CONFIGURATION ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
  authDomain: "helper-e10b2.firebaseapp.com",
  projectId: "helper-e10b2",
  storageBucket: "helper-e10b2.firebasestorage.app",
  messagingSenderId: "131536876451",
  appId: "1:131536876451:web:eeaef494c83dfc4849e016",
  measurementId: "G-KPM4SEVG8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- LENIS SMOOTH SCROLL ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'horizontal',
    gestureDirection: 'horizontal',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- NAVIGATION LOGIC ---
let currentPage = 1;
const totalPages = 6;
const dots = document.querySelectorAll('.page-dot');

function updateActivePage(pageNum) {
    currentPage = pageNum;
    dots.forEach(dot => dot.classList.remove('active'));
    const activeDot = document.querySelector(`.page-dot[data-page="${pageNum}"]`);
    if (activeDot) activeDot.classList.add('active');
}

function scrollToPage(pageNum) {
    const targetPosition = (pageNum - 1) * window.innerWidth;
    lenis.scrollTo(targetPosition, { offset: 0, immediate: false });
    updateActivePage(pageNum);
}

// Sync scroll with dots
lenis.on('scroll', ({ scroll }) => {
    const newPage = Math.round(scroll / window.innerWidth) + 1;
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
        updateActivePage(newPage);
    }
});

// Dot click listeners
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const page = parseInt(dot.getAttribute('data-page'));
        scrollToPage(page);
    });
});

// --- PAGE 1: ART & PINTEREST ---
// Load art from localStorage
const artPreview = document.getElementById('currentArtPreview');
const savedArt = localStorage.getItem('morstrix_current_art');
if (savedArt) artPreview.src = savedArt;
if(document.getElementById('archiveImg')) document.getElementById('archiveImg').src = savedArt || 'assets/art.jpg';

// Pinterest Single Widget Logic
const pinterestBtn = document.getElementById('pinterestBtn');
const pinterestModal = document.getElementById('pinterestModal');
const pinterestContainer = document.getElementById('pinterestWidgetContainer');
let pinterestLoaded = false;

pinterestBtn.addEventListener('click', () => {
    pinterestModal.classList.add('active');
    if (!pinterestLoaded) {
        pinterestContainer.innerHTML = '<div style="color:#666">Loading Pinterest...</div>';
        
        // Create the anchor tag required by Pinterest
        const pinLink = document.createElement('a');
        pinLink.setAttribute('data-pin-do', 'embed-board');
        pinLink.setAttribute('data-pin-width', 'large');
        pinLink.href = 'https://ru.pinterest.com/morstrix/re-f-erences/';
        pinLink.style.display = 'block';
        pinLink.style.width = '100%';
        
        pinterestContainer.innerHTML = '';
        pinterestContainer.appendChild(pinLink);

        // Load Pinterest script dynamically
        if (!document.getElementById('pinterest-js')) {
            const script = document.createElement('script');
            script.id = 'pinterest-js';
            script.async = true;
            script.src = '//assets.pinterest.com/js/pinit.js';
            document.body.appendChild(script);
            
            // Fallback timeout in case script is slow
            setTimeout(() => {
                if(pinterestContainer.children.length === 1 && !pinterestContainer.querySelector('iframe')) {
                     pinterestContainer.innerHTML += '<div style="margin-top:20px; font-size:12px; color:#555;">If board doesn\'t load, <a href="https://ru.pinterest.com/morstrix/re-f-erences/" target="_blank" style="color:#a84d6b">click here</a></div>';
                }
            }, 3000);
        } else {
            // If script already exists, tell it to re-parse
            if(window.PinUtils) window.PinUtils.init();
        }
        pinterestLoaded = true;
    }
});

// --- PAGE 2: CAROUSEL ---
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

// --- PAGE 3: FONTS ---
const FONT_MAP = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
    'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
};

const stylerInput = document.getElementById('stylerInput');
const stylerPreview = document.getElementById('stylerPreview');

if(stylerInput) {
    stylerInput.addEventListener('input', (e) => {
        let text = e.target.value.toLowerCase();
        let result = '';
        for (let char of text) {
            result += FONT_MAP[char] || char;
        }
        stylerPreview.textContent = result || 'Preview will appear here';
    });

    stylerPreview.addEventListener('click', () => {
        if(stylerPreview.textContent !== 'Preview will appear here') {
            navigator.clipboard.writeText(stylerPreview.textContent);
            const originalText = stylerPreview.textContent;
            stylerPreview.textContent = 'COPIED!';
            setTimeout(() => stylerPreview.textContent = originalText, 1000);
        }
    });
}

// --- PAGE 4: SOUND ---
const voiceSelect = document.getElementById('voiceSelect');
const ttsInput = document.getElementById('ttsInput');
const speakBtn = document.getElementById('speakBtn');
const ttsStatus = document.getElementById('ttsStatus');

let voices = [];

function populateVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
}

if(speakBtn) {
    speakBtn.addEventListener('click', () => {
        const text = ttsInput.value;
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices[voiceSelect.value];
        if (selectedVoice) utterance.voice = selectedVoice;

        speechSynthesis.speak(utterance);
        ttsStatus.textContent = 'Speaking...';
        
        utterance.onend = () => { ttsStatus.textContent = ''; };
        utterance.onerror = () => { ttsStatus.textContent = 'Error'; };
    });
}

// --- PAGE 5: FIREBASE TOP PLAYERS ---
async function loadTopPlayers() {
    const listContainer = document.getElementById('topPlayersList');
    if (!listContainer) return;

    try {
        const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        listContainer.innerHTML = '';
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<div style="color:#666; text-align:center;">No players yet</div>';
            return;
        }

        let rank = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'player-item';
            item.innerHTML = `<span>${rank}. ${data.name || 'ANON'}</span> <span>${data.score}</span>`;
            listContainer.appendChild(item);
            rank++;
        });
    } catch (error) {
        console.error("Error loading top players:", error);
        listContainer.innerHTML = '<div style="color:#a84d6b; text-align:center;">Error loading DB<br>(Check Console)</div>';
        // Fallback mock data for visual check if DB fails
        /* 
        listContainer.innerHTML = '';
        [999, 888, 777].forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.innerHTML = `<span>${i+1}. DEMO_USER</span> <span>${s}</span>`;
            listContainer.appendChild(item);
        }); 
        */
    }
}

// --- PAGE 6: FORUM TABS ---
const forumContents = {
    wellness: { header: 'WELLNESS', text: 'Holistic health, mental balance, and physical vitality discussions.' },
    interior: { header: 'INTERIOR', text: 'Minimalist spaces, brutalist architecture, and home aesthetics.' },
    radio: { header: 'RADIO', text: 'Underground frequencies, lo-fi beats, and broadcast logs.' },
    itai: { header: 'ITALIAN', text: 'Milan design weeks, espresso culture, and Mediterranean vibes.' },
    english: { header: 'ENGLISH', text: 'Global community hub. Language exchange and cultural fusion.' },
    design: { header: 'DESIGN', text: 'UI/UX critiques, graphic trends, and digital artifact creation.' },
    tattoo: { header: 'TATTOO', text: 'Ink inspiration, artist spotlights, and aftercare protocols.' },
    money: { header: 'MONEY', text: 'Crypto insights, investment strategies, and financial freedom.' },
    barbering: { header: 'BARBER', text: 'Classic cuts, grooming rituals, and beard maintenance.' }
};

const tabBtns = document.querySelectorAll('.tab-btn');
const forumHeader = document.getElementById('forumHeader');
const forumText = document.getElementById('forumText');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');
        
        const tab = btn.getAttribute('data-tab');
        const content = forumContents[tab];
        if (content) {
            forumHeader.textContent = content.header;
            forumText.textContent = content.text;
        }
    });
});

// --- MODAL SYSTEM ---
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Event Listeners for Buttons
document.getElementById('contentsBtn').addEventListener('click', () => openModal('contentsModal'));
document.getElementById('archiveBtn').addEventListener('click', () => openModal('archiveModal'));
document.getElementById('paintBtn').addEventListener('click', () => openModal('paintModal'));
document.getElementById('twitterBtn').addEventListener('click', () => openModal('twitterModal'));
document.getElementById('spotifyBtn').addEventListener('click', () => openModal('spotifyModal'));
document.getElementById('supportBtn').addEventListener('click', () => {
    openModal('supportModal');
    // Load Telegram widget only when opened to save resources
    const container = document.getElementById('telegramWidget');
    if (container.innerHTML === '') {
        const script = document.createElement('script');
        script.async = true;
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-comments', 'morstrix/71');
        script.setAttribute('data-width', '100%');
        script.setAttribute('data-height', '400px');
        container.appendChild(script);
    }
});

document.getElementById('confirmTwitterBtn').addEventListener('click', () => {
    window.open('https://x.com', '_blank');
    closeAllModals();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    // Simulate download
    alert('Starting download: morstrix_archive.zip');
});

document.getElementById('tetrisBtn').addEventListener('click', () => {
    window.open('tetris.html', '_blank');
});

document.getElementById('fullForumBtn').addEventListener('click', () => {
    window.open('https://t.me/morstrix', '_blank');
});

// Close buttons inside modals
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-close');
        closeModal(modalId);
        e.stopPropagation();
    });
});

// Close on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAllModals();
        }
    });
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

// Menu navigation
document.querySelectorAll('.menu-list div').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        closeAllModals();
        scrollToPage(parseInt(target));
    });
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    loadTopPlayers();
    
    // Hide fallback icon if real image loads
    const closeImg = document.querySelector('.nav-right img');
    if(closeImg) {
        closeImg.onload = () => { document.getElementById('closeIconFallback').style.display = 'none'; };
        closeImg.onerror = () => { document.getElementById('closeIconFallback').style.display = 'block'; };
    }
});
