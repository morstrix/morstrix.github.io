// ===== LENIS =====
const lenis = new Lenis({
wrapper: document.querySelector('.journal-wrapper'),
content: document.getElementById('journalHorizontal'),
orientation:'horizontal'
});

function raf(t){
lenis.raf(t);
requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ===== FONT SYSTEM =====
const FONT_MAP = {
А:'ᴀ',а:'ᴀ',B:'ʙ',b:'ʙ',C:'ᴄ',c:'ᴄ',
D:'ᴅ',d:'ᴅ',E:'ᴇ',e:'ᴇ',F:'ꜰ',f:'ꜰ',
};

function convertTextToFont(text){
return text.split('').map(c=>FONT_MAP[c]||c).join('');
}

const fontInput = document.getElementById('fontInputEmbedded');
const fontPreview = document.getElementById('stylerPreviewEmbedded');

fontInput.addEventListener('input',()=>{
fontPreview.textContent = convertTextToFont(fontInput.value);
});

// ===== TTS FULL RESTORE =====
const ttsBtn = document.getElementById('ttsSpeakBtn');
const ttsInput = document.getElementById('ttsTextInput');
const ttsStatus = document.getElementById('ttsStatus');

let voices = [];

function loadVoices(){
voices = speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;

ttsBtn.onclick = ()=>{
const text = ttsInput.value;
if(!text) return;

const utter = new SpeechSynthesisUtterance(text);

utter.onstart=()=>ttsStatus.textContent='PLAYING';
utter.onend=()=>ttsStatus.textContent='';

speechSynthesis.speak(utter);
};

// ===== CAROUSEL =====
setInterval(()=>{
const active = document.querySelector('.carousel .active');
let next = active.nextElementSibling || document.querySelector('.carousel img');
active.classList.remove('active');
next.classList.add('active');
},3000);

// ===== RSS =====
document.getElementById('rssTicker').textContent =
"CYBER • DESIGN • ART • AI • FUTURE • ".repeat(10);

// ===== PINTEREST =====
const pin = document.getElementById('pinterestPanel');
const menu = document.getElementById('pinterestMenu');

pin.onclick=()=>menu.classList.toggle('active');

// ===== ARCHIVE =====
document.getElementById('archiveBtn').onclick=()=>{
alert('ARCHIVE');
};

// ===== TOP PLAYERS (RESTORE LOGIC SAFE) =====
(async()=>{
const {initializeApp}=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
const {getFirestore,collection,getDocs}=await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');

const app=initializeApp({
apiKey:"XXX",
projectId:"helper-e10b2"
});

const db=getFirestore(app);
const snap=await getDocs(collection(db,"top_players"));

const list=document.querySelector('.top-players-list');

snap.forEach(d=>{
const x=d.data();
list.innerHTML+=`<div>${x.name} — ${x.score}</div>`;
});
})();

// ===== FORUM =====
document.querySelectorAll('.forum-tab').forEach(tab=>{
tab.onclick=()=>{
document.querySelectorAll('.forum-tab').forEach(t=>t.classList.remove('active'));
tab.classList.add('active');
};
});

// ===== DOTS (LENIS SYNC SIMPLE RESTORE) =====
lenis.on('scroll', ({scroll})=>{
const page = Math.round(scroll / window.innerWidth);
document.querySelectorAll('.dot').forEach((d,i)=>{
d.classList.toggle('active', i===page);
});
});
