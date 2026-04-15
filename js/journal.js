// ===================== FONT STYLER =====================
const FONT_MAP = {
    'А':'ᴀ','а':'ᴀ','В':'ʙ','в':'ʙ','Е':'ᴇ','е':'ᴇ','К':'ᴋ','к':'ᴋ',
    'М':'ᴍ','м':'ᴍ','О':'ᴏ','о':'ᴏ','Р':'ᴘ','р':'ᴘ','С':'ᴄ','с':'ᴄ',
    'Т':'ᴛ','т':'ᴛ','Н':'н','н':'н','Л':'ʌ','л':'ʌ',
    'A':'ᴀ','a':'ᴀ','B':'ʙ','b':'ʙ','C':'ᴄ','c':'ᴄ',
    'D':'ᴅ','d':'ᴅ','E':'ᴇ','e':'ᴇ','F':'ꜰ','f':'ꜰ',
    'G':'ɢ','g':'ɢ','H':'ʜ','h':'ʜ','I':'ɪ','i':'ɪ',
    'J':'ᴊ','j':'ᴊ','K':'ᴋ','k':'ᴋ','L':'ʟ','l':'ʟ',
    'M':'ᴍ','m':'ᴍ','N':'ɴ','n':'ɴ','O':'ᴏ','o':'ᴏ',
    'P':'ᴘ','p':'ᴘ','Q':'ǫ','q':'ǫ','R':'ʀ','r':'ʀ',
    'S':'ꜱ','s':'ꜱ','T':'ᴛ','t':'ᴛ','U':'ᴜ','u':'ᴜ',
    'V':'ᴠ','v':'ᴠ','W':'ᴡ','w':'ᴡ','X':'x','x':'x',
    'Y':'ʏ','y':'ʏ','Z':'ᴢ','z':'ᴢ'
};
function convertTextToFont(text) {
    return text.split('').map(c => FONT_MAP[c] || FONT_MAP[c.toUpperCase()] || c).join('');
}

// ===================== СОСТОЯНИЕ =====================
const state = {
    lenis: null,
    pageCount: 6,
    rssHeadlines: [
        "✦ Apartamento: The Imperfect Home ✦", "✦ Fantastic Man: On Silence ✦",
        "✦ 032c: Berlin Issue ✦", "✦ Purple: Les Nuits ✦", "✦ MacGuffin: The Rope ✦",
        "✦ The Gentlewoman: No. 26 ✦", "✦ Buffalo Zine: The Fame Issue ✦",
        "✦ Re-Edition: The Touch ✦", "✦ Mastermind: The System ✦", "✦ Office Magazine: Cyber ✦"
    ]
};

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initRssTicker();
    initArtPreviewSync();
    initPaintEntry();
    initArchiveStub();
    initPinterestPanel();
    initCarousel();
    initFontStyler();
    initDownloadArchive();
    initTts();
    initSpotify();
    initTopPlayers();
    initForumTabs();
    initSupportModal();
    initModals();
    initContentsNavigation();
    initTwitterDisclaimer();
    initKeyboardEscape();
});

// ===================== LENIS =====================
function initLenis() {
    const wrapper = document.querySelector('.journal-wrapper');
    const content = document.getElementById('journalHorizontal');
    if (!wrapper || !content) return;

    if (typeof Lenis !== 'undefined') {
        state.lenis = new Lenis({
            wrapper, content,
            orientation: 'horizontal',
            gestureOrientation: 'horizontal',
            smoothWheel: true,
            smoothTouch: true,
            lerp: 0.08
        });

        function raf(time) { 
            state.lenis.raf(time); 
            requestAnimationFrame(raf); 
        }
        requestAnimationFrame(raf);

        window.scrollToPage = (index) => state.lenis.scrollTo(index * wrapper.clientWidth, { immediate: false });

        const indicator = document.getElementById('pageIndicator');
        indicator.innerHTML = Array(state.pageCount).fill(0).map(() => '<span class="dot"></span>').join('');
        const dots = indicator.querySelectorAll('.dot');

        state.lenis.on('scroll', ({ scroll }) => {
            const activeIndex = Math.round(scroll / wrapper.clientWidth);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
            // Защита iframe при скролле
            document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'none');
            clearTimeout(state.iframeTimer);
            state.iframeTimer = setTimeout(() => {
                document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = '');
            }, 150);
        });

        setTimeout(() => {
            const activeIndex = Math.round(state.lenis.scroll / wrapper.clientWidth);
            dots[activeIndex]?.classList.add('active');
        }, 100);
    } else {
        // Fallback
        content.style.overflow = 'auto';
        content.style.scrollSnapType = 'x mandatory';
        window.scrollToPage = (index) => content.scrollTo({ left: index * content.clientWidth, behavior: 'smooth' });
    }
}

