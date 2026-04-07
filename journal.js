// ==================== JOURNAL.JS ====================

// Карусель картинок
const slides = document.querySelectorAll('#mainCarousel img');
let currentSlide = 0;
setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}, 3500);

// Открытие модалок
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
    if(id === 'artModal' && window.startPaintLogic) {
        setTimeout(() => {
            if (typeof window.startPaintLogic === 'function') {
                window.startPaintLogic();
            }
        }, 150);
    }
}
function closeModal(e) { 
    if (e.target.classList.contains('modal-overlay')) 
        e.target.classList.remove('active'); 
}
function closeModalDirect(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// Радио кнопка
const radioBtn = document.getElementById('radioBtn');
const radioModal = document.getElementById('radioModal');
if (radioBtn && radioModal) {
    radioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        radioModal.classList.add('active');
    });
}

// Font styler
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
        const icon = document.getElementById('stylerIcon2');
        if (icon) icon.style.filter = "brightness(0) invert(1) sepia(1) hue-rotate(300deg)";
    } else {
        input.value = "";
        isTransformed = false;
        const icon = document.getElementById('stylerIcon2');
        if (icon) icon.style.filter = "brightness(0) invert(1)";
    }
}
function copyStylerText() {
    const input = document.getElementById('fontInput');
    if (input && input.value && input.value !== "COPIED!") {
        navigator.clipboard.writeText(input.value);
        const val = input.value;
        input.value = "COPIED!";
        setTimeout(() => { if (input) input.value = val; }, 1000);
    }
}

// RSS тикер
const ticker = document.getElementById('rssTicker');
if (ticker) {
    const items = ["HYPERALLERGIC", "ARTNEWS", "RHIZOME", "ARTFORUM", "E-FLUX"];
    ticker.innerHTML = `<span>✦ ${items.join('</span><span>✦ ')}</span>`.repeat(6);
}

// Динамическое слово на TV-экране
const wordsList = [
    "wellness", "diy gear", "radio", "design", 
    "interior", "print", "travel", "IT/AI", 
    "english", "tattoo", "money", "barbering"
];
const dynamicWordSpan = document.getElementById('dynamicWord');
if (dynamicWordSpan) {
    let wordIndex = 0;
    setInterval(() => {
        wordIndex = (wordIndex + 1) % wordsList.length;
        dynamicWordSpan.style.opacity = '0';
        setTimeout(() => {
            dynamicWordSpan.textContent = wordsList[wordIndex];
            dynamicWordSpan.style.opacity = '1';
        }, 150);
    }, 2000);
}

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(modal => modal.classList.remove('active'));
    }
});

// TEAM кнопка (дублируем, но основной скрипт уже есть в HTML, оставим для надёжности)
const teamBtn = document.getElementById('teamBtnJournal');
const teamModal = document.getElementById('teamModalJournal');
if (teamBtn && teamModal) {
    teamBtn.onclick = (e) => {
        e.stopPropagation();
        teamModal.classList.add('active');
    };
}

// Конвертер PX ↔ CM (дублируется в HTML, но пусть будет)
const pxInput = document.getElementById('pxInput');
const cmInput = document.getElementById('cmInput');
if (pxInput && cmInput) {
    pxInput.addEventListener('input', () => {
        let px = parseFloat(pxInput.value);
        if (!isNaN(px)) cmInput.value = (px / 37.8).toFixed(2);
        else cmInput.value = '';
    });
    cmInput.addEventListener('input', () => {
        let cm = parseFloat(cmInput.value);
        if (!isNaN(cm)) pxInput.value = Math.round(cm * 37.8);
        else pxInput.value = '';
    });
}

