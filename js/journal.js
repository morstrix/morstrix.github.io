// ===== PIXEL CANVAS WEB COMPONENT =====
class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = 2;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }
    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }
    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.x + centerOffset,
            this.y + centerOffset,
            this.size,
            this.size
        );
    }
    appear() {
        this.isIdle = false;
        if (this.counter <= this.delay) {
            this.counter += this.counterStep;
            return;
        }
        if (this.size >= this.maxSize) {
            this.isShimmer = true;
        }
        if (this.isShimmer) {
            this.shimmer();
        } else {
            this.size += this.sizeStep;
        }
        this.draw();
    }
    disappear() {
        this.isShimmer = false;
        this.counter = 0;
        if (this.size <= 0) {
            this.isIdle = true;
            return;
        } else {
            this.size -= 0.1;
        }
        this.draw();
    }
    shimmer() {
        if (this.size >= this.maxSize) {
            this.isReverse = true;
        } else if (this.size <= this.minSize) {
            this.isReverse = false;
        }
        if (this.isReverse) {
            this.size -= this.speed;
        } else {
            this.size += this.speed;
        }
    }
}

class PixelCanvas extends HTMLElement {
    static register(tag = "pixel-canvas") {
        if ("customElements" in window) {
            customElements.define(tag, this);
        }
    }
    static css = `
        :host {
            display: grid;
            inline-size: 100%;
            block-size: 100%;
            overflow: hidden;
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
        }
    `;
    get colors() {
        return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"];
    }
    get gap() {
        const value = this.dataset.gap || 5;
        const min = 4;
        const max = 50;
        if (value <= min) return min;
        else if (value >= max) return max;
        else return parseInt(value);
    }
    get speed() {
        const value = this.dataset.speed || 35;
        const min = 0;
        const max = 100;
        const throttle = 0.001;
        if (value <= min || this.reducedMotion) return min;
        else if (value >= max) return max * throttle;
        else return parseInt(value) * throttle;
    }
    get noFocus() {
        return this.hasAttribute("data-no-focus");
    }
    connectedCallback() {
        const canvas = document.createElement("canvas");
        const sheet = new CSSStyleSheet();
        this._parent = this.parentNode;
        this.shadowroot = this.attachShadow({ mode: "open" });
        sheet.replaceSync(PixelCanvas.css);
        this.shadowroot.adoptedStyleSheets = [sheet];
        this.shadowroot.append(canvas);
        this.canvas = this.shadowroot.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.timeInterval = 1000 / 60;
        this.timePrevious = performance.now();
        this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        this.init();
        this.resizeObserver = new ResizeObserver(() => this.init());
        this.resizeObserver.observe(this);
        this._parent.addEventListener("mouseenter", this);
        this._parent.addEventListener("mouseleave", this);
    }
    disconnectedCallback() {
        this.resizeObserver.disconnect();
        this._parent.removeEventListener("mouseenter", this);
        this._parent.removeEventListener("mouseleave", this);
        delete this._parent;
    }
    handleEvent(event) {
        this[`on${event.type}`](event);
    }
    onmouseenter() {
        this.handleAnimation("appear");
    }
    onmouseleave() {
        this.handleAnimation("disappear");
    }
    handleAnimation(name) {
        cancelAnimationFrame(this.animation);
        this.animation = this.animate(name);
    }
    init() {
        const rect = this.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        this.pixels = [];
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.createPixels();
    }
    getDistanceToCanvasCenter(x, y) {
        const dx = x - this.canvas.width / 2;
        const dy = y - this.canvas.height / 2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    createPixels() {
        for (let x = 0; x < this.canvas.width; x += this.gap) {
            for (let y = 0; y < this.canvas.height; y += this.gap) {
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const delay = this.reducedMotion ? 0 : this.getDistanceToCanvasCenter(x, y);
                this.pixels.push(new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay));
            }
        }
    }
    animate(fnName) {
        this.animation = requestAnimationFrame(() => this.animate(fnName));
        const timeNow = performance.now();
        const timePassed = timeNow - this.timePrevious;
        if (timePassed < this.timeInterval) return;
        this.timePrevious = timeNow - (timePassed % this.timeInterval);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i][fnName]();
        }
        if (this.pixels.every((pixel) => pixel.isIdle)) {
            cancelAnimationFrame(this.animation);
        }
    }
}
PixelCanvas.register();

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
 // ===== ИНИЦИАЛИЗАЦИЯ LENIS + МАГНИТ =====
