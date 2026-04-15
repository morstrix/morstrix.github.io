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

// ===================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ =====================
const state = {
    lenis: null,
    pageCount: 6,
    rssHeadlines: [
        "✦ Apartamento: The Imperfect Home ✦",
        "✦ Fantastic Man: On Silence ✦",
        "✦ 032c: Berlin Issue ✦",
        "✦ Purple: Les Nuits ✦",
        "✦ MacGuffin: The Rope ✦",
        "✦ The Gentlewoman: No. 26 ✦",
        "✦ Buffalo Zine: The Fame Issue ✦",
        "✦ Re-Edition: The Touch ✦",
        "✦ Mastermind: The System ✦",
        "✦ Office Magazine: Cyber ✦"
    ]
};

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initRssTicker();
    initArtPreviewSync();
    initPaintEntry();
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
    if (!wrapper || !content || typeof Lenis === 'undefined') return;

    state.lenis = new Lenis({
        wrapper, content,
        orientation: 'horizontal',
        gestureOrientation: 'horizontal',
        smoothWheel: true,
        smoothTouch: true,
        lerp: 0.08
    });

    function raf(time) { state.lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    window.scrollToPage = (index) => state.lenis.scrollTo(index * wrapper.clientWidth);

    // Индикаторы страниц (точки)
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
}

// ===================== RSS ТИКЕР =====================
function initRssTicker() {
    const ticker = document.getElementById('rssTicker');
    if (ticker) {
        const repeated = [...state.rssHeadlines, ...state.rssHeadlines].join('  —  ');
        ticker.textContent = repeated;
    }
}

// ===================== АРТ-ПРЕВЬЮ (синхронизация с Paint) =====================
function initArtPreviewSync() {
    const img = document.getElementById('currentArtPreview');
    const updateFromStorage = () => {
        const saved = localStorage.getItem('morstrix_current_art');
        if (saved && img) img.src = saved;
    };
    updateFromStorage();
    window.addEventListener('focus', updateFromStorage);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateFromStorage();
    });
}

// ===================== КНОПКА PAINT (модалка выбора) =====================
function initPaintEntry() {
    const btn = document.getElementById('paintJournalBtn');
    if (!btn) return;
    btn.addEventListener('click', () => openModal('paintEntryModal'));
    document.getElementById('paintAnonBtn')?.addEventListener('click', () => window.open('paint.html', '_blank'));
    document.getElementById('paintRegBtn')?.addEventListener('click', () => window.open('paint.html', '_blank')); // заглушка
}

// ===================== PINTEREST (выезжающее меню + заглушки) =====================
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
            showStubModal(`PINTEREST: ${catName.toUpperCase()}`, `Доска «${catName}» появится позже`);
            menu.classList.remove('active');
        });
    });
    // Закрытие меню при клике вне
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('active');
    });
}

// ===================== АРХИВ (заглушка) =====================
document.getElementById('archiveBtn')?.addEventListener('click', () => {
    showStubModal('АРХИВ', 'Скоро здесь будут рисунки участников');
});

// ===================== КАРУСЕЛЬ (страница 2) =====================
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

// ===================== FONT STYLER (страница 3) =====================
function initFontStyler() {
    const input = document.getElementById('fontInputEmbedded');
    const preview = document.getElementById('stylerPreviewEmbedded');
    if (!input || !preview) return;

    const updatePreview = () => {
        const raw = input.value.trim();
        preview.textContent = raw ? convertTextToFont(raw) : convertTextToFont('tap to copy');
    };
    updatePreview();
    input.addEventListener('input', updatePreview);
    preview.addEventListener('click', () => {
        navigator.clipboard.writeText(preview.textContent).then(() => {
            const original = preview.textContent;
            preview.textContent = convertTextToFont('copied!');
            setTimeout(() => preview.textContent = original, 800);
        });
    });

    // Анимация placeholder
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
    const observer = new IntersectionObserver((e) => e.forEach(ent => ent.isIntersecting ? start() : stop()), { threshold: 0.1 });
    if (page) observer.observe(page); else start();
}

