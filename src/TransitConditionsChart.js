import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

const TransitConditionsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedModes, setSelectedModes] = useState(['pat_bus', 'pat_van', 'pat_light_rail_veh']);
    const [viewType, setViewType] = useState('trend'); // 'trend', 'comparison', or 'breakdown'
    const [selectedYear, setSelectedYear] = useState(null);
    const [groupedView, setGroupedView] = useState(false);
    const chartRef = useRef(null);

    // Vehicle mode names map with friendly names
    const modeMap = useMemo(() => ({
        'pat_artic_bus': 'Articulated Buses',
        'pat_automobile': 'Automobiles',
        'pat_bus': 'Buses',
        'pat_comm_rail_locomotive': 'Commuter Rail Locomotives',
        'pat_comm_rail_pass_coach': 'Commuter Rail Passenger Coaches',
        'pat_comm_rail_sp_pass_car': 'Commuter Rail Special Passenger Cars',
        'pat_cutaway': 'Cutaway Vehicles',
        'pat_hr_pass_car': 'Heavy Rail Passenger Cars',
        'pat_light_rail_veh': 'Light Rail Vehicles',
        'pat_minivan': 'Minivans',
        'pat_otr_bus': 'Over-the-Road Buses',
        'pat_trolleybus': 'Trolleybuses',
        'pat_van': 'Vans',
        'pat_vintage_trolley_sc': 'Vintage Trolleys',
        'pat_all_graphed_modes': 'All Modes Combined'
    }), []);

    // Transport mode groups for simplified view
    const modeGroups = useMemo(() => ({
        'Bus Systems': ['pat_artic_bus', 'pat_bus', 'pat_cutaway', 'pat_otr_bus', 'pat_trolleybus'],
        'Rail Systems': ['pat_comm_rail_locomotive', 'pat_comm_rail_pass_coach', 'pat_comm_rail_sp_pass_car', 'pat_hr_pass_car', 'pat_light_rail_veh', 'pat_vintage_trolley_sc'],
        'Road Vehicles': ['pat_automobile', 'pat_minivan', 'pat_van']
    }), []);

    // Colors for different modes
    const colors = useMemo(() =>
        d3.scaleOrdinal()
            .domain(Object.keys(modeMap))
            .range(d3.schemeCategory10)
        , [modeMap]);

    // Group colors
    const groupColors = useMemo(() => ({
        'Bus Systems': '#1f77b4',
        'Rail Systems': '#ff7f0e',
        'Road Vehicles': '#2ca02c'
    }), []);

    // Generate the CSV data
    useEffect(() => {
        const csvData = `year,pat_artic_bus,pat_automobile,pat_bus,pat_comm_rail_locomotive,pat_comm_rail_pass_coach,pat_comm_rail_sp_pass_car,pat_cutaway,pat_hr_pass_car,pat_light_rail_veh,pat_minivan,pat_otr_bus,pat_trolleybus,pat_van,pat_vintage_trolley_sc,pat_all_graphed_modes
2019,413,231,662,53,604,1098,26,421,12,390,53,604,1766,18,0
2020,238,231,628,98,609,1383,23,482,10,390,98,609,2017,18,141
2021,133,231,364,257,368,908,22,383,14,231,257,368,1275,0,0
2022,217,231,448,254,230,1035,49,708,14,231,254,230,1486,0,0`;

        try {
            // Parse CSV data
            const parsedData = d3.csvParse(csvData);

            // Convert values to numbers
            const typedData = parsedData.map(row => {
                const newRow = { year: +row.year };

                Object.keys(row).forEach(key => {
                    if (key !== 'year') {
                        newRow[key] = +row[key];
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

    // Toggle a mode selection
    const toggleMode = useCallback((mode) => {
        setSelectedModes(prev => {
            if (prev.includes(mode)) {
                // Only remove if it's not the only selected mode
                if (prev.length > 1) {
                    return prev.filter(m => m !== mode);
                }
                return prev;
            } else {
                // Add mode if not already selected (limit to 5 for readability)
                if (prev.length < 5) {
                    return [...prev, mode];
                }
                return prev;
            }
        });
    }, []);

    // Change view type
    const changeViewType = useCallback((type) => {
        setViewType(type);
    }, []);

    // Change selected year for comparison/breakdown view
    const changeSelectedYear = useCallback((year) => {
        setSelectedYear(+year);
    }, []);

    // Toggle between detailed and grouped view
    const toggleGroupedView = useCallback(() => {
        setGroupedView(prev => !prev);
    }, []);

    // Helper to get the group for a mode
    const getModeGroup = useCallback((mode) => {
        for (const [group, modes] of Object.entries(modeGroups)) {
            if (modes.includes(mode)) {
                return group;
            }
        }
        return null;
    }, [modeGroups]);

    // Helper function to calculate group totals
    const calculateGroupTotals = useCallback((yearData) => {
        if (!yearData) return {};

        const totals = {};

        Object.entries(modeGroups).forEach(([group, modes]) => {
            totals[group] = modes.reduce((sum, mode) => {
                return sum + (yearData[mode] || 0);
            }, 0);
        });

        return totals;
    }, [modeGroups]);

    // Format value for display
    const formatValue = useCallback((value) => {
        if (value === null || value === undefined) return 'N/A';
        return d3.format(',d')(value); // Format as integer with commas
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

        // If using grouped view, calculate group totals
        let chartData = [];

        if (groupedView) {
            // For each year, calculate group totals
            const groupedData = data.map(yearData => {
                const newRow = { year: yearData.year };
                Object.entries(modeGroups).forEach(([group, modes]) => {
                    newRow[group] = modes.reduce((sum, mode) => {
                        return sum + (yearData[mode] || 0);
                    }, 0);
                });
                return newRow;
            });

            // Create series for each selected group
            Object.keys(modeGroups).forEach(group => {
                chartData.push({
                    id: group,
                    name: group,
                    values: groupedData.map(d => ({
                        year: d.year,
                        value: d[group]
                    }))
                });
            });
        } else {
            // Create series for each selected mode
            selectedModes.forEach(mode => {
                chartData.push({
                    id: mode,
                    name: modeMap[mode],
                    values: data.map(d => ({
                        year: d.year,
                        value: d[mode]
                    }))
                });
            });
        }

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        const yMax = d3.max(chartData, series =>
            d3.max(series.values, d => d.value)
        );

        const yScale = d3.scaleLinear()
            .domain([0, yMax * 1.1]) // Add 10% padding on top
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(data.length))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d3.format(',d')))
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
            .text('Number of Vehicles');

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw a line for each mode/group
        chartData.forEach(series => {
            // Create line generator
            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.value))
                .curve(d3.curveMonotoneX);

            // Get color based on mode/group
            const color = groupedView ? groupColors[series.id] : colors(series.id);

            // Add the line
            svg.append('path')
                .datum(series.values)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add dots at each data point
            svg.selectAll(`.dot-${series.id.replace(/\s+/g, '-')}`)
                .data(series.values)
                .enter()
                .append('circle')
                .attr('class', `dot-${series.id.replace(/\s+/g, '-')}`)
                .attr('cx', d => xScale(d.year))
                .attr('cy', d => yScale(d.value))
                .attr('r', 4)
                .attr('fill', color)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        chartData.forEach((series, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 10)
                .attr('x2', 20)
                .attr('y2', 10)
                .attr('stroke', groupedView ? groupColors[series.id] : colors(series.id))
                .attr('stroke-width', 2);

            g.append('text')
                .attr('x', 25)
                .attr('y', 13)
                .style('font-size', '11px')
                .text(series.name);
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

                // Find nearest year based on mouse position
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

                if (groupedView) {
                    // Add entries for each group
                    const groupTotals = calculateGroupTotals(d);
                    Object.entries(groupTotals).forEach(([group, total]) => {
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${groupColors[group]}; margin-right: 5px;"></div>
                                <span>${group}: <b>${formatValue(total)}</b> vehicles</span>
                            </div>
                        `;
                    });
                } else {
                    // Add entries for each selected mode
                    selectedModes.forEach(mode => {
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors(mode)}; margin-right: 5px;"></div>
                                <span>${modeMap[mode]}: <b>${formatValue(d[mode])}</b> vehicles</span>
                            </div>
                        `;
                    });
                }

                // Position and show tooltip
                tooltip
                    .html(tooltipContent)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
            });

    }, [data, selectedModes, groupedView, colors, groupColors, modeMap, modeGroups, calculateGroupTotals, formatValue]);

    // Render breakdown chart (pie chart)
    const renderBreakdownChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Get data for the selected year
        const yearData = data.find(d => d.year === selectedYear);
        if (!yearData) return;

        // Set up chart dimensions
        const margin = { top: 20, right: 120, bottom: 20, left: 20 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

        // Prepare data
        let pieData = [];

        if (groupedView) {
            // Calculate totals for each group
            const groupTotals = calculateGroupTotals(yearData);
            pieData = Object.entries(groupTotals)
                .filter(([, value]) => value > 0) // Only include non-zero values
                .map(([group, value]) => ({
                    name: group,
                    value: value,
                    color: groupColors[group]
                }));
        } else {
            // Use all individual modes with non-zero values
            pieData = Object.entries(yearData)
                .filter(([key, value]) => key !== 'year' && modeMap[key] && value > 0)
                .map(([key, value]) => ({
                    name: modeMap[key],
                    id: key,
                    value: value,
                    color: colors(key)
                }));
        }

        // Calculate total for percentage
        const total = d3.sum(pieData, d => d.value);

        // Set up pie layout
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // Set up arc for pie slices
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        // Set up arc for labels
        const labelArc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius * 0.6);

        // Create pie slices
        const slices = svg.selectAll('.slice')
            .data(pie(pieData))
            .enter()
            .append('g')
            .attr('class', 'slice');

        // Add colored slices
        slices.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .on('mouseover', function (event, d) {
                // Highlight slice
                d3.select(this).attr('opacity', 0.8);

                // Show tooltip
                const percentage = (d.data.value / total * 100).toFixed(1);
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
                        <div><b>${d.data.name}</b></div>
                        <div>${formatValue(d.data.value)} vehicles</div>
                        <div>${percentage}% of fleet</div>
                    `);
            })
            .on('mouseout', function () {
                // Reset slice highlight
                d3.select(this).attr('opacity', 1);

                // Remove tooltip
                d3.select(chartRef.current).selectAll('.tooltip').remove();
            });

        // Add labels for larger slices
        slices.filter(d => (d.endAngle - d.startAngle) > 0.25) // Only label larger slices
            .append('text')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('fill', 'white')
            .style('font-weight', 'bold')
            .text(d => {
                const percentage = (d.data.value / total * 100).toFixed(0);
                return `${percentage}%`;
            });

        // Add title
        svg.append('text')
            .attr('x', 0)
            .attr('y', -radius - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Transit Fleet Composition (${selectedYear})`);

        // Add a legend
        const legendRectSize = 18;
        const legendSpacing = 4;
        const legendHeight = legendRectSize + legendSpacing;

        const legend = svg.selectAll('.legend')
            .data(pieData)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => {
                const height = legendHeight;
                const offset = height * pieData.length / 2;
                const x = radius + 40;
                const y = (i * height) - offset;
                return `translate(${x},${y})`;
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', d => d.color)
            .style('stroke', d => d.color);

        legend.append('text')
            .attr('x', legendRectSize + 6)
            .attr('y', legendRectSize - 4)
            .style('font-size', '11px')
            .text(d => {
                const percentage = (d.value / total * 100).toFixed(1);
                return `${d.name} (${percentage}%)`;
            });

    }, [data, selectedYear, groupedView, colors, groupColors, modeMap, calculateGroupTotals, formatValue]);

    // Render comparison chart (bar chart)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 50, right: 120, bottom: 100, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare comparison data across years
        let chartData = [];

        if (groupedView) {
            // Prepare data for grouped view (by transport groups)
            Object.keys(modeGroups).forEach(group => {
                data.forEach(yearData => {
                    // Calculate total for this group and year
                    const groupTotal = modeGroups[group].reduce((sum, mode) => {
                        return sum + (yearData[mode] || 0);
                    }, 0);

                    chartData.push({
                        year: yearData.year,
                        group,
                        value: groupTotal
                    });
                });
            });
        } else {
            // Prepare data for selected modes
            selectedModes.forEach(mode => {
                data.forEach(yearData => {
                    chartData.push({
                        year: yearData.year,
                        mode,
                        modeName: modeMap[mode],
                        value: yearData[mode]
                    });
                });
            });
        }

        // Set up scales
        const years = data.map(d => d.year);

        const xScale = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding(0.2);

        const groupScale = d3.scaleBand()
            .domain(groupedView ? Object.keys(modeGroups) : selectedModes)
            .range([0, xScale.bandwidth()])
            .padding(0.1);

        const yMax = d3.max(chartData, d => d.value);

        const yScale = d3.scaleLinear()
            .domain([0, yMax * 1.1])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d3.format(',d')))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Number of Vehicles');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Transit Fleet Composition Over Time');

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Group bars by year
        years.forEach(year => {
            const yearItems = chartData.filter(d => d.year === year);

            // Draw bars for this year
            if (groupedView) {
                Object.keys(modeGroups).forEach((group, i) => {
                    const groupItem = yearItems.find(d => d.group === group);
                    if (groupItem && groupItem.value > 0) {
                        svg.append('rect')
                            .attr('x', xScale(year) + groupScale(group))
                            .attr('y', yScale(groupItem.value))
                            .attr('width', groupScale.bandwidth())
                            .attr('height', height - yScale(groupItem.value))
                            .attr('fill', groupColors[group])
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
                                        <div><b>${group}</b> - ${year}</div>
                                        <div>${formatValue(groupItem.value)} vehicles</div>
                                    `);
                            })
                            .on('mouseout', function () {
                                // Remove tooltip
                                d3.select(chartRef.current).selectAll('.tooltip').remove();
                            });
                    }
                });
            } else {
                selectedModes.forEach(mode => {
                    const modeItem = yearItems.find(d => d.mode === mode);
                    if (modeItem && modeItem.value > 0) {
                        svg.append('rect')
                            .attr('x', xScale(year) + groupScale(mode))
                            .attr('y', yScale(modeItem.value))
                            .attr('width', groupScale.bandwidth())
                            .attr('height', height - yScale(modeItem.value))
                            .attr('fill', colors(mode))
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
                                        <div><b>${modeMap[mode]}</b> - ${year}</div>
                                        <div>${formatValue(modeItem.value)} vehicles</div>
                                    `);
                            })
                            .on('mouseout', function () {
                                // Remove tooltip
                                d3.select(chartRef.current).selectAll('.tooltip').remove();
                            });
                    }
                });
            }
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        if (groupedView) {
            Object.entries(groupColors).forEach(([group, color], i) => {
                const g = legend.append('g')
                    .attr('transform', `translate(0, ${i * 20})`);

                g.append('rect')
                    .attr('width', 18)
                    .attr('height', 18)
                    .attr('fill', color);

                g.append('text')
                    .attr('x', 24)
                    .attr('y', 14)
                    .style('font-size', '11px')
                    .text(group);
            });
        } else {
            selectedModes.forEach((mode, i) => {
                const g = legend.append('g')
                    .attr('transform', `translate(0, ${i * 20})`);

                g.append('rect')
                    .attr('width', 18)
                    .attr('height', 18)
                    .attr('fill', colors(mode));

                g.append('text')
                    .attr('x', 24)
                    .attr('y', 14)
                    .style('font-size', '11px')
                    .text(modeMap[mode]);
            });
        }

    }, [data, selectedModes, groupedView, colors, groupColors, modeMap, modeGroups, formatValue]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else if (viewType === 'breakdown') {
                renderBreakdownChart();
            } else {
                renderComparisonChart();
            }
        }
    }, [data, selectedModes, selectedYear, viewType, groupedView, loading, renderTrendChart, renderBreakdownChart, renderComparisonChart]);

    // Get all available modes (excluding the "all" column)
    const getAllModes = useCallback(() => {
        const modes = Object.keys(modeMap).filter(key => key !== 'pat_all_graphed_modes');
        return modes;
    }, [modeMap]);

    // Get modes for a specific group
    const getModesForGroup = useCallback((group) => {
        return modeGroups[group] || [];
    }, [modeGroups]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading transit condition data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Transit Fleet Composition</h2>

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
                            className={`px-4 py-2 rounded ${viewType === 'breakdown' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('breakdown')}
                        >
                            Breakdown (Pie Chart)
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${viewType === 'comparison' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('comparison')}
                        >
                            Year Comparison
                        </button>
                    </div>
                </div>

                {viewType === 'breakdown' && (
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        View Mode:
                    </label>
                    <button
                        className={`px-4 py-2 rounded ${groupedView ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={toggleGroupedView}
                    >
                        {groupedView ? 'Grouped by Category' : 'Detailed View'}
                    </button>
                </div>
            </div>

            {!groupedView && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Transit Types:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {getAllModes().map(mode => (
                            <button
                                key={mode}
                                className={`px-3 py-1 text-xs rounded-full ${selectedModes.includes(mode)
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor: selectedModes.includes(mode)
                                        ? colors(mode)
                                        : undefined
                                }}
                                onClick={() => toggleMode(mode)}
                            >
                                {modeMap[mode]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {groupedView && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transit Categories:
                    </label>
                    <div className="flex flex-wrap gap-4 mb-2">
                        {Object.entries(modeGroups).map(([group,]) => (
                            <div
                                key={group}
                                className="flex items-center"
                            >
                                <div
                                    className="w-4 h-4 mr-2"
                                    style={{ backgroundColor: groupColors[group] }}
                                ></div>
                                <span>{group}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-600">
                        * Click the "Detailed View" button above to select specific transit types
                    </div>
                </div>
            )}

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About Transit Fleet Data</h3>
                <p className="text-sm text-gray-600 mb-2">
                    This visualization shows the composition of the transit fleet from 2019 to 2022, categorized by vehicle type.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                    <div className="bg-blue-50 p-2 rounded">
                        <span className="font-medium">Bus Systems:</span> Includes articulated buses, standard buses, cutaway vehicles, over-the-road buses, and trolleybuses.
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                        <span className="font-medium">Rail Systems:</span> Includes commuter rail locomotives, passenger coaches, heavy rail cars, light rail vehicles, and vintage trolleys.
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                        <span className="font-medium">Road Vehicles:</span> Includes automobiles, minivans, and vans used in transit operations.
                    </div>
                </div>

                {selectedYear === 2020 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                        <span className="font-medium">COVID-19 Impact:</span> The 2020 data reflects changes in transit fleet composition during the pandemic, which affected vehicle acquisition and retirement plans.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransitConditionsChart;