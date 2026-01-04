// ============================================
// COMPREHENSIVE BIKE DATABASE
// ============================================
const bikeData = [
    {
        id: 1,
        name: "Yamaha YZF-R1",
        brand: "Yamaha",
        price: 17499,
        engineCC: 998,
        mileage: 15, // km/l
        type: "Sport",
        abs: "Dual Channel",
        fuelType: "Petrol",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        specs: {
            topSpeed: 299,
            brakes: "Dual Disc (Front), Disc (Rear)",
            fuelCapacity: 17,
            comfort: "Aggressive sport riding position",
            suspension: "Fully adjustable front and rear",
            tyres: "120/70-ZR17, 190/55-ZR17",
            maintenance: "High",
            pickup: "Extremely fast (0-100 km/h in ~2.9s)"
        },
        buyLink: "https://www.yamaha-motor.com"
    },
    {
        id: 2,
        name: "Harley-Davidson Street Glide",
        brand: "Harley-Davidson",
        price: 21999,
        engineCC: 1868,
        mileage: 18,
        type: "Cruiser",
        abs: "Standard",
        fuelType: "Petrol",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1528778591256-2b6e38df58f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        specs: {
            topSpeed: 180,
            brakes: "Disc (Front & Rear)",
            fuelCapacity: 22.7,
            comfort: "Excellent, relaxed cruiser posture",
            suspension: "Twin shock rear, telescopic front",
            tyres: "130/60B19, 180/65B16",
            maintenance: "Medium-High",
            pickup: "Strong low-end torque"
        },
        buyLink: "https://www.harley-davidson.com"
    },
    {
        id: 3,
        name: "Honda CB Shine",
        brand: "Honda",
        price: 85000, // Price in USD for example
        engineCC: 125,
        mileage: 65,
        type: "Commuter",
        abs: "No ABS",
        fuelType: "Petrol",
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1535043169395-8a74f8ce6b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        specs: {
            topSpeed: 100,
            brakes: "Drum (Front & Rear)",
            fuelCapacity: 10.5,
            comfort: "Very comfortable for city commute",
            suspension: "Telescopic front, twin shock rear",
            tyres: "80/100-18, 80/100-18",
            maintenance: "Very Low",
            pickup: "Adequate for city traffic"
        },
        buyLink: "https://www.honda2wheelersindia.com"
    },
    // You can add 20+ more bike objects here following the same structure
    // Example for a future "Coming Soon" bike:
    {
        id: 99,
        name: "Kawasaki Ninja H2R (2027)",
        brand: "Kawasaki",
        price: 55000,
        engineCC: 998,
        mileage: 12,
        type: "Sport",
        abs: "Dual Channel",
        fuelType: "Petrol",
        featured: true,
        imageUrl: "",
        specs: {
            topSpeed: 400,
            brakes: "Top Spec Race Disc",
            fuelCapacity: 17,
            comfort: "Track-focused",
            suspension: "Top-line Öhlins",
            tyres: "Slick race tyres",
            maintenance: "Extremely High",
            pickup: "Supercharged acceleration"
        },
        buyLink: "#",
        comingSoon: true // Special flag for coming soon feature
    }
];

// ============================================
// GLOBAL VARIABLES & DOM ELEMENTS
// ============================================
let currentBikes = [...bikeData]; // Copy of data for filtering
const bikeListingEl = document.getElementById('bikeListing');
const featuredBikesEl = document.getElementById('featuredBikes');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBrand = document.getElementById('filterBrand');
const filterType = document.getElementById('filterType');
const filterPrice = document.getElementById('filterPrice');
const sortSelect = document.getElementById('sortSelect');
const resetFiltersBtn = document.getElementById('resetFilters');
const bikeCountSpan = document.querySelector('#bike-count span');
const compareDropdown1 = document.getElementById('compare1');
const compareDropdown2 = document.getElementById('compare2');
const compareBtn = document.getElementById('compareBtn');
const clearCompareBtn = document.getElementById('clearCompare');
const comparisonResultEl = document.getElementById('comparisonResult');

