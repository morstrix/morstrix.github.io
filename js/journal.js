document.addEventListener('DOMContentLoaded', () => {
    // 1. RSS тикер
    const ticker = document.getElementById('rssTicker');
    if (ticker) {
        ticker.innerText = [
            "✦ MORSTRIX V2.0 СИСТЕМА ЗАПУЩЕНА ✦",
            "✦ НОВЫЕ ПРИНТЫ В МАГАЗИНЕ ✦",
            "✦ ПОДПИСЫВАЙТЕСЬ НА НАШ ТЕЛЕГРАМ ✦"
        ].join(" --- ");
    }

    // 2. Карусель главная
    const carousel = document.getElementById('mainCarousel');
    if (carousel) {
        const imgs = carousel.querySelectorAll('img');
        let idx = 0;
        carousel.onclick = () => {
            imgs[idx].classList.remove('active');
            idx = (idx + 1) % imgs.length;
            imgs[idx].classList.add('active');
        };
    }

    // 3. Стилизатор (в модалке)
    const fontInput = document.getElementById('fontInput');
    const transformBtn = document.getElementById('transformBtn');
    const copyBtn = document.getElementById('copyBtn');
    const stylerPreview = document.getElementById('stylerPreview');

    if (fontInput) {
        fontInput.addEventListener('input', () => {
            if (stylerPreview) {
                stylerPreview.textContent = fontInput.value.toUpperCase().split('').join(' ') || 'EXAMPLE';
            }
        });
    }

    if (transformBtn && fontInput) {
        transformBtn.onclick = () => {
            fontInput.value = fontInput.value.toUpperCase().split('').join(' ');
            fontInput.dispatchEvent(new Event('input'));
        };
    }

    if (copyBtn && fontInput) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(fontInput.value);
            const img = copyBtn.querySelector('img');
            if (img) {
                const originalSrc = img.src;
                img.src = 'assets/check.png';
                setTimeout(() => img.src = originalSrc, 1000);
            }
        };
    }

    // 4. Карусель в модалке скачивания
    let currentSlide = 0;
    const slides = document.querySelectorAll('.download-slide');
    const prevBtn = document.getElementById('downloadCarouselPrev');
    const nextBtn = document.getElementById('downloadCarouselNext');
    const descEl = document.getElementById('downloadDescription');
    const descriptions = [
        '✦ MX PRINT 01 ✦<br>Абстрактная композиция<br>3508 x 2480 px',
        '✦ MX PRINT 02 ✦<br>Глитч-эффект<br>3840 x 2160 px',
        '✦ MX PRINT 03 ✦<br>Пиксель-арт<br>1920 x 1080 px'
    ];

    function updateSlide() {
        slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
        if (descEl) {
            descEl.innerHTML = descriptions[currentSlide] + 
                '<br><br>MORSTRIX DIGITAL ARCHIVE<br>• 3 файла • 15 MB •';
        }
    }

    if (prevBtn) prevBtn.onclick = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlide();
    };
    if (nextBtn) nextBtn.onclick = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlide();
    };

    // Кнопка скачивания
    const downloadBtn = document.getElementById('downloadArchiveBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = 'assets/morstrix_archive.zip';
            link.download = 'MORSTRIX_archive.zip';
            link.click();
            const span = downloadBtn.querySelector('.button span');
            if (span) {
                const orig = span.innerText;
                span.innerText = '✓ DOWNLOADING...';
                setTimeout(() => span.innerText = orig, 2000);
            }
        };
    }

    // 5. Топ игроков Firebase
    async function loadTopPlayers() {
        const container = document.querySelector('.top-players-list');
        if (!container) return;
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
            const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
            const firebaseConfig = {
                apiKey: "AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
                authDomain: "helper-e10b2.firebaseapp.com",
                projectId: "helper-e10b2",
                storageBucket: "helper-e10b2.firebasestorage.app",
                messagingSenderId: "131536876451",
                appId: "1:131536876451:web:eeaef494c83dfc4849e016"
            };
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(4));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                container.innerHTML = '<div style="color:#888;">✦ NO SCORES ✦</div>';
                return;
            }
            let html = '', rank = 1;
            snapshot.forEach(doc => {
                const d = doc.data();
                html += `<div style="display:flex;justify-content:space-between;gap:15px;margin-bottom:8px;">
                    <span style="color:#a84d6b;">${rank}.</span>
                    <span style="color:#fff;">${(d.name||'ANON').slice(0,10)}</span>
                    <span style="color:#ffb7c7;">${d.score}</span>
                </div>`;
                rank++;
            });
            container.innerHTML = html;
        } catch(e) {
            container.innerHTML = '<div style="color:#a84d6b;">⚠️ ERROR</div>';
        }
    }
    if (document.querySelector('.top-players-list')) loadTopPlayers();

    // 6. Модалки
    function openModal(id) {
        document.getElementById(id)?.classList.add('active');
    }
    function closeModal(id) {
        document.getElementById(id)?.classList.remove('active');
    }

    document.querySelectorAll('.modal-overlay').forEach(o => {
        o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
    });
    document.querySelectorAll('.modal-close-btn').forEach(b => {
        b.addEventListener('click', () => {
            const id = b.getAttribute('data-modal');
            if (id) closeModal(id);
        });
    });

    // Кнопки ENTER (box-button)
    document.querySelectorAll('.box-button').forEach(box => {
        box.addEventListener('click', function(e) {
            if (this.id === 'downloadArchiveBtn') return;
            const href = this.getAttribute('data-href');
            const modalId = this.getAttribute('data-modal');
            if (href) {
                setTimeout(() => {
                    if (href.startsWith('http')) window.open(href, '_blank');
                    else window.location.href = href;
                }, 100);
            } else if (modalId) {
                setTimeout(() => closeModal(modalId), 100);
            }
        });
    });

    // Привязка кнопок
    document.getElementById('twitterBtn')?.addEventListener('click', () => openModal('disclaimerModal'));
    document.getElementById('forumBtn')?.addEventListener('click', () => openModal('openMiniModal'));
    document.getElementById('supportBtn')?.addEventListener('click', () => openModal('supportModal'));
    document.getElementById('radioBtn')?.addEventListener('click', () => openModal('radioModal'));
    document.getElementById('moodBtn')?.addEventListener('click', () => openModal('pinterestModal'));
    document.getElementById('paintBtn')?.addEventListener('click', () => openModal('artModal'));
    document.getElementById('teamBtnJournal')?.addEventListener('click', () => openModal('teamModalJournal'));
    document.getElementById('stylerModalBtn')?.addEventListener('click', () => openModal('stylerModal'));
    document.getElementById('downloadModalBtn')?.addEventListener('click', () => openModal('downloadModal'));

    // ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // Pinterest SDK
    if (document.getElementById('pinterestModal') && !window.pinSDKLoaded) {
        const s = document.createElement('script');
        s.src = '//assets.pinterest.com/js/pinit.js';
        s.onload = () => window.pinSDKLoaded = true;
        document.head.appendChild(s);
    }
});