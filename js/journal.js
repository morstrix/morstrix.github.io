// ===== FONT STYLER (SMALL CAPS MAPPING) =====
const FONT_MAP = {
    // Кириллица
    'А': 'ᴀ', 'а': 'ᴀ',
    'В': 'в', 'в': 'ʙ',
    'Е': 'ᴇ', 'е': 'ᴇ',
    'К': 'ᴋ', 'к': 'ᴋ',
    'М': 'ᴍ', 'м': 'ᴍ',
    'О': 'ᴏ', 'о': 'ᴏ',
    'Р': 'ᴘ', 'р': 'ᴘ',
    'С': 'ᴄ', 'с': 'ᴄ',
    'Т': 'т', 'т': 'ᴛ',
    'Н': 'н', 'н': 'н',
    'І': 'і', 'і': 'і',
    'У': 'у', 'у': 'у',
    'Л': 'ʌ', 'л': 'ʌ',
    // Латиница
    'A': 'ᴀ', 'a': 'ᴀ',
    'B': 'ʙ', 'b': 'ʙ',
    'C': 'ᴄ', 'c': 'ᴄ',
    'D': 'ᴅ', 'd': 'ᴅ',
    'E': 'ᴇ', 'e': 'ᴇ',
    'F': 'ꜰ', 'f': 'ꜰ',
    'G': 'ɢ', 'g': 'ɢ',
    'H': 'ʜ', 'h': 'ʜ',
    'I': 'ɪ', 'i': 'ɪ',
    'J': 'ᴊ', 'j': 'ᴊ',
    'K': 'ᴋ', 'k': 'ᴋ',
    'L': 'ʟ', 'l': 'ʟ',
    'M': 'ᴍ', 'm': 'ᴍ',
    'N': 'ɴ', 'n': 'ɴ',
    'O': 'ᴏ', 'o': 'ᴏ',
    'P': 'ᴘ', 'p': 'ᴘ',
    'Q': 'ǫ', 'q': 'ǫ',
    'R': 'ʀ', 'r': 'ʀ',
    'S': 'ꜱ', 's': 'ꜱ',
    'T': 'ᴛ', 't': 'ᴛ',
    'U': 'ᴜ', 'u': 'ᴜ',
    'V': 'ᴠ', 'v': 'ᴠ',
    'W': 'ᴡ', 'w': 'ᴡ',
    'X': 'x', 'x': 'x',
    'Y': 'ʏ', 'y': 'ʏ',
    'Z': 'ᴢ', 'z': 'ᴢ',
};

function convertTextToFont(text) {
    return text.split('').map(char => FONT_MAP[char] || FONT_MAP[char.toUpperCase()] || char).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // ===== ТИКЕР =====
    const ticker = document.getElementById('rssTicker');
    if (ticker) ticker.innerText = ["✦ MORSTRIX V2.0 ✦","✦ NEW PRINTS ✦","✦ TELEGRAM ✦"].join(" --- ");

    // ===== КАРУСЕЛЬ НА ПЕРВОЙ СТРАНИЦЕ =====
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
            });
        });
    }

    // ===== MX КАРУСЕЛЬ (АВТО, БЕЗ СТРЕЛОК) =====
    const mxSlides = document.querySelectorAll('.mx-slide');
    let mxSlideIndex = 0;
    let mxInterval;
    if (mxSlides.length > 0) {
        mxInterval = setInterval(() => {
            mxSlides[mxSlideIndex].classList.remove('active');
            mxSlideIndex = (mxSlideIndex + 1) % mxSlides.length;
            mxSlides[mxSlideIndex].classList.add('active');
        }, 3000);
        // Остановка при клике на карусель (опционально)
        document.querySelector('.mx-carousel')?.addEventListener('click', () => clearInterval(mxInterval));
    }

    // ===== СКАЧИВАНИЕ АРХИВА =====
    document.getElementById('downloadArchiveBtnEmbedded')?.addEventListener('click', ()=> {
        const a = document.createElement('a');
        a.href = 'assets/morstrix_archive.zip';
        a.download = 'MORSTRIX_archive.zip';
        a.click();
    });

    // ===== PAINT =====
    document.getElementById('paintBtn')?.addEventListener('click', ()=> openModal('artModal'));

    // ===== КОНВЕРТЕР PX ↔ CM =====
    const pxInput = document.getElementById('pxInputEmbedded');
    const cmInput = document.getElementById('cmInputEmbedded');
    if(pxInput && cmInput) {
        pxInput.addEventListener('input', ()=> { const px = parseFloat(pxInput.value); cmInput.value = isNaN(px) ? '' : (px / 37.8).toFixed(2); });
        cmInput.addEventListener('input', ()=> { const cm = parseFloat(cmInput.value); pxInput.value = isNaN(cm) ? '' : Math.round(cm * 37.8); });
    }

    // ===== КОНСТРУКТОР MERCH =====
    const canvas = document.getElementById('printCanvasEmbedded');
    const upload = document.getElementById('imageUploadEmbedded');
    if(canvas && upload) {
        const ctx = canvas.getContext('2d');
        canvas.width = 120; canvas.height = 120;
        upload.addEventListener('change', e => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height); };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
        document.getElementById('resetPrintEmbedded').addEventListener('click', ()=> { ctx.clearRect(0,0,canvas.width,canvas.height); upload.value = ''; });
    }

    // ===== ТОП ИГРОКОВ (Firestore) =====
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
            let realCount = 0;
            if(!snap.empty){
                let html=''; let rank=1;
                snap.forEach(d=>{ const data=d.data(); html+=`<div style="display:flex;justify-content:space-between;"><span>${rank}. ${(data.name||'ANON').slice(0,10)}</span><span>${data.score}</span></div>`; rank++; realCount++; });
                container.innerHTML=html;
            } else { container.innerHTML=''; realCount=0; }
            const placeholderDiv = document.querySelector('.top-players-placeholder');
            if(placeholderDiv){
                let emptyHtml = '';
                for(let i=0; i<9-realCount; i++) emptyHtml += `<div>— — — — — — — —</div>`;
                placeholderDiv.innerHTML = emptyHtml;
            }
        }catch(e){ container.innerHTML='⚠️ ERROR'; }
    }
    if(document.querySelector('.top-players-list')) loadTopPlayers();

    // ===== ФОРУМ (вкладки) =====
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

    // ===== ИНДИКАТОР ТОЧЕК =====
    const pages = document.querySelectorAll('.journal-page');
    const dots = document.querySelectorAll('.dot');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                const idx = [...pages].indexOf(entry.target);
                dots.forEach((d,i)=> d.classList.toggle('active', i===idx));
            }
        });
    }, { threshold: 0.5 });
    pages.forEach(p => observer.observe(p));

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
            document.querySelector(`.journal-page[data-page="${page}"]`).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            closeModal('contentsModal');
        });
    });

    // ===== PINTEREST =====
    if(!window.pinSDKLoaded){
        const s=document.createElement('script');
        s.src='//assets.pinterest.com/js/pinit.js';
        s.onload=()=>window.pinSDKLoaded=true;
        document.head.appendChild(s);
    }

    // ===== ESCAPE =====
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.modal-overlay.active').forEach(m=>m.classList.remove('active')); });
});