document.addEventListener('DOMContentLoaded', () => {
    const monsterButton = document.getElementById('monster-button');
    
    // Удаляем старую логику переключения изображений, так как они теперь статичны.
    
    monsterButton.addEventListener('click', () => {
        // Добавляем эффект нажатия
        monsterButton.classList.add('is-pressed');
        
        // Убираем эффект через 100 мс
        setTimeout(() => {
            monsterButton.classList.remove('is-pressed');
        }, 100);
    });
});