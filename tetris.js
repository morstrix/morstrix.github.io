// ==================== TETRIS GAME LOGIC + FIREBASE HIGH SCORES ====================

const COLS = 16;
const ROWS = 22;
let BLOCK_SIZE = 30;
const BASE_SPEED = 1000;

let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let currentPiece, nextPiece;
let dropCounter = 0;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;
let score = 0;
let gameSpeed = BASE_SPEED;

const COLORS = ['#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a', '#858585', '#707070', '#5f5f5f', '#4f4f4f'];
const PIECES = [
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,1,0],[0,1,0],[0,1,1]],
    [[0,1,0],[0,1,0],[1,1,0]],
    [[0,1,1],[1,1,0],[0,0,0]],
    [[1,1,0],[0,1,1],[0,0,0]]
];

function init() {
    canvas = document.getElementById('tetris-canvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-piece-canvas');
    nextCtx = nextCanvas.getContext('2d');
    
    for (let y = 0; y < ROWS; y++) {
        board[y] = Array(COLS).fill(0);
    }
    
    calcCanvasSize();
    setupEvents();
    nextPiece = randomPiece();
    spawnPiece();
    updateUI();
    requestAnimationFrame(gameLoop);
    window.addEventListener('resize', calcCanvasSize);
}

function calcCanvasSize() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    
    let blockW = Math.floor(maxWidth / COLS);
    let blockH = Math.floor(maxHeight / ROWS);
    
    let maxBlockSize = 26;
    if (window.innerWidth > 700) maxBlockSize = 34;
    
    BLOCK_SIZE = Math.min(blockW, blockH, maxBlockSize);
    if (BLOCK_SIZE < 10) BLOCK_SIZE = 10;
    
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    draw();
}

function randomPiece() {
    const matrix = PIECES[Math.floor(Math.random() * PIECES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { matrix, color, pos: { x: 0, y: 0 } };
}

function rotateMatrix(matrix) {
    const n = matrix.length - 1;
    return matrix.map((row, i) => row.map((_, j) => matrix[n - j][i]));
}

function checkCollision(piece) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x]) {
                const bx = piece.pos.x + x;
                const by = piece.pos.y + y;
                if (bx < 0 || bx >= COLS || by >= ROWS || (by >= 0 && board[by][bx])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function spawnPiece() {
    if (isGameOver) return;
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    currentPiece.pos = { 
        x: Math.floor(COLS / 2) - Math.floor(currentPiece.matrix[0].length / 2), 
        y: 0 
    };
    drawNext();
    if (checkCollision(currentPiece)) {
        isGameOver = true;
        saveHighScore(score);
        setTimeout(() => { 
            alert(`GAME OVER\nSCORE: ${score}`); 
            location.reload(); 
        }, 300);
    }
}

function dropPiece() {
    if (isPaused || isGameOver) return;
    currentPiece.pos.y++;
    if (checkCollision(currentPiece)) {
        currentPiece.pos.y--;
        mergePiece();
        clearLines();
        spawnPiece();
    }
    dropCounter = 0;
}

function hardDrop() {
    if (isPaused || isGameOver) return;
    let dist = 0;
    while (!checkCollision(currentPiece)) {
        currentPiece.pos.y++;
        dist++;
    }
    currentPiece.pos.y--;
    score += dist * 2;
    mergePiece();
    clearLines();
    spawnPiece();
    updateUI();
}

function movePiece(dir) {
    if (isPaused || isGameOver) return;
    currentPiece.pos.x += dir;
    if (checkCollision(currentPiece)) {
        currentPiece.pos.x -= dir;
    }
    draw();
}

function rotatePiece() {
    if (isPaused || isGameOver) return;
    const original = currentPiece.matrix;
    currentPiece.matrix = rotateMatrix(currentPiece.matrix);
    const kicks = [0, 1, -1, 2, -2];
    const origX = currentPiece.pos.x;
    
    for (const kick of kicks) {
        currentPiece.pos.x = origX + kick;
        if (!checkCollision(currentPiece)) {
            draw();
            return;
        }
    }
    
    currentPiece.matrix = original;
    currentPiece.pos.x = origX;
    draw();
}

function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('pause-btn');
    if (btn) {
        btn.innerHTML = isPaused ? '▶ PLAY' : '⏸ PAUSE';
    }
    draw();
}

function mergePiece() {
    currentPiece.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                const by = y + currentPiece.pos.y;
                const bx = x + currentPiece.pos.x;
                if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                    board[by][bx] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            y++;
        }
    }
    if (cleared) {
        score += [0, 100, 300, 500, 800][cleared];
        updateUI();
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
}

