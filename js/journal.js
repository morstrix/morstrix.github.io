// ===== FONT STYLER (SMALL CAPS MAPPING) =====
const FONT_MAP = {
    'А': 'ᴀ', 'а': 'ᴀ', 'В': 'в', 'в': 'ʙ', 'Е': 'ᴇ', 'е': 'ᴇ', 'К': 'ᴋ', 'к': 'ᴋ',
    'М': 'ᴍ', 'м': 'ᴍ', 'О': 'ᴏ', 'о': 'ᴏ', 'Р': 'ᴘ', 'р': 'ᴘ', 'С': 'ᴄ', 'с': 'ᴄ',
    'Т': 'т', 'т': 'ᴛ', 'Н': 'н', 'н': 'н', 'І': 'і', 'і': 'і', 'У': 'у', 'у': 'у',
    'Л': 'ʌ', 'л': 'ʌ', 'A': 'ᴀ', 'a': 'ᴀ', 'B': 'ʙ', 'b': 'ʙ', 'C': 'ᴄ', 'c': 'ᴄ',
    'D': 'ᴅ', 'd': 'ᴅ', 'E': 'ᴇ', 'e': 'ᴇ', 'F': 'ꜰ', 'f': 'ꜰ', 'G': 'ɢ', 'g': 'ɢ',
    'H': 'ʜ', 'h': 'ʜ', 'I': 'ɪ', 'i': 'ɪ', 'J': 'ᴊ', 'j': 'ᴊ', 'K': 'ᴋ', 'k': 'ᴋ',
    'L': 'ʟ', 'l': 'ʟ', 'M': 'ᴍ', 'm': 'ᴍ', 'N': 'ɴ', 'n': 'ɴ', 'O': 'ᴏ', 'o': 'ᴏ',
    'P': 'ᴘ', 'p': 'ᴘ', 'Q': 'ǫ', 'q': 'ǫ', 'R': 'ʀ', 'r': 'ʀ', 'S': 'ꜱ', 's': 'ꜱ',
    'T': 'ᴛ', 't': 'ᴛ', 'U': 'ᴜ', 'u': 'ᴜ', 'V': 'ᴠ', 'v': 'ᴠ', 'W': 'ᴡ', 'w': 'ᴡ',
    'X': 'x', 'x': 'x', 'Y': 'ʏ', 'y': 'ʏ', 'Z': 'ᴢ', 'z': 'ᴢ',
};

