import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
    authDomain: "helper-e10b2.firebaseapp.com",
    projectId: "helper-e10b2",
    storageBucket: "helper-e10b2.firebasestorage.app",
    messagingSenderId: "131536876451",
    appId: "1:131536876451:web:eeaef494c83dfc4849e016"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-piece-canvas');
    const nCtx = nextCanvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let animationId = null;
    let gameActive = true;
    let glitchTimeout = null;

    const COLS = 14;
    const ROWS = 20;

    const colors = [null, '#6b3a4d', '#c47a8a', '#5a2a3a', '#7a4a5a', '#c4a4a4', '#5a5a5a', '#8a5a6a'];

    function resize() {
        const container = canvas.parentElement;
        if (!container) return;
        const maxWidth = container.clientWidth - 20;
        const cellSize = Math.floor(maxWidth / COLS);
        canvas.width = cellSize * COLS;
        canvas.height = cellSize * ROWS;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(cellSize, cellSize);

        const nextSize = Math.max(14, cellSize * 0.6);
        nextCanvas.width = nextSize * 4;
        nextCanvas.height = nextSize * 4;
        nCtx.setTransform(1, 0, 0, 1, 0, 0);
        nCtx.scale(nextSize, nextSize);
    }

    function createPiece(t) {
        if (t === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
        if (t === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
        if (t === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
        if (t === 'O') return [[4,4],[4,4]];
        if (t === 'Z') return [[5,5,0],[0,5,5],[0,0,0]];
        if (t === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
        if (t === 'T') return [[0,7,0],[7,7,7],[0,0,0]];
    }

    function drawMatrix(m, o, context) {
        m.forEach((row, y) => {
            row.forEach((v, x) => {
                if (v !== 0) {
                    context.fillStyle = colors[v];
                    context.fillRect(x + o.x, y + o.y, 1, 1);
                }
            });
        });
    }

    function draw() {
        if (!gameActive) return;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(arena, {x:0, y:0}, ctx);

        const ghost = { pos: {x: player.pos.x, y: player.pos.y}, matrix: player.matrix };
        while (!collide(arena, ghost)) ghost.pos.y++;
        ghost.pos.y--;
        ctx.save();
        ctx.globalAlpha = 0.25;
        drawMatrix(ghost.matrix, ghost.pos, ctx);
        ctx.restore();

        drawMatrix(player.matrix, player.pos, ctx);

        nCtx.fillStyle = '#000';
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (player.next) {
            const offX = (4 - player.next[0].length)/2;
            const offY = (4 - player.next.length)/2;
            drawMatrix(player.next, {x: offX, y: offY}, nCtx);
        }
    }

    const arena = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    const player = { pos: {x:0, y:0}, matrix: null, next: null, score: 0 };

    function collide(a, p) {
        const [m, o] = [p.matrix, p.pos];
        for (let y=0; y<m.length; y++) {
            for (let x=0; x<m[y].length; x++) {
                if (m[y][x] !== 0) {
                    if (!a[y+o.y] || a[y+o.y][x+o.x] !== 0) return true;
                }
            }
        }
        return false;
    }

    function merge(a, p) {
        p.matrix.forEach((row, y) => {
            row.forEach((v, x) => {
                if (v !== 0 && a[y+p.pos.y] && a[y+p.pos.y][x+p.pos.x] !== undefined) {
                    a[y+p.pos.y][x+p.pos.x] = v;
                }
            });
        });
    }

    function rotate(matrix) {
        return matrix[0].map((_, idx) => matrix.map(row => row[idx]).reverse());
    }

    function arenaSweep() {
        let rowsCleared = 0;
        for (let y=arena.length-1; y>=0; y--) {
            let full = true;
            for (let x=0; x<arena[y].length; x++) {
                if (arena[y][x] === 0) { full=false; break; }
            }
            if (full) {
                arena.splice(y,1);
                arena.unshift(Array(COLS).fill(0));
                y++;
                rowsCleared++;
            }
        }
        if (rowsCleared > 0) {
            const points = [0,10,30,60,100];
            player.score += points[Math.min(rowsCleared,4)];
            scoreElement.innerText = player.score;
        }
    }

    function applyGlitch() {
        if (glitchTimeout) clearTimeout(glitchTimeout);
        const canvasEl = document.getElementById('tetris-canvas');
        if (!canvasEl) return;
        canvasEl.style.filter = 'blur(2px) contrast(150%) hue-rotate(270deg) brightness(1.2)';
        canvasEl.style.transform = 'translate(1px, -1px)';
        glitchTimeout = setTimeout(() => {
            canvasEl.style.filter = 'none';
            canvasEl.style.transform = 'none';
        }, 100);
    }

    function playerDrop() {
        if (!gameActive) return;
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            applyGlitch();
            merge(arena, player);
            playerReset();
            arenaSweep();
        }
        dropCounter = 0;
    }

    function hardDrop() {
        if (!gameActive) return;
        while (!collide(arena, player)) player.pos.y++;
        player.pos.y--;
        applyGlitch();
        merge(arena, player);
        playerReset();
        arenaSweep();
    }

    function getRandomPiece() {
        const pieces = 'ILJOTSZ';
        return createPiece(pieces[Math.floor(Math.random()*pieces.length)]);
    }

    function getRandomStartX(matrix) {
        const maxX = COLS - matrix[0].length;
        return Math.floor(Math.random() * (maxX + 1));
    }

    function playerReset() {
        if (!gameActive) return;
        player.matrix = player.next || getRandomPiece();
        player.next = getRandomPiece();
        player.pos.y = 0;
        player.pos.x = getRandomStartX(player.matrix);
        if (collide(arena, player)) gameOver();
    }

    // ========== КЛИК ТОЛЬКО ПО ПАДАЮЩЕМУ БЛОКУ ==========
    function isPointInFallingBlock(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;
        
        const cellSizeX = canvas.width / COLS;
        const cellSizeY = canvas.height / ROWS;
        
        const col = Math.floor(canvasX / cellSizeX);
        const row = Math.floor(canvasY / cellSizeY);
        
        // Проверяем, попадает ли точка в текущий падающий блок
        const matrix = player.matrix;
        const pos = player.pos;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const blockCol = pos.x + x;
                    const blockRow = pos.y + y;
                    if (blockRow === row && blockCol === col) {
                        return { x: x, y: y, value: matrix[y][x] };
                    }
                }
            }
        }
        return null;
    }

    function destroyFallingBlock(blockInfo) {
        if (!gameActive) return;
        if (!blockInfo) return;
        
        // Удаляем клетку из падающей фигуры
        player.matrix[blockInfo.y][blockInfo.x] = 0;
        
        // Добавляем очки
        player.score += 10;
        scoreElement.innerText = player.score;
        
        // Glitch эффект
        applyGlitch();
        
        // Если вся фигура пустая — создаём новую
        let hasBlocks = false;
        for (let y = 0; y < player.matrix.length; y++) {
            for (let x = 0; x < player.matrix[y].length; x++) {
                if (player.matrix[y][x] !== 0) {
                    hasBlocks = true;
                    break;
                }
            }
        }
        
        if (!hasBlocks) {
            // Фигура полностью рассыпалась — сразу спавним новую
            playerReset();
            arenaSweep();
        }
        
        draw();
    }

    // Обработчик клика по канвасу — только по падающему блоку
    canvas.addEventListener('click', (e) => {
        if (!gameActive) return;
        const hit = isPointInFallingBlock(e.clientX, e.clientY);
        if (hit) {
            destroyFallingBlock(hit);
        }
    });

    // Для тач-устройств
    canvas.addEventListener('touchstart', (e) => {
        if (!gameActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        const hit = isPointInFallingBlock(touch.clientX, touch.clientY);
        if (hit) {
            destroyFallingBlock(hit);
        }
    });

    async function gameOver() {
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        const finalScore = player.score;
        showScoreModal(finalScore);
    }

    function showScoreModal(score) {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'modal-overlay';
        modalDiv.innerHTML = `
            <div class="score-modal">
                <div class="modal-header">
                    <span class="modal-title-text">✦ GAME OVER ✦</span>
                    <button class="modal-close-btn" id="modalCloseBtn">✜</button>
                </div>
                <div class="modal-inner">
                    <p>SCORE: ${score}</p>
                    <input type="text" id="playerName" maxlength="12" placeholder="ENTER NAME" autocomplete="off">
                    <button id="saveScoreBtn">SAVE</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        const closeBtn = modalDiv.querySelector('#modalCloseBtn');
        const saveBtn = modalDiv.querySelector('#saveScoreBtn');
        const input = modalDiv.querySelector('#playerName');

        const closeModal = () => modalDiv.remove();
        closeBtn.onclick = closeModal;
        modalDiv.onclick = (e) => { if (e.target === modalDiv) closeModal(); };

        saveBtn.onclick = async () => {
            let name = input.value.trim();
            if (name === '') name = 'ANON';
            if (name.length > 12) name = name.slice(0,12);
            try {
                await addDoc(collection(db, "top_players"), {
                    name: name,
                    score: score,
                    date: new Date().toISOString()
                });
                console.log('Saved!', name, score);
            } catch(e) { console.error('Firestore error:', e); }
            closeModal();
            resetGame();
        };
        input.onkeypress = (e) => { if (e.key === 'Enter') saveBtn.click(); };
        input.focus();
    }

    function resetGame() {
        for (let y=0; y<arena.length; y++) {
            for (let x=0; x<arena[y].length; x++) arena[y][x]=0;
        }
        player.score = 0;
        scoreElement.innerText = '0';
        gameActive = true;
        player.next = getRandomPiece();
        playerReset();
        startGameLoop();
    }

    let dropCounter = 0, lastTime = 0;
    function startGameLoop() {
        if (animationId) cancelAnimationFrame(animationId);
        function update(time=0) {
            if (!gameActive) return;
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            if (dropCounter > 500) { playerDrop(); dropCounter = 0; }
            draw();
            animationId = requestAnimationFrame(update);
        }
        lastTime = 0;
        animationId = requestAnimationFrame(update);
    }

    document.getElementById('left-btn').onclick = () => {
        if (!gameActive) return;
        player.pos.x--;
        if (collide(arena, player)) player.pos.x++;
        draw();
    };
    document.getElementById('right-btn').onclick = () => {
        if (!gameActive) return;
        player.pos.x++;
        if (collide(arena, player)) player.pos.x--;
        draw();
    };
    document.getElementById('rotate-btn').onclick = () => {
        if (!gameActive) return;
        const rotated = rotate(player.matrix);
        const old = player.matrix;
        player.matrix = rotated;
        if (collide(arena, player)) player.matrix = old;
        draw();
    };
    document.getElementById('down-btn').onclick = (e) => {
        e.preventDefault();
        if (!gameActive) return;
        hardDrop();
    };

    window.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        switch(e.key) {
            case 'ArrowLeft': document.getElementById('left-btn').click(); break;
            case 'ArrowRight': document.getElementById('right-btn').click(); break;
            case 'ArrowUp': document.getElementById('rotate-btn').click(); break;
            case 'ArrowDown': document.getElementById('down-btn').click(); break;
            case ' ': case 'Space': e.preventDefault(); hardDrop(); break;
        }
    });

    window.addEventListener('resize', () => { resize(); draw(); });
    resize();
    player.next = getRandomPiece();
    playerReset();
    startGameLoop();
});