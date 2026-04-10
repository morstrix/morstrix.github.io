// journal.js — логика журнала
document.addEventListener('DOMContentLoaded', () => {
    // 1. RSS тикер
    const ticker = document.getElementById('rssTicker');
    if (ticker) ticker.innerText = ["✦ MORSTRIX V2.0 ✦","✦ NEW PRINTS ✦","✦ TELEGRAM ✦"].join(" --- ");

    // 2. Карусель главная
    const carousel = document.getElementById('mainCarousel');
    if (carousel) {
        const imgs = carousel.querySelectorAll('img');
        let idx = 0;
        carousel.onclick = () => { imgs[idx].classList.remove('active'); idx = (idx+1) % imgs.length; imgs[idx].classList.add('active'); };
    }

    // 3. Стилизатор (копирование по клику на превью)
    const fontInput = document.getElementById('fontInput');
    const stylerPreview = document.getElementById('stylerPreview');
    if (fontInput && stylerPreview) {
        fontInput.addEventListener('input', () => {
            const val = fontInput.value.trim();
            stylerPreview.textContent = val ? val.toUpperCase().split('').join(' ') : 'EXAMPLE';
        });
        stylerPreview.addEventListener('click', () => {
            navigator.clipboard.writeText(stylerPreview.textContent);
            const original = stylerPreview.textContent;
            stylerPreview.textContent = 'COPIED!';
            setTimeout(() => stylerPreview.textContent = original, 800);
        });
    }

    // 4. Карусель MX и скачивание
    let curSlide = 0;
    const slides = document.querySelectorAll('.download-slide');
    const prevBtn = document.getElementById('downloadCarouselPrev');
    const nextBtn = document.getElementById('downloadCarouselNext');
    const descEl = document.getElementById('downloadDescription');
    const descs = ['✦ MX PRINT 01 ✦<br>Абстрактная композиция<br>3508x2480', '✦ MX PRINT 02 ✦<br>Глитч-эффект<br>3840x2160', '✦ MX PRINT 03 ✦<br>Пиксель-арт<br>1920x1080'];
    function updateSlide() {
        slides.forEach((s,i) => s.classList.toggle('active', i===curSlide));
        if(descEl) descEl.innerHTML = descs[curSlide] + '<br><br>MORSTRIX ARCHIVE<br>• 3 files • 15 MB •';
    }
    if(prevBtn) prevBtn.onclick = () => { curSlide = (curSlide-1+slides.length)%slides.length; updateSlide(); };
    if(nextBtn) nextBtn.onclick = () => { curSlide = (curSlide+1)%slides.length; updateSlide(); };
    const downloadBtn = document.getElementById('downloadArchiveBtn');
    if(downloadBtn) downloadBtn.onclick = () => {
        const a = document.createElement('a'); a.href='assets/morstrix_archive.zip'; a.download='MORSTRIX_archive.zip'; a.click();
        const span = downloadBtn.querySelector('.button span'); const orig = span.innerText; span.innerText='✓ DOWNLOADING...'; setTimeout(()=>span.innerText=orig,2000);
    };

    // 5. Firebase — загрузка основного топа (4 игрока)
    async function loadTopPlayers(){
        const container = document.querySelector('.top-players-list'); if(!container) return;
        try{
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
            const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
            const firebaseConfig = { apiKey:"AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU", authDomain:"helper-e10b2.firebaseapp.com", projectId:"helper-e10b2", storageBucket:"helper-e10b2.firebasestorage.app", messagingSenderId:"131536876451", appId:"1:131536876451:web:eeaef494c83dfc4849e016" };
            const app = initializeApp(firebaseConfig); const db = getFirestore(app);
            const q = query(collection(db,"top_players"), orderBy("score","desc"), limit(4));
            const snap = await getDocs(q);
            if(snap.empty){ container.innerHTML='<div style="color:#888;">✦ NO SCORES ✦</div>'; return; }
            let html='', rank=1;
            snap.forEach(d=>{ const data=d.data(); html+=`<div style="display:flex;justify-content:space-between;gap:15px;margin-bottom:8px;"><span style="color:#a84d6b;">${rank}.</span><span style="color:#fff;">${(data.name||'ANON').slice(0,10)}</span><span style="color:#ffb7c7;">${data.score}</span></div>`; rank++; });
            container.innerHTML=html;
        }catch(e){ container.innerHTML='<div style="color:#a84d6b;">⚠️ ERROR</div>'; }
    }

    // 6. Firebase — загрузка мини-топа для верхней панели (3 игрока)
    async function loadMiniTopPlayers() {
        const container = document.querySelector('.top-players-list-mini');
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
            const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(3));
            const snap = await getDocs(q);
            if (snap.empty) {
                container.innerHTML = '✦';
                return;
            }
            let names = [];
            snap.forEach(doc => {
                const data = doc.data();
                names.push((data.name || 'ANON').slice(0, 6));
            });
            container.innerHTML = names.join(' · ');
        } catch(e) {
            container.innerHTML = '⚠️';
        }
    }

    // Вызов загрузки топов
    if (document.querySelector('.top-players-list')) loadTopPlayers();
    if (document.querySelector('.top-players-list-mini')) loadMiniTopPlayers();

    // 7. Форум переключение вкладок
    const tabs = document.querySelectorAll('.forum-tab');
    const titleEl = document.getElementById('forumContentTitle');
    const textEl = document.getElementById('forumContentText');
    const contents = {
        wellness:{title:'🌿 ВЕЛНЕС',text:'Йога, медитации...'},
        interior:{title:'🛋️ ИНТЕРЬЕР',text:'Дизайн интерьеров...'},
        radio:{title:'📻 РАДИО',text:'Музыка, подкасты...'},
        itai:{title:'🤖 IT / AI',text:'Нейросети, программирование...'},
        english:{title:'📖 ENGLISH',text:'Изучение английского...'},
        design:{title:'🎨 DESIGN',text:'Графический дизайн...'},
        tattoo:{title:'💉 TATTOO',text:'Тату-культура...'},
        money:{title:'💰 MONEY',text:'Финансовая грамотность...'},
        barbering:{title:'✂️ BARBER',text:'Барберинг, стрижки...'}
    };
    tabs.forEach(t=> t.addEventListener('click', ()=>{
        tabs.forEach(tab=>tab.classList.remove('active')); t.classList.add('active');
        const id = t.dataset.tab; if(contents[id]){ titleEl.innerHTML=contents[id].title; textEl.innerHTML=contents[id].text; }
    }));

    // 8. Модалки
    function openModal(id){ const m=document.getElementById(id); if(m){ if(m.classList.contains('inner-modal')) m.style.zIndex='21000'; m.classList.add('active'); } }
    function closeModal(id){ const m=document.getElementById(id); if(m) m.classList.remove('active'); }
    document.querySelectorAll('.modal-overlay').forEach(o=> o.addEventListener('click', e=>{ if(e.target===o) o.classList.remove('active'); }));
    document.querySelectorAll('.modal-close-btn').forEach(b=> b.addEventListener('click', ()=>{
        const id=b.dataset.modal; if(id) closeModal(id);
    }));

    // Кнопки ENTER
    document.querySelectorAll('.box-button').forEach(b=> b.addEventListener('click', function(e){
        if(this.id==='downloadArchiveBtn') return;
        const href=this.dataset.href; const modalId=this.dataset.modal;
        if(href) setTimeout(()=>{ if(href.startsWith('http')) window.open(href,'_blank'); else location.href=href; },100);
        else if(modalId) setTimeout(()=>closeModal(modalId),100);
    }));

    // Привязка кнопок
    document.getElementById('twitterBtn')?.addEventListener('click',()=>openModal('disclaimerModal'));
    document.getElementById('forumBtn')?.addEventListener('click',()=>openModal('openMiniModal'));
    document.getElementById('supportBtn')?.addEventListener('click',()=>openModal('supportModal'));
    document.getElementById('radioBtn')?.addEventListener('click',()=>openModal('radioModal'));
    document.getElementById('paintBtn')?.addEventListener('click',()=>openModal('artModal'));
    document.getElementById('stylerModalBtn')?.addEventListener('click',()=>openModal('stylerModal'));
    document.getElementById('downloadModalBtn')?.addEventListener('click',()=>openModal('downloadModal'));
    document.getElementById('moodBtn')?.addEventListener('click',()=>openModal('pinterestModal'));

    // Обработчики для карточек Designer/Developer
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const member = card.dataset.member;
            if (member === 'ada') openModal('adaModal');
            else if (member === 'ex') openModal('exModal');
        });
    });

    // Обработчики внутренних модалок (закрытие по фону)
    document.querySelectorAll('.inner-modal').forEach(m => {
        m.addEventListener('click', (e) => {
            if (e.target === m) {
                e.stopPropagation();
                m.classList.remove('active');
            }
        });
    });

    // ESC
    document.addEventListener('keydown', e=>{ if(e.key==='Escape'){
        const inner=document.querySelector('.inner-modal.active');
        if(inner) inner.classList.remove('active');
        else document.querySelectorAll('.modal-overlay.active').forEach(m=>m.classList.remove('active'));
    }});

    // Pinterest SDK
    if(document.getElementById('pinterestModal') && !window.pinSDKLoaded){
        const s=document.createElement('script'); s.src='//assets.pinterest.com/js/pinit.js'; s.onload=()=>window.pinSDKLoaded=true; document.head.appendChild(s);
    }
});