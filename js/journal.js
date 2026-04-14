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
            }).catch(err => console.warn('Clipboard error:', err));
        });

        // ===== АНИМАЦИЯ ПЕЧАТИ + СТИРАНИЕ + КУРСОР =====
        const placeholderText = 'TYPE TEXT';
        let typingTimer = null;
        let isTyping = true;
        let charIndex = 0;

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
                isTyping = true;
                charIndex = 0;
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
        embeddedInput.addEventListener('blur', () => {
            if (embeddedInput.value === '') startAnimation();
        });

        const page2 = document.querySelector('.journal-page[data-page="2"]');
        if (page2) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startAnimation();
                    } else {
                        stopAnimation();
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(page2);
        } else {
            startAnimation();
        }
    }

    // ===== СКАЧИВАНИЕ АРХИВА =====
    document.getElementById('downloadArchiveBtnEmbedded')?.addEventListener('click', ()=> {
        const a = document.createElement('a');
        a.href = 'assets/morstrix_archive.zip';
        a.download = 'MORSTRIX_FONT.zip';
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
        canvas.width = 80; canvas.height = 80;
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

    // ===== PINTEREST: загрузка при активации 4-й страницы =====
    const page4 = document.querySelector('.journal-page[data-page="4"]');
    if (page4) {
        const pinterestObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (window.PinUtils) {
                        window.PinUtils.build();
                    } else {
                        const script = document.createElement('script');
                        script.src = 'https://assets.pinterest.com/js/pinit.js';
                        script.onload = () => window.PinUtils?.build();
                        document.head.appendChild(script);
                    }
                }
            });
        }, { threshold: 0.1 });
        pinterestObserver.observe(page4);
    }

    // ===== ESCAPE =====
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.modal-overlay.active').forEach(m=>m.classList.remove('active')); });
});

// ===== TEXT SYNTH (встроенный SpeechSynthesis) =====
const ttsSpeakBtn = document.getElementById('ttsSpeakBtn');
const ttsTextInput = document.getElementById('ttsTextInput');
const ttsVoiceSelect = document.getElementById('ttsVoiceSelect');
const ttsStatus = document.getElementById('ttsStatus');

let voices = [];

function setTtsStatus(message) {
    if (ttsStatus) ttsStatus.textContent = message;
}

// Загружаем список голосов и заполняем <select>
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
        // Попытаемся выбрать украинский или русский по умолчанию
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
    if (!text || text.trim() === '') {
        setTtsStatus('Введите текст');
        return;
    }
    
    // Останавливаем текущее воспроизведение, если есть
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceName = ttsVoiceSelect?.value;
    if (selectedVoiceName) {
        const voice = voices.find(v => v.name === selectedVoiceName);
        if (voice) utterance.voice = voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setTtsStatus('▶ Воспроизведение');
    utterance.onend = () => setTtsStatus('');
    utterance.onerror = (e) => setTtsStatus('Ошибка: ' + e.error);
    
    speechSynthesis.speak(utterance);
}

if (ttsSpeakBtn) {
    ttsSpeakBtn.addEventListener('click', () => {
        const text = ttsTextInput?.value || '';
        speakWithSpeechSynthesis(text);
    });
}

if (ttsTextInput) {
    ttsTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ttsSpeakBtn?.click();
        }
    });
}