// ============================================
// CORE FUNCTION: DISPLAY BIKE CARDS
// ============================================
function displayBikes(bikesArray, targetElement, isFeatured = false) {
    if (bikesArray.length === 0) {
        targetElement.innerHTML = `<p class="info-note">No motorcycles found matching your criteria. Try adjusting your filters.</p>`;
        return;
    }

    targetElement.innerHTML = bikesArray.map(bike => `
        <div class="${isFeatured ? 'featured-card' : 'bike-card'}" data-id="${bike.id}">
            ${bike.imageUrl ?
                `<img src="${bike.imageUrl}" alt="${bike.name}" class="bike-image" onerror="this.src='https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800'">` :
                `<div class="bike-image" style="background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">COMING SOON</div>`
            }
            <div class="bike-info">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3 class="bike-title">${bike.name}</h3>
                    ${bike.comingSoon ? `<span class="coming-soon-badge">Coming 2027</span>` : ''}
                </div>
                <p class="bike-brand"><i class="fas fa-industry"></i> ${bike.brand}</p>
                <p class="bike-price"><strong>Est. Price:</strong> $${bike.price.toLocaleString()}</p>

                <div class="bike-specs">
                    <span class="spec-item"><i class="fas fa-tachometer-alt"></i> ${bike.engineCC}cc</span>
                    <span class="spec-item"><i class="fas fa-gas-pump"></i> ${bike.mileage} km/l</span>
                    <span class="spec-item"><i class="fas fa-biking"></i> ${bike.type}</span>
                    <span class="spec-item"><i class="fas fa-shield-alt"></i> ${bike.abs}</span>
                </div>

                <p><strong>Pickup:</strong> ${bike.specs.pickup}</p>

                <div class="bike-actions">
                    <button class="btn-details" onclick="showBikeDetails(${bike.id})">
                        <i class="fas fa-info-circle"></i> Full Details
                    </button>
                    <button class="btn-compare-select" onclick="addBikeToCompare(${bike.id})">
                        <i class="fas fa-balance-scale"></i> Compare
                    </button>
                </div>
                ${bike.buyLink && !bike.comingSoon ?
                    `<a href="${bike.buyLink}" target="_blank" style="display:inline-block; margin-top:1rem; color:#3498db; text-decoration:none;">
                        <i class="fas fa-external-link-alt"></i> View on Manufacturer Site
                    </a>` : ''
                }
            </div>
        </div>
    `).join('');

    // Update bike count display
    if (!isFeatured) {
        bikeCountSpan.textContent = bikesArray.length;
    }
}

// ============================================
// SEARCH & FILTER SYSTEM (Most Important)
// ============================================
function filterAndSortBikes() {
    let result = [...bikeData];

    // 1. TEXT SEARCH (by name or brand)
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        result = result.filter(bike =>
            bike.name.toLowerCase().includes(searchTerm) ||
            bike.brand.toLowerCase().includes(searchTerm)
        );
    }

    // 2. FILTER BY BRAND
    const selectedBrand = filterBrand.value;
    if (selectedBrand) {
        result = result.filter(bike => bike.brand === selectedBrand);
    }

    // 3. FILTER BY BODY TYPE
    const selectedType = filterType.value;
    if (selectedType) {
        result = result.filter(bike => bike.type === selectedType);
    }

    // 4. FILTER BY PRICE RANGE
    const selectedPrice = filterPrice.value;
    if (selectedPrice) {
        if (selectedPrice === 'low') result = result.filter(bike => bike.price < 5000);
        if (selectedPrice === 'mid') result = result.filter(bike => bike.price >= 5000 && bike.price <= 15000);
        if (selectedPrice === 'high') result = result.filter(bike => bike.price > 15000);
    }

    // 5. SORTING
    const sortBy = sortSelect.value;
    if (sortBy === 'priceLow') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHigh') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'cc') result.sort((a, b) => b.engineCC - a.engineCC);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    currentBikes = result;
    displayBikes(currentBikes, bikeListingEl);
}

// ============================================
// COMPARISON FEATURE FUNCTIONS
// ============================================
let bikesToCompare = [];

function addBikeToCompare(bikeId) {
    const bike = bikeData.find(b => b.id === bikeId);
    if (!bike) return;

    if (bikesToCompare.length >= 4) {
        alert('Maximum 4 bikes can be compared at once. Please clear the selection first.');
        return;
    }

    if (!bikesToCompare.some(b => b.id === bikeId)) {
        bikesToCompare.push(bike);
        updateCompareDropdowns();
        alert(`Added ${bike.name} to comparison. Select another bike and click "Compare Now".`);
    } else {
        alert('This bike is already in the comparison list.');
    }
}

function updateCompareDropdowns() {
    // Clear and populate both dropdowns with all bikes
    [compareDropdown1, compareDropdown2].forEach(dropdown => {
        dropdown.innerHTML = '<option value="">-- Select a Bike --</option>';
        bikeData.forEach(bike => {
            const option = document.createElement('option');
            option.value = bike.id;
            option.textContent = `${bike.name} (${bike.brand})`;
            dropdown.appendChild(option);
        });
    });

    // Pre-select bikes already in comparison array
    if (bikesToCompare.length > 0) compareDropdown1.value = bikesToCompare[0].id;
    if (bikesToCompare.length > 1) compareDropdown2.value = bikesToCompare[1].id;
}

