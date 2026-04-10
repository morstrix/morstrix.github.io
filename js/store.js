(function() {
    'use strict';

    // ==================== ДАНІ ====================
    const products = [
        { id: 'socks', name: 'НОСКИ', description: 'Комфортні базові носки', price: 400 },
        { id: 'pants', name: 'ШТАНЫ', description: 'Базові штани вільного крою', price: 800 },
        { id: 'hoodies', name: 'БАТНИКИ', description: 'Преміум батники з начосом', price: 1200 },
        { id: 'tees', name: 'ФУТБОЛКИ', description: 'Щільний 100% бавовна', price: 600 },
        { id: 'shirts', name: 'РУБАШКИ', description: 'Оверсайз рубашки', price: 1500 },
        { id: 'sweats', name: 'ТОЛСТОВКИ', description: 'Толстовки з капюшоном', price: 1400 },
        { id: 'dokers', name: 'ДОКЕРЫ', description: 'Докери прямого крою', price: 900 },
        { id: 'caps', name: 'КЕПКИ', description: 'Бейсболки 5-panel', price: 500 }
    ];

    // Заглушки изображений (пока пустые, позже добавите ссылки)
    const productImages = {
        socks: [],
        pants: [],
        hoodies: [],
        tees: [],
        shirts: [],
        sweats: [],
        dokers: [],
        caps: []
    };

    // ========== КОРЗИНА ==========
    let cart = [];
    try {
        const saved = localStorage.getItem('morstrix_cart');
        if (saved) cart = JSON.parse(saved);
    } catch(e) {}

    function saveCart() {
        try { localStorage.setItem('morstrix_cart', JSON.stringify(cart)); } catch(e) {}
    }

    function updateCartUI() {
        let totalItems = 0, totalPrice = 0;
        cart.forEach(item => { totalItems += item.quantity; totalPrice += item.price * item.quantity; });
        
        const countEl = document.getElementById('cartCount');
        const totalBottomEl = document.getElementById('cartTotalBottom');
        if (countEl) countEl.textContent = totalItems;
        if (totalBottomEl) totalBottomEl.textContent = totalPrice + ' ₴';
        
        const cartItemsDiv = document.getElementById('cartItems');
        if (cartItemsDiv) {
            if (cart.length === 0) {
                cartItemsDiv.innerHTML = '<div style="text-align:center;padding:20px;">пусто</div>';
            } else {
                let html = '';
                cart.forEach(item => {
                    html += `<div class="cart-item"><span>${item.name} x${item.quantity}</span>
                             <span>${item.price * item.quantity} ₴ <button class="remove-item" data-id="${item.id}">✖</button></span></div>`;
                });
                cartItemsDiv.innerHTML = html;
                document.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
                });
            }
        }
        const totalModalEl = document.getElementById('cartTotalModal');
        if (totalModalEl) totalModalEl.textContent = 'ИТОГО: ' + totalPrice + ' ₴';
        saveCart();
    }

    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) existing.quantity++;
        else cart.push({ ...product, quantity: 1 });
        updateCartUI();
        if (navigator.vibrate) navigator.vibrate(50);
    }

    function removeFromCart(id) {
        const index = cart.findIndex(item => item.id === id);
        if (index === -1) return;
        if (cart[index].quantity > 1) cart[index].quantity--;
        else cart.splice(index, 1);
        updateCartUI();
    }

    function checkout() {
        if (cart.length === 0) { alert('Корзина пуста'); return; }
        let total = 0, items = '';
        cart.forEach(item => { total += item.price * item.quantity; items += `${item.name} x${item.quantity} — ${item.price * item.quantity} ₴%0A`; });
        window.open(`https://t.me/morsova?text=🛒 НОВЫЙ ЗАКАЗ!%0A%0A${items}%0A💰 Итого: ${total} ₴`, '_blank');
    }

    // ========== ОТРИСОВКА ТОВАРОВ ==========
    function renderProducts() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        grid.innerHTML = products.map(p => `
            <div class="cat-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-desc="${p.description}">
                <div class="cat-image">товар відсутній</div>
                <div class="cat-name">${p.name}</div>
            </div>
        `).join('');
        
        document.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => openProductModal(card.dataset));
        });
    }

    // ========== МОДАЛКА ТОВАРА ==========
    let currentProductData = null;
    let currentCarouselIndex = 0;

    function openProductModal(product) {
        currentProductData = product;
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productDescription').textContent = product.desc;
        
        const slidesContainer = document.getElementById('productCarouselSlides');
        const images = productImages[product.id] || [];
        if (images.length === 0) {
            slidesContainer.innerHTML = `<div class="product-carousel-slide">товар відсутній</div>`;
        } else {
            slidesContainer.innerHTML = images.map(src => `<img src="${src}" class="product-carousel-slide" style="object-fit:cover;">`).join('');
        }
        currentCarouselIndex = 0;
        updateCarouselPosition();

        // Добавляем обработчики клика на слайды (после вставки)
        document.querySelectorAll('.product-carousel-slide').forEach(slide => {
            slide.addEventListener('click', () => {
                if (currentProductData) {
                    addToCart({
                        id: currentProductData.id,
                        name: currentProductData.name,
                        price: parseInt(currentProductData.price)
                    });
                    closeModal('productModal');
                }
            });
        });
        
        document.getElementById('productModal').classList.add('active');
    }

    function updateCarouselPosition() {
        const slides = document.getElementById('productCarouselSlides');
        const images = productImages[currentProductData?.id] || [];
        const totalSlides = images.length || 1;
        slides.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    }

    // ========== УТИЛИТЫ МОДАЛОК ==========
    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        renderProducts();
        updateCartUI();

        // Корзина
        document.getElementById('cartBtn').addEventListener('click', () => {
            updateCartUI();
            openModal('cartModal');
        });

        // Карусель товара
        document.getElementById('productCarouselPrev').addEventListener('click', () => {
            const images = productImages[currentProductData?.id] || [];
            const total = images.length || 1;
            currentCarouselIndex = (currentCarouselIndex - 1 + total) % total;
            updateCarouselPosition();
        });
        document.getElementById('productCarouselNext').addEventListener('click', () => {
            const images = productImages[currentProductData?.id] || [];
            const total = images.length || 1;
            currentCarouselIndex = (currentCarouselIndex + 1) % total;
            updateCarouselPosition();
        });

        // Закрытие модалок (общее)
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modal;
                if (modalId) closeModal(modalId);
            });
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        // Кнопка оформления заказа
        document.getElementById('checkoutBtn').addEventListener('click', checkout);
    }

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
