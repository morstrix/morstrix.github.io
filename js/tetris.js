// ==================== ДАНІ ====================
const categories = [
    { id: 'socks_pants', name: 'НОСКИ/ШТАНЫ', description: 'Комфортні базові речі', price: 800 },
    { id: 'hoodies_tees', name: 'БАТНИКИ/ФУТБОЛКИ', description: 'Преміум якість', price: 1200 },
    { id: 'shirts_sweats', name: 'РУБАШКИ/ТОЛСТОВКИ', description: 'Стильний вибір', price: 1500 },
    { id: 'dokers_caps', name: 'ДОКЕРЫ/КЕПКИ', description: 'Аксесуари', price: 900 }
];

// Заглушки для каруселей (пока пусто, будут изображения)
const productImages = {
    socks_pants: [],
    hoodies_tees: [],
    shirts_sweats: [],
    dokers_caps: []
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
    document.getElementById('cartCount').innerHTML = totalItems;
    document.getElementById('cartTotalBottom').innerHTML = totalPrice + ' ₴';
    
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
    document.getElementById('cartTotalModal').innerHTML = 'ИТОГО: ' + totalPrice + ' ₴';
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

// ========== ОТРИСОВКА КАТЕГОРИЙ ==========
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    grid.innerHTML = categories.map(cat => `
        <div class="cat-card" data-id="${cat.id}" data-name="${cat.name}" data-price="${cat.price}" data-desc="${cat.description}">
            <div class="cat-image">товар відсутній</div>
            <div class="cat-name">${cat.name}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', () => openProductModal(card.dataset));
    });
}

// ========== МОДАЛКА ТОВАРА (с каруселью) ==========
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
    
    document.getElementById('productModal').classList.add('active');
}

function updateCarouselPosition() {
    const slides = document.getElementById('productCarouselSlides');
    const images = productImages[currentProductData?.id] || [];
    const totalSlides = images.length || 1;
    slides.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
}

document.getElementById('productCarouselPrev').onclick = () => {
    const images = productImages[currentProductData?.id] || [];
    const total = images.length || 1;
    currentCarouselIndex = (currentCarouselIndex - 1 + total) % total;
    updateCarouselPosition();
};

document.getElementById('productCarouselNext').onclick = () => {
    const images = productImages[currentProductData?.id] || [];
    const total = images.length || 1;
    currentCarouselIndex = (currentCarouselIndex + 1) % total;
    updateCarouselPosition();
};

document.getElementById('addToCartFromModal').onclick = () => {
    if (currentProductData) {
        addToCart({
            id: currentProductData.id,
            name: currentProductData.name,
            price: parseInt(currentProductData.price)
        });
        document.getElementById('productModal').classList.remove('active');
    }
};

// ========== МОДАЛКИ (универсальное открытие/закрытие) ==========
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ========== КОНВЕРТЕР ==========
const pxInput = document.getElementById('pxInput');
const cmInput = document.getElementById('cmInput');
if (pxInput && cmInput) {
    pxInput.addEventListener('input', () => { const px = parseFloat(pxInput.value); cmInput.value = isNaN(px) ? '' : (px / 37.8).toFixed(2); });
    cmInput.addEventListener('input', () => { const cm = parseFloat(cmInput.value); pxInput.value = isNaN(cm) ? '' : Math.round(cm * 37.8); });
}

// ========== МЕРЧ-КОНСТРУКТОР ==========
const canvas = document.getElementById('printCanvas');
const upload = document.getElementById('imageUpload');
if (canvas && upload) {
    const ctx = canvas.getContext('2d');
    canvas.width = 90; canvas.height = 90;
    upload.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const img = new Image();
            img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('resetPrint').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); upload.value = ''; });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
renderCategories();
updateCartUI();

// Кнопки верхней панели
document.getElementById('openConverterBtn').addEventListener('click', () => openModal('converterModal'));
document.getElementById('openConstructorBtn').addEventListener('click', () => openModal('constructorModal'));

// Корзина
document.getElementById('cartBtn').addEventListener('click', () => { updateCartUI(); document.getElementById('cartModal').classList.add('active'); });
document.querySelector('#cartModal .close-modal').addEventListener('click', () => document.getElementById('cartModal').classList.remove('active'));
document.getElementById('cartModal').addEventListener('click', e => { if (e.target === document.getElementById('cartModal')) document.getElementById('cartModal').classList.remove('active'); });
document.getElementById('checkoutBtn').addEventListener('click', checkout);

// Закрытие модалок через крестик и фон (используем делегирование)
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-close-btn')) {
        const modalId = e.target.dataset.modal;
        if (modalId) closeModal(modalId);
    }
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
    }
});