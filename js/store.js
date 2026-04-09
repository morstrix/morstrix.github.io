// ==================== ДАНІ ====================
var categories = [
    { id: 1, name: "DESIGN",      price: 2500, image: "https://i.pinimg.com/1200x/bb/15/67/bb15672d7aa14685cc00931db281b1a8.jpg" },
    { id: 2, name: "DEVELOPMENT", price: 3500, image: "https://i.pinimg.com/736x/99/da/55/99da554066b71319b89effdf0866a332.jpg" },
    { id: 3, name: "TATTOO",      price: 2000, image: "https://i.pinimg.com/736x/b0/31/ea/b031ea07ec8e4f208360ae4c7b69b0de.jpg" },
    { id: 4, name: "BARBERING",   price: 1800, image: "https://i.pinimg.com/736x/6b/02/8a/6b028ac4910258859105342388d0bf00.jpg" }
];

var carouselItems = [
    { id: "diy_tshirt", name: "футболка", description: "графітовий оверсайз", imageSrc: "assets/tshirt.jpeg", price: 1200 },
    { id: "diy_cap",    name: "кепка",    description: "варена база",        imageSrc: "assets/cap.jpg",    price: 800 },
    { id: "diy_doker",  name: "докер",    description: "спеціальний проєкт", imageSrc: "assets/doker.jpg",  price: 1500 }
];

// ========== КОРЗИНА ==========
var cart = [];

// Завантажити збережену корзину
try {
    var saved = localStorage.getItem('morstrix_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
} catch(e) {}

// Зберегти корзину
function saveCart() {
    try {
        localStorage.setItem('morstrix_cart', JSON.stringify(cart));
    } catch(e) {}
}

// Оновити відображення корзини
function updateCartUI() {
    var totalItems = 0;
    var totalPrice = 0;
    for (var i = 0; i < cart.length; i++) {
        totalItems += cart[i].quantity;
        totalPrice += cart[i].price * cart[i].quantity;
    }
    
    var cartCountEl = document.getElementById('cartCount');
    var cartTotalBottomEl = document.getElementById('cartTotalBottom');
    var cartTotalModalEl = document.getElementById('cartTotalModal');
    
    if (cartCountEl) cartCountEl.innerHTML = totalItems;
    if (cartTotalBottomEl) cartTotalBottomEl.innerHTML = totalPrice + ' ₴';
    
    var cartItemsDiv = document.getElementById('cartItems');
    if (cartItemsDiv) {
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<div style="text-align:center;padding:20px;">пусто</div>';
        } else {
            var html = '';
            for (var i = 0; i < cart.length; i++) {
                var item = cart[i];
                html += '<div class="cart-item">';
                html += '<span>' + item.name + ' x' + item.quantity + '</span>';
                html += '<span>' + (item.price * item.quantity) + ' ₴ <button class="remove-item" data-id="' + item.id + '">✖</button></span>';
                html += '</div>';
            }
            cartItemsDiv.innerHTML = html;
            
            // Обробники для кнопок видалення
            var removeBtns = document.querySelectorAll('.remove-item');
            for (var i = 0; i < removeBtns.length; i++) {
                removeBtns[i].addEventListener('click', function(e) {
                    var id = this.getAttribute('data-id');
                    removeFromCart(id);
                });
            }
        }
    }
    
    if (cartTotalModalEl) cartTotalModalEl.innerHTML = 'ИТОГО: ' + totalPrice + ' ₴';
    saveCart();
}

// Додати товар
function addToCart(product) {
    var found = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id == product.id) {
            found = cart[i];
            break;
        }
    }
    if (found) {
        found.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    updateCartUI();
    if (navigator.vibrate) navigator.vibrate(50);
}

// Видалити товар
function removeFromCart(id) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            if (cart[i].quantity > 1) {
                cart[i].quantity--;
            } else {
                cart.splice(i, 1);
            }
            break;
        }
    }
    updateCartUI();
}

