// LENIS
const lenis = new Lenis({
wrapper: document.querySelector('.wrapper'),
content: document.querySelector('.horizontal'),
orientation: 'horizontal',
smoothWheel: true
});

function raf(time){
lenis.raf(time);
requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

window.scrollToPage = (i)=>{
lenis.scrollTo(i * window.innerWidth);
};

// CAROUSEL
setInterval(()=>{
const active = document.querySelector('.carousel .active');
let next = active.nextElementSibling;
if(!next) next = document.querySelector('.carousel img');
active.classList.remove('active');
next.classList.add('active');
},3000);

// FONT PREVIEW
const input = document.getElementById('input');
const preview = document.getElementById('preview');

input.addEventListener('input',()=>{
preview.textContent = input.value;
});

// TABS
document.querySelectorAll('.tab').forEach(tab=>{
tab.onclick = ()=>{
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
tab.classList.add('active');
};
});