function initRssTicker() {
    const ticker = document.getElementById('rssTicker');
    if (ticker) ticker.textContent = [...state.rssHeadlines, ...state.rssHeadlines].join('  —  ');
}

function initArtPreviewSync() {
    const img = document.getElementById('currentArtPreview');
    const update = () => { 
        const saved = localStorage.getItem('morstrix_current_art'); 
        if (saved && img) img.src = saved; 
    };
    update();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

function initPaintEntry() {
    document.getElementById('paintJournalBtn')?.addEventListener('click', () => openModal('paintEntryModal'));
    document.getElementById('paintAnonBtn')?.addEventListener('click', () => window.open('paint.html', '_blank'));
    document.getElementById('paintRegBtn')?.addEventListener('click', () => window.open('paint.html', '_blank'));
}

function initArchiveStub() {
    document.getElementById('archiveBtn')?.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:400px;">
                <div class="modal-header"><span class="modal-title-text">АРХИВ</span><button class="modal-close-btn">✜</button></div>
                <div class="modal-inner" style="text-align:center;">
                    <img src="assets/art.jpg" style="width:100%; border:2px solid #a84d6b;">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const closeBtn = modal.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    });
}

function initPinterestPanel() {
    const panel = document.getElementById('pinterestPanel');
    const menu = document.getElementById('pinterestMenu');
    if (!panel || !menu) return;

    panel.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    document.querySelectorAll('.pinterest-category').forEach(cat => {
        cat.addEventListener('click', (e) => {
            e.stopPropagation();
            const catName = cat.dataset.cat;
            if (catName === 'diliger') openModal('pinterestModalDiliger');
            else if (catName === 'tattoo') openModal('pinterestModalTattoo');
            else if (catName === 'barbering') openModal('pinterestModalBarbering');
            menu.classList.remove('active');
            
            if (!window.PinUtils) {
                const script = document.createElement('script');
                script.src = 'https://assets.pinterest.com/js/pinit.js';
                script.onload = () => window.PinUtils?.build();
                document.head.appendChild(script);
            } else {
                window.PinUtils?.build();
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

function initCarousel() {
    const carousel = document.getElementById('mainCarousel');
    if (!carousel) return;
    const imgs = carousel.querySelectorAll('img');
    let index = 0;
    setInterval(() => {
        imgs[index].classList.remove('active');
        index = (index + 1) % imgs.length;
        imgs[index].classList.add('active');
    }, 3000);
}

function initFontStyler() {
    const input = document.getElementById('fontInputEmbedded');
    const preview = document.getElementById('stylerPreviewEmbedded');
    if (!input || !preview) return;
    const update = () => preview.textContent = input.value.trim() ? convertTextToFont(input.value) : convertTextToFont('tap to copy');
    update();
    input.addEventListener('input', update);
    preview.addEventListener('click', () => {
        navigator.clipboard.writeText(preview.textContent).then(() => {
            const orig = preview.textContent;
            preview.textContent = convertTextToFont('copied!');
            setTimeout(() => preview.textContent = orig, 800);
        });
    });
    animatePlaceholder(input, 'TYPE TEXT');
}

function animatePlaceholder(input, text) {
    let timer, isTyping = true, charIndex = 0;
    const step = () => {
        if (timer) clearTimeout(timer);
        if (isTyping) {
            if (charIndex < text.length) {
                input.placeholder = text.substring(0, charIndex + 1) + ' █';
                charIndex++;
                timer = setTimeout(step, 120);
            } else {
                isTyping = false;
                timer = setTimeout(step, 1500);
            }
        } else {
            if (charIndex > 0) {
                charIndex--;
                input.placeholder = text.substring(0, charIndex) + ' █';
                timer = setTimeout(step, 80);
            } else {
                isTyping = true;
                input.placeholder = ' █';
                timer = setTimeout(step, 300);
            }
        }
    };
    const start = () => { if (input.value === '') { isTyping = true; charIndex = 0; step(); } };
    const stop = () => { clearTimeout(timer); input.placeholder = ''; };
    input.addEventListener('focus', stop);
    input.addEventListener('blur', () => { if (input.value === '') start(); });
    const page = document.querySelector('[data-page="3"]');
    if (page) {
        const observer = new IntersectionObserver((e) => e.forEach(ent => ent.isIntersecting ? start() : stop()), { threshold: 0.1 });
        observer.observe(page);
    } else start();
}

function initDownloadArchive() {
    document.getElementById('downloadArchiveBtnEmbedded')?.addEventListener('click', () => {
        const a = document.createElement('a'); 
        a.href = 'assets/morstrix_archive.zip'; 
        a.download = 'MORSTRIX_FONT.zip'; 
        a.click();
    });
}

let voices = [];
function initTts() {
    const input = document.getElementById('ttsTextInput');
    const select = document.getElementById('ttsVoiceSelect');
    const btn = document.getElementById('ttsSpeakBtn');
    const status = document.getElementById('ttsStatus');
    if (!input || !select || !btn) return;
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        select.innerHTML = voices.map(v => `<option value="${v.name}">${v.lang} - ${v.name}</option>`).join('');
        const pref = voices.find(v => v.lang.startsWith('uk')) || voices.find(v => v.lang.startsWith('ru'));
        if (pref) select.value = pref.name;
    }
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    btn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) { status.textContent = 'Введите текст'; return; }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.name === select.value);
        if (voice) u.voice = voice;
        u.onstart = () => status.textContent = '▶ Воспроизведение';
        u.onend = () => status.textContent = '';
        u.onerror = () => status.textContent = 'Ошибка';
        speechSynthesis.speak(u);
    });
    animatePlaceholder(input, 'TYPE TEXT');
}

function initSpotify() { 
    document.getElementById('spotifyIcon')?.addEventListener('click', () => openModal('spotifyModal')); 
}

async function initTopPlayers() {
    const container = document.querySelector('.top-players-list');
    if (!container) return;
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
        const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
        const app = initializeApp({ 
            apiKey: "AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU", 
            authDomain: "helper-e10b2.firebaseapp.com", 
            projectId: "helper-e10b2" 
        });
        const db = getFirestore(app);
        const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(10));
        const snap = await getDocs(q);
        let html = '', rank = 1;
        snap.forEach(d => { 
            const data = d.data(); 
            html += `<div style="display:flex;justify-content:space-between;"><span>${rank++}. ${data.name || 'ANON'}</span><span>${data.score}</span></div>`; 
        });
        container.innerHTML = html || '<div>— пусто —</div>';
    } catch (e) { 
        container.innerHTML = '⚠️ ERROR'; 
    }
}

