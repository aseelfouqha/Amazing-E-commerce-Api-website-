// Home page functionality
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Amazing Store...');
    
    // Load data with error handling
    try {
        await Promise.all([
            loadFeaturedProducts(),
            loadCategories()
        ]);
        console.log('✅ All data loaded successfully');
    } catch (error) {
        console.error('❌ Failed to load initial data:', error);
        showNotification('Failed to load store data. Please refresh the page.', 'error');
    }
    
    setupEventListeners();
    updateNavigation();
});

// Load featured products
async function loadFeaturedProducts() {
    const productsContainer = document.getElementById('featured-products');
    if (!productsContainer) {
        console.log('❌ Featured products container not found');
        return;
    }

    try {
        console.log('📦 Loading featured products...');
        const data = await fetchData(`${API_BASE}/products?limit=10`);
        
        if (data && data.products) {
            console.log(`✅ Loaded ${data.products.length} featured products`);
            displayProducts(data.products, productsContainer);
        } else {
            throw new Error('Invalid products data received');
        }
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
        showError(productsContainer, `
            Failed to load featured products. 
            <br><br>
            Possible reasons:
            <br>• Check your internet connection
            <br>• The API might be temporarily down
            <br>• Try refreshing the page
        `);
    }
}

// Load categories - CORRECTED ENDPOINT
async function loadCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) {
        console.log('❌ Categories container not found');
        return;
    }

    try {
        console.log('📂 Loading categories...');
        
        // CORRECT ENDPOINT: Get all product categories
        const categories = await fetchData(`${API_BASE}/products/categories`);
        
        console.log('✅ Categories loaded:', categories);
        
        if (Array.isArray(categories)) {
            displayCategories(categories, categoriesContainer);
        } else {
            throw new Error('Categories data is not an array');
        }
    } catch (error) {
        console.error('❌ Error loading categories:', error);
        
        // Fallback: Use predefined categories if API fails
        const fallbackCategories = [
            'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries',
            'home-decoration', 'furniture', 'tops', 'womens-dresses', 'mens-shirts'
        ];
        
        console.log('🔄 Using fallback categories');
        displayCategories(fallbackCategories, categoriesContainer);
        
        showNotification('Using fallback categories - some features may be limited', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (query) {
                console.log('🔍 Searching for:', query);
                navigateToSearch(query);
            }
        });
    }

    console.log('✅ Event listeners setup complete');
}

// Update navigation based on auth status
function updateNavigation() {
    const authToken = getAuthToken();
    if (authToken) {
        console.log('👤 User is authenticated');
        // Update UI for logged-in users
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}