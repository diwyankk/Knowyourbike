// ============================================
// CONFIGURATION & API SETTINGS
// ============================================
const CONFIG = {
    // IMPORTANT: Replace this with your actual API key
    API_KEY: 'QpAMb4nTe+g9lC2HuUk5/A==ix6JT13zf7Tat7V2',
    API_URL: 'https://api.api-ninjas.com/v1/motorcycles',
    
    // Google Custom Search Engine ID (You need to create this)
    GOOGLE_CSE_ID: 'YOUR_GOOGLE_CSE_ID',
    
    // Image fallback service
    IMAGE_SERVICE: 'https://source.unsplash.com/featured/?motorcycle,',
    
    // Pagination
    ITEMS_PER_PAGE: 12,
    
    // Featured lists (you can customize these)
    TOP_10_BIKES: ['Yamaha YZF-R1', 'Kawasaki Ninja H2', 'Ducati Panigale V4', 
                  'BMW S1000RR', 'Harley-Davidson Street Glide', 'Honda CBR1000RR',
                  'Triumph Tiger 1200', 'KTM 1290 Super Duke R', 'Suzuki Hayabusa',
                  'Indian Chief'],
    
    TRENDING_BIKES: ['Electric Motorcycles', 'Royal Enfield Classic 350', 
                    'KTM 390 Duke', 'Yamaha MT-07', 'Honda ADV350']
};

// ============================================
// GLOBAL STATE VARIABLES
// ============================================
let allBikes = [];
let currentBikes = [];
let currentPage = 1;
let totalPages = 1;
let selectedBikes = [];
let filters = {
    brand: '',
    cc: '',
    price: '',
    fuel: '',
    abs: '',
    type: ''
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    bikeListing: document.getElementById('bikeListing'),
    bikeCount: document.getElementById('bikeCount'),
    pagination: document.getElementById('pagination'),
    filterBrand: document.getElementById('filterBrand'),
    filterCC: document.getElementById('filterCC'),
    filterPrice: document.getElementById('filterPrice'),
    filterFuel: document.getElementById('filterFuel'),
    filterABS: document.getElementById('filterABS'),
    filterType: document.getElementById('filterType'),
    applyFilters: document.getElementById('applyFilters'),
    resetFilters: document.getElementById('resetFilters'),
    sortSelect: document.getElementById('sortSelect'),
    trendingBikes: document.getElementById('trendingBikes'),
    top10Bikes: document.getElementById('top10Bikes'),
    compare1: document.getElementById('compare1'),
    compare2: document.getElementById('compare2'),
    compare3: document.getElementById('compare3'),
    runComparison: document.getElementById('runComparison'),
    comparisonResults: document.getElementById('comparisonResults'),
    
    // EMI Calculator Elements
    bikePrice: document.getElementById('bikePrice'),
    downPayment: document.getElementById('downPayment'),
    interestRate: document.getElementById('interestRate'),
    interestValue: document.getElementById('interestValue'),
    loanTenure: document.getElementById('loanTenure'),
    tenureValue: document.getElementById('tenureValue'),
    calculateEMI: document.getElementById('calculateEMI'),
    monthlyEMI: document.getElementById('monthlyEMI'),
    totalInterest: document.getElementById('totalInterest'),
    totalPayment: document.getElementById('totalPayment')
};

// ============================================
// MAIN INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing WorldBikeHub...');
    
    // Initialize all components
    await initializeBikeData();
    initializeFilters();
    initializeEMICalculator();
    initializeComparisonTool();
    initializeDonationButtons();
    initializeMobileMenu();
    
    // Load featured sections
    loadFeaturedSections();
    
    console.log('WorldBikeHub initialized successfully!');
});

