// Product details page functionality
document.addEventListener('DOMContentLoaded', async function() {
    const params = getUrlParams();
    if (params.id) {
        await loadProductDetails(params.id);
    } else {
        showError(document.getElementById('product-details'), 'Product ID not specified.');
    }
});

async function loadProductDetails(productId) {
    const productContainer = document.getElementById('product-details');
    if (!productContainer) return;

    try {
        const product = await fetchData(`${API_BASE}/products/${productId}`);
        displayProductDetails(product);
    } catch (error) {
        showError(productContainer, 'Failed to load product details. Please try again later.');
    }
}

function displayProductDetails(product) {
    const container = document.getElementById('product-details');
    
    const discountBadge = product.discountPercentage ? 
        `<div class="discount-badge" style="background: var(--primary-red); color: white; padding: 0.5rem 1rem; border-radius: 5px; display: inline-block; margin-bottom: 1rem; font-weight: bold;">
            ${product.discountPercentage}% OFF
        </div>` : '';

    const originalPrice = product.discountPercentage ? 
        `<div style="text-decoration: line-through; color: #666; font-size: 1.2rem;">
            $${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
        </div>` : '';

    const imagesHTML = product.images && product.images.length > 0 ? 
        product.images.map(img => `
            <img src="${img}" alt="${product.title}" 
                 onerror="this.style.display='none'">
        `).join('') : '';

    container.innerHTML = `
        <div class="product-details-container">
            <div class="product-images">
                <img src="${product.thumbnail}" alt="${product.title}" class="product-image-large"
                     onerror="this.src='https://via.placeholder.com/500x400?text=No+Image'">
                ${imagesHTML ? `
                <div class="product-gallery">
                    ${imagesHTML}
                </div>
                ` : ''}
            </div>
            
            <div class="product-info">
                ${discountBadge}
                <h1>${product.title}</h1>
                <div class="product-rating-large">${generateStarRating(product.rating)}</div>
                ${originalPrice}
                <div class="product-price-large">${formatPrice(product.price)}</div>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Brand:</span>
                        <span class="meta-value">${product.brand || 'Not specified'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Category:</span>
                        <span class="meta-value">${formatCategory(product.category)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Stock:</span>
                        <span class="meta-value">${product.stock} units available</span>
                    </div>
                </div>
                
                <div class="product-description">
                    <h3>Description</h3>
                    <p>${product.description}</p>
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;">
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary" onclick="addToWishlist(${product.id})">
                        ♥ Wishlist
                    </button>
                </div>

                ${product.reviews && product.reviews.length > 0 ? `
                <div class="reviews-section">
                    <h3>Customer Reviews</h3>
                    ${product.reviews.map(review => `
                        <div class="review-card">
                            <div class="review-header">
                                <span class="reviewer-name">${review.reviewerName}</span>
                                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            <div class="review-rating">${generateStarRating(review.rating)}</div>
                            <p>${review.comment}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </div>
    `;

    // Add gallery functionality
    setupImageGallery();
}

function setupImageGallery() {
    const mainImage = document.querySelector('.product-image-large');
    const galleryImages = document.querySelectorAll('.product-gallery img');
    
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            // Update main image
            mainImage.src = this.src;
            
            // Update active state
            galleryImages.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
        
        // Set first image as active
        if (galleryImages.length > 0) {
            galleryImages[0].classList.add('active');
        }
    });
}

function addToWishlist(productId) {
    if (!isAuthenticated()) {
        showNotification('Please sign in to add items to wishlist', 'error');
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 1500);
        return;
    }
    
    // In a real app, you'd save to backend
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showNotification('Added to wishlist!', 'success');
    } else {
        showNotification('Already in wishlist!', 'error');
    }
}

function deleteProduct(productId) {
    if (!isAuthenticated()) {
        showNotification('Please sign in to delete products', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this product?')) {
        deleteData(`${API_BASE}/products/${productId}`)
            .then(() => {
                showNotification('Product deleted successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1000);
            })
            .catch(error => {
                showNotification('Failed to delete product', 'error');
                console.error('Delete error:', error);
            });
    }
}