// Global state for reports
let reportState = {
    totalItems: 0,
    valueRecovered: 0,
    processingCosts: 0,
    netRecovery: 0
};

// Update reports based on data and decisions
function updateReports(data, decisions) {
    // Calculate report metrics
    calculateReportMetrics(data, decisions);
    
    // Update DOM with metrics
    updateReportDOM();
    
    // Update report chart
    if (window.createReportDecisionsChart) {
        window.createReportDecisionsChart(data, decisions, window.state.theme);
    }
    
    // Set up report action buttons
    setupReportActions();
}

// Calculate report metrics
function calculateReportMetrics(data, decisions) {
    // Count total items
    reportState.totalItems = data.length;
    
    // Calculate value recovered, processing costs, and net recovery
    let valueRecovered = 0;
    let processingCosts = 0;
    
    decisions.forEach(decision => {
        if (decision.decision) {
            const item = data.find(i => i.SKU === decision.sku);
            if (item) {
                const refurbCost = item['Refurbishment Cost'] || 0;
                const resaleValue = item['Resale Value'] || 0;
                
                if (decision.decision === 'refurbish') {
                    valueRecovered += resaleValue;
                    processingCosts += refurbCost;
                } else if (decision.decision === 'resell') {
                    valueRecovered += resaleValue * 0.8; // Assume 80% of value for as-is resale
                    processingCosts += refurbCost * 0.2; // Some minimal processing cost
                } else if (decision.decision === 'recycle') {
                    valueRecovered += resaleValue * 0.2; // Assume 20% recovery for recycling
                    processingCosts += refurbCost * 0.1; // Minimal processing cost
                } else if (decision.decision === 'discard') {
                    // No recovery for discarded items
                    processingCosts += refurbCost * 0.05; // Disposal cost
                }
            }
        }
    });
    
    // If no decisions made yet, use sample data for demo
    if (valueRecovered === 0 && processingCosts === 0) {
        let totalValue = 0;
        let totalCost = 0;
        
        data.forEach(item => {
            totalValue += item['Resale Value'] || 0;
            totalCost += item['Refurbishment Cost'] || 0;
        });
        
        valueRecovered = totalValue * 0.7; // Assume 70% recovery for demo
        processingCosts = totalCost * 0.8; // Assume 80% of costs for demo
    }
    
    reportState.valueRecovered = valueRecovered;
    reportState.processingCosts = processingCosts;
    reportState.netRecovery = valueRecovered - processingCosts;
}

// Update report DOM elements
function updateReportDOM() {
    document.getElementById('report-total-items').textContent = reportState.totalItems;
    document.getElementById('report-value-recovered').textContent = '$' + reportState.valueRecovered.toFixed(2);
    document.getElementById('report-processing-costs').textContent = '$' + reportState.processingCosts.toFixed(2);
    
    const netRecoveryElement = document.getElementById('report-net-recovery');
    netRecoveryElement.textContent = '$' + reportState.netRecovery.toFixed(2);
    
    // Add color based on net recovery
    if (reportState.netRecovery > 0) {
        netRecoveryElement.classList.add('positive');
        netRecoveryElement.classList.remove('negative');
    } else {
        netRecoveryElement.classList.add('negative');
        netRecoveryElement.classList.remove('positive');
    }
}

// Set up report action buttons
function setupReportActions() {
    const generateReportBtn = document.getElementById('generate-report-btn');
    const saveReflectionBtn = document.getElementById('save-reflection-btn');
    
    // Generate PDF report
    generateReportBtn.addEventListener('click', generatePDFReport);
    
    // Save reflection
    saveReflectionBtn.addEventListener('click', saveReflection);
}

// Generate PDF report
function generatePDFReport() {
    // Check if jsPDF is available
    if (typeof jspdf === 'undefined') {
        alert('PDF generation library not loaded. Please try again later.');
        return;
    }
    
    // Create new PDF document
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Return Value Recovery Simulation Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 20, 30);
    
    // Add summary metrics
    doc.setFontSize(16);
    doc.text('Simulation Summary', 20, 45);
    
    doc.setFontSize(12);
    doc.text('Total Items Processed: ' + reportState.totalItems, 25, 55);
    doc.text('Value Recovered: $' + reportState.valueRecovered.toFixed(2), 25, 65);
    doc.text('Processing Costs: $' + reportState.processingCosts.toFixed(2), 25, 75);
    doc.text('Net Recovery: $' + reportState.netRecovery.toFixed(2), 25, 85);
    
    // Add reflection if provided
    const keyInsights = document.getElementById('key-insights').value;
    const challenges = document.getElementById('challenges').value;
    const strategies = document.getElementById('strategies').value;
    
    if (keyInsights || challenges || strategies) {
        doc.setFontSize(16);
        doc.text('Learning Reflection', 20, 105);
        
        doc.setFontSize(12);
        if (keyInsights) {
            doc.text('Key Insights:', 25, 115);
            const insightLines = doc.splitTextToSize(keyInsights, 160);
            doc.text(insightLines, 30, 125);
        }
        
        let yPos = 125 + (keyInsights ? Math.min(doc.splitTextToSize(keyInsights, 160).length * 7, 40) : 0);
        
        if (challenges) {
            doc.text('Challenges:', 25, yPos);
            const challengeLines = doc.splitTextToSize(challenges, 160);
            doc.text(challengeLines, 30, yPos + 10);
        }
        
        yPos += (challenges ? Math.min(doc.splitTextToSize(challenges, 160).length * 7, 40) + 10 : 0);
        
        if (strategies) {
            doc.text('Strategies:', 25, yPos);
            const strategyLines = doc.splitTextToSize(strategies, 160);
            doc.text(strategyLines, 30, yPos + 10);
        }
    }
    
    // Save the PDF
    doc.save('return_recovery_report.pdf');
}

// Save reflection to localStorage
function saveReflection() {
    const keyInsights = document.getElementById('key-insights').value;
    const challenges = document.getElementById('challenges').value;
    const strategies = document.getElementById('strategies').value;
    
    // Create reflection object
    const reflection = {
        keyInsights,
        challenges,
        strategies,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('returnDashboardReflection', JSON.stringify(reflection));
    
    // Show confirmation
    alert('Reflection saved successfully!');
}

// Load saved reflection if available
function loadSavedReflection() {
    const savedReflection = localStorage.getItem('returnDashboardReflection');
    
    if (savedReflection) {
        try {
            const reflection = JSON.parse(savedReflection);
            
            document.getElementById('key-insights').value = reflection.keyInsights || '';
            document.getElementById('challenges').value = reflection.challenges || '';
            document.getElementById('strategies').value = reflection.strategies || '';
        } catch (error) {
            console.error('Error loading saved reflection:', error);
        }
    }
}

// Initialize reports when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSavedReflection();
});

// Make function available globally
window.updateReports = updateReports;
