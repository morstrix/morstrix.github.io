// ==================== JOURNAL.JS ====================

// КАРУСЕЛЬ
const slides = document.querySelectorAll('#mainCarousel img');
let currentSlide = 0;
setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}, 3500);

// МОДАЛКИ
function openModal(id) {
    document.getElementById(id).classList.add('active');
    if(id === 'artModal' && !paintInit) {
        setTimeout(startPaintLogic, 100);
        paintInit = true;
    }
}

function closeModal(e) { 
    if (e.target.classList.contains('modal-overlay')) 
        e.target.classList.remove('active'); 
}

function closeModalDirect(id) { 
    document.getElementById(id).classList.remove('active'); 
}

// FONT STYLER
const smallCapsMap = {
    'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
};
let isTransformed = false;

function handleAction() {
    const input = document.getElementById('fontInput');
    if (!input.value) { input.focus(); return; }
    if (!isTransformed) {
        input.value = input.value.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
        isTransformed = true;
        document.getElementById('stylerIcon2').style.filter = "brightness(0) invert(1) sepia(1) hue-rotate(300deg)";
    } else {
        input.value = "";
        isTransformed = false;
        document.getElementById('stylerIcon2').style.filter = "brightness(0) invert(1)";
    }
}

function copyStylerText() {
    const input = document.getElementById('fontInput');
    if (input.value && input.value !== "COPIED!") {
        navigator.clipboard.writeText(input.value);
        const val = input.value;
        input.value = "COPIED!";
        setTimeout(() => { input.value = val; }, 1000);
    }
}

// RSS ТИКЕР
const ticker = document.getElementById('rssTicker');
const items = ["HYPERALLERGIC", "ARTNEWS", "RHIZOME", "ARTFORUM", "E-FLUX"];
ticker.innerHTML = `<span>✦ ${items.join('</span><span>✦ ')}</span>`.repeat(6);

// PAINT ENGINE
let paintInit = false;

function startPaintLogic() {
    const l1 = document.getElementById('layer1');
    const l2 = document.getElementById('layer2');
    const ctx1 = l1.getContext('2d', { willReadFrequently: true });
    const ctx2 = l2.getContext('2d', { willReadFrequently: true });
    const area = document.getElementById('paintArea');

    l1.width = l2.width = area.offsetWidth;
    l1.height = l2.height = area.offsetHeight;

    ctx1.fillStyle = "#000";
    ctx1.fillRect(0, 0, l1.width, l1.height);
    [ctx1, ctx2].forEach(c => { 
        c.lineCap = 'round'; 
        c.lineWidth = 4; 
    });

    let currentCtx = ctx2;
    let isDrawing = false;
    let undoStack = [];

    const save = () => {
        undoStack.push({l1: l1.toDataURL(), l2: l2.toDataURL()});
        if(undoStack.length > 15) undoStack.shift();
        document.getElementById('pUndo').disabled = undoStack.length <= 1;
    };

    const getCoords = (e) => {
        const r = l2.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: cx - r.left, y: cy - r.top };
    };

    const draw = (e) => {
        if(!isDrawing) return;
        const p = getCoords(e);
        currentCtx.strokeStyle = document.getElementById('pColor').value;
        currentCtx.lineTo(p.x, p.y);
        currentCtx.stroke();
    };

    l2.addEventListener('mousedown', (e) => { 
        isDrawing = true; 
        currentCtx.beginPath(); 
        const p = getCoords(e); 
        currentCtx.moveTo(p.x, p.y); 
    });
    
    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', () => { 
        if(isDrawing) { 
            isDrawing = false; 
            save(); 
        } 
    });
    
    l2.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        isDrawing = true; 
        currentCtx.beginPath(); 
        const p = getCoords(e); 
        currentCtx.moveTo(p.x, p.y); 
    });
    
    l2.addEventListener('touchmove', (e) => { 
        e.preventDefault(); 
        draw(e); 
    });
    
    l2.addEventListener('touchend', () => { 
        if(isDrawing) { 
            isDrawing = false; 
            save(); 
        } 
    });

    document.getElementById('pClear').onclick = () => {
        ctx2.clearRect(0, 0, l2.width, l2.height);
        ctx1.fillStyle = "#000";
        ctx1.fillRect(0, 0, l1.width, l1.height);
        save();
    };

    document.getElementById('btnLayersOpen').onclick = () => 
        document.getElementById('layersPopup').classList.add('active');
    
    document.querySelectorAll('.layer-row').forEach(row => {
        row.onclick = () => {
            document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            currentCtx = (row.dataset.id === "1") ? ctx1 : ctx2;
            document.getElementById('layersPopup').classList.remove('active');
        };
    });
    save();
}

// ПИНТЕРЕСТ
window.onload = () => { 
    if(window.PinUtils) window.PinUtils.build(); 
};

// ОТКРЫТИЕ РАДИО
document.getElementById('radioBtn').onclick = () => openModal('radioModal');
