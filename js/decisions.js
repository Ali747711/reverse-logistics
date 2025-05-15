// Global state for decisions
let decisionState = {
    filter: 'all',
    search: '',
    processedItems: 0,
    totalRecovery: 0,
    netMargin: 0
};

// Initialize the decision table
function populateDecisionTable(data, decisions) {
    const tableBody = document.querySelector('#decision-table tbody');
    const searchInput = document.getElementById('decision-search');
    const searchBtn = document.getElementById('search-btn');
    const filterSelect = document.getElementById('decision-filter');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Remove existing event listeners to prevent duplicates
    searchInput.removeEventListener('input', handleSearchInput);
    searchBtn.removeEventListener('click', handleSearchClick);
    filterSelect.removeEventListener('change', handleFilterChange);
    
    // Set up event listeners with named functions to allow removal
    function handleSearchInput() {
        decisionState.search = searchInput.value.toLowerCase();
        filterDecisionTable(data, decisions);
    }
    
    function handleSearchClick() {
        decisionState.search = searchInput.value.toLowerCase();
        filterDecisionTable(data, decisions);
    }
    
    function handleFilterChange() {
        decisionState.filter = filterSelect.value;
        filterDecisionTable(data, decisions);
    }
    
    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchBtn.addEventListener('click', handleSearchClick);
    filterSelect.addEventListener('change', handleFilterChange);
    
    // Add enter key support for search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    });
    
    // Initial population
    filterDecisionTable(data, decisions);
    
    // Update summary
    updateDecisionSummary(decisions, data);
}

