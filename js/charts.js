// Global chart instances
let dispositionChart;
let timelineChart;
let topProductsChart;
let conditionChart;
let roiChart;
let reportDecisionsChart;

// Chart colors
const chartColors = {
    light: {
        primary: '#4361ee',
        secondary: '#3a0ca3',
        accent: '#7209b7',
        success: '#4cc9f0',
        warning: '#f72585',
        danger: '#e63946',
        background: '#ffffff',
        text: '#212529',
        grid: '#e9ecef'
    },
    dark: {
        primary: '#4361ee',
        secondary: '#3a0ca3',
        accent: '#7209b7',
        success: '#4cc9f0',
        warning: '#f72585',
        danger: '#e63946',
        background: '#1e1e1e',
        text: '#f8f9fa',
        grid: '#343a40'
    }
};

// Initialize all charts
function initializeCharts(data, theme) {
    // Set Chart.js defaults based on theme
    setChartDefaults(theme);
    
    // Create charts
    createDispositionChart(data, theme);
    createTimelineChart(data, theme);
    createTopProductsChart(data, theme);
    createConditionChart(data, theme);
    createROIChart(data, theme);
    createReportDecisionsChart(data, theme);
}

// Set Chart.js global defaults
function setChartDefaults(theme) {
    const colors = chartColors[theme];
    
    Chart.defaults.color = colors.text;
    Chart.defaults.borderColor = colors.grid;
    Chart.defaults.backgroundColor = colors.background;
    
    // Set font family
    Chart.defaults.font.family = "'Poppins', sans-serif";
}

// Update charts when theme changes
function updateChartsTheme(theme) {
    // Update global defaults
    setChartDefaults(theme);
    
    // Update each chart
    updateChartTheme(dispositionChart, theme);
    updateChartTheme(timelineChart, theme);
    updateChartTheme(topProductsChart, theme);
    updateChartTheme(conditionChart, theme);
    updateChartTheme(roiChart, theme);
    updateChartTheme(reportDecisionsChart, theme);
}

// Update individual chart theme
function updateChartTheme(chart, theme) {
    if (!chart) return;
    
    const colors = chartColors[theme];
    
    // Update options
    chart.options.plugins.legend.labels.color = colors.text;
    chart.options.scales.x.ticks.color = colors.text;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.x.grid.color = colors.grid;
    chart.options.scales.y.grid.color = colors.grid;
    
    // Update and render
    chart.update();
}

// Create disposition breakdown pie chart
function createDispositionChart(data, theme) {
    const ctx = document.getElementById('disposition-chart').getContext('2d');
    const colors = chartColors[theme];
    
    // Count dispositions
    let resold = 0;
    let refurbished = 0;
    let discarded = 0;
    let recycled = 0;
    let pending = data.length;
    
    // If data has disposition field
    data.forEach(item => {
        if (item.Disposition) {
            pending--;
            if (item.Disposition.toLowerCase() === 'resold') resold++;
            if (item.Disposition.toLowerCase() === 'refurbished') refurbished++;
            if (item.Disposition.toLowerCase() === 'discarded') discarded++;
            if (item.Disposition.toLowerCase() === 'recycled') recycled++;
        }
    });
    
    // If all items are pending, show equal distribution for demo
    if (pending === data.length) {
        resold = Math.floor(data.length * 0.4);
        refurbished = Math.floor(data.length * 0.3);
        discarded = Math.floor(data.length * 0.2);
        recycled = Math.floor(data.length * 0.1);
        pending = 0;
    }
    
    // Destroy existing chart if it exists
    if (dispositionChart) {
        dispositionChart.destroy();
    }
    
    // Create new chart
    dispositionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Resold', 'Refurbished', 'Discarded', 'Recycled', 'Pending'],
            datasets: [{
                data: [resold, refurbished, discarded, recycled, pending],
                backgroundColor: [
                    colors.primary,
                    colors.success,
                    colors.warning,
                    colors.accent,
                    colors.grid
                ],
                borderWidth: 1,
                borderColor: colors.background
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        boxWidth: 12,
                        color: colors.text
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create timeline chart
function createTimelineChart(data, theme) {
    const ctx = document.getElementById('timeline-chart').getContext('2d');
    const colors = chartColors[theme];
    
    // Group data by days in process
    const dayGroups = {};
    const maxDays = 30; // Show up to 30 days
    
    // Initialize all days to 0
    for (let i = 1; i <= maxDays; i++) {
        dayGroups[i] = 0;
    }
    
    // Count items by days
    data.forEach(item => {
        const days = Math.min(item['Days in Process'], maxDays);
        if (days > 0) {
            dayGroups[days] = (dayGroups[days] || 0) + 1;
        }
    });
    
    // Calculate cumulative recovery
    const cumulativeRecovery = [];
    let cumulativeValue = 0;
    
    for (let i = 1; i <= maxDays; i++) {
        const itemsOnDay = data.filter(item => item['Days in Process'] === i);
        const dayValue = itemsOnDay.reduce((sum, item) => sum + (item['Resale Value'] || 0), 0);
        cumulativeValue += dayValue;
        cumulativeRecovery.push(cumulativeValue);
    }
    
    // Destroy existing chart if it exists
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    // Create new chart
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: maxDays }, (_, i) => `Day ${i + 1}`),
            datasets: [
                {
                    label: 'Items Processed',
                    data: Object.values(dayGroups),
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    type: 'bar',
                    yAxisID: 'y'
                },
                {
                    label: 'Cumulative Value ($)',
                    data: cumulativeRecovery,
                    backgroundColor: 'transparent',
                    borderColor: colors.success,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: colors.text
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: colors.text
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Items Processed',
                        color: colors.text
                    },
                    ticks: {
                        color: colors.text
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cumulative Value ($)',
                        color: colors.text
                    },
                    ticks: {
                        color: colors.text,
                        callback: function(value) {
                            return '$' + value;
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: colors.grid
                    }
                }
            }
        }
    });
}