function convertTextToFont(text) {
    return text.split('').map(char => FONT_MAP[char] || FONT_MAP[char.toUpperCase()] || char).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // ===== ИНИЦИАЛИЗАЦИЯ LENIS =====
    const wrapper = document.querySelector('.journal-wrapper');
    const content = document.getElementById('journalHorizontal');
    let lenis = null;

    if (wrapper && content && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            wrapper: wrapper,
            content: content,
            orientation: 'horizontal',
            gestureOrientation: 'both',
            smoothWheel: true,
            smoothTouch: true,
            syncTouch: true,
            touchMultiplier: 2,
            lerp: 0.08,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        window.addEventListener('resize', () => lenis.resize());

        let scrollTimer;
        lenis.on('scroll', () => {
            document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'none');
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = '');
            }, 120);
        });

        const dots = document.querySelectorAll('.dot');
        function updateActiveDot(index) {
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }
        lenis.on('scroll', ({ scroll }) => {
            const pageWidth = wrapper.clientWidth;
            const activeIndex = Math.round(scroll / pageWidth);
            updateActiveDot(activeIndex);
        });

        window.scrollToPage = (index) => {
            const target = index * wrapper.clientWidth;
            lenis.scrollTo(target, { immediate: false, lerp: 0.08 });
        };

        setTimeout(() => {
            const pageWidth = wrapper.clientWidth;
            const activeIndex = Math.round(lenis.scroll / pageWidth);
            updateActiveDot(activeIndex);
        }, 100);
    }

    // Создаём 6 точек
    const indicator = document.getElementById('pageIndicator');
    indicator.innerHTML = Array(6).fill(0).map(() => '<span class="dot"></span>').join('');
    const dots = document.querySelectorAll('.dot');
    if (dots.length) dots[0].classList.add('active');

    // ===== RSS ТИКЕР =====
    const ticker = document.getElementById('rssTicker');
    const fallbackTickerItems = [
        { title: "✦ MORSTRIX V2.0 ✦", url: "https://t.me/morstrix" },
        { title: "✦ NEW PRINTS ✦", url: "https://t.me/morstrix" },
        { title: "✦ TELEGRAM ✦", url: "https://t.me/morstrix" }
    ];
    const TICKER_CACHE_KEY = 'journalTickerCacheV2';
    const tickerWrapper = document.querySelector('.ticker-wrapper');

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setTickerText(items) {
        if (!ticker) return;
        const normalizeItem = (item) => {
            if (typeof item === 'string') return { title: item, url: '' };
            if (item && typeof item === 'object' && typeof item.title === 'string') {
                return { title: item.title, url: typeof item.url === 'string' ? item.url : '' };
            }
            return null;
        };
        const normalized = (Array.isArray(items) ? items : [])
            .map(normalizeItem)
            .filter(Boolean);
        const safeItems = normalized.length ? normalized : fallbackTickerItems;

        const toAnchor = (item) => {
            const title = escapeHtml(item?.title || '');
            const url = typeof item?.url === 'string' && item.url.startsWith('http') ? item.url : '';
            if (!title) return '';
            if (!url) return `<span class="ticker-item">${title}</span>`;
            return `<a class="ticker-link ticker-item" href="${encodeURI(url)}" target="_blank" rel="noopener noreferrer">${title}</a>`;
        };

        const line = safeItems.map(toAnchor).filter(Boolean).join('<span class="ticker-sep">  •  </span>');
        if (!line) {
            ticker.textContent = "✦ MORSTRIX V2.0 ✦";
            return;
        }
        // Duplicate once for smoother endless marquee.
        ticker.innerHTML = `${line}<span class="ticker-sep">  •  </span>${line}`;
    }

    async function fetchJson(url, timeoutMs = 7000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (e) {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function fetchDevToTitles(tag, sourceName, limit = 2) {
        const data = await fetchJson(`https://dev.to/api/articles?per_page=${limit}&tag=${encodeURIComponent(tag)}`);
        if (!Array.isArray(data)) return [];
        return data
            .map(item => ({
                title: (item?.title || '').replace(/\s+/g, ' ').trim(),
                url: item?.url || item?.canonical_url || ''
            }))
            .filter(item => item.title)
            .slice(0, limit)
            .map(item => ({ title: `✦ ${sourceName}: ${item.title} ✦`, url: item.url }));
    }

    async function fetchHnTitles(query, sourceName, limit = 2) {
        const data = await fetchJson(`https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=${limit}&query=${encodeURIComponent(query)}`);
        const hits = Array.isArray(data?.hits) ? data.hits : [];
        return hits
            .map(item => ({
                title: (item?.title || '').replace(/\s+/g, ' ').trim(),
                url: item?.url || `https://news.ycombinator.com/item?id=${item?.objectID || ''}`
            }))
            .filter(item => item.title)
            .slice(0, limit)
            .map(item => ({ title: `✦ ${sourceName}: ${item.title} ✦`, url: item.url }));
    }

    async function fetchRssViaRss2Json(feedUrl, sourceName, limit = 2) {
        const encoded = encodeURIComponent(feedUrl);
        const data = await fetchJson(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}`);
        const items = Array.isArray(data?.items) ? data.items : [];
        return items
            .map(item => ({
                title: (item?.title || '').replace(/\s+/g, ' ').trim(),
                url: item?.link || ''
            }))
            .filter(item => item.title)
            .slice(0, limit)
            .map(item => ({ title: `✦ ${sourceName}: ${item.title} ✦`, url: item.url }));
    }

    async function loadRssTicker() {
        if (!ticker) return;

        const cached = localStorage.getItem(TICKER_CACHE_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const cachedItems = Array.isArray(parsed.items) ? parsed.items : [];
                const cacheFresh = Date.now() - parsed.ts < 30 * 60 * 1000;
                const hasAtLeastOneLink = cachedItems.some(item => item && typeof item === 'object' && typeof item.url === 'string' && item.url.startsWith('http'));

                // Ignore legacy cache that contains only plain strings (no URLs).
                if (cachedItems.length && cacheFresh && hasAtLeastOneLink) {
                    setTickerText(parsed.items);
                    return;
                }
            } catch (e) {
                // Ignore broken cache.
            }
        }

        setTickerText(fallbackTickerItems);

        const results = await Promise.all([
            fetchDevToTitles('design', 'DEVTO DESIGN'),
            fetchDevToTitles('webdev', 'DEVTO WEBDEV'),
            fetchDevToTitles('art', 'DEVTO ART'),
            fetchHnTitles('design', 'HN DESIGN'),
            fetchHnTitles('fashion', 'HN FASHION'),
            // Keep one fashion/art RSS path for vibe sources.
            fetchRssViaRss2Json('https://hypebeast.com/feed', 'HYPEBEAST')
        ]);

        const items = results.flat().slice(0, 12);
        if (!items.length) {
            // Stable local fallback (works offline / when APIs fail).
            const localData = await fetchJson('assets/news-fallback.json', 3000);
            const localItems = Array.isArray(localData?.items) ? localData.items : [];
            if (localItems.length) {
                setTickerText(localItems);
                localStorage.setItem(TICKER_CACHE_KEY, JSON.stringify({ items: localItems, ts: Date.now() }));
            }
            return;
        }

        setTickerText(items);
        localStorage.setItem(TICKER_CACHE_KEY, JSON.stringify({ items, ts: Date.now() }));
    }

    loadRssTicker();

    // Desktop: pause handled via CSS :hover.
    // Mobile: press and hold to pause, release to continue.
    if (tickerWrapper) {
        const pauseTicker = () => tickerWrapper.classList.add('is-paused');
        const resumeTicker = () => tickerWrapper.classList.remove('is-paused');

        tickerWrapper.addEventListener('touchstart', pauseTicker, { passive: true });
        tickerWrapper.addEventListener('touchend', resumeTicker, { passive: true });
        tickerWrapper.addEventListener('touchcancel', resumeTicker, { passive: true });
    }

    if (ticker) {
        // Ensure link opening works even while marquee is moving and Lenis handles gestures.
        ticker.addEventListener('click', (event) => {
            const link = event.target.closest('a.ticker-link');
            if (!link) return;
            event.preventDefault();
            event.stopPropagation();
            window.open(link.href, '_blank', 'noopener,noreferrer');
        });
    }

    // ===== КАРУСЕЛЬ =====
    const carousel = document.getElementById('mainCarousel');
    let carouselInterval;
    if (carousel) {
        const imgs = carousel.querySelectorAll('img');
        carouselInterval = setInterval(() => {
            const active = carousel.querySelector('.active');
            let next = active.nextElementSibling;
            if (!next) next = imgs[0];
            active.classList.remove('active');
            next.classList.add('active');
        }, 3000);
        carousel.addEventListener('click', () => clearInterval(carouselInterval));
    }

    // ===== УТИЛИТЫ МОДАЛОК =====
    function openModal(id){ document.getElementById(id)?.classList.add('active'); }
    function closeModal(id){ document.getElementById(id)?.classList.remove('active'); }

    // ===== TWITTER =====
    document.getElementById('twitterBtn')?.addEventListener('click', ()=> openModal('disclaimerModal'));

    // ===== FONT STYLER =====
    const embeddedInput = document.getElementById('fontInputEmbedded');
    const embeddedPreview = document.getElementById('stylerPreviewEmbedded');
    if (embeddedInput && embeddedPreview) {
        function updateStylerPreview() {
            const rawText = embeddedInput.value.trim();
            embeddedPreview.textContent = rawText === '' ? convertTextToFont('tap to copy') : convertTextToFont(rawText);
        }
        updateStylerPreview();
        embeddedInput.addEventListener('input', updateStylerPreview);
        embeddedPreview.addEventListener('click', () => {
            navigator.clipboard.writeText(embeddedPreview.textContent).then(() => {
                const original = embeddedPreview.textContent;
                embeddedPreview.textContent = convertTextToFont('copied!');
                setTimeout(() => embeddedPreview.textContent = original, 800);
            }).catch(err => console.warn('Clipboard error:', err));
        });

        const placeholderText = 'TYPE TEXT';
        let typingTimer = null, isTyping = true, charIndex = 0;
        function animatePlaceholder() {
            if (typingTimer) clearTimeout(typingTimer);
            if (isTyping) {
                if (charIndex < placeholderText.length) {
                    embeddedInput.placeholder = placeholderText.substring(0, charIndex + 1) + ' █';
                    charIndex++;
                    typingTimer = setTimeout(animatePlaceholder, 120);
                } else {
                    isTyping = false;
                    typingTimer = setTimeout(animatePlaceholder, 1500);
                }
            } else {
                if (charIndex > 0) {
                    charIndex--;
                    embeddedInput.placeholder = placeholderText.substring(0, charIndex) + ' █';
                    typingTimer = setTimeout(animatePlaceholder, 80);
                } else {
                    isTyping = true;
                    embeddedInput.placeholder = ' █';
                    typingTimer = setTimeout(animatePlaceholder, 300);
                }
            }
        }
        function startAnimation() {
            if (embeddedInput.value === '') {
                isTyping = true; charIndex = 0;
                embeddedInput.placeholder = ' █';
                if (typingTimer) clearTimeout(typingTimer);
                typingTimer = setTimeout(animatePlaceholder, 300);
            }
        }
        function stopAnimation() {
            if (typingTimer) clearTimeout(typingTimer);
            embeddedInput.placeholder = '';
        }
        embeddedInput.addEventListener('focus', stopAnimation);
        embeddedInput.addEventListener('blur', () => { if (embeddedInput.value === '') startAnimation(); });
        const page3 = document.querySelector('.journal-page[data-page="3"]');
        if (page3) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => entry.isIntersecting ? startAnimation() : stopAnimation());
            }, { threshold: 0.1 });
            observer.observe(page3);
        } else startAnimation();
    }

    // ===== СКАЧИВАНИЕ АРХИВА =====
    document.getElementById('downloadArchiveBtnEmbedded')?.addEventListener('click', ()=> {
        const a = document.createElement('a');
        a.href = 'assets/morstrix_archive.zip';
        a.download = 'MORSTRIX_FONT.zip';
        a.click();
    });

    // ===== PAINT (НОВАЯ ЛОГИКА) =====
    document.getElementById('paintJournalBtn')?.addEventListener('click', ()=> openModal('paintChoiceModal'));

    document.getElementById('paintAnonChoiceBtn')?.addEventListener('click', ()=> {
        closeModal('paintChoiceModal');
        window.location.href = 'paint.html';
    });

    document.getElementById('paintRegChoiceBtn')?.addEventListener('click', ()=> {
        closeModal('paintChoiceModal');
        openModal('nicknameModal');
    });

    document.getElementById('nicknameEnterBtn')?.addEventListener('click', ()=> {
        const nickname = document.getElementById('nicknameInput').value.trim();
        if (nickname) {
            localStorage.setItem('paintNickname', nickname);
            window.location.href = 'paint.html?nick=' + encodeURIComponent(nickname);
            closeModal('nicknameModal');
        } else {
            alert('Введите никнейм');
        }
    });

    // ===== MOOD (PINTEREST) =====
    const moodTrigger = document.getElementById('moodTrigger');
    if (moodTrigger) {
        moodTrigger.addEventListener('click', ()=> {
            openModal('moodModal');
            if (!window.pinterestScriptLoaded) {
                const script = document.createElement('script');
                script.src = 'https://assets.pinterest.com/js/pinit.js';
                script.onload = () => { if (window.PinUtils) window.PinUtils.build(); };
                document.head.appendChild(script);
                window.pinterestScriptLoaded = true;
            } else {
                if (window.PinUtils) window.PinUtils.build();
            }
        });
    }

    // ===== АРХИВ (заглушка) =====
    document.getElementById('archiveBtn')?.addEventListener('click', ()=> {
        openModal('stubModal');
        const titleEl = document.getElementById('stubModalTitle');
        const textEl = document.getElementById('stubModalText');
        if (titleEl) titleEl.textContent = 'АРХИВ';
        if (textEl) textEl.textContent = 'Скоро здесь будут рисунки участников';
    });

    // ===== SPOTIFY =====
    document.getElementById('spotifyIcon')?.addEventListener('click', ()=> openModal('spotifyModal'));

    // ===== TEXT SYNTH (TTS) =====
    const ttsSpeakBtn = document.getElementById('ttsSpeakBtn');
    const ttsTextInput = document.getElementById('ttsTextInput');
    const ttsVoiceSelect = document.getElementById('ttsVoiceSelect');
    const ttsStatus = document.getElementById('ttsStatus');
    let voices = [];
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        if (ttsVoiceSelect) {
            ttsVoiceSelect.innerHTML = '';
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.lang} - ${voice.name}`;
                ttsVoiceSelect.appendChild(option);
            });
            const ukrVoice = voices.find(v => v.lang.startsWith('uk'));
            const rusVoice = voices.find(v => v.lang.startsWith('ru'));
            if (ukrVoice) ttsVoiceSelect.value = ukrVoice.name;
            else if (rusVoice) ttsVoiceSelect.value = rusVoice.name;
        }
    }
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
    function speakWithSpeechSynthesis(text) {
        if (!text.trim()) { ttsStatus.textContent = 'Введите текст'; return; }
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceName = ttsVoiceSelect?.value;
        if (selectedVoiceName) {
            const voice = voices.find(v => v.name === selectedVoiceName);
            if (voice) utterance.voice = voice;
        }
        utterance.rate = 1.0; utterance.pitch = 1.0;
        utterance.onstart = () => ttsStatus.textContent = '▶ Воспроизведение';
        utterance.onend = () => ttsStatus.textContent = '';
        utterance.onerror = (e) => ttsStatus.textContent = 'Ошибка: ' + e.error;
        speechSynthesis.speak(utterance);
    }
    if (ttsSpeakBtn) ttsSpeakBtn.addEventListener('click', ()=> speakWithSpeechSynthesis(ttsTextInput.value));
    if (ttsTextInput) ttsTextInput.addEventListener('keypress', (e)=> { if (e.key === 'Enter') ttsSpeakBtn?.click(); });

    // ===== ТОП ИГРОКОВ (FIREBASE) =====
    async function loadTopPlayers(){
        const container = document.querySelector('.top-players-list');
        if(!container) return;
        try{
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
            const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
            const firebaseConfig = {
                apiKey:"AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
                authDomain:"helper-e10b2.firebaseapp.com",
                projectId:"helper-e10b2",
                storageBucket:"helper-e10b2.firebasestorage.app",
                messagingSenderId:"131536876451",
                appId:"1:131536876451:web:eeaef494c83dfc4849e016"
            };
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const q = query(collection(db,"top_players"), orderBy("score","desc"), limit(10));
            const snap = await getDocs(q);
            if(!snap.empty){
                let html=''; let rank=1;
                snap.forEach(d=>{ const data=d.data(); html+=`<div class="top-row"><span>${rank}. ${(data.name||'ANON').slice(0,10)}</span><span>${data.score}</span></div>`; rank++; });
                container.innerHTML=html;
            } else {
                container.innerHTML = '<div style="text-align:center;padding:10px;">— пусто —</div>';
            }
        }catch(e){ container.innerHTML='⚠️ ERROR'; }
    }
    if(document.querySelector('.top-players-list')) loadTopPlayers();

    // ===== ФОРУМ ВКЛАДКИ =====
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
    document.querySelectorAll('.forum-tabs-panel-embedded .forum-tab').forEach(tab => {
        tab.addEventListener('click', ()=> {
            document.querySelectorAll('.forum-tabs-panel-embedded .forum-tab').forEach(t=> t.classList.remove('active'));
            tab.classList.add('active');
            const id = tab.dataset.tab;
            if(contents[id]) {
                document.getElementById('forumTitleEmbedded').textContent = contents[id][0];
                document.getElementById('forumTextEmbedded').textContent = contents[id][1];
            }
        });
    });

    // ===== SUPPORT =====
    document.getElementById('supportBtn')?.addEventListener('click', ()=> openModal('supportModal'));
    document.getElementById('forumFullBtn')?.addEventListener('click', ()=> openModal('forumDisclaimerModal'));

    // ===== ЗАКРЫТИЕ МОДАЛОК =====
    document.querySelectorAll('.modal-close-btn').forEach(b=> b.addEventListener('click', ()=>{
        const id = b.dataset.modal;
        if(id) closeModal(id);
    }));
    document.querySelectorAll('.modal-overlay').forEach(o=> o.addEventListener('click', e=>{ if(e.target===o) o.classList.remove('active'); }));

    // ===== МОДАЛКА "ЗМІСТ" =====
    document.getElementById('contentsBtn').addEventListener('click', ()=> openModal('contentsModal'));
    document.querySelectorAll('.contents-item').forEach(item => {
        item.addEventListener('click', ()=> {
            const page = item.dataset.page;
            const pages = document.querySelectorAll('.journal-page');
            const targetPage = document.querySelector(`.journal-page[data-page="${page}"]`);
            if (targetPage && window.scrollToPage) {
                const index = [...pages].indexOf(targetPage);
                window.scrollToPage(index);
            } else {
                targetPage?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }
            closeModal('contentsModal');
        });
    });

    // ===== ESCAPE =====
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.modal-overlay.active').forEach(m=>m.classList.remove('active')); });

    // ===== DISCLAIMER BUTTONS =====
    document.querySelectorAll('[data-href]').forEach(btn => {
        btn.addEventListener('click', function() {
            window.open(this.dataset.href, '_blank');
            const modalToClose = this.dataset.modalClose;
            if (modalToClose) closeModal(modalToClose);
            else closeModal('disclaimerModal');
        });
    });
});
