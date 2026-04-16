document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const colorValue = document.getElementById('colorValue');
    const brushSizeInput = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const clearBtn = document.getElementById('clearBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('imageLoader');
    const saveBtn = document.getElementById('saveBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const layersBtn = document.getElementById('layersBtn');
    const layersModal = document.getElementById('layersModal');
    const layerTop = document.getElementById('layerTop');
    const layerBackground = document.getElementById('layerBackground');
    const closeBtn = document.getElementById('paintCloseBtn');

    // Два слоя (offscreen canvas)
    const layerBg = document.createElement('canvas');
    const layerTop = document.createElement('canvas');
    layerBg.width = layerTop.width = canvas.width;
    layerBg.height = layerTop.height = canvas.height;
    const ctxBg = layerBg.getContext('2d');
    const ctxTop = layerTop.getContext('2d');

    let activeLayer = 'top';

    // Инициализация фона (чёрный) и верхнего слоя (прозрачный)
    ctxBg.fillStyle = '#000000';
    ctxBg.fillRect(0, 0, canvas.width, canvas.height);
    ctxTop.clearRect(0, 0, canvas.width, canvas.height);

    // История
    let history = [];
    let historyIndex = -1;
    const MAX_HISTORY = 30;

    function saveState() {
        const state = {
            bg: ctxBg.getImageData(0, 0, canvas.width, canvas.height),
            top: ctxTop.getImageData(0, 0, canvas.width, canvas.height)
        };
        history = history.slice(0, historyIndex + 1);
        history.push(state);
        if (history.length > MAX_HISTORY) history.shift();
        historyIndex = history.length - 1;
    }

    function restoreState(state) {
        ctxBg.putImageData(state.bg, 0, 0);
        ctxTop.putImageData(state.top, 0, 0);
        compositeLayers();
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            restoreState(history[historyIndex]);
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            restoreState(history[historyIndex]);
        }
    }

    function compositeLayers() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(layerBg, 0, 0);
        ctx.drawImage(layerTop, 0, 0);
    }

    function getActiveContext() {
        return activeLayer === 'top' ? ctxTop : ctxBg;
    }

    function init() {
        ctxBg.fillStyle = '#000000';
        ctxBg.fillRect(0, 0, canvas.width, canvas.height);
        ctxTop.clearRect(0, 0, canvas.width, canvas.height);
        compositeLayers();
        saveState();
    }
    init();

    let drawing = false;
    let lastX, lastY;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const client = e.touches ? e.touches[0] : e;
        const x = (client.clientX - rect.left) * scaleX;
        const y = (client.clientY - rect.top) * scaleY;
        return { x: Math.max(0, Math.min(canvas.width, x)), y: Math.max(0, Math.min(canvas.height, y)) };
    }

    function start(e) {
        e.preventDefault();
        drawing = true;
        const p = getPos(e);
        lastX = p.x;
        lastY = p.y;
        const actCtx = getActiveContext();
        actCtx.beginPath();
        actCtx.moveTo(p.x, p.y);
        actCtx.strokeStyle = colorPicker.value;
        actCtx.lineWidth = parseInt(brushSizeInput.value);
        actCtx.lineCap = 'round';
        actCtx.lineJoin = 'round';
    }

    function move(e) {
        e.preventDefault();
        if (!drawing) return;
        const p = getPos(e);
        const actCtx = getActiveContext();
        actCtx.lineTo(p.x, p.y);
        actCtx.stroke();
        actCtx.beginPath();
        actCtx.moveTo(p.x, p.y);
        compositeLayers();
    }

    function stop(e) {
        e.preventDefault();
        if (drawing) {
            drawing = false;
            saveState();
        }
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseleave', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', stop);
    canvas.addEventListener('touchcancel', stop);

    colorPicker.addEventListener('input', () => colorValue.textContent = colorPicker.value);
    brushSizeInput.addEventListener('input', () => brushSizeValue.textContent = brushSizeInput.value);

    clearBtn.addEventListener('click', () => {
        const actCtx = getActiveContext();
        actCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (activeLayer === 'bg') {
            ctxBg.fillStyle = '#000000';
            ctxBg.fillRect(0, 0, canvas.width, canvas.height);
        }
        compositeLayers();
        saveState();
    });

    loadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const img = new Image();
            img.onload = () => {
                const actCtx = getActiveContext();
                actCtx.clearRect(0, 0, canvas.width, canvas.height);
                actCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
                compositeLayers();
                saveState();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
    });

    saveBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        localStorage.setItem('morstrix_current_art', dataURL);
        alert('✓ Изображение сохранено!');
    });

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    layersBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        layersModal.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!layersModal.contains(e.target) && e.target !== layersBtn) {
            layersModal.classList.remove('active');
        }
    });

    layerTop.addEventListener('click', () => {
        activeLayer = 'top';
        layersModal.classList.remove('active');
    });
    layerBackground.addEventListener('click', () => {
        activeLayer = 'bg';
        layersModal.classList.remove('active');
    });

    closeBtn.addEventListener('click', () => {
        window.location.href = 'journal.html';
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
        else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    });

    saveState();
});
