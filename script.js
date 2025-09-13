document.addEventListener('DOMContentLoaded', () => {
    const monsterButton = document.getElementById('monster-button');
    const monsterImage = monsterButton.querySelector('.monster-image');
    
    // Функция для переключения изображения
    function toggleMonsterImage() {
        const currentSrc = monsterImage.src;
        // Проверяем, если текущий источник заканчивается на 'MLOGO.png'
        if (currentSrc.endsWith('MLOGO.png')) {
            // Если да, меняем на 'MLOGO.gif'
            monsterImage.src = 'MLOGO.gif';
        } else {
            // Иначе, возвращаем обратно на 'MLOGO.png'
            monsterImage.src = 'MLOGO.png';
        }
    }

    monsterButton.addEventListener('click', () => {
        // Добавляем эффект нажатия
        monsterButton.classList.add('is-pressed');
        
        // Убираем эффект через 100 мс и запускаем функцию переключения
        setTimeout(() => {
            monsterButton.classList.remove('is-pressed');
            toggleMonsterImage(); // Вызываем нашу функцию
        }, 100);
    });
});