const canvas = document.getElementById('neuro-bg');
const ctx = canvas.getContext('2d');
let w, h, p = [];
const init = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    p = Array.from({length: w < 600 ? 40 : 80}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        vx: (Math.random()-.5)*0.5, vy: (Math.random()-.5)*0.5
    }));
};
const draw = () => {
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "#368600"; ctx.strokeStyle = "rgba(54,134,0,0.2)";
    p.forEach((pt, i) => {
        pt.x += pt.vx; pt.y += pt.vy;
        if(pt.x<0||pt.x>w) pt.vx*=-1; if(pt.y<0||pt.y>h) pt.vy*=-1;
        ctx.fillRect(pt.x, pt.y, 2, 2);
        for(let j=i+1; j<p.length; j++) {
            let d = Math.hypot(pt.x-p[j].x, pt.y-p[j].y);
            if(d<100) { ctx.beginPath(); ctx.moveTo(pt.x,pt.y); ctx.lineTo(p[j].x,p[j].y); ctx.stroke(); }
        }
    });
    requestAnimationFrame(draw);
};
window.onresize = init; init(); draw();