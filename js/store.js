(function() {
    'use strict';

    // ==================== ДАНІ ====================
    const products = [
        { id: 'socks', name: 'НОСКИ', description: 'Базовые носки для повседневных образов.', price: 400 },
        { id: 'pants', name: 'ШТАНЫ', description: 'Свободный крой и плотная ткань.', price: 800 },
        { id: 'hoodies', name: 'БАТНИКИ', description: 'Теплые батники для межсезонья.', price: 1200 },
        { id: 'tees', name: 'ФУТБОЛКИ', description: 'Плотный хлопок и чистый силуэт.', price: 600 },
        { id: 'shirts', name: 'РУБАШКИ', description: 'Рубашки оверсайз для слоистых луков.', price: 1500 },
        { id: 'sweats', name: 'ТОЛСТОВКИ', description: 'Капюшон и мягкий футер внутри.', price: 1400 },
        { id: 'dokers', name: 'ДОКЕРЫ', description: 'Прямой крой для рабочего вайба.', price: 900 },
        { id: 'caps', name: 'КЕПКИ', description: 'Бейсболки с регулируемой посадкой.', price: 500 }
    ];

    const productImages = {
        socks:   ['assets/socks1.jpg', 'assets/socks2.jpg'],
        pants:   ['assets/pants1.jpg', 'assets/pants2.jpg'],
        hoodies: ['assets/hoodies1.jpg', 'assets/hoodies2.jpg'],
        tees:    ['assets/tshirt.jpeg', 'assets/tees2.jpg'],
        shirts:  ['assets/shirts1.jpg', 'assets/shirts2.jpg'],
        sweats:  ['assets/sweats1.jpg', 'assets/sweats2.jpg'],
        dokers:  ['assets/doker.jpg', 'assets/dokers2.jpg'],
        caps:    ['assets/cap.jpg', 'assets/caps2.jpg']
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
        grid.innerHTML = products.map(p => {
            const previewImg = productImages[p.id]?.[0] || '';
            return `
                <div class="cat-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-desc="${p.description}">
                    <div class="cat-image">
                        ${previewImg ? `<img src="${previewImg}" style="width:100%; height:100%; object-fit:cover;">` : 'товар відсутній'}
                    </div>
                    <div class="cat-name">${p.name}</div>
                </div>
            `;
        }).join('');
        
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
            slidesContainer.innerHTML = `<div class="product-carousel-slide"><div class="sold-out-placeholder">sold out</div></div>`;
        } else {
            slidesContainer.innerHTML = images.map(src => `
                <div class="product-carousel-slide">
                    <img src="${src}" class="product-slide-image" style="width:100%;height:100%;object-fit:cover;" alt="${product.name}">
                    <div class="sold-out-placeholder product-slide-fallback" style="display:none;">sold out</div>
                </div>
            `).join('');

            slidesContainer.querySelectorAll('.product-slide-image').forEach(img => {
                img.addEventListener('error', () => {
                    img.style.display = 'none';
                    const fallback = img.parentElement.querySelector('.product-slide-fallback');
                    if (fallback) fallback.style.display = 'flex';
                });
            });
        }
        currentCarouselIndex = 0;
        updateCarouselPosition();

        document.querySelectorAll('.product-carousel-slide').forEach(slide => {
            slide.addEventListener('click', () => {
                if (currentProductData) {
                    addToCart({
                        id: currentProductData.id,
                        name: currentProductData.name,
                        price: parseInt(currentProductData.price)
                    });
                }
            });
        });
        
        openModal('productModal');
    }

    function updateCarouselPosition() {
        const slides = document.getElementById('productCarouselSlides');
        const images = productImages[currentProductData?.id] || [];
        const totalSlides = images.length || 1;
        slides.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    }

    // ========== УТИЛИТЫ МОДАЛОК ==========
    function openModal(id) { document.getElementById(id)?.classList.add('active'); }
    function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

    // ========== КОНСТРУКТОР (попап) ==========
    function initConstructorPopup() {
        const canvas = document.getElementById('printCanvasEmbedded');
        const upload = document.getElementById('imageUploadEmbedded');
        if (!canvas || !upload) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 80; canvas.height = 80;
        upload.addEventListener('change', e => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height); };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
        document.getElementById('resetPrintEmbedded').addEventListener('click', ()=> { ctx.clearRect(0,0,canvas.width,canvas.height); upload.value = ''; });
    }

    // ========== КОНВЕРТЕР (попап) ==========
    function initConverterPopup() {
        const pxInput = document.getElementById('pxInputEmbedded');
        const cmInput = document.getElementById('cmInputEmbedded');
        if(pxInput && cmInput) {
            pxInput.addEventListener('input', ()=> { const px = parseFloat(pxInput.value); cmInput.value = isNaN(px) ? '' : (px / 37.8).toFixed(2); });
            cmInput.addEventListener('input', ()=> { const cm = parseFloat(cmInput.value); pxInput.value = isNaN(cm) ? '' : Math.round(cm * 37.8); });
        }
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        renderProducts();
        updateCartUI();

        document.getElementById('cartBtn').addEventListener('click', () => {
            updateCartUI();
            openModal('cartModal');
        });

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

        document.getElementById('checkoutBtn').addEventListener('click', checkout);

        // Новые иконки
        document.getElementById('constructorIcon').addEventListener('click', () => {
            openModal('constructorModal');
            initConstructorPopup(); // повторно не страшно
        });
        document.getElementById('converterIcon').addEventListener('click', () => {
            openModal('converterModal');
            initConverterPopup();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
