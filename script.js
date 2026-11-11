
// ==========================================
// КОРЗИНА MINÉ
// ==========================================

let cart = JSON.parse(localStorage.getItem("mine-cart")) || [];

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

const cartOverlay = document.getElementById("cart-overlay");
const openCart = document.getElementById("open-cart");
const closeCart = document.getElementById("close-cart");

// Сохранение корзины

function saveCart() {
    localStorage.setItem("mine-cart", JSON.stringify(cart));
}

// Добавление товара

function addToCart(name, price, size = null) {
    const existingProduct = cart.find(item =>
        item.name === name && item.size === size
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            size: size,
            quantity: 1
        });
    }

    updateCart();
    showNotification("Товар добавлен в корзину");
}

// Удаление товара

function removeFromCart(name, size) {
    cart = cart.filter(item =>
        !(item.name === name && item.size === size)
    );

    updateCart();
}

// Изменение количества

function changeQuantity(name, size, change) {
    const product = cart.find(item =>
        item.name === name && item.size === size
    );

    if (!product) return;

    product.quantity += change;

    if (product.quantity <= 0) {
        removeFromCart(name, size);
        return;
    }

    updateCart();
}

// Обновление корзины

function updateCart() {
    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(product => {
        total += product.price * product.quantity;
        count += product.quantity;

        const item = document.createElement("div");
        item.className = "cart-item";

const productCard = Array.from(
    document.querySelectorAll(".product-card")
).find(card => {
    const name = card.querySelector(".product-info h3");
    return name && name.textContent.trim() === product.name;
});

const productImage = productCard
    ? productCard.querySelector(".product-image img").src
    : "";

        
item.innerHTML = `
    <img
        class="cart-item-image"
        src="${productImage}"
        alt="${product.name}"
    >

    <div class="cart-item-info">
        <h3>${product.name}</h3>

        ${product.size
            ? `<span class="cart-item-size">Размер: ${product.size}</span>`
            : ""
        }

        <span class="cart-item-price">
            ${product.price.toLocaleString("uk-UA")} ₴
        </span>
    </div>

    <div class="quantity-controls">
        <button data-action="decrease">−</button>
        <span>${product.quantity}</span>
        <button data-action="increase">+</button>
        <button data-action="remove">×</button>
    </div>
`;


        item.querySelector('[data-action="decrease"]')
            .addEventListener("click", () =>
                changeQuantity(product.name, product.size, -1)
            );

        item.querySelector('[data-action="increase"]')
            .addEventListener("click", () =>
                changeQuantity(product.name, product.size, 1)
            );

        item.querySelector('[data-action="remove"]')
            .addEventListener("click", () =>
                removeFromCart(product.name, product.size)
            );

        cartItems.appendChild(item);
    });

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Ваша корзина пока пуста.</p>";
    }

    cartCount.textContent = count;
    cartTotal.textContent = total.toLocaleString("uk-UA") + " ₴";

    saveCart();
}

// Кнопки добавления товаров

document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        const productCard = button.closest(".product-card");
        const sizeSelect = productCard.querySelector(".size-select");

        const size = sizeSelect ? sizeSelect.value : null;

        addToCart(name, price, size);
    });
});

// Открытие корзины

openCart.addEventListener("click", () => {
    cartOverlay.classList.add("active");
});

// Закрытие корзины

closeCart.addEventListener("click", () => {
    cartOverlay.classList.remove("active");
});

// Закрытие по нажатию на затемнённую область

cartOverlay.addEventListener("click", event => {
    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("active");
    }
});

// Первоначальная загрузка корзины

updateCart();


// ==========================================
// ФИЛЬТРАЦИЯ, ПОИСК И СОРТИРОВКА
// ==========================================

// Получаем элементы каталога

const filterButtons = document.querySelectorAll(".filter-btn");

const productCards = Array.from(
    document.querySelectorAll(".product-card")
);

const searchInput = document.getElementById("product-search");
const searchEmpty = document.getElementById("search-empty");
const sortSelect = document.getElementById("product-sort");
const productsContainer = document.querySelector(".products");

// Запоминаем первоначальный порядок товаров

const originalProductOrder = [...productCards];

// Общая функция поиска, фильтрации и сортировки

