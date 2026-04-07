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