// ============================================
// BIKE DATA MANAGEMENT
// ============================================
async function initializeBikeData() {
    try {
        showLoadingState();
        
        // For demo, we'll load multiple brands
        const brands = ['honda', 'yamaha', 'kawasaki', 'suzuki', 'bmw', 'ducati'];
        
        // Fetch bikes from multiple brands
        const fetchPromises = brands.map(brand => fetchBikesFromAPI(brand));
        const results = await Promise.all(fetchPromises);
        
        // Combine all bikes
        allBikes = results.flat();
        
        // Remove duplicates based on make + model
        allBikes = removeDuplicates(allBikes);
        
        // Add image URLs to each bike
        allBikes = await enhanceBikesWithImages(allBikes);
        
        // Initialize current bikes and display
        currentBikes = [...allBikes];
        displayBikes(currentPage);
        populateBrandFilter();
        populateComparisonDropdowns();
        
        updateBikeCount();
        
    } catch (error) {
        console.error('Error initializing bike data:', error);
        showErrorState('Failed to load bike data. Please try again later.');
    }
}

async function fetchBikesFromAPI(brand = '') {
    try {
        const response = await fetch(`${CONFIG.API_URL}?make=${brand}`, {
            headers: {
                'X-Api-Key': CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
        
    } catch (error) {
        console.error(`Error fetching ${brand} bikes:`, error);
        return [];
    }
}

function removeDuplicates(bikes) {
    const seen = new Set();
    return bikes.filter(bike => {
        const key = `${bike.make}-${bike.model}-${bike.year}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

async function enhanceBikesWithImages(bikes) {
    return bikes.map(bike => {
        // Generate image URL based on bike details
        const imageSearch = `${bike.make}+${bike.model}+${bike.year}`;
        return {
            ...bike,
            imageUrl: `${CONFIG.IMAGE_SERVICE}${encodeURIComponent(imageSearch)}`,
            formattedPrice: formatPrice(bike.price || 0),
            formattedCC: formatCC(bike.displacement || 0)
        };
    });
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================
function displayBikes(page = 1) {
    currentPage = page;
    
    // Calculate pagination
    const startIndex = (page - 1) * CONFIG.ITEMS_PER_PAGE;
    const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
    const bikesToShow = currentBikes.slice(startIndex, endIndex);
    totalPages = Math.ceil(currentBikes.length / CONFIG.ITEMS_PER_PAGE);
    
    if (bikesToShow.length === 0) {
        elements.bikeListing.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No bikes found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    // Generate bike cards HTML
    const bikesHTML = bikesToShow.map(bike => createBikeCard(bike)).join('');
    
    elements.bikeListing.innerHTML = bikesHTML;
    generatePagination();
    
    // Add event listeners to compare buttons
    document.querySelectorAll('.btn-compare-select').forEach(button => {
        button.addEventListener('click', (e) => {
            const bikeId = e.target.closest('.bike-card').dataset.id;
            addBikeToComparison(bikeId);
        });
    });
}

function createBikeCard(bike) {
    const bikeId = `${bike.make}-${bike.model}-${bike.year}`.replace(/\s+/g, '-');
    
    return `
        <div class="bike-card" data-id="${bikeId}">
            <div class="bike-image">
                ${bike.imageUrl ? 
                    `<img src="${bike.imageUrl}" alt="${bike.make} ${bike.model}" 
                         onerror="this.src='https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">` :
                    `<i class="fas fa-motorcycle"></i>`
                }
            </div>
            <div class="bike-info">
                <div class="bike-title">
                    <span>${bike.make} ${bike.model}</span>
                    <span class="bike-year">${bike.year || 'N/A'}</span>
                </div>
                
                <div class="bike-specs">
                    <div class="spec-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>${bike.formattedCC}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${bike.formattedPrice}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-gas-pump"></i>
                        <span>${bike.engine_type || 'Petrol'}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-cogs"></i>
                        <span>${bike.transmission || 'Manual'}</span>
                    </div>
                </div>
                
                ${bike.horsepower ? `
                    <div class="performance">
                        <strong>Performance:</strong>
                        <span>${bike.horsepower} HP • ${bike.torque || 'N/A'} Nm</span>
                    </div>
                ` : ''}
                
                <div class="bike-actions">
                    <button class="btn-details" onclick="showBikeDetails('${bikeId}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn-compare-select">
                        <i class="fas fa-balance-scale"></i> Compare
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FILTER SYSTEM
// ============================================
function initializeFilters() {
    // Brand filter is populated separately after data loads
    
    // Add event listeners to all filter elements
    elements.applyFilters.addEventListener('click', applyFilters);
    elements.resetFilters.addEventListener('click', resetFilters);
    elements.sortSelect.addEventListener('change', applySorting);
    
    // Add real-time filtering for text inputs
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', () => {
            // Apply filters after a short delay for better UX
            clearTimeout(window.filterTimeout);
            window.filterTimeout = setTimeout(applyFilters, 300);
        });
    });
}

function populateBrandFilter() {
    const brands = [...new Set(allBikes.map(bike => bike.make).filter(Boolean))];
    brands.sort();
    
    // Clear existing options except the first one
    while (elements.filterBrand.options.length > 1) {
        elements.filterBrand.remove(1);
    }
    
    // Add brand options
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.toLowerCase();
        option.textContent = brand;
        elements.filterBrand.appendChild(option);
    });
}

