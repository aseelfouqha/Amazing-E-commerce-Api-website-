// Manage Products functionality
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🛠️ Initializing Product Management...');
    
    await loadRecentProducts();
    setupEventListeners();
});

// Load recent products
async function loadRecentProducts() {
    const productsContainer = document.getElementById('recent-products');
    if (!productsContainer) return;

    try {
        const data = await fetchData(`${API_BASE}/products?limit=10`);
        if (data && data.products) {
            displayRecentProducts(data.products, productsContainer);
        }
    } catch (error) {
        console.error('Error loading recent products:', error);
        showError(productsContainer, 'Failed to load recent products.');
    }
}

function displayRecentProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/300x200/ff69b4/ffffff?text=No+Image'">
            <div class="product-title">${product.title}</div>
            <div class="product-rating">${generateStarRating(product.rating)}</div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-brand">${product.brand || 'No Brand'}</div>
            <div class="product-category">${formatCategory(product.category)}</div>
            <div style="margin-top: 1rem; font-size: 0.8rem; color: #666;">
                ID: ${product.id}
            </div>
            <button onclick="deleteProductById(${product.id})" class="btn btn-danger" style="margin-top: 0.5rem; width: 100%;">
                Delete This Product
            </button>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Add product form
    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }

    // Delete product form
    const deleteForm = document.getElementById('delete-product-form');
    if (deleteForm) {
        deleteForm.addEventListener('submit', handleDeleteProduct);
    }

    // Search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (query) {
                navigateToSearch(query);
            }
        });
    }
}

// Handle add product
async function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        discountPercentage: parseFloat(formData.get('discountPercentage')) || 0,
        rating: parseFloat(formData.get('rating')) || 0,
        stock: parseInt(formData.get('stock')),
        brand: formData.get('brand'),
        category: formData.get('category'),
        thumbnail: formData.get('thumbnail') || 'https://via.placeholder.com/300x300/ff69b4/ffffff?text=Product+Image'
    };

    // Show request
    showAddRequest(productData);
    
    try {
        console.log('🔄 Adding product...', productData);
        
        const response = await fetch(`${API_BASE}/products/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        
        // Show response
        showAddResponse(result, response.status);
        
        if (response.ok && result.id) {
            showNotification('Product added successfully!', 'success');
            // Reset form
            event.target.reset();
            // Reload recent products
            await loadRecentProducts();
        } else {
            throw new Error(result.message || 'Failed to add product');
        }
    } catch (error) {
        console.error('❌ Error adding product:', error);
        showAddResponse({ error: error.message }, 500);
        showNotification('Failed to add product: ' + error.message, 'error');
    }
}

// Handle delete product
async function handleDeleteProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productId = formData.get('productId');

    if (!productId) {
        showNotification('Please enter a product ID', 'error');
        return;
    }

    // Show request
    showDeleteRequest(productId);
    
    try {
        console.log('🗑️ Deleting product...', productId);
        
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        // Show response
        showDeleteResponse(result, response.status);
        
        if (response.ok) {
            showNotification('Product deleted successfully!', 'success');
            // Reset form
            event.target.reset();
            // Reload recent products
            await loadRecentProducts();
        } else {
            throw new Error(result.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showDeleteResponse({ error: error.message }, 500);
        showNotification('Failed to delete product: ' + error.message, 'error');
    }
}

// Delete product by ID (from recent products list)
async function deleteProductById(productId) {
    if (!confirm(`Are you sure you want to delete product #${productId}?`)) {
        return;
    }

    try {
        console.log('🗑️ Deleting product...', productId);
        
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (response.ok) {
            showNotification(`Product #${productId} deleted successfully!`, 'success');
            // Reload recent products
            await loadRecentProducts();
        } else {
            throw new Error(result.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showNotification('Failed to delete product: ' + error.message, 'error');
    }
}

// Show add request details
function showAddRequest(productData) {
    const display = document.getElementById('add-request-display');
    const code = document.getElementById('add-request-code');
    
    const requestDetails = {
        method: 'POST',
        url: `${API_BASE}/products/add`,
        headers: {
            'Content-Type': 'application/json'
        },
        body: productData
    };
    
    code.textContent = JSON.stringify(requestDetails, null, 2);
    display.style.display = 'block';
}

// Show add response
function showAddResponse(result, status) {
    const responseDiv = document.getElementById('add-response');
    
    const responseDetails = {
        status: status,
        data: result
    };
    
    const statusColor = status >= 200 && status < 300 ? '#4CAF50' : '#f44336';
    
    responseDiv.innerHTML = `
        <div style="background: ${statusColor}20; padding: 1rem; border-radius: 5px; border-left: 4px solid ${statusColor};">
            <strong>Response (Status: ${status}):</strong>
            <pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 0.5rem;">${JSON.stringify(responseDetails, null, 2)}</pre>
        </div>
    `;
}

// Show delete request details
function showDeleteRequest(productId) {
    const display = document.getElementById('delete-request-display');
    const code = document.getElementById('delete-request-code');
    
    const requestDetails = {
        method: 'DELETE',
        url: `${API_BASE}/products/${productId}`
    };
    
    code.textContent = JSON.stringify(requestDetails, null, 2);
    display.style.display = 'block';
}

// Show delete response
function showDeleteResponse(result, status) {
    const responseDiv = document.getElementById('delete-response');
    
    const responseDetails = {
        status: status,
        data: result
    };
    
    const statusColor = status >= 200 && status < 300 ? '#4CAF50' : '#f44336';
    
    responseDiv.innerHTML = `
        <div style="background: ${statusColor}20; padding: 1rem; border-radius: 5px; border-left: 4px solid ${statusColor};">
            <strong>Response (Status: ${status}):</strong>
            <pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 0.5rem;">${JSON.stringify(responseDetails, null, 2)}</pre>
        </div>
    `;
}