// Filter and display decision table
function filterDecisionTable(data, decisions) {
    const tableBody = document.querySelector('#decision-table tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Filter data based on search and filter
    const filteredData = data.filter(item => {
        // Search filter
        const matchesSearch = decisionState.search === '' || 
            item.SKU.toLowerCase().includes(decisionState.search) || 
            item['Product Name'].toLowerCase().includes(decisionState.search);
        
        // Decision filter
        let matchesFilter = true;
        
        if (decisionState.filter !== 'all') {
            const decision = decisions.find(d => d.sku === item.SKU)?.decision;
            
            if (decisionState.filter === 'pending') {
                matchesFilter = !decision;
            } else if (decisionState.filter === 'profitable') {
                matchesFilter = (item['Resale Value'] - item['Refurbishment Cost']) > 0;
            } else if (decisionState.filter === 'loss') {
                matchesFilter = (item['Resale Value'] - item['Refurbishment Cost']) <= 0;
            }
        }
        
        return matchesSearch && matchesFilter;
    });
    
    // Add rows for filtered data
    filteredData.forEach(item => {
        const row = createDecisionRow(item, decisions);
        tableBody.appendChild(row);
    });
}

// Create a table row for a decision item
function createDecisionRow(item, decisions) {
    const row = document.createElement('tr');
    
    // Calculate margin
    const refurbCost = item['Refurbishment Cost'] || 0;
    const resaleValue = item['Resale Value'] || 0;
    const margin = resaleValue - refurbCost;
    const marginClass = margin > 0 ? 'positive' : 'negative';
    
    // Get current decision if any
    const decisionObj = decisions.find(d => d.sku === item.SKU);
    const currentDecision = decisionObj ? decisionObj.decision : null;
    
    // Create row content
    row.innerHTML = `
        <td>${item.SKU}</td>
        <td>${item['Product Name']}</td>
        <td>${item.Condition}</td>
        <td>$${refurbCost.toFixed(2)}</td>
        <td>$${resaleValue.toFixed(2)}</td>
        <td class="${marginClass}">$${margin.toFixed(2)}</td>
        <td>${item['Days in Process']}</td>
        <td>
            <div class="action-buttons">
                <button class="action-btn refurbish ${currentDecision === 'refurbish' ? 'active' : ''}" data-action="refurbish" data-sku="${item.SKU}">Refurbish</button>
                <button class="action-btn resell ${currentDecision === 'resell' ? 'active' : ''}" data-action="resell" data-sku="${item.SKU}">Resell</button>
                <button class="action-btn recycle ${currentDecision === 'recycle' ? 'active' : ''}" data-action="recycle" data-sku="${item.SKU}">Recycle</button>
                <button class="action-btn discard ${currentDecision === 'discard' ? 'active' : ''}" data-action="discard" data-sku="${item.SKU}">Discard</button>
            </div>
        </td>
    `;
    
    // Add event listeners to buttons
    const buttons = row.querySelectorAll('.action-btn');
    buttons.forEach(button => {
        button.addEventListener('click', handleDecisionClick);
    });
    
    return row;
}

// Handle decision button click
function handleDecisionClick(e) {
    const button = e.currentTarget;
    const action = button.getAttribute('data-action');
    const sku = button.getAttribute('data-sku');
    
    // Get all buttons in this row
    const row = button.closest('tr');
    const allButtons = row.querySelectorAll('.action-btn');
    
    // Remove active class from all buttons
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Update decision in state
    const decisionIndex = window.state.decisions.findIndex(d => d.sku === sku);
    if (decisionIndex !== -1) {
        window.state.decisions[decisionIndex].decision = action;
    }
    
    // Update summary
    updateDecisionSummary(window.state.decisions, window.state.data);
    
    // Update reports if available
    if (window.updateReports) {
        window.updateReports(window.state.data, window.state.decisions);
    }
}

// Update decision summary metrics
function updateDecisionSummary(decisions, data) {
    // Count processed items
    const processedItems = decisions.filter(d => d.decision).length;
    
    // Calculate total recovery value and net margin
    let totalRecovery = 0;
    let netMargin = 0;
    
    decisions.forEach(decision => {
        if (decision.decision) {
            const item = data.find(i => i.SKU === decision.sku);
            if (item) {
                const refurbCost = item['Refurbishment Cost'] || 0;
                const resaleValue = item['Resale Value'] || 0;
                
                if (decision.decision === 'refurbish') {
                    totalRecovery += resaleValue;
                    netMargin += resaleValue - refurbCost;
                } else if (decision.decision === 'resell') {
                    totalRecovery += resaleValue * 0.8; // Assume 80% of value for as-is resale
                    netMargin += (resaleValue * 0.8); // No refurb cost
                } else if (decision.decision === 'recycle') {
                    totalRecovery += resaleValue * 0.2; // Assume 20% recovery for recycling
                    netMargin += (resaleValue * 0.2); // No refurb cost
                } else if (decision.decision === 'discard') {
                    // No recovery for discarded items
                }
            }
        }
    });
    
    // If no decisions made yet, use sample data for demo
    if (processedItems === 0) {
        // Calculate estimated values based on data
        let estimatedValue = 0;
        data.forEach(item => {
            estimatedValue += (item['Resale Value'] || 0) * 0.7; // Assume 70% recovery
        });
        
        // Set demo values
        totalRecovery = estimatedValue;
        netMargin = estimatedValue * 0.4; // Assume 40% margin
    }
    
    // Update state
    decisionState.processedItems = processedItems;
    decisionState.totalRecovery = totalRecovery;
    decisionState.netMargin = netMargin;
    
    // Update DOM
    document.getElementById('items-processed').textContent = processedItems;
    document.getElementById('total-recovery').textContent = '$' + totalRecovery.toFixed(2);
    document.getElementById('net-margin').textContent = '$' + netMargin.toFixed(2);
    
    // Add color to net margin based on value
    const netMarginElement = document.getElementById('net-margin');
    if (netMargin > 0) {
        netMarginElement.classList.add('positive');
        netMarginElement.classList.remove('negative');
    } else {
        netMarginElement.classList.add('negative');
        netMarginElement.classList.remove('positive');
    }
}

// Add CSS for positive/negative values
function addDecisionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .positive {
            color: #4cc9f0;
            font-weight: 600;
        }
        .negative {
            color: #f72585;
            font-weight: 600;
        }
        .action-btn.active {
            opacity: 1;
            font-weight: 600;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

// Initialize styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addDecisionStyles);

// Make function available globally
window.populateDecisionTable = populateDecisionTable;
