import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const CommuteModeChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegions, setSelectedRegions] = useState(['hw']);
    const [selectedMode, setSelectedMode] = useState('sov');
    const [viewType, setViewType] = useState('trend'); // 'trend' or 'comparison'
    const chartRef = useRef(null);

    // Color scale for regions
    const colors = ['#008485', '#d97706', '#be123c', '#1d4ed8', '#15803d', '#7c3aed'];

    // Region codes and their full names
    const regionMap = {
        'hw': 'Regional Average',
        'ch': 'Colonial Heights',
        'pe': 'Petersburg',
        'din': 'Dinwiddie',
        'che': 'Chesterfield',
        'pg': 'Prince George'
    };

    // Mode codes and their full names
    const modeMap = {
        'sov': 'Drive Alone (SOV)',
        'nonsov': 'All Non-SOV Modes',
        'pool': 'Carpool',
        'transit': 'All Transit',
        'bus': 'Bus',
        'rail': 'Rail',
        'walk': 'Walking',
        'bike': 'Biking',
        'wfh': 'Work From Home'
    };

    // Use embedded CSV data
    useEffect(() => {
        try {
            // Embedded CSV data
            const csvData = `year,hwsov,hwnonsov,hwpool,hwtransit,hwbus,hwrail,hwsubw,hwtroll,hwferry,hwwalk,hwbike,hwtmo,hwtaxi,hwmcyc,hwother,hwwfh,chsov,chnonsov,chpool,chtransit,chbus,chrail,chsubw,chtroll,chferry,chwalk,chbike,chtmo,chtaxi,chmcyc,chother,chwfh,pesov,penonsov,pepool,petransit,pebus,perail,pesubw,petroll,peferry,pewalk,pebike,petmo,petaxi,pemcyc,peother,pewfh,dinsov,dinnonsov,dinpool,dintransit,dinbus,dinrail,dinsubw,dintroll,dinferry,dinwalk,dinbike,dintmo,dintaxi,dinmcyc,dinother,dinwfh,chesov,chenonsov,chepool,chetransit,chebus,cherail,chesubw,chetroll,cheferry,chewalk,chebike,chetmo,chetaxi,chemcyc,cheother,chewfh,pgsov,pgnonsov,pgpool,pgtransit,pgbus,pgrail,pgsubw,pgtroll,pgferry,pgwalk,pgbike,pgtmo,pgtaxi,pgmcyc,pgother,pgwfh
2006,0.823,0.177,0.085,0.031,0.014,0.01,0.007,0.001,0,0.021,0.002,0.008,0.001,0.001,0.006,0.029,0.748,0.252,0.108,0.08,0.041,0.016,0.021,0.001,0.001,0.022,0.002,0.01,0.002,0.001,0.008,0.031,0.854,0.146,0.075,0.026,0.018,0.004,0.004,0,0,0.015,0.002,0.003,0,0.001,0.002,0.025,0.73,0.27,0.096,0.076,0.031,0.04,0.004,0,0,0.045,0.009,0.011,0,0.001,0.01,0.034,0.828,0.172,0.084,0.026,0.006,0.019,0.001,0,0,0.022,0.001,0.005,0,0.001,0.004,0.034,0.805,0.195,0.082,0.025,0.009,0.015,0.001,0,0,0.024,0.001,0.012,0.001,0.002,0.009,0.052
2007,0.823,0.177,0.083,0.033,0.012,0.012,0.009,0,0,0.012,0.003,0.01,0.001,0.001,0.008,0.036,0.75,0.25,0.108,0.081,0.035,0.019,0.027,0,0,0.024,0.003,0.006,0.001,0,0.005,0.027,0.819,0.181,0.093,0.027,0.015,0.006,0.006,0,0,0.021,0,0.004,0,0,0.003,0.036,0.726,0.274,0.11,0.068,0.028,0.037,0.002,0.001,0,0.037,0.005,0.019,0.004,0,0.015,0.035,0.831,0.169,0.077,0.028,0.004,0.022,0.002,0,0,0.019,0.002,0.004,0,0.001,0.004,0.04,0.808,0.192,0.083,0.025,0.006,0.016,0.002,0,0,0.023,0.001,0.005,0.001,0.001,0.004,0.055
2008,0.818,0.182,0.094,0.032,0.013,0.013,0.006,0,0,0.011,0.002,0.009,0.001,0.001,0.007,0.035,0.753,0.247,0.108,0.076,0.032,0.017,0.026,0.001,0,0.023,0.003,0.012,0.003,0,0.008,0.026,0.833,0.167,0.086,0.021,0.014,0.004,0.003,0,0,0.017,0.002,0.011,0,0.001,0.01,0.029,0.708,0.292,0.107,0.07,0.027,0.039,0.004,0,0,0.037,0.009,0.022,0.005,0.001,0.017,0.046,0.816,0.184,0.082,0.03,0.006,0.021,0.002,0,0,0.015,0.002,0.007,0,0.001,0.005,0.048,0.814,0.186,0.075,0.027,0.006,0.019,0.002,0.001,0,0.022,0.002,0.009,0,0.002,0.007,0.05
2009,0.812,0.188,0.068,0.029,0.011,0.013,0.005,0,0,0.019,0.002,0.008,0,0,0.007,0.062,0.764,0.236,0.093,0.078,0.031,0.014,0.032,0.001,0,0.017,0.004,0.015,0.002,0.001,0.011,0.029,0.826,0.174,0.084,0.033,0.014,0.009,0.01,0,0,0.012,0,0.009,0,0.001,0.008,0.036,0.717,0.283,0.106,0.068,0.029,0.034,0.003,0.002,0.001,0.037,0.007,0.02,0.003,0,0.017,0.045,0.831,0.169,0.077,0.029,0.003,0.023,0.003,0,0,0.015,0.003,0.007,0.001,0.001,0.004,0.038,0.824,0.176,0.068,0.031,0.009,0.021,0.002,0,0,0.017,0.005,0.007,0,0,0.007,0.048
2010,0.828,0.172,0.08,0.035,0.011,0.02,0.004,0,0,0.011,0.003,0.007,0,0,0.007,0.035,0.781,0.219,0.083,0.081,0.039,0.016,0.026,0,0,0.018,0.001,0.009,0,0,0.009,0.027,0.861,0.139,0.073,0.022,0.012,0.004,0.005,0,0,0.013,0,0.007,0,0,0.006,0.026,0.693,0.307,0.109,0.077,0.032,0.04,0.004,0,0.001,0.05,0.006,0.016,0.002,0,0.014,0.049,0.835,0.165,0.074,0.027,0.004,0.021,0.002,0,0,0.015,0.001,0.004,0.001,0,0.003,0.043,0.809,0.191,0.068,0.026,0.006,0.019,0.002,0,0,0.024,0.001,0.011,0,0.001,0.01,0.061
2011,0.82,0.18,0.075,0.034,0.011,0.017,0.005,0.002,0,0.018,0.003,0.006,0,0.002,0.004,0.044,0.763,0.237,0.088,0.089,0.038,0.018,0.032,0.001,0,0.015,0.002,0.006,0.001,0,0.005,0.036,0.863,0.137,0.066,0.02,0.01,0.006,0.004,0,0,0.016,0.002,0.011,0,0,0.011,0.021,0.719,0.281,0.09,0.081,0.032,0.046,0.003,0,0,0.045,0.004,0.015,0.004,0,0.012,0.046,0.812,0.188,0.08,0.033,0.005,0.023,0.004,0,0,0.019,0.002,0.007,0.001,0.001,0.005,0.047,0.813,0.187,0.067,0.027,0.007,0.019,0.001,0,0,0.02,0.001,0.008,0,0.001,0.007,0.064
2012,0.824,0.176,0.078,0.036,0.016,0.014,0.006,0,0,0.012,0.004,0.007,0,0.001,0.006,0.039,0.768,0.232,0.096,0.079,0.031,0.014,0.034,0,0,0.016,0.001,0.007,0,0,0.007,0.033,0.852,0.148,0.071,0.016,0.008,0.003,0.004,0,0,0.02,0.001,0.01,0,0,0.01,0.03,0.735,0.265,0.084,0.073,0.028,0.042,0.002,0.001,0,0.029,0.009,0.012,0.003,0,0.009,0.058,0.817,0.183,0.077,0.032,0.004,0.024,0.003,0,0,0.019,0.002,0.006,0,0.001,0.005,0.047,0.81,0.19,0.05,0.029,0.008,0.021,0.001,0,0,0.039,0.002,0.006,0,0.001,0.005,0.064
2013,0.844,0.156,0.056,0.034,0.011,0.015,0.007,0,0,0.015,0.004,0.008,0,0.001,0.007,0.038,0.769,0.231,0.077,0.082,0.034,0.015,0.03,0.001,0,0.027,0.002,0.01,0.001,0,0.009,0.033,0.865,0.135,0.067,0.018,0.009,0.004,0.004,0.001,0,0.015,0.005,0.005,0,0,0.005,0.023,0.704,0.296,0.102,0.082,0.04,0.04,0.002,0,0,0.025,0.01,0.026,0.002,0,0.025,0.051,0.822,0.178,0.072,0.029,0.005,0.022,0.003,0,0,0.018,0.003,0.008,0,0.002,0.006,0.049,0.799,0.201,0.059,0.032,0.007,0.024,0.001,0,0,0.043,0.001,0.005,0,0,0.004,0.062
2014,0.837,0.163,0.074,0.035,0.014,0.016,0.005,0,0,0.011,0.003,0.006,0,0.001,0.005,0.033,0.776,0.224,0.093,0.064,0.028,0.009,0.026,0.001,0,0.025,0.002,0.01,0.001,0.001,0.009,0.03,0.849,0.151,0.065,0.022,0.015,0.002,0.004,0.001,0,0.011,0.006,0.008,0,0.002,0.006,0.04,0.712,0.288,0.111,0.078,0.03,0.044,0.003,0.001,0,0.026,0.007,0.005,0.002,0,0.003,0.061,0.816,0.184,0.082,0.03,0.006,0.022,0.001,0,0,0.018,0.002,0.005,0,0.001,0.004,0.047,0.777,0.223,0.083,0.03,0.005,0.023,0.002,0,0,0.038,0.003,0.01,0,0.001,0.008,0.059
2015,0.835,0.165,0.078,0.034,0.008,0.017,0.008,0,0,0.014,0,0.008,0,0,0.008,0.031,0.776,0.224,0.081,0.074,0.029,0.015,0.029,0,0,0.022,0.001,0.012,0.003,0.001,0.008,0.034,0.863,0.137,0.064,0.021,0.012,0.004,0.004,0,0,0.013,0.001,0.01,0,0.001,0.009,0.029,0.741,0.259,0.081,0.089,0.035,0.05,0.003,0.001,0,0.037,0.005,0.006,0.001,0.001,0.004,0.04,0.815,0.185,0.074,0.037,0.003,0.031,0.002,0,0,0.021,0.001,0.006,0.001,0,0.004,0.046,0.806,0.194,0.069,0.024,0.007,0.015,0.002,0,0,0.027,0.002,0.006,0,0.001,0.005,0.066
2016,0.83,0.17,0.076,0.029,0.008,0.016,0.005,0,0,0.014,0.001,0.008,0,0.002,0.006,0.043,0.745,0.255,0.117,0.075,0.027,0.017,0.029,0.001,0,0.015,0.002,0.012,0.001,0,0.011,0.034,0.854,0.146,0.055,0.028,0.015,0.004,0.008,0.001,0,0.012,0.001,0.012,0.001,0.001,0.009,0.039,0.707,0.293,0.109,0.075,0.021,0.05,0.004,0,0,0.039,0.005,0.014,0.007,0,0.006,0.051,0.821,0.179,0.065,0.036,0.006,0.027,0.001,0,0.002,0.017,0.003,0.006,0,0.001,0.005,0.053,0.78,0.22,0.067,0.03,0.005,0.022,0.003,0,0.001,0.03,0.001,0.009,0,0,0.008,0.084
2017,0.821,0.179,0.069,0.035,0.01,0.015,0.009,0.001,0.001,0.017,0.002,0.01,0.001,0.003,0.006,0.046,0.762,0.238,0.084,0.076,0.024,0.016,0.035,0.001,0,0.02,0.004,0.012,0.003,0,0.009,0.043,0.854,0.146,0.062,0.023,0.009,0.005,0.009,0,0,0.009,0.001,0.012,0.004,0,0.008,0.041,0.693,0.307,0.115,0.076,0.021,0.048,0.006,0,0,0.045,0.004,0.011,0.006,0,0.005,0.056,0.82,0.18,0.061,0.03,0.004,0.024,0.002,0,0,0.022,0.002,0.006,0,0,0.006,0.06,0.792,0.208,0.074,0.027,0.005,0.021,0.001,0,0,0.022,0.001,0.005,0.002,0,0.004,0.079
2018,0.83,0.17,0.069,0.036,0.008,0.017,0.01,0,0,0.007,0.002,0.011,0.002,0.001,0.009,0.045,0.757,0.243,0.082,0.078,0.03,0.02,0.028,0,0,0.018,0.003,0.02,0.007,0.001,0.012,0.042,0.83,0.17,0.08,0.02,0.009,0.004,0.007,0,0,0.012,0.001,0.012,0,0,0.012,0.045,0.682,0.318,0.137,0.067,0.018,0.046,0.002,0.002,0,0.048,0.004,0.014,0.01,0,0.004,0.049,0.827,0.173,0.058,0.033,0.004,0.027,0.002,0,0,0.012,0.001,0.004,0.001,0,0.002,0.064,0.805,0.195,0.056,0.025,0.005,0.019,0.001,0,0,0.019,0.002,0.007,0,0,0.006,0.086
2019,0.818,0.182,0.083,0.031,0.005,0.014,0.007,0.004,0,0.008,0.002,0.009,0.002,0,0.006,0.05,0.767,0.233,0.101,0.065,0.022,0.015,0.024,0.004,0,0.015,0.002,0.011,0.004,0,0.006,0.038,0.809,0.191,0.082,0.024,0.01,0.007,0.006,0.001,0,0.015,0.007,0.01,0.001,0,0.009,0.054,0.703,0.297,0.105,0.077,0.013,0.061,0,0.002,0,0.044,0.003,0.009,0.002,0.001,0.005,0.06,0.812,0.188,0.066,0.028,0.004,0.021,0.001,0.002,0,0.013,0.001,0.007,0.002,0,0.005,0.072,0.773,0.227,0.079,0.026,0.005,0.019,0.002,0.001,0,0.02,0.001,0.012,0.001,0,0.011,0.089
2021,0.72,0.28,0.057,0.01,0.002,0.004,0.001,0.003,0,0.01,0.002,0.012,0.003,0,0.008,0.19,0.659,0.341,0.082,0.032,0.016,0.005,0.008,0.003,0,0.017,0.001,0.014,0.005,0,0.009,0.194,0.745,0.255,0.049,0.01,0.004,0.003,0.003,0,0,0.008,0.001,0.008,0,0,0.008,0.179,0.565,0.435,0.075,0.034,0.018,0.013,0.002,0,0,0.023,0.003,0.019,0.006,0,0.012,0.28,0.679,0.321,0.056,0.01,0.003,0.007,0,0,0,0.008,0.002,0.011,0,0,0.011,0.234,0.612,0.388,0.056,0.005,0.001,0.003,0,0,0,0.019,0.001,0.015,0,0,0.015,0.291
2022,0.724,0.276,0.076,0.026,0.003,0.014,0.007,0.002,0,0.008,0.001,0.014,0.001,0.001,0.013,0.151,0.658,0.342,0.104,0.044,0.018,0.007,0.017,0.002,0,0.023,0.002,0.022,0.011,0.001,0.011,0.147,0.743,0.257,0.069,0.016,0.006,0.004,0.002,0.005,0,0.018,0.002,0.015,0.001,0.001,0.014,0.136,0.596,0.404,0.099,0.039,0.01,0.026,0.002,0.001,0,0.044,0.019,0.015,0.004,0,0.011,0.189,0.7,0.3,0.061,0.019,0.003,0.014,0.001,0,0,0.011,0.002,0.014,0.002,0.001,0.011,0.194,0.663,0.337,0.061,0.015,0.002,0.01,0.001,0.001,0,0.023,0.001,0.015,0.001,0.001,0.014,0.222
2023,0.762,0.238,0.047,0.019,0.003,0.008,0.006,0.003,0,0.006,0.003,0.006,0.001,0,0.005,0.156,0.703,0.297,0.086,0.047,0.017,0.011,0.015,0.003,0,0.015,0.003,0.015,0.005,0,0.01,0.131,0.768,0.232,0.072,0.009,0.004,0.003,0.002,0,0,0.008,0.001,0.007,0.001,0.001,0.005,0.134,0.601,0.399,0.088,0.058,0.014,0.037,0.003,0.005,0,0.038,0.01,0.045,0.013,0.002,0.03,0.159,0.707,0.293,0.067,0.024,0.004,0.016,0.002,0.001,0,0.013,0.003,0.01,0.001,0,0.009,0.176,0.647,0.353,0.086,0.017,0.002,0.012,0.003,0,0,0.019,0,0.017,0,0.001,0.016,0.213`;

            // Parse CSV data
            const parsedData = d3.csvParse(csvData, row => {
                const transformedRow = { year: +row.year };

                // Process each column
                Object.keys(row).forEach(key => {
                    if (key !== 'year') {
                        // Convert values to numbers (handling empty strings)
                        transformedRow[key] = row[key] === '' ? null : +row[key];
                    }
                });

                return transformedRow;
            });

            // Filter out rows with null year (the 2020 data row appears empty)
            const filteredData = parsedData.filter(d => !isNaN(d.year));

            setData(filteredData);
            setLoading(false);
        } catch (err) {
            setError(`Error processing data: ${err.message}`);
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

    // Change the selected commute mode
    const changeMode = (mode) => {
        setSelectedMode(mode);
    };

    // Toggle view type between trend and comparison
    const toggleViewType = () => {
        setViewType(viewType === 'trend' ? 'comparison' : 'trend');
    };

    // Render trend chart (line chart over time)
    const renderTrendChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Set up chart dimensions
        const margin = { top: 20, right: 80, bottom: 50, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for selected regions and mode
        const chartData = data.map(d => {
            const entry = { year: d.year };
            selectedRegions.forEach(region => {
                const columnName = `${region}${selectedMode}`;
                entry[region] = d[columnName];
            });
            return entry;
        });

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(chartData, d => d.year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => {
                return d3.max(selectedRegions.map(region => d[region] || 0));
            }) * 1.1]) // 10% padding on top
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
            .attr('transform', `translate(${width / 2},${height + 35})`)
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
            .text(`${modeMap[selectedMode]} Rate`);

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

            // Filter out null values
            const validData = chartData.filter(d => d[region] !== null && d[region] !== undefined);

            // Add the line
            svg.append('path')
                .datum(validData)
                .attr('fill', 'none')
                .attr('stroke', colors[i])
                .attr('stroke-width', 2)
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
            .attr('transform', `translate(${width + 5}, 0)`);

        selectedRegions.forEach((region, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);

            g.append('line')
                .attr('x1', 0)
                .attr('y1', 10)
                .attr('x2', 20)
                .attr('y2', 10)
                .attr('stroke', colors[i])
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

                selectedRegions.forEach((region, idx) => {
                    if (d[region] !== undefined && d[region] !== null) {
                        tooltipContent += `
                            <div style="display: flex; align-items: center; margin-top: 3px;">
                                <div style="width: 8px; height: 8px; background: ${colors[idx]}; margin-right: 5px;"></div>
                                <span>${regionMap[region]}: ${d3.format('.1%')(d[region])}</span>
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

    }, [data, selectedRegions, selectedMode, colors, regionMap, modeMap]);

    // Render comparison chart (bar chart for specific year)
    const renderComparisonChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Get most recent year with data
        const latestYear = d3.max(data, d => d.year);
        const latestData = data.find(d => d.year === latestYear);

        if (!latestData) return;

        // Set up chart dimensions
        const margin = { top: 20, right: 80, bottom: 80, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Prepare data for selected mode across all regions
        const chartData = selectedRegions.map(region => {
            return {
                region,
                name: regionMap[region],
                value: latestData[`${region}${selectedMode}`]
            };
        }).filter(d => d.value !== null && d.value !== undefined);

        // Sort data by value
        chartData.sort((a, b) => b.value - a.value);

        // Set up scales
        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.region))
            .range([0, width])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value) * 1.1])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d => regionMap[d]))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d3.format('.1%')(d)));

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text(`${modeMap[selectedMode]} Rate`);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`${modeMap[selectedMode]} Rate by Region (${latestYear})`);

        // Add grid lines
        svg.append('g')
            .attr('class', 'grid')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Create bars
        svg.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.region))
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.value))
            .attr('fill', (d, i) => colors[selectedRegions.indexOf(d.region)])
            .on('mouseover', function (event, d) {
                // Show tooltip on hover
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
                        <div>${d.name}</div>
                        <div>${modeMap[selectedMode]}: ${d3.format('.1%')(d.value)}</div>
                    `);
            })
            .on('mouseout', function () {
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
            .text(d => d3.format('.1%')(d.value));

    }, [data, selectedRegions, selectedMode, colors, regionMap, modeMap]);

    // Render chart when data or selections change
    useEffect(() => {
        if (data.length > 0 && !loading) {
            if (viewType === 'trend') {
                renderTrendChart();
            } else {
                renderComparisonChart();
            }
        }
    }, [data, selectedRegions, selectedMode, viewType, loading, renderTrendChart, renderComparisonChart]);

    // Get unique transport modes for selection
    const getTransportModes = () => {
        if (data.length === 0) return [];

        // Get column names from the first data row
        const allColumns = Object.keys(data[0]).filter(key => key !== 'year');

        // Extract unique mode suffixes
        const modes = new Set();
        allColumns.forEach(col => {
            // Extract the mode part (after the region code)
            const regionCode = Object.keys(regionMap).find(code => col.startsWith(code));
            if (regionCode) {
                const mode = col.substring(regionCode.length);
                if (modeMap[mode]) {
                    modes.add(mode);
                }
            }
        });

        return Array.from(modes).map(mode => ({
            value: mode,
            label: modeMap[mode] || mode
        }));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading commute mode data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Commute Mode Analysis</h2>

            <div className="mb-4 flex flex-wrap gap-4">
                <div className="w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transportation Mode:
                    </label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedMode}
                        onChange={(e) => changeMode(e.target.value)}
                    >
                        {getTransportModes().map(mode => (
                            <option key={mode.value} value={mode.value}>
                                {mode.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-64">
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
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Regions:
                </label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(regionMap).map(region => (
                        <button
                            key={region}
                            className={`px-3 py-1 rounded-full ${selectedRegions.includes(region)
                                ? `bg-${colors[selectedRegions.indexOf(region)].replace('#', '')} text-white`
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            onClick={() => toggleRegion(region)}
                            style={{ backgroundColor: selectedRegions.includes(region) ? colors[selectedRegions.indexOf(region)] : '' }}
                        >
                            {regionMap[region]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container border border-gray-200 rounded p-4 bg-gray-50" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About This Data</h3>
                <p className="text-sm text-gray-600">
                    This visualization shows transportation mode trends from 2006 to 2023 across different regions.
                    The data represents the percentage of commuters using each transportation mode.
                </p>
                {selectedMode === 'wfh' && (
                    <p className="text-sm text-gray-600 mt-2">
                        <strong>Note:</strong> The significant increase in Work From Home rates after 2019
                        reflects the impact of the COVID-19 pandemic on commuting patterns.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CommuteModeChart;