// Global state
const state = {
    data: [],
    decisions: [],
    filters: {
        timeRange: 30,
        category: 'all'
    },
    theme: 'light'
};

// DOM Elements
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    navItems: document.querySelectorAll('.nav-menu li'),
    sections: document.querySelectorAll('.content-section'),
    uploadSection: document.getElementById('upload-section'),
    dashboardContent: document.getElementById('dashboard-content'),
    fileUpload: document.getElementById('file-upload'),
    sampleDataBtn: document.getElementById('sample-data-btn'),
    uploadStatus: document.getElementById('upload-status'),
    progressBar: document.querySelector('.progress'),
    statusText: document.querySelector('.status-text'),
    helpBtn: document.getElementById('help-btn'),
    helpModal: document.getElementById('help-modal'),
    closeModal: document.querySelector('.close-modal'),
    downloadBtn: document.getElementById('download-btn')
};

// Initialize the application
function initApp() {
    setupEventListeners();
    setupTheme();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('change', toggleTheme);
    
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.querySelector('a').getAttribute('href').substring(1);
            navigateTo(target);
        });
    });
    
    // File upload
    elements.fileUpload.addEventListener('change', handleFileUpload);
    
    // Sample data button
    elements.sampleDataBtn.addEventListener('click', loadSampleData);
    
    // Help modal
    elements.helpBtn.addEventListener('click', () => toggleModal(elements.helpModal));
    elements.closeModal.addEventListener('click', () => toggleModal(elements.helpModal));
    
    // Download button
    elements.downloadBtn.addEventListener('click', downloadData);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.helpModal) {
            toggleModal(elements.helpModal);
        }
    });
}

// Toggle theme between light and dark
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    state.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    
    // Update charts with new theme
    if (window.updateChartsTheme) {
        window.updateChartsTheme(state.theme);
    }
}

// Setup theme based on user preference
function setupTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
        document.body.classList.add('dark-mode');
        elements.themeToggle.checked = true;
        state.theme = 'dark';
    }
}

// Navigate to a section
function navigateTo(sectionId) {
    // Update active nav item
    elements.navItems.forEach(item => {
        const itemTarget = item.querySelector('a').getAttribute('href').substring(1);
        if (itemTarget === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show selected section, hide others
    elements.sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        processData(event.target.result);
    };
    
    reader.onprogress = function(event) {
        if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            updateProgress(progress, 'Reading file...');
        }
    };
    
    elements.uploadStatus.classList.remove('hidden');
    updateProgress(0, 'Starting upload...');
    
    reader.readAsText(file);
}

// Load sample data
function loadSampleData() {
    elements.uploadStatus.classList.remove('hidden');
    updateProgress(0, 'Loading sample data...');
    
    // Simulate loading
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        updateProgress(progress, 'Loading sample data...');
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                processData(window.sampleData);
            }, 500);
        }
    }, 200);
}

// Process CSV data
function processData(csvData) {
    updateProgress(100, 'Processing data...');
    
    // If it's not the sample data (which is already an object)
    if (typeof csvData === 'string') {
        state.data = parseCSV(csvData);
    } else {
        state.data = csvData;
    }
    
    // Initialize with empty decisions
    state.decisions = state.data.map(item => ({
        sku: item.SKU,
        decision: null
    }));
    
    setTimeout(() => {
        elements.uploadSection.classList.add('hidden');
        elements.dashboardContent.classList.remove('hidden');
        
        // Initialize dashboard
        updateDashboard();
        
        // Navigate to overview
        navigateTo('overview');
    }, 1000);
}

// Parse CSV string to array of objects
function parseCSV(csvString) {
    const lines = csvString.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const values = line.split(',').map(value => value.trim());
        const obj = {};
        
        headers.forEach((header, index) => {
            // Convert numeric values
            if (!isNaN(values[index]) && values[index] !== '') {
                obj[header] = parseFloat(values[index]);
            } else {
                obj[header] = values[index];
            }
        });
        
        return obj;
    });
}

// Update progress bar
function updateProgress(percent, message) {
    elements.progressBar.style.width = `${percent}%`;
    elements.statusText.textContent = message;
}

// Toggle modal visibility
function toggleModal(modal) {
    modal.classList.toggle('hidden');
}

// Download data as CSV
function downloadData() {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = Object.keys(state.data[0]).join(",");
    csvContent += headers + "\r\n";
    
    // Add data rows
    state.data.forEach(item => {
        const row = Object.values(item).join(",");
        csvContent += row + "\r\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "return_data.csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Update all dashboard components
function updateDashboard() {
    // Update metrics
    updateMetrics();
    
    // Update charts
    if (window.initializeCharts) {
        window.initializeCharts(state.data, state.theme);
    }
    
    // Update decision table
    if (window.populateDecisionTable) {
        window.populateDecisionTable(state.data, state.decisions);
    }
    
    // Update reports
    if (window.updateReports) {
        window.updateReports(state.data, state.decisions);
    }
}

// Update dashboard metrics
function updateMetrics() {
    // Calculate metrics
    const totalReturns = state.data.length;
    
    // Count dispositions if they exist in the data
    let resold = 0;
    let refurbished = 0;
    let discarded = 0;
    
    state.data.forEach(item => {
        if (item.Disposition) {
            if (item.Disposition.toLowerCase() === 'resold') resold++;
            if (item.Disposition.toLowerCase() === 'refurbished') refurbished++;
            if (item.Disposition.toLowerCase() === 'discarded') discarded++;
        }
    });
    
    // If no dispositions in data, use decisions
    if (resold === 0 && refurbished === 0 && discarded === 0) {
        state.decisions.forEach(decision => {
            if (decision.decision === 'resell') resold++;
            if (decision.decision === 'refurbish') refurbished++;
            if (decision.decision === 'discard') discarded++;
        });
    }
    
    // Calculate percentages
    const resoldPercent = totalReturns > 0 ? Math.round((resold / totalReturns) * 100) : 0;
    const refurbishedPercent = totalReturns > 0 ? Math.round((refurbished / totalReturns) * 100) : 0;
    const discardedPercent = totalReturns > 0 ? Math.round((discarded / totalReturns) * 100) : 0;
    
    // Update DOM
    document.getElementById('total-returns').textContent = totalReturns;
    document.getElementById('resold-percent').textContent = resoldPercent;
    document.getElementById('refurbished-percent').textContent = refurbishedPercent;
    document.getElementById('discarded-percent').textContent = discardedPercent;
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
