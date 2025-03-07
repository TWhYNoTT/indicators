import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

const PavementConditionsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState(['hw']);
    const [viewType, setViewType] = useState('trend'); // 'trend', 'comparison', or 'distribution'
    const [selectedYear, setSelectedYear] = useState(null);
    const chartRef = useRef(null);

    // Colors for different condition categories
    const conditionColors = useMemo(() => ({
        'Good': '#4ade80', // Green
        'Fair': '#facc15', // Yellow
        'Poor': '#f87171'  // Red
    }), []);

    // Colors for different regions
    const regionColors = useMemo(() => ({
        'hw': '#008485',
        'ch': '#d97706',
        'pe': '#be123c',
        'che': '#1d4ed8',
        'din': '#15803d',
        'pg': '#7c3aed'
    }), []);

    // Region codes and their full names
    const regionMap = useMemo(() => ({
        'hw': 'Regional Average',
        'ch': 'Colonial Heights',
        'pe': 'Petersburg',
        'che': 'Chesterfield',
        'din': 'Dinwiddie',
        'pg': 'Prince George'
    }), []);

    // Parse the CSV data
    useEffect(() => {
        const csvData = `year,hw-Good,hw-Fair,hw-Poor,ch-Good,ch-Fair,ch-Poor,pe-Good,pe-Fair,pe-Poor,che-Good,che-Fair,che-Poor,din-Good,din-Fair,din-Poor,pg-Good,pg-Fair,pg-Poor
2010,2005.6,2043.6,1751,491.9,423.3,679.4,1513.7,1620.3,1071.6,,,,170.5,106.9,193.6,116.1,33.8,180.2
2011,1934.7,2045.8,1768.8,506.9,517.3,571,1427.8,1528.5,1197.8,,,,182.7,156.9,131.8,112.6,45,172.4
2012,1903.6,1797.3,1848.7,589.6,540.6,465,1314,1256.7,1383.7,,,,227,154.4,90,120.3,66,143.7
2013,1943.3,1857.4,1945.6,509.2,518.2,568,1434.1,1339.2,1377.6,,,,168.9,135.3,167.2,98,74.8,157.2
2014,1863.5,1580.8,2222.7,479.1,412.5,752.2,1384.4,1168.3,1470.5,,,,136.9,110.3,226.2,92.4,68.7,181.9
2015,1920.5,1562,2150.2,530,401.9,663.3,1390.5,1160.1,1486.9,,,,153,112.5,205.9,116.1,74.3,139.6
2016,1941.1,1824.7,2026.6,518,589.2,562.8,1423.1,1235.5,1463.8,,,,159.6,173.2,142.6,100.8,85,164.6
2017,1950.9,1843.3,1998.7,518,589.2,562.8,1432.9,1254.1,1435.9,365.9,403.6,322.9,159.6,173.2,142.6,100.8,85,164.6
2018,1601.6,2059.8,2129.7,473.7,528.9,672.7,1127.9,1530.9,1457,374.3,407.2,317.3,124.5,160.4,192.2,121.9,103.2,126.7
2019,1895,1924.6,1983.1,493.2,588.9,614,1401.8,1335.7,1369.1,359.3,445.1,290.2,142.3,182,152.8,117.3,95.7,154
2020,2033.1,1891.2,1995.1,606.5,560.4,588.9,1426.6,1330.8,1406.2,366.6,435.4,301,168.5,167.4,140.8,144.7,107.6,169.6
2021,2002.2,2158.4,1758,567.3,792,397.2,1434.9,1366.4,1360.8,363.2,453.9,290.6,119.8,270.4,86.9,162.5,145.4,114.1
2022,1986.9,2168.9,1738.2,559.7,823.3,373.6,1427.2,1345.6,1364.6,361.3,446.9,297.1,118.8,278.6,79.7,153.4,150.1,118.5`;

        try {
            // Parse CSV data
            const parsedData = d3.csvParse(csvData);

            // Convert values to numbers, handling empty strings
            const typedData = parsedData.map(row => {
                const newRow = { year: +row.year };

                Object.keys(row).forEach(key => {
                    if (key !== 'year') {
                        // Convert to number if not empty string
                        newRow[key] = row[key] === '' ? null : +row[key];
                    }
                });

                return newRow;
            });

            setData(typedData);
            setSelectedYear(Math.max(...typedData.map(d => d.year)));
            setLoading(false);
        } catch (err) {
            setError(`Error parsing data: ${err.message}`);
            setLoading(false);
        }
    }, []);

    // Toggle a region selection
    const toggleRegion = useCallback((region) => {
        setSelectedRegions(prev => {
            if (prev.includes(region)) {
                // Don't remove if it's the only selected region
                if (prev.length > 1) {
                    return prev.filter(r => r !== region);
                }
                return prev;
            } else {
                // Add region if not already selected (limit to 6)
                if (prev.length < 6) {
                    return [...prev, region];
                }
                return prev;
            }
        });
    }, []);

    // Change view type
    const changeViewType = useCallback((type) => {
        setViewType(type);
    }, []);

    // Change selected year for comparison view
    const changeSelectedYear = useCallback((year) => {
        setSelectedYear(+year);
    }, []);

    // Helper to get column name
    const getColumnName = useCallback((region, condition) => {
        return `${region}-${condition}`;
    }, []);

    // Format value for display
    const formatValue = useCallback((value) => {
        if (value === null || value === undefined) return 'N/A';
        return d3.format(',.1f')(value);
    }, []);

    // Calculate percentage for a region's condition
    const calculatePercentage = useCallback((yearData, region, condition) => {
        if (!yearData) return 0;

        const good = yearData[`${region}-Good`] || 0;
        const fair = yearData[`${region}-Fair`] || 0;
        const poor = yearData[`${region}-Poor`] || 0;

        const total = good + fair + poor;
        if (total === 0) return 0;

        return (yearData[`${region}-${condition}`] / total) * 100;
    }, []);

    // Render trend chart (line chart over time)
    const renderTrendChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 20, right: 120, bottom: 40, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for each condition and selected regions
        const conditions = ['Good', 'Fair', 'Poor'];
        const chartData = [];

        selectedRegions.forEach(region => {
            conditions.forEach(condition => {
                const dataPoints = data.map(d => ({
                    year: d.year,
                    value: calculatePercentage(d, region, condition),
                    region,
                    condition
                })).filter(d => d.value > 0);

                if (dataPoints.length > 0) {
                    chartData.push({
                        region,
                        condition,
                        dataPoints
                    });
                }
            });
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        // Find max percentage value with some padding
        const maxValue = d3.max(chartData, d => d3.max(d.dataPoints, p => p.value)) * 1.1;

        const yScale = d3.scaleLinear()
            .domain([0, Math.min(maxValue, 100)]) // Cap at 100% maximum
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))) // 'd' for integers
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d3.format('.0f')(d) + '%'))
            .selectAll('text')
            .style('font-size', '11px');

        // Add X axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + 30})`)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Year');

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Percentage of Pavement');

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw a line for each region and condition
        chartData.forEach(series => {
            // Create line
            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.value))
                .curve(d3.curveMonotoneX);

            // Determine stroke style based on condition
            const strokeDashArray = series.condition === 'Good' ? null :
                series.condition === 'Fair' ? '5,5' : '2,2';

            // Get color based on region and add condition-specific styling
            const baseColor = regionColors[series.region];
            const lineColor = series.condition === 'Good' ? baseColor :
                series.condition === 'Fair' ? d3.color(baseColor).darker(0.5) :
                    d3.color(baseColor).darker(1);

            // Add the line
            svg.append('path')
                .datum(series.dataPoints)
                .attr('fill', 'none')
                .attr('stroke', lineColor)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', strokeDashArray)
                .attr('d', line);

            // Add dots at each data point
            svg.selectAll(`.dot-${series.region}-${series.condition}`)
                .data(series.dataPoints)
                .enter()
                .append('circle')
                .attr('class', `dot-${series.region}-${series.condition}`)
                .attr('cx', d => xScale(d.year))
                .attr('cy', d => yScale(d.value))
                .attr('r', 3)
                .attr('fill', lineColor)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
        });

        // Create legend
        // Group by region first, then by condition
        const regionGroups = {};
        selectedRegions.forEach(region => {
            regionGroups[region] = conditions.map(condition => ({
                region,
                condition,
                color: condition === 'Good' ? regionColors[region] :
                    condition === 'Fair' ? d3.color(regionColors[region]).darker(0.5) :
                        d3.color(regionColors[region]).darker(1),
                dashArray: condition === 'Good' ? null :
                    condition === 'Fair' ? '5,5' : '2,2'
            }));
        });

        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        let legendY = 0;
        Object.entries(regionGroups).forEach(([region, conditionItems], regionIndex) => {
            // Add region label
            legend.append('text')
                .attr('x', 0)
                .attr('y', legendY)
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text(regionMap[region]);

            legendY += 20;

            // Add condition lines for this region
            conditionItems.forEach(item => {
                const g = legend.append('g')
                    .attr('transform', `translate(10, ${legendY})`);

                g.append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', 20)
                    .attr('y2', 0)
                    .attr('stroke', item.color)
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', item.dashArray);

                g.append('text')
                    .attr('x', 25)
                    .attr('y', 4)
                    .style('font-size', '11px')
                    .text(`${item.condition}`);

                legendY += 16;
            });

            legendY += 10; // Add space between region groups
        });

        // Create tooltip
        const tooltip = d3.select(chartRef.current)
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #666')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('font-size', '12px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        // Add overlay for mouse tracking
        const overlay = svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'none')
            .style('pointer-events', 'all');

        // Vertical line for hover effect
        const verticalLine = svg.append('line')
            .attr('class', 'vertical-line')
            .attr('y1', 0)
            .attr('y2', height)
            .style('stroke', '#666')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0);

        // Handle mouse events
        overlay
            .on('mouseover', () => {
                tooltip.style('opacity', 1);
                verticalLine.style('opacity', 1);
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
                verticalLine.style('opacity', 0);
            })
            .on('mousemove', function (event) {
                // Get mouse position
                const [mouseX] = d3.pointer(event);

                // Find nearest year
                const x0 = xScale.invert(mouseX);
                const bisect = d3.bisector(d => d.year).left;
                const i = bisect(data, x0, 1);

                if (i === 0 || i >= data.length) return;

                // Find closest data point
                const d0 = data[i - 1];
                const d1 = data[i];
                const d = x0 - d0.year > d1.year - x0 ? d1 : d0;

                // Update vertical line
                verticalLine
                    .attr('x1', xScale(d.year))
                    .attr('x2', xScale(d.year));

                // Build tooltip content
                let tooltipContent = `<div style="font-weight: bold; margin-bottom: 5px;">Year: ${d.year}</div>`;

                selectedRegions.forEach(region => {
                    // Only show regions that have data for this year
                    const hasData = conditions.some(condition =>
                        d[getColumnName(region, condition)] !== null &&
                        d[getColumnName(region, condition)] !== undefined);

                    if (hasData) {
                        tooltipContent += `
                            <div style="font-weight: bold; color: ${regionColors[region]}; margin-top: 8px;">
                                ${regionMap[region]}
                            </div>
                        `;

                        conditions.forEach(condition => {
                            const columnName = getColumnName(region, condition);
                            if (d[columnName] !== null && d[columnName] !== undefined) {
                                const percentage = calculatePercentage(d, region, condition);
                                tooltipContent += `
                                    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                                        <span>${condition}:</span>
                                        <span style="margin-left: 10px;">
                                            ${formatValue(d[columnName])} miles (${d3.format('.1f')(percentage)}%)
                                        </span>
                                    </div>
                                `;
                            }
                        });
                    }
                });

                // Position and show tooltip
                tooltip
                    .html(tooltipContent)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
            });

    }, [data, selectedRegions, regionColors, regionMap, calculatePercentage, getColumnName, formatValue]);

    // Render distribution chart (stacked bar chart)
    const renderDistributionChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 30, right: 80, bottom: 50, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Get data for the selected year
        const yearData = data.find(d => d.year === selectedYear);
        if (!yearData) return;

        // Prepare data for stacked bars
        const conditions = ['Good', 'Fair', 'Poor'];
        const stackData = [];

        selectedRegions.forEach(region => {
            // Check if region has data for this year
            const hasData = conditions.some(condition =>
                yearData[getColumnName(region, condition)] !== null &&
                yearData[getColumnName(region, condition)] !== undefined);

            if (hasData) {
                // Calculate total miles for this region
                const total = conditions.reduce((sum, condition) => {
                    const value = yearData[getColumnName(region, condition)];
                    return sum + (value || 0);
                }, 0);

                // Create stacked data entry
                const entry = {
                    region,
                    regionName: regionMap[region],
                    total
                };

                // Add running total for stack positioning
                let runningTotal = 0;
                conditions.forEach(condition => {
                    const value = yearData[getColumnName(region, condition)] || 0;
                    const percentage = (value / total) * 100;

                    entry[`${condition}`] = value;
                    entry[`${condition}Pct`] = percentage;
                    entry[`${condition}Start`] = runningTotal;
                    entry[`${condition}End`] = runningTotal + percentage;

                    runningTotal += percentage;
                });

                stackData.push(entry);
            }
        });

        // Sort by total miles
        stackData.sort((a, b) => b.total - a.total);

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0, 100]) // Percentage scale
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(stackData.map(d => d.region))
            .range([0, height])
            .padding(0.3);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => d + '%'));

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => regionMap[d]));

        // Add X axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + 35})`)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Percentage of Total Lane Miles');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Pavement Condition Distribution (${selectedYear})`);

        // Draw stacked bars
        stackData.forEach(d => {
            conditions.forEach(condition => {
                svg.append('rect')
                    .attr('x', xScale(d[`${condition}Start`]))
                    .attr('y', yScale(d.region))
                    .attr('width', xScale(d[`${condition}Pct`]))
                    .attr('height', yScale.bandwidth())
                    .attr('fill', conditionColors[condition])
                    .on('mouseover', function (event) {
                        // Show tooltip
                        d3.select(chartRef.current)
                            .append('div')
                            .attr('class', 'tooltip')
                            .style('position', 'absolute')
                            .style('background-color', 'white')
                            .style('border', '1px solid #666')
                            .style('border-radius', '4px')
                            .style('padding', '8px')
                            .style('font-size', '12px')
                            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
                            .style('pointer-events', 'none')
                            .style('left', `${event.pageX + 10}px`)
                            .style('top', `${event.pageY - 28}px`)
                            .html(`
                                <div><b>${d.regionName}</b></div>
                                <div style="color: ${conditionColors[condition]};">${condition} Condition</div>
                                <div>${formatValue(d[condition])} miles</div>
                                <div>${d3.format('.1f')(d[`${condition}Pct`])}% of total</div>
                                <div>Total: ${formatValue(d.total)} miles</div>
                            `);
                    })
                    .on('mouseout', function () {
                        // Remove tooltip
                        d3.select(chartRef.current).selectAll('.tooltip').remove();
                    });
            });

            // Add percentage labels for each condition
            conditions.forEach(condition => {
                // Only add label if segment is wide enough
                if (d[`${condition}Pct`] > 5) {
                    svg.append('text')
                        .attr('x', xScale(d[`${condition}Start`] + d[`${condition}Pct`] / 2))
                        .attr('y', yScale(d.region) + yScale.bandwidth() / 2 + 4)
                        .attr('text-anchor', 'middle')
                        .style('font-size', '11px')
                        .style('fill', d[`${condition}Pct`] > 15 ? 'white' : 'black')
                        .text(`${Math.round(d[`${condition}Pct`])}%`);
                }
            });
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        conditions.forEach((condition, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);

            g.append('rect')
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', conditionColors[condition]);

            g.append('text')
                .attr('x', 24)
                .attr('y', 14)
                .style('font-size', '12px')
                .text(`${condition}`);
        });

    }, [data, selectedYear, selectedRegions, regionMap, conditionColors, getColumnName, formatValue]);

    // Render comparison chart (grouped bar chart)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 30, right: 80, bottom: 60, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Get data for the selected year
        const yearData = data.find(d => d.year === selectedYear);
        if (!yearData) return;

        // Prepare data for grouped bars
        const conditions = ['Good', 'Fair', 'Poor'];
        const chartData = [];

        selectedRegions.forEach(region => {
            conditions.forEach(condition => {
                const value = yearData[getColumnName(region, condition)];
                if (value !== null && value !== undefined) {
                    chartData.push({
                        region,
                        regionName: regionMap[region],
                        condition,
                        value
                    });
                }
            });
        });

        // Group by region for easier access
        const regionData = {};
        selectedRegions.forEach(region => {
            const regionItems = chartData.filter(d => d.region === region);
            if (regionItems.length > 0) {
                regionData[region] = regionItems;
            }
        });

        // Set up scales
        const xScale = d3.scaleBand()
            .domain(Object.keys(regionData))
            .range([0, width])
            .padding(0.2);

        const conditionScale = d3.scaleBand()
            .domain(conditions)
            .range([0, xScale.bandwidth()])
            .padding(0.1);

        const maxValue = d3.max(chartData, d => d.value);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => regionMap[d]))
            .selectAll('text')
            .attr('transform', 'rotate(-15)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => formatValue(d)));

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Lane Miles');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Pavement Conditions by Region (${selectedYear})`);

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw grouped bars
        Object.entries(regionData).forEach(([region, regionItems]) => {
            svg.selectAll(`.bar-${region}`)
                .data(regionItems)
                .enter()
                .append('rect')
                .attr('class', `bar-${region}`)
                .attr('x', d => xScale(d.region) + conditionScale(d.condition))
                .attr('y', d => yScale(d.value))
                .attr('width', conditionScale.bandwidth())
                .attr('height', d => height - yScale(d.value))
                .attr('fill', d => conditionColors[d.condition])
                .on('mouseover', function (event, d) {
                    // Show tooltip
                    d3.select(chartRef.current)
                        .append('div')
                        .attr('class', 'tooltip')
                        .style('position', 'absolute')
                        .style('background-color', 'white')
                        .style('border', '1px solid #666')
                        .style('border-radius', '4px')
                        .style('padding', '8px')
                        .style('font-size', '12px')
                        .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
                        .style('pointer-events', 'none')
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY - 28}px`)
                        .html(`
                            <div><b>${d.regionName}</b></div>
                            <div style="color: ${conditionColors[d.condition]};">${d.condition} Condition</div>
                            <div>${formatValue(d.value)} miles</div>
                        `);
                })
                .on('mouseout', function () {
                    // Remove tooltip
                    d3.select(chartRef.current).selectAll('.tooltip').remove();
                });
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        conditions.forEach((condition, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);

            g.append('rect')
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', conditionColors[condition]);

            g.append('text')
                .attr('x', 24)
                .attr('y', 14)
                .style('font-size', '12px')
                .text(`${condition}`);
        });

    }, [data, selectedYear, selectedRegions, regionMap, conditionColors, getColumnName, formatValue]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else if (viewType === 'distribution') {
                renderDistributionChart();
            } else {
                renderComparisonChart();
            }
        }
    }, [data, selectedRegions, selectedYear, viewType, loading, renderTrendChart, renderDistributionChart, renderComparisonChart]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading pavement condition data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Pavement Conditions Analysis</h2>

            <div className="mb-4 flex flex-wrap gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        View Type:
                    </label>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded ${viewType === 'trend' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('trend')}
                        >
                            Trend Over Time
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${viewType === 'distribution' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('distribution')}
                        >
                            Condition Distribution
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${viewType === 'comparison' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('comparison')}
                        >
                            Regional Comparison
                        </button>
                    </div>
                </div>

                {(viewType === 'distribution' || viewType === 'comparison') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Year:
                        </label>
                        <select
                            className="w-32 p-2 border border-gray-300 rounded"
                            value={selectedYear}
                            onChange={(e) => changeSelectedYear(e.target.value)}
                        >
                            {data.map(d => (
                                <option key={d.year} value={d.year}>
                                    {d.year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Regions:
                </label>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(regionMap).map(([key, value]) => (
                        <button
                            key={key}
                            className="px-3 py-1 rounded-full"
                            style={{
                                backgroundColor: selectedRegions.includes(key)
                                    ? regionColors[key]
                                    : '#e5e7eb',
                                color: selectedRegions.includes(key) ? 'white' : '#4b5563'
                            }}
                            onClick={() => toggleRegion(key)}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About Pavement Conditions</h3>
                <p className="text-sm text-gray-600 mb-2">
                    Pavement condition is categorized into three levels based on various assessment factors:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                    <div className="bg-green-100 p-2 rounded">
                        <span className="font-medium">Good Condition:</span> Smooth road surface with minimal distress, providing comfortable driving experience.
                    </div>
                    <div className="bg-yellow-100 p-2 rounded">
                        <span className="font-medium">Fair Condition:</span> Shows some surface wear and tear, may have occasional rough patches but is still serviceable.
                    </div>
                    <div className="bg-red-100 p-2 rounded">
                        <span className="font-medium">Poor Condition:</span> Significant distress including cracking, potholes, or other deterioration that affects ride quality.
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                    Data is measured in lane miles, which accounts for both the length and width (number of lanes) of roadways.
                </p>
            </div>
        </div>
    );
};

export default PavementConditionsChart;