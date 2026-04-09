// ==================== ДАНІ ====================
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

// ========== КОРЗИНА ==========
let cart = [];

try {
    const saved = localStorage.getItem('morstrix_cart');
    if (saved) cart = JSON.parse(saved);
} catch(e) {}

function saveCart() {
    try {
        localStorage.setItem('morstrix_cart', JSON.stringify(cart));
    } catch(e) {}
}

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;
    for (let item of cart) {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    }
    
    document.getElementById('cartCount').innerHTML = totalItems;
    document.getElementById('cartTotalBottom').innerHTML = totalPrice + ' ₴';
    
    const cartItemsDiv = document.getElementById('cartItems');
    if (cartItemsDiv) {
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<div style="text-align:center;padding:20px;">пусто</div>';
        } else {
            let html = '';
            for (let item of cart) {
                html += `<div class="cart-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>${item.price * item.quantity} ₴ <button class="remove-item" data-id="${item.id}">✖</button></span>
                </div>`;
            }
            cartItemsDiv.innerHTML = html;
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    removeFromCart(this.getAttribute('data-id'));
                });
            });
        }
    }
    
    document.getElementById('cartTotalModal').innerHTML = 'ИТОГО: ' + totalPrice + ' ₴';
    saveCart();
}

function addToCart(product) {
    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    if (navigator.vibrate) navigator.vibrate(50);
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id == id);
    if (index === -1) return;
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    let totalPrice = 0;
    let itemsList = '';
    for (let item of cart) {
        totalPrice += item.price * item.quantity;
        itemsList += `${item.name} x${item.quantity} — ${item.price * item.quantity} ₴%0A`;
    }
    const message = `🛒 НОВЫЙ ЗАКАЗ!%0A%0A📦 Товары:%0A${itemsList}%0A💰 Итого: ${totalPrice} ₴%0A%0A👤 Заказ от:%0A📍 Доставка:`;
    window.open('https://t.me/morsova?text=' + message, '_blank');
}

// ========== КАРУСЕЛЬ ==========
let currentIndex = 0;

function renderCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    let slidesHtml = '<div class="carousel-slides" id="carouselSlides">';
    for (let item of carouselItems) {
        slidesHtml += `<div class="carousel-card" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
            <img src="${item.imageSrc}" class="carousel-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="carousel-name">${item.name}</div>
            <div class="carousel-desc">${item.description}</div>
        </div>`;
    }
    slidesHtml += '</div>';
    track.innerHTML = slidesHtml;
    
    document.querySelectorAll('.carousel-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            addToCart({ id: this.dataset.id, name, price });
            const nameDiv = this.querySelector('.carousel-name');
            const original = nameDiv.innerHTML;
            nameDiv.innerHTML = 'додано!';
            setTimeout(() => nameDiv.innerHTML = original, 600);
        });
    });
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const slides = document.getElementById('carouselSlides');
    if (slides) slides.style.transform = `translateX(-${currentIndex * 100}%)`;
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
    
    let html = '';
    for (let cat of categories) {
        html += `<div class="cat-card" data-id="${cat.id}" data-name="${cat.name}" data-price="${cat.price}">
            <img src="${cat.image}" class="cat-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-price">${cat.price} ₴</div>
        </div>`;
    }
    container.innerHTML = html;
    
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            addToCart({ id, name, price });
            const priceDiv = this.querySelector('.cat-price');
            const original = priceDiv.innerHTML;
            priceDiv.innerHTML = 'додано';
            setTimeout(() => priceDiv.innerHTML = original, 600);
        });
    });
}

// ========== МОДАЛКА КОРЗИНИ ==========
const modal = document.getElementById('cartModal');
document.getElementById('cartBtn').onclick = () => {
    updateCartUI();
    modal.classList.add('active');
};
document.querySelector('.close-modal').onclick = () => modal.classList.remove('active');
modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };
document.getElementById('checkoutBtn').onclick = checkout;

// ========== MERCH CONSTRUCTOR ==========
(function() {
    const canvas = document.getElementById('printCanvas');
    const upload = document.getElementById('imageUpload');
    const resetBtn = document.getElementById('resetPrint');
    
    if (!canvas || !upload) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    
    upload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            upload.value = '';
        });
    }
})();

// ========== CONVERTER ==========
(function() {
    const pxInput = document.getElementById('pxInput');
    const cmInput = document.getElementById('cmInput');
    
    if (!pxInput || !cmInput) return;
    
    pxInput.addEventListener('input', function() {
        const px = parseFloat(this.value);
        cmInput.value = !isNaN(px) ? (px / 37.8).toFixed(2) : '';
    });
    
    cmInput.addEventListener('input', function() {
        const cm = parseFloat(this.value);
        pxInput.value = !isNaN(cm) ? Math.round(cm * 37.8) : '';
    });
})();

// ========== СТРІЛКИ КАРУСЕЛІ ==========
document.getElementById('carouselPrev').onclick = prevSlide;
document.getElementById('carouselNext').onclick = nextSlide;

// ========== ЗАПУСК ==========
renderCarousel();
renderCategories();
updateCartUI();