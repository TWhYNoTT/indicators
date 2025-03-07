import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

const TransitRidershipChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedModes, setSelectedModes] = useState(['bus', 'light_rail', 'subway']);
    const [metricType, setMetricType] = useState('absolute'); // 'absolute', 'per_capita', 'per_vrh', 'per_vrm'
    const [viewType, setViewType] = useState('trend'); // 'trend', 'comparison', 'stacked', 'composition'
    const [selectedYear, setSelectedYear] = useState(null);
    const [showTotal, setShowTotal] = useState(false);
    const chartRef = useRef(null);

    // Mode names with friendly labels
    const modeMap = useMemo(() => ({
        'bus': 'Bus',
        'commuter_rail': 'Commuter Rail',
        'light_rail': 'Light Rail',
        'nonscheduled_services': 'Non-scheduled Services',
        'subway': 'Subway',
        'trolleybus': 'Trolleybus',
        'all': 'All Transit Modes'
    }), []);

    // Metric types with labels and suffixes
    const metricMap = useMemo(() => ({
        'absolute': {
            label: 'Absolute Ridership (thousands)',
            suffix: 'k trips',
            description: 'Total passenger trips in thousands'
        },
        'per_capita': {
            label: 'Trips per Capita',
            suffix: 'trips per capita',
            description: 'Annual passenger trips per resident'
        },
        'per_vrh': {
            label: 'Passengers per Vehicle Revenue Hour',
            suffix: 'per VRH',
            description: 'Passengers carried per hour that vehicles are in service'
        },
        'per_vrm': {
            label: 'Passengers per Vehicle Revenue Mile',
            suffix: 'per VRM',
            description: 'Passengers carried per mile that vehicles are in service'
        }
    }), []);

    // Colors for different modes
    const colors = useMemo(() => ({
        'bus': '#4682B4', // Steel Blue
        'commuter_rail': '#FF8C00', // Dark Orange
        'light_rail': '#3CB371', // Medium Sea Green
        'nonscheduled_services': '#9370DB', // Medium Purple
        'subway': '#CD5C5C', // Indian Red
        'trolleybus': '#20B2AA', // Light Sea Green
        'all': '#808080' // Gray
    }), []);

    // Parse the CSV data
    useEffect(() => {
        const csvData = `year,bus,commuter_rail,light_rail,nonscheduled_services,subway,trolleybus,all,busper_capita,commuter_railper_capita,light_railper_capita,nonscheduled_servicesper_capita,subwayper_capita,trolleybusper_capita,allper_capita,busper_vrh,commuter_railper_vrh,light_railper_vrh,nonscheduled_servicesper_vrh,subwayper_vrh,trolleybusper_vrh,allper_vrh,busper_vrm,commuter_railper_vrm,light_railper_vrm,nonscheduled_servicesper_vrm,subwayper_vrm,trolleybusper_vrm,allper_vrm
1997,178214.5,27626.7,25002.7,1903.2,96904.2,8846,338497.4,,,,,,,,53.05,50.18,98.02,1.96,111.41,87.28,55.43,4.12,1.79,8.1,0.23,4.93,7.85,3.72
1998,155291.4,30656.8,20221.7,1466.9,91971.5,7523,307131.3,,,,,,,,40.82,53.36,87.01,2.31,106.57,89.29,49.6,3.69,1.9,7.32,0.18,5,8.22,3.47
1999,184635.2,32032.3,22522.3,1170.3,93775.9,8646,342782.1,,,,,,,,45.21,55.47,80.07,2.17,94.4,76.21,52.03,4.13,1.98,7.9,0.19,4.75,9.46,3.79
2000,182966.8,32490.6,24994.3,1027.3,100132.9,10730.6,352342.5,33.94,6.03,4.64,0.19,18.57,1.99,65.36,42.79,55.51,81.99,1.74,97.95,78.02,50.95,3.9,1.97,8.1,0.16,4.92,9.68,3.73
2001,186534.2,33571.1,24837.9,1086.3,97382.5,9719.4,353131.4,34.43,6.2,4.59,0.2,17.98,1.79,65.19,43.9,55.9,78.05,1.94,96.09,77.05,51.43,3.98,1.99,8.1,0.16,4.86,9.51,3.72
2002,188836.9,33558.8,22749.9,1692.1,93996.2,7119.9,347953.7,34.67,6.16,4.18,0.31,17.26,1.31,63.88,42.93,53.81,73.32,1.75,94.39,76.85,47.1,3.86,1.92,7.51,0.16,4.74,9.52,3.46
2003,197647.2,32770,24850.2,1815.1,94387.7,2343.2,353813.5,36.08,5.98,4.54,0.33,17.23,0.43,64.6,43.63,50.97,75.15,1.79,95.85,80.72,46.98,3.95,1.86,7.95,0.17,4.58,12.46,3.46
2004,209190.4,33209.1,25158.1,1932.8,97233.2,,366723.7,37.99,6.03,4.57,0.35,17.66,,66.6,46.19,50.44,71.63,1.8,99.46,,48.32,4.17,1.84,7.58,0.17,4.76,,3.55
2005,210795.4,34766.9,25206.4,1961.3,97408.5,,370138.4,38.14,6.29,4.56,0.35,17.62,,66.96,46.62,52.53,71.73,1.87,102.01,,49.09,4.22,1.92,7.59,0.17,4.87,,3.61
2006,200838.7,37356.1,25445.5,2091.6,93993.3,,359725.2,36.17,6.73,4.58,0.38,16.93,,64.79,43.85,55.46,67.27,1.94,100.47,,47.07,4.04,2.04,7.16,0.18,4.8,,3.5
2007,194742.6,36909.9,27635.7,2083.7,97867.9,,359239.8,34.9,6.62,4.95,0.37,17.54,,64.39,42.31,53.95,67.88,1.93,102.4,,46.48,3.84,1.98,7.4,0.18,4.9,,3.43
2008,207962.9,37623.8,29497.1,2157.5,102403.1,353,379997.3,37.1,6.71,5.26,0.38,18.27,0.06,67.79,44.82,54.05,72.89,1.94,104.84,49.7,48.49,4.08,1.99,7.73,0.18,5.02,5.92,3.58
2009,205610.7,39206.4,29588,2769.4,105132.2,5510.8,387817.5,36.51,6.96,5.25,0.49,18.67,0.98,68.87,43.62,54.63,76.01,2.16,104.13,50.49,47.16,3.97,2.02,8.04,0.19,4.93,6.02,3.47
2010,201858,40301.1,29445.8,2099.5,105338.2,5510.4,384553,35.84,7.15,5.23,0.37,18.7,0.98,68.27,43.83,55.42,77.95,1.87,104.77,53.57,48.43,3.97,2.01,8.35,0.17,4.96,6.26,3.53
2011,205701.4,41206.2,30883.8,2379.1,111538.7,6584.4,398293.8,36.38,7.29,5.46,0.42,19.73,1.16,70.44,44.2,55.94,75.6,2.03,108.42,60.62,49.13,4.05,2.03,7.2,0.18,5.2,7.08,3.59
2012,212712.2,40357.6,28474.1,2115.9,113409.1,6951.6,404020.4,37.49,7.11,5.02,0.37,19.99,1.23,71.22,44.86,53.33,71.97,1.83,111.99,65.23,49.47,4.14,1.93,6.73,0.16,5.31,7.61,3.61
2013,213804.3,41057.3,30289.7,2063.8,111578.2,6228.4,405021.7,37.61,7.22,5.33,0.36,19.63,1.1,71.25,43.88,52.54,69.89,1.73,110.53,60.53,48.27,3.99,1.9,6.57,0.14,5.25,7.04,3.48
2014,206051.6,41818.4,27328.1,2262.7,109296.1,6562.6,393319.5,36.16,7.34,4.8,0.4,19.18,1.15,69.03,41.5,43.54,60.38,1.81,108.54,59.14,44.95,3.8,1.89,5.79,0.15,5.18,6.96,3.32
2015,199861.8,41836,28902.7,2351.8,110917.2,6696,390565.5,35.03,7.33,5.07,0.41,19.44,1.17,68.46,40.66,43.65,64.08,1.8,108.76,61.05,44.57,3.73,1.88,6.11,0.15,5.17,7.18,3.29
2016,210281.4,40404.2,28513.4,2311.5,112537.2,6500.3,400548,36.8,7.07,4.99,0.4,19.7,1.14,70.1,42.66,40.31,64.85,1.72,104.65,63.03,45.04,3.93,1.82,6.19,0.15,5.18,7.42,3.37
2017,190019.6,37257,29262.4,2236.6,104718.9,6171,369665.6,33.19,6.51,5.11,0.39,18.29,1.08,64.57,38.54,37.13,69.33,1.69,100.01,63.91,41.89,3.58,1.67,6.55,0.14,4.94,7.62,3.14
2018,187405,36278.3,27700.3,2098.8,104794.5,5085,363361.8,32.67,6.32,4.83,0.37,18.27,0.89,63.34,37.46,32.51,68.85,1.63,97.51,57.58,40.52,3.48,1.57,6.36,0.14,4.86,6.85,3.06
2019,178612.7,39230.2,25561.8,2042.4,101861.7,4495.9,351804.6,31.09,6.83,4.45,0.36,17.73,0.78,61.23,35.35,36.27,61.1,1.56,93.24,64.29,38.98,3.29,1.69,5.77,0.14,4.63,6.99,2.94
2020,137833.4,28615.2,22886.2,1604.7,75014.2,4647.1,270600.7,23.41,4.86,3.89,0.27,12.74,0.79,45.95,29.57,30.74,59.85,1.52,69.13,63.86,33.04,2.75,1.47,5.56,0.13,3.65,7.6,2.53
2021,72712.4,7893.3,8928.9,863.9,32325.9,2026.4,124750.8,12.34,1.34,1.52,0.15,5.48,0.34,21.17,15.32,11.37,27.22,1.33,29.34,20.74,16.38,1.41,0.53,2.44,0.11,1.57,2.47,1.26
2022,108067.7,19855.3,12182.1,1168.8,57369.6,3011.4,201655,18.39,3.38,2.07,0.2,9.76,0.51,34.32,23.07,21.94,43.02,1.49,48.32,35.72,25.43,2.05,1,3.83,0.12,2.79,4.29,1.89
2023,121601.8,23053.5,16189,1333.9,63428.4,3439.3,229046,20.69,3.92,2.75,0.23,10.79,0.59,38.97,25.78,23.35,49.12,1.5,50.36,36.47,27.67,2.35,1.09,4.51,0.12,3.26,4.31,2.13`;

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

    // Toggle a transit mode selection
    const toggleMode = useCallback((mode) => {
        setSelectedModes(prev => {
            if (prev.includes(mode)) {
                // Only remove if it's not the only selected mode
                if (prev.length > 1) {
                    return prev.filter(m => m !== mode);
                }
                return prev;
            } else {
                // Add mode if not already selected (limit to 6 for readability)
                if (prev.length < 6) {
                    return [...prev, mode];
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

    // Change selected year for comparison view
    const changeSelectedYear = useCallback((year) => {
        setSelectedYear(+year);
    }, []);

    // Toggle showing the total
    const toggleShowTotal = useCallback(() => {
        setShowTotal(prev => !prev);
    }, []);

    // Get column name based on mode and metric type
    const getColumnName = useCallback((mode) => {
        if (metricType === 'absolute') {
            return mode;
        } else if (metricType === 'per_capita') {
            return `${mode}per_capita`;
        } else if (metricType === 'per_vrh') {
            return `${mode}per_vrh`;
        } else if (metricType === 'per_vrm') {
            return `${mode}per_vrm`;
        }
        return mode;
    }, [metricType]);

    // Format value for display based on the metric type
    const formatValue = useCallback((value, metricType) => {
        if (value === null || value === undefined) return 'N/A';

        if (metricType === 'absolute') {
            return d3.format(',.1f')(value / 1000) + 'M'; // Convert to millions
        } else {
            return d3.format(',.2f')(value); // Format with 2 decimal places
        }
    }, []);

    // Format percentage
    const formatPercent = useCallback((value) => {
        return d3.format('.1%')(value);
    }, []);

    // Render trend chart (line chart over time)
    const renderTrendChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 20, right: 150, bottom: 40, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for selected modes
        const modes = [...selectedModes];
        if (showTotal && !selectedModes.includes('all')) {
            modes.push('all');
        }

        const chartData = data.map(d => {
            const entry = { year: d.year };
            modes.forEach(mode => {
                const colName = getColumnName(mode);
                entry[mode] = d[colName];
            });
            return entry;
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.year))
            .range([0, width]);

        // Find max value with some padding
        const maxValue = d3.max(chartData, d => {
            return d3.max(modes.map(mode => d[mode] || 0));
        }) * 1.1;

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(Math.min(data.length, 10)))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                if (metricType === 'absolute') {
                    return d3.format('~s')(d).replace('G', 'B'); // Format large numbers
                } else {
                    return d3.format(',.1f')(d); // Format with 1 decimal place
                }
            }))
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
            .attr('y', -60)
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

        // Draw a line for each selected mode
        modes.forEach(mode => {
            // Filter out null values
            const validData = chartData.filter(d => d[mode] !== null && d[mode] !== undefined);

            if (validData.length === 0) return;

            // Create line
            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d[mode]))
                .curve(d3.curveMonotoneX);

            // Set stroke style based on mode
            const strokeDashArray = mode === 'all' ? '5,5' : null;
            const strokeWidth = mode === 'all' ? 3 : 2;

            // Add the line
            svg.append('path')
                .datum(validData)
                .attr('fill', 'none')
                .attr('stroke', colors[mode])
                .attr('stroke-width', strokeWidth)
                .attr('stroke-dasharray', strokeDashArray)
                .attr('d', line);

            // Add dots at each data point
            svg.selectAll(`.dot-${mode}`)
                .data(validData)
                .enter()
                .append('circle')
                .attr('class', `dot dot-${mode}`)
                .attr('cx', d => xScale(d.year))
                .attr('cy', d => yScale(d[mode]))
                .attr('r', 3.5)
                .attr('fill', colors[mode])
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5);
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        modes.forEach((mode, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 10)
                .attr('x2', 20)
                .attr('y2', 10)
                .attr('stroke', colors[mode])
                .attr('stroke-width', mode === 'all' ? 3 : 2)
                .attr('stroke-dasharray', mode === 'all' ? '5,5' : null);

            g.append('text')
                .attr('x', 25)
                .attr('y', 13)
                .style('font-size', '11px')
                .text(modeMap[mode]);
        });

        // Highlight important years with vertical reference lines
        const importantYears = [2020, 2021]; // COVID-19 impact years

        importantYears.forEach(year => {
            if (year >= d3.min(chartData, d => d.year) && year <= d3.max(chartData, d => d.year)) {
                svg.append('line')
                    .attr('x1', xScale(year))
                    .attr('x2', xScale(year))
                    .attr('y1', 0)
                    .attr('y2', height)
                    .attr('stroke', '#999')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '3,3');

                svg.append('text')
                    .attr('x', xScale(year))
                    .attr('y', 15)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '10px')
                    .style('fill', '#666')
                    .text(year === 2020 ? 'COVID-19' : '');
            }
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
                const i = bisect(chartData, x0, 1);

                if (i === 0 || i >= chartData.length) return;

                // Find closest data point
                const d0 = chartData[i - 1];
                const d1 = chartData[i];
                const d = x0 - d0.year > d1.year - x0 ? d1 : d0;

                // Update vertical line
                verticalLine
                    .attr('x1', xScale(d.year))
                    .attr('x2', xScale(d.year));

                // Build tooltip content
                let tooltipContent = `<div style="font-weight: bold; margin-bottom: 5px;">Year: ${d.year}</div>`;

                modes.forEach(mode => {
                    if (d[mode] !== null && d[mode] !== undefined) {
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[mode]}; margin-right: 5px;"></div>
                                <span>${modeMap[mode]}: <b>${d3.format(metricType === 'absolute' ? ',.0f' : ',.2f')(d[mode])}</b> ${metricMap[metricType].suffix}</span>
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

    }, [data, selectedModes, metricType, showTotal, getColumnName, colors, modeMap, metricMap, formatValue]);

    // Render stacked area chart
    const renderStackedChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 20, right: 150, bottom: 40, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for stacked area chart
        const modes = [...selectedModes];

        // Make sure we have consistent data (fill in nulls with zeros)
        const chartData = data.map(d => {
            const entry = { year: d.year };
            modes.forEach(mode => {
                const colName = getColumnName(mode);
                entry[mode] = d[colName] !== null ? d[colName] : 0;
            });
            return entry;
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.year))
            .range([0, width]);

        // Create stack generator
        const stack = d3.stack()
            .keys(modes)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(chartData);

        // Find max value for y scale
        const yMax = d3.max(stackedData, d => d3.max(d, d => d[1]));

        const yScale = d3.scaleLinear()
            .domain([0, yMax * 1.05]) // Add 5% padding
            .range([height, 0]);

        // Create area generator
        const area = d3.area()
            .x(d => xScale(d.data.year))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveMonotoneX);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(Math.min(data.length, 10)))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                if (metricType === 'absolute') {
                    return d3.format('~s')(d).replace('G', 'B'); // Format large numbers
                } else {
                    return d3.format(',.1f')(d); // Format with 1 decimal place
                }
            }))
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
            .attr('y', -60)
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

        // Draw stacked areas
        svg.selectAll('.area')
            .data(stackedData)
            .enter()
            .append('path')
            .attr('class', 'area')
            .attr('d', area)
            .attr('fill', d => colors[d.key])
            .attr('opacity', 0.8)
            .on('mouseover', function (event, d) {
                // Highlight this area
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1);

                // Add tooltip with mode name
                d3.select(chartRef.current)
                    .append('div')
                    .attr('class', 'mode-tooltip')
                    .style('position', 'absolute')
                    .style('background-color', 'white')
                    .style('border', '1px solid #666')
                    .style('border-radius', '4px')
                    .style('padding', '4px 8px')
                    .style('font-size', '12px')
                    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
                    .style('pointer-events', 'none')
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 10}px`)
                    .html(`<span style="color: ${colors[d.key]}">${modeMap[d.key]}</span>`);
            })
            .on('mouseout', function () {
                // Reset styling
                d3.select(this)
                    .attr('opacity', 0.8)
                    .attr('stroke', 'none');

                // Remove tooltip
                d3.select(chartRef.current).selectAll('.mode-tooltip').remove();
            });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        modes.forEach((mode, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', colors[mode])
                .attr('opacity', 0.8);

            g.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-size', '11px')
                .text(modeMap[mode]);
        });

        // Highlight important years with vertical reference lines
        const importantYears = [2020, 2021]; // COVID-19 impact years

        importantYears.forEach(year => {
            if (year >= d3.min(chartData, d => d.year) && year <= d3.max(chartData, d => d.year)) {
                svg.append('line')
                    .attr('x1', xScale(year))
                    .attr('x2', xScale(year))
                    .attr('y1', 0)
                    .attr('y2', height)
                    .attr('stroke', '#999')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '3,3');

                svg.append('text')
                    .attr('x', xScale(year))
                    .attr('y', 15)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '10px')
                    .style('fill', '#666')
                    .text(year === 2020 ? 'COVID-19' : '');
            }
        });

        // Create tooltip for data points
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
                const i = bisect(chartData, x0, 1);

                if (i === 0 || i >= chartData.length) return;

                // Find closest data point
                const d0 = chartData[i - 1];
                const d1 = chartData[i];
                const d = x0 - d0.year > d1.year - x0 ? d1 : d0;

                // Update vertical line
                verticalLine
                    .attr('x1', xScale(d.year))
                    .attr('x2', xScale(d.year));

                // Calculate total for this year
                const yearTotal = modes.reduce((sum, mode) => sum + (d[mode] || 0), 0);

                // Build tooltip content
                let tooltipContent = `<div style="font-weight: bold; margin-bottom: 5px;">Year: ${d.year}</div>`;
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;">Total: ${d3.format(metricType === 'absolute' ? ',.0f' : ',.2f')(yearTotal)} ${metricMap[metricType].suffix}</div>`;

                modes.forEach(mode => {
                    if (d[mode] !== null && d[mode] !== undefined) {
                        const percentage = d[mode] / yearTotal;
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[mode]}; margin-right: 5px;"></div>
                                <span>${modeMap[mode]}: <b>${d3.format(metricType === 'absolute' ? ',.0f' : ',.2f')(d[mode])}</b> (${formatPercent(percentage)})</span>
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

    }, [data, selectedModes, metricType, getColumnName, colors, modeMap, metricMap, formatPercent]);

    // Render comparison chart (bar chart)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 30, right: 80, bottom: 80, left: 80 };
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

        // Prepare data for comparison
        const modes = Object.keys(modeMap).filter(mode =>
            mode !== 'all' && // Exclude 'all' from bar chart
            yearData[getColumnName(mode)] !== null &&
            yearData[getColumnName(mode)] !== undefined
        );

        // Sort modes by value (descending)
        modes.sort((a, b) => {
            const aValue = yearData[getColumnName(a)] || 0;
            const bValue = yearData[getColumnName(b)] || 0;
            return bValue - aValue;
        });

        const chartData = modes.map(mode => ({
            mode,
            name: modeMap[mode],
            value: yearData[getColumnName(mode)]
        }));

        // Set up scales
        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.mode))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value) * 1.1])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => modeMap[d]))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                if (metricType === 'absolute') {
                    return d3.format('~s')(d).replace('G', 'B'); // Format large numbers
                } else {
                    return d3.format(',.1f')(d); // Format with 1 decimal place
                }
            }))
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text(metricMap[metricType].label);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Transit Ridership by Mode (${selectedYear})`);

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
            .attr('x', d => xScale(d.mode))
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.value))
            .attr('fill', d => colors[d.mode])
            .on('mouseover', function (event, d) {
                // Highlight bar
                d3.select(this).attr('opacity', 0.8);

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
                        <div><b>${d.name}</b></div>
                        <div>${d3.format(metricType === 'absolute' ? ',.0f' : ',.2f')(d.value)} ${metricMap[metricType].suffix}</div>
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
            .attr('x', d => xScale(d.mode) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(d => {
                const format = metricType === 'absolute' ? '~s' : ',.1f';
                return d3.format(format)(d.value).replace('G', 'B');
            });

    }, [data, selectedYear, metricType, getColumnName, colors, modeMap, metricMap]);

    // Render composition chart (pie chart)
    const renderCompositionChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 40, right: 200, bottom: 40, left: 40 };
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

        // Get data for the selected year
        const yearData = data.find(d => d.year === selectedYear);
        if (!yearData) return;

        // Prepare data for pie chart
        const modes = Object.keys(modeMap).filter(mode =>
            mode !== 'all' && // Exclude 'all' from pie chart
            yearData[getColumnName(mode)] !== null &&
            yearData[getColumnName(mode)] !== undefined
        );

        const chartData = modes.map(mode => ({
            mode,
            name: modeMap[mode],
            value: yearData[getColumnName(mode)]
        }));

        // Calculate total for percentage
        const total = d3.sum(chartData, d => d.value);

        // Set up pie layout
        const pie = d3.pie()
            .value(d => d.value)
            .sort((a, b) => b.value - a.value); // Sort slices by value (largest first)

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
            .data(pie(chartData))
            .enter()
            .append('g')
            .attr('class', 'slice');

        // Add colored slices
        slices.append('path')
            .attr('d', arc)
            .attr('fill', d => colors[d.data.mode])
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
                        <div>${d3.format(metricType === 'absolute' ? ',.0f' : ',.2f')(d.data.value)} ${metricMap[metricType].suffix}</div>
                        <div>${percentage}% of total</div>
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
            .attr('y', -radius - 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Transit Ridership Composition (${selectedYear})`);

        // Add subtitle with total
        svg.append('text')
            .attr('x', 0)
            .attr('y', -radius - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(`Total: ${d3.format(metricType === 'absolute' ? ',.0f' : ',.2f')(total)} ${metricMap[metricType].suffix}`);

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${radius + 40}, ${-radius})`);

        chartData.sort((a, b) => b.value - a.value);

        chartData.forEach((d, i) => {
            const percentage = (d.value / total * 100).toFixed(1);
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', colors[d.mode]);

            g.append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-size', '11px')
                .text(`${d.name} (${percentage}%)`);
        });

    }, [data, selectedYear, metricType, getColumnName, colors, modeMap, metricMap]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else if (viewType === 'stacked') {
                renderStackedChart();
            } else if (viewType === 'comparison') {
                renderComparisonChart();
            } else if (viewType === 'composition') {
                renderCompositionChart();
            }
        }
    }, [data, selectedModes, metricType, viewType, selectedYear, showTotal, loading, renderTrendChart, renderStackedChart, renderComparisonChart, renderCompositionChart]);

    // Get all available modes (excluding the "all" mode for selections)
    const getAvailableModes = useCallback(() => {
        return Object.keys(modeMap).filter(key => key !== 'all');
    }, [modeMap]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading transit ridership data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Transit Ridership Dashboard</h2>

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
                            className={`px-3 py-1 rounded ${viewType === 'stacked' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('stacked')}
                        >
                            Stacked Area
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${viewType === 'comparison' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('comparison')}
                        >
                            Mode Comparison
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${viewType === 'composition' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeViewType('composition')}
                        >
                            Composition (Pie)
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Metric Type:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'absolute' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('absolute')}
                        >
                            Absolute Ridership
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'per_capita' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('per_capita')}
                        >
                            Per Capita
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'per_vrh' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('per_vrh')}
                        >
                            Per Vehicle Hour
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${metricType === 'per_vrm' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => changeMetricType('per_vrm')}
                        >
                            Per Vehicle Mile
                        </button>
                    </div>
                </div>

                {(viewType === 'comparison' || viewType === 'composition') && (
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

                {(viewType === 'trend') && (
                    <div className="flex items-end">
                        <button
                            className={`px-3 py-1 rounded ${showTotal ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                            onClick={toggleShowTotal}
                        >
                            {showTotal ? 'Hide Total' : 'Show Total'}
                        </button>
                    </div>
                )}
            </div>

            {(viewType === 'trend' || viewType === 'stacked') && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Transit Modes:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {getAvailableModes().map(mode => (
                            <button
                                key={mode}
                                className={`px-3 py-1 text-xs rounded-full ${selectedModes.includes(mode)
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor: selectedModes.includes(mode)
                                        ? colors[mode]
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

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About Transit Ridership Metrics</h3>
                <p className="text-sm text-gray-600 mb-2">
                    This dashboard visualizes transit ridership from {d3.min(data, d => d.year)} to {d3.max(data, d => d.year)} using multiple metrics:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    <div className="p-2 rounded">
                        <span className="font-medium">Absolute Ridership:</span> Total number of passenger trips (in thousands)
                    </div>
                    <div className="p-2 rounded">
                        <span className="font-medium">Per Capita:</span> Annual passenger trips per resident
                    </div>
                    <div className="p-2 rounded">
                        <span className="font-medium">Per Vehicle Revenue Hour:</span> Passengers per hour that vehicles are in service
                    </div>
                    <div className="p-2 rounded">
                        <span className="font-medium">Per Vehicle Revenue Mile:</span> Passengers per mile that vehicles are in service
                    </div>
                </div>

                <div className="mt-3 p-2 bg-blue-50 rounded">
                    <span className="font-medium">COVID-19 Impact:</span> Transit ridership dropped dramatically in 2020-2021 due to pandemic restrictions and remote work.
                    The data shows a partial recovery in 2022-2023, but most modes remain below pre-pandemic levels.
                </div>
            </div>
        </div>
    );
};

export default TransitRidershipChart;