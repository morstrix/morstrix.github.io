document.addEventListener('DOMContentLoaded', () => {
    // 1. Бегущая строка (RSS)
    const ticker = document.getElementById('rssTicker');
    if (ticker) {
        const messages = [
            "✦ MORSTRIX V2.0 СИСТЕМА ЗАПУЩЕНА ✦",
            "✦ НОВЫЕ ПРИНТЫ В МАГАЗИНЕ ✦",
            "✦ ПОДПИСЫВАЙТЕСЬ НА НАШ ТЕЛЕГРАМ ✦"
        ];
        ticker.innerText = messages.join(" --- ");
    }

    // 2. Карусель картинок
    const carousel = document.getElementById('mainCarousel');
    if (carousel) {
        const imgs = carousel.querySelectorAll('img');
        let idx = 0;
        carousel.onclick = () => {
            imgs[idx].classList.remove('active');
            idx = (idx + 1) % imgs.length;
            imgs[idx].classList.add('active');
        };
    }

    // 3. Стилизатор текста (Transform & Copy)
    const fontInput = document.getElementById('fontInput');
    const transformBtn = document.getElementById('transformBtn');
    const copyBtn = document.getElementById('copyBtn');

    if (transformBtn && fontInput) {
        transformBtn.onclick = () => {
            let val = fontInput.value;
            // Пример трансформации: в верхний регистр + пробелы
            fontInput.value = val.toUpperCase().split('').join(' ');
        };
    }

    if (copyBtn && fontInput) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(fontInput.value);
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "DONE!";
            setTimeout(() => copyBtn.innerText = originalText, 1000);
        };
    }

    // 4. Конвертер Px в Cm
    const pxInp = document.getElementById('pxInput');
    const cmInp = document.getElementById('cmInput');
    if (pxInp && cmInp) {
        pxInp.oninput = () => cmInp.value = (pxInp.value / 37.8).toFixed(2);
        cmInp.oninput = () => pxInp.value = Math.round(cmInp.value * 37.8);
    }
});

// Загрузка топа игроков из Firebase
async function loadTopPlayers() {
    const container = document.getElementById('topPlayersList');
    if (!container) return;
    
    try {
        const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
        
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
        const q = query(collection(db, "top_players"), orderBy("score", "desc"), limit(4));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '✦ NO SCORES YET ✦';
            return;
        }
        
        let html = '';
        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<div style="display:flex; justify-content:space-between; gap:20px;">
                        <span style="color:#a84d6b;">${rank}.</span>
                        <span style="color:#fff;">${data.name || 'ANON'}</span>
                        <span style="color:#ffb7c7;">${data.score}</span>
                     </div>`;
            rank++;
        });
        container.innerHTML = html;
        
    } catch(e) {
        console.error('Ошибка загрузки топа:', e);
        container.innerHTML = '⚠️ UNAVAILABLE ⚠️';
    }
}

// Загружаем топ при загрузке страницы
if (document.getElementById('topPlayersList')) {
    loadTopPlayers();
}