// ===================== СКАЧИВАНИЕ АРХИВА =====================
function initDownloadArchive() {
    document.getElementById('downloadArchiveBtnEmbedded')?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = 'assets/morstrix_archive.zip';
        a.download = 'MORSTRIX_FONT.zip';
        a.click();
    });
}

// ===================== TEXT SYNTH (TTS) =====================
let voices = [];
function initTts() {
    const input = document.getElementById('ttsTextInput');
    const select = document.getElementById('ttsVoiceSelect');
    const speakBtn = document.getElementById('ttsSpeakBtn');
    const status = document.getElementById('ttsStatus');
    if (!input || !select || !speakBtn) return;

    function loadVoices() {
        voices = speechSynthesis.getVoices();
        select.innerHTML = voices.map(v => `<option value="${v.name}">${v.lang} - ${v.name}</option>`).join('');
        const ukr = voices.find(v => v.lang.startsWith('uk')) || voices.find(v => v.lang.startsWith('ru'));
        if (ukr) select.value = ukr.name;
    }
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    speakBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) { status.textContent = 'Введите текст'; return; }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.name === select.value);
        if (voice) u.voice = voice;
        u.onstart = () => status.textContent = '▶ Воспроизведение';
        u.onend = () => status.textContent = '';
        u.onerror = (e) => status.textContent = 'Ошибка: ' + e.error;
        speechSynthesis.speak(u);
    });

    animatePlaceholder(input, 'TYPE TEXT');
}

// ===================== SPOTIFY =====================
function initSpotify() {
    document.getElementById('spotifyIcon')?.addEventListener('click', () => openModal('spotifyModal'));
}

// ===================== ТОП ИГРОКОВ (Firebase) =====================
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
        container.innerHTML = html || '<div style="text-align:center;">— пусто —</div>';
    } catch (e) {
        container.innerHTML = '⚠️ ERROR';
    }
}

// ===================== ФОРУМ (вкладки) =====================
function initForumTabs() {
    const contents = {
        wellness: ['🌿 ВЕЛНЕС','Йога, медитации...'],
        interior: ['🛋️ ИНТЕРЬЕР','Дизайн интерьеров...'],
        radio:    ['📻 РАДИО','Музыка, подкасты...'],
        itai:     ['🤖 IT / AI','Нейросети...'],
        english:  ['📖 ENGLISH','Изучение английского...'],
        design:   ['🎨 DESIGN','Графический дизайн...'],
        tattoo:   ['💉 TATTOO','Тату-культура...'],
        money:    ['💰 MONEY','Финансы...'],
        barbering:['✂️ BARBER','Барберинг...']
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

// ===================== SUPPORT (Telegram виджет) =====================
function initSupportModal() {
    document.getElementById('supportBtn')?.addEventListener('click', () => openModal('supportModal'));
}

// ===================== МОДАЛКИ (общие функции) =====================
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
function showStubModal(title, text) {
    document.getElementById('stubModalTitle').textContent = title;
    document.getElementById('stubModalText').textContent = text;
    openModal('stubModal');
}

function initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.modal));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    });
}

// ===================== НАВИГАЦИЯ "ЗМІСТ" =====================
function initContentsNavigation() {
    document.getElementById('contentsBtn').addEventListener('click', () => openModal('contentsModal'));
    document.querySelectorAll('.contents-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            const pages = document.querySelectorAll('.journal-page');
            const target = document.querySelector(`.journal-page[data-page="${page}"]`);
            const index = [...pages].indexOf(target);
            if (index >= 0) window.scrollToPage(index);
            closeModal('contentsModal');
        });
    });
}

// ===================== TWITTER DISCLAIMER =====================
function initTwitterDisclaimer() {
    document.getElementById('twitterBtn')?.addEventListener('click', () => openModal('disclaimerModal'));
    document.getElementById('openXBtn')?.addEventListener('click', function() {
        window.open(this.dataset.href, '_blank');
        closeModal('disclaimerModal');
    });
}

// ===================== ESCAPE =====================
function initKeyboardEscape() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    });
}
