// ==================== MULTILAYER PAINT LOGIC ====================

(function() {
    const l1 = document.getElementById('layer1');
    const l2 = document.getElementById('layer2');
    const ctx1 = l1.getContext('2d', { willReadFrequently: true });
    const ctx2 = l2.getContext('2d', { willReadFrequently: true });
    
    let currentCtx = ctx2;
    let isDrawing = false;
    let undoStack = [];
    let redoStack = [];

    // Инициализация холстов
    function init() {
        [l1, l2].forEach(c => { 
            c.width = c.offsetWidth; 
            c.height = c.offsetHeight; 
        });
        
        ctx1.fillStyle = "#000";
        ctx1.fillRect(0, 0, l1.width, l1.height);
        
        ctx1.lineCap = ctx2.lineCap = 'round';
        ctx1.lineWidth = ctx2.lineWidth = 5;
        
        saveState();
    }

    // Сохранение состояния для undo/redo
    function saveState() {
        redoStack = [];
        undoStack.push({ 
            l1: l1.toDataURL(), 
            l2: l2.toDataURL() 
        });
        
        if (undoStack.length > 20) undoStack.shift();
        updateBtns();
    }

    // Обновление состояния кнопок
    function updateBtns() {
        document.getElementById('pUndo').disabled = undoStack.length <= 1;
        document.getElementById('pRedo').disabled = redoStack.length === 0;
    }

    // UNDO
    document.getElementById('pUndo').onclick = () => {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            applyState(undoStack[undoStack.length - 1]);
        }
    };

    // REDO
    document.getElementById('pRedo').onclick = () => {
        if (redoStack.length > 0) {
            const s = redoStack.pop();
            undoStack.push(s);
            applyState(s);
        }
    };

    // Применение сохранённого состояния
    function applyState(state) {
        const img1 = new Image();
        const img2 = new Image();
        img1.src = state.l1;
        img2.src = state.l2;
        
        img1.onload = () => {
            ctx1.clearRect(0, 0, l1.width, l1.height);
            ctx1.drawImage(img1, 0, 0);
        };
        
        img2.onload = () => {
            ctx2.clearRect(0, 0, l2.width, l2.height);
            ctx2.drawImage(img2, 0, 0);
        };
        
        updateBtns();
    }

    // Получение координат (поддержка мыши и тач)
    function getPos(e) {
        const rect = l2.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { 
            x: clientX - rect.left, 
            y: clientY - rect.top 
        };
    }

    // Отрисовка линии
    const start = (e) => {
        e.preventDefault();
        isDrawing = true;
        currentCtx.beginPath();
        const p = getPos(e);
        currentCtx.moveTo(p.x, p.y);
    };
    
    const move = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const p = getPos(e);
        currentCtx.strokeStyle = document.getElementById('pColor').value;
        currentCtx.lineTo(p.x, p.y);
        currentCtx.stroke();
    };
    
    const end = () => {
        if (isDrawing) {
            isDrawing = false;
            saveState();
        }
    };

    // События для мыши
    l2.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    
    // События для тач-экранов
    l2.addEventListener('touchstart', start);
    l2.addEventListener('touchmove', move);
    l2.addEventListener('touchend', end);

    // Управление слоями
    const pop = document.getElementById('layersPopup');
    document.getElementById('btnLayersOpen').onclick = () => pop.classList.add('active');
    document.getElementById('btnLayersClose').onclick = () => pop.classList.remove('active');

    // Переключение активного слоя
    document.querySelectorAll('.layer-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.layer-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCtx = (item.dataset.id === "1") ? ctx1 : ctx2;
            setTimeout(() => pop.classList.remove('active'), 200);
        };
    });

    // Очистка активного слоя
    document.getElementById('pClear').onclick = () => {
        currentCtx.clearRect(0, 0, l1.width, l1.height);
        if (currentCtx === ctx1) {
            ctx1.fillStyle = "#000";
            ctx1.fillRect(0, 0, l1.width, l1.height);
        }
        saveState();
    };

    // Запуск после загрузки DOM
    window.onload = init;
})();