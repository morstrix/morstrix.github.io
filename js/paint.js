// paint.js — с кнопкой SAVE, обновляющей превью в журнале
document.addEventListener('DOMContentLoaded', () => {
    const layer1 = document.getElementById('layer1');
    const layer2 = document.getElementById('layer2');
    const container = document.getElementById('paintArea');
    const colorPicker = document.getElementById('pColor');
    const artPreview = document.getElementById('artPreview');
    const layersPopup = document.getElementById('layersPopup');
    const artModal = document.getElementById('artModal');
    
    if (!layer1 || !layer2 || !container) return;

    let ctx1 = null;
    let ctx2 = null;
    let activeCtx = null;
    let drawing = false;
    let history = [];
    let step = -1;
    let initialized = false;

    // Функция инициализации/ресайза канвасов
    function initCanvasSize() {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        const width = rect.width;
        const height = rect.height;
        
        layer1.width = width;
        layer1.height = height;
        layer2.width = width;
        layer2.height = height;
        
        ctx1 = layer1.getContext('2d');
        ctx2 = layer2.getContext('2d');
        
        // Настройка стилей рисования
        ctx1.lineCap = 'round';
        ctx1.lineJoin = 'round';
        ctx2.lineCap = 'round';
        ctx2.lineJoin = 'round';
        
        // Заливаем чёрным фон
        ctx1.fillStyle = '#000000';
        ctx1.fillRect(0, 0, width, height);
        ctx2.clearRect(0, 0, width, height);
        
        activeCtx = ctx2; // активный слой по умолчанию (верхний)
        
        return true;
    }

    // Сохранить состояние для undo/redo
    function saveState() {
        if (!ctx1 || !ctx2) return;
        step++;
        if (step < history.length) history.length = step;
        history.push({
            l1: layer1.toDataURL(),
            l2: layer2.toDataURL()
        });
        updatePreview();
    }

    // ОБНОВЛЕНИЕ ПРЕВЬЮ В ЖУРНАЛЕ (арт-блок)
    function updateJournalArt() {
        if (!artPreview) return;
        
        // Создаём временный канвас для объединения слоёв
        const temp = document.createElement('canvas');
        temp.width = layer1.width;
        temp.height = layer1.height;
        const tCtx = temp.getContext('2d');
        tCtx.drawImage(layer1, 0, 0);
        tCtx.drawImage(layer2, 0, 0);
        
        // Обновляем картинку в ART блоке журнала
        artPreview.src = temp.toDataURL();
        
        // Дополнительно сохраняем в localStorage, чтобы не потерять при закрытии
        try {
            localStorage.setItem('savedArt', temp.toDataURL());
        } catch(e) { console.warn('localStorage save failed', e); }
        
        // Визуальный фидбек
        const saveBtn = document.getElementById('pSave');
        if (saveBtn) {
            const originalText = saveBtn.innerText;
            saveBtn.innerText = "✓ SAVED!";
            setTimeout(() => {
                if (saveBtn) saveBtn.innerText = originalText;
            }, 800);
        }
    }

    // Обновить превью (внутреннее, без сохранения)
    function updatePreview() {
        if (!artPreview || !ctx1 || !ctx2) return;
        const temp = document.createElement('canvas');
        temp.width = layer1.width;
        temp.height = layer1.height;
        const tCtx = temp.getContext('2d');
        tCtx.drawImage(layer1, 0, 0);
        tCtx.drawImage(layer2, 0, 0);
        artPreview.src = temp.toDataURL();
    }

    // Получить координаты мыши/пальца относительно container
    const getPos = (e) => {
        const rect = container.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Масштабируем координаты под размер канваса
        const scaleX = layer1.width / rect.width;
        const scaleY = layer1.height / rect.height;
        
        // Защита от выхода за границы
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        x = Math.max(0, Math.min(layer1.width, x));
        y = Math.max(0, Math.min(layer1.height, y));
        
        return { x, y };
    };

    // Начало рисования
    const start = (e) => {
        if (!activeCtx) return;
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        activeCtx.beginPath();
        activeCtx.moveTo(pos.x, pos.y);
        activeCtx.lineTo(pos.x, pos.y);
        activeCtx.strokeStyle = colorPicker.value || '#ffb7c7';
        activeCtx.lineWidth = 8;
        activeCtx.stroke();
    };

    // Процесс рисования
    const move = (e) => {
        if (!drawing || !activeCtx) return;
        e.preventDefault();
        const pos = getPos(e);
        activeCtx.lineTo(pos.x, pos.y);
        activeCtx.strokeStyle = colorPicker.value || '#ffb7c7';
        activeCtx.lineWidth = 8;
        activeCtx.stroke();
        activeCtx.beginPath();
        activeCtx.moveTo(pos.x, pos.y);
    };

    // Конец рисования
    const stop = (e) => {
        if (drawing) {
            drawing = false;
            saveState();
            updateButtonsState();
        }
    };

    // Обновить состояние кнопок undo/redo
    function updateButtonsState() {
        const undoBtn = document.getElementById('pUndo');
        const redoBtn = document.getElementById('pRedo');
        if (undoBtn) undoBtn.disabled = (step <= 0);
        if (redoBtn) redoBtn.disabled = (step >= history.length - 1);
    }

    // Undo
    function undo() {
        if (step > 0 && history[step - 1]) {
            step--;
            loadState(history[step]);
            updateButtonsState();
        }
    }

    // Redo
    function redo() {
        if (step < history.length - 1 && history[step + 1]) {
            step++;
            loadState(history[step]);
            updateButtonsState();
        }
    }

    // Загрузить состояние
    function loadState(state) {
        if (!state || !ctx1 || !ctx2) return;
        const img1 = new Image();
        const img2 = new Image();
        let loaded = 0;
        
        img1.onload = () => {
            ctx1.clearRect(0, 0, layer1.width, layer1.height);
            ctx1.drawImage(img1, 0, 0);
            loaded++;
            if (loaded === 2) {
                updatePreview();
            }
        };
        img2.onload = () => {
            ctx2.clearRect(0, 0, layer2.width, layer2.height);
            ctx2.drawImage(img2, 0, 0);
            loaded++;
            if (loaded === 2) {
                updatePreview();
            }
        };
        img1.src = state.l1;
        img2.src = state.l2;
    }

    // Очистка активного слоя
    function clearActiveLayer() {
        if (!activeCtx) return;
        activeCtx.clearRect(0, 0, layer2.width, layer2.height);
        if (activeCtx === ctx1) {
            activeCtx.fillStyle = '#000000';
            activeCtx.fillRect(0, 0, layer1.width, layer1.height);
        }
        saveState();
    }

    // Очистка ВСЕГО (оба слоя)
    function clearAll() {
        if (ctx1) {
            ctx1.fillStyle = '#000000';
            ctx1.fillRect(0, 0, layer1.width, layer1.height);
        }
        if (ctx2) {
            ctx2.clearRect(0, 0, layer2.width, layer2.height);
        }
        history = [];
        step = -1;
        saveState();
        updateButtonsState();
    }

    // Переключение слоёв
    function switchLayer(layerId) {
        if (layerId === '1') {
            activeCtx = ctx1;
        } else {
            activeCtx = ctx2;
        }
        if (layersPopup) layersPopup.classList.remove('active');
    }

    // Принудительная перерисовка при открытии модалки
    function onModalOpen() {
        setTimeout(() => {
            if (container && layer1 && layer2) {
                const success = initCanvasSize();
                if (success) {
                    // Пытаемся загрузить сохранённый рисунок из localStorage
                    try {
                        const savedArt = localStorage.getItem('savedArt');
                        if (savedArt && history.length === 0) {
                            const img = new Image();
                            img.onload = () => {
                                // Восстанавливаем рисунок во временный канвас, потом разделяем по слоям?
                                // Проще: сохраняем как состояние
                                ctx1.fillStyle = '#000000';
                                ctx1.fillRect(0, 0, layer1.width, layer1.height);
                                ctx2.clearRect(0, 0, layer2.width, layer2.height);
                                ctx2.drawImage(img, 0, 0, layer2.width, layer2.height);
                                saveState();
                            };
                            img.src = savedArt;
                        } else if (history.length === 0) {
                            saveState();
                        }
                    } catch(e) {}
                    
                    if (history.length === 0) {
                        saveState();
                    }
                    updateButtonsState();
                }
            }
        }, 100);
    }

    // Навесить обработчики рисования
    function bindDrawingEvents() {
        container.removeEventListener('mousedown', start);
        container.removeEventListener('touchstart', start);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('mouseup', stop);
        window.removeEventListener('touchend', stop);
        
        container.addEventListener('mousedown', start);
        container.addEventListener('touchstart', start, { passive: false });
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('mouseup', stop);
        window.addEventListener('touchend', stop);
    }

    // Инициализация всех кнопок
    function initControls() {
        const undoBtn = document.getElementById('pUndo');
        const redoBtn = document.getElementById('pRedo');
        const clearBtn = document.getElementById('pClear');
        const layersOpenBtn = document.getElementById('btnLayersOpen');
        const saveBtn = document.getElementById('pSave');
        
        if (undoBtn) undoBtn.onclick = () => undo();
        if (redoBtn) redoBtn.onclick = () => redo();
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm('CLEAR ACTIVE LAYER?')) clearActiveLayer();
            };
        }
        if (saveBtn) {
            saveBtn.onclick = () => updateJournalArt();
        }
        if (layersOpenBtn) {
            layersOpenBtn.onclick = () => {
                if (layersPopup) layersPopup.classList.toggle('active');
            };
        }
        
        // События для слоёв
        document.querySelectorAll('.layer-row').forEach(row => {
            row.onclick = () => {
                document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('active'));
                row.classList.add('active');
                switchLayer(row.dataset.id);
                if (layersPopup) layersPopup.classList.remove('active');
            };
        });
    }

    // Сброс всех данных (при клике на RESET ART в журнале)
    function resetArt() {
        if (!ctx1 || !ctx2) return;
        ctx1.fillStyle = '#000000';
        ctx1.fillRect(0, 0, layer1.width, layer1.height);
        ctx2.clearRect(0, 0, layer2.width, layer2.height);
        history = [];
        step = -1;
        saveState();
        updateButtonsState();
        // Очищаем сохранёнку
        try { localStorage.removeItem('savedArt'); } catch(e) {}
    }

    // Отслеживаем открытие модалки с Paint
    if (artModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (artModal.classList.contains('active')) {
                        onModalOpen();
                    }
                }
            });
        });
        observer.observe(artModal, { attributes: true });
        
        if (artModal.classList.contains('active')) {
            onModalOpen();
        }
    }
    
    // Кнопка RESET ART на основной странице
    const resetArtBtn = document.getElementById('resetArtBtn');
    if (resetArtBtn) {
        resetArtBtn.onclick = () => resetArt();
    }
    
    // Запуск инициализации
    initControls();
    bindDrawingEvents();
    
    if (container.offsetParent !== null) {
        initCanvasSize();
        saveState();
    }
});