function applyFilters() {
    // Get current filter values
    filters = {
        brand: elements.filterBrand.value,
        cc: elements.filterCC.value,
        price: elements.filterPrice.value,
        fuel: elements.filterFuel.value,
        abs: elements.filterABS.value,
        type: elements.filterType.value
    };
    
    // Apply filters
    let filteredBikes = [...allBikes];
    
    // Brand filter
    if (filters.brand) {
        filteredBikes = filteredBikes.filter(bike => 
            bike.make.toLowerCase() === filters.brand
        );
    }
    
    // Engine CC filter
    if (filters.cc) {
        filteredBikes = filteredBikes.filter(bike => {
            const cc = bike.displacement || 0;
            switch(filters.cc) {
                case '0-150': return cc <= 150;
                case '151-300': return cc > 150 && cc <= 300;
                case '301-500': return cc > 300 && cc <= 500;
                case '501-800': return cc > 500 && cc <= 800;
                case '801-1200': return cc > 800 && cc <= 1200;
                case '1201+': return cc > 1200;
                default: return true;
            }
        });
    }
    
    // Price filter
    if (filters.price) {
        filteredBikes = filteredBikes.filter(bike => {
            const price = bike.price || 0;
            switch(filters.price) {
                case '0-5000': return price <= 5000;
                case '5001-15000': return price > 5000 && price <= 15000;
                case '15001-30000': return price > 15000 && price <= 30000;
                case '30001+': return price > 30000;
                default: return true;
            }
        });
    }
    
    // Fuel type filter
    if (filters.fuel) {
        filteredBikes = filteredBikes.filter(bike => 
            (bike.engine_type || '').toLowerCase().includes(filters.fuel)
        );
    }
    
    // Body type filter
    if (filters.type) {
        filteredBikes = filteredBikes.filter(bike => {
            // This would need mapping from API data to body types
            // For now, we'll use a simple check
            const model = (bike.model || '').toLowerCase();
            switch(filters.type) {
                case 'sport': return model.includes('r') || model.includes('rr') || model.includes('ninja');
                case 'cruiser': return model.includes('cruiser') || model.includes('harley');
                case 'adventure': return model.includes('adventure') || model.includes('tiger');
                default: return true;
            }
        });
    }
    
    // Update current bikes and display
    currentBikes = filteredBikes;
    currentPage = 1;
    displayBikes(currentPage);
    updateBikeCount();
}

function resetFilters() {
    // Reset all filter selects
    elements.filterBrand.value = '';
    elements.filterCC.value = '';
    elements.filterPrice.value = '';
    elements.filterFuel.value = '';
    elements.filterABS.value = '';
    elements.filterType.value = '';
    elements.sortSelect.value = 'make';
    
    // Reset filter state
    filters = {
        brand: '',
        cc: '',
        price: '',
        fuel: '',
        abs: '',
        type: ''
    };
    
    // Reset and display all bikes
    currentBikes = [...allBikes];
    currentPage = 1;
    displayBikes(currentPage);
    updateBikeCount();
}

