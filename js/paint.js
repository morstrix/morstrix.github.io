document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clearCanvasBtn');
    const fileInput = document.getElementById('imageLoader');
    const saveBtn = document.getElementById('saveCanvasBtn');
    const msgDiv = document.getElementById('saveMessage');

    // Инициализация
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;

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

    function start(e) { e.preventDefault(); drawing = true; ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); ctx.strokeStyle = colorPicker.value; }
    function move(e) { e.preventDefault(); if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    function stop(e) { e.preventDefault(); drawing = false; ctx.beginPath(); }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseleave', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', stop);
    canvas.addEventListener('touchcancel', stop);

    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    document.querySelector('label.universal-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const w = img.width * scale, h = img.height * scale;
                const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, w, h);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
    });

    saveBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        localStorage.setItem('morstrix_current_art', dataURL);
        msgDiv.textContent = '✓ СОХРАНЕНО! Вернитесь в журнал.';
        setTimeout(() => msgDiv.textContent = '', 3000);
    });
});
