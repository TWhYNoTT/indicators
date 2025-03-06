import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const MilesDrivenChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState(['hw']);
    const [selectedMetric, setSelectedMetric] = useState('vmt');
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

    // Metric types and their display names
    const metricMap = {
        'vmt': 'Total VMT (Billion Miles)',
        'vmtPerVehicle': 'VMT per Vehicle (Thousand Miles)',
        'vmtPerCap': 'VMT per Capita (Thousand Miles)'
    };

    // Parse the CSV data
    useEffect(() => {
        const csvData = `year,vmthw,vmtPerVehiclehw,vmtPerCaphw,vmtch,vmtPerVehiclech,vmtPerCapch,vmtpe,vmtPerVehiclepe,vmtPerCappe,vmtche,vmtPerVehicleche,vmtPerCapche,vmtdin,vmtPerVehicledin,vmtPerCapdin,vmtpg,vmtPerVehiclepg,vmtPerCappg
2000,103.93,34.45,19.28,37.72,40.23,24.5,66.21,31.84,17.19,51.04,33.31,21.83,12.93,31.49,21.57,12.17,43.6,28.67
2001,106.43,,19.65,38.49,,24.84,67.93,,17.57,52.38,,22.24,13.29,,22.04,12.49,,29.07
2002,107.98,,19.82,38.65,,24.7,69.34,,17.86,53.56,,22.58,13.49,,22.21,12.58,,28.87
2003,109.66,,20.02,39.29,,24.89,70.37,,18.05,54.26,,22.72,13.62,,22.32,12.72,,28.81
2004,110.95,,20.15,40.33,,25.34,70.62,,18.04,54.5,,22.7,13.67,,22.27,13.01,,29.23
2005,112.27,35.13,20.31,41.14,39.96,25.75,71.13,32.84,18.1,54.82,33.5,22.72,13.7,31.28,22.23,13.37,42.9,30.02
2006,113.34,35.09,20.42,41.8,40.24,26.03,71.55,32.65,18.13,55.14,33.08,22.73,13.64,30.72,22.02,13.2,43.05,29.6
2007,113.38,34.56,20.32,41.32,39.48,25.67,72.06,32.26,18.15,55.68,33.32,22.82,13.84,31.4,22.27,12.89,40.82,28.96
2008,111.22,34.11,19.84,39.88,38.68,24.73,71.33,32,17.86,55.03,32.73,22.43,13.74,31.29,22.04,12.21,39.63,27.5
2009,107.98,33.01,19.17,39.69,38.17,24.58,68.29,30.61,17,52.73,31.46,21.38,13.16,29.5,21.05,12.35,39.24,27.81
2010,107.02,32.87,19,39.52,38.26,24.41,67.5,30.37,16.82,52.38,31.12,21.08,13.13,30.34,20.99,12.45,40.13,27.73
2011,105.63,32.51,18.68,39.36,38.35,24.3,66.28,29.82,16.43,51.64,30.64,20.7,12.95,28.69,20.69,12.27,39.47,27.25
2012,106.77,32.47,18.82,40.52,39.38,25.01,66.25,29.33,16.35,51.32,30.36,20.52,12.7,28.48,20.31,12.78,41.59,28.36
2013,106.32,32.18,18.7,41.3,40.21,25.53,65.02,28.56,15.99,50.61,29.74,20.18,12.72,28.49,20.36,12.79,41.51,28.5
2014,107.25,32.15,18.82,41.29,39.42,25.55,65.96,28.83,16.16,50.91,29.75,20.23,12.74,28.41,20.38,12.83,40.07,28.64
2015,107.8,31.88,18.9,41.8,40.27,25.9,66.01,28.17,16.13,50.75,29.12,20.13,12.67,27.31,20.26,12.73,41.33,28.49
2016,110.32,32.41,19.31,43.14,40.92,26.77,67.18,28.59,16.38,52.04,29.91,20.6,12.87,28.05,20.56,13.46,41.46,30.18
2017,111.45,32.42,19.47,43.56,40.79,27.04,67.89,28.64,16.5,52.55,29.77,20.74,12.86,27.66,20.51,13.61,41.85,30.55
2018,110.82,31.84,19.32,43.16,40.27,26.79,67.66,28.09,16.4,52.41,29.36,20.62,12.88,26.93,20.51,13.52,41.51,30.41
2019,112.01,31.65,19.49,43.98,40.5,27.3,68.03,27.73,16.45,52.78,29.21,20.69,12.98,27.04,20.67,13.81,42.27,31
2020,92.07,25.19,15.64,37.33,33.36,22.31,54.74,21.58,12.99,42.29,22.84,16.18,10.5,21.39,16.25,11.44,34.05,24.79
2021,110.61,29.62,18.77,41.96,36.62,25.05,68.66,26.52,16.28,52.36,27.98,19.92,12.91,26.84,19.95,13.16,38.91,28.35
2022,109.56,29.22,18.64,42.36,37.63,25.24,67.2,25.61,16.01,50.59,26.95,19.23,12.7,25.74,19.68,13.29,40.25,28.51
2023,112.8,30.02,19.19,43.83,37.92,25.99,68.97,26.51,16.45,52.49,27.91,19.87,13.11,26.09,20.3,13.65,38.59,29.09`;

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

    // Change the selected metric
    const changeMetric = (metric) => {
        setSelectedMetric(metric);
    };

    // Toggle view type between trend and comparison
    const toggleViewType = () => {
        setViewType(viewType === 'trend' ? 'comparison' : 'trend');
    };

    // Change selected year for comparison view
    const changeSelectedYear = (year) => {
        setSelectedYear(year);
    };

    // Get column name for a region and metric
    const getColumnName = (region, metric) => {
        return `${metric}${region}`;
    };

    // Format value for display based on metric
    const formatValue = (value, metric) => {
        if (value === null || value === undefined) return 'N/A';

        if (metric === 'vmt') {
            return d3.format(',.1f')(value); // Format VMT as decimal
        } else {
            return d3.format(',.1f')(value); // Format other metrics as decimal
        }
    };

    // Get units for metric
    const getMetricUnits = (metric) => {
        if (metric === 'vmt') {
            return "billion miles";
        } else if (metric === 'vmtPerVehicle') {
            return "thousand miles per vehicle";
        } else {
            return "thousand miles per capita";
        }
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

        // Prepare data for selected regions and metric
        const chartData = data.map(d => {
            const entry = { year: d.year };
            selectedRegions.forEach(region => {
                const columnName = getColumnName(region, selectedMetric);
                entry[region] = d[columnName];
            });
            return entry;
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.year))
            .range([0, width]);

        // Find min and max values for y-scale with some padding
        const allValues = [];
        chartData.forEach(d => {
            selectedRegions.forEach(region => {
                if (d[region] !== null && d[region] !== undefined) {
                    allValues.push(d[region]);
                }
            });
        });

        const minValue = d3.min(allValues) * 0.9;
        const maxValue = d3.max(allValues) * 1.1;

        const yScale = d3.scaleLinear()
            .domain([minValue > 0 ? 0 : minValue, maxValue])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))) // 'd' for integers
            .selectAll('text')
            .style('font-size', '11px');

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => {
                if (selectedMetric === 'vmt') {
                    return d3.format('.0f')(d);
                } else {
                    return d3.format('.0f')(d);
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
            .attr('y', -40)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text(metricMap[selectedMetric]);

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
                .x(d => xScale(d.year))
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
                .attr('cx', d => xScale(d.year))
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
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;">Metric: ${metricMap[selectedMetric]}</div>`;

                selectedRegions.forEach((region, idx) => {
                    if (d[region] !== undefined && d[region] !== null) {
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[idx]}; margin-right: 5px;"></div>
                                <span>${regionMap[region]}: <b>${formatValue(d[region], selectedMetric)}</b></span>
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

    }, [data, selectedRegions, selectedMetric, colors, regionMap, metricMap, getColumnName, formatValue]);

    // Render comparison chart (bar chart for specific year)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0 || !selectedYear) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Get data for the selected year
        const yearData = data.find(d => d.year === selectedYear);
        if (!yearData) return;

        // Set up chart dimensions
        const margin = { top: 30, right: 120, bottom: 60, left: 150 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for all metrics and selected regions
        const chartData = [];

        selectedRegions.forEach(region => {
            const metrics = Object.keys(metricMap);
            metrics.forEach(metric => {
                const columnName = getColumnName(region, metric);
                if (yearData[columnName] !== undefined && yearData[columnName] !== null) {
                    chartData.push({
                        region,
                        regionName: regionMap[region],
                        metric,
                        metricName: metricMap[metric],
                        value: yearData[columnName]
                    });
                }
            });
        });

        // Filter to show only selected metric if there are more than 2 regions
        const filteredData = selectedRegions.length > 2
            ? chartData.filter(d => d.metric === selectedMetric)
            : chartData;

        // Group by region if showing all metrics, or by metric if showing one region
        const groupedData = selectedRegions.length <= 2
            ? _.groupBy(filteredData, 'region')
            : { [selectedMetric]: filteredData };

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.value) * 1.1])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(selectedRegions.length <= 2
                ? selectedRegions
                : selectedRegions.map(r => r))
            .range([0, height])
            .padding(0.3);

        const metricScale = d3.scaleBand()
            .domain(Object.keys(metricMap))
            .range([0, yScale.bandwidth()])
            .padding(0.1);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => {
                if (selectedMetric === 'vmt') {
                    return d3.format('.0f')(d);
                } else {
                    return d3.format('.0f')(d);
                }
            }));

        // Add Y axis with region names
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => regionMap[d]));

        // Add X axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + 35})`)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text(metricMap[selectedMetric]);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Vehicle Miles Traveled Analysis (${selectedYear})`);

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisBottom(xScale)
                .tickSize(height)
                .tickFormat('')
            );

        // Color scale for metrics
        const metricColorScale = d3.scaleOrdinal()
            .domain(Object.keys(metricMap))
            .range(['#4682B4', '#20B2AA', '#CD5C5C']);

        // Draw bars
        if (selectedRegions.length <= 2) {
            // Show all metrics for 1-2 regions
            Object.keys(groupedData).forEach(region => {
                const regionData = groupedData[region];

                svg.selectAll(`.bar-${region}`)
                    .data(regionData)
                    .enter()
                    .append('rect')
                    .attr('class', `bar-${region}`)
                    .attr('y', d => yScale(d.region) + metricScale(d.metric))
                    .attr('x', 0)
                    .attr('height', metricScale.bandwidth())
                    .attr('width', d => xScale(d.value))
                    .attr('fill', d => metricColorScale(d.metric))
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
                                <div><b>${d.regionName}</b></div>
                                <div>${d.metricName}</div>
                                <div>${formatValue(d.value, d.metric)} ${getMetricUnits(d.metric)}</div>
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
                    .attr('y', d => yScale(d.region) + metricScale(d.metric) + metricScale.bandwidth() / 2 + 4)
                    .attr('x', d => xScale(d.value) + 5)
                    .style('font-size', '10px')
                    .style('fill', '#333')
                    .text(d => formatValue(d.value, d.metric));
            });

            // Add a legend for metrics
            const legend = svg.append('g')
                .attr('transform', `translate(${width + 10}, 0)`);

            Object.keys(metricMap).forEach((metric, i) => {
                const g = legend.append('g')
                    .attr('transform', `translate(0, ${i * 20})`);

                g.append('rect')
                    .attr('width', 12)
                    .attr('height', 12)
                    .attr('fill', metricColorScale(metric));

                g.append('text')
                    .attr('x', 20)
                    .attr('y', 10)
                    .style('font-size', '11px')
                    .text(metricMap[metric]);
            });
        } else {
            // Show one metric for 3+ regions
            const metricData = filteredData;

            svg.selectAll('.bar')
                .data(metricData)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('y', d => yScale(d.region))
                .attr('x', 0)
                .attr('height', yScale.bandwidth())
                .attr('width', d => xScale(d.value))
                .attr('fill', (d, i) => colors[selectedRegions.indexOf(d.region)])
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
                            <div><b>${d.regionName}</b></div>
                            <div>${d.metricName}</div>
                            <div>${formatValue(d.value, d.metric)} ${getMetricUnits(d.metric)}</div>
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
                .data(metricData)
                .enter()
                .append('text')
                .attr('class', 'value-label')
                .attr('y', d => yScale(d.region) + yScale.bandwidth() / 2 + 4)
                .attr('x', d => xScale(d.value) + 5)
                .style('font-size', '10px')
                .style('fill', '#333')
                .text(d => formatValue(d.value, d.metric));
        }

    }, [data, selectedRegions, selectedMetric, selectedYear, colors, regionMap, metricMap, getColumnName, formatValue, getMetricUnits]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else {
                renderComparisonChart();
            }
        }
    }, [data, selectedRegions, selectedMetric, selectedYear, viewType, loading, renderTrendChart, renderComparisonChart]);

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading miles traveled data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Vehicle Miles Traveled Analysis</h2>

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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Metric:
                    </label>
                    <select
                        className="w-64 p-2 border border-gray-300 rounded"
                        value={selectedMetric}
                        onChange={(e) => changeMetric(e.target.value)}
                    >
                        {Object.entries(metricMap).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
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
                {viewType === 'comparison' && (
                    <div className="mt-2 text-xs text-gray-600">
                        {selectedRegions.length <= 2
                            ? "With 1-2 regions selected, all metrics are shown"
                            : `With 3+ regions selected, only ${metricMap[selectedMetric]} is shown`}
                    </div>
                )}
            </div>

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About This Data</h3>
                <p className="text-sm text-gray-600 mb-2">
                    Vehicle Miles Traveled (VMT) measures the total distance traveled by all vehicles in a specific region.
                    This data is available in three formats:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li><span className="font-medium">Total VMT:</span> Total annual vehicle miles traveled in billions</li>
                    <li><span className="font-medium">VMT per Vehicle:</span> Average annual miles traveled per registered vehicle (thousands)</li>
                    <li><span className="font-medium">VMT per Capita:</span> Average annual miles traveled per resident (thousands)</li>
                </ul>

                {selectedYear === 2020 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                        <span className="font-medium">COVID-19 Impact:</span> The significant drop in 2020 reflects reduced travel due to pandemic-related restrictions and remote work.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MilesDrivenChart;