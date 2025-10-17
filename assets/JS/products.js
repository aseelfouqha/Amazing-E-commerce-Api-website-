// Products page functionality
document.addEventListener('DOMContentLoaded', async function() {
    const params = getUrlParams();
    await loadProducts(params);
    setupEventListeners();
});

let currentPage = 1;
const productsPerPage = 9;
let allProducts = [];
let totalProducts = 0;

async function loadProducts(params = {}) {
    const productsContainer = document.getElementById('products-container');
    const productsCount = document.getElementById('products-count');

    if (!productsContainer) return;

    try {
        let url = `${API_BASE}/products`;
        const queryParams = new URLSearchParams();
        
        // Get all products for client-side pagination and sorting
        queryParams.set('limit', 100);
        
        if (params.category) {
            // CORRECT ENDPOINT: Get products by category
            url = `${API_BASE}/products/category/${params.category}`;
        }
        
        if (params.q) {
            // CORRECT ENDPOINT: Search products
            url = `${API_BASE}/products/search`;
            queryParams.set('q', params.q);
        }
        
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        console.log('📦 Loading products from:', url);
        const data = await fetchData(url);
        
        // Handle different response formats
        if (data.products) {
            allProducts = data.products;
        } else if (Array.isArray(data)) {
            allProducts = data;
        } else {
            allProducts = [];
        }
        
        totalProducts = allProducts.length;
        console.log(`✅ Loaded ${totalProducts} products`);
        
        // Apply initial sorting if specified
        if (params.sortBy) {
            sortProducts(params.sortBy, params.order || 'asc');
        }
        
        // Update products count
        if (productsCount) {
            productsCount.textContent = totalProducts;
        }
        
        // Update pagination info
        updatePaginationInfo();
        
        currentPage = 1;
        displayPaginatedProducts();
        updatePagination();
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showError(productsContainer, 'Failed to load products. Please check your internet connection and try again.');
    }
}

function displayPaginatedProducts() {
    const productsContainer = document.getElementById('products-container');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);

    console.log('🔄 Displaying paginated products:', paginatedProducts.length);
    displayProducts(paginatedProducts, productsContainer);
}

function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})" class="btn btn-secondary">← Previous</button>`;
    }
    
    // Page numbers - show max 5 pages
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="btn btn-primary active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})" class="btn btn-secondary">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})" class="btn btn-secondary">Next →</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function updatePaginationInfo() {
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    
    if (currentPageElement && totalPagesElement) {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        currentPageElement.textContent = currentPage;
        totalPagesElement.textContent = totalPages;
    }
}

function changePage(page) {
    currentPage = page;
    displayPaginatedProducts();
    updatePagination();
    updatePaginationInfo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupEventListeners() {
    const sortBySelect = document.getElementById('sort-by');
    const orderSelect = document.getElementById('order');
    
    if (sortBySelect) {
        sortBySelect.addEventListener('change', handleSort);
    }
    
    if (orderSelect) {
        orderSelect.addEventListener('change', handleSort);
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

function handleSort() {
    const sortBy = document.getElementById('sort-by').value;
    const order = document.getElementById('order').value;
    
    sortProducts(sortBy, order);
    currentPage = 1;
    displayPaginatedProducts();
    updatePagination();
    updatePaginationInfo();
}

function sortProducts(sortBy, order = 'asc') {
    allProducts.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Handle different data types
        if (sortBy === 'price' || sortBy === 'rating' || sortBy === 'discountPercentage') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
        } else {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
        }
        
        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}