// Create top products chart
function createTopProductsChart(data, theme) {
    const ctx = document.getElementById('top-products-chart').getContext('2d');
    const colors = chartColors[theme];
    
    // Calculate value recovered for each product
    const productValues = {};
    
    data.forEach(item => {
        const productName = item['Product Name'];
        const resaleValue = item['Resale Value'] || 0;
        const refurbCost = item['Refurbishment Cost'] || 0;
        const valueRecovered = resaleValue - refurbCost;
        
        productValues[productName] = (productValues[productName] || 0) + valueRecovered;
    });
    
    // Sort products by value and get top 10
    const sortedProducts = Object.entries(productValues)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const productNames = sortedProducts.map(item => item[0]);
    const values = sortedProducts.map(item => item[1]);
    
    // Generate gradient colors
    const gradientColors = productNames.map((_, index) => {
        const colorValue = Math.floor(255 * (index / productNames.length));
        return `rgba(67, 97, 238, ${1 - (index / productNames.length) * 0.7})`;
    });
    
    // Destroy existing chart if it exists
    if (topProductsChart) {
        topProductsChart.destroy();
    }
    
    // Create new chart
    topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productNames,
            datasets: [{
                label: 'Value Recovered ($)',
                data: values,
                backgroundColor: gradientColors,
                borderColor: colors.primary,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Value: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: colors.text,
                        callback: function(value) {
                            return '$' + value;
                        }
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y: {
                    ticks: {
                        color: colors.text
                    },
                    grid: {
                        color: colors.grid
                    }
                }
            }
        }
    });
}

