const WebApp = window.Telegram ? window.Telegram.WebApp : null;

const COLS = 10;
const ROWS = 20;
let BLOCK_SIZE = 25;
let DROP_SPEED = 1000;

// КРУТЫЕ ЦВЕТА С ТЕКСТУРОЙ - неоновые кристаллы
const PIECE_COLORS = [
    { main: '#c20000a7', light: '#6affd6', dark: '#0aaf66', name: 'cyber-teal' },     // бирюзовый
    { main: '#3f9d00d1', light: '#ffec84', dark: '#aa7a14', name: 'gold-core' },       // золотой
    { main: '#689ca4', light: '#7abeff', dark: '#1a4eaf', name: 'ice-blue' },        // ледяной синий
    { main: '#b600ca', light: '#ffac7a', dark: '#aa4a1a', name: 'ember-orange' },    // огненный оранжевый
    { main: '#7355c7ce', light: '#9a6aff', dark: '#3a1aaa', name: 'void-violet' }      // глубокий фиолетовый
];

// Создаем canvas с текстурой для блока
function createBlockTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Основной цвет
    ctx.fillStyle = color.main;
    ctx.fillRect(0, 0, 32, 32);
    
    // Градиентная подсветка сверху
    const gradTop = ctx.createLinearGradient(0, 0, 0, 16);
    gradTop.addColorStop(0, color.light);
    gradTop.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, 32, 16);
    
    // Затемнение снизу
    ctx.fillStyle = color.dark;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 24, 32, 8);
    ctx.globalAlpha = 1;
    
    // Пиксельная текстура "кристалл" - светлые точки
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    for(let i = 0; i < 12; i++) {
        const x = 4 + (i * 7) % 28;
        const y = 4 + Math.floor(i * 2.5) % 24;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Темные "трещины" (пиксельная текстура)
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.2;
    for(let i = 0; i < 8; i++) {
        const x = 8 + (i * 9) % 24;
        const y = 12 + (i * 4) % 16;
        ctx.fillRect(x, y, 1, 3);
        ctx.fillRect(x + 3, y + 2, 1, 2);
    }
    ctx.globalAlpha = 1;
    
    // Яркая обводка
    ctx.strokeStyle = color.light;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, 30, 30);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(2, 2, 28, 28);
    
    // Свечение по краям (пиксельный эффект)
    ctx.fillStyle = color.light;
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < 32; i++) {
        ctx.fillRect(i, 0, 1, 2);
        ctx.fillRect(i, 30, 1, 2);
        ctx.fillRect(0, i, 2, 1);
        ctx.fillRect(30, i, 2, 1);
    }
    ctx.globalAlpha = 1;
    
    return canvas;
}

// Кэш текстур
const textureCache = new Map();

function getBlockTexture(color) {
    const key = color.name;
    if (!textureCache.has(key)) {
        textureCache.set(key, createBlockTexture(color));
    }
    return textureCache.get(key);
}

let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let currentPiece, nextPiece;
let dropCounter = 0;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;
let score = 0;
let lines = 0;
let level = 1;
let gameSpeed = DROP_SPEED;
let isMobile = false;
let ghostAlpha = 0.2;

const PIECES = [
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
];

function init() {
    canvas = document.getElementById('tetris-canvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-piece-canvas');
    nextCtx = nextCanvas.getContext('2d');
    
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    for (let y = 0; y < ROWS; y++) {
        board[y] = Array(COLS).fill(0);
    }
    
    calculateCanvasSize();
    setupEvents();
    nextPiece = createRandomPiece();
    spawnPiece();
    updateUI();
    requestAnimationFrame(gameLoop);
    window.addEventListener('resize', calculateCanvasSize);
}

function calculateCanvasSize() {
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    const maxWidth = gameArea.clientWidth - 20;
    const maxHeight = Math.min(window.innerHeight * 0.6, 500);
    const blockByWidth = Math.floor(maxWidth / COLS);
    const blockByHeight = Math.floor(maxHeight / ROWS);
    BLOCK_SIZE = Math.min(blockByWidth, blockByHeight, 32);
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    draw();
}

function createRandomPiece() {
    const matrix = PIECES[Math.floor(Math.random() * PIECES.length)];
    const colorObj = PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
    return { 
        matrix, 
        color: colorObj,
        pos: { x: 0, y: 0 } 
    };
}

function rotate(matrix) {
    const N = matrix.length - 1;
    return matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
}

function checkCollision(piece) {
    if (!piece) return true;
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x]) {
                const boardX = piece.pos.x + x;
                const boardY = piece.pos.y + y;
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS || 
                    (boardY >= 0 && board[boardY] && board[boardY][boardX])) {
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
    nextPiece = createRandomPiece();
    currentPiece.pos = {
        x: Math.floor(COLS / 2) - Math.floor(currentPiece.matrix[0].length / 2),
        y: 0
    };
    drawNextPiece();
    if (checkCollision(currentPiece)) {
        isGameOver = true;
        setTimeout(() => {
            alert(`GAME OVER!\nSCORE: ${score}\nLINES: ${lines}\nLEVEL: ${level}`);
            location.reload();
        }, 500);
    }
}

