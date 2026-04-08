// ==================== SHOP LOGIC + CAROUSEL ====================

const EXCHANGE_RATE = 40;
let currentCurrency = localStorage.getItem('morstrix_currency') || 'USD';

function convertPrice(usdPrice) {
    return currentCurrency === 'UAH' ? usdPrice * EXCHANGE_RATE : usdPrice;
}

function getCurrencySymbol() {
    return currentCurrency === 'USD' ? '$' : '₴';
}

function formatPrice(usdPrice) {
    const val = convertPrice(usdPrice);
    return `${getCurrencySymbol()}${val.toFixed(2)}`;
}

const categories = [
    { id: 1, name: "PRINT",     price: 15, image: "https://i.pinimg.com/736x/99/da/55/99da554066b71319b89effdf0866a332.jpg" },
    { id: 2, name: "DESIGN",    price: 25, image: "https://i.pinimg.com/1200x/bb/15/67/bb15672d7aa14685cc00931db281b1a8.jpg" },
    { id: 3, name: "TATTOO",    price: 20, image: "https://i.pinimg.com/736x/b0/31/ea/b031ea07ec8e4f208360ae4c7b69b0de.jpg" },
    { id: 4, name: "BARBERING", price: 18, image: "https://i.pinimg.com/736x/6b/02/8a/6b028ac4910258859105342388d0bf00.jpg" },
    { id: 5, name: "DIY GEAR",  price: 30, image: "https://i.pinimg.com/736x/fc/6e/c2/fc6ec274ace15a74b58f263ec8299ced.jpg" },
    { id: 6, name: "SHMOT",     price: 35, image: "https://i.pinimg.com/1200x/5b/50/2e/5b502ebe3d34a5d207c49a7602374414.jpg" }
];

const carouselItems = [
    { id: "diy_tshirt", name: "футболка", description: "графітовий оверсайз", imageSrc: "assets/tshirt.jpeg", basePriceUsd: 30 },
    { id: "diy_cap",    name: "кепка",    description: "варена база",        imageSrc: "assets/cap.jpg",    basePriceUsd: 30 },
    { id: "diy_doker",  name: "докер",    description: "спеціальний проєкт", imageSrc: "assets/doker.jpg",  basePriceUsd: 30 }
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
    const totalConverted = cart.reduce((sum, item) => sum + convertPrice(item.price * item.quantity), 0);
    const totalFormatted = `${getCurrencySymbol()}${totalConverted.toFixed(2)}`;
    
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalBottomEl = document.getElementById('cartTotalBottom');
    const cartTotalModalEl = document.getElementById('cartTotalModal');
    
    if (cartCountEl) cartCountEl.textContent = totalItems;
    if (cartTotalBottomEl) cartTotalBottomEl.textContent = totalFormatted;
    
    const cartItemsDiv = document.getElementById('cartItems');
    if (cartItemsDiv) {
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<div style="text-align:center;padding:20px;color:#a1a1a1;">пусто</div>';
        } else {
            cartItemsDiv.innerHTML = cart.map(item => {
                const subtotal = convertPrice(item.price * item.quantity);
                return `<div class="cart-item">
                    <span style="color:#a1a1a1;">${item.name} x${item.quantity}</span>
                    <span>${getCurrencySymbol()}${subtotal.toFixed(2)} <button class="remove-item" data-id="${item.id}">✖</button></span>
                </div>`;
            }).join('');
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
            });
        }
    }
    
    if (cartTotalModalEl) cartTotalModalEl.innerHTML = `ИТОГО: ${totalFormatted}`;
    localStorage.setItem('morstrix_cart', JSON.stringify(cart));
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    const totalConverted = cart.reduce((sum, item) => sum + convertPrice(item.price * item.quantity), 0);
    const itemsList = cart.map(item => {
        const sub = convertPrice(item.price * item.quantity);
        return `${item.name} x${item.quantity} — ${getCurrencySymbol()}${sub.toFixed(2)}`;
    }).join('%0A');
    const message = `🛒 НОВЫЙ ЗАКАЗ!%0A%0A📦 Товары:%0A${itemsList}%0A%0A💰 Итого: ${getCurrencySymbol()}${totalConverted.toFixed(2)} (${currentCurrency})%0A%0A👤 Заказ от:%0A📍 Доставка:`;
    window.open(`https://t.me/morsova?text=${message}`, '_blank');
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="cat-card" data-id="${cat.id}" data-name="${cat.name}" data-price-usd="${cat.price}">
            <img src="${cat.image}" class="cat-image" onerror="this.src='https://via.placeholder.com/300x300?text=${cat.name}'">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-price" data-base-usd="${cat.price}">${formatPrice(cat.price)}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const name = card.dataset.name;
            const priceUsd = parseFloat(card.dataset.priceUsd);
            
            if (id === 5) {
                openCarousel();
                return;
            }
            
            addToCart({ id, name, price: priceUsd });
            const priceDiv = card.querySelector('.cat-price');
            const orig = priceDiv.innerHTML;
            priceDiv.innerHTML = 'додано';
            setTimeout(() => { if(priceDiv) priceDiv.innerHTML = orig; }, 600);
            if (navigator.vibrate) navigator.vibrate(50);
        });
    });
}

