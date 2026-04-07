import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

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
    const context = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-piece-canvas');
    const nCtx = nextCanvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    function resize() {
        const parent = canvas.parentElement;
        const availableHeight = parent.clientHeight - 10;
        const availableWidth = parent.clientWidth - 10;
        const size = Math.floor(Math.min(availableHeight / 20, availableWidth / 10));
        
        canvas.width = size * 10;
        canvas.height = size * 20;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(size, size);

        nCtx.setTransform(1, 0, 0, 1, 0, 0);
        nCtx.scale(size * 0.8, size * 0.8);
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
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        drawMatrix(arena, {x: 0, y: 0}, context);

        // ПРИЗРАК
        const ghost = { pos: {x: player.pos.x, y: player.pos.y}, matrix: player.matrix };
        while (!collide(arena, ghost)) { ghost.pos.y++; }
        ghost.pos.y--;
        context.save();
        context.globalAlpha = 0.2;
        drawMatrix(ghost.matrix, ghost.pos, context);
        context.restore();

        drawMatrix(player.matrix, player.pos, context);

        nCtx.fillStyle = '#000';
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        drawMatrix(player.next, {x: 0.5, y: 0.5}, nCtx);
    }

    const arena = Array.from({length: 20}, () => Array(10).fill(0));
    const player = { pos: {x: 0, y: 0}, matrix: null, next: createPiece('I'), score: 0 };

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
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
        matrix.forEach(row => row.reverse());
    }

    function arenaSweep() {
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) { if (arena[y][x] === 0) continue outer; }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            player.score += 10;
        }
        scoreElement.innerText = player.score;
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

    async function playerReset() {
        const pieces = 'ILJOTSZ';
        player.matrix = player.next || createPiece('T');
        player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        
        if (collide(arena, player)) {
            // Game Over
            if (player.score > 0) {
                await addDoc(collection(db, "top_players"), {
                    score: player.score,
                    date: new Date().toISOString()
                });
            }
            arena.forEach(row => row.fill(0));
            player.score = 0;
            scoreElement.innerText = 0;
        }
    }

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

    document.getElementById('left-btn').onclick = () => { player.pos.x--; if(collide(arena, player)) player.pos.x++; };
    document.getElementById('right-btn').onclick = () => { player.pos.x++; if(collide(arena, player)) player.pos.x--; };
    document.getElementById('rotate-btn').onclick = () => { 
        const oldX = player.pos.x;
        rotate(player.matrix);
        if(collide(arena, player)) player.pos.x = oldX; 
    };
    document.getElementById('down-btn').onclick = (e) => { e.preventDefault(); playerDrop(); };

    window.addEventListener('resize', resize);
    resize();
    playerReset();
    update();
});