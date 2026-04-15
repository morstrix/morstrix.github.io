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

function convertTextToFont(t){
    return [...t].map(c => FONT_MAP[c] || FONT_MAP[c.toUpperCase()] || c).join('');
}

// ===================== STATE =====================
const state = {
    archive: JSON.parse(localStorage.getItem('morstrix_archive') || '[]'),
    pinterest: {
        active: false,
        category: 'all'
    }
};

// ===================== LENIS =====================
function initLenis(){
    const wrapper = document.querySelector('.journal-wrapper');
    const content = document.getElementById('journalHorizontal');

    if (!wrapper || !content || typeof Lenis === 'undefined') return null;

    const lenis = new Lenis({
        wrapper,
        content,
        orientation: 'horizontal',
        gestureOrientation: 'horizontal',
        smoothWheel: true,
        smoothTouch: true,
        lerp: 0.08
    });

    function raf(t){
        lenis.raf(t);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.scrollToPage = (i) => {
        lenis.scrollTo(i * wrapper.clientWidth);
    };

    return lenis;
}

// ===================== MODALS =====================
function openModal(id){
    document.getElementById(id)?.classList.add('active');
}
function closeModal(id){
    document.getElementById(id)?.classList.remove('active');
}

// ===================== ARCHIVE (REAL) =====================
function renderArchive(){
    const container = document.createElement('div');
    container.style.cssText = `
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:10px;
        padding:10px;
    `;

    if(state.archive.length === 0){
        container.innerHTML = `<div style="color:#fff;font-size:10px;">EMPTY ARCHIVE</div>`;
        return container;
    }

    state.archive.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.border = '2px solid #a84d6b';
        container.appendChild(img);
    });

    return container;
}

function openArchive(){
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '500px';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<span class="modal-title-text">ARCHIVE</span>`;

    const close = document.createElement('button');
    close.className = 'modal-close-btn';
    close.textContent = '✜';
    close.onclick = () => modal.remove();

    header.appendChild(close);

    const inner = document.createElement('div');
    inner.className = 'modal-inner';
    inner.appendChild(renderArchive());

    content.appendChild(header);
    content.appendChild(inner);
    modal.appendChild(content);

    document.body.appendChild(modal);
}

// ===================== PINTEREST (REAL FILTER) =====================
function openPinterest(cat){
    const images = [
        'assets/mx1.jpg',
        'assets/mx2.jpg',
        'assets/f1.jpg'
    ];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<span class="modal-title-text">PINTEREST: ${cat}</span>`;

    const close = document.createElement('button');
    close.className = 'modal-close-btn';
    close.textContent = '✜';
    close.onclick = () => modal.remove();

    header.appendChild(close);

    const inner = document.createElement('div');
    inner.className = 'modal-inner';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2,1fr)';
    grid.style.gap = '10px';

    images.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.border = '2px solid #b97272';
        grid.appendChild(img);
    });

    inner.appendChild(grid);
    content.appendChild(header);
    content.appendChild(inner);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// ===================== TTS =====================
let voices = [];

function loadVoices(){
    voices = speechSynthesis.getVoices();
    const sel = document.getElementById('ttsVoiceSelect');
    if(!sel) return;

    sel.innerHTML = '';
    voices.forEach(v=>{
        const o = document.createElement('option');
        o.value = v.name;
        o.textContent = v.name;
        sel.appendChild(o);
    });
}

function speak(text){
    if(!text.trim()) return;

    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);

    const sel = document.getElementById('ttsVoiceSelect');
    const v = voices.find(x => x.name === sel?.value);
    if(v) u.voice = v;

    speechSynthesis.speak(u);
}

// ===================== CAROUSEL =====================
function initCarousel(){
    const c = document.getElementById('mainCarousel');
    if(!c) return;

    const imgs = [...c.querySelectorAll('img')];
    let i = 0;

    setInterval(()=>{
        imgs[i].classList.remove('active');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('active');
    }, 3000);
}

// ===================== TOP PLAYERS =====================
async function loadTop(){
    const el = document.querySelector('.top-players-list');
    if(!el) return;

    try{
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
        const { getFirestore, collection, query, orderBy, limit, getDocs } =
        await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');

        const app = initializeApp({
            apiKey:"AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
            authDomain:"helper-e10b2.firebaseapp.com",
            projectId:"helper-e10b2"
        });

        const db = getFirestore(app);
        const q = query(collection(db,'top_players'),orderBy('score','desc'),limit(10));
        const snap = await getDocs(q);

        el.innerHTML = '';
        let i = 1;

        snap.forEach(d=>{
            const x = d.data();
            el.innerHTML += `<div style="display:flex;justify-content:space-between;">
            <span>${i++}. ${x.name}</span><span>${x.score}</span></div>`;
        });

    }catch(e){
        el.innerHTML = 'NO DATA';
    }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', ()=>{

    initLenis();
    initCarousel();
    loadVoices();
    loadTop();

    // archive button
    document.getElementById('archiveBtn')?.addEventListener('click', openArchive);

    // pinterest
    document.getElementById('pinterestPanel')?.addEventListener('click', ()=>openPinterest('all'));

    // tts
    document.getElementById('ttsSpeakBtn')?.addEventListener('click', ()=>{
        const t = document.getElementById('ttsTextInput')?.value || '';
        speak(t);
    });

    // font styler
    const input = document.getElementById('fontInputEmbedded');
    const preview = document.getElementById('stylerPreviewEmbedded');

    if(input && preview){
        input.addEventListener('input', ()=>{
            preview.textContent = convertTextToFont(input.value);
        });
    }

    // contents navigation
    document.querySelectorAll('.contents-item').forEach(el=>{
        el.addEventListener('click', ()=>{
            const page = +el.dataset.page;
            window.scrollToPage?.(page-1);
            closeModal('contentsModal');
        });
    });

    // modal close
    document.addEventListener('click',(e)=>{
        if(e.target.classList.contains('modal-overlay')){
            e.target.remove();
        }
    });

});