// ========== PAINT.EXE ЛОГИКА ==========
function startPaintLogic() {
    const l1 = document.getElementById('layer1');
    const l2 = document.getElementById('layer2');
    if (!l1 || !l2) return;
    if (l1.dataset.paintInitialized === 'true') return;
    l1.dataset.paintInitialized = 'true';
    
    const ctx1 = l1.getContext('2d', { willReadFrequently: true });
    const ctx2 = l2.getContext('2d', { willReadFrequently: true });
    const area = document.getElementById('paintArea');

    const resizeCanvases = () => {
        if (!area) return;
        const width = area.offsetWidth;
        const height = area.offsetHeight;
        if (width === 0 || height === 0) return;
        l1.width = width;
        l1.height = height;
        l2.width = width;
        l2.height = height;
        ctx1.fillStyle = "#000";
        ctx1.fillRect(0, 0, width, height);
        [ctx1, ctx2].forEach(c => { 
            c.lineCap = 'round'; 
            c.lineJoin = 'round';
            c.lineWidth = 4; 
        });
    };
    resizeCanvases();
    let resizeObserver;
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => resizeCanvases());
        if (area) resizeObserver.observe(area);
    }
    window.addEventListener('resize', () => setTimeout(resizeCanvases, 50));

    let currentCtx = ctx2;
    let isDrawing = false;
    let undoStack = [];
    let redoStack = [];

    const saveState = () => {
        undoStack.push({ l1: l1.toDataURL(), l2: l2.toDataURL() });
        if (undoStack.length > 20) undoStack.shift();
        redoStack = [];
        const undoBtn = document.getElementById('pUndo');
        const redoBtn = document.getElementById('pRedo');
        if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
        if (redoBtn) redoBtn.disabled = true;
    };

    const restoreState = (state) => {
        const img1 = new Image();
        const img2 = new Image();
        return new Promise((resolve) => {
            img1.onload = () => {
                ctx1.clearRect(0, 0, l1.width, l1.height);
                ctx1.drawImage(img1, 0, 0);
                img2.onload = () => {
                    ctx2.clearRect(0, 0, l2.width, l2.height);
                    ctx2.drawImage(img2, 0, 0);
                    resolve();
                };
                img2.src = state.l2;
            };
            img1.src = state.l1;
        });
    };

    const getCoords = (e) => {
        const r = l2.getBoundingClientRect();
        let cx, cy;
        if (e.touches) {
            cx = e.touches[0].clientX;
            cy = e.touches[0].clientY;
        } else {
            cx = e.clientX;
            cy = e.clientY;
        }
        const scaleX = l2.width / r.width;
        const scaleY = l2.height / r.height;
        let x = (cx - r.left) * scaleX;
        let y = (cy - r.top) * scaleY;
        x = Math.min(Math.max(x, 0), l2.width);
        y = Math.min(Math.max(y, 0), l2.height);
        return { x, y };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        isDrawing = true;
        const p = getCoords(e);
        currentCtx.beginPath();
        currentCtx.moveTo(p.x, p.y);
    };
    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const p = getCoords(e);
        const colorPicker = document.getElementById('pColor');
        if (colorPicker) currentCtx.strokeStyle = colorPicker.value;
        currentCtx.lineTo(p.x, p.y);
        currentCtx.stroke();
        currentCtx.beginPath();
        currentCtx.moveTo(p.x, p.y);
    };
    const endDrawing = () => {
        if (isDrawing) {
            isDrawing = false;
            saveState();
        }
    };

    l2.addEventListener('mousedown', startDrawing);
    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDrawing);
    l2.addEventListener('touchstart', startDrawing, { passive: false });
    l2.addEventListener('touchmove', draw, { passive: false });
    l2.addEventListener('touchend', endDrawing);
    l2.addEventListener('touchcancel', endDrawing);

    const clearBtn = document.getElementById('pClear');
    if (clearBtn) {
        clearBtn.onclick = () => {
            ctx2.clearRect(0, 0, l2.width, l2.height);
            ctx1.fillStyle = "#000";
            ctx1.fillRect(0, 0, l1.width, l1.height);
            saveState();
        };
    }
    const undoBtn = document.getElementById('pUndo');
    if (undoBtn) {
        undoBtn.onclick = async () => {
            if (undoStack.length > 1) {
                const current = undoStack.pop();
                redoStack.push(current);
                const prev = undoStack[undoStack.length - 1];
                await restoreState(prev);
                const redoBtnEl = document.getElementById('pRedo');
                if (redoBtnEl) redoBtnEl.disabled = false;
                if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
            }
        };
    }
    const redoBtn = document.getElementById('pRedo');
    if (redoBtn) {
        redoBtn.onclick = async () => {
            if (redoStack.length > 0) {
                const next = redoStack.pop();
                undoStack.push(next);
                await restoreState(next);
                if (redoBtn) redoBtn.disabled = redoStack.length === 0;
                const undoBtnEl = document.getElementById('pUndo');
                if (undoBtnEl) undoBtnEl.disabled = false;
            }
        };
    }
    const layersBtn = document.getElementById('btnLayersOpen');
    if (layersBtn) {
        layersBtn.onclick = () => {
            const popup = document.getElementById('layersPopup');
            if (popup) popup.classList.add('active');
        };
    }
    document.querySelectorAll('.layer-row').forEach(row => {
        row.onclick = () => {
            document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            currentCtx = (row.dataset.id === "1") ? ctx1 : ctx2;
            const popup = document.getElementById('layersPopup');
            if (popup) popup.classList.remove('active');
        };
    });
    saveState();
}
window.startPaintLogic = startPaintLogic;

