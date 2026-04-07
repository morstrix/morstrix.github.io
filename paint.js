// ==================== PAINT.JS — РИСОВАНИЕ + СОХРАНЕНИЕ ====================
(function() {
    // Получаем canvas'ы
    const canvas1 = document.getElementById('layer1');
    const canvas2 = document.getElementById('layer2');
    const container = document.getElementById('paintArea');
    
    if (!canvas1 || !canvas2) {
        console.warn('Paint canvases not found');
        return;
    }
    
    // Устанавливаем размеры canvas (под размер контейнера)
    function resizeCanvases() {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        
        if (w > 0 && h > 0) {
            canvas1.width = w;
            canvas1.height = h;
            canvas2.width = w;
            canvas2.height = h;
            
            // Пересохраняем контексты
            initContexts();
            
            // Восстанавливаем слои из сохранённых данных (если есть)
            restoreLayers();
        }
    }
    
    // Контексты
    let ctx1 = null;
    let ctx2 = null;
    let currentCtx = null;
    let currentCanvas = null;
    let currentLayerId = 2; // 2 = верхний, 1 = нижний
    
    // Состояние рисования
    let drawing = false;
    let lastX = 0, lastY = 0;
    
    // Цвет рисования
    let currentColor = '#ffb7c7';
    const colorPicker = document.getElementById('pColor');
    if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
        });
    }
    
    // История для отмены (Undo/Redo)
    let historyStack = [];    // Массив объектов { layerId, imageData }
    let historyIndex = -1;
    const MAX_HISTORY = 20;
    
    // Сохраняем состояния слоёв отдельно (для восстановления после resize)
    let savedLayer1Data = null;
    let savedLayer2Data = null;
    
    function initContexts() {
        ctx1 = canvas1.getContext('2d');
        ctx2 = canvas2.getContext('2d');
        
        // Заполняем белым фоном, если пусто
        if (savedLayer1Data) {
            const img = new Image();
            img.onload = () => {
                ctx1.drawImage(img, 0, 0);
            };
            img.src = savedLayer1Data;
        } else if (ctx1) {
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
        }
        
        if (savedLayer2Data) {
            const img = new Image();
            img.onload = () => {
                ctx2.drawImage(img, 0, 0);
            };
            img.src = savedLayer2Data;
        } else if (ctx2) {
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        }
        
        updateCurrentContext();
    }
    
    function restoreLayers() {
        if (savedLayer1Data) {
            const img = new Image();
            img.onload = () => {
                if (ctx1) ctx1.drawImage(img, 0, 0);
            };
            img.src = savedLayer1Data;
        } else if (ctx1) {
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
        }
        
        if (savedLayer2Data) {
            const img = new Image();
            img.onload = () => {
                if (ctx2) ctx2.drawImage(img, 0, 0);
            };
            img.src = savedLayer2Data;
        } else if (ctx2) {
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        }
        
        updateCurrentContext();
    }
    
    function updateCurrentContext() {
        if (currentLayerId === 1) {
            currentCanvas = canvas1;
            currentCtx = ctx1;
        } else {
            currentCanvas = canvas2;
            currentCtx = ctx2;
        }
    }
    
    // Сохраняем текущее состояние в историю
    function saveToHistory() {
        // Обрезаем историю, если мы не в конце
        if (historyIndex < historyStack.length - 1) {
            historyStack = historyStack.slice(0, historyIndex + 1);
        }
        
        // Получаем копию текущего слоя
        const imageData = currentCanvas.toDataURL();
        historyStack.push({
            layerId: currentLayerId,
            imageData: imageData
        });
        
        // Ограничиваем размер истории
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        } else {
            historyIndex = historyStack.length - 1;
        }
        
        updateUndoRedoButtons();
    }
    
    // Отмена (Undo)
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            const state = historyStack[historyIndex];
            restoreLayerFromData(state.layerId, state.imageData);
            updateUndoRedoButtons();
        }
    }
    
    // Возврат (Redo)
    function redo() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            const state = historyStack[historyIndex];
            restoreLayerFromData(state.layerId, state.imageData);
            updateUndoRedoButtons();
        }
    }
    
    function restoreLayerFromData(layerId, imageData) {
        const img = new Image();
        img.onload = () => {
            if (layerId === 1) {
                if (ctx1) ctx1.drawImage(img, 0, 0);
                savedLayer1Data = imageData;
            } else {
                if (ctx2) ctx2.drawImage(img, 0, 0);
                savedLayer2Data = imageData;
            }
            updateCurrentContext();
        };
        img.src = imageData;
    }
    
    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('pUndo');
        const redoBtn = document.getElementById('pRedo');
        if (undoBtn) undoBtn.disabled = (historyIndex <= 0);
        if (redoBtn) redoBtn.disabled = (historyIndex >= historyStack.length - 1);
    }
    
    // Рисование линии между двумя точками
    function drawLine(x1, y1, x2, y2) {
        if (!currentCtx) return;
        currentCtx.beginPath();
        currentCtx.moveTo(x1, y1);
        currentCtx.lineTo(x2, y2);
        currentCtx.strokeStyle = currentColor;
        currentCtx.lineWidth = 6;
        currentCtx.lineCap = 'round';
        currentCtx.lineJoin = 'round';
        currentCtx.stroke();
    }
    
    // Получение координат относительно canvas (учитывая масштаб)
    function getCanvasCoords(e) {
        if (!currentCanvas) return { x: 0, y: 0 };
        
        const rect = currentCanvas.getBoundingClientRect();
        const scaleX = currentCanvas.width / rect.width;
        const scaleY = currentCanvas.height / rect.height;
        
        let clientX, clientY;
        
        if (e.touches) {
            // Touch событие
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // Mouse событие
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        
        x = Math.max(0, Math.min(currentCanvas.width, x));
        y = Math.max(0, Math.min(currentCanvas.height, y));
        
        return { x, y };
    }
    
    // Начало рисования
    function startDrawing(e) {
        e.preventDefault();
        drawing = true;
        const coords = getCanvasCoords(e);
        lastX = coords.x;
        lastY = coords.y;
        
        // Рисуем точку
        if (currentCtx) {
            currentCtx.beginPath();
            currentCtx.arc(lastX, lastY, 3, 0, Math.PI * 2);
            currentCtx.fillStyle = currentColor;
            currentCtx.fill();
        }
        
        // Сохраняем состояние перед началом новой линии
        saveToHistory();
    }
    
    // Рисование
    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        
        const coords = getCanvasCoords(e);
        drawLine(lastX, lastY, coords.x, coords.y);
        lastX = coords.x;
        lastY = coords.y;
    }
    
    // Конец рисования
    function stopDrawing(e) {
        drawing = false;
        e.preventDefault();
    }
    
    // Очистка текущего слоя
    function clearCurrentLayer() {
        if (!currentCtx) return;
        
        if (currentLayerId === 1) {
            currentCtx.fillStyle = '#ffffff';
            currentCtx.fillRect(0, 0, canvas1.width, canvas1.height);
            savedLayer1Data = canvas1.toDataURL();
        } else {
            currentCtx.clearRect(0, 0, canvas2.width, canvas2.height);
            savedLayer2Data = canvas2.toDataURL();
        }
        
        saveToHistory();
    }
    
    // Сохранение всего рисунка (оба слоя) в PNG
    function saveArt() {
        // Создаём временный canvas для объединения слоёв
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas1.width;
        tempCanvas.height = canvas1.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Рисуем слой 1 (фон)
        tempCtx.drawImage(canvas1, 0, 0);
        // Рисуем слой 2 (верхний)
        tempCtx.drawImage(canvas2, 0, 0);
        
        // Создаём ссылку для скачивания
        const link = document.createElement('a');
        link.download = 'morstrix_art.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
    
    // Переключение слоёв
    function setActiveLayer(layerId) {
        if (layerId === currentLayerId) return;
        
        // Сохраняем текущее состояние перед переключением
        saveToHistory();
        
        currentLayerId = layerId;
        updateCurrentContext();
        
        // Обновляем визуальное выделение в UI
        const layerRows = document.querySelectorAll('.layer-row');
        layerRows.forEach(row => {
            const id = parseInt(row.getAttribute('data-id'));
            if (id === layerId) {
                row.classList.add('active');
            } else {
                row.classList.remove('active');
            }
        });
    }
    
    // Инициализация событий для рисования
    function initDrawingEvents() {
        if (!currentCanvas) return;
        
        // Mouse events
        currentCanvas.addEventListener('mousedown', startDrawing);
        currentCanvas.addEventListener('mousemove', draw);
        currentCanvas.addEventListener('mouseup', stopDrawing);
        currentCanvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch events для мобильных
        currentCanvas.addEventListener('touchstart', startDrawing, { passive: false });
        currentCanvas.addEventListener('touchmove', draw, { passive: false });
        currentCanvas.addEventListener('touchend', stopDrawing);
        currentCanvas.addEventListener('touchcancel', stopDrawing);
    }
    
    // Обновляем события при смене слоя
    function rebindEvents() {
        if (currentCanvas) {
            // Удаляем старые слушатели (проще заменить на новые через клонирование, но сделаем через removeEventListener)
            // Для простоты пересоздадим слушатели
            const oldCanvas = currentCanvas;
            const newCanvas = currentCanvas;
            
            // Временно убираем все слушатели (через замену элемента - надёжнее)
            // Но проще: обновляем ссылку и заново вешаем
        }
        initDrawingEvents();
    }
    
    // Наблюдатель за изменением размера контейнера
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvases();
    });
    if (container) {
        resizeObserver.observe(container);
    }
    
    // Кнопки управления
    const undoBtn = document.getElementById('pUndo');
    const redoBtn = document.getElementById('pRedo');
    const clearBtn = document.getElementById('pClear');
    const layersBtn = document.getElementById('btnLayersOpen');
    const layersPopup = document.getElementById('layersPopup');
    
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);
    if (clearBtn) clearBtn.addEventListener('click', clearCurrentLayer);
    
    // Кнопка сохранения (ДОБАВЛЯЕМ НОВУЮ КНОПКУ В ИНТЕРФЕЙС)
    // Добавляем кнопку сохранения в панель инструментов Paint
    const paintToolsPanel = document.querySelector('.paint-window .paint-tools-panel:last-child');
    if (paintToolsPanel && !document.getElementById('pSaveBtn')) {
        const saveBtn = document.createElement('button');
        saveBtn.id = 'pSaveBtn';
        saveBtn.className = 'retro-btn';
        saveBtn.style.fontSize = '7px';
        saveBtn.textContent = 'SAVE';
        saveBtn.addEventListener('click', saveArt);
        paintToolsPanel.appendChild(saveBtn);
    }
    
    // Переключение слоёв через popup
    if (layersBtn) {
        layersBtn.addEventListener('click', () => {
            if (layersPopup) layersPopup.classList.toggle('active');
        });
    }
    
    // Клик по строке слоя
    const layerRows = document.querySelectorAll('.layer-row');
    layerRows.forEach(row => {
        row.addEventListener('click', () => {
            const layerId = parseInt(row.getAttribute('data-id'));
            setActiveLayer(layerId);
            if (layersPopup) layersPopup.classList.remove('active');
        });
    });
    
    // Инициализация
    setTimeout(() => {
        resizeCanvases();
        setActiveLayer(2); // начинаем с верхнего слоя
        saveToHistory(); // сохраняем начальное состояние
    }, 100);
    
    // Экспортируем функции в глобальную область (на случай, если нужны извне)
    window.paintAPI = {
        saveArt: saveArt,
        clearLayer: clearCurrentLayer,
        undo: undo,
        redo: redo,
        setLayer: setActiveLayer
    };
})();