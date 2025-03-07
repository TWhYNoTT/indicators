import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

const TransportationSafetyChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState(['hw']);
    const [metricType, setMetricType] = useState('totKill'); // 'totKill', 'totKillperCap', 'totKillperVMT'
    const [viewType, setViewType] = useState('trend'); // 'trend', 'comparison', 'heatmap'
    const [selectedYear, setSelectedYear] = useState(null);
    const chartRef = useRef(null);

    // Region codes and their full names
    const regionMap = useMemo(() => ({
        'hw': 'Regional Average',
        'ch': 'Colonial Heights',
        'pe': 'Petersburg',
        'che': 'Chesterfield',
        'din': 'Dinwiddie',
        'pg': 'Prince George'
    }), []);

    // Metric types with labels and descriptions
    const metricMap = useMemo(() => ({
        'totKill': {
            label: 'Total Fatalities',
            description: 'Total number of transportation-related fatalities'
        },
        'totKillperCap': {
            label: 'Fatalities per 100,000 Population',
            description: 'Transportation fatalities normalized by population'
        },
        'totKillperVMT': {
            label: 'Fatalities per 100M Vehicle Miles Traveled',
            description: 'Transportation fatalities normalized by vehicle miles traveled'
        }
    }), []);

    // Colors for different regions
    const colors = useMemo(() => ({
        'hw': '#1f77b4', // Blue
        'ch': '#ff7f0e', // Orange
        'pe': '#2ca02c', // Green
        'che': '#d62728', // Red
        'din': '#9467bd', // Purple
        'pg': '#8c564b'  // Brown
    }), []);

    // Generate the CSV data
    useEffect(() => {
        const csvData = `Year,hwtotKill,hwtotKillperCap,hwtotKillperVMT,chtotKill,chtotKillperCap,chtotKillperVMT,petotKill,petotKillperCap,petotKillperVMT,chetotKill,chetotKillperCap,chetotKillperVMT,dintotKill,dintotKillperCap,dintotKillperVMT,pgtotKill,pgtotKillperCap,pgtotKillperVMT
2006,374,133,178,58,39,38,50,22,27,29,48,63,1253,396,582,164,112,110
2007,385,136,164,50,41,32,48,20,40,23,46,85,1149,369,559,163,95,109
2008,299,103,139,44,30,32,37,18,26,15,40,57,1035,332,541,149,97,93
2009,287,101,125,49,41,29,29,14,17,14,33,61,975,334,428,114,91,87
2010,263,91,113,36,32,29,31,16,14,16,30,59,955,329,452,120,94,95
2011,295,107,133,51,40,31,33,16,23,13,33,55,922,297,443,127,94,84
2012,293,91,133,54,40,17,29,18,22,12,32,69,915,274,433,133,96,84
2013,269,98,119,37,31,21,27,24,19,27,31,52,829,240,423,111,78,76
2014,253,86,111,33,23,24,27,18,23,16,33,56,708,200,319,73,48,54
2015,288,105,122,46,38,31,31,19,18,18,26,61,788,214,389,117,67,66
2016,261,94,113,44,38,26,20,22,19,11,27,54,1013,200,602,174,55,59
2017,299,123,121,35,38,32,33,18,36,17,35,55,1015,249,588,165,55,98
2018,299,117,125,40,31,37,41,13,33,16,31,57,1037,223,642,174,52,85
2019,255,92,103,35,25,25,24,20,30,12,24,60,1367,421,639,201,105,124
2020,334,98,124,43,31,25,28,26,26,16,27,112,1457,466,646,147,105,146
2021,321,122,118,37,25,33,31,20,38,26,30,81,1539,531,659,163,144,159
2022,320,118,126,44,44,28,26,17,32,14,39,76,1522,587,664,199,206,155
2023,292,101,123,43,29,25,28,18,28,19,34,68,1169,216,629,175,76,44`;

        try {
            // Parse CSV data
            const parsedData = d3.csvParse(csvData);

            // Convert values to numbers
            const typedData = parsedData.map(row => {
                const newRow = { Year: +row.Year };

                Object.keys(row).forEach(key => {
                    if (key !== 'Year') {
                        newRow[key] = +row[key];
                    }
                });

                return newRow;
            });

            setData(typedData);
            setSelectedYear(Math.max(...typedData.map(d => d.Year)));
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
                // Only remove if it's not the only selected region
                if (prev.length > 1) {
                    return prev.filter(r => r !== region);
                }
                return prev;
            } else {
                // Add region if not already selected (limit to 6 for readability)
                if (prev.length < 6) {
                    return [...prev, region];
                }
                return prev;
            }
        });
    }, []);

    // Change metric type
    const changeMetricType = useCallback((type) => {
        setMetricType(type);
    }, []);

    // Change view type
    const changeViewType = useCallback((type) => {
        setViewType(type);
    }, []);

    // Change selected year for comparison/heatmap view
    const changeSelectedYear = useCallback((year) => {
        setSelectedYear(+year);
    }, []);

    // Get column name based on region and metric type
    const getColumnName = useCallback((region) => {
        return `${region}${metricType}`;
    }, [metricType]);

    // Format value for display
    const formatValue = useCallback((value, metric) => {
        if (value === null || value === undefined) return 'N/A';

        if (metric === 'totKill') {
            return d3.format(',d')(value); // Format as integer with commas
        } else {
            return d3.format(',.1f')(value); // Format with 1 decimal place
        }
    }, []);

    // Determine severity level based on metric type and value
    const getSeverityLevel = useCallback((value, metric, region) => {
        // Different thresholds for different metrics and potentially regions
        if (metric === 'totKill') {
            if (region === 'din') { // Dinwiddie has much higher numbers
                if (value > 1300) return 'Very High';
                if (value > 1000) return 'High';
                if (value > 800) return 'Moderate';
                return 'Low';
            } else {
                if (value > 300) return 'Very High';
                if (value > 200) return 'High';
                if (value > 100) return 'Moderate';
                if (value > 50) return 'Concerning';
                return 'Low';
            }
        } else if (metric === 'totKillperCap') {
            if (value > 400) return 'Very High';
            if (value > 200) return 'High';
            if (value > 100) return 'Moderate';
            if (value > 50) return 'Concerning';
            return 'Low';
        } else if (metric === 'totKillperVMT') {
            if (value > 500) return 'Very High';
            if (value > 300) return 'High';
            if (value > 100) return 'Moderate';
            if (value > 50) return 'Concerning';
            return 'Low';
        }
        return 'Unknown';
    }, []);

    // Get color for severity level
    const getSeverityColor = useCallback((level) => {
        switch (level) {
            case 'Very High': return '#7f0000'; // Dark red
            case 'High': return '#b71c1c'; // Red
            case 'Moderate': return '#f57c00'; // Orange
            case 'Concerning': return '#fbc02d'; // Amber
            case 'Low': return '#388e3c'; // Green
            default: return '#757575'; // Grey
        }
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

        // Prepare data for selected regions
        const chartData = data.map(d => {
            const entry = { Year: d.Year };
            selectedRegions.forEach(region => {
                const colName = getColumnName(region);
                entry[region] = d[colName];
            });
            return entry;
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.Year))
            .range([0, width]);

        // Find max value with some padding
        let maxValue;
        if (metricType === 'totKill' && selectedRegions.includes('din')) {
            // Special handling for Dinwiddie which has much higher values
            maxValue = d3.max(chartData, d => {
                const values = selectedRegions.map(region => d[region] || 0);
                return d3.max(values);
            }) * 1.1;
        } else {
            // For other metrics or without Dinwiddie, use normal scaling
            maxValue = d3.max(chartData, d => {
                const values = selectedRegions
                    .filter(r => r !== 'din')
                    .map(region => d[region] || 0);
                return d3.max(values) * 1.1;
            });

            // If Dinwiddie is included, we'll use a second y-axis
            if (selectedRegions.includes('din')) {
                maxValue = maxValue || 400; // Fallback if no other regions selected
            }
        }

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([height, 0]);

        // Second y-axis for Dinwiddie if needed
        let y2Scale;
        if (metricType === 'totKill' && selectedRegions.includes('din') && selectedRegions.length > 1) {
            const dinMax = d3.max(chartData, d => d.din || 0) * 1.1;
            y2Scale = d3.scaleLinear()
                .domain([0, dinMax])
                .range([height, 0]);
        }

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(Math.min(data.length, 10)))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                if (metricType === 'totKill') {
                    return d3.format(',d')(d);
                } else {
                    return d3.format(',.1f')(d);
                }
            }))
            .selectAll('text')
            .style('font-size', '11px');

        // Add second Y axis for Dinwiddie if needed
        if (y2Scale) {
            svg.append('g')
                .attr('transform', `translate(${width},0)`)
                .call(d3.axisRight(y2Scale).tickFormat(d => d3.format(',d')(d)))
                .selectAll('text')
                .style('font-size', '11px')
                .style('fill', colors.din);

            // Add secondary y-axis label
            svg.append('text')
                .attr('transform', 'rotate(90)')
                .attr('y', -width - 45)
                .attr('x', height / 2)
                .style('text-anchor', 'middle')
                .style('fill', colors.din)
                .style('font-size', '10px')
                .text(`Dinwiddie ${metricMap[metricType].label}`);
        }

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
            .text(metricMap[metricType].label);

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw a line for each selected region
        selectedRegions.forEach(region => {
            // Skip if region doesn't have data
            if (!chartData.some(d => d[region] !== undefined && d[region] !== null)) return;

            // Use primary or secondary scale - FIXED: No useScale hook call here
            const selectedScale = (region === 'din' && y2Scale) ? y2Scale : yScale;

            // Create line
            const line = d3.line()
                .x(d => xScale(d.Year))
                .y(d => useScale(d[region]))
                .defined(d => d[region] !== null && d[region] !== undefined)
                .curve(d3.curveMonotoneX);

            // Filter out null values
            const validData = chartData.filter(d => d[region] !== null && d[region] !== undefined);

            // Add the line
            svg.append('path')
                .datum(validData)
                .attr('fill', 'none')
                .attr('stroke', colors[region])
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add dots at each data point
            svg.selectAll(`.dot-${region}`)
                .data(validData)
                .enter()
                .append('circle')
                .attr('class', `dot-${region}`)
                .attr('cx', d => xScale(d.Year))
                .attr('cy', d => selectedScale(d[region]))
                .attr('r', 4)
                .attr('fill', colors[region])
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5);
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        selectedRegions.forEach((region, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 10)
                .attr('x2', 20)
                .attr('y2', 10)
                .attr('stroke', colors[region])
                .attr('stroke-width', 2);

            g.append('text')
                .attr('x', 25)
                .attr('y', 13)
                .style('font-size', '11px')
                .text(regionMap[region]);
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
                const bisect = d3.bisector(d => d.Year).left;
                const i = bisect(chartData, x0, 1);

                if (i === 0 || i >= chartData.length) return;

                // Find closest data point
                const d0 = chartData[i - 1];
                const d1 = chartData[i];
                const d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;

                // Update vertical line
                verticalLine
                    .attr('x1', xScale(d.Year))
                    .attr('x2', xScale(d.Year));

                // Build tooltip content
                let tooltipContent = `<div style="font-weight: bold; margin-bottom: 5px;">Year: ${d.Year}</div>`;

                selectedRegions.forEach(region => {
                    if (d[region] !== null && d[region] !== undefined) {
                        const level = getSeverityLevel(d[region], metricType, region);
                        const color = getSeverityColor(level);

                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[region]}; margin-right: 5px;"></div>
                                <span>${regionMap[region]}: <b>${formatValue(d[region], metricType)}</b> <span style="color: ${color}">(${level})</span></span>
                            </div>
                        `;
                    }
                });

                // Position and show tooltip
                tooltip
                    .html(tooltipContent)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
            });

    }, [data, selectedRegions, metricType, getColumnName, colors, regionMap, metricMap, formatValue, getSeverityLevel, getSeverityColor]);

    // Render comparison chart (bar chart)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Get data for the selected year
        const yearData = data.find(d => d.Year === selectedYear);
        if (!yearData) return;

        // Set up chart dimensions
        const margin = { top: 30, right: 120, bottom: 80, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for comparison
        const regions = Object.keys(regionMap);

        // Check if Dinwiddie should be included or handled separately
        let includeDinwiddie = true;
        if (metricType === 'totKill' && regions.includes('din')) {
            const dinValue = yearData[getColumnName('din')];
            const otherMax = d3.max(regions.filter(r => r !== 'din').map(r => yearData[getColumnName(r)] || 0));
            // If Dinwiddie's value is more than 3x the next highest, exclude it for better scaling
            if (dinValue > otherMax * 3) {
                includeDinwiddie = false;
            }
        }

        const chartData = regions
            .filter(region => includeDinwiddie || region !== 'din')
            .map(region => ({
                region,
                name: regionMap[region],
                value: yearData[getColumnName(region)]
            }))
            .filter(d => d.value !== null && d.value !== undefined)
            .sort((a, b) => b.value - a.value); // Sort by value descending

        // Add separate note for Dinwiddie if excluded
        if (!includeDinwiddie) {
            const dinValue = yearData[getColumnName('din')];
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', colors.din)
                .text(`Note: Dinwiddie (${formatValue(dinValue, metricType)}) is excluded from chart for better scaling`);
        }

        // Set up scales
        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.region))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value) * 1.1])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => regionMap[d]))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                if (metricType === 'totKill') {
                    return d3.format(',d')(d);
                } else {
                    return d3.format(',.1f')(d);
                }
            }))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -45)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text(metricMap[metricType].label);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 70)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Transportation Safety by Region (${selectedYear})`);

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw bars
        svg.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.region))
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.value))
            .attr('fill', d => {
                const level = getSeverityLevel(d.value, metricType, d.region);
                return getSeverityColor(level);
            })
            .on('mouseover', function (event, d) {
                // Highlight bar
                d3.select(this).attr('opacity', 0.8);

                // Show tooltip
                const level = getSeverityLevel(d.value, metricType, d.region);
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
                        <div><b>${d.name}</b></div>
                        <div>${metricMap[metricType].label}: ${formatValue(d.value, metricType)}</div>
                        <div>Safety Level: <span style="color: ${getSeverityColor(level)}">${level}</span></div>
                    `);
            })
            .on('mouseout', function () {
                // Reset bar highlight
                d3.select(this).attr('opacity', 1);

                // Remove tooltip
                d3.select(chartRef.current).selectAll('.tooltip').remove();
            });

        // Add value labels on top of bars
        svg.selectAll('.label')
            .data(chartData)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => xScale(d.region) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(d => formatValue(d.value, metricType));

        // Add a legend for severity levels
        const legendData = ['Very High', 'High', 'Moderate', 'Concerning', 'Low'];
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        legendData.forEach((level, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', getSeverityColor(level));

            g.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-size', '11px')
                .text(level);
        });

    }, [data, selectedYear, metricType, getColumnName, colors, regionMap, metricMap, formatValue, getSeverityLevel, getSeverityColor]);

    // Render heatmap chart
    const renderHeatmapChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 30, right: 50, bottom: 80, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const cellSize = Math.min(Math.floor(width / data.length), 25);
        const cellPadding = 2;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for heatmap
        const regions = Object.keys(regionMap);
        const years = data.map(d => d.Year);

        // Create scales
        const xScale = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(regions)
            .range([0, height])
            .padding(0.1);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => d))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style('font-size', '10px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => regionMap[d]))
            .selectAll('text')
            .style('font-size', '11px');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 70)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Transportation Safety Trends (${metricMap[metricType].label})`);

        // Create color scale for severity
        const colorScale = d3.scaleOrdinal()
            .domain(['Low', 'Concerning', 'Moderate', 'High', 'Very High'])
            .range([
                getSeverityColor('Low'),
                getSeverityColor('Concerning'),
                getSeverityColor('Moderate'),
                getSeverityColor('High'),
                getSeverityColor('Very High')
            ]);

        // Draw cells
        regions.forEach(region => {
            years.forEach(year => {
                const yearData = data.find(d => d.Year === year);
                if (!yearData) return;

                const value = yearData[getColumnName(region)];
                if (value === null || value === undefined) return;

                const level = getSeverityLevel(value, metricType, region);

                svg.append('rect')
                    .attr('x', xScale(year))
                    .attr('y', yScale(region))
                    .attr('width', xScale.bandwidth())
                    .attr('height', yScale.bandwidth())
                    .attr('fill', colorScale(level))
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
                                <div><b>${regionMap[region]}, ${year}</b></div>
                                <div>${metricMap[metricType].label}: ${formatValue(value, metricType)}</div>
                                <div>Safety Level: <span style="color: ${colorScale(level)}">${level}</span></div>
                            `);
                    })
                    .on('mouseout', function () {
                        // Remove tooltip
                        d3.select(chartRef.current).selectAll('.tooltip').remove();
                    });

                // Add text for values in larger cells
                if (xScale.bandwidth() > 28 && yScale.bandwidth() > 20) {
                    svg.append('text')
                        .attr('x', xScale(year) + xScale.bandwidth() / 2)
                        .attr('y', yScale(region) + yScale.bandwidth() / 2 + 4)
                        .attr('text-anchor', 'middle')
                        .style('font-size', '9px')
                        .style('fill', level === 'Low' || level === 'Concerning' ? '#000' : '#fff')
                        .text(formatValue(value, metricType));
                }
            });
        });

        // Add a legend for severity levels
        const legendData = ['Very High', 'High', 'Moderate', 'Concerning', 'Low'];
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        legendData.forEach((level, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', colorScale(level));

            g.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-size', '11px')
                .text(level);
        });

    }, [data, metricType, getColumnName, regionMap, metricMap, formatValue, getSeverityLevel, getSeverityColor]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else if (viewType === 'comparison') {
                renderComparisonChart();
            } else if (viewType === 'heatmap') {
                renderHeatmapChart();
            }
        }
    }, [data, selectedRegions, metricType, viewType, selectedYear, loading, renderTrendChart, renderComparisonChart, renderHeatmapChart]);

    // Get all available regions
    const getAvailableRegions = useCallback(() => {
        return Object.keys(regionMap);
    }, [regionMap]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading transportation safety data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Transportation Safety Analysis</h2>

            <div className="mb-4 flex flex-wrap gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visualization Type:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 rounded ${viewType === 'trend' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('trend')}
                        >
                            Trend Lines
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${viewType === 'comparison' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('comparison')}
                        >
                            Regional Comparison
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${viewType === 'heatmap' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('heatmap')}
                        >
                            Heatmap View
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Metric Type:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'totKill' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('totKill')}
                        >
                            Total Fatalities
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'totKillperCap' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('totKillperCap')}
                        >
                            Per Capita
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'totKillperVMT' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('totKillperVMT')}
                        >
                            Per VMT
                        </button>
                    </div>
                </div>

                {viewType === 'comparison' && (
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
                                <option key={d.Year} value={d.Year}>
                                    {d.Year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {viewType === 'trend' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Regions:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {getAvailableRegions().map(region => (
                            <button
                                key={region}
                                className={`px-3 py-1 rounded-full ${selectedRegions.includes(region)
                                    ? 'text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor: selectedRegions.includes(region)
                                        ? colors[region]
                                        : undefined
                                }}
                                onClick={() => toggleRegion(region)}
                            >
                                {regionMap[region]}
                            </button>
                        ))}
                    </div>
                    {metricType === 'totKill' && selectedRegions.includes('din') && selectedRegions.length > 1 && (
                        <div className="mt-2 text-xs text-gray-600">
                            <span className="font-medium">Note:</span> Dinwiddie values are shown on a secondary axis due to their higher magnitude.
                        </div>
                    )}
                </div>
            )}

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About Transportation Safety Metrics</h3>
                <p className="text-sm text-gray-600 mb-2">
                    This dashboard visualizes transportation safety data from {d3.min(data, d => d.Year)} to {d3.max(data, d => d.Year)} using three key metrics:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                    <div className="p-2 rounded">
                        <span className="font-medium">Total Fatalities:</span> Raw count of transportation-related deaths
                    </div>
                    <div className="p-2 rounded">
                        <span className="font-medium">Per Capita:</span> Fatalities per 100,000 population (normalizes for population size)
                    </div>
                    <div className="p-2 rounded">
                        <span className="font-medium">Per VMT:</span> Fatalities per 100 million vehicle miles traveled (normalizes for driving exposure)
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-3">
                    <div className="p-2 rounded" style={{ backgroundColor: getSeverityColor('Low') + '30' }}>
                        <span className="font-medium">Low:</span> Relatively safe
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: getSeverityColor('Concerning') + '30' }}>
                        <span className="font-medium">Concerning:</span> Above average risk
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: getSeverityColor('Moderate') + '30' }}>
                        <span className="font-medium">Moderate:</span> Significantly elevated risk
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: getSeverityColor('High') + '30' }}>
                        <span className="font-medium">High:</span> High risk area
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: getSeverityColor('Very High') + '30' }}>
                        <span className="font-medium">Very High:</span> Critical safety concern
                    </div>
                </div>

                <div className="mt-3 p-2 bg-yellow-50 rounded">
                    <span className="font-medium">Analysis Note:</span> Dinwiddie consistently shows higher fatality numbers, which may be influenced by
                    including segments of major highways, long rural roads, or differences in data collection methodologies.
                </div>
            </div>
        </div>
    );
};

export default TransportationSafetyChart;