// ========== КОНСТРУКТОР МЕРЧА — ИСПРАВЛЕНА ЗАГРУЗКА НА iOS ==========
(function() {
    const imageInput = document.getElementById('imageUpload');
    const printCanvas = document.getElementById('printCanvas');
    const resetBtn = document.getElementById('resetPrint');
    const uploadArea = document.getElementById('uploadArea');
    if (!printCanvas) return;
    const ctx = printCanvas.getContext('2d');
    printCanvas.width = 200;
    printCanvas.height = 200;
    
    function clearPrint() {
        ctx.clearRect(0, 0, printCanvas.width, printCanvas.height);
        ctx.strokeStyle = '#79434a';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(50, 50, 100, 100);
        ctx.setLineDash([]);
    }
    clearPrint();
    
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => imageInput.click());
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.match('image.*')) {
                alert('Please upload PNG, JPG or GIF');
                return;
            }
            
            // Используем FileReader для максимальной совместимости (iOS)
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, printCanvas.width, printCanvas.height);
                    const size = 90;
                    const x = (printCanvas.width - size) / 2;
                    const y = (printCanvas.height - size) / 2;
                    ctx.drawImage(img, x, y, size, size);
                };
                img.onerror = () => {
                    alert('Ошибка загрузки изображения на iOS. Попробуйте другой файл.');
                };
                img.src = event.target.result;
            };
            reader.onerror = () => {
                alert('Ошибка чтения файла. Возможно, формат не поддерживается.');
            };
            reader.readAsDataURL(file);
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearPrint();
            if (imageInput) imageInput.value = '';
        });
    }
})();

// ========== MOOD КНОПКА (простой Pinterest, один виджет) ==========
(function() {
    const moodBtn = document.getElementById('moodBtn');
    const pinterestModal = document.getElementById('pinterestModal');
    if (moodBtn && pinterestModal) {
        moodBtn.addEventListener('click', () => {
            pinterestModal.classList.add('active');
            if (!window.PinUtils) {
                const script = document.createElement('script');
                script.src = 'https://assets.pinterest.com/js/pinit.js';
                script.async = true;
                script.onload = () => {
                    if (window.PinUtils) window.PinUtils.build();
                };
                document.body.appendChild(script);
            } else {
                setTimeout(() => window.PinUtils.build(), 100);
            }
        });
    }
})();

// Плавный переход для ссылок
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !link.target && !href.startsWith('javascript:')) {
            e.preventDefault();
            if (navigator.vibrate) navigator.vibrate(10);
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        }
    });
});