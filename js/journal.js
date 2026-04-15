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
    initPinterestPanel(); // НОВАЯ ЛОГИКА
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
        wrapper, content, orientation: 'horizontal',
        gestureOrientation: 'horizontal', smoothWheel: true, smoothTouch: true, lerp: 0.08
    });

    function raf(time) { state.lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.scrollToPage = (index) => state.lenis.scrollTo(index * wrapper.clientWidth);

    const indicator = document.getElementById('pageIndicator');
    indicator.innerHTML = Array(state.pageCount).fill(0).map(() => '<span class="dot"></span>').join('');
    const dots = indicator.querySelectorAll('.dot');

    state.lenis.on('scroll', ({ scroll }) => {
        const activeIndex = Math.round(scroll / wrapper.clientWidth);
        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
        document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'none');
        clearTimeout(state.iframeTimer);
        state.iframeTimer = setTimeout(() => {
            document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = '');
        }, 150);
    });
    setTimeout(() => dots[Math.round(state.lenis.scroll / wrapper.clientWidth)]?.classList.add('active'), 100);
}

function initRssTicker() {
    const ticker = document.getElementById('rssTicker');
    if (ticker) ticker.textContent = [...state.rssHeadlines, ...state.rssHeadlines].join('  —  ');
}

function initArtPreviewSync() {
    const img = document.getElementById('currentArtPreview');
    const update = () => { const saved = localStorage.getItem('morstrix_current_art'); if (saved && img) img.src = saved; };
    update();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}

function initPaintEntry() {
    document.getElementById('paintJournalBtn')?.addEventListener('click', () => openModal('paintEntryModal'));
    document.getElementById('paintAnonBtn')?.addEventListener('click', () => window.open('paint.html', '_blank'));
    document.getElementById('paintRegBtn')?.addEventListener('click', () => window.open('paint.html', '_blank'));
}

// НОВАЯ ЛОГИКА PINTEREST
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
            // Открываем соответствующую модалку с виджетом
            if (catName === 'diliger') openModal('pinterestModalDiliger');
            else if (catName === 'tattoo') openModal('pinterestModalTattoo');
            else if (catName === 'barbering') openModal('pinterestModalBarbering');
            menu.classList.remove('active');
            
            // Загружаем скрипт Pinterest если нужно
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
        if (!panel.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('active');
    });
}

document.getElementById('archiveBtn')?.addEventListener('click', () => showStubModal('АРХИВ', 'Скоро здесь будут рисунки участников'));

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

function animatePlaceholder(input, text) { /* ... как в предыдущей версии ... */ }

function initDownloadArchive() {
    document.getElementById('downloadArchiveBtnEmbedded')?.addEventListener('click', () => {
        const a = document.createElement('a'); a.href = 'assets/morstrix_archive.zip'; a.download = 'MORSTRIX_FONT.zip'; a.click();
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
        speechSynthesis.speak(u);
    });
    animatePlaceholder(input, 'TYPE TEXT');
}

function initSpotify() { document.getElementById('spotifyIcon')?.addEventListener('click', () => openModal('spotifyModal')); }

async function initTopPlayers() { /* ... Firebase ... */ }

function initForumTabs() {
    const contents = { wellness: ['🌿 ВЕЛНЕС','Йога...'], /* ... */ };
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

function initSupportModal() { document.getElementById('supportBtn')?.addEventListener('click', () => openModal('supportModal')); }

function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
function showStubModal(title, text) {
    document.getElementById('stubModalTitle').textContent = title;
    document.getElementById('stubModalText').textContent = text;
    openModal('stubModal');
}
function initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.modal)));
    document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('active'); }));
}
function initContentsNavigation() {
    document.getElementById('contentsBtn').addEventListener('click', () => openModal('contentsModal'));
    document.querySelectorAll('.contents-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            const target = document.querySelector(`.journal-page[data-page="${page}"]`);
            const index = [...document.querySelectorAll('.journal-page')].indexOf(target);
            if (index >= 0) window.scrollToPage(index);
            closeModal('contentsModal');
        });
    });
}
function initTwitterDisclaimer() {
    document.getElementById('twitterBtn')?.addEventListener('click', () => openModal('disclaimerModal'));
    document.getElementById('openXBtn')?.addEventListener('click', function() { window.open(this.dataset.href, '_blank'); closeModal('disclaimerModal'); });
}
function initKeyboardEscape() { document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); }); }