// ========== CAROUSEL LOGIC ==========
let currentCarouselIndex = 0;
const carouselModal = document.getElementById('carouselModal');
const carouselImg = document.getElementById('carouselImg');
const carouselNameSpan = document.getElementById('carouselName');
const carouselDescSpan = document.getElementById('carouselDesc');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
const closeCarousel = document.getElementById('closeCarouselBtn');
const addCarouselBtn = document.getElementById('carouselAddToCartBtn');

function updateCarouselSlide() {
    const item = carouselItems[currentCarouselIndex];
    if (!item) return;
    carouselImg.src = item.imageSrc;
    carouselImg.onerror = () => { carouselImg.src = 'https://via.placeholder.com/400x400?text=DIY'; };
    carouselNameSpan.innerText = item.name;
    carouselDescSpan.innerText = item.description;
}

function openCarousel() {
    currentCarouselIndex = 0;
    updateCarouselSlide();
    carouselModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCarouselModal() {
    carouselModal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextSlide() {
    currentCarouselIndex = (currentCarouselIndex + 1) % carouselItems.length;
    updateCarouselSlide();
}

function prevSlide() {
    currentCarouselIndex = (currentCarouselIndex - 1 + carouselItems.length) % carouselItems.length;
    updateCarouselSlide();
}

function addCurrentCarouselItemToCart() {
    const item = carouselItems[currentCarouselIndex];
    if (!item) return;
    addToCart({ id: item.id, name: item.name, price: 30 });
    const originalText = addCarouselBtn.innerText;
    addCarouselBtn.innerText = 'додано!';
    setTimeout(() => { addCarouselBtn.innerText = originalText; }, 700);
    if (navigator.vibrate) navigator.vibrate(40);
}

if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (closeCarousel) closeCarousel.addEventListener('click', closeCarouselModal);
if (addCarouselBtn) addCarouselBtn.addEventListener('click', addCurrentCarouselItemToCart);
if (carouselModal) carouselModal.addEventListener('click', (e) => {
    if (e.target === carouselModal) closeCarouselModal();
});

// ========== MODAL CART ==========
const modal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeModalBtn = document.querySelector('.close-modal');
const checkoutBtn = document.getElementById('checkoutBtn');

if (cartBtn) cartBtn.onclick = () => { updateCartUI(); modal.classList.add('active'); };
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('active');
if (modal) modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
if (checkoutBtn) checkoutBtn.onclick = checkout;

// ========== CURRENCY TOGGLE ==========
const toggleCheckbox = document.getElementById('currencyToggle');

function setCurrency(currency) {
    if (currency !== 'USD' && currency !== 'UAH') return;
    currentCurrency = currency;
    localStorage.setItem('morstrix_currency', currentCurrency);
    if (toggleCheckbox) toggleCheckbox.checked = (currentCurrency === 'UAH');
    const usdLabel = document.getElementById('usdLabel');
    const uahLabel = document.getElementById('uahLabel');
    if (usdLabel && uahLabel) {
        if (currentCurrency === 'USD') {
            usdLabel.classList.add('active');
            uahLabel.classList.remove('active');
        } else {
            uahLabel.classList.add('active');
            usdLabel.classList.remove('active');
        }
    }
    renderCategories();
    updateCartUI();
}

function toggleCurrency() {
    setCurrency(currentCurrency === 'USD' ? 'UAH' : 'USD');
}

if (toggleCheckbox) toggleCheckbox.addEventListener('change', toggleCurrency);

// ========== INIT ==========
renderCategories();
updateCartUI();
setCurrency(currentCurrency);