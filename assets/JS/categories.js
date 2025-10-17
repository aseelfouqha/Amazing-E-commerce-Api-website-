// Categories page functionality
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📂 Initializing Categories page...');
    
    const params = getUrlParams();
    
    try {
        await loadAllCategories();
        console.log('✅ Categories loaded');
        
        if (params.category) {
            console.log('📦 Loading category products:', params.category);
            await loadCategoryProducts(params.category);
        }
    } catch (error) {
        console.error('❌ Failed to initialize categories page:', error);
    }
    
    setupEventListeners();
});

// Load all categories - CORRECTED ENDPOINT
async function loadAllCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
        console.log('❌ Categories container not found');
        return;
    }

    try {
        console.log('📂 Loading all categories...');
        
        // CORRECT ENDPOINT: Get all product categories
        const categories = await fetchData(`${API_BASE}/products/categories`);
        
        if (Array.isArray(categories)) {
            console.log(`✅ Loaded ${categories.length} categories`);
            displayAllCategories(categories, categoriesContainer);
        } else {
            throw new Error('Categories data is not an array');
        }
    } catch (error) {
        console.error('❌ Error loading all categories:', error);
        
        // Fallback categories
        const fallbackCategories = [
            'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries',
            'home-decoration', 'furniture', 'tops', 'womens-dresses', 'mens-shirts',
            'mens-shoes', 'womens-shoes', 'mens-watches', 'womens-watches',
            'womens-bags', 'womens-jewellery', 'sunglasses', 'automotive', 'motorcycle'
        ];
        
        console.log('🔄 Using fallback categories');
        displayAllCategories(fallbackCategories, categoriesContainer);
    }
}

function displayAllCategories(categories, container) {
    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📂</div>
                <h3>No Categories Found</h3>
                <p>Categories are not available at the moment.</p>
            </div>
        `;
        return;
    }

    console.log(`🔄 Displaying ${categories.length} categories`);
    container.innerHTML = categories.map(category => `
        <div class="category-card" onclick="loadCategoryProducts('${category}')">
            <h3>${formatCategory(category)}</h3>
            <p style="margin-top: 0.5rem; opacity: 0.8;">Browse ${formatCategory(category).toLowerCase()}</p>
        </div>
    `).join('');
}

// Load products for a specific category - CORRECTED ENDPOINT
async function loadCategoryProducts(category) {
    const section = document.getElementById('category-products-section');
    const title = document.getElementById('category-title');
    const badge = document.getElementById('category-badge');
    const productsContainer = document.getElementById('category-products');
    
    if (!section || !title) {
        console.log('❌ Category products section not found');
        return;
    }

    try {
        console.log(`📦 Loading products for category: ${category}`);
        
        // CORRECT ENDPOINT: Get products by category
        const data = await fetchData(`${API_BASE}/products/category/${category}`);
        
        if (data && data.products) {
            console.log(`✅ Loaded ${data.products.length} products for ${category}`);
            
            // Update UI
            title.textContent = `${formatCategory(category)} Products`;
            badge.textContent = formatCategory(category);
            section.style.display = 'block';
            
            // Display products
            displayProducts(data.products, productsContainer);
            
            // Update URL without reloading
            const newUrl = `${window.location.pathname}?category=${encodeURIComponent(category)}`;
            window.history.pushState({}, '', newUrl);
            
            // Scroll to products section
            section.scrollIntoView({ behavior: 'smooth' });
        } else {
            throw new Error('No products data received');
        }
    } catch (error) {
        console.error(`❌ Error loading ${category} products:`, error);
        showError(productsContainer, `
            Failed to load ${category} products. 
            <br><br>
            The category might not exist or the API is unavailable.
        `);
    }
}

function setupEventListeners() {
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