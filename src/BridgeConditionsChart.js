import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const EnhancedBridgeConditionsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetrics, setSelectedMetrics] = useState(['MPO- All']);
    const [viewType, setViewType] = useState('trend'); // 'trend' or 'comparison'
    const [selectedYear, setSelectedYear] = useState(null);
    const [showLocalOwnership, setShowLocalOwnership] = useState(false);
    const chartRef = useRef(null);

    // Color scale for metrics
    const colors = ['#008485', '#d97706', '#be123c', '#1d4ed8', '#15803d'];

    // Jurisdiction codes and their full names for better labeling
    const jurisdictionMap = {
        'MPO': 'Regional Average',
        'Colonial Heights': 'Colonial Heights',
        'Petersburg': 'Petersburg',
        'Hopewell': 'Hopewell',
        'Dinwiddie': 'Dinwiddie County',
        'Chesterfield': 'Chesterfield County',
        'Prince George': 'Prince George County'
    };

    // Ownership codes and their full names
    const ownershipMap = {
        'All': 'All Bridges',
        'State': 'State-Owned',
        'Local': 'Locally-Owned',
        'Other': 'Other Ownership'
    };

    // Parse the CSV data
    useEffect(() => {
        const csvData = `year,MPO- All,MPO- State,MPO- Local,MPO- Other,Colonial Heights-All,Colonial Heights-State,Colonial Heights-Local,Colonial Heights-Other,Petersburg-All,Petersburg-State,Petersburg-Local,Petersburg-Other,Hopewell-All,Hopewell-State,Hopewell-Local,Hopewell-Other,Dinwiddie-All,Dinwiddie-State,Dinwiddie-Local,Dinwiddie-Other,Chesterfield-All,Chesterfield-State,Chesterfield-Local,Chesterfield-Other,Prince George-All,Prince George-State,Prince George-Local,Prince George-Other
2000,0.139,0.151,0.254,0.075,0.173,0.157,0.223,0.135,0.191,0.165,0.247,0.208,0.131,0.131,0.179,0.022,0.181,0.159,0.235,0.182,0.244,0.265,0.209,0.2,0.144,0.189,0.147,0.06
2001,0.15,0.165,0.264,0.076,0.182,0.165,0.234,0.135,0.203,0.178,0.261,0.209,0.129,0.125,0.182,0.022,0.191,0.165,0.256,0.183,0.232,0.246,0.222,0.169,0.137,0.171,0.146,0.06
2002,0.163,0.183,0.27,0.076,0.195,0.184,0.238,0.139,0.222,0.202,0.272,0.216,0.129,0.13,0.175,0.022,0.213,0.192,0.273,0.19,0.249,0.265,0.241,0.169,0.143,0.18,0.152,0.06
2003,0.177,0.208,0.233,0.076,0.196,0.189,0.23,0.147,0.228,0.21,0.272,0.225,0.117,0.123,0.15,0.032,0.218,0.199,0.274,0.196,0.255,0.273,0.236,0.185,0.125,0.156,0.129,0.068
2004,0.17,0.2,0.235,0.072,0.199,0.193,0.231,0.149,0.23,0.214,0.271,0.232,0.123,0.13,0.157,0.031,0.223,0.204,0.274,0.208,0.272,0.293,0.253,0.185,0.132,0.168,0.139,0.065
2005,0.166,0.192,0.241,0.074,0.202,0.191,0.245,0.155,0.236,0.213,0.291,0.238,0.121,0.123,0.159,0.032,0.232,0.208,0.296,0.215,0.282,0.303,0.267,0.185,0.129,0.162,0.132,0.069
2006,0.168,0.196,0.239,0.074,0.201,0.192,0.24,0.152,0.237,0.216,0.289,0.233,0.114,0.116,0.147,0.032,0.234,0.213,0.294,0.209,0.278,0.298,0.261,0.185,0.107,0.128,0.11,0.069
2007,0.165,0.188,0.252,0.065,0.205,0.195,0.247,0.141,0.244,0.222,0.304,0.216,0.108,0.112,0.138,0.032,0.242,0.221,0.304,0.213,0.289,0.301,0.288,0.212,0.096,0.112,0.097,0.069
2008,0.162,0.182,0.255,0.073,0.209,0.199,0.259,0.136,0.253,0.226,0.332,0.222,0.101,0.116,0.12,0.016,0.252,0.223,0.337,0.224,0.304,0.311,0.302,0.262,0.093,0.15,0.077,0.042
2009,0.161,0.187,0.274,0.048,0.219,0.2,0.291,0.132,0.269,0.227,0.386,0.225,0.096,0.115,0.112,0.005,0.269,0.218,0.412,0.223,0.294,0.286,0.34,0.231,0.084,0.131,0.084,0.014
2010,0.152,0.174,0.29,0.039,0.218,0.197,0.298,0.121,0.266,0.223,0.39,0.204,0.1,0.113,0.122,0.01,0.267,0.215,0.42,0.199,0.291,0.279,0.352,0.215,0.084,0.103,0.096,0.028
2011,0.131,0.15,0.264,0.047,0.216,0.188,0.302,0.142,0.262,0.212,0.394,0.235,0.1,0.11,0.127,0.016,0.269,0.21,0.43,0.218,0.309,0.282,0.414,0.222,0.098,0.112,0.115,0.041
2012,0.112,0.123,0.273,0.035,0.203,0.166,0.308,0.121,0.242,0.184,0.396,0.201,0.104,0.11,0.137,0.016,0.249,0.18,0.433,0.194,0.278,0.233,0.417,0.226,0.089,0.11,0.096,0.042
2013,0.123,0.108,0.26,0.118,0.196,0.152,0.311,0.128,0.231,0.163,0.4,0.205,0.107,0.116,0.134,0.017,0.238,0.158,0.44,0.203,0.277,0.204,0.482,0.242,0.091,0.101,0.109,0.03
2014,0.106,0.105,0.265,0.041,0.189,0.146,0.305,0.116,0.225,0.157,0.397,0.193,0.101,0.111,0.125,0.015,0.23,0.151,0.435,0.187,0.265,0.191,0.485,0.19,0.091,0.111,0.1,0.041
2015,0.095,0.097,0.251,0.029,0.181,0.142,0.291,0.102,0.219,0.153,0.386,0.185,0.089,0.108,0.103,0.017,0.226,0.151,0.42,0.174,0.254,0.183,0.468,0.159,0.078,0.083,0.106,0.022
2016,0.095,0.096,0.252,0.028,0.18,0.144,0.285,0.1,0.216,0.154,0.373,0.179,0.096,0.112,0.117,0.02,0.222,0.152,0.403,0.171,0.241,0.173,0.445,0.161,0.086,0.11,0.105,0.022
2017,0.088,0.089,0.241,0.025,0.169,0.138,0.262,0.089,0.201,0.145,0.341,0.166,0.093,0.114,0.11,0.012,0.207,0.147,0.365,0.157,0.223,0.166,0.397,0.136,0.086,0.11,0.106,0.022
2018,0.081,0.084,0.257,0.021,0.16,0.133,0.244,0.083,0.187,0.137,0.307,0.151,0.096,0.118,0.113,0.012,0.193,0.14,0.324,0.15,0.217,0.17,0.361,0.153,0.092,0.128,0.107,0.022
2019,0.083,0.081,0.26,0.021,0.149,0.124,0.225,0.075,0.172,0.129,0.279,0.131,0.091,0.108,0.11,0.016,0.176,0.13,0.291,0.123,0.203,0.164,0.322,0.15,0.092,0.119,0.107,0.033
2020,0.083,0.085,0.244,0.016,0.141,0.122,0.211,0.06,0.164,0.127,0.26,0.106,0.086,0.103,0.106,0.012,0.167,0.129,0.268,0.098,0.203,0.175,0.298,0.136,0.095,0.127,0.115,0.022
2021,0.08,0.082,0.231,0.015,0.134,0.114,0.2,0.059,0.155,0.119,0.24,0.105,0.083,0.096,0.107,0.012,0.155,0.12,0.241,0.093,0.192,0.163,0.281,0.158,0.104,0.128,0.135,0.022
2022,0.073,0.077,0.195,0.015,0.125,0.107,0.185,0.055,0.143,0.111,0.221,0.098,0.08,0.094,0.102,0.012,0.144,0.114,0.221,0.085,0.174,0.148,0.25,0.14,0.112,0.138,0.148,0.022
2023,0.058,0.063,0.19,0.011,0.121,0.105,0.176,0.054,0.138,0.108,0.211,0.099,0.079,0.096,0.096,0.008,0.14,0.113,0.208,0.084,0.169,0.146,0.24,0.136,0.11,0.138,0.142,0.022`;

        try {
            // Parse CSV data
            const parsedData = d3.csvParse(csvData, d3.autoType);
            setData(parsedData);

            // Set the most recent year as the default for comparison view
            const latestYear = d3.max(parsedData, d => d.year);
            setSelectedYear(latestYear);

            setLoading(false);
        } catch (err) {
            setError(`Error parsing data: ${err.message}`);
            setLoading(false);
        }
    }, []);

    // Toggle a metric selection
    const toggleMetric = (metric) => {
        if (selectedMetrics.includes(metric)) {
            // Only remove if it's not the only selected metric
            if (selectedMetrics.length > 1) {
                setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
            }
        } else {
            // Add metric if not already selected (limit to 5)
            if (selectedMetrics.length < 5) {
                setSelectedMetrics([...selectedMetrics, metric]);
            }
        }
    };

    // Toggle view type between trend and comparison
    const toggleViewType = () => {
        setViewType(viewType === 'trend' ? 'comparison' : 'trend');
    };

    // Toggle between showing only "All" ownership or all ownership types
    const toggleOwnershipView = () => {
        setShowLocalOwnership(!showLocalOwnership);
    };

    // Change selected year for comparison view
    const changeSelectedYear = (year) => {
        setSelectedYear(year);
    };

    // Get metrics organized by jurisdiction and ownership
    const getOrganizedMetrics = () => {
        if (data.length === 0) return [];

        // Get all column names except 'year'
        const metrics = Object.keys(data[0]).filter(key => key !== 'year');

        // Group metrics by jurisdiction
        const groupedMetrics = {};

        metrics.forEach(metric => {
            // Parse the metric name to get jurisdiction and ownership
            const [jurisdiction, ownership] = metric.split('-');

            if (!groupedMetrics[jurisdiction]) {
                groupedMetrics[jurisdiction] = [];
            }

            groupedMetrics[jurisdiction].push({
                value: metric,
                ownership: ownership,
                label: `${jurisdictionMap[jurisdiction] || jurisdiction}: ${ownershipMap[ownership] || ownership}`
            });
        });

        return groupedMetrics;
    };

    // Get filtered metrics based on selected view
    const getFilteredMetrics = () => {
        const groupedMetrics = getOrganizedMetrics();
        const result = [];

        Object.keys(groupedMetrics).forEach(jurisdiction => {
            // If not showing local ownership details, only include "All" metrics
            const filtered = showLocalOwnership
                ? groupedMetrics[jurisdiction]
                : groupedMetrics[jurisdiction].filter(m => m.ownership === 'All');

            result.push(...filtered);
        });

        return result;
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

        // Find maximum value across all selected metrics
        const maxValue = d3.max(data, d => {
            return d3.max(selectedMetrics.map(metric => d[metric] || 0));
        });

        // Set up scales with proper domain for all metrics
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1]) // 10% padding on top
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))); // 'd' for integers

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d3.format('.1%')(d))); // Format as percentage

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
            .text('Bridge Deficiency Rate');

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw a line for each selected metric
        selectedMetrics.forEach((metric, i) => {
            // Create line
            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d[metric]))
                .defined(d => d[metric] !== null && d[metric] !== undefined)
                .curve(d3.curveMonotoneX);

            // Add the line
            svg.append('path')
                .datum(data.filter(d => d[metric] !== null && d[metric] !== undefined))
                .attr('fill', 'none')
                .attr('stroke', colors[i])
                .attr('stroke-width', i === 0 ? 3 : 2)
                .attr('stroke-dasharray', i === 0 ? null : '3,3')
                .attr('d', line);

            // Add dots
            svg.selectAll(`.dot-${i}`)
                .data(data.filter(d => d[metric] !== null && d[metric] !== undefined))
                .enter()
                .append('circle')
                .attr('class', `dot dot-${i}`)
                .attr('cx', d => xScale(d.year))
                .attr('cy', d => yScale(d[metric]))
                .attr('r', i === 0 ? 4 : 3)
                .attr('fill', colors[i])
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .attr('data-metric', metric);
        });

        // Add a legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        selectedMetrics.forEach((metric, i) => {
            const [jurisdiction, ownership] = metric.split('-');
            const label = `${jurisdictionMap[jurisdiction] || jurisdiction}: ${ownershipMap[ownership] || ownership}`;

            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 22})`);

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 10)
                .attr('x2', 20)
                .attr('y2', 10)
                .attr('stroke', colors[i])
                .attr('stroke-width', i === 0 ? 3 : 2)
                .attr('stroke-dasharray', i === 0 ? null : '3,3');

            g.append('text')
                .attr('x', 25)
                .attr('y', 13)
                .style('font-size', '11px')
                .text(label);
        });

        // Create tooltip that follows mouse
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

                // Highlight dots
                svg.selectAll('.dot')
                    .style('stroke-width', 2);
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
                verticalLine.style('opacity', 0);

                // Reset dots
                svg.selectAll('.dot')
                    .style('stroke-width', 1);
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

                selectedMetrics.forEach((metric, idx) => {
                    if (d[metric] !== undefined && d[metric] !== null) {
                        const [jurisdiction, ownership] = metric.split('-');
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[idx]}; margin-right: 5px;"></div>
                                <span>${jurisdictionMap[jurisdiction] || jurisdiction}: ${ownershipMap[ownership] || ownership} - ${d3.format('.1%')(d[metric])}</span>
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

    }, [data, selectedMetrics, colors, jurisdictionMap, ownershipMap]);

    // Render comparison chart (bar chart for specific year)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Get data for the selected year
        const yearData = data.find(d => d.year === selectedYear);
        if (!yearData) return;

        // Set up chart dimensions
        const margin = { top: 30, right: 80, bottom: 80, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for selected metrics
        const chartData = selectedMetrics.map(metric => {
            const [jurisdiction, ownership] = metric.split('-');
            return {
                metric,
                jurisdiction,
                ownership,
                label: `${jurisdictionMap[jurisdiction] || jurisdiction}: ${ownershipMap[ownership] || ownership}`,
                value: yearData[metric]
            };
        }).filter(d => d.value !== null && d.value !== undefined);

        // Sort data by value
        chartData.sort((a, b) => a.value - b.value);

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value) * 1.1])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(chartData.map(d => d.metric))
            .range([0, height])
            .padding(0.3);

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                const [jurisdiction, ownership] = d.split('-');
                return `${jurisdictionMap[jurisdiction] || jurisdiction}: ${ownershipMap[ownership] || ownership}`;
            }));

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => d3.format('.1%')(d)));

        // Add X axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + 35})`)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Bridge Deficiency Rate');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Bridge Deficiency Comparison (${selectedYear})`);

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisBottom(xScale)
                .tickSize(height)
                .tickFormat('')
            );

        // Create bars
        svg.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('y', d => yScale(d.metric))
            .attr('x', 0)
            .attr('height', yScale.bandwidth())
            .attr('width', d => xScale(d.value))
            .attr('fill', (d, i) => colors[i % colors.length])
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
                        <div>${d.label}</div>
                        <div>Deficiency Rate: ${d3.format('.1%')(d.value)}</div>
                    `);
            })
            .on('mouseout', function () {
                // Reset bar highlight
                d3.select(this).attr('opacity', 1);

                // Remove tooltip
                d3.select(chartRef.current).selectAll('.tooltip').remove();
            });

        // Add value labels
        svg.selectAll('.value-label')
            .data(chartData)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('y', d => yScale(d.metric) + yScale.bandwidth() / 2 + 4)
            .attr('x', d => xScale(d.value) + 5)
            .style('font-size', '11px')
            .style('fill', '#333')
            .text(d => d3.format('.1%')(d.value));

    }, [data, selectedMetrics, selectedYear, colors, jurisdictionMap, ownershipMap]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else {
                renderComparisonChart();
            }
        }
    }, [data, selectedMetrics, selectedYear, viewType, loading, renderTrendChart, renderComparisonChart]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading bridge conditions data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Bridge Deficiency Dashboard</h2>

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
                            Regional Comparison
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
                            onChange={(e) => changeSelectedYear(Number(e.target.value))}
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
                        Ownership Details:
                    </label>
                    <button
                        className={`px-4 py-2 rounded ${showLocalOwnership ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={toggleOwnershipView}
                    >
                        {showLocalOwnership ? 'Show Combined Only' : 'Show Ownership Details'}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Metrics to Compare (max 5):
                </label>
                <div className="flex flex-wrap gap-2">
                    {getFilteredMetrics().map(option => (
                        <button
                            key={option.value}
                            className={`px-3 py-1 text-xs rounded-full ${selectedMetrics.includes(option.value)
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            style={{
                                backgroundColor: selectedMetrics.includes(option.value)
                                    ? colors[selectedMetrics.indexOf(option.value) % colors.length]
                                    : undefined
                            }}
                            onClick={() => toggleMetric(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                {selectedMetrics.length > 1 && (
                    <button
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                        onClick={() => setSelectedMetrics(selectedMetrics.slice(0, 1))}
                    >
                        Clear comparison metrics
                    </button>
                )}
            </div>

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About This Data</h3>
                <p className="text-sm text-gray-600 mb-2">
                    The Bridge Deficiency Rate measures the percentage of bridges that are classified as structurally
                    deficient. Lower values represent better bridge conditions in the region.
                </p>
                {viewType === 'trend' && (
                    <p className="text-sm text-gray-600">
                        From 2000 to 2023, the overall trend shows an improvement (reduction) in bridge deficiency rates
                        across most jurisdictions, indicating infrastructure improvements over time.
                    </p>
                )}
                {showLocalOwnership && (
                    <p className="text-sm text-gray-600 mt-2">
                        <strong>Note:</strong> Locally-owned bridges typically show higher deficiency rates than state-owned
                        bridges, which may reflect differences in maintenance resources and funding.
                    </p>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>Note: Lower values indicate better bridge conditions (fewer deficient bridges)</p>
            </div>
        </div>
    );
};

export default EnhancedBridgeConditionsChart;