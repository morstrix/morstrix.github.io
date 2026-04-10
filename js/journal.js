// journal.js — логика журнала
document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. БЕГУЩАЯ СТРОКА (RSS) ==========
    const ticker = document.getElementById('rssTicker');
    if (ticker) {
        const messages = [
            "✦ MORSTRIX V2.0 СИСТЕМА ЗАПУЩЕНА ✦",
            "✦ НОВЫЕ ПРИНТЫ В МАГАЗИНЕ ✦",
            "✦ ПОДПИСЫВАЙТЕСЬ НА НАШ ТЕЛЕГРАМ ✦"
        ];
        ticker.innerText = messages.join(" --- ");
    }

    // ========== 2. КАРУСЕЛЬ КАРТИНОК ==========
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

    // ========== 3. СТИЛИЗАТОР ТЕКСТА (В МОДАЛКЕ) ==========
    const fontInput = document.getElementById('fontInput');
    const transformBtn = document.getElementById('transformBtn');
    const copyBtn = document.getElementById('copyBtn');

    if (transformBtn && fontInput) {
        transformBtn.onclick = () => {
            let val = fontInput.value;
            fontInput.value = val.toUpperCase().split('').join(' ');
        };
    }

    if (copyBtn && fontInput) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(fontInput.value);
            const img = copyBtn.querySelector('img');
            if (img) {
                const originalSrc = img.src;
                img.src = 'assets/check.png'; // замените на свою иконку галочки или просто скройте
                setTimeout(() => {
                    img.src = originalSrc;
                }, 1000);
            }
        };
    }

    // ========== 4. КАРУСЕЛЬ В МОДАЛКЕ СКАЧИВАНИЯ ==========
    let currentDownloadSlide = 0;
    const downloadSlides = document.querySelectorAll('.download-slide');
    const downloadPrev = document.getElementById('downloadCarouselPrev');
    const downloadNext = document.getElementById('downloadCarouselNext');
    const downloadDesc = document.getElementById('downloadDescription');

    const slideDescriptions = [
        '✦ MX PRINT 01 ✦<br>Абстрактная композиция<br>3508 x 2480 px',
        '✦ MX PRINT 02 ✦<br>Глитч-эффект<br>3840 x 2160 px',
        '✦ MX PRINT 03 ✦<br>Пиксель-арт<br>1920 x 1080 px'
    ];

    function updateDownloadSlide() {
        downloadSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentDownloadSlide);
        });
        if (downloadDesc) {
            downloadDesc.innerHTML = slideDescriptions[currentDownloadSlide] + 
                '<br><br>MORSTRIX DIGITAL ARCHIVE<br>• 3 файла • 15 MB •';
        }
    }

    if (downloadPrev) {
        downloadPrev.onclick = () => {
            currentDownloadSlide = (currentDownloadSlide - 1 + downloadSlides.length) % downloadSlides.length;
            updateDownloadSlide();
        };
    }

    if (downloadNext) {
        downloadNext.onclick = () => {
            currentDownloadSlide = (currentDownloadSlide + 1) % downloadSlides.length;
            updateDownloadSlide();
        };
    }

    // Кнопка скачивания архива
    const downloadArchiveBtn = document.getElementById('downloadArchiveBtn');
    if (downloadArchiveBtn) {
        downloadArchiveBtn.onclick = () => {
            // Создаём ссылку на архив
            const link = document.createElement('a');
            link.href = 'assets/morstrix_archive.zip';
            link.download = 'MORSTRIX_archive.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Визуальный фидбек
            const span = downloadArchiveBtn.querySelector('.button span');
            if (span) {
                const originalText = span.innerText;
                span.innerText = '✓ DOWNLOADING...';
                setTimeout(() => {
                    span.innerText = originalText;
                }, 2000);
            }
        };
    }

    // ========== 5. ЗАГРУЗКА ТОПА ИГРОКОВ ==========
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
                container.innerHTML = '<div style="color:#888; text-align:center;">✦ NO SCORES YET ✦</div>';
                return;
            }
            
            let html = '';
            let rank = 1;
            snapshot.forEach(doc => {
                const data = doc.data();
                html += `<div style="display:flex; justify-content:space-between; gap:15px; margin-bottom:8px;">
                            <span style="color:#a84d6b;">${rank}.</span>
                            <span style="color:#fff;">${(data.name || 'ANON').slice(0,10)}</span>
                            <span style="color:#ffb7c7;">${data.score}</span>
                         </div>`;
                rank++;
            });
            container.innerHTML = html;
        } catch(e) {
            console.error('Top players error:', e);
            container.innerHTML = '<div style="color:#a84d6b; text-align:center;">⚠️ ERROR</div>';
        }
    }

    if (document.querySelector('.top-players-list')) {
        loadTopPlayers();
    }

    // ========== 6. МОДАЛКИ ==========
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }
    
    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }

    // ========== 7. ЗАКРЫТИЕ ПО ФОНУ ==========
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    // ========== 8. ЗАКРЫТИЕ ПО КРЕСТИКУ ==========
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            if (modalId) closeModal(modalId);
        });
    });

    // ========== 9. КНОПКИ .box-button (UIVERSE) ==========
    document.querySelectorAll('.box-button').forEach(box => {
        box.addEventListener('click', function(e) {
            // Пропускаем специальные кнопки
            if (this.id === 'downloadArchiveBtn' || 
                this.id === 'stylerModalBtn' || 
                this.id === 'downloadModalBtn' ||
                this.closest('#stylerModal') ||
                this.closest('#downloadModal')) {
                return;
            }
            
            const href = this.getAttribute('data-href');
            const modalId = this.getAttribute('data-modal');
            
            if (href) {
                setTimeout(() => {
                    if (href.startsWith('http')) {
                        window.open(href, '_blank');
                    } else {
                        window.location.href = href;
                    }
                }, 100);
            } else if (modalId) {
                setTimeout(() => {
                    closeModal(modalId);
                }, 100);
            }
        });
    });

    // ========== 10. ПРИВЯЗКА КНОПОК ОТКРЫТИЯ МОДАЛОК ==========
    const twitterBtn = document.getElementById('twitterBtn');
    if (twitterBtn) twitterBtn.onclick = () => openModal('disclaimerModal');

    const forumBtn = document.getElementById('forumBtn');
    if (forumBtn) forumBtn.onclick = () => openModal('openMiniModal');

    const supportBtn = document.getElementById('supportBtn');
    if (supportBtn) supportBtn.onclick = () => openModal('supportModal');

    const radioBtn = document.getElementById('radioBtn');
    if (radioBtn) radioBtn.onclick = () => openModal('radioModal');

    const moodBtn = document.getElementById('moodBtn');
    if (moodBtn) moodBtn.onclick = () => openModal('pinterestModal');

    const paintBtn = document.getElementById('paintBtn');
    if (paintBtn) paintBtn.onclick = () => openModal('artModal');

    const teamBtn = document.getElementById('teamBtnJournal');
    if (teamBtn) teamBtn.onclick = () => openModal('teamModalJournal');

    const stylerModalBtn = document.getElementById('stylerModalBtn');
    if (stylerModalBtn) stylerModalBtn.onclick = () => openModal('stylerModal');

    const downloadModalBtn = document.getElementById('downloadModalBtn');
    if (downloadModalBtn) downloadModalBtn.onclick = () => openModal('downloadModal');

    // ========== 11. ESC ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // ========== 12. PINTEREST SDK ==========
    if (document.getElementById('pinterestModal') && !window.pinSDKLoaded) {
        const pinScript = document.createElement('script');
        pinScript.src = '//assets.pinterest.com/js/pinit.js';
        pinScript.async = true;
        pinScript.onload = () => { window.pinSDKLoaded = true; };
        document.head.appendChild(pinScript);
    }
});