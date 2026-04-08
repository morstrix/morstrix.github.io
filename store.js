// ==================== SHOP LOGIC ====================

const categories = [
    { id: 1, name: "DESIGN",      price: 2500, image: "https://i.pinimg.com/1200x/bb/15/67/bb15672d7aa14685cc00931db281b1a8.jpg" },
    { id: 2, name: "DEVELOPMENT", price: 3500, image: "https://i.pinimg.com/736x/99/da/55/99da554066b71319b89effdf0866a332.jpg" },
    { id: 3, name: "TATTOO",      price: 2000, image: "https://i.pinimg.com/736x/b0/31/ea/b031ea07ec8e4f208360ae4c7b69b0de.jpg" },
    { id: 4, name: "BARBERING",   price: 1800, image: "https://i.pinimg.com/736x/6b/02/8a/6b028ac4910258859105342388d0bf00.jpg" }
];

const carouselItems = [
    { id: "diy_tshirt", name: "футболка", description: "графітовий оверсайз", imageSrc: "assets/tshirt.jpeg", price: 1200 },
    { id: "diy_cap",    name: "кепка",    description: "варена база",        imageSrc: "assets/cap.jpg",    price: 800 },
    { id: "diy_doker",  name: "докер",    description: "спеціальний проєкт", imageSrc: "assets/doker.jpg",  price: 1500 }
];

let cart = JSON.parse(localStorage.getItem('morstrix_cart')) || [];

function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    if (navigator.vibrate) navigator.vibrate(50);
}

function removeFromCart(id) {
    const index = cart.findIndex(i => i.id === id);
    if (index !== -1) {
        if (cart[index].quantity > 1) cart[index].quantity--;
        else cart.splice(index, 1);
    }
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalBottomEl = document.getElementById('cartTotalBottom');
    const cartTotalModalEl = document.getElementById('cartTotalModal');
    
    if (cartCountEl) cartCountEl.textContent = totalItems;
    if (cartTotalBottomEl) cartTotalBottomEl.textContent = `${totalPrice} ₴`;
    
    const cartItemsDiv = document.getElementById('cartItems');
    if (cartItemsDiv) {
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<div style="text-align:center;padding:20px;color:#a1a1a1;">пусто</div>';
        } else {
            cartItemsDiv.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>${item.price * item.quantity} ₴ <button class="remove-item" data-id="${item.id}">✖</button></span>
                </div>
            `).join('');
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
            });
        }
    }
    
    if (cartTotalModalEl) cartTotalModalEl.innerHTML = `ИТОГО: ${totalPrice} ₴`;
    localStorage.setItem('morstrix_cart', JSON.stringify(cart));
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemsList = cart.map(i => `${i.name} x${i.quantity} — ${i.price * i.quantity} ₴`).join('%0A');
    const message = `🛒 НОВЫЙ ЗАКАЗ!%0A%0A📦 Товары:%0A${itemsList}%0A%0A💰 Итого: ${totalPrice} ₴%0A%0A👤 Заказ от:%0A📍 Доставка:`;
    window.open(`https://t.me/morsova?text=${message}`, '_blank');
}

// ========== КАРУСЕЛЬ ==========
let currentIndex = 0;

function renderCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    track.innerHTML = `
        <div class="carousel-slides" id="carouselSlides">
            ${carouselItems.map(item => `
                <div class="carousel-card" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                    <img src="${item.imageSrc}" class="carousel-image" onerror="this.src='https://via.placeholder.com/300x300?text=${item.name}'">
                    <div class="carousel-name">${item.name}</div>
                    <div class="carousel-desc">${item.description}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.querySelectorAll('.carousel-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            addToCart({ id, name, price });
            
            const nameDiv = card.querySelector('.carousel-name');
            const originalName = nameDiv.innerHTML;
            nameDiv.innerHTML = 'додано!';
            setTimeout(() => { if(nameDiv) nameDiv.innerHTML = originalName; }, 600);
        });
    });
    
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const slides = document.getElementById('carouselSlides');
    if (slides) {
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % carouselItems.length;
    updateCarouselPosition();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    updateCarouselPosition();
}

// ========== КАТЕГОРІЇ ==========
function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="cat-card" data-id="${cat.id}" data-name="${cat.name}" data-price="${cat.price}">
            <img src="${cat.image}" class="cat-image" onerror="this.src='https://via.placeholder.com/300x300?text=${cat.name}'">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-price">${cat.price} ₴</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', () => {
            addToCart({ 
                id: card.dataset.id, 
                name: card.dataset.name, 
                price: parseInt(card.dataset.price) 
            });
            const priceDiv = card.querySelector('.cat-price');
            const orig = priceDiv.innerHTML;
            priceDiv.innerHTML = 'додано';
            setTimeout(() => { if(priceDiv) priceDiv.innerHTML = orig; }, 600);
            if (navigator.vibrate) navigator.vibrate(50);
        });
    });
}

// ========== МОДАЛКА ==========
const modal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeModalBtn = document.querySelector('.close-modal');
const checkoutBtn = document.getElementById('checkoutBtn');

if (cartBtn) cartBtn.onclick = () => { updateCartUI(); modal.classList.add('active'); };
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('active');
if (modal) modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
if (checkoutBtn) checkoutBtn.onclick = checkout;

// ========== СТРІЛКИ ==========
document.getElementById('carouselPrev')?.addEventListener('click', prevSlide);
document.getElementById('carouselNext')?.addEventListener('click', nextSlide);

// ========== ЗАПУСК ==========
renderCarousel();
renderCategories();
updateCartUI();