document.addEventListener('DOMContentLoaded', () => {
    const monsterButton = document.getElementById('monster-button');
    const monsterImage = monsterButton.querySelector('.monster-image');
    
    // Функция для запуска анимации
    function triggerMonsterAnimation() {
        // Здесь можно добавить более сложную анимацию, например, смену картинки
        // или CSS-анимацию
        console.log('Monster button clicked!');
    }

    monsterButton.addEventListener('click', () => {
        // Добавляем эффект нажатия
        monsterButton.classList.add('is-pressed');
        
        // Убираем эффект через 100 мс
        setTimeout(() => {
            monsterButton.classList.remove('is-pressed');
            triggerMonsterAnimation();
        }, 100);
    });
});