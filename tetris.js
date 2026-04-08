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
    let fallAnimation = null;

    const COLS = 14;
    const ROWS = 20;

    // Плавное падение
    let smoothY = 0;           // плавная Y-позиция (в клетках)
    let targetY = 0;           // целевая Y-позиция
    let isAnimating = false;    // идёт ли анимация падения

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

    function drawMatrix(m, o, context, alpha = 1, yOffset = 0) {
        context.save();
        if (alpha < 1) context.globalAlpha = alpha;
        m.forEach((row, y) => {
            row.forEach((v, x) => {
                if (v !== 0) {
                    context.fillStyle = colors[v];
                    context.fillRect(x + o.x, y + o.y + yOffset, 1, 1);
                }
            });
        });
        context.restore();
    }

    function draw() {
        if (!gameActive) return;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(arena, {x:0, y:0}, ctx);

        // Призрак (показываем на целевой позиции)
        const ghost = { pos: {x: player.pos.x, y: targetY}, matrix: player.matrix };
        let ghostY = targetY;
        while (!collideArena(arena, ghost.matrix, ghost.pos.x, ghostY + 1)) {
            ghostY++;
        }
        ctx.save();
        ctx.globalAlpha = 0.25;
        drawMatrix(ghost.matrix, {x: player.pos.x, y: ghostY}, ctx);
        ctx.restore();

        // Падающий блок с плавной Y-позицией
        const yOffset = smoothY - player.pos.y;
        drawMatrix(player.matrix, {x: player.pos.x, y: player.pos.y}, ctx, 1, yOffset);

        nCtx.fillStyle = '#000';
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (player.next) {
            const offX = (4 - player.next[0].length)/2;
            const offY = (4 - player.next.length)/2;
            drawMatrix(player.next, {x: offX, y: offY}, nCtx);
        }
    }

    function collideArena(arena, matrix, posX, posY) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const arenaY = Math.floor(posY) + y;
                    const arenaX = posX + x;
                    if (arenaY >= ROWS || arenaY < 0 || arenaX >= COLS || arenaX < 0) return true;
                    if (arenaY >= 0 && arena[arenaY][arenaX] !== 0) return true;
                }
            }
        }
        return false;
    }

    const arena = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    const player = { 
        pos: {x: 0, y: 0}, 
        matrix: null, 
        next: null, 
        score: 0
    };

    function mergeToArena() {
        for (let y = 0; y < player.matrix.length; y++) {
            for (let x = 0; x < player.matrix[y].length; x++) {
                if (player.matrix[y][x] !== 0) {
                    const arenaY = targetY + y;
                    const arenaX = player.pos.x + x;
                    if (arenaY >= 0 && arenaY < ROWS && arenaX >= 0 && arenaX < COLS) {
                        arena[arenaY][arenaX] = player.matrix[y][x];
                    }
                }
            }
        }
    }

    function rotate(matrix) {
        return matrix[0].map((_, idx) => matrix.map(row => row[idx]).reverse());
    }

    function arenaSweep() {
        let rowsCleared = 0;
        for (let y = arena.length - 1; y >= 0; y--) {
            let full = true;
            for (let x = 0; x < arena[y].length; x++) {
                if (arena[y][x] === 0) { full = false; break; }
            }
            if (full) {
                arena.splice(y, 1);
                arena.unshift(Array(COLS).fill(0));
                y++;
                rowsCleared++;
            }
        }
        if (rowsCleared > 0) {
            const points = [0, 10, 30, 60, 100];
            player.score += points[Math.min(rowsCleared, 4)];
            scoreElement.innerText = player.score;
        }
    }

    // Анимация плавного падения
    function startSmoothDrop() {
        if (isAnimating) return;
        isAnimating = true;
        
        function animate() {
            if (!gameActive) return;
            if (Math.abs(smoothY - targetY) < 0.05) {
                smoothY = targetY;
                isAnimating = false;
                draw();
                return;
            }
            // Плавное движение (easing)
            smoothY += (targetY - smoothY) * 0.25;
            draw();
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    function playerDrop() {
        if (!gameActive) return;
        
        const newY = targetY + 1;
        if (!collideArena(arena, player.matrix, player.pos.x, newY)) {
            targetY = newY;
            startSmoothDrop();
        } else {
            // Блок приземлился
            mergeToArena();
            playerReset();
            arenaSweep();
            smoothY = targetY;
        }
        dropCounter = 0;
    }

    function hardDrop() {
        if (!gameActive) return;
        while (!collideArena(arena, player.matrix, player.pos.x, targetY + 1)) {
            targetY++;
        }
        smoothY = targetY;
        mergeToArena();
        playerReset();
        arenaSweep();
    }

    function getRandomPiece() {
        const pieces = 'ILJOTSZ';
        return createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
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
        targetY = 0;
        smoothY = 0;
        isAnimating = false;
        if (collideArena(arena, player.matrix, player.pos.x, targetY)) {
            gameOver();
        }
        draw();
    }

    // Тап по падающему блоку — рассыпается
    function isTapOnFallingBlock(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;
        
        const cellSizeX = canvas.width / COLS;
        const cellSizeY = canvas.height / ROWS;
        
        const col = Math.floor(canvasX / cellSizeX);
        const row = Math.floor(canvasY / cellSizeY);
        
        const matrix = player.matrix;
        const posX = player.pos.x;
        const posY = smoothY;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const blockCol = posX + x;
                    const blockRow = Math.floor(posY) + y;
                    if (blockRow === row && blockCol === col) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function destroyWholeFallingBlock() {
        if (!gameActive) return;
        
        let blockCount = 0;
        for (let y = 0; y < player.matrix.length; y++) {
            for (let x = 0; x < player.matrix[y].length; x++) {
                if (player.matrix[y][x] !== 0) blockCount++;
            }
        }
        
        player.score += blockCount * 10;
        scoreElement.innerText = player.score;
        
        // Сразу спавним новый блок
        player.matrix = player.next || getRandomPiece();
        player.next = getRandomPiece();
        player.pos.x = getRandomStartX(player.matrix);
        targetY = 0;
        smoothY = 0;
        isAnimating = false;
        
        if (collideArena(arena, player.matrix, player.pos.x, targetY)) {
            gameOver();
        }
        draw();
    }

    canvas.addEventListener('click', (e) => {
        if (!gameActive) return;
        if (isTapOnFallingBlock(e.clientX, e.clientY)) {
            destroyWholeFallingBlock();
        }
    });

    canvas.addEventListener('touchstart', (e) => {
        if (!gameActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        if (isTapOnFallingBlock(touch.clientX, touch.clientY)) {
            destroyWholeFallingBlock();
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
        for (let y = 0; y < arena.length; y++) {
            for (let x = 0; x < arena[y].length; x++) arena[y][x] = 0;
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
        function update(time = 0) {
            if (!gameActive) return;
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            if (dropCounter > 500) {
                playerDrop();
                dropCounter = 0;
            }
            draw();
            animationId = requestAnimationFrame(update);
        }
        lastTime = 0;
        animationId = requestAnimationFrame(update);
    }

    document.getElementById('left-btn').onclick = () => {
        if (!gameActive) return;
        const newX = player.pos.x - 1;
        if (!collideArena(arena, player.matrix, newX, targetY)) {
            player.pos.x = newX;
            draw();
        }
    };
    document.getElementById('right-btn').onclick = () => {
        if (!gameActive) return;
        const newX = player.pos.x + 1;
        if (!collideArena(arena, player.matrix, newX, targetY)) {
            player.pos.x = newX;
            draw();
        }
    };
    document.getElementById('rotate-btn').onclick = () => {
        if (!gameActive) return;
        const rotated = rotate(player.matrix);
        const old = player.matrix;
        player.matrix = rotated;
        if (collideArena(arena, player.matrix, player.pos.x, targetY)) {
            player.matrix = old;
        }
        draw();
    };
    document.getElementById('down-btn').onclick = (e) => {
        e.preventDefault();
        if (!gameActive) return;
        hardDrop();
    };

    window.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        switch (e.key) {
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