function filterProducts() {

    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const activeFilter = document.querySelector(".filter-btn.active");

    const selectedCategory = activeFilter
        ? activeFilter.dataset.filter
        : "all";

    const sortType = sortSelect.value;

    let sortedProducts = [...originalProductOrder];

    // Сортировка по цене: сначала дешевле

    if (sortType === "cheap") {

        sortedProducts.sort((a, b) => {

            const priceA = Number(
                a.querySelector(".add-to-cart").dataset.price
            );

            const priceB = Number(
                b.querySelector(".add-to-cart").dataset.price
            );

            return priceA - priceB;
        });
    }

    // Сортировка по цене: сначала дороже

    else if (sortType === "expensive") {

        sortedProducts.sort((a, b) => {

            const priceA = Number(
                a.querySelector(".add-to-cart").dataset.price
            );

            const priceB = Number(
                b.querySelector(".add-to-cart").dataset.price
            );

            return priceB - priceA;
        });
    }

    // Сортировка по названию

    else if (sortType === "name") {

        sortedProducts.sort((a, b) => {

            const nameA = a.querySelector(".product-info h3")
                .textContent.trim();

            const nameB = b.querySelector(".product-info h3")
                .textContent.trim();

            return nameA.localeCompare(nameB, "uk");
        });
    }

    // Обновляем порядок карточек

    sortedProducts.forEach(card => {
        productsContainer.appendChild(card);
    });

    // Поиск и фильтрация

    let visibleCount = 0;

    sortedProducts.forEach(card => {

        const productName = card
            .querySelector(".product-info h3")
            .textContent
            .trim()
            .toLowerCase();

        const productCategory = card.dataset.category;

        const matchesSearch = productName.includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        if (matchesSearch && matchesCategory) {

            card.classList.remove("hidden");
            visibleCount++;

        } else {

            card.classList.add("hidden");
        }
    });

    // Сообщение, если ничего не найдено

    searchEmpty.hidden = visibleCount !== 0;
}

// Нажатие на кнопки категорий

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        filterProducts();
    });
});

// Поиск при вводе текста

searchInput.addEventListener("input", filterProducts);

// Сортировка при изменении выбора

sortSelect.addEventListener("change", filterProducts);

// Первоначальное отображение каталога

filterProducts();



/* ИЗБРАННОЕ */

let savedFavoriteNames = JSON.parse(
    localStorage.getItem("mineFavorites") || "[]"
);

const favoriteButtons = document.querySelectorAll(".favorite-btn");
const favoriteCountElement = document.getElementById("favorite-count");

const openFavoritesButton = document.getElementById("open-favorites");
const closeFavoritesButton = document.getElementById("close-favorites");
const favoritesOverlay = document.getElementById("favorites-overlay");
const favoritesItems = document.getElementById("favorites-items");

function updateFavoriteButtons() {
    favoriteButtons.forEach(button => {
        const productName = button.dataset.name;
        const isFavorite = savedFavoriteNames.includes(productName);

        button.classList.toggle("active", isFavorite);
        button.textContent = isFavorite ? "♥" : "♡";

        button.setAttribute(
            "aria-label",
            isFavorite ? "Удалить из избранного" : "Добавить в избранное"
        );
    });

    if (favoriteCountElement) {
        favoriteCountElement.textContent = savedFavoriteNames.length;
    }
}


function renderFavorites() {
    favoritesItems.innerHTML = "";

    if (savedFavoriteNames.length === 0) {
        favoritesItems.innerHTML = `
            <p class="favorites-empty">
                Здесь пока нет избранных товаров.
            </p>
        `;
        return;
    }

    savedFavoriteNames.forEach(productName => {
        const product = Array.from(
            document.querySelectorAll(".product-card")
        ).find(card => {
            const name = card.querySelector(".product-info h3");
            return name && name.textContent.trim() === productName;
        });

        if (!product) return;

        const image = product.querySelector(".product-image img");
        const price = product.querySelector(".product-info span");

        const item = document.createElement("div");
        item.className = "favorite-item";

        const itemImage = document.createElement("img");
        itemImage.src = image ? image.src : "";
        itemImage.alt = productName;

        const itemInfo = document.createElement("div");
        itemInfo.className = "favorite-item-info";

        const itemName = document.createElement("h3");
        itemName.textContent = productName;

        const itemPrice = document.createElement("p");
        itemPrice.textContent = price ? price.textContent : "";

        const removeButton = document.createElement("button");
        removeButton.className = "remove-favorite";
        removeButton.textContent = "Удалить";

        removeButton.addEventListener("click", () => {
            savedFavoriteNames = savedFavoriteNames.filter(
                name => name !== productName
            );

            localStorage.setItem(
                "mineFavorites",
                JSON.stringify(savedFavoriteNames)
            );

            updateFavoriteButtons();
            renderFavorites();
        });

        itemInfo.append(itemName, itemPrice, removeButton);
        item.append(itemImage, itemInfo);
        favoritesItems.appendChild(item);
    });
}