function applySorting() {
    const sortBy = elements.sortSelect.value;
    
    let sortedBikes = [...currentBikes];
    
    switch(sortBy) {
        case 'year_desc':
            sortedBikes.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'year_asc':
            sortedBikes.sort((a, b) => (a.year || 0) - (b.year || 0));
            break;
        case 'price_asc':
            sortedBikes.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'price_desc':
            sortedBikes.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'displacement_desc':
            sortedBikes.sort((a, b) => (b.displacement || 0) - (a.displacement || 0));
            break;
        default: // 'make'
            sortedBikes.sort((a, b) => (a.make || '').localeCompare(b.make || ''));
    }
    
    currentBikes = sortedBikes;
    displayBikes(currentPage);
}

// ============================================
// PAGINATION
// ============================================
function generatePagination() {
    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    paginationHTML += `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    elements.pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    displayBikes(page);
    
    // Scroll to top of bike listing
    elements.bikeListing.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// FEATURED SECTIONS
// ============================================
function loadFeaturedSections() {
    // Load Trending Bikes
    loadTrendingBikes();
    
    // Load Top 10 Bikes
    loadTop10Bikes();
}

function loadTrendingBikes() {
    // For now, use a sample of bikes as trending
    const trendingSample = allBikes
        .filter(bike => bike.year >= 2020)
        .slice(0, 6);
    
    const trendingHTML = trendingSample.map(bike => createFeaturedCard(bike, 'trending')).join('');
    elements.trendingBikes.innerHTML = trendingHTML;
}

function loadTop10Bikes() {
    // Filter for bikes that match our top 10 list
    const top10Bikes = allBikes.filter(bike => 
        CONFIG.TOP_10_BIKES.some(name => 
            `${bike.make} ${bike.model}`.includes(name)
        )
    ).slice(0, 10);
    
    // If not enough matches, add some popular bikes
    if (top10Bikes.length < 10) {
        const additionalBikes = allBikes
            .filter(bike => !top10Bikes.includes(bike))
            .slice(0, 10 - top10Bikes.length);
        top10Bikes.push(...additionalBikes);
    }
    
    const top10HTML = top10Bikes.map(bike => createFeaturedCard(bike, 'top10')).join('');
    elements.top10Bikes.innerHTML = top10HTML;
}

function createFeaturedCard(bike, type) {
    const badgeClass = type === 'trending' ? 'badge-trending' : 'badge-top10';
    const badgeText = type === 'trending' ? 'Trending' : 'Top 10';
    
    return `
        <div class="featured-card">
            <div class="featured-image">
                <img src="${bike.imageUrl}" alt="${bike.make} ${bike.model}"
                     onerror="this.src='https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                <span class="${badgeClass}">${badgeText}</span>
            </div>
            <div class="featured-info">
                <h4>${bike.make} ${bike.model}</h4>
                <p>${bike.formattedCC} • ${bike.formattedPrice}</p>
                <button class="btn-compare-select" onclick="addBikeToComparison('${bike.make}-${bike.model}-${bike.year}')">
                    Compare
                </button>
            </div>
        </div>
    `;
}

// ============================================
// COMPARISON TOOL
// ============================================
function initializeComparisonTool() {
    elements.runComparison.addEventListener('click', runComparison);
    
    // Clear comparison button
    document.getElementById('clearCompare')?.addEventListener('click', () => {
        selectedBikes = [];
        elements.comparisonResults.innerHTML = `
            <div class="info-note">
                <i class="fas fa-info-circle"></i>
                <p>Select 2-3 bikes to compare from the dropdowns above</p>
            </div>
        `;
        updateComparisonDropdowns();
    });
}

function populateComparisonDropdowns() {
    // Clear existing options
    [elements.compare1, elements.compare2, elements.compare3].forEach(select => {
        select.innerHTML = '<option value="">Select a Bike</option>';
    });
    
    // Add bike options
    allBikes.forEach(bike => {
        const optionText = `${bike.make} ${bike.model} (${bike.year})`;
        const optionValue = `${bike.make}-${bike.model}-${bike.year}`;
        
        [elements.compare1, elements.compare2, elements.compare3].forEach(select => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionText;
            select.appendChild(option);
        });
    });
}

function addBikeToComparison(bikeId) {
    if (selectedBikes.length >= 3) {
        alert('You can compare up to 3 bikes at a time.');
        return;
    }
    
    if (!selectedBikes.includes(bikeId)) {
        selectedBikes.push(bikeId);
        updateComparisonDropdowns();
        
        // Show notification
        showNotification(`Added bike to comparison (${selectedBikes.length}/3 selected)`);
    }
}

function updateComparisonDropdowns() {
    [elements.compare1, elements.compare2, elements.compare3].forEach((select, index) => {
        select.value = selectedBikes[index] || '';
    });
}

function runComparison() {
    const bikeIds = [
        elements.compare1.value,
        elements.compare2.value,
        elements.compare3.value
    ].filter(Boolean);
    
    if (bikeIds.length < 2) {
        alert('Please select at least 2 bikes to compare.');
        return;
    }
    
    const bikesToCompare = bikeIds.map(id => 
        allBikes.find(bike => `${bike.make}-${bike.model}-${bike.year}` === id)
    ).filter(Boolean);
    
    if (bikesToCompare.length < 2) {
        alert('Could not find selected bikes. Please try again.');
        return;
    }
    
    displayComparisonResults(bikesToCompare);
}

function displayComparisonResults(bikes) {
    const specsToCompare = [
        { key: 'make', label: 'Brand' },
        { key: 'model', label: 'Model' },
        { key: 'year', label: 'Year' },
        { key: 'price', label: 'Price', format: formatPrice },
        { key: 'displacement', label: 'Engine CC', format: formatCC },
        { key: 'engine_type', label: 'Engine Type' },
        { key: 'horsepower', label: 'Horsepower', suffix: ' HP' },
        { key: 'torque', label: 'Torque', suffix: ' Nm' },
        { key: 'transmission', label: 'Transmission' },
        { key: 'fuel_capacity', label: 'Fuel Capacity', suffix: ' L' },
        { key: 'seat_height', label: 'Seat Height', suffix: ' mm' },
        { key: 'dry_weight', label: 'Weight', suffix: ' kg' }
    ];
    
    let tableHTML = `
        <div class="comparison-header">
            <h3>Bike Comparison</h3>
            <button onclick="exportComparison()" class="btn-export">
                <i class="fas fa-download"></i> Export
            </button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Specification</th>
                    ${bikes.map(bike => `<th>${bike.make} ${bike.model}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    specsToCompare.forEach(spec => {
        tableHTML += '<tr>';
        tableHTML += `<td>${spec.label}</td>`;
        
        bikes.forEach(bike => {
            let value = bike[spec.key] || 'N/A';
            if (spec.format) value = spec.format(value);
            if (spec.suffix && value !== 'N/A') value += spec.suffix;
            
            tableHTML += `<td>${value}</td>`;
        });
        
        tableHTML += '</tr>';
    });
    
    tableHTML += `
            </tbody>
        </table>
        
        <div class="comparison-verdict">
            <h4>Our Verdict:</h4>
            <p>${generateVerdict(bikes)}</p>
        </div>
    `;
    
    elements.comparisonResults.innerHTML = tableHTML;
}

function generateVerdict(bikes) {
    if (bikes.length < 2) return '';
    
    const bike1 = bikes[0];
    const bike2 = bikes[1];
    
    const priceDiff = Math.abs((bike1.price || 0) - (bike2.price || 0));
    const powerDiff = Math.abs((bike1.horsepower || 0) - (bike2.horsepower || 0));
    
    if (priceDiff > 10000) {
        return `The ${bike1.price < bike2.price ? bike1.make : bike2.make} offers better value for money.`;
    } else if (powerDiff > 50) {
        return `The ${bike1.horsepower > bike2.horsepower ? bike1.make : bike2.make} has significantly more power.`;
    } else {
        return 'Both bikes are closely matched. Choose based on brand preference and specific features.';
    }
}

// ============================================
// EMI CALCULATOR
// ============================================
function initializeEMICalculator() {
    // Update interest rate display
    elements.interestRate.addEventListener('input', function() {
        elements.interestValue.textContent = `${this.value}%`;
    });
    
    // Update tenure display
    elements.loanTenure.addEventListener('input', function() {
        elements.tenureValue.textContent = `${this.value} Months`;
    });
    
    // Calculate EMI on button click
    elements.calculateEMI.addEventListener('click', calculateEMI);
    
    // Calculate EMI on page load
    calculateEMI();
}

function calculateEMI() {
    const principal = parseFloat(elements.bikePrice.value) - parseFloat(elements.downPayment.value);
    const interestRate = parseFloat(elements.interestRate.value) / 100 / 12;
    const tenure = parseFloat(elements.loanTenure.value);
    
    if (principal <= 0 || tenure <= 0) {
        alert('Please enter valid values');
        return;
    }
    
    // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = principal * interestRate * Math.pow(1 + interestRate, tenure) / 
                (Math.pow(1 + interestRate, tenure) - 1);
    
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;
    
    // Update display
    elements.monthlyEMI.textContent = `$${emi.toFixed(2)}`;
    elements.totalInterest.textContent = `$${totalInterest.toFixed(2)}`;
    elements.totalPayment.textContent = `$${totalPayment.toFixed(2)}`;
    
    // Update chart if available
    updateEMIChart(principal, totalInterest);
}

function updateEMIChart(principal, interest) {
    const ctx = document.getElementById('emiChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#36a2eb', '#ff6384'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ============================================
// DONATION SYSTEM
// ============================================
function initializeDonationButtons() {
    document.querySelectorAll('.donation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.dataset.amount;
            if (amount === 'custom') {
                const customAmount = prompt('Enter custom donation amount ($):');
                if (customAmount && !isNaN(customAmount)) {
                    processDonation(parseFloat(customAmount));
                }
            } else {
                processDonation(parseFloat(amount));
            }
        });
    });
}

function processDonation(amount) {
    // In a real implementation, this would redirect to PayPal or payment gateway
    const paypalUrl = `https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID&amount=${amount}`;
    
    showNotification(`Redirecting to secure payment for $${amount} donation...`);
    
    // Open payment in new tab
    setTimeout(() => {
        window.open(paypalUrl, '_blank');
    }, 1000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    if (!price || isNaN(price)) return '$N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price);
}

function formatCC(cc) {
    if (!cc || isNaN(cc)) return 'N/A';
    return `${cc.toLocaleString()}cc`;
}

function updateBikeCount() {
    elements.bikeCount.textContent = `Available Bikes (${currentBikes.length})`;
}

function showLoadingState() {
    elements.bikeListing.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-motorcycle fa-spin"></i>
            <p>Loading worldwide motorcycle database...</p>
        </div>
    `;
}

function showErrorState(message) {
    elements.bikeListing.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn-primary">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ============================================
// BIKE DETAILS MODAL
// ============================================
function showBikeDetails(bikeId) {
    const bike = allBikes.find(b => 
        `${b.make}-${b.model}-${b.year}`.replace(/\s+/g, '-') === bikeId
    );
    
    if (!bike) {
        alert('Bike details not available.');
        return;
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${bike.make} ${bike.model} (${bike.year})</h2>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-image">
                        <img src="${bike.imageUrl}" alt="${bike.make} ${bike.model}">
                    </div>
                    <div class="modal-specs">
                        <h3>Specifications</h3>
                        <div class="spec-grid">
                            <div class="spec-item">
                                <strong>Price:</strong> ${formatPrice(bike.price)}
                            </div>
                            <div class="spec-item">
                                <strong>Engine:</strong> ${formatCC(bike.displacement)}
                            </div>
                            <div class="spec-item">
                                <strong>Power:</strong> ${bike.horsepower || 'N/A'} HP
                            </div>
                            <div class="spec-item">
                                <strong>Torque:</strong> ${bike.torque || 'N/A'} Nm
                            </div>
                            <div class="spec-item">
                                <strong>Fuel Type:</strong> ${bike.engine_type || 'Petrol'}
                            </div>
                            <div class="spec-item">
                                <strong>Transmission:</strong> ${bike.transmission || 'Manual'}
                            </div>
                            <div class="spec-item">
                                <strong>Fuel Capacity:</strong> ${bike.fuel_capacity || 'N/A'} L
                            </div>
                            <div class="spec-item">
                                <strong>Seat Height:</strong> ${bike.seat_height || 'N/A'} mm
                            </div>
                            <div class="spec-item">
                                <strong>Weight:</strong> ${bike.dry_weight || 'N/A'} kg
                            </div>
                        </div>
                        
                        ${bike.buyLink ? `
                            <div class="modal-actions">
                                <a href="${bike.buyLink}" target="_blank" class="btn-primary">
                                    <i class="fas fa-shopping-cart"></i> Buy Now
                                </a>
                                <button class="btn-secondary" onclick="addBikeToComparison('${bikeId}')">
                                    <i class="fas fa-balance-scale"></i> Add to Comparison
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
        }
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
        }
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
        }
        .modal-body {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        @media (max-width: 768px) {
            .modal-body {
                grid-template-columns: 1fr;
            }
        }
        .modal-image img {
            width: 100%;
            border-radius: 10px;
        }
        .spec-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
    
    // Remove modal styles
    const style = document.querySelector('style[data-modal]');
    if (style) style.remove();
}

// ============================================
// MOBILE MENU
// ============================================
function initializeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'var(--dark)';
            navLinks.style.padding = '1rem';
            navLinks.style.zIndex = '1000';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.style.display = 'none';
            }
        });
    }
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================
function exportComparison() {
    const table = elements.comparisonResults.querySelector('table');
    if (!table) return;
    
    let csv = [];
    
    // Get all rows
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const rowData = [];
        const cols = row.querySelectorAll('th, td');
        
        cols.forEach(col => {
            rowData.push(`"${col.textContent.trim()}"`);
        });
        
        csv.push(rowData.join(','));
    });
    
    // Create download link
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = 'bike-comparison.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Comparison exported as CSV');
}

// ============================================
// GOOGLE CUSTOM SEARCH INTEGRATION
// ============================================
function initGoogleSearch() {
    // Google CSE should auto-initialize with the script in head
    // Add custom styling if needed
    const style = document.createElement('style');
    style.textContent = `
        .gsc-control-cse {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
        }
        .gsc-search-box {
            margin-bottom: 0 !important;
        }
        .gsc-input-box {
            border: 2px solid var(--accent) !important;
            border-radius: 50px !important;
            height: 50px !important;
        }
        .gsc-search-button {
            background: var(--primary) !important;
            border-radius: 50px !important;
            height: 50px !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize Google Search when CSE is loaded
if (typeof google !== 'undefined') {
    google.search.cse.element.getElement('searchresults-only0').renderNoResults = function(name, query) {
        // Custom no results handler
        return `
            <div class="no-results">
                <h3>No results found for "${query}"</h3>
                <p>Try searching on our bike database instead</p>
            </div>
        `;
    };
}

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.changePage = changePage;
window.showBikeDetails = showBikeDetails;
window.addBikeToComparison = addBikeToComparison;
window.closeModal = closeModal;
window.exportComparison = exportComparison;
