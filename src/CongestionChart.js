import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const CongestionChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState(['hw']);
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('PM');
    const [viewType, setViewType] = useState('trend'); // 'trend' or 'comparison'
    const [selectedYear, setSelectedYear] = useState(null);
    const chartRef = useRef(null);

    // Color scale for regions
    const colors = ['#008485', '#d97706', '#be123c', '#1d4ed8', '#15803d', '#7c3aed'];

    // Region codes and their full names
    const regionMap = {
        'hw': 'Regional Average',
        'ch': 'Colonial Heights',
        'pe': 'Petersburg',
        'che': 'Chesterfield',
        'din': 'Dinwiddie',
        'pg': 'Prince George'
    };

    // Time period codes and their full names
    const timeMap = {
        'AM': 'Morning Peak (6-9 AM)',
        'MD': 'Mid-Day (9 AM-3 PM)',
        'PM': 'Evening Peak (3-6 PM)',
        'NT': 'Night Time (6 PM-6 AM)',
        '24': '24-Hour Average'
    };

    // Parse the CSV data
    useEffect(() => {
        const csvData = `Year,hwAM,hwMD,hwPM,hwNT,hw24,chAM,chMD,chPM,chNT,ch24,peAM,peMD,pePM,peNT,pe24,cheAM,cheMD,chePM,cheNT,che24,dinAM,dinMD,dinPM,dinNT,din24,pgAM,pgMD,pgPM,pgNT,pg24
2011,1.22,1.12,1.55,1.1,1.25,1.06,1.07,1.29,1.1,1.1,1.08,1.04,1.04,1.05,1.05,1.16,1.16,1.36,1.12,1.15,1.26,1.09,1.17,1.09,1.12,1.03,1.03,1.04,1.08,1.06
2012,1.21,1.08,1.32,1.06,1.14,1.03,1.05,1.18,1.07,1.07,1.07,1.05,1.09,1.03,1.03,1.15,1.12,1.27,1.08,1.11,1.2,1.07,1.14,1.09,1.1,1.01,1.01,1.01,1.09,1.05
2013,1.27,1.08,1.5,1.05,1.23,1.04,1.03,1.2,1.05,1.06,1.08,1.05,1.03,1.03,1.03,1.18,1.11,1.33,1.08,1.12,1.19,1.06,1.18,1.08,1.11,1.02,1.02,1.03,1.14,1.08
2014,1.38,1.09,1.53,1.08,1.29,1.09,1.03,1.18,1.06,1.08,1.1,1.05,1.03,1.04,1.04,1.22,1.09,1.37,1.08,1.13,1.24,1.08,1.12,1.1,1.13,1.04,1.03,1.05,1.07,1.05
2015,1.35,1.1,1.58,1.09,1.31,1.08,1.05,1.18,1.06,1.08,1.08,1.09,1.05,1.06,1.05,1.11,1.01,1.21,1.06,1.06,1.22,1.08,1.17,1.11,1.14,1.06,1.07,1.07,1.07,1.06
2016,1.32,1.09,1.55,1.08,1.29,1.08,1.05,1.16,1.07,1.09,1.06,1.01,1.02,1.05,1.03,1.12,1.02,1.24,1.07,1.08,1.23,1.04,1.16,1.08,1.12,1.02,1.01,1.04,1.07,1.05
2017,1.27,1.12,1.62,1.07,1.33,1.09,1.06,1.2,1.07,1.1,1.05,1.01,1.02,1.04,1.03,1.14,1.03,1.33,1.08,1.13,1.24,1.07,1.2,1.14,1.15,1,1.01,1.08,1.07,1.04
2018,1.11,1.08,1.23,1.08,1.12,1.3,1.14,1.69,1.08,1.38,1.06,1.02,1.04,1.04,1.04,1.15,1.05,1.31,1.09,1.14,1.25,1.1,1.22,1.26,1.19,1.02,1.01,1.03,1.04,1.03
2019,1.1,1.05,1.22,1.08,1.11,1.3,1.18,1.64,1.07,1.35,1.07,1.03,1.04,1.05,1.04,1.15,1.06,1.3,1.11,1.13,1.18,1.07,1.19,1.22,1.14,1.02,1.02,1.05,1.1,1.07
2020,1.06,1.05,1.09,1.09,1.08,1.1,1.08,1.37,1.09,1.17,1.04,1.06,1.05,1.05,1.04,1.05,1.04,1.06,1.12,1.09,1.05,1.04,1.07,1.09,1.07,1.02,1.02,1.02,1.1,1.06
2021,1.04,1.05,1.13,1.09,1.09,1.2,1.33,1.68,1.1,1.34,1.03,1.04,1.05,1.04,1.04,1.05,1.05,1.06,1.13,1.11,1.03,1.07,1.1,1.1,1.09,1.02,1.05,1.02,1.17,1.12
2022,1.05,1.07,1.17,1.1,1.1,1.27,1.26,1.68,1.15,1.38,1.03,1.07,1.11,1.08,1.06,1.06,1.05,1.08,1.13,1.1,1.07,1.05,1.14,1.13,1.12,1.03,1.02,1.03,1.15,1.1
2023,1.08,1.08,1.22,1.11,1.12,1.35,1.38,1.79,1.12,1.45,1.08,1.06,1.12,1.14,1.11,1.09,1.07,1.12,1.13,1.11,1.1,1.09,1.21,1.13,1.14,1.05,1.06,1.06,1.14,1.1`;

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
    const toggleRegion = (region) => {
        if (selectedRegions.includes(region)) {
            // Don't remove if it's the only selected region
            if (selectedRegions.length > 1) {
                setSelectedRegions(selectedRegions.filter(r => r !== region));
            }
        } else {
            // Add region if not already selected (limit to 6)
            if (selectedRegions.length < 6) {
                setSelectedRegions([...selectedRegions, region]);
            }
        }
    };

    // Change the selected time period
    const changeTimePeriod = (period) => {
        setSelectedTimePeriod(period);
    };

    // Toggle view type between trend and comparison
    const toggleViewType = () => {
        setViewType(viewType === 'trend' ? 'comparison' : 'trend');
    };

    // Change selected year for comparison view
    const changeSelectedYear = (year) => {
        setSelectedYear(year);
    };

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

        // Prepare data for selected regions and time period
        const chartData = data.map(d => {
            const entry = { Year: d.Year };
            selectedRegions.forEach(region => {
                const columnName = `${region}${selectedTimePeriod}`;
                entry[region] = d[columnName];
            });
            return entry;
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.Year))
            .range([0, width]);

        // Find max value for y-scale with some padding
        const maxValue = d3.max(chartData, d => {
            return d3.max(selectedRegions.map(region => d[region] || 0));
        });

        // Min value should be at least 1.0 (no congestion baseline)
        const yScale = d3.scaleLinear()
            .domain([0.9, Math.max(maxValue * 1.05, 1.2)]) // Ensure we at least show up to 1.2
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))) // 'd' for integers
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d3.format('.2f')(d)))
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
            .text('Congestion Index');

        // Add reference line at y=1 (no congestion)
        svg.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yScale(1))
            .attr('y2', yScale(1))
            .style('stroke', '#888')
            .style('stroke-dasharray', '3,3')
            .style('stroke-width', 1);

        svg.append('text')
            .attr('x', 5)
            .attr('y', yScale(1) - 5)
            .style('fill', '#888')
            .style('font-size', '10px')
            .text('No Congestion (1.0)');

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
        selectedRegions.forEach((region, i) => {
            // Create line
            const line = d3.line()
                .x(d => xScale(d.Year))
                .y(d => yScale(d[region]))
                .defined(d => d[region] !== null && d[region] !== undefined)
                .curve(d3.curveMonotoneX);

            // Filter out missing data points
            const validData = chartData.filter(d => d[region] !== null && d[region] !== undefined);

            // Add the line
            svg.append('path')
                .datum(validData)
                .attr('fill', 'none')
                .attr('stroke', colors[i])
                .attr('stroke-width', i === 0 ? 3 : 2)
                .attr('d', line);

            // Add dots
            svg.selectAll(`.dot-${i}`)
                .data(validData)
                .enter()
                .append('circle')
                .attr('class', `dot dot-${i}`)
                .attr('cx', d => xScale(d.Year))
                .attr('cy', d => yScale(d[region]))
                .attr('r', 4)
                .attr('fill', colors[i])
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        selectedRegions.forEach((region, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 22})`);

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 10)
                .attr('x2', 20)
                .attr('y2', 10)
                .attr('stroke', colors[i])
                .attr('stroke-width', i === 0 ? 3 : 2);

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
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;">Time Period: ${timeMap[selectedTimePeriod]}</div>`;

                selectedRegions.forEach((region, idx) => {
                    if (d[region] !== undefined && d[region] !== null) {
                        const congestionLevel = getCongestionLevel(d[region]);
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[idx]}; margin-right: 5px;"></div>
                                <span>${regionMap[region]}: <b>${d3.format('.2f')(d[region])}</b> (${congestionLevel})</span>
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

    }, [data, selectedRegions, selectedTimePeriod, colors, regionMap, timeMap]);

    // Render comparison chart (bar chart for specific year)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Get data for the selected year
        const yearData = data.find(d => d.Year === selectedYear);
        if (!yearData) return;

        // Set up chart dimensions
        const margin = { top: 30, right: 180, bottom: 60, left: 150 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Get all time periods
        const timePeriods = Object.keys(timeMap);

        // Prepare data for all regions and selected time periods
        const chartData = [];

        selectedRegions.forEach(region => {
            timePeriods.forEach(time => {
                const columnName = `${region}${time}`;
                if (yearData[columnName] !== undefined) {
                    chartData.push({
                        region,
                        regionName: regionMap[region],
                        time,
                        timeName: timeMap[time],
                        value: yearData[columnName]
                    });
                }
            });
        });

        // Group data by region
        const groupedData = _.groupBy(chartData, 'region');

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0.9, Math.max(d3.max(chartData, d => d.value) * 1.05, 1.8)])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(selectedRegions)
            .range([0, height])
            .padding(0.3);

        const timeScale = d3.scaleBand()
            .domain(timePeriods)
            .range([0, yScale.bandwidth()])
            .padding(0.1);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => d3.format('.1f')(d)));

        // Add Y axis with region names
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => regionMap[d]));

        // Add X axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + 35})`)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Congestion Index');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Highway Congestion by Time Period (${selectedYear})`);

        // Add reference line at x=1 (no congestion)
        svg.append('line')
            .attr('x1', xScale(1))
            .attr('x2', xScale(1))
            .attr('y1', 0)
            .attr('y2', height)
            .style('stroke', '#888')
            .style('stroke-dasharray', '3,3')
            .style('stroke-width', 1);

        svg.append('text')
            .attr('x', xScale(1) + 5)
            .attr('y', 10)
            .style('fill', '#888')
            .style('font-size', '10px')
            .text('No Congestion (1.0)');

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisBottom(xScale)
                .tickSize(height)
                .tickFormat('')
            );

        // Color scale for time periods
        const timeColorScale = d3.scaleOrdinal()
            .domain(timePeriods)
            .range(['#4682B4', '#20B2AA', '#CD5C5C', '#4B0082', '#2E8B57']);

        // Draw bars for each region and time period
        Object.keys(groupedData).forEach(region => {
            const regionData = groupedData[region];

            svg.selectAll(`.bar-${region}`)
                .data(regionData)
                .enter()
                .append('rect')
                .attr('class', `bar-${region}`)
                .attr('y', d => yScale(d.region) + timeScale(d.time))
                .attr('x', 0)
                .attr('height', timeScale.bandwidth())
                .attr('width', d => xScale(d.value))
                .attr('fill', d => timeColorScale(d.time))
                .on('mouseover', function (event, d) {
                    // Highlight bar
                    d3.select(this).attr('opacity', 0.8);

                    // Show tooltip
                    const congestionLevel = getCongestionLevel(d.value);
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
                            <div>${d.timeName}</div>
                            <div>Congestion Index: <b>${d3.format('.2f')(d.value)}</b></div>
                            <div>Level: ${congestionLevel}</div>
                        `);
                })
                .on('mouseout', function () {
                    // Reset bar highlight
                    d3.select(this).attr('opacity', 1);

                    // Remove tooltip
                    d3.select(chartRef.current).selectAll('.tooltip').remove();
                });

            // Add value labels
            svg.selectAll(`.value-label-${region}`)
                .data(regionData)
                .enter()
                .append('text')
                .attr('class', `value-label-${region}`)
                .attr('y', d => yScale(d.region) + timeScale(d.time) + timeScale.bandwidth() / 2 + 4)
                .attr('x', d => xScale(d.value) + 5)
                .style('font-size', '10px')
                .style('fill', '#333')
                .text(d => d3.format('.2f')(d.value));
        });

        // Add a legend for time periods
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        timePeriods.forEach((time, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .attr('fill', timeColorScale(time));

            g.append('text')
                .attr('x', 20)
                .attr('y', 10)
                .style('font-size', '11px')
                .text(timeMap[time]);
        });

    }, [data, selectedRegions, selectedYear, colors, regionMap, timeMap]);

    // Helper function to get congestion level description
    const getCongestionLevel = (value) => {
        if (value < 1.05) return "No Congestion";
        if (value < 1.15) return "Light Congestion";
        if (value < 1.3) return "Moderate Congestion";
        if (value < 1.5) return "Heavy Congestion";
        return "Severe Congestion";
    };

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else {
                renderComparisonChart();
            }
        }
    }, [data, selectedRegions, selectedTimePeriod, selectedYear, viewType, loading, renderTrendChart, renderComparisonChart]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading congestion data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Highway Congestion Analysis</h2>

            <div className="mb-4 flex flex-wrap gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        View Type:
                    </label>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded ${viewType === 'trend' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setViewType('trend')}
                        >
                            Trend Over Time
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${viewType === 'comparison' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setViewType('comparison')}
                        >
                            Time Period Comparison
                        </button>
                    </div>
                </div>

                {viewType === 'trend' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Time Period:
                        </label>
                        <select
                            className="w-48 p-2 border border-gray-300 rounded"
                            value={selectedTimePeriod}
                            onChange={(e) => changeTimePeriod(e.target.value)}
                        >
                            {Object.entries(timeMap).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {viewType === 'comparison' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Year:
                        </label>
                        <select
                            className="w-32 p-2 border border-gray-300 rounded"
                            value={selectedYear}
                            onChange={(e) => changeSelectedYear(Number(e.target.value))}
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
                                    ? colors[selectedRegions.indexOf(key)]
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
                <h3 className="font-medium text-gray-800 mb-2">Understanding Congestion Index</h3>
                <p className="text-sm text-gray-600 mb-2">
                    The congestion index represents the ratio of travel time during congested periods compared to free-flow conditions.
                    A value of 1.0 means no congestion (travel takes the expected time), while higher values indicate increased congestion.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                    <div className="bg-green-50 p-2 rounded">
                        <span className="font-medium">1.00-1.05:</span> No Congestion
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                        <span className="font-medium">1.05-1.15:</span> Light Congestion
                    </div>
                    <div className="bg-yellow-100 p-2 rounded">
                        <span className="font-medium">1.15-1.30:</span> Moderate Congestion
                    </div>
                    <div className="bg-orange-100 p-2 rounded">
                        <span className="font-medium">1.30-1.50:</span> Heavy Congestion
                    </div>
                    <div className="bg-red-100 p-2 rounded">
                        <span className="font-medium">Above 1.50:</span> Severe Congestion
                    </div>
                </div>

                {selectedYear === 2020 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                        <span className="font-medium">COVID-19 Impact:</span> Note the significant reduction in congestion during 2020 due to pandemic-related travel restrictions and remote work.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CongestionChart;