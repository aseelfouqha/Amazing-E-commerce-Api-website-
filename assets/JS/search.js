// Search page functionality
document.addEventListener('DOMContentLoaded', function() {
    const params = getUrlParams();
    
    // Pre-fill search input
    const searchInput = document.getElementById('search-query');
    if (searchInput && params.q) {
        searchInput.value = params.q;
        performSearch(params.q);
    }
    
    setupEventListeners();
});

let searchResults = [];
let currentSearchPage = 1;
const searchResultsPerPage = 9;

async function performSearch(query) {
    const productsContainer = document.getElementById('search-products');
    const searchInfo = document.getElementById('search-info');
    const filters = document.getElementById('search-filters');
    
    if (!query.trim()) {
        searchInfo.innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">Please enter a search term</div>';
        productsContainer.innerHTML = '';
        filters.style.display = 'none';
        return;
    }

    try {
        const data = await fetchData(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
        searchResults = data.products || [];
        
        // Update search info
        if (searchResults.length === 0) {
            searchInfo.innerHTML = `<div style="text-align: center; color: #666; padding: 2rem;">
                No products found for "<span class="search-query" style="color: var(--primary-pink); font-weight: bold;">${query}</span>"
            </div>`;
        } else {
            searchInfo.innerHTML = `Found <span class="products-count" style="color: var(--primary-pink); font-weight: bold;">${searchResults.length}</span> 
            products for "<span class="search-query" style="color: var(--primary-pink); font-weight: bold;">${query}</span>"`;
        }
        
        // Show/hide filters
        filters.style.display = searchResults.length > 0 ? 'block' : 'none';
        
        currentSearchPage = 1;
        displaySearchResults();
        
    } catch (error) {
        showError(productsContainer, 'Search failed. Please try again later.');
    }
}

function displaySearchResults() {
    const productsContainer = document.getElementById('search-products');
    const paginationContainer = document.getElementById('search-pagination');
    
    const startIndex = (currentSearchPage - 1) * searchResultsPerPage;
    const endIndex = startIndex + searchResultsPerPage;
    const paginatedResults = searchResults.slice(startIndex, endIndex);
    
    displayProducts(paginatedResults, productsContainer);
    updateSearchPagination();
}

function updateSearchPagination() {
    const paginationContainer = document.getElementById('search-pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(searchResults.length / searchResultsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    if (currentSearchPage > 1) {
        paginationHTML += `<button onclick="changeSearchPage(${currentSearchPage - 1})" class="btn btn-secondary">← Previous</button>`;
    }
    
    const startPage = Math.max(1, currentSearchPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentSearchPage) {
            paginationHTML += `<button class="btn btn-primary active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changeSearchPage(${i})" class="btn btn-secondary">${i}</button>`;
        }
    }
    
    if (currentSearchPage < totalPages) {
        paginationHTML += `<button onclick="changeSearchPage(${currentSearchPage + 1})" class="btn btn-secondary">Next →</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function changeSearchPage(page) {
    currentSearchPage = page;
    displaySearchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('search-page-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const query = document.getElementById('search-query').value.trim();
            if (query) {
                performSearch(query);
                // Update URL without reloading
                const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
                window.history.pushState({}, '', newUrl);
            }
        });
    }

    // Search filters
    const sortBySelect = document.getElementById('search-sort-by');
    const orderSelect = document.getElementById('search-order');
    
    if (sortBySelect && orderSelect) {
        sortBySelect.addEventListener('change', sortSearchResults);
        orderSelect.addEventListener('change', sortSearchResults);
    }

    // Header search form
    const headerSearchForm = document.getElementById('search-form');
    if (headerSearchForm) {
        headerSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            navigateToSearch(query);
        });
    }
}

function sortSearchResults() {
    const sortBy = document.getElementById('search-sort-by').value;
    const order = document.getElementById('search-order').value;
    
    searchResults.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
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
    
    currentSearchPage = 1;
    displaySearchResults();
}