const wrapper = document.querySelector('.journal-wrapper');
const content = document.getElementById('journalVertical');
window.lenis = null;

if (wrapper && content && typeof Lenis !== 'undefined') {
  window.lenis = new Lenis({
    wrapper,
    content,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: true,
    syncTouch: true,
    touchMultiplier: 3,
    lerp: 0.18,
    prevent: (node) => node.classList.contains('no-lenis'),
  });

  function raf(time) { window.lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  
  // Обработка резайза + ориентации экрана
  const resizeObserver = new ResizeObserver(() => {
    window.lenis?.resize();
    const ph = wrapper.clientHeight;
    const currentScroll = window.lenis?.scroll || 0;
    const nearestPage = Math.round(currentScroll / ph);
    updateActiveDot(nearestPage);
  });
  resizeObserver.observe(wrapper);
  
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      window.lenis?.resize();
      const ph = wrapper.clientHeight;
      const currentScroll = window.lenis?.scroll || 0;
      const nearestPage = Math.round(currentScroll / ph);
      updateActiveDot(nearestPage);
    }, 100);
  });

  window.currentPage = 0;
  const totalPages = 8;

  // --- Точки ---
  const indicator = document.getElementById('pageIndicator');
  indicator.innerHTML = Array(totalPages).fill(0).map(() => '<span class="dot"></span>').join('');
  const dots = document.querySelectorAll('.dot');

  let lastDotUpdate = -1;
  function updateActiveDot(index) {
    // Optimize: only update if index actually changed
    if (index === lastDotUpdate) return;
    lastDotUpdate = index;
    
    index = Math.max(0, Math.min(totalPages - 1, index));
    dots.forEach((dot, i) => {
      const shouldBeActive = i === index;
      if (dot.classList.contains('active') !== shouldBeActive) {
        dot.classList.toggle('active', shouldBeActive);
        dot.style.transitionDelay = `${Math.abs(i - index) * 0.05}s`;
      }
    });
    // currentPage НЕ меняем здесь — только визуал
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => window.scrollToPage(i)));

  let peakVelocity = 0;
  let snapTimer, scrollTimer;
  let isSnapping = false;

  window.lenis.on('scroll', ({ scroll, velocity }) => {
    if (isSnapping) return;

    // Добавляем класс для отключения iframe во время быстрого скролла
    const shouldDisableIframes = Math.abs(velocity) > 0.1;
    if (shouldDisableIframes) {
      wrapper.classList.add('is-scrolling');
    }
    
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      wrapper.classList.remove('is-scrolling');
    }, 150);

    if (Math.abs(velocity) > Math.abs(peakVelocity)) {
      peakVelocity = velocity;
    }

    const ph = wrapper.clientHeight;
    updateActiveDot(Math.round(scroll / ph));

    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      let target;

      if (Math.abs(peakVelocity) > 0.3) {
        target = peakVelocity > 0 ? window.currentPage + 1 : window.currentPage - 1;
      } else {
        const nearest = Math.round(window.lenis.scroll / ph);
        target = Math.max(window.currentPage - 1, Math.min(window.currentPage + 1, nearest));
      }

      peakVelocity = 0;
      target = Math.max(0, Math.min(totalPages - 1, target));
      window.scrollToPage(target);
    }, 50);
  });

  window.scrollToPage = (index) => {
    if (!window.lenis) return;
    
    index = Math.max(0, Math.min(totalPages - 1, index));
    peakVelocity = 0;
    isSnapping = true;

    try {
      if (window.lenis.isStopped) window.lenis.start();

      window.lenis.scrollTo(index * wrapper.clientHeight, {
        duration: 0.45,
        easing: t => 1 - Math.pow(1 - t, 4),
        onComplete: () => { isSnapping = false; },
      });

      window.currentPage = index;
      updateActiveDot(index);
    } catch (e) {
      console.error('Lenis scrollTo error:', e);
      isSnapping = false;
    }
  };

  if (dots.length) dots[0].classList.add('active');
  setTimeout(() => updateActiveDot(Math.round(window.lenis.scroll / wrapper.clientHeight)), 100);
} else {
  // FALLBACK: Lenis не загружена или недоступна
  console.warn('Lenis not available, using native scroll');
  
  // Инициализируем window.scrollToPage для совместимости
  window.scrollToPage = (index) => {
    const totalPages = 8;
    index = Math.max(0, Math.min(totalPages - 1, index));
    const ph = wrapper?.clientHeight || window.innerHeight;
    window.currentPage = index;
    
    // Используем нативный scroll
    if (wrapper) {
      wrapper.scrollTop = index * ph;
    } else {
      window.scrollTo({ top: index * ph, behavior: 'smooth' });
    }
  };
  
  // Базовая поддержка кнопок навигации
  const dots = document.querySelectorAll('.dot');
  if (dots.length) dots[0].classList.add('active');
}

