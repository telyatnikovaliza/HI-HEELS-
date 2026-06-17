// ======================================================
// UTILS
// ======================================================
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];


// ======================================================
// 1. HORIZONTAL REVIEWS
// ======================================================
const sections = $$('.horizontal-section');

sections.forEach(section => {
    const track = $('.horizontal-track', section);
    const image = $('.review-line', section);

    let maxScroll = 0;

    function update() {
        if (!image) return;
        maxScroll = Math.max(0, image.scrollWidth - window.innerWidth);
    }

    function onScroll() {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;

        const progress = Math.min(
            Math.max(-rect.top / (sectionHeight - window.innerHeight), 0),
            1
        );

        if (track) {
            track.style.transform = `translateX(-${progress * maxScroll}px)`;
        }
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', onScroll);
});


// ======================================================
// 2. BURGER MENU
// ======================================================
const burger = $('.burger');
const mobileMenu = $('.mobile-menu');
const mobileLinks = $$('.mobile-link');
const mobileCloseBtn = $('.mobile-close-btn');

function openMenu() {
    mobileMenu?.classList.add('active');
    burger?.classList.add('active');
    document.body.classList.add('menu-open');
}

function closeMenu() {
    mobileMenu?.classList.remove('active');
    burger?.classList.remove('active');
    document.body.classList.remove('menu-open');
}

burger?.addEventListener('click', () => {
    mobileMenu?.classList.contains('active') ? closeMenu() : openMenu();
});

document.addEventListener('click', e => {
    if (mobileMenu?.classList.contains('active') &&
        !mobileMenu.contains(e.target) &&
        !burger.contains(e.target)
    ) closeMenu();
});

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
mobileCloseBtn?.addEventListener('click', closeMenu);


// ======================================================
// 3. CONTACT FORM POPUP (INDEX)
// ======================================================
const form = $('#contactForm');
const popup = $('#popupOverlay');

function openPopup() {
    popup?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    popup?.classList.remove('active');
    document.body.style.overflow = '';
}

form?.addEventListener('submit', e => {
    e.preventDefault();

    const tg = $('#tg');
    const phone = $('#phone');
    const message = $('#message');

    let valid = true;

    const check = (field, msg) => {
        const err = field.parentElement.querySelector('.error');
        if (!field.checkValidity()) {
            valid = false;
            if (err) err.textContent = msg;
        } else if (err) err.textContent = '';
    };

    check(tg, "Telegram неверный");
    check(phone, "Телефон неверный");
    check(message, "Слишком короткое сообщение");

    if (valid) {
        openPopup();
        form.reset();
    }
});

$('#popupClose')?.addEventListener('click', closePopup);
$('#popupBtnOk')?.addEventListener('click', closePopup);
popup?.addEventListener('click', e => {
    if (e.target === popup) closePopup();
});


// ======================================================
// 4. HEADER SCROLL
// ======================================================
const header = $('.header');

const sectionsMap = [
    ['.main-container', 'header-transparent'],
    ['.pink', 'header-pink'],
    ['.weare', 'header-weare'],
    ['.pluses', 'header-pluses'],
    ['.classes', 'header-classes'],
    ['.faq', 'header-faq'],
    ['.contacts', 'header-contacts'],
    ['.map-block', 'header-map']
];

function updateHeader() {
    if (!header) return;

    const scroll = window.scrollY + 120;
    let active = 'header-transparent';

    for (const [sel, cls] of sectionsMap) {
        const el = $(sel);
        if (!el) continue;

        if (scroll >= el.offsetTop && scroll < el.offsetTop + el.offsetHeight) {
            active = cls;
            break;
        }
    }

    header.className = `header ${active}`;
}

window.addEventListener('scroll', updateHeader);
window.addEventListener('resize', updateHeader);
updateHeader();


// ======================================================
// 5. PRODUCTS SWITCH
// ======================================================
$$('.item1').forEach(item => {
    const btns = $$('.circle-btn', item);
    const img = $('.main-product-img', item);

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            img.src = btn.dataset.img;
        });
    });
});


// -------------------------- КОРЗИНА С УВЕДОМЛЕНИЕМ И LOCALSTORAGE --------------------------
let cartCount = 0;
let cartItems = [];

const cartCountElement = document.querySelector('.cart-count');
const cartNotification = document.getElementById('cartNotification');
const cartNotificationSpan = cartNotification?.querySelector('span');

function getActiveVariant(item) {
    const btns = item.querySelectorAll('.btit .circle-btn');
    let activeVariant = '';
    
    btns.forEach((btn, index) => {
        if (btn.classList.contains('active')) {
            if (item.classList.contains('item-certificate')) {
                activeVariant = index === 0 ? 'розовый' : 'фиолетовый';
            }
            else if (item.classList.contains('item-bottle')) {
                activeVariant = index === 0 ? 'розовый' : 'черный';
            }
            else if (item.classList.contains('item-longsleeve')) {
                activeVariant = index === 0 ? 'черный' : 'розовый';
            }
            else if (item.classList.contains('item-book')) {
                activeVariant = 'белый';
            }
            else if (item.classList.contains('item-shopper')) {
                activeVariant = 'черный';
            }
            else if (item.classList.contains('item-candle')) {
                activeVariant = 'жасмин';
            }
            else {
                activeVariant = index === 0 ? 'вариант 1' : 'вариант 2';
            }
        }
    });
    
    return activeVariant;
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify({
        count: cartCount,
        items: cartItems
    }));
}

function loadCartFromLocalStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            cartCount = data.count || 0;
            cartItems = data.items || [];
            updateCartCount();
            updateCartPageDisplay();
        } catch(e) {
            console.error('Ошибка загрузки корзины', e);
        }
    }
}

function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        if (cartCount === 0) {
            cartCountElement.style.opacity = '0.5';
        } else {
            cartCountElement.style.opacity = '1';
        }
    }
    saveCartToLocalStorage();
}

function showNotification(productName, variant) {
    if (cartNotification && cartNotificationSpan) {
        if (variant) {
            cartNotificationSpan.textContent = `${productName} (${variant})`;
        } else {
            cartNotificationSpan.textContent = productName;
        }
        cartNotification.classList.add('show');
        
        setTimeout(() => {
            cartNotification.classList.remove('show');
        }, 2000);
    }
}

// Добавляем обработчики на все кнопки корзины
document.querySelectorAll('.merch-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const item = btn.closest('.item1');
        let productName = '';
        let productVariant = '';
        let productPrice = 0;
        let productImg = '';
        let productDescription = '';
        
        if (item) {
            const nameElement = item.querySelector('.itemtxt h1');
            if (nameElement) {
                productName = nameElement.textContent;
            }
            const priceElement = item.querySelector('h4');
            if (priceElement) {
                const priceText = priceElement.textContent;
                productPrice = parseInt(priceText) || 0;
            }
            const descElement = item.querySelector('.item-description');
            if (descElement) {
                productDescription = descElement.textContent;
            }
            const activeBtn = item.querySelector('.btit .circle-btn.active');
            if (activeBtn) {
                productImg = activeBtn.getAttribute('data-img');
            }
            if (!productImg) {
                const imgElement = item.querySelector('.main-product-img');
                if (imgElement && imgElement.src) {
                    productImg = imgElement.src;
                }
            }
            productVariant = getActiveVariant(item);
        }
        
        cartItems.push({
            name: productName,
            variant: productVariant,
            price: productPrice,
            img: productImg,
            description: productDescription,
            quantity: 1,
            id: Date.now() + Math.random()
        });
        
        cartCount++;
        updateCartCount();
        showNotification(productName, productVariant);
        
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 200);
    });
});

// Функция пересчета корзины
function recalculateCart() {
    let totalCount = 0;
    cartItems.forEach(item => {
        totalCount += (item.quantity || 1);
    });
    cartCount = totalCount;
    
    updateCartCount();
    updateCartPageDisplay();
}

// Обработчики для кнопок
function handleMinusClick(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (cartItems[index]) {
        const currentQty = cartItems[index].quantity || 1;
        if (currentQty > 1) {
            cartItems[index].quantity = currentQty - 1;
        } else {
            cartItems.splice(index, 1);
        }
        recalculateCart();
    }
}

function handlePlusClick(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (cartItems[index]) {
        const currentQty = cartItems[index].quantity || 1;
        cartItems[index].quantity = currentQty + 1;
        recalculateCart();
    }
}

function handleRemoveClick(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (cartItems[index]) {
        cartItems.splice(index, 1);
        recalculateCart();
    }
}

