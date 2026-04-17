document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const colorValue = document.getElementById('colorValue');
    const brushSizeInput = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const eraserSizeInput = document.getElementById('eraserSize');
    const eraserSizeValue = document.getElementById('eraserSizeValue');
    const smoothingInput = document.getElementById('smoothing');
    const smoothingValue = document.getElementById('smoothingValue');
    const clearBtn = document.getElementById('clearBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('imageLoader');
    const saveBtn = document.getElementById('saveBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const layersBtn = document.getElementById('layersBtn');
    const layersModal = document.getElementById('layersModal');
    const closeBtn = document.getElementById('paintCloseBtn');
    
    // New tool buttons
    const brushBtn = document.getElementById('brushBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const textBtn = document.getElementById('textBtn');
    const textModal = document.getElementById('textModal');
    const textModalClose = document.getElementById('textModalClose');
    const canvasTextInput = document.getElementById('canvasTextInput');
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const confirmTextBtn = document.getElementById('confirmTextBtn');
    const addLayerBtn = document.getElementById('addLayerBtn');
    const layersList = document.getElementById('layersList');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsModalClose = document.getElementById('settingsModalClose');
    
    // Folder modal
    const folderBtn = document.getElementById('folderBtn');
    const fileModal = document.getElementById('fileModal');
    const fileModalClose = document.getElementById('fileModalClose');
    const modalLoadBtn = document.getElementById('modalLoadBtn');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    
    // Tools modal
    const toolsBtn = document.getElementById('toolsBtn');
    const toolsModal = document.getElementById('toolsModal');
    const toolsModalClose = document.getElementById('toolsModalClose');
    const modalBrushBtn = document.getElementById('modalBrushBtn');
    const modalEraserBtn = document.getElementById('modalEraserBtn');
    const modalTextBtn = document.getElementById('modalTextBtn');
    // Effects modal
    const effectsBtn = document.getElementById('effectsBtn');
    const effectsModal = document.getElementById('effectsModal');
    const effectsModalClose = document.getElementById('effectsModalClose');
    const thresholdInput = document.getElementById('thresholdInput');
    const noiseInput = document.getElementById('noiseInput');
    const applyThresholdBtn = document.getElementById('applyThresholdBtn');
    const applyNoiseBtn = document.getElementById('applyNoiseBtn');

    // Multi-layer system
    let layers = [];
    let activeLayerId = 0;
    let layerIdCounter = 0;
    
    // Tool state
    let currentTool = 'brush'; // brush, eraser, text
    
    // Temp canvas for effects
    let tempCanvas = null;
    let tempCtx = null;
    
    // Initialize layers
    function createLayer(name, isBackground = false) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = canvas.width;
        layerCanvas.height = canvas.height;
        const layerCtx = layerCanvas.getContext('2d');
        
        if (isBackground) {
            layerCtx.fillStyle = '#000000';
            layerCtx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        return {
            id: layerIdCounter++,
            name: name,
            canvas: layerCanvas,
            ctx: layerCtx,
            visible: true,
            opacity: 1
        };
    }
    
    // Initialize with background and one layer
    layers.push(createLayer('Background', true));
    layers.push(createLayer('Layer 1'));
    activeLayerId = 1;
    
    function getActiveLayer() {
        return layers.find(layer => layer.id === activeLayerId);
    }
    
    function getActiveContext() {
        const layer = getActiveLayer();
        return layer ? layer.ctx : null;
    }

    // История
    let history = [];
    let historyIndex = -1;
    const MAX_HISTORY = 30;

    function saveState() {
        const state = layers.map(layer => ({
            id: layer.id,
            imageData: layer.ctx.getImageData(0, 0, canvas.width, canvas.height)
        }));
        history = history.slice(0, historyIndex + 1);
        history.push(state);
        if (history.length > MAX_HISTORY) history.shift();
        historyIndex = history.length - 1;
    }

    function restoreState(state) {
        state.forEach(layerState => {
            const layer = layers.find(l => l.id === layerState.id);
            if (layer) {
                layer.ctx.putImageData(layerState.imageData, 0, 0);
            }
        });
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
        
        layers.forEach(layer => {
            if (layer.visible) {
                ctx.globalAlpha = layer.opacity;
                ctx.drawImage(layer.canvas, 0, 0);
            }
        });
        
        ctx.globalAlpha = 1;
    }
    
    function updateLayersList() {
        layersList.innerHTML = '';
        layers.slice().reverse().forEach(layer => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (layer.id === activeLayerId) layerItem.classList.add('active');
            
            layerItem.innerHTML = `
                <span>${layer.name}</span>
                ${!layer.name.includes('Background') ? `<button class="layer-delete" data-layer-id="${layer.id}">×</button>` : ''}
            `;
            
            layerItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('layer-delete')) {
                    activeLayerId = layer.id;
                    updateLayersList();
                }
            });
            
            const deleteBtn = layerItem.querySelector('.layer-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteLayer(layer.id);
                });
            }
            
            layersList.appendChild(layerItem);
        });
    }
    
    function addLayer() {
        const newLayer = createLayer(`Layer ${layers.length}`);
        layers.push(newLayer);
        activeLayerId = newLayer.id;
        updateLayersList();
        saveState();
    }
    
    function deleteLayer(layerId) {
        if (layers.length <= 2) return; // Keep at least background and one layer
        
        const layerIndex = layers.findIndex(l => l.id === layerId);
        if (layerIndex !== -1 && !layers[layerIndex].name.includes('Background')) {
            layers.splice(layerIndex, 1);
            if (activeLayerId === layerId) {
                activeLayerId = layers[layers.length - 1].id; // Switch to top layer
            }
            updateLayersList();
            compositeLayers();
            saveState();
        }
    }

    
    let drawing = false;
    let lastX, lastY;
    
    // Для сглаживания линий
    let points = []; // Массив точек для сглаживания
    let smoothingFactor = 0.4; // Фактор сглаживания (0.0-1.0)
    const minDistance = 2; // Минимальное расстояние между точками

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const client = e.touches ? e.touches[0] : e;
        const x = (client.clientX - rect.left) * scaleX;
        const y = (client.clientY - rect.top) * scaleY;
        return { x: Math.max(0, Math.min(canvas.width, x)), y: Math.max(0, Math.min(canvas.height, y)) };
    }

    // Функция для сглаживания линии (Catmull-Rom spline)
    function smoothLine(points) {
        if (points.length < 3) return points;
        
        const smoothed = [];
        smoothed.push(points[0]); // Первая точка остается
        
        for (let i = 1; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[Math.min(points.length - 1, i + 1)];
            
            // Сглаженная точка
            const smoothedX = p1.x + (p2.x - p0.x) * smoothingFactor * 0.25;
            const smoothedY = p1.y + (p2.y - p0.y) * smoothingFactor * 0.25;
            
            smoothed.push({ x: smoothedX, y: smoothedY });
        }
        
        smoothed.push(points[points.length - 1]); // Последняя точка остается
        return smoothed;
    }

    // Функция для рисования плавной линии
    function drawSmoothLine(ctx, points) {
        if (points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        if (points.length === 2) {
            // Просто линия если 2 точки
            ctx.lineTo(points[1].x, points[1].y);
        } else {
            // Рисуем кривые Безье через точки
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            // Последний сегмент
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        }
        
        ctx.stroke();
    }

    // Проверка расстояния между точками
    function getDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function start(e) {
        e.preventDefault();
        let p = getPos(e);
        let actCtx;
        
        if (currentTool === 'text') {
            showTextModal(p.x, p.y);
            return;
        }
        
        drawing = true;
        points = [];
        points.push(p);
        lastX = p.x;
        lastY = p.y;
        
        actCtx = getActiveContext();
        if (actCtx) {
            actCtx.beginPath();
            actCtx.moveTo(p.x, p.y);
            
            if (currentTool === 'eraser') {
                actCtx.globalCompositeOperation = 'destination-out';
            } else {
                actCtx.globalCompositeOperation = 'source-over';
                actCtx.strokeStyle = colorPicker.value;
            }
            
            if (currentTool === 'eraser') {
                actCtx.lineWidth = parseInt(eraserSizeInput.value);
            } else {
                actCtx.lineWidth = parseInt(brushSizeInput.value);
            }
            actCtx.lineCap = 'round';
            actCtx.lineJoin = 'round';
        }
    }

    function move(e) {
        e.preventDefault();
        let p = getPos(e);
        let actCtx;
        
        if (!drawing) return;
        
        if (points.length === 0 || getDistance(points[points.length - 1], p) > minDistance) {
            points.push(p);
            
            actCtx = getActiveContext();
            if (!actCtx) return;
            
            if (currentTool === 'eraser') {
                actCtx.globalCompositeOperation = 'destination-out';
            } else {
                actCtx.globalCompositeOperation = 'source-over';
                actCtx.strokeStyle = colorPicker.value;
            }
            
            if (currentTool === 'eraser') {
                actCtx.lineWidth = parseInt(eraserSizeInput.value);
            } else {
                actCtx.lineWidth = parseInt(brushSizeInput.value);
            }
            actCtx.lineCap = 'round';
            actCtx.lineJoin = 'round';
            
            if (points.length >= 2) {
                const smoothedPoints = smoothLine(points);
                const drawPoints = smoothedPoints.slice(-3);
                
                if (drawPoints.length >= 2) {
                    actCtx.beginPath();
                    if (smoothedPoints.length > 3) {
                        const prevPoint = smoothedPoints[smoothedPoints.length - 4];
                        actCtx.moveTo(prevPoint.x, prevPoint.y);
                    } else {
                        actCtx.moveTo(drawPoints[0].x, drawPoints[0].y);
                    }
                    
                    for (let i = 0; i < drawPoints.length - 1; i++) {
                        const p1 = drawPoints[i];
                        const p2 = drawPoints[i + 1];
                        const xc = (p1.x + p2.x) / 2;
                        const yc = (p1.y + p2.y) / 2;
                        actCtx.quadraticCurveTo(p1.x, p1.y, xc, yc);
                    }
                    actCtx.stroke();
                }
            }
            compositeLayers();
        }
    }

    function stop(e) {
        e.preventDefault();
        
        if (drawing) {
            drawing = false;
            points = [];
            
            let actCtx = getActiveContext();
            if (actCtx) {
                actCtx.globalCompositeOperation = 'source-over';
            }
            
            saveState();
        }
    }
    
    // Text tool functions
    function showTextModal(x, y) {
        textModal.classList.add('active');
        textModal.dataset.x = x;
        textModal.dataset.y = y;
        canvasTextInput.value = '';
        canvasTextInput.focus();
    }
    
    function addText() {
        const text = canvasTextInput.value.trim();
        if (!text) return;
        
        const x = parseInt(textModal.dataset.x);
        const y = parseInt(textModal.dataset.y);
        const fontSize = parseInt(fontSizeInput.value);
        
        const actCtx = getActiveContext();
        if (actCtx) {
            actCtx.globalCompositeOperation = 'source-over';
            actCtx.fillStyle = colorPicker.value;
            actCtx.font = `${fontSize}px 'Tiny5', monospace`;
            actCtx.fillText(text, x, y);
            compositeLayers();
            saveState();
        }
        
        textModal.classList.remove('active');
    }
    
    // Tool switching
    function setTool(tool) {
        currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        
        if (tool === 'brush') {
            modalBrushBtn.classList.add('active');
        } else if (tool === 'eraser') {
            modalEraserBtn.classList.add('active');
        } else if (tool === 'text') {
            modalTextBtn.classList.add('active');
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
    eraserSizeInput.addEventListener('input', () => eraserSizeValue.textContent = eraserSizeInput.value);
    smoothingInput.addEventListener('input', () => {
        smoothingValue.textContent = smoothingInput.value;
        smoothingFactor = parseInt(smoothingInput.value) / 10; // Конвертируем 0-10 в 0.0-1.0
    });

    clearBtn.addEventListener('click', () => {
        const actCtx = getActiveContext();
        if (actCtx) {
            actCtx.clearRect(0, 0, canvas.width, canvas.height);
            compositeLayers();
            saveState();
        }
    });

    document.getElementById('loadImageBtn')?.addEventListener('click', () => {
        const dataURL = localStorage.getItem('morstrix_current_art');
        if (!dataURL) {
            alert('No saved image found');
            return;
        }
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            saveState();
        };
        img.src = dataURL;
    });
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

    
    // Layer event listeners
    addLayerBtn.addEventListener('click', addLayer);
    
    // Settings modal event listeners
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsModal.classList.toggle('active');
    });
    
    settingsModalClose.addEventListener('click', () => settingsModal.classList.remove('active'));
    
    // Close settings modal when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsModal.contains(e.target) && e.target !== settingsBtn) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Text modal event listeners
    textModalClose.addEventListener('click', () => textModal.classList.remove('active'));
    confirmTextBtn.addEventListener('click', addText);
    canvasTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addText();
    });
    
    // Folder modal event listeners
    folderBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileModal.classList.toggle('active');
    });
    fileModalClose.addEventListener('click', () => fileModal.classList.remove('active'));
    modalLoadBtn.addEventListener('click', () => {
        fileInput.click();
        fileModal.classList.remove('active');
    });
    modalSaveBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        localStorage.setItem('morstrix_current_art', dataURL);
        alert('✓ Image saved!');
        fileModal.classList.remove('active');
    });
    
    // Close file modal when clicking outside
    document.addEventListener('click', (e) => {
        if (!fileModal.contains(e.target) && e.target !== folderBtn) {
            fileModal.classList.remove('active');
        }
    });
    
    // Tools modal event listeners
    toolsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toolsModal.classList.toggle('active');
    });
    toolsModalClose.addEventListener('click', () => toolsModal.classList.remove('active'));
    modalBrushBtn.addEventListener('click', () => {
        setTool('brush');
        toolsModal.classList.remove('active');
    });
    modalEraserBtn.addEventListener('click', () => {
        setTool('eraser');
        toolsModal.classList.remove('active');
    });
    modalTextBtn.addEventListener('click', () => {
        setTool('text');
        toolsModal.classList.remove('active');
    });
    
    // Close tools modal when clicking outside
    document.addEventListener('click', (e) => {
        if (!toolsModal.contains(e.target) && e.target !== toolsBtn) {
            toolsModal.classList.remove('active');
        }
    });
    
    // Effects modal event listeners
    effectsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        effectsModal.classList.toggle('active');
    });
    effectsModalClose.addEventListener('click', () => effectsModal.classList.remove('active'));
    
    // Close effects modal when clicking outside
    document.addEventListener('click', (e) => {
        if (!effectsModal.contains(e.target) && e.target !== effectsBtn) {
            effectsModal.classList.remove('active');
        }
    });
    
    // Apply threshold effect
    applyThresholdBtn.addEventListener('click', () => {
        const actCtx = getActiveContext();
        const layer = getActiveLayer();
        if (!actCtx || !layer) {
            alert('No active layer!');
            return;
        }
        
        const threshold = parseInt(thresholdInput.value);
        const layerCanvas = layer.canvas;
        const imageData = actCtx.getImageData(0, 0, layerCanvas.width, layerCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = gray > threshold ? 255 : 0;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
        
        actCtx.putImageData(imageData, 0, 0);
        compositeLayers();
        saveState();
        effectsModal.classList.remove('active');
        alert('Threshold applied!');
    });
    
    // Apply noise effect
    applyNoiseBtn.addEventListener('click', () => {
        const actCtx = getActiveContext();
        const layer = getActiveLayer();
        if (!actCtx || !layer) {
            alert('No active layer!');
            return;
        }
        
        const noiseAmount = parseInt(noiseInput.value);
        const layerCanvas = layer.canvas;
        const imageData = actCtx.getImageData(0, 0, layerCanvas.width, layerCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseAmount * 2.55;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        
        actCtx.putImageData(imageData, 0, 0);
        compositeLayers();
        saveState();
        effectsModal.classList.remove('active');
        alert('Noise applied!');
    });
    
    fontSizeInput.addEventListener('input', () => {
        fontSizeValue.textContent = fontSizeInput.value;
    });

    closeBtn.addEventListener('click', () => {
        window.location.href = 'journal.html';
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
        else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    });

    // Initialize
    updateLayersList();
    setTool('brush');
    
    // Save initial state
    saveState();
});
