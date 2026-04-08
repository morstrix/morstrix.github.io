import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU",
    authDomain: "helper-e10b2.firebaseapp.com",
    projectId: "helper-e10b2",
    storageBucket: "helper-e10b2.firebasestorage.app",
    messagingSenderId: "131536876451",
    appId: "1:131536876451:web:eeaef494c83dfc4849e016",
    measurementId: "G-KPM4SEVG8R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris-canvas');
    const context = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-piece-canvas');
    const nCtx = nextCanvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let animationId = null;
    let gameActive = true;

    function resize() {
        const parent = canvas.parentElement;
        const availableWidth = parent.clientWidth - 20;
        const cellSize = Math.floor(availableWidth / 10);
        const canvasHeight = cellSize * 20;
        
        canvas.width = cellSize * 10;
        canvas.height = canvasHeight;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(cellSize, cellSize);

        const nextSize = cellSize * 0.6;
        nextCanvas.width = nextSize * 4;
        nextCanvas.height = nextSize * 4;
        nCtx.setTransform(1, 0, 0, 1, 0, 0);
        nCtx.scale(nextSize, nextSize);
    }

    const colors = [null, '#a84d6b', '#ffb7c7', '#79434a', '#a27791', '#ffffff', '#444444', '#b97272'];

    function createPiece(t) {
        if (t === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
        if (t === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
        if (t === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
        if (t === 'O') return [[4,4],[4,4]];
        if (t === 'Z') return [[5,5,0],[0,5,5],[0,0,0]];
        if (t === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
        if (t === 'T') return [[0,7,0],[7,7,7],[0,0,0]];
    }

    function drawMatrix(m, o, ctx) {
        m.forEach((row, y) => {
            row.forEach((v, x) => {
                if (v !== 0) {
                    ctx.fillStyle = colors[v];
                    ctx.fillRect(x + o.x, y + o.y, 1, 1);
                }
            });
        });
    }

    function draw() {
        if (!gameActive) return;
        
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        drawMatrix(arena, {x: 0, y: 0}, context);

        // Призрак
        const ghost = { pos: {x: player.pos.x, y: player.pos.y}, matrix: player.matrix };
        while (!collide(arena, ghost)) { ghost.pos.y++; }
        ghost.pos.y--;
        context.save();
        context.globalAlpha = 0.3;
        drawMatrix(ghost.matrix, ghost.pos, context);
        context.restore();

        drawMatrix(player.matrix, player.pos, context);

        nCtx.fillStyle = '#000';
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (player.next) {
            const offsetX = (4 - player.next[0].length) / 2;
            const offsetY = (4 - player.next.length) / 2;
            drawMatrix(player.next, {x: offsetX, y: offsetY}, nCtx);
        }
    }

    const arena = Array.from({length: 20}, () => Array(10).fill(0));
    const player = { pos: {x: 0, y: 0}, matrix: null, next: null, score: 0 };

    function collide(a, p) {
        const [m, o] = [p.matrix, p.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (a[y + o.y] && a[y + o.y][x + o.x]) !== 0) return true;
            }
        }
        return false;
    }

    function merge(a, p) {
        p.matrix.forEach((row, y) => {
            row.forEach((v, x) => { if (v !== 0) a[y + p.pos.y][x + p.pos.x] = v; });
        });
    }

    function rotate(matrix) {
        const rotated = matrix[0].map((_, idx) => matrix.map(row => row[idx]).reverse());
        return rotated;
    }

    function arenaSweep() {
        let rowsCleared = 0;
        for (let y = arena.length - 1; y >= 0; --y) {
            let full = true;
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) { full = false; break; }
            }
            if (full) {
                arena.splice(y, 1);
                arena.unshift(Array(10).fill(0));
                y++;
                rowsCleared++;
            }
        }
        
        if (rowsCleared > 0) {
            const points = [0, 10, 30, 60, 100];
            const addScore = points[Math.min(rowsCleared, 4)];
            player.score += addScore;
            scoreElement.innerText = player.score;
            
            // Анимация приземления — визуальный фидбек
            canvas.style.transform = 'scale(0.98)';
            setTimeout(() => { canvas.style.transform = 'scale(1)'; }, 50);
        }
    }

    function playerDrop() {
        if (!gameActive) return;
        
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            
            // Анимация приземления
            canvas.style.transform = 'scale(0.97)';
            setTimeout(() => { canvas.style.transform = 'scale(1)'; }, 60);
            
            playerReset();
            arenaSweep();
            updateGhost();
        }
        dropCounter = 0;
    }

    // Мгновенный сброс блока вниз
    function hardDrop() {
        if (!gameActive) return;
        
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        
        // Анимация приземления
        canvas.style.transform = 'scale(0.95)';
        setTimeout(() => { canvas.style.transform = 'scale(1)'; }, 80);
        
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateGhost();
    }

    function updateGhost() {
        // просто для перерисовки
    }

    function getRandomPiece() {
        const pieces = 'ILJOTSZ';
        return createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    }

    function playerReset() {
        if (!gameActive) return;
        
        player.matrix = player.next || getRandomPiece();
        player.next = getRandomPiece();
        player.pos.y = 0;
        player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
        
        if (collide(arena, player)) {
            gameOver();
        }
    }

    async function gameOver() {
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        
        const finalScore = player.score;
        
        // Показываем модалку для ввода ника
        showScoreModal(finalScore);
    }

    function showScoreModal(score) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="score-modal">
                <h3>✦ GAME OVER ✦</h3>
                <p style="font-size:14px; margin:10px 0;">SCORE: ${score}</p>
                <input type="text" id="playerName" maxlength="12" placeholder="ENTER NAME" autocomplete="off">
                <button id="saveScoreBtn">SAVE</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#playerName');
        const saveBtn = modal.querySelector('#saveScoreBtn');
        
        saveBtn.onclick = async () => {
            let name = input.value.trim();
            if (name === '') name = 'ANON';
            if (name.length > 12) name = name.slice(0, 12);
            
            await saveScoreToFirebase(name, score);
            modal.remove();
            resetGame();
        };
        
        input.onkeypress = (e) => {
            if (e.key === 'Enter') saveBtn.click();
        };
        input.focus();
    }

    async function saveScoreToFirebase(name, score) {
        try {
            await addDoc(collection(db, "top_players"), {
                name: name,
                score: score,
                date: new Date().toISOString()
            });
            console.log('Score saved');
        } catch (e) {
            console.error('Error saving score:', e);
        }
    }

    function resetGame() {
        // Очищаем арену
        for (let y = 0; y < arena.length; y++) {
            for (let x = 0; x < arena[y].length; x++) {
                arena[y][x] = 0;
            }
        }
        player.score = 0;
        scoreElement.innerText = '0';
        gameActive = true;
        player.next = getRandomPiece();
        playerReset();
        startGameLoop();
    }

    let dropCounter = 0;
    let lastTime = 0;
    
    function startGameLoop() {
        if (animationId) cancelAnimationFrame(animationId);
        
        function update(time = 0) {
            if (!gameActive) return;
            
            const dt = time - lastTime;
            lastTime = time;
            dropCounter += dt;
            
            if (dropCounter > 500) { // 500ms скорость падения
                playerDrop();
                dropCounter = 0;
            }
            
            draw();
            animationId = requestAnimationFrame(update);
        }
        
        lastTime = 0;
        animationId = requestAnimationFrame(update);
    }

    // Управление
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
        const oldMatrix = player.matrix;
        player.matrix = rotated;
        if (collide(arena, player)) {
            player.matrix = oldMatrix;
        }
        draw();
    };
    
    document.getElementById('down-btn').onclick = (e) => {
        e.preventDefault();
        if (!gameActive) return;
        hardDrop();
    };

    // Клавиатура
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

    window.addEventListener('resize', () => {
        resize();
        draw();
    });
    
    resize();
    player.next = getRandomPiece();
    playerReset();
    startGameLoop();
});