// Функция обновления страницы корзины
function updateCartPageDisplay() {
    const cartEmpty = document.getElementById('cartEmpty');
    const cartGrid = document.getElementById('cartItems');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalSpan = document.getElementById('cartTotal');
    const cartFinalTotalSpan = document.getElementById('cartFinalTotal');
    
    if (!cartItemsList) return;
    
    if (cartCount === 0 || cartItems.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartGrid) cartGrid.style.display = 'none';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartGrid) cartGrid.style.display = 'flex';
    
    cartItemsList.innerHTML = '';
    let total = 0;
    
    cartItems.forEach((item, index) => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-product-item';
        itemRow.innerHTML = `
            <div class="cart-product-img">
                <img src="${item.img || 'images/placeholder.jpg'}" alt="${item.name}">
            </div>
            <div class="cart-product-info">
                <div>
                    <div class="cart-product-title">${item.name}</div>
                    ${item.description ? `<div class="cart-product-description">${item.description}</div>` : ''}
                    ${item.variant ? `<div class="cart-product-variant">${item.variant}</div>` : ''}
                    <div class="cart-product-price">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="cart-product-actions">
                    <div class="cart-product-quantity">
                        <button class="cart-qty-minus" data-index="${index}">-</button>
                        <span class="cart-qty-num">${quantity}</span>
                        <button class="cart-qty-plus" data-index="${index}">+</button>
                    </div>
                    <button class="cart-product-remove" data-index="${index}">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7H20M10 11V16M14 11V16M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        cartItemsList.appendChild(itemRow);
    });
    
    // Обновляем стоимость товаров
    if (cartTotalSpan) {
        cartTotalSpan.textContent = `${total.toLocaleString()} ₽`;
    }
    
    // Обновляем итоговую сумму к оплате
    if (cartFinalTotalSpan) {
        cartFinalTotalSpan.textContent = `${total.toLocaleString()} ₽`;
    }
    
    // Обработчики для кнопок
    document.querySelectorAll('.cart-qty-minus').forEach(btn => {
        btn.removeEventListener('click', handleMinusClick);
        btn.addEventListener('click', handleMinusClick);
    });
    
    document.querySelectorAll('.cart-qty-plus').forEach(btn => {
        btn.removeEventListener('click', handlePlusClick);
        btn.addEventListener('click', handlePlusClick);
    });
    
    document.querySelectorAll('.cart-product-remove').forEach(btn => {
        btn.removeEventListener('click', handleRemoveClick);
        btn.addEventListener('click', handleRemoveClick);
    });
}

// Клик по бейджу корзины - переход на страницу корзины
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        saveCartToLocalStorage();
        window.location.href = 'cart.html';
    });
}

// Загружаем корзину при загрузке страницы
loadCartFromLocalStorage();

// Если мы на странице корзины, обновляем отображение
if (window.location.pathname.includes('cart.html')) {
    updateCartPageDisplay();
}


// ======================================================
// 7. WEDO POPUP
// ======================================================
const classPopup = document.getElementById('classPopup');
const classForm = document.getElementById('classForm');

function openClassPopup(type) {
    const data = {
        open: ['Открытое занятие', '1000 рублей'],
        individual: ['Индивидуальное занятие', '2500 рублей'],
        group: ['Групповое занятие', '5600 рублей']
    };

    if (!data[type]) return;

    document.getElementById('popupTitle').textContent = data[type][0];
    document.getElementById('popupPrice').textContent = data[type][1];
    document.getElementById('classType').value = type;

    classPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeClassPopup() {
    classPopup.classList.remove('active');
    document.body.style.overflow = '';
}

// открыть popup
document.querySelectorAll('.cardtask .btn-new, .cardtask1 .btn-new')
.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const text = btn.closest('.cardtask, .cardtask1')?.innerText || '';

        let type = 'open';
        if (text.includes('Индивидуальное')) type = 'individual';
        if (text.includes('Групповое')) type = 'group';

        openClassPopup(type);
    });
});

document.getElementById('popupClassClose')?.addEventListener('click', closeClassPopup);

classPopup?.addEventListener('click', (e) => {
    if (e.target === classPopup) closeClassPopup();
});


// ======================================================
// 8–9 FIXED SAFE VERSION (НЕ ЛОМАЕТ САЙТ)
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    // ==============================
    // SUCCESS POPUP
    // ==============================



    document.body.appendChild(successPopup);

    function closeSuccess() {
        successPopup.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openSuccess() {
        successPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    successPopup.addEventListener('click', (e) => {
        if (e.target === successPopup) closeSuccess();
    });

    successPopup.querySelector('#wedoSuccessClose')
        .addEventListener('click', closeSuccess);


    // ==============================
    // WEDO FORM
    // ==============================

    const classForm = document.getElementById('classForm');
    const classPopup = document.getElementById('classPopup');

    classForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const phone = document.getElementById('classPhone');
        const tg = document.getElementById('classTg');
        const name = document.getElementById('className');

        let valid = true;

        const validate = (field, msg, regex) => {
            const err = field.parentElement.querySelector('.error');

            if (!field.value.trim()) {
                valid = false;
                if (err) err.textContent = msg;
            } else if (regex && !regex.test(field.value)) {
                valid = false;
                if (err) err.textContent = msg;
            } else {
                if (err) err.textContent = '';
            }
        };

        validate(phone, 'Неверный телефон', /^(\+7|8)\d{10}$/);
        validate(tg, 'Неверный Telegram', /^@[a-zA-Z0-9_]{5,32}$/);
        validate(name, 'Введите имя');

        classForm.reset();
        classPopup?.classList.remove('active');
        document.body.style.overflow = '';

        requestAnimationFrame(() => {
            setTimeout(openSuccess, 80);
        });

        if (!valid) return;
        if (valid) {
            console.log('Заявка на занятие:', {
                type: classTypeInput?.value,
                phone: phone?.value,
                tg: tg?.value,
                name: name?.value
            });
            
            alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
            closeClassPopup();
        }
    });

});



const checkoutBtn = document.getElementById('checkoutBtn');
const successPopup = document.getElementById('wedoSuccess');
const closeSuccess = document.getElementById('closeSuccess');

checkoutBtn.addEventListener('click', () => {
    successPopup.classList.add('active');

    // ⬇️ ОЧИСТКА КОРЗИНЫ ПРИ ОПЛАТЕ
    cartItems = [];
    cartCount = 0;

    updateCartCount();
    updateCartPageDisplay();
    saveCartToLocalStorage();
});

closeSuccess.addEventListener('click', () => {
    successPopup.classList.remove('active');
});

// закрытие по клику вне окна
successPopup.addEventListener('click', (e) => {
    if (e.target === successPopup) {
        successPopup.classList.remove('active');
    }
});







