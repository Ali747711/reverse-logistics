# Return Value Recovery Dashboard

## Learning Simulation Tool

This interactive dashboard helps students understand the challenges and decisions involved in reverse logistics, specifically focusing on reselling or refurbishing returned goods.

## Overview

The Return Value Recovery Dashboard is a web-based simulation tool designed for logistics education. It allows students to:

- Upload and analyze return data
- Visualize key metrics about returned items
- Make decisions on whether to refurbish, resell, recycle, or discard items
- Track the financial impact of these decisions
- Generate reports on learning outcomes

## Features

1. **Interactive Dashboard**
   - Overview of key metrics (total returns, % resold, % refurbished, % discarded)
   - Visual data representations (charts and graphs)
   - Decision-making interface for individual products
   - Learning report generation

2. **Data Visualization**
   - Disposition breakdown (pie chart)
   - Value recovery timeline (line chart)
   - Top products by value recovered (bar chart)
   - Recovery rate by condition (mixed chart)
   - Refurbishment ROI analysis (bar chart)

3. **Decision Simulation**
   - Make decisions on individual returned items
   - See real-time calculation of recovery margin
   - Filter and search through return inventory
   - Track overall financial impact

4. **Learning Report**
   - Summary of simulation results
   - Decision breakdown visualization
   - Reflection questions for educational purposes
   - PDF report generation

## Getting Started

1. Open `index.html` in a web browser
2. Click "Use Sample Data" or upload your own CSV file
3. Explore the dashboard tabs to analyze the data
4. Make decisions on returned items in the "Product Decisions" tab
5. Generate a learning report in the "Reports" tab

## CSV Format

If uploading your own data, your CSV should include these columns:
- SKU - Product identifier
- Product Name - Name of the product
- Category - Product category
- Returned Qty - Quantity returned
- Condition - Current condition (e.g., Like New, Good, Fair, Poor)
- Refurbishment Cost - Cost to refurbish the item
- Resale Value - Potential value after refurbishment
- Days in Process - Days since return receipt
- Disposition - Current disposition (optional)

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js - For data visualization
- jsPDF - For PDF report generation

## Educational Goals

This simulation helps students:
- Understand the complexities of reverse logistics
- Make data-driven decisions about returned products
- Analyze financial and operational trade-offs
- Develop critical thinking skills for logistics management
- Gain hands-on experience with supply chain challenges

## License

This project is created for educational purposes.
