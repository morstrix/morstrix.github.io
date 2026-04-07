document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris-canvas');
    const context = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-piece-canvas');
    const nCtx = nextCanvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let blockSize = 20; // Значение по умолчанию

    function resizeGame() {
        // Вычисляем доступную высоту (минус запас под кнопки и заголовок ~180px)
        const availableHeight = window.innerHeight - 200;
        const availableWidth = window.innerWidth - 40;

        // Размер блока должен быть таким, чтобы 20 блоков влезли в высоту
        const sizeByHeight = Math.floor(availableHeight / 20);
        const sizeByWidth = Math.floor(availableWidth / 10);
        
        blockSize = Math.min(sizeByHeight, sizeByWidth, 25); // Максимум 25px

        canvas.width = blockSize * 10;
        canvas.height = blockSize * 20;
        
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(blockSize, blockSize);
        
        nCtx.setTransform(1, 0, 0, 1, 0, 0);
        nCtx.scale(blockSize * 0.7, blockSize * 0.7);
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

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        drawMatrix(arena, {x: 0, y: 0}, context);
        drawGhost(); // Рисуем фантом (VHS стиль)
        drawMatrix(player.matrix, player.pos, context);
        
        nCtx.fillStyle = '#000';
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        drawMatrix(player.next, {x: 0.5, y: 0.5}, nCtx);
    }

    function drawGhost() {
        const ghostPos = { x: player.pos.x, y: player.pos.y };
        while (!collide(arena, { pos: ghostPos, matrix: player.matrix })) {
            ghostPos.y++;
        }
        ghostPos.y--; 

        context.globalAlpha = 0.15; // Тусклый призрачный эффект
        drawMatrix(player.matrix, ghostPos, context);
        context.globalAlpha = 1.0;
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

    const arena = Array.from({length: 20}, () => Array(10).fill(0));
    const player = { pos: {x: 0, y: 0}, matrix: null, next: createPiece('T'), score: 0 };

    function playerReset() {
        const p = 'ILJOTSZ';
        player.matrix = player.next;
        player.next = createPiece(p[p.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        if (collide(arena, player)) { arena.forEach(r => r.fill(0)); player.score = 0; updateScore(); }
    }

    function collide(a, p) {
        const [m, o] = [p.matrix, p.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (a[y + o.y] && a[y + o.y][x + o.x]) !== 0) return true;
            }
        }
        return false;
    }

    function rotate(m) {
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < y; ++x) [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
        m.forEach(row => row.reverse());
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
        }
        dropCounter = 0;
    }

    function merge(a, p) {
        p.matrix.forEach((row, y) => {
            row.forEach((v, x) => { if (v !== 0) a[y + p.pos.y][x + p.pos.x] = v; });
        });
    }

    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) { if (arena[y][x] === 0) continue outer; }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            player.score += rowCount * 10;
        }
        updateScore();
    }

    function updateScore() { scoreElement.innerText = player.score; }

    let dropCounter = 0;
    let lastTime = 0;
    function update(time = 0) {
        const dt = time - lastTime;
        lastTime = time;
        dropCounter += dt;
        if (dropCounter > 1000) playerDrop();
        draw();
        requestAnimationFrame(update);
    }

    // Кнопки
    document.getElementById('left-btn').onclick = () => { player.pos.x--; if(collide(arena, player)) player.pos.x++; };
    document.getElementById('right-btn').onclick = () => { player.pos.x++; if(collide(arena, player)) player.pos.x--; };
    document.getElementById('rotate-btn').onclick = () => { 
        rotate(player.matrix); 
        if(collide(arena, player)) rotate(player.matrix); 
    };
    // Исправленная кнопка падения
    document.getElementById('down-btn').onclick = (e) => {
        e.preventDefault();
        playerDrop();
    };

    window.addEventListener('resize', resizeGame);
    resizeGame();
    playerReset();
    update();
});