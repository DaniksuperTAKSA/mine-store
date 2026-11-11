
// ==========================================
// MINÉ — СТРАНИЦА ТОВАРА
// ==========================================

// ДАННЫЕ ТОВАРОВ

const products = {
    jacket: {
        name: "Бежевый жакет",
        price: 2490,       
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
        description: "Элегантный жакет в спокойном бежевом оттенке. Лаконичный дизайн позволяет сочетать его с повседневными и более классическими образами.",
        material: "Полиэстер, вискоза",
        color: "Бежевый",
        type: "clothing"
    },

    shirt: {
        name: "Базовая рубашка",
        price: 1590,
        image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80",
        description: "Универсальная рубашка минималистичного дизайна. Подходит для повседневных образов и легко сочетается с разными элементами гардероба.",
        material: "Хлопок",
        color: "Светлый",
        type: "clothing"
    },

    bag: {
        name: "Минималистичная сумка",
        price: 1890,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
        description: "Стильная сумка с лаконичным дизайном. Практичный аксессуар, который дополнит повседневный образ.",
        material: "Искусственная кожа",
        color: "Бежевый",
        type: "accessory"
    }
};


// ПОЛУЧЕНИЕ ТОВАРА ИЗ URL

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const product = products[productId];

const productDetail = document.getElementById("product-detail");


// ЕСЛИ ТОВАР НЕ НАЙДЕН

if (!product) {
    productDetail.innerHTML = `
        <div class="product-not-found">
            <h2>Товар не найден</h2>
            <a href="index.html#catalog">Вернуться в каталог</a>
        </div>
    `;
} else {

    // ОТОБРАЖЕНИЕ ТОВАРА

    document.title = product.name + " — MINÉ";

    productDetail.innerHTML = `
        
<div class="detail-image">
    <img
        src="${product.image}"
        alt="${product.name}"
        decoding="async"
        fetchpriority="high"
    >
</div>


        <div class="detail-info">

            <span class="detail-label">MINÉ COLLECTION</span>

            <h1>${product.name}</h1>

            <p class="detail-price">
                ${product.price.toLocaleString("uk-UA")} ₴
            </p>

            <p class="detail-description">
                ${product.description}
            </p>

            <div class="detail-characteristics">
                <p><strong>Материал:</strong> ${product.material}</p>
                <p><strong>Цвет:</strong> ${product.color}</p>
            </div>

            ${product.type === "clothing" ? `
                <div class="detail-size">
                    <label for="product-size">Выберите размер:</label>

                    <select id="product-size">
                        <option value="">Выберите размер</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                    </select>
                </div>
            ` : ""}

            <button class="detail-add-cart" id="detail-add-cart">
                Добавить в корзину
            </button>

            <button class="detail-favorite-btn" id="detail-favorite">
                ♡ Добавить в избранное
            </button>

        </div>
    `;

}


// ==========================================
// КОРЗИНА
// ==========================================

let cart = JSON.parse(localStorage.getItem("mine-cart")) || [];

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

const cartOverlay = document.getElementById("cart-overlay");

const openCart = document.getElementById("open-cart");
const closeCart = document.getElementById("close-cart");


function saveCart() {
    localStorage.setItem("mine-cart", JSON.stringify(cart));
}


