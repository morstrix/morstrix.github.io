// LENIS
const lenis = new Lenis({
wrapper: document.querySelector('.journal-wrapper'),
content: document.getElementById('journalHorizontal'),
orientation: 'horizontal'
});

function raf(time){
lenis.raf(time);
requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ===== FONT MAP ВЕРНУЛ =====
const FONT_MAP = {
A:'ᴀ',a:'ᴀ',B:'ʙ',b:'ʙ',C:'ᴄ',c:'ᴄ',D:'ᴅ',d:'ᴅ'
};

function convertTextToFont(text){
return text.split('').map(c=>FONT_MAP[c]||c).join('');
}

// STYLER
const input = document.getElementById('fontInputEmbedded');
const preview = document.getElementById('stylerPreviewEmbedded');

input.addEventListener('input',()=>{
preview.textContent = convertTextToFont(input.value);
});

// ===== TTS ВЕРНУЛ =====
const ttsBtn = document.getElementById('ttsSpeakBtn');
const ttsInput = document.getElementById('ttsTextInput');
const ttsStatus = document.getElementById('ttsStatus');

ttsBtn.onclick = ()=>{
const text = ttsInput.value;
const utter = new SpeechSynthesisUtterance(text);
speechSynthesis.speak(utter);
ttsStatus.textContent = "PLAYING...";
};

// ===== CAROUSEL =====
setInterval(()=>{
const active = document.querySelector('.carousel .active');
let next = active.nextElementSibling;
if(!next) next = document.querySelector('.carousel img');
active.classList.remove('active');
next.classList.add('active');
},3000);

// ===== TICKER =====
const ticker = document.getElementById('rssTicker');
ticker.textContent = "CYBER NEWS — DESIGN — AI — FUTURE — ".repeat(10);

// ===== FIREBASE (ТВОЯ ЛОГИКА) =====
(async ()=>{
const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');

const app = initializeApp({
apiKey:"AIzaSy...",
projectId:"helper-e10b2"
});

const db = getFirestore(app);
const snap = await getDocs(collection(db,"top_players"));

const list = document.querySelector('.top-players-list');

snap.forEach(doc=>{
const d = doc.data();
list.innerHTML += `<div>${d.name} — ${d.score}</div>`;
});
})();

// TABS
document.querySelectorAll('.tab').forEach(tab=>{
tab.onclick = ()=>{
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
tab.classList.add('active');
};
});