function dropPiece() {
    if (isPaused || isGameOver || !currentPiece) return;
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
    if (isPaused || isGameOver || !currentPiece) return;
    let dropDistance = 0;
    while (!checkCollision(currentPiece)) {
        currentPiece.pos.y++;
        dropDistance++;
    }
    currentPiece.pos.y--;
    score += dropDistance * 2;
    mergePiece();
    clearLines();
    spawnPiece();
    updateUI();
}

function movePiece(dir) {
    if (isPaused || isGameOver || !currentPiece) return;
    currentPiece.pos.x += dir;
    if (checkCollision(currentPiece)) currentPiece.pos.x -= dir;
}

function rotatePiece() {
    if (isPaused || isGameOver || !currentPiece) return;
    const original = currentPiece.matrix;
    currentPiece.matrix = rotate(currentPiece.matrix);
    const kicks = [0, 1, -1, 2, -2];
    const originalX = currentPiece.pos.x;
    for (const kick of kicks) {
        currentPiece.pos.x = originalX + kick;
        if (!checkCollision(currentPiece)) return;
    }
    currentPiece.matrix = original;
    currentPiece.pos.x = originalX;
}

function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.textContent = isPaused ? '▶' : '⏸';
}

function mergePiece() {
    if (!currentPiece) return;
    currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = y + currentPiece.pos.y;
                const boardX = x + currentPiece.pos.x;
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared) {
        lines += linesCleared;
        score += [0, 100, 300, 500, 800][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        gameSpeed = Math.max(200, DROP_SPEED - (level - 1) * 80);
        updateUI();
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, 45, 45);
    if (!nextPiece) return;
    const size = Math.min(45 / nextPiece.matrix.length, 12);
    const offsetX = (45 - nextPiece.matrix[0].length * size) / 2;
    const offsetY = (45 - nextPiece.matrix.length * size) / 2;
    
    nextCtx.fillStyle = '#050510';
    nextCtx.fillRect(0, 0, 45, 45);
    
    nextPiece.matrix.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const texture = getBlockTexture(nextPiece.color);
                nextCtx.drawImage(texture, 0, 0, 32, 32, 
                    offsetX + x * size, offsetY + y * size, size, size);
            }
        });
    });
}

function drawBlock(x, y, colorObj, isGhost = false) {
    const texture = getBlockTexture(colorObj);
    const blockX = x * BLOCK_SIZE;
    const blockY = y * BLOCK_SIZE;
    
    if (isGhost) {
        ctx.globalAlpha = 0.25;
        ctx.drawImage(texture, 0, 0, 32, 32, blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        ctx.globalAlpha = 1;
        // Дополнительный контур призрака
        ctx.strokeStyle = colorObj.light;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        ctx.setLineDash([]);
    } else {
        ctx.drawImage(texture, 0, 0, 32, 32, blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        // Добавляем свечение
        ctx.shadowBlur = 12;
        ctx.shadowColor = colorObj.main;
        ctx.drawImage(texture, 0, 0, 32, 32, blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        ctx.shadowBlur = 0;
    }
}

function drawGhostPiece() {
    if (!currentPiece || isPaused || isGameOver) return;
    const ghost = { 
        matrix: currentPiece.matrix, 
        color: currentPiece.color, 
        pos: { ...currentPiece.pos } 
    };
    while (!checkCollision(ghost)) ghost.pos.y++;
    ghost.pos.y--;
    if (ghost.pos.y > currentPiece.pos.y) {
        ghost.matrix.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) drawBlock(x + ghost.pos.x, y + ghost.pos.y, ghost.color, true);
            });
        });
    }
}

function drawGrid() {
    ctx.strokeStyle = '#3a2a4a';
    ctx.lineWidth = 0.8;
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
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    
    drawGhostPiece();
    
    if (currentPiece) {
        currentPiece.matrix.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) drawBlock(x + currentPiece.pos.x, y + currentPiece.pos.y, currentPiece.color);
            });
        });
    }
    
    if (isPaused) {
        ctx.fillStyle = 'rgba(5, 5, 20, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#b87cff';
        ctx.font = `bold ${BLOCK_SIZE * 1.2}px 'Press Start 2P'`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#b87cff';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
    }
}

function setupEvents() {
    document.getElementById('left-btn').addEventListener('click', () => { movePiece(-1); draw(); });
    document.getElementById('rotate-btn').addEventListener('click', () => { rotatePiece(); draw(); });
    document.getElementById('right-btn').addEventListener('click', () => { movePiece(1); draw(); });
    document.getElementById('down-btn').addEventListener('click', () => { hardDrop(); draw(); });
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    document.addEventListener('keydown', e => {
        if (isGameOver) return;
        switch(e.key) {
            case 'ArrowLeft': movePiece(-1); draw(); break;
            case 'ArrowRight': movePiece(1); draw(); break;
            case 'ArrowDown': dropPiece(); draw(); break;
            case 'ArrowUp': rotatePiece(); draw(); break;
            case ' ': hardDrop(); draw(); break;
            case 'p': case 'P': case 'Escape': togglePause(); break;
        }
    });
}

function gameLoop(time) {
    if (isGameOver) return;
    const delta = time - (lastTime || time);
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

window.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));