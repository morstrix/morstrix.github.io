// ==================== SHOP LOGIC ====================

// ДАННЫЕ ТОВАРОВ (легко редактировать)
const categories = [
    { id: 1, name: "PRINT",     price: 15, image: "https://i.pinimg.com/736x/99/da/55/99da554066b71319b89effdf0866a332.jpg" },
    { id: 2, name: "DESIGN",    price: 25, image: "https://i.pinimg.com/1200x/bb/15/67/bb15672d7aa14685cc00931db281b1a8.jpg" },
    { id: 3, name: "TATTOO",    price: 20, image: "https://i.pinimg.com/736x/b0/31/ea/b031ea07ec8e4f208360ae4c7b69b0de.jpg" },
    { id: 4, name: "BARBERING", price: 18, image: "https://i.pinimg.com/736x/6b/02/8a/6b028ac4910258859105342388d0bf00.jpg" },
    { id: 5, name: "DIY GEAR",  price: 30, image: "https://i.pinimg.com/736x/fc/6e/c2/fc6ec274ace15a74b58f263ec8299ced.jpg" },
    { id: 6, name: "SHMOT",     price: 35, image: "https://i.pinimg.com/1200x/5b/50/2e/5b502ebe3d34a5d207c49a7602374414.jpg" }
];

let cart = JSON.parse(localStorage.getItem('morstrix_cart')) || [];

// Отрисовка товаров
function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    container.innerHTML = categories.map(cat => `
        <div class="cat-card" data-id="${cat.id}" data-name="${cat.name}" data-price="${cat.price}">
            <img src="${cat.image}" class="cat-image" onerror="this.src='https://via.placeholder.com/300x300?text=${cat.name}'">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-price">$${cat.price}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', () => {
            addToCart({ 
                id: parseInt(card.dataset.id), 
                name: card.dataset.name, 
                price: parseFloat(card.dataset.price) 
            });
            
            // Визуальный фидбек
            const priceDiv = card.querySelector('.cat-price');
            const orig = priceDiv.innerHTML;
            priceDiv.innerHTML = 'додано';
            setTimeout(() => { 
                if (card.querySelector('.cat-price')) 
                    card.querySelector('.cat-price').innerHTML = orig; 
            }, 600);
            
            if (navigator.vibrate) navigator.vibrate(50);
        });
    });
}

// Добавление в корзину
function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

// Удаление из корзины
function removeFromCart(id) {
    const index = cart.findIndex(i => i.id === id);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
}

// Обновление интерфейса корзины
function updateCartUI() {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    
    document.getElementById('cartCount').textContent = totalItems;
    document.getElementById('cartTotalBottom').textContent = `$${totalPrice.toFixed(2)}`;
    
    const cartItemsDiv = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div style="text-align:center;padding:20px;color:#a1a1a1;">пусто</div>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span style="color:#a1a1a1;">${item.name} x${item.quantity}</span>
                <span>
                    <span style="color:#a1a1a1;">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-id="${item.id}">✖</button>
                </span>
            </div>
        `).join('');
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
        });
    }
    
    document.getElementById('cartTotalModal').innerHTML = `ИТОГО: $${totalPrice.toFixed(2)}`;
    localStorage.setItem('morstrix_cart', JSON.stringify(cart));
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemsList = cart.map(i => `${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('%0A');
    
    // СОХРАНЯЕМ ДАННЫЕ для отправки (можно использовать любой из вариантов ниже)
    const orderData = {
        items: cart,
        total: totalPrice,
        date: new Date().toLocaleString()
    };
    
    // Временно сохраняем в localStorage для другой страницы
    localStorage.setItem('pending_order', JSON.stringify(orderData));
    
    // Открываем страницу оформления
    window.location.href = 'checkout.html';
}

// Модальное окно
const modal = document.getElementById('cartModal');
document.getElementById('cartBtn').onclick = () => { 
    updateCartUI(); 
    modal.classList.add('active'); 
};
document.querySelector('.close-modal').onclick = () => modal.classList.remove('active');
modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
document.getElementById('checkoutBtn').onclick = checkout;

// Запуск
renderCategories();
updateCartUI();