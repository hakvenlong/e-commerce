function showCustomAlert(message, type) {
    alert(`${type === 'success' ? 'Success: ' : 'Info: '} ${message}`);
}

let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');

function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
        // Auto-select newly added item for checkout
        let selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
        if (!selectedItems.includes(product.id)) {
            selectedItems.push(product.id);
            localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
        }
    }
    saveCart();
    updateCartDisplay();
    showCustomAlert('Item added to your cart!', 'success my-2');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    // Remove from selectedItems
    let selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    selectedItems = selectedItems.filter(id => id !== productId);
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    saveCart();
    updateCartDisplay();
    showCustomAlert('Item removed from your cart!', 'info my-2');
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartDisplay();
            showCustomAlert('Quantity updated!', 'success my-2');
        }
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkAllCheckbox = document.getElementById('check-all');

    if (!cartItemsContainer || !cartTotalElement || !emptyCartMessage || !checkoutBtn || !checkAllCheckbox) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        checkoutBtn.disabled = true;
        checkAllCheckbox.disabled = true;
        checkAllCheckbox.checked = false;
        cartTotalElement.textContent = '0.00';
        return;
    }

    emptyCartMessage.style.display = 'none';
    checkAllCheckbox.disabled = false;

    let selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');

    cart.forEach(item => {
        const isChecked = selectedItems.includes(item.id) ? 'checked' : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="cart-item-checkbox" data-id="${item.id}" ${isChecked}>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.image || './images/placeholder.png'}" alt="${item.name || 'Unknown Item'}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <span>${item.name || 'Unknown Item'}</span>
                </div>
            </td>
            <td>$${parseFloat(item.price || 0).toFixed(2)}</td>
            <td>
                <div class="quantity-controls d-flex justify-content-around">
                    <button class="btn btn-secondary btn-sm quantity-decrease" data-id="${item.id}">-</button>
                    <input type="text" class="form-control quantity-input" value="${item.quantity}" min="0" data-id="${item.id}" style="width: 50px; text-align: center;" readonly>
                    <button class="btn btn-secondary btn-sm quantity-increase" data-id="${item.id}">+</button>
                </div>
            </td>
            <td>$${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}" aria-label="Remove ${item.name || 'item'}">Remove</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });

    // Calculate total for selected items
    const updateSelectedTotal = () => {
        selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
        const total = cart
            .filter(item => selectedItems.includes(item.id))
            .reduce((sum, item) => sum + parseFloat(item.price || 0) * item.quantity, 0);
        cartTotalElement.textContent = total.toFixed(2);
        checkoutBtn.disabled = selectedItems.length === 0;
        checkAllCheckbox.checked = selectedItems.length === cart.length && cart.length > 0;
    };

    // Handle "Check All" checkbox
    checkAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        selectedItems = isChecked ? cart.map(item => item.id) : [];
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
        document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateSelectedTotal();
    });

    // Handle individual item checkboxes
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const productId = e.target.dataset.id;
            if (e.target.checked) {
                if (!selectedItems.includes(productId)) {
                    selectedItems.push(productId);
                }
            } else {
                selectedItems = selectedItems.filter(id => id !== productId);
                checkAllCheckbox.checked = false;
            }
            localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
            updateSelectedTotal();
        });
    });

    // Add event listeners for increase and decrease buttons
    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += 1;
                saveCart();
                updateCartDisplay();
                showCustomAlert('Quantity increased!', 'success my-2');
            }
        });
    });

    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const item = cart.find(item => item.id === productId);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                saveCart();
                updateCartDisplay();
                showCustomAlert('Quantity decreased!', 'success my-2');
            } else if (item && item.quantity === 1) {
                removeFromCart(productId);
            }
        });
    });

    // Keep change event for manual input (optional)
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.dataset.id;
            const quantity = e.target.value;
            updateQuantity(productId, quantity);
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        });
    });

    // Initial total update
    updateSelectedTotal();
}

function initializeCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) {
                showCustomAlert('Error: Product card not found.', 'danger my-2');
                return;
            }

            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = card.dataset.price;
            const image = card.dataset.image;

            if (!id || !name || !price || !image) {
                showCustomAlert('Cannot add to cart.', 'danger my-2');
                return;
            }

            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice)) {
                showCustomAlert('Cannot add to cart.', 'danger my-2');
                return;
            }

            const product = {
                id: id,
                name: name,
                price: parsedPrice,
                image: image
            };

            addToCart(product);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    initializeCartButtons();
    AOS.init({ duration: 800, once: true });
});

