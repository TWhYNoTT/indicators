import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom tooltip component for multi-selection
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
            <p className="font-semibold text-gray-700 mb-2">{`Year: ${label}`}</p>
            <div>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center mb-1">
                        <div
                            className="w-3 h-3 mr-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <p className="text-sm">
                            <span className="font-medium">{entry.name}:</span>{' '}
                            <span className="text-gray-700">{entry.value.toFixed(4)} {entry.unit}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AirQualityTrends = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedParameters, setSelectedParameters] = useState([]);
    const [selectedCounties, setSelectedCounties] = useState(['All']);
    const [availableParameters, setAvailableParameters] = useState([]);
    const [availableCounties, setAvailableCounties] = useState(['All']);
    const [chartData, setChartData] = useState([]);

    // Colors for different pollutants and counties
    const POLLUTANT_COLORS = {
        'Ozone': '#8884d8',
        'PM2.5 - Local Conditions': '#ff5252',
        'Sulfur dioxide': '#ffc658',
        'Nitrogen dioxide (NO2)': '#4caf50',
        'Carbon monoxide': '#2196f3'
    };

    const COUNTY_COLORS = {
        'All': '#000000',
        'Richmond City': '#e6194B',
        'Charles': '#3cb44b',
        'Henrico': '#ffe119',
        'Caroline': '#4363d8',
        'Chesterfield': '#f58231',
        'Hanover': '#911eb4',
        // Add more county colors as needed
    };

    useEffect(() => {
        // Load data from your JSON file
        fetch(`${process.env.PUBLIC_URL}/data/richmond_air_trends.json`)
            .then(response => response.json())
            .then(jsonData => {
                setData(jsonData);

                // Extract unique parameters
                const params = jsonData.map(item => item.parameter);
                setAvailableParameters(params);

                // Select first parameter by default
                setSelectedParameters([params[0]]);

                // Extract unique counties
                const counties = new Set();
                counties.add('All');

                jsonData.forEach(param => {
                    param.county_data?.forEach(item => {
                        if (item.county) counties.add(item.county);
                    });
                });

                setAvailableCounties(Array.from(counties));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                setLoading(false);
            });
    }, []);

    // Prepare chart data when selections change
    useEffect(() => {
        if (!data.length || !selectedParameters.length || !selectedCounties.length) {
            setChartData([]);
            return;
        }

        // Start with all years from all selected parameters
        const yearMap = {};

        // For each selected parameter
        selectedParameters.forEach(paramName => {
            const paramData = data.find(d => d.parameter === paramName);
            if (!paramData) return;

            const showAllCounties = selectedCounties.includes('All');

            // If "All" counties selected, use yearly averages
            if (showAllCounties) {
                paramData.yearly_averages.forEach(item => {
                    const year = item.year;
                    if (!yearMap[year]) yearMap[year] = { year };

                    yearMap[year][`${paramName} (All)`] = item.value;
                    // Store unit for tooltip
                    yearMap[year][`${paramName} (All)_unit`] = paramData.unit;
                });
            }

            // For specific counties
            const countiesToShow = showAllCounties ? [] : selectedCounties;

            if (countiesToShow.length > 0) {
                // Group county data by year and county
                const countyYearData = {};

                paramData.county_data.forEach(item => {
                    if (countiesToShow.includes(item.county)) {
                        const key = `${item.year}_${item.county}`;
                        if (!countyYearData[key]) {
                            countyYearData[key] = {
                                year: item.year,
                                county: item.county,
                                values: [],
                                count: 0
                            };
                        }

                        if (item.value !== null && !isNaN(item.value)) {
                            countyYearData[key].values.push(item.value);
                            countyYearData[key].count++;
                        }
                    }
                });

                // Calculate average for each county/year
                Object.values(countyYearData).forEach(data => {
                    const year = data.year;
                    const county = data.county;
                    if (!yearMap[year]) yearMap[year] = { year };

                    if (data.values.length > 0) {
                        const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
                        yearMap[year][`${paramName} (${county})`] = avg;
                        // Store unit for tooltip
                        yearMap[year][`${paramName} (${county})_unit`] = paramData.unit;
                    }
                });
            }
        });

        // Convert to array and sort by year
        const result = Object.values(yearMap).sort((a, b) => a.year - b.year);
        setChartData(result);
    }, [data, selectedParameters, selectedCounties]);

    const toggleParameter = (param) => {
        setSelectedParameters(prev => {
            if (prev.includes(param)) {
                return prev.filter(p => p !== param);
            } else {
                return [...prev, param];
            }
        });
    };

    const toggleCounty = (county) => {
        setSelectedCounties(prev => {
            // If selecting "All", deselect others
            if (county === 'All') {
                return prev.includes('All') ? [] : ['All'];
            }

            // If selecting a specific county, remove "All"
            let newSelection = prev.filter(c => c !== 'All');

            // Toggle the selected county
            if (newSelection.includes(county)) {
                newSelection = newSelection.filter(c => c !== county);
            } else {
                newSelection = [...newSelection, county];
            }

            // If nothing selected, default to "All"
            return newSelection.length ? newSelection : ['All'];
        });
    };

    const resetSelections = () => {
        if (availableParameters.length) {
            setSelectedParameters([availableParameters[0]]);
        }
        setSelectedCounties(['All']);
    };

    // Generate dynamic lines for the chart
    const generateLines = () => {
        const lines = [];

        selectedParameters.forEach(param => {
            const baseColor = POLLUTANT_COLORS[param] || '#999';

            if (selectedCounties.includes('All')) {
                lines.push(
                    <Line
                        key={`${param}-All`}
                        type="monotone"
                        dataKey={`${param} (All)`}
                        name={`${param} (All)`}
                        stroke={baseColor}
                        unit={data.find(p => p.parameter === param)?.unit || ''}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                    />
                );
            } else {
                selectedCounties.forEach((county, index) => {
                    const countyColor = COUNTY_COLORS[county] || baseColor;
                    // Adjust color shade based on index if needed
                    const color = index > 0 ?
                        `${countyColor}${Math.floor(80 + (index * 10)).toString(16)}` :
                        countyColor;

                    lines.push(
                        <Line
                            key={`${param}-${county}`}
                            type="monotone"
                            dataKey={`${param} (${county})`}
                            name={`${param} (${county})`}
                            stroke={color}
                            unit={data.find(p => p.parameter === param)?.unit || ''}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            connectNulls={true}
                        />
                    );
                });
            }
        });

        return lines;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Richmond, Virginia CBSA Air Quality Trends</h2>
                <p className="text-center text-gray-600 mb-6">Core Based Statistical Area (CBSA) Code: 40060</p>

                {/* Selection Section: Air Pollutant Type */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Air Pollutant:</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableParameters.map(param => (
                            <button
                                key={param}
                                onClick={() => toggleParameter(param)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                  ${selectedParameters.includes(param)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {param}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selection Section: Location to Compare */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Select Location to Compare:</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableCounties.map(county => (
                            <button
                                key={county}
                                onClick={() => toggleCounty(county)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                  ${selectedCounties.includes(county)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {county}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    onClick={resetSelections}
                    className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                >
                    Reset to Default Selection
                </button>
            </div>

            {/* Chart Section */}
            {chartData.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis
                                dataKey="year"
                                label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
                            />
                            <YAxis
                                label={{
                                    value: selectedParameters.length === 1
                                        ? `Annual Average (${data.find(p => p.parameter === selectedParameters[0])?.unit || ''})`
                                        : 'Annual Average',
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {generateLines()}
                        </LineChart>
                    </ResponsiveContainer>

                    <div className="mt-4 text-sm text-gray-600">
                        {selectedParameters.length > 0 && selectedCounties.length > 0 ? (
                            <p>
                                Showing data for: {selectedParameters.join(', ')} in {selectedCounties.join(', ')}
                            </p>
                        ) : (
                            <p>Please select at least one pollutant and location to display data.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-600">
                    No data available for the selected combination. Please adjust your selection.
                </div>
            )}
        </div>
    );
};

export default AirQualityTrends; 