function updateCart() {

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(item => {

        total += item.price * item.quantity;
        count += item.quantity;

        const image = item.image ||
            Object.values(products).find(p => p.name === item.name)?.image || "";

        const element = document.createElement("div");
        element.className = "cart-item";

        element.innerHTML = `
            <img
    class="cart-item-image"
    src="${image}"
    alt="${item.name}"
    loading="lazy"
    decoding="async"
>

            <div class="cart-item-info">
                <h3>${item.name}</h3>

                ${item.size ? `
                    <span class="cart-item-size">
                        Размер: ${item.size}
                    </span>
                ` : ""}

                <span class="cart-item-price">
                    ${item.price.toLocaleString("uk-UA")} ₴
                </span>
            </div>

            <div class="quantity-controls">
                <button data-action="decrease">−</button>
                <span>${item.quantity}</span>
                <button data-action="increase">+</button>
                <button data-action="remove">×</button>
            </div>
        `;

        element.querySelector('[data-action="decrease"]')
            .addEventListener("click", () => changeQuantity(item, -1));

        element.querySelector('[data-action="increase"]')
            .addEventListener("click", () => changeQuantity(item, 1));

        element.querySelector('[data-action="remove"]')
            .addEventListener("click", () => removeFromCart(item));

        cartItems.appendChild(element);

    });

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p>Ваша корзина пока пуста.</p>
        `;
    }

    cartCount.textContent = count;
    cartTotal.textContent = total.toLocaleString("uk-UA");

    saveCart();
}


function changeQuantity(item, change) {

    const found = cart.find(p =>
        p.name === item.name && p.size === item.size
    );

    if (!found) return;

    found.quantity += change;

    if (found.quantity <= 0) {
        cart = cart.filter(p => p !== found);
    }

    updateCart();
}


function removeFromCart(item) {

    cart = cart.filter(p =>
        !(p.name === item.name && p.size === item.size)
    );

    updateCart();
}


function addProductToCart() {

    if (!product) return;

    let size = null;

    if (product.type === "clothing") {

        size = document.getElementById("product-size").value;

        if (!size) {
            alert("Пожалуйста, выберите размер.");
            return;
        }
    }

    const existing = cart.find(item =>
        item.name === product.name && item.size === size
    );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            size: size,
            quantity: 1,
            image: product.image
        });
    }

    updateCart();

    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}


if (product) {
    document.getElementById("detail-add-cart")
        .addEventListener("click", addProductToCart);
}


openCart.addEventListener("click", () => {
    updateCart();
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
});


closeCart.addEventListener("click", () => {
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "";
});


cartOverlay.addEventListener("click", event => {
    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }
});


// ==========================================
// ИЗБРАННОЕ
// ==========================================

let favorites = JSON.parse(
    localStorage.getItem("mineFavorites") || "[]"
);

const favoriteCount = document.getElementById("favorite-count");

const favoritesOverlay = document.getElementById("favorites-overlay");
const favoritesItems = document.getElementById("favorites-items");

const openFavorites = document.getElementById("open-favorites");
const closeFavorites = document.getElementById("close-favorites");


function saveFavorites() {
    localStorage.setItem("mineFavorites", JSON.stringify(favorites));
}


function updateFavorites() {

    favoriteCount.textContent = favorites.length;

    const button = document.getElementById("detail-favorite");

    if (button && product) {

        const active = favorites.includes(product.name);

        button.classList.toggle("active", active);

        button.textContent = active
            ? "♥ В избранном"
            : "♡ Добавить в избранное";
    }
}


function toggleFavorite() {

    if (!product) return;

    if (favorites.includes(product.name)) {

        favorites = favorites.filter(name => name !== product.name);

    } else {

        favorites.push(product.name);

    }

    saveFavorites();
    updateFavorites();
}


if (product) {
    document.getElementById("detail-favorite")
        .addEventListener("click", toggleFavorite);
}


function renderFavorites() {

    favoritesItems.innerHTML = "";

    if (favorites.length === 0) {
        favoritesItems.innerHTML = `
            <p class="favorites-empty">
                Здесь пока нет избранных товаров.
            </p>
        `;
        return;
    }

    favorites.forEach(name => {

        const item = Object.entries(products)
            .find(([id, p]) => p.name === name);

        if (!item) return;

        const [id, p] = item;

        const element = document.createElement("div");
        element.className = "favorite-item";

        element.innerHTML = `
            <img
    src="${p.image}"
    alt="${p.name}"
    loading="lazy"
    decoding="async"
>

            <div class="favorite-item-info">
                <h3>${p.name}</h3>

                <p>${p.price.toLocaleString("uk-UA")} ₴</p>

                <a href="product.html?id=${id}">
                    Подробнее
                </a>

                <button class="remove-favorite">
                    Удалить
                </button>
            </div>
        `;

        element.querySelector(".remove-favorite")
            .addEventListener("click", () => {

                favorites = favorites.filter(n => n !== name);

                saveFavorites();
                updateFavorites();
                renderFavorites();

            });

        favoritesItems.appendChild(element);

    });

}


openFavorites.addEventListener("click", () => {

    renderFavorites();

    favoritesOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

});


closeFavorites.addEventListener("click", () => {

    favoritesOverlay.classList.remove("active");
    document.body.style.overflow = "";

});


favoritesOverlay.addEventListener("click", event => {

    if (event.target === favoritesOverlay) {

        favoritesOverlay.classList.remove("active");
        document.body.style.overflow = "";

    }

});


// ==========================================
// ЗАПУСК
// ==========================================

updateCart();
updateFavorites();

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        cartOverlay.classList.remove("active");
        favoritesOverlay.classList.remove("active");

        document.body.style.overflow = "";

    }

});
