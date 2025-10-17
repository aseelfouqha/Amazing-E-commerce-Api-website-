// Utility functions
const API_BASE = 'https://dummyjson.com';

// Enhanced fetch with timeout and better error handling
async function fetchData(url) {
    try {
        showLoadingState(true);
        console.log('🔍 Fetching from:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        showLoadingState(false);
        return data;
    } catch (error) {
        showLoadingState(false);
        console.error('❌ Fetch error:', error);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your internet connection.');
        }
        
        throw new Error(`Failed to load data: ${error.message}`);
    }
}

// Show loading state
function showLoadingState(show) {
    let loadingElement = document.getElementById('global-loading');
    
    if (show) {
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'global-loading';
            loadingElement.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                    <div>Loading Amazing Store...</div>
                </div>
            `;
            loadingElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999;
                font-size: 1.2rem;
                font-weight: bold;
                border: 3px solid #ff69b4;
            `;
            document.body.appendChild(loadingElement);
        }
        loadingElement.style.display = 'block';
    } else if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Show error message
function showError(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="error" style="text-align: center; padding: 3rem; background: #ffe6e6; border-radius: 10px; border-left: 4px solid #ff0000;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😞</div>
                <h3 style="color: #ff0000; margin-bottom: 1rem;">Oops! Something went wrong</h3>
                <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary" style="padding: 12px 24px; font-size: 1.1rem;">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}

// Format price
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (halfStar) {
        stars += '½';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    return `<span style="color: #ffd700; font-size: 1.2em;">${stars}</span> <span style="color: #666;">(${rating})</span>`;
}

// Navigate to product details
function navigateToProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Navigate to category products
function navigateToCategory(category) {
    window.location.href = `categories.html?category=${encodeURIComponent(category)}`;
}

// Navigate to search results
function navigateToSearch(query) {
    if (query.trim()) {
        window.location.href = `search.html?q=${encodeURIComponent(query.trim())}`;
    }
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format category name
function formatCategory(category) {
    if (!category) return '';
    return category.split('-').map(word => capitalizeFirst(word)).join(' ');
}

// Display products in grid
function displayProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: #666;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                <h3 style="color: #333; margin-bottom: 1rem;">No Products Found</h3>
                <p style="margin-bottom: 2rem; font-size: 1.1rem;">We couldn't find any products matching your criteria.</p>
                <a href="products.html" class="btn btn-primary" style="padding: 12px 24px;">Browse All Products</a>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="navigateToProductDetails(${product.id})">
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/300x200/ff69b4/ffffff?text=No+Image'">
            <div class="product-title">${product.title}</div>
            <div class="product-rating">${generateStarRating(product.rating)}</div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-brand">${product.brand || 'No Brand'}</div>
            <div class="product-category">${formatCategory(product.category)}</div>
            ${product.discountPercentage ? `<div class="product-discount">${product.discountPercentage}% OFF</div>` : ''}
        </div>
    `).join('');
}

// Display categories
function displayCategories(categories, container) {
    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📂</div>
                <h3>No Categories Available</h3>
                <p>Categories will be available soon.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(category => `
        <div class="category-card" onclick="navigateToCategory('${category}')">
            <h3>${formatCategory(category)}</h3>
            <p style="margin-top: 0.5rem; opacity: 0.8;">Browse ${formatCategory(category).toLowerCase()}</p>
        </div>
    `).join('');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">${type === 'success' ? '✅' : '❌'}</span>
            <span>${message}</span>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: bold;
        font-size: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}