function openFavorites() {
    renderFavorites();
    favoritesOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeFavorites() {
    favoritesOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

favoriteButtons.forEach(button => {
    button.addEventListener("click", () => {
        const productName = button.dataset.name;

        if (savedFavoriteNames.includes(productName)) {
            savedFavoriteNames = savedFavoriteNames.filter(
                name => name !== productName
            );
        } else {
            savedFavoriteNames.push(productName);
        }

        localStorage.setItem(
            "mineFavorites",
            JSON.stringify(savedFavoriteNames)
        );

        updateFavoriteButtons();
    });
});

if (openFavoritesButton) {
    openFavoritesButton.addEventListener("click", openFavorites);
}

if (closeFavoritesButton) {
    closeFavoritesButton.addEventListener("click", closeFavorites);
}

if (favoritesOverlay) {
    favoritesOverlay.addEventListener("click", event => {
        if (event.target === favoritesOverlay) {
            closeFavorites();
        }
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && favoritesOverlay?.classList.contains("active")) {
        closeFavorites();
    }
});

updateFavoriteButtons();




/* ==========================================
   ОФОРМЛЕНИЕ ЗАКАЗА MINÉ
========================================== */

const checkoutOpen = document.getElementById("checkout-open");
const checkoutWrapper = document.getElementById("checkout-form-wrapper");
const checkoutForm = document.getElementById("checkout-form");
const checkoutSuccess = document.getElementById("checkout-success");

if (checkoutOpen && checkoutWrapper) {
    checkoutOpen.addEventListener("click", () => {
        if (cart.length === 0) {
            showNotification("Сначала добавьте товары в корзину");
            return;
        }

        checkoutWrapper.classList.add("active");
        checkoutOpen.style.display = "none";
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (cart.length === 0) {
            showNotification("Ваша корзина пуста");
            return;
        }

        const customerName = document.getElementById("customer-name").value.trim();
        const customerPhone = document.getElementById("customer-phone").value.trim();
        const deliveryMethod = document.getElementById("delivery-method").value;
        const deliveryAddress = document.getElementById("delivery-address").value.trim();

        if (!customerName || !customerPhone || !deliveryMethod || !deliveryAddress) {
            showNotification("Заполните все поля");
            return;
        }

        const submitButton = checkoutForm.querySelector('[type="submit"]');

        if (submitButton.disabled) return;

        submitButton.disabled = true;
        submitButton.textContent = "Отправка...";

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: customerName,
                    phone: customerPhone,
                    delivery: deliveryMethod,
                    address: deliveryAddress,
                    items: cart.map(item => ({ ...item }))
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Не удалось отправить заказ");
            }

            console.log("Тестовый заказ успешно отправлен!");

            // Очищаем корзину только после успешной отправки
            cart = [];
            localStorage.setItem("mine-cart", JSON.stringify(cart));
            updateCart();

            // Показываем подтверждение
            checkoutForm.style.display = "none";
            checkoutSuccess.classList.add("active");

            setTimeout(() => {
                checkoutSuccess.classList.remove("active");
                checkoutForm.reset();
                checkoutForm.style.display = "block";
                checkoutWrapper.classList.remove("active");
                checkoutOpen.style.display = "block";
            }, 4000);

            showNotification("Заказ успешно отправлен!");

        } catch (error) {
            console.error("Ошибка оформления заказа:", error);
            showNotification(error.message || "Ошибка отправки заказа");

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Подтвердить заказ";
        }
    });
}


/* ==========================================
   УВЕДОМЛЕНИЯ MINÉ
========================================== */

let notificationTimer;

function showNotification(message) {
    const notification = document.getElementById("mine-notification");
    const notificationText = document.getElementById("mine-notification-text");

    if (!notification || !notificationText) return;

    clearTimeout(notificationTimer);

    notificationText.textContent = message;
    notification.classList.add("active");

    notificationTimer = setTimeout(() => {
        notification.classList.remove("active");
    }, 2800);
}