// Оформити замовлення (Telegram)
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    var totalPrice = 0;
    for (var i = 0; i < cart.length; i++) {
        totalPrice += cart[i].price * cart[i].quantity;
    }
    var itemsList = '';
    for (var i = 0; i < cart.length; i++) {
        itemsList += cart[i].name + ' x' + cart[i].quantity + ' — ' + (cart[i].price * cart[i].quantity) + ' ₴%0A';
    }
    var message = '🛒 НОВЫЙ ЗАКАЗ!%0A%0A📦 Товары:%0A' + itemsList + '%0A💰 Итого: ' + totalPrice + ' ₴%0A%0A👤 Заказ от:%0A📍 Доставка:';
    // ЗАМІНИ 'morsova' на свій Telegram username
    window.open('https://t.me/morsova?text=' + message, '_blank');
}

// ========== КАРУСЕЛЬ ==========
var currentIndex = 0;

function renderCarousel() {
    var track = document.getElementById('carouselTrack');
    if (!track) return;
    
    var slidesHtml = '<div class="carousel-slides" id="carouselSlides">';
    for (var i = 0; i < carouselItems.length; i++) {
        var item = carouselItems[i];
        slidesHtml += '<div class="carousel-card" data-id="' + item.id + '" data-name="' + item.name + '" data-price="' + item.price + '">';
        slidesHtml += '<img src="' + item.imageSrc + '" class="carousel-image" onerror="this.src=\'https://via.placeholder.com/300\'">';
        slidesHtml += '<div class="carousel-name">' + item.name + '</div>';
        slidesHtml += '<div class="carousel-desc">' + item.description + '</div>';
        slidesHtml += '</div>';
    }
    slidesHtml += '</div>';
    track.innerHTML = slidesHtml;
    
    var cards = document.querySelectorAll('.carousel-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function(e) {
            var id = this.getAttribute('data-id');
            var name = this.getAttribute('data-name');
            var price = parseInt(this.getAttribute('data-price'));
            addToCart({ id: id, name: name, price: price });
            var nameDiv = this.querySelector('.carousel-name');
            var original = nameDiv.innerHTML;
            nameDiv.innerHTML = 'додано!';
            setTimeout(function() { nameDiv.innerHTML = original; }, 600);
        });
    }
    updateCarouselPosition();
}

function updateCarouselPosition() {
    var slides = document.getElementById('carouselSlides');
    if (slides) {
        slides.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
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
    var container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    var html = '';
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        html += '<div class="cat-card" data-id="' + cat.id + '" data-name="' + cat.name + '" data-price="' + cat.price + '">';
        html += '<img src="' + cat.image + '" class="cat-image" onerror="this.src=\'https://via.placeholder.com/300\'">';
        html += '<div class="cat-name">' + cat.name + '</div>';
        html += '<div class="cat-price">' + cat.price + ' ₴</div>';
        html += '</div>';
    }
    container.innerHTML = html;
    
    var cards = document.querySelectorAll('.cat-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function(e) {
            var id = this.getAttribute('data-id');
            var name = this.getAttribute('data-name');
            var price = parseInt(this.getAttribute('data-price'));
            addToCart({ id: id, name: name, price: price });
            var priceDiv = this.querySelector('.cat-price');
            var original = priceDiv.innerHTML;
            priceDiv.innerHTML = 'додано';
            setTimeout(function() { priceDiv.innerHTML = original; }, 600);
        });
    }
}

// ========== МОДАЛЬНЕ ВІКНО (ПАКЕТ) ==========
var modal = document.getElementById('cartModal');
var cartBtn = document.getElementById('cartBtn');
var closeModalBtn = document.querySelector('.close-modal');
var checkoutBtn = document.getElementById('checkoutBtn');

if (cartBtn) {
    cartBtn.onclick = function() {
        updateCartUI();
        modal.classList.add('active');
    };
}
if (closeModalBtn) {
    closeModalBtn.onclick = function() {
        modal.classList.remove('active');
    };
}
if (modal) {
    modal.onclick = function(e) {
        if (e.target === modal) modal.classList.remove('active');
    };
}
if (checkoutBtn) {
    checkoutBtn.onclick = checkout;
}

// ========== СТРІЛКИ КАРУСЕЛІ ==========
var prevBtn = document.getElementById('carouselPrev');
var nextBtn = document.getElementById('carouselNext');
if (prevBtn) prevBtn.onclick = prevSlide;
if (nextBtn) nextBtn.onclick = nextSlide;

// ========== ЗАПУСК ==========
renderCarousel();
renderCategories();
updateCartUI();
