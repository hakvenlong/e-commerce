// Function to show custom alert
function showCustomAlert(message, type = 'success') {
    const existingAlerts = document.querySelectorAll('.custom-alert');
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = `${20 + (existingAlerts.length * 80)}px`; // Stack vertically
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050';
    alertDiv.style.minWidth = '200px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        alertDiv.classList.add('fade');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Wishlist class to manage wishlist items
class Wishlist {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    // Add item to wishlist
    addItem(id, name, price, image) {
        // Validate inputs
        if (!id || !name || !price || !image) {
            showCustomAlert('Cannot add item to wishlist: Missing product details.', 'danger');
            return;
        }
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            showCustomAlert('Cannot add item to wishlist: Invalid price.', 'danger');
            return;
        }
        const existingItem = this.wishlist.find(item => item.id === id);
        if (!existingItem) {
            this.wishlist.push({ id, name, price: parsedPrice, image });
            this.saveWishlist();
            this.updateWishlistDisplay();
            showCustomAlert(`${name} added to wishlist!`, 'success');
        } else {
            showCustomAlert(`${name} is already in your wishlist!`, 'warning');
        }
    }

    // Remove item from wishlist
    removeItem(id) {
        const item = this.wishlist.find(item => item.id === id);
        this.wishlist = this.wishlist.filter(item => item.id !== id);
        this.saveWishlist();
        this.updateWishlistDisplay();
        // if (item) showCustomAlert(`${item.name} removed from wishlist!`, 'warning');
    }

    // Save wishlist to localStorage
    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    // Update wishlist display on wishlist page
    updateWishlistDisplay() {
        const wishlistItemsContainer = document.getElementById('wishlist-items');
        if (!wishlistItemsContainer) return;

        wishlistItemsContainer.innerHTML = '';
        if (this.wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">Your wishlist is empty.</td>
                </tr>
            `;
            return;
        }

        this.wishlist.forEach(item => {
            // Ensure item has valid properties 
            const itemId = item.id || 'N/A';
            const itemName = item.name || 'Unknown Item';
            const itemPrice = !isNaN(parseFloat(item.price)) ? parseFloat(item.price).toFixed(2) : '0.00';
            const itemImage = item.image || './images/placeholder.png'; // Fallback image if missing

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${itemImage}" alt="${itemName}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                        <span>${itemName}<br><small>Web ID: ${itemId}</small></span>
                    </div>
                </td>
                <td>$${itemPrice}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2 btn-add-cart" data-id="${itemId}" data-name="${itemName}" data-price="${itemPrice}" data-image="${itemImage}" aria-label="Move to Cart">Add to Cart</button>
                    <button class="btn btn-danger btn-sm remove-btn" data-id="${itemId}" aria-label="Remove from Wishlist">Remove</button>
                </td>
            `;
            wishlistItemsContainer.appendChild(row);
        });
    }
}

// Initialize wishlist
const wishlist = new Wishlist();

// Event listeners for shop and wishlist pages
document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-add-wishlist')) {
        const card = e.target.closest('.card');
        if (!card) {
            showCustomAlert('Error: Product card not found.', 'danger');
            return;
        }
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = card.dataset.price;
        const image = card.dataset.image;
        wishlist.addItem(id, name, price, image);
    } else if (e.target.classList.contains('remove-btn')) {
        const id = e.target.dataset.id;
        if (id) wishlist.removeItem(id);
    } else if (e.target.classList.contains('btn-add-cart')) {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = parseFloat(e.target.dataset.price);
        const image = e.target.dataset.image;
        if (id && name && !isNaN(price) && image) {
            addToCart({ id, name, price, image }); // Assumes addToCart is globally available from cart.js
            wishlist.removeItem(id);
        } 
    }
});

// Initialize wishlist display on page load
document.addEventListener('DOMContentLoaded', () => {
    wishlist.updateWishlistDisplay();
});