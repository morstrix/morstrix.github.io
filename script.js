document.addEventListener('DOMContentLoaded', () => {
    const monsterButton = document.getElementById('monster-button');
    
    monsterButton.addEventListener('click', () => {
        monsterButton.classList.add('is-pressed');
        
        setTimeout(() => {
            monsterButton.classList.remove('is-pressed');
        }, 100);
    });
});