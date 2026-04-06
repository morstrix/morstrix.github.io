// ==================== JOURNAL.JS ====================

const slides = document.querySelectorAll('#mainCarousel img');
let currentSlide = 0;
setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}, 3500);

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

const radioBtn = document.getElementById('radioBtn');
const radioModal = document.getElementById('radioModal');
if (radioBtn && radioModal) {
    radioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        radioModal.classList.add('active');
    });
}

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

const ticker = document.getElementById('rssTicker');
if (ticker) {
    const items = ["HYPERALLERGIC", "ARTNEWS", "RHIZOME", "ARTFORUM", "E-FLUX"];
    ticker.innerHTML = `<span>✦ ${items.join('</span><span>✦ ')}</span>`.repeat(6);
}

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

window.onload = () => { 
    if(window.PinUtils) window.PinUtils.build(); 
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(modal => modal.classList.remove('active'));
    }
});

// ===== ДОПОЛНИТЕЛЬНАЯ ЛОГИКА ДЛЯ НОВЫХ БЛОКОВ =====
// Конструктор мерча – уже обработан через onclick в HTML
// Конвертер пиксель/см – уже обработан в inline-скрипте
// TEAM и DONATE – уже обработаны в inline-скрипте
// (оставляем существующий код без изменений)


// ========== MOOD КНОПКА И ПИНТЕРЕСТ ПОПАПЫ ==========
(function() {
    const moodBtn = document.getElementById('moodBtn');
    const dropdown = document.getElementById('moodDropdown');
    const arrow = document.querySelector('.mood-arrow');
    
    // Открыть/закрыть выпадающий список
    if (moodBtn) {
        moodBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            if (arrow) arrow.classList.toggle('open');
        });
    }
    
    // Закрыть dropdown при клике вне
    document.addEventListener('click', (e) => {
        if (dropdown && moodBtn && !moodBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            if (arrow) arrow.classList.remove('open');
        }
    });
    
    // Ссылки на Pinterest папки (ЗАМЕНИТЕ НА СВОИ)
    const boardUrls = {
        'print': 'https://www.pinterest.com/morstrix/print/',
        'design': 'https://www.pinterest.com/morstrix/design/',
        'diygear': 'https://www.pinterest.com/morstrix/diy-gear/',
        'tattoo': 'https://www.pinterest.com/morstrix/tattoo/',
        'barbering': 'https://www.pinterest.com/morstrix/barbering/'
    };
    
    // Обработка клика по категории
    const categories = document.querySelectorAll('.mood-category');
    categories.forEach(cat => {
        cat.addEventListener('click', () => {
            const board = cat.getAttribute('data-board');
            const boardUrl = boardUrls[board];
            if (boardUrl) {
                openPinterestModal(boardUrl);
            }
            // Закрываем dropdown после выбора
            dropdown.classList.remove('open');
            if (arrow) arrow.classList.remove('open');
        });
    });
    
    // Функция открытия модалки с Pinterest
    function openPinterestModal(boardUrl) {
        // Создаём модалку
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.display = 'flex';
        
        modalOverlay.innerHTML = `
            <div class="modal-content pinterest-modal">
                <div class="modal-header">
                    <span class="modal-title-text">PINTEREST BOARD</span>
                    <button class="modal-close-btn">✜</button>
                </div>
                <div class="pin-embed" id="pinEmbedContainer">
                    <a data-pin-do="embedBoard" data-pin-board-width="400" data-pin-scale-height="300" href="${boardUrl}"></a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        // Загружаем Pinterest скрипт, если ещё не загружен
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
        
        // Закрытие модалки
        const closeBtn = modalOverlay.querySelector('.modal-close-btn');
        const closeModal = () => modalOverlay.remove();
        closeBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
})();

// ========== КОНСТРУКТОР МЕРЧА ==========
(function() {
    const imageInput = document.getElementById('imageUpload');
    const printCanvas = document.getElementById('printCanvas');
    const resetBtn = document.getElementById('resetPrint');
    const uploadArea = document.getElementById('uploadArea');
    
    if (!printCanvas) return;
    
    let ctx = printCanvas.getContext('2d');
    let currentImage = null;
    
    // Настройка canvas (фиксированный размер)
    printCanvas.width = 200;
    printCanvas.height = 200;
    clearCanvas();
    
    // Клик по области загрузки
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', function(e) {
            e.stopPropagation();
            imageInput.click();
        });
    }
    
    // Обработка выбора файла
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.match('image.*')) {
                alert('Please upload an image file (PNG, JPG, GIF)');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    currentImage = img;
                    drawImageOnCanvas(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Рисование картинки на canvas (с сохранением пропорций)
    function drawImageOnCanvas(img) {
        if (!ctx) return;
        
        const canvasSize = 200;
        const maxSize = 140;
        
        let width = img.width;
        let height = img.height;
        
        // Масштабируем, чтобы влезло
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }
        
        const x = (canvasSize - width) / 2;
        const y = (canvasSize - height) / 2;
        
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.drawImage(img, x, y, width, height);
    }
    
    // Очистка canvas
    function clearCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, printCanvas.width, printCanvas.height);
        currentImage = null;
    }
    
    // Кнопка сброса
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            clearCanvas();
            if (imageInput) imageInput.value = '';
        });
    }
})();