function performComparison() {
    const bike1Id = parseInt(compareDropdown1.value);
    const bike2Id = parseInt(compareDropdown2.value);

    if (!bike1Id || !bike2Id) {
        comparisonResultEl.innerHTML = `<p class="info-note">Please select two different bikes from the dropdowns to compare.</p>`;
        return;
    }

    const bike1 = bikeData.find(b => b.id === bike1Id);
    const bike2 = bikeData.find(b => b.id === bike2Id);

    if (!bike1 || !bike2) return;

    // Create a detailed comparison table
    comparisonResultEl.innerHTML = `
        <h3>${bike1.name} vs ${bike2.name}</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Specification</th>
                    <th>${bike1.name}</th>
                    <th>${bike2.name}</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Brand</td><td>${bike1.brand}</td><td>${bike2.brand}</td></tr>
                <tr><td>Price</td><td>$${bike1.price.toLocaleString()}</td><td>$${bike2.price.toLocaleString()}</td></tr>
                <tr class="highlight-spec"><td>Engine CC</td><td>${bike1.engineCC} cc</td><td>${bike2.engineCC} cc</td></tr>
                <tr><td>Mileage</td><td>${bike1.mileage} km/l</td><td>${bike2.mileage} km/l</td></tr>
                <tr><td>Body Type</td><td>${bike1.type}</td><td>${bike2.type}</td></tr>
                <tr><td>ABS</td><td>${bike1.abs}</td><td>${bike2.abs}</td></tr>
                <tr class="highlight-spec"><td>Top Speed</td><td>${bike1.specs.topSpeed} km/h</td><td>${bike2.specs.topSpeed} km/h</td></tr>
                <tr><td>Brakes</td><td>${bike1.specs.brakes}</td><td>${bike2.specs.brakes}</td></tr>
                <tr><td>Fuel Tank</td><td>${bike1.specs.fuelCapacity} L</td><td>${bike2.specs.fuelCapacity} L</td></tr>
                <tr><td>Pickup (Acceleration)</td><td>${bike1.specs.pickup}</td><td>${bike2.specs.pickup}</td></tr>
                <tr><td>Maintenance Cost</td><td>${bike1.specs.maintenance}</td><td>${bike2.specs.maintenance}</td></tr>
            </tbody>
        </table>
        <p style="margin-top:1rem;"><strong>Verdict:</strong> ${getComparisonVerdict(bike1, bike2)}</p>
    `;

    // Scroll to comparison result
    comparisonResultEl.scrollIntoView({ behavior: 'smooth' });
}

function getComparisonVerdict(bike1, bike2) {
    if (bike1.price > bike2.price + 5000) return `${bike2.name} offers better value for money.`;
    if (bike1.mileage > bike2.mileage + 20) return `${bike1.name} is significantly more fuel efficient.`;
    if (bike1.engineCC > bike2.engineCC + 500) return `${bike1.name} has substantially more power.`;
    return "Both bikes have their strengths. Consider your primary use (city commute, touring, sport riding).";
}

// ============================================
// DETAILED BIKE SPECS MODAL (Simulated)
// ============================================
function showBikeDetails(bikeId) {
    const bike = bikeData.find(b => b.id === bikeId);
    if (!bike) return;

    // In a full implementation, this would open a modal or navigate to a details page.
    // For this example, we show an alert with key specs.
    const detailsMessage = `
        ${bike.name} - Full Specifications:
        • Brand: ${bike.brand}
        • Price: $${bike.price.toLocaleString()}
        • Engine: ${bike.engineCC}cc
        • Mileage: ${bike.mileage} km/l
        • Top Speed: ${bike.specs.topSpeed} km/h
        • ABS: ${bike.abs}
        • Fuel Tank: ${bike.specs.fuelCapacity} liters
        • Brakes: ${bike.specs.brakes}
        • Suspension: ${bike.specs.suspension}
        • Tyres: ${bike.specs.tyres}
        • Headlight: ${bike.specs.headlight || 'LED/Halogen'}
        • Maintenance Cost: ${bike.specs.maintenance}
        • Pickup: ${bike.specs.pickup}
        • Comfort: ${bike.specs.comfort}
    `;

    alert(detailsMessage);
    console.log("Full bike object for developer reference:", bike);
}

// ============================================
// INITIALIZE PAGE ON LOAD
// ============================================
function initializePage() {
    // 1. Populate brand filter with unique brands from data
    const allBrands = [...new Set(bikeData.map(bike => bike.brand))];
    allBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        filterBrand.appendChild(option);
    });

    // 2. Display all bikes initially
    displayBikes(currentBikes, bikeListingEl);

    // 3. Populate "Top 10 Featured" of the month (logic: bikes marked featured + some random)
    const featuredBikes = bikeData
        .filter(bike => bike.featured)
        .sort(() => 0.5 - Math.random()) // Simple shuffle
        .slice(0, 10);
    displayBikes(featuredBikes, featuredBikesEl, true);

    // 4. Populate comparison dropdowns
    updateCompareDropdowns();

    // 5. Set up event listeners
    searchBtn.addEventListener('click', filterAndSortBikes);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') filterAndSortBikes();
    });

    [filterBrand, filterType, filterPrice, sortSelect].forEach(element => {
        element.addEventListener('change', filterAndSortBikes);
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterBrand.value = '';
        filterType.value = '';
        filterPrice.value = '';
        sortSelect.value = 'name';
        filterAndSortBikes();
    });

    compareBtn.addEventListener('click', performComparison);
    clearCompareBtn.addEventListener('click', () => {
        bikesToCompare = [];
        comparisonResultEl.innerHTML = `<p class="info-note">Comparison cleared. Select two new bikes from the dropdowns above.</p>`;
        compareDropdown1.value = '';
        compareDropdown2.value = '';
    });

    // Initial filter call
    filterAndSortBikes();
}

// Start the application when page loads
document.addEventListener('DOMContentLoaded', initializePage);
