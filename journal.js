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
    "wellness", "radio", "travel"
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
    // Рисуем пиксельную футболку с TV-текстурой
    const tshirtCanvas = document.getElementById('tshirtCanvas');
    if (tshirtCanvas) {
        const ctx = tshirtCanvas.getContext('2d');
        const size = 200;
        
        function drawPixelTshirt() {
    ctx.clearRect(0, 0, size, size);
    
    // ===== ОСНОВНОЙ СИЛУЭТ ФУТБОЛКИ =====
    ctx.fillStyle = '#e8e8e8';
    
    // Тело (прямоугольник срезанными углами)
    ctx.fillRect(45, 55, 110, 125);
    
    // Скругление углов (пиксельное)
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(42, 58, 3, 3);
    ctx.fillRect(155, 58, 3, 3);
    ctx.fillRect(42, 175, 3, 3);
    ctx.fillRect(155, 175, 3, 3);
    
    // Рукава
    ctx.fillStyle = '#d4d4d4';
    ctx.fillRect(25, 65, 20, 55);
    ctx.fillRect(155, 65, 20, 55);
    
    // Скругление рукавов
    ctx.fillRect(22, 68, 3, 3);
    ctx.fillRect(175, 68, 3, 3);
    ctx.fillRect(22, 115, 3, 3);
    ctx.fillRect(175, 115, 3, 3);
    
   // Круглый вырез
ctx.fillStyle = '#cccccc';
ctx.fillRect(82, 48, 36, 10);
ctx.fillRect(86, 42, 28, 8);
    
    // ===== ДЕТАЛИ И ШВЫ =====
    ctx.fillStyle = '#666666';
    
    // Линия плеч
    ctx.fillRect(45, 55, 110, 2);
    
    // Боковые швы
    ctx.fillRect(45, 55, 2, 125);
    ctx.fillRect(153, 55, 2, 125);
    
    // Линия низа
    ctx.fillRect(45, 177, 110, 3);
    
    // Линия на рукавах
    ctx.fillRect(25, 65, 20, 2);
    ctx.fillRect(155, 65, 20, 2);
    ctx.fillRect(25, 118, 20, 2);
    ctx.fillRect(155, 118, 20, 2);
    
    // ===== ЗОНА ДЛЯ ПРИНТА (СВЕТЛЫЙ КВАДРАТ) =====
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(65, 85, 70, 70);
    
    // Рамка зоны принта (пунктир)
    ctx.fillStyle = '#999999';
    for (let i = 0; i < 70; i += 6) {
        ctx.fillRect(65 + i, 85, 3, 2);
        ctx.fillRect(65 + i, 153, 3, 2);
        ctx.fillRect(65, 85 + i, 2, 3);
        ctx.fillRect(133, 85 + i, 2, 3);
    }
    
    // ===== TV-ЭФФЕКТ (ТОЧКИ) =====
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = `rgba(0, 0, 0, 0.08)`;
        ctx.fillRect(x, y, 1, 1);
    }
    
    // Редкие белые блики
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        if (Math.random() > 0.96) {
            ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
        
        drawPixelTshirt();
        
        // Обновляем текстуру каждые 2 секунды (TV-эффект)
        setInterval(() => {
            if (document.querySelector('.merch-block')) {
                drawPixelTshirt();
            }
        }, 2000);
    }
    
    // Логика загрузки принта
    const imageInput = document.getElementById('imageUpload');
    const printCanvas = document.getElementById('printCanvas');
    const resetBtn = document.getElementById('resetPrint');
    const uploadArea = document.getElementById('uploadArea');
    
    if (printCanvas) {
        let ctx = printCanvas.getContext('2d');
        printCanvas.width = 120;
        printCanvas.height = 120;
        clearPrint();
        
        function clearPrint() {
            if (!ctx) return;
            ctx.clearRect(0, 0, printCanvas.width, printCanvas.height);
            // Рисуем пунктирную рамку (место для принта)
            ctx.strokeStyle = '#79434a';
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(10, 10, printCanvas.width - 20, printCanvas.height - 20);
            ctx.setLineDash([]);
        }
        
        // Клик по области загрузки
        if (uploadArea && imageInput) {
            uploadArea.addEventListener('click', function(e) {
                e.stopPropagation();
                imageInput.click();
            });
        }
        
        // Загрузка файла
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.type.match('image.*')) {
                    alert('Please upload PNG, JPG or GIF');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.clearRect(0, 0, printCanvas.width, printCanvas.height);
                        
                        let width = img.width;
                        let height = img.height;
                        const maxSize = 90;
                        
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
                        
                        const x = (printCanvas.width - width) / 2;
                        const y = (printCanvas.height - height) / 2;
                        ctx.drawImage(img, x, y, width, height);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Кнопка сброса
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                clearPrint();
                if (imageInput) imageInput.value = '';
            });
        }
    }
})();