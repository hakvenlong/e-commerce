document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    const orderSummary = document.getElementById('order-summary');
    const subtotalElement = document.getElementById('subtotal');
    const orderTotalElement = document.getElementById('order-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutContent = document.getElementById('checkout-content');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const shippingForm = document.getElementById('shipping-form');
    const paymentForm = document.getElementById('payment-form');

    // Filter cart items to include only selected items
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));

    // Display cart items or show empty message
    if (itemsToCheckout.length === 0) {
        emptyCartMessage.style.display = 'block';
        checkoutContent.style.display = 'none';
        placeOrderBtn.disabled = true;
    } else {
        emptyCartMessage.style.display = 'none';
        checkoutContent.style.display = 'flex';
        let subtotal = 0;

        itemsToCheckout.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            `;
            orderSummary.appendChild(row);
        });

        const shipping = 5.00;
        const total = subtotal + shipping;

        subtotalElement.textContent = subtotal.toFixed(2);
        orderTotalElement.textContent = total.toFixed(2);
    }

    // Validate forms and enable/disable Place Order button
    function validateForms() {
        const shippingValid = shippingForm.checkValidity();
        const paymentValid = paymentForm.checkValidity();
        placeOrderBtn.disabled = !(shippingValid && paymentValid && itemsToCheckout.length > 0);
    }

    shippingForm.addEventListener('input', validateForms);
    paymentForm.addEventListener('input', validateForms);

    // Handle Place Order button click
    placeOrderBtn.addEventListener('click', () => {
        if (shippingForm.checkValidity() && paymentForm.checkValidity()) {
            // Remove only selected items from cart
            const remainingItems = cartItems.filter(item => !selectedItems.includes(item.id));
            localStorage.setItem('cartItems', JSON.stringify(remainingItems));
            localStorage.removeItem('selectedItems');
            showCustomAlert('Order placed successfully! Thank you for shopping with SMOS.', 'success my-2');
            window.location.href = './index.html';
        }
    });

    // Initialize AOS
    AOS.init({ duration: 800, once: true });
});