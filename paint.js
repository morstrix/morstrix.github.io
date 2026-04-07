document.addEventListener('DOMContentLoaded', () => {
    const layer1 = document.getElementById('layer1');
    const layer2 = document.getElementById('layer2');
    const container = document.getElementById('paintArea');
    const colorPicker = document.getElementById('pColor');
    const artPreview = document.getElementById('artPreview');
    const layersPopup = document.getElementById('layersPopup');
    
    if (!layer1 || !layer2 || !container) return;

    const ctx1 = layer1.getContext('2d');
    const ctx2 = layer2.getContext('2d');
    
    let activeCtx = ctx2; 
    let drawing = false;
    let history = [];
    let step = -1;

    function init() {
        const rect = container.getBoundingClientRect();
        layer1.width = layer2.width = rect.width;
        layer1.height = layer2.height = rect.height;
        
        ctx1.fillStyle = '#000000';
        ctx1.fillRect(0, 0, layer1.width, layer1.height);
        ctx2.lineCap = 'round';
        ctx2.lineJoin = 'round';
        saveState();
    }

    function saveState() {
        step++;
        if (step < history.length) history.length = step;
        history.push({
            l1: layer1.toDataURL(),
            l2: layer2.toDataURL()
        });
        updatePreview();
    }

    function updatePreview() {
        const temp = document.createElement('canvas');
        temp.width = layer1.width; temp.height = layer1.height;
        const tCtx = temp.getContext('2d');
        tCtx.drawImage(layer1, 0, 0);
        tCtx.drawImage(layer2, 0, 0);
        if (artPreview) artPreview.src = temp.toDataURL();
    }

    const getPos = (e) => {
        const rect = container.getBoundingClientRect();
        const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
        const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e) => {
        drawing = true;
        const pos = getPos(e);
        activeCtx.beginPath();
        activeCtx.moveTo(pos.x, pos.y);
        if (e.touches) e.preventDefault();
    };

    const move = (e) => {
        if (!drawing) return;
        if (e.touches) e.preventDefault();
        const pos = getPos(e);
        activeCtx.lineTo(pos.x, pos.y);
        activeCtx.strokeStyle = colorPicker.value || '#a27791';
        activeCtx.lineWidth = 5;
        activeCtx.stroke();
    };

    const stop = () => {
        if (drawing) {
            drawing = false;
            saveState();
        }
    };

    container.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    container.addEventListener('touchstart', start, {passive: false});
    window.addEventListener('touchmove', move, {passive: false});
    window.addEventListener('touchend', stop);

    // Кнопка UNDO (Назад)
    document.getElementById('pUndo').onclick = () => {
        if (step > 0) {
            step--;
            const img1 = new Image(), img2 = new Image();
            img1.onload = () => { ctx1.clearRect(0,0,layer1.width,layer1.height); ctx1.drawImage(img1,0,0); };
            img2.onload = () => { ctx2.clearRect(0,0,layer2.width,layer2.height); ctx2.drawImage(img2,0,0); updatePreview(); };
            img1.src = history[step].l1;
            img2.src = history[step].l2;
        }
    };

    document.getElementById('pClear').onclick = () => {
        ctx2.clearRect(0,0,layer2.width,layer2.height);
        saveState();
    };

    // Переключение КАНАЛОВ
    document.getElementById('btnLayersOpen').onclick = () => {
        layersPopup.style.display = layersPopup.style.display === 'block' ? 'none' : 'block';
    };

    document.querySelectorAll('.layer-row').forEach(row => {
        row.onclick = () => {
            document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            activeCtx = (row.dataset.id === "1") ? ctx1 : ctx2;
            layersPopup.style.display = 'none';
        };
    });

    init();
});