function drawNext() {
    nextCtx.fillStyle = '#0a0a0a';
    nextCtx.fillRect(0, 0, 50, 50);
    if (!nextPiece) return;
    
    const size = Math.min(50 / nextPiece.matrix.length, 14);
    const offX = (50 - nextPiece.matrix[0].length * size) / 2;
    const offY = (50 - nextPiece.matrix.length * size) / 2;
    
    nextPiece.matrix.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                nextCtx.fillStyle = nextPiece.color;
                nextCtx.fillRect(offX + x * size, offY + y * size, size - 0.5, size - 0.5);
                nextCtx.strokeStyle = '#333';
                nextCtx.strokeRect(offX + x * size, offY + y * size, size, size);
            }
        });
    });
}

function drawBlock(x, y, color) {
    const bx = x * BLOCK_SIZE;
    const by = y * BLOCK_SIZE;
    ctx.fillStyle = '#79434a';
    ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#010101';
    ctx.lineWidth = 1;
    if (Math.random() > 0.3) {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + BLOCK_SIZE, by);
        ctx.stroke();
    }
    if (Math.random() > 0.4) {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by + BLOCK_SIZE);
        ctx.stroke();
    }
    if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.moveTo(bx + BLOCK_SIZE, by);
        ctx.lineTo(bx + BLOCK_SIZE, by + BLOCK_SIZE);
        ctx.stroke();
    }
    if (Math.random() > 0.35) {
        ctx.beginPath();
        ctx.moveTo(bx, by + BLOCK_SIZE);
        ctx.lineTo(bx + BLOCK_SIZE, by + BLOCK_SIZE);
        ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
        if (Math.random() > 0.7) {
            const px = bx + Math.random() * BLOCK_SIZE;
            const py = by + Math.random() * BLOCK_SIZE;
            ctx.fillStyle = '#010101';
            ctx.fillRect(px, py, 1, 1);
        }
    }
}

function drawGhost() {
    if (!currentPiece || isPaused || isGameOver) return;
    const ghost = { matrix: currentPiece.matrix, color: currentPiece.color, pos: { ...currentPiece.pos } };
    while (!checkCollision(ghost)) ghost.pos.y++;
    ghost.pos.y--;
    if (ghost.pos.y > currentPiece.pos.y) {
        ctx.globalAlpha = 0.25;
        ghost.matrix.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) drawBlock(x + ghost.pos.x, y + ghost.pos.y, ghost.color);
            });
        });
        ctx.globalAlpha = 1;
    }
}

function drawGrid() {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) drawBlock(x, y, board[y][x]);
        }
    }
    drawGhost();
    if (currentPiece) {
        currentPiece.matrix.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) drawBlock(x + currentPiece.pos.x, y + currentPiece.pos.y, currentPiece.color);
            });
        });
    }
    if (isPaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#aaa';
        ctx.font = `${Math.max(12, BLOCK_SIZE)}px 'Press Start 2P'`;
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#aaa';
        ctx.font = `${Math.max(10, BLOCK_SIZE * 0.8)}px 'Press Start 2P'`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
}

function setupEvents() {
    document.getElementById('left-btn').onclick = () => movePiece(-1);
    document.getElementById('rotate-btn').onclick = () => rotatePiece();
    document.getElementById('right-btn').onclick = () => movePiece(1);
    document.getElementById('down-btn').onclick = () => hardDrop();
    document.getElementById('pause-btn').onclick = togglePause;
    document.addEventListener('keydown', (e) => {
        if (isGameOver) return;
        switch(e.key) {
            case 'ArrowLeft': e.preventDefault(); movePiece(-1); break;
            case 'ArrowRight': e.preventDefault(); movePiece(1); break;
            case 'ArrowDown': e.preventDefault(); dropPiece(); draw(); break;
            case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
            case ' ': e.preventDefault(); hardDrop(); break;
            case 'p': case 'P': e.preventDefault(); togglePause(); break;
        }
        draw();
    });
}

function gameLoop(time) {
    if (isGameOver) return;
    const delta = time - lastTime;
    lastTime = time;
    if (!isPaused) {
        dropCounter += delta;
        if (dropCounter > gameSpeed) {
            dropPiece();
            draw();
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// ========== СОХРАНЕНИЕ РЕКОРДОВ В FIREBASE ==========
async function saveHighScore(finalScore) {
    if (finalScore === 0) return;
    
    let playerName = prompt('Введите ваше имя (макс 10 символов):', 'ANON');
    if (!playerName) playerName = 'ANON';
    playerName = playerName.slice(0, 10);
    
    // Проверяем, загружен ли Firebase
    if (!window.addDoc || !window.collection || !window.db) {
        console.error('Firebase не загружен');
        alert('Ошибка: Firebase не инициализирован. Обновите страницу.');
        return;
    }
    
    try {
        await window.addDoc(window.collection(window.db, 'tetris_scores'), {
            name: playerName,
            score: finalScore,
            timestamp: Date.now()
        });
        alert(`Рекорд ${finalScore} сохранён!`);
    } catch (error) {
        console.error('Ошибка сохранения в Firebase:', error);
        alert('Не удалось сохранить рекорд. Проверьте интернет.');
    }
}