// Стрелки Pinterest
document.getElementById('pinterestPrevBtn')?.addEventListener('click', () => {
  window.scrollToPage?.(window.currentPage - 1);
});
document.getElementById('pinterestNextBtn')?.addEventListener('click', () => {
  window.scrollToPage?.(window.currentPage + 1);
});

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

        const line = safeItems.map(toAnchor).filter(Boolean).join('<span class="ticker-sep"> ☻ </span>');
        if (!line) {
            ticker.textContent = "✦ MORSTRIX V2.0 ✦";
            return;
        }
        // Duplicate once for smoother endless marquee.
        ticker.innerHTML = `${line}<span class="ticker-sep"> ☻ </span>${line}`;
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
    // ===== BEHANCE =====
    document.getElementById('behanceBtn')?.addEventListener('click', ()=> openModal('behanceDisclaimerModal'));

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
            alert('Enter nickname');
        }
    });

    // Typewriter animation for nickname input
    const nicknameInput = document.getElementById('nicknameInput');
    if (nicknameInput) {
        const nicknamePlaceholder = 'NICKNAME';
        let nicknameTypingTimer = null, isNicknameTyping = true, nicknameCharIndex = 0;
        function animateNicknamePlaceholder() {
            if (nicknameTypingTimer) clearTimeout(nicknameTypingTimer);
            if (isNicknameTyping) {
                if (nicknameCharIndex < nicknamePlaceholder.length) {
                    nicknameInput.placeholder = nicknamePlaceholder.substring(0, nicknameCharIndex + 1) + ' █';
                    nicknameCharIndex++;
                    nicknameTypingTimer = setTimeout(animateNicknamePlaceholder, 120);
                } else {
                    isNicknameTyping = false;
                    nicknameTypingTimer = setTimeout(animateNicknamePlaceholder, 1500);
                }
            } else {
                if (nicknameCharIndex > 0) {
                    nicknameCharIndex--;
                    nicknameInput.placeholder = nicknamePlaceholder.substring(0, nicknameCharIndex) + ' █';
                    nicknameTypingTimer = setTimeout(animateNicknamePlaceholder, 80);
                } else {
                    isNicknameTyping = true;
                    nicknameInput.placeholder = ' █';
                    nicknameTypingTimer = setTimeout(animateNicknamePlaceholder, 300);
                }
            }
        }
        function startNicknameAnimation() {
            if (nicknameInput.value === '') {
                isNicknameTyping = true; nicknameCharIndex = 0;
                nicknameInput.placeholder = ' █';
                if (nicknameTypingTimer) clearTimeout(nicknameTypingTimer);
                nicknameTypingTimer = setTimeout(animateNicknamePlaceholder, 300);
            }
        }
        function stopNicknameAnimation() {
            if (nicknameTypingTimer) clearTimeout(nicknameTypingTimer);
            nicknameInput.placeholder = '';
        }
        nicknameInput.addEventListener('focus', stopNicknameAnimation);
        nicknameInput.addEventListener('blur', () => { if (nicknameInput.value === '') startNicknameAnimation(); });
        
        // Start animation when modal opens
        const nicknameModal = document.getElementById('nicknameModal');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active') && nicknameInput.value === '') {
                    startNicknameAnimation();
                } else {
                    stopNicknameAnimation();
                }
            });
        });
        observer.observe(nicknameModal, { attributes: true, attributeFilter: ['class'] });
    }

    // ===== MOOD (PINTEREST) =====
    const moodTrigger = document.getElementById('moodTrigger');
    if (moodTrigger) {
        moodTrigger.addEventListener('click', ()=> {
            openModal('moodModal');
            if (!window.pinterestScriptLoaded) {
                const script = document.createElement('script');
                script.src = 'https://assets.pinterest.com/js/pinit.js';
                script.onload = () => { 
                    if (window.PinUtils) {
                        window.PinUtils.build();
                        // Resize Lenis after Pinterest loads
                        window.lenis?.resize();
                    }
                };
                script.onerror = () => {
                    console.warn('Pinterest script failed to load');
                    window.pinterestScriptLoaded = false;
                };
                script.timeout = 5000;
                document.head.appendChild(script);
                window.pinterestScriptLoaded = true;
            } else {
                if (window.PinUtils) window.PinUtils.build();
            }
        });
    }

    // ===== ART FEED (FIRESTORE) =====
    let firebaseDbPromise = null;
    async function getFirestoreDb() {
        if (!firebaseDbPromise) {
            firebaseDbPromise = (async () => {
                const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
                const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
                const firebaseConfig = {
                    apiKey: 'AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU',
                    authDomain: 'helper-e10b2.firebaseapp.com',
                    projectId: 'helper-e10b2',
                    storageBucket: 'helper-e10b2.firebasestorage.app',
                    messagingSenderId: '131536876451',
                    appId: '1:131536876451:web:eeaef494c83dfc4849e016'
                };
                const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
                return getFirestore(app);
            })();
        }
        return firebaseDbPromise;
    }

    async function loadCurrentArt() {
        const preview = document.getElementById('currentArtPreview');
        if (!preview) return;
        try {
            const db = await getFirestoreDb();
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
            const currentSnap = await getDoc(doc(db, 'global_canvas', 'current'));
            if (currentSnap.exists()) {
                const data = currentSnap.data();
                if (data?.imageBase64) {
                    preview.src = data.imageBase64;
                }
            }
        } catch (e) {
            console.warn('loadCurrentArt failed', e);
        }
    }

    function formatFeedTime(value) {
        const date = value?.toDate ? value.toDate() : (value instanceof Date ? value : null);
        if (!date) return 'unknown time';
        return date.toLocaleString();
    }

    function openFeedPreview(imageBase64) {
        const imageEl = document.getElementById('feedPreviewImage');
        if (!imageEl) return;
        imageEl.src = imageBase64;
        openModal('feedPreviewModal');
    }

    async function loadFeed() {
        const container = document.getElementById('feedContainer');
        if (!container) return;
        container.innerHTML = '<p class="text-secondary">Loading feed...</p>';
        try {
            const db = await getFirestoreDb();
            const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
            const historyRef = collection(db, 'global_canvas', 'current', 'history');
            const feedQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
            const snap = await getDocs(feedQuery);

            if (snap.empty) {
                container.innerHTML = '<p class="text-secondary">No feed entries yet.</p>';
                return;
            }

            container.innerHTML = '';
            snap.forEach((entry) => {
                const data = entry.data();
                if (!data?.imageBase64) return;

                const item = document.createElement('div');
                item.className = 'feed-item';
                item.innerHTML = `
                    <img class="feed-thumb" src="${data.imageBase64}" alt="Feed item">
                    <div class="feed-meta">${(data.authorName || 'ANON')}<br>${formatFeedTime(data.timestamp)}</div>
                `;
                item.addEventListener('click', () => openFeedPreview(data.imageBase64));
                container.appendChild(item);
            });
        } catch (e) {
            console.warn('loadFeed failed', e);
            container.innerHTML = '<p class="text-secondary">Failed to load feed.</p>';
        }
    }

    document.getElementById('archiveBtn')?.addEventListener('click', async ()=> {
        const titleEl = document.getElementById('stubModalTitle');
        if (titleEl) titleEl.textContent = 'FEED';
        openModal('stubModal');
        await loadFeed();
    });

    loadCurrentArt();

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

// Интеграция Lenis для премиального скролла
(function() {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/lenis@1.1.18/dist/lenis.min.js";
    script.onload = () => {
        const lenis = new Lenis({
            duration: 1.4,
            lerp: 0.07,
            smoothWheel: true,
            smoothTouch: true, // Плавность на мобилках включена
            touchMultiplier: 1.5
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Перехват кликов меню для плавной прокрутки
        document.querySelectorAll('.contents-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                const target = document.querySelector(`.journal-page[data-page="${page}"]`);
                if (target) lenis.scrollTo(target);
            });
        });
    };
    document.head.appendChild(script);
})();