// Create condition chart
function createConditionChart(data, theme) {
    const ctx = document.getElementById('condition-chart').getContext('2d');
    const colors = chartColors[theme];
    
    // Group by condition
    const conditions = ['Like New', 'Good', 'Fair', 'Poor'];
    const conditionData = {};
    
    // Initialize with zeros
    conditions.forEach(condition => {
        conditionData[condition] = {
            count: 0,
            totalValue: 0,
            avgValue: 0
        };
    });
    
    // Calculate data for each condition
    data.forEach(item => {
        const condition = item.Condition;
        if (conditions.includes(condition)) {
            conditionData[condition].count++;
            conditionData[condition].totalValue += (item['Resale Value'] || 0) - (item['Refurbishment Cost'] || 0);
        }
    });
    
    // Calculate average values
    conditions.forEach(condition => {
        if (conditionData[condition].count > 0) {
            conditionData[condition].avgValue = conditionData[condition].totalValue / conditionData[condition].count;
        }
    });
    
    // Prepare chart data
    const counts = conditions.map(condition => conditionData[condition].count);
    const avgValues = conditions.map(condition => conditionData[condition].avgValue);
    
    // Destroy existing chart if it exists
    if (conditionChart) {
        conditionChart.destroy();
    }
    
    // Create new chart
    conditionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: conditions,
            datasets: [
                {
                    label: 'Number of Items',
                    data: counts,
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Avg. Recovery Value ($)',
                    data: avgValues,
                    backgroundColor: 'transparent',
                    borderColor: colors.success,
                    borderWidth: 2,
                    type: 'line',
                    pointRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: colors.text
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Avg. Recovery Value ($)') {
                                return `Avg. Value: $${context.raw.toFixed(2)}`;
                            }
                            return `Count: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: colors.text
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Items',
                        color: colors.text
                    },
                    ticks: {
                        color: colors.text
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Avg. Recovery Value ($)',
                        color: colors.text
                    },
                    ticks: {
                        color: colors.text,
                        callback: function(value) {
                            return '$' + value;
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: colors.grid
                    }
                }
            }
        }
    });
}

// Create ROI chart
function createROIChart(data, theme) {
    const ctx = document.getElementById('roi-chart').getContext('2d');
    const colors = chartColors[theme];
    
    // Calculate ROI for each item
    const roiData = data.map(item => {
        const refurbCost = item['Refurbishment Cost'] || 0;
        const resaleValue = item['Resale Value'] || 0;
        const roi = refurbCost > 0 ? ((resaleValue - refurbCost) / refurbCost) * 100 : 0;
        
        return {
            sku: item.SKU,
            product: item['Product Name'],
            roi: roi,
            refurbCost: refurbCost,
            resaleValue: resaleValue
        };
    });
    
    // Sort by ROI
    roiData.sort((a, b) => b.roi - a.roi);
    
    // Get top and bottom 5 for comparison
    const top5 = roiData.slice(0, 5);
    const bottom5 = roiData.slice(-5).reverse();
    
    // Prepare chart data
    const labels = [...top5.map(item => item.product), ...bottom5.map(item => item.product)];
    const roiValues = [...top5.map(item => item.roi), ...bottom5.map(item => item.roi)];
    const backgroundColors = [
        ...Array(5).fill(colors.success),
        ...Array(5).fill(colors.warning)
    ];
    
    // Destroy existing chart if it exists
    if (roiChart) {
        roiChart.destroy();
    }
    
    // Create new chart
    roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ROI (%)',
                data: roiValues,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const item = index < 5 ? top5[index] : bottom5[index - 5];
                            return [
                                `ROI: ${item.roi.toFixed(1)}%`,
                                `Cost: $${item.refurbCost.toFixed(2)}`,
                                `Value: $${item.resaleValue.toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: colors.text,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y: {
                    ticks: {
                        color: colors.text,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: colors.grid
                    }
                }
            }
        }
    });
}

// Create report decisions chart
function createReportDecisionsChart(data, decisions, theme) {
    const ctx = document.getElementById('report-decisions-chart').getContext('2d');
    const colors = chartColors[theme];
    
    // Count decisions
    let refurbish = 0;
    let resell = 0;
    let recycle = 0;
    let discard = 0;
    let pending = data.length;
    
    // Check if we have decision counts in reportState
    if (window.reportState && window.reportState.decisionCounts) {
        refurbish = window.reportState.decisionCounts.refurbish;
        resell = window.reportState.decisionCounts.resell;
        recycle = window.reportState.decisionCounts.recycle;
        discard = window.reportState.decisionCounts.discard;
        pending = data.length - (refurbish + resell + recycle + discard);
    } else {
        // Count from decisions array as fallback
        if (decisions && decisions.length > 0) {
            decisions.forEach(decision => {
                if (decision.decision) {
                    pending--;
                    if (decision.decision === 'refurbish') refurbish++;
                    if (decision.decision === 'resell') resell++;
                    if (decision.decision === 'recycle') recycle++;
                    if (decision.decision === 'discard') discard++;
                }
            });
        } else {
            // Demo data if no decisions
            refurbish = Math.floor(data.length * 0.3);
            resell = Math.floor(data.length * 0.4);
            recycle = Math.floor(data.length * 0.1);
            discard = Math.floor(data.length * 0.2);
            pending = 0;
        }
    }
    
    // Destroy existing chart if it exists
    if (reportDecisionsChart) {
        reportDecisionsChart.destroy();
    }
    
    // Create new chart
    reportDecisionsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Refurbish', 'Resell', 'Recycle', 'Discard', 'Pending'],
            datasets: [{
                data: [refurbish, resell, recycle, discard, pending],
                backgroundColor: [
                    colors.success,
                    colors.primary,
                    colors.accent,
                    colors.warning,
                    colors.grid
                ],
                borderWidth: 1,
                borderColor: colors.background
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        boxWidth: 12,
                        color: colors.text
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Make functions available globally
window.initializeCharts = initializeCharts;
window.updateChartsTheme = updateChartsTheme;
window.createReportDecisionsChart = createReportDecisionsChart;
