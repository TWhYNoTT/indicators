import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// NVD3 visualization for Bridge Conditions with actual data
const BridgeConditionsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('MPO- All');
    const chartRef = useRef(null);

    // Parse the actual Bridge Conditions data
    useEffect(() => {
        // The actual CSV data is now parsed directly
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
            setLoading(false);
        } catch (err) {
            setError(`Error parsing data: ${err.message}`);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (data.length > 0 && !loading) {
            renderChart();
        }
    }, [data, selectedMetric, loading]);

    const renderChart = () => {
        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Format the data for NVD3
        const chartData = [
            {
                key: selectedMetric,
                values: data.map(d => ({ x: d.year, y: d[selectedMetric] })).filter(d => d.y !== null && d.y !== undefined)
            }
        ];

        // Set up chart
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[selectedMetric]) * 1.1]) // 10% padding on top
            .range([height, 0]);

        // Create line
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))); // 'd' for integers

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d3.format('.1%')(d))); // Format as percentage

        // X axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Year');

        // Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Bridge Deficiency Rate');

        // Add the line
        svg.append('path')
            .datum(chartData[0].values)
            .attr('fill', 'none')
            .attr('stroke', '#008485') // DVRPC teal color
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add dots
        svg.selectAll('.dot')
            .data(chartData[0].values)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 4)
            .attr('fill', '#008485');

        // Add hover dots with values
        const focus = svg.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('circle')
            .attr('r', 5)
            .attr('fill', '#008485');

        focus.append('rect')
            .attr('class', 'tooltip')
            .attr('width', 120)
            .attr('height', 50)
            .attr('x', 10)
            .attr('y', -22)
            .attr('rx', 4)
            .attr('ry', 4)
            .style('fill', 'white')
            .style('stroke', '#008485')
            .style('opacity', 0.9);

        focus.append('text')
            .attr('class', 'tooltip-year')
            .attr('x', 18)
            .attr('y', -2)
            .style('font-size', '12px')
            .style('fill', '#333');

        focus.append('text')
            .attr('class', 'tooltip-value')
            .attr('x', 18)
            .attr('y', 18)
            .style('font-size', '12px')
            .style('fill', '#333');

        // Overlay for mouse move events
        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .style('opacity', 0)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', mousemove);

        function mousemove(event) {
            const bisect = d3.bisector(d => d.x).left;
            const x0 = xScale.invert(d3.pointer(event)[0]);
            const i = bisect(chartData[0].values, x0, 1);
            const d0 = chartData[0].values[i - 1];
            const d1 = chartData[0].values[i];

            if (!d0 || !d1) return;

            const d = x0 - d0.x > d1.x - x0 ? d1 : d0;

            focus.attr('transform', `translate(${xScale(d.x)},${yScale(d.y)})`);
            focus.select('.tooltip-year').text(`Year: ${d.x}`);
            focus.select('.tooltip-value').text(`Deficiency: ${d3.format('.1%')(d.y)}`);
        }
    };

    // Get unique columns for the dropdown
    const getMetricOptions = () => {
        if (data.length === 0) return [];

        // Get all column names except 'year'
        return Object.keys(data[0])
            .filter(key => key !== 'year')
            .map(key => ({
                value: key,
                label: key.replace('-', ': ')
            }));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading bridge conditions data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Bridge Deficiency Rates Over Time</h2>

            <div className="mb-4">
                <label htmlFor="metric-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Jurisdiction/Bridge Type:
                </label>
                <select
                    id="metric-select"
                    className="border border-gray-300 rounded-md p-2 w-full max-w-md"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                >
                    {getMetricOptions().map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="chart-container mt-6" ref={chartRef}></div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">About This Data</h3>
                <p className="text-sm text-gray-600 mb-2">
                    The Bridge Deficiency Rate measures the percentage of bridges that are classified as structurally
                    deficient. Lower values represent better bridge conditions in the region.
                </p>
                <p className="text-sm text-gray-600">
                    From 2000 to 2023, the overall trend shows an improvement (reduction) in bridge deficiency rates
                    across most jurisdictions, indicating infrastructure improvements over time.
                </p>
            </div>

            <div className="mt-4 text-sm text-gray-500">

                <p>Note: Lower values indicate better bridge conditions (fewer deficient bridges)</p>
            </div>
        </div>
    );
};

export default BridgeConditionsChart;