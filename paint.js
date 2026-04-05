// paint.js - отдельная логика рисовалки

function startPaintLogic() {
    const l1 = document.getElementById('layer1');
    const l2 = document.getElementById('layer2');
    if (!l1 || !l2) return;
    
    // Проверяем, не инициализирован ли уже Paint
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
        undoStack.push({
            l1: l1.toDataURL(), 
            l2: l2.toDataURL()
        });
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

    // Mouse events
    l2.addEventListener('mousedown', startDrawing);
    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDrawing);
    
    // Touch events
    l2.addEventListener('touchstart', startDrawing, { passive: false });
    l2.addEventListener('touchmove', draw, { passive: false });
    l2.addEventListener('touchend', endDrawing);
    l2.addEventListener('touchcancel', endDrawing);

    // Clear button
    const clearBtn = document.getElementById('pClear');
    if (clearBtn) {
        clearBtn.onclick = () => {
            ctx2.clearRect(0, 0, l2.width, l2.height);
            ctx1.fillStyle = "#000";
            ctx1.fillRect(0, 0, l1.width, l1.height);
            saveState();
        };
    }

    // Undo button
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

    // Redo button
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

    // Layers button
    const layersBtn = document.getElementById('btnLayersOpen');
    if (layersBtn) {
        layersBtn.onclick = () => {
            const popup = document.getElementById('layersPopup');
            if (popup) popup.classList.add('active');
        };
    }
    
    // Layer selection
    document.querySelectorAll('.layer-row').forEach(row => {
        row.onclick = () => {
            document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            currentCtx = (row.dataset.id === "1") ? ctx1 : ctx2;
            const popup = document.getElementById('layersPopup');
            if (popup) popup.classList.remove('active');
        };
    });
    
    // Initial save
    saveState();
}

// Экспортируем функцию глобально
window.startPaintLogic = startPaintLogic;