function initForumTabs() {
    const contents = {
        wellness: ['🌿 ВЕЛНЕС','Йога, медитации...'], interior: ['🛋️ ИНТЕРЬЕР','Дизайн интерьеров...'],
        radio: ['📻 РАДИО','Музыка, подкасты...'], itai: ['🤖 IT / AI','Нейросети...'],
        english: ['📖 ENGLISH','Изучение английского...'], design: ['🎨 DESIGN','Графический дизайн...'],
        tattoo: ['💉 TATTOO','Тату-культура...'], money: ['💰 MONEY','Финансы...'], barbering: ['✂️ BARBER','Барберинг...']
    };
    document.querySelectorAll('.forum-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.forum-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const id = tab.dataset.tab;
            if (contents[id]) {
                document.getElementById('forumTitleEmbedded').textContent = contents[id][0];
                document.getElementById('forumTextEmbedded').textContent = contents[id][1];
            }
        });
    });
    document.getElementById('forumFullBtn')?.addEventListener('click', () => window.open('https://t.me/morstrix', '_blank'));
}

function initSupportModal() { 
    document.getElementById('supportBtn')?.addEventListener('click', () => openModal('supportModal')); 
}

// ===================== МОДАЛКИ =====================
function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active'); 
}
function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active'); 
}
function showStubModal(title, text) {
    document.getElementById('stubModalTitle').textContent = title;
    document.getElementById('stubModalText').textContent = text;
    openModal('stubModal');
}

function initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalId = btn.dataset.modal;
            if (modalId) closeModal(modalId);
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });
}

function initContentsNavigation() {
    document.getElementById('contentsBtn').addEventListener('click', () => openModal('contentsModal'));
    document.querySelectorAll('.contents-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            const target = document.querySelector(`.journal-page[data-page="${page}"]`);
            const index = [...document.querySelectorAll('.journal-page')].indexOf(target);
            if (index >= 0 && window.scrollToPage) window.scrollToPage(index);
            closeModal('contentsModal');
        });
    });
}

function initTwitterDisclaimer() {
    document.getElementById('twitterBtn')?.addEventListener('click', () => openModal('disclaimerModal'));
    document.getElementById('openXBtn')?.addEventListener('click', function() { 
        window.open(this.dataset.href, '_blank'); 
        closeModal('disclaimerModal'); 
    });
}

function initKeyboardEscape() { 
    document.addEventListener('keydown', e => { 
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); 
        }
    }); 
}
