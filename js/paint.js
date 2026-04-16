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

    // История для undo/redo
    let history = [];
    let historyIndex = -1;
    const MAX_HISTORY = 30;

    // Инициализация холста (чёрный фон)
    function initCanvas() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = parseInt(brushSizeInput.value);
        ctx.strokeStyle = colorPicker.value;
        saveState();
    }
    initCanvas();

    // Сохранение состояния в историю
    function saveState() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history = history.slice(0, historyIndex + 1);
        history.push(imageData);
        if (history.length > MAX_HISTORY) history.shift();
        historyIndex = history.length - 1;
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            ctx.putImageData(history[historyIndex], 0, 0);
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            ctx.putImageData(history[historyIndex], 0, 0);
        }
    }

    // Рисование
    let drawing = false;

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
        ctx.beginPath();
        const p = getPos(e);
        ctx.moveTo(p.x, p.y);
        ctx.strokeStyle = colorPicker.value;
    }

    function move(e) {
        e.preventDefault();
        if (!drawing) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }

    function stop(e) {
        e.preventDefault();
        if (drawing) {
            drawing = false;
            ctx.beginPath();
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

    // Обновление цвета и размера кисти
    colorPicker.addEventListener('input', () => {
        colorValue.textContent = colorPicker.value;
        ctx.strokeStyle = colorPicker.value;
    });
    brushSizeInput.addEventListener('input', () => {
        brushSizeValue.textContent = brushSizeInput.value;
        ctx.lineWidth = parseInt(brushSizeInput.value);
    });

    // Кнопки
    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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

    // Слои (мини-модалка)
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
        // Логика слоя Top (рисуем поверх)
        layersModal.classList.remove('active');
        // Здесь можно добавить переключение слоёв, если нужно
        alert('Слой TOP активен');
    });

    layerBackground.addEventListener('click', () => {
        layersModal.classList.remove('active');
        alert('Слой BACKGROUND активен');
    });

    // Закрытие Paint и возврат в журнал
    closeBtn.addEventListener('click', () => {
        window.location.href = 'journal.html';
    });

    // Горячие клавиши Ctrl+Z / Ctrl+Y
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
    });
});
