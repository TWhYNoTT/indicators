import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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
                            <span className="text-gray-700">{parseFloat(entry.value).toFixed(2)} Rating</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BridgeConditionTrend = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [selectedCounties, setSelectedCounties] = useState(['All']);
    const [countyOptions, setCountyOptions] = useState([]);
    const [trendData, setTrendData] = useState([]);

    // Condition options for tabs
    const conditionOptions = [
        { id: 'overall', label: 'Overall Condition' },
        { id: 'deck', label: 'Deck Condition' },
        { id: 'super', label: 'Superstructure Condition' },
        { id: 'sub', label: 'Substructure Condition' }
    ];

    // Colors for different conditions and counties
    const CONDITION_COLORS = {
        'overall': '#8884d8',
        'deck': '#ff5252',
        'super': '#ffc658',
        'sub': '#4caf50'
    };

    const COUNTY_COLORS = {
        'All': '#000000',
        'Charles City County': '#e6194B',
        'Chesterfield County': '#3cb44b',
        'Goochland County': '#ffe119',
        'Hanover County': '#4363d8',
        'Henrico County': '#f58231',
        'New Kent County': '#911eb4',
        'Powhatan County': '#42d4f4',
        'Richmond City': '#f032e6'
    };

    // Helper function: if a value is missing, empty, or "N", ignore that record
    const isValidCondition = (value) => {
        if (!value) return false;
        const trimmed = value.toString().trim();
        return trimmed !== "" && trimmed.toUpperCase() !== "N" && !isNaN(parseFloat(trimmed));
    };

    // Parse a valid condition value
    const parseCondition = (value) => parseFloat(value.toString().trim());

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.PUBLIC_URL}/data/richmond_cbsa_bridge_conditions.json`);
                const jsonData = await response.json();
                const records = jsonData.data || [];
                setRawData(records);

                // Get unique county names from metadata if available, or derive from data
                if (jsonData.metadata && jsonData.metadata.county_names) {
                    setCountyOptions(jsonData.metadata.county_names);
                } else {
                    const counties = Array.from(new Set(records.map(r => r.COUNTY_NAME).filter(Boolean)));
                    setCountyOptions(counties);
                }

                // Select first condition by default
                setSelectedConditions([conditionOptions[0].id]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to update aggregated trend data based on filters
    const updateTrendData = () => {
        if (!rawData.length || !selectedConditions.length || !selectedCounties.length) {
            setTrendData([]);
            return;
        }

        // Start with all years
        const yearMap = {};

        // Process each selected condition
        selectedConditions.forEach(condition => {
            const showAllCounties = selectedCounties.includes('All');

            // If "All" counties selected, calculate yearly averages
            if (showAllCounties) {
                // Group data by year for overall averages
                const yearData = {};

                rawData.forEach(record => {
                    const year = record.YEAR;

                    // Process different condition fields based on selected condition
                    let conditionValue = null;
                    let isValid = false;

                    switch (condition) {
                        case 'deck':
                            isValid = isValidCondition(record.DECK_COND_058);
                            if (isValid) conditionValue = parseCondition(record.DECK_COND_058);
                            break;
                        case 'super':
                            isValid = isValidCondition(record.SUPERSTRUCTURE_COND_059);
                            if (isValid) conditionValue = parseCondition(record.SUPERSTRUCTURE_COND_059);
                            break;
                        case 'sub':
                            isValid = isValidCondition(record.SUBSTRUCTURE_COND_060);
                            if (isValid) conditionValue = parseCondition(record.SUBSTRUCTURE_COND_060);
                            break;
                        case 'overall':
                            // Calculate average of all three conditions if all are valid
                            const deckValid = isValidCondition(record.DECK_COND_058);
                            const superValid = isValidCondition(record.SUPERSTRUCTURE_COND_059);
                            const subValid = isValidCondition(record.SUBSTRUCTURE_COND_060);

                            if (deckValid && superValid && subValid) {
                                const deckVal = parseCondition(record.DECK_COND_058);
                                const superVal = parseCondition(record.SUPERSTRUCTURE_COND_059);
                                const subVal = parseCondition(record.SUBSTRUCTURE_COND_060);
                                conditionValue = (deckVal + superVal + subVal) / 3;
                                isValid = true;
                            }
                            break;
                        default:
                            break;
                    }

                    if (!isValid) return;

                    if (!yearData[year]) {
                        yearData[year] = {
                            sum: 0,
                            count: 0
                        };
                    }

                    yearData[year].sum += conditionValue;
                    yearData[year].count++;
                });

                // Add yearly averages to the year map
                Object.entries(yearData).forEach(([year, data]) => {
                    if (!yearMap[year]) yearMap[year] = { year };

                    if (data.count > 0) {
                        yearMap[year][`${condition} (All)`] = data.sum / data.count;
                    }
                });
            }

            // For specific counties
            const countiesToShow = showAllCounties ? [] : selectedCounties;

            if (countiesToShow.length > 0) {
                // Group county data by year and county
                const countyYearData = {};

                rawData.forEach(record => {
                    const year = record.YEAR;
                    const county = record.COUNTY_NAME;

                    if (!countiesToShow.includes(county)) return;

                    // Process different condition fields
                    let conditionValue = null;
                    let isValid = false;

                    switch (condition) {
                        case 'deck':
                            isValid = isValidCondition(record.DECK_COND_058);
                            if (isValid) conditionValue = parseCondition(record.DECK_COND_058);
                            break;
                        case 'super':
                            isValid = isValidCondition(record.SUPERSTRUCTURE_COND_059);
                            if (isValid) conditionValue = parseCondition(record.SUPERSTRUCTURE_COND_059);
                            break;
                        case 'sub':
                            isValid = isValidCondition(record.SUBSTRUCTURE_COND_060);
                            if (isValid) conditionValue = parseCondition(record.SUBSTRUCTURE_COND_060);
                            break;
                        case 'overall':
                            // Calculate average of all three conditions if all are valid
                            const deckValid = isValidCondition(record.DECK_COND_058);
                            const superValid = isValidCondition(record.SUPERSTRUCTURE_COND_059);
                            const subValid = isValidCondition(record.SUBSTRUCTURE_COND_060);

                            if (deckValid && superValid && subValid) {
                                const deckVal = parseCondition(record.DECK_COND_058);
                                const superVal = parseCondition(record.SUPERSTRUCTURE_COND_059);
                                const subVal = parseCondition(record.SUBSTRUCTURE_COND_060);
                                conditionValue = (deckVal + superVal + subVal) / 3;
                                isValid = true;
                            }
                            break;
                        default:
                            break;
                    }

                    if (!isValid) return;

                    const key = `${year}_${county}`;
                    if (!countyYearData[key]) {
                        countyYearData[key] = {
                            year,
                            county,
                            values: [],
                            count: 0
                        };
                    }

                    countyYearData[key].values.push(conditionValue);
                    countyYearData[key].count++;
                });

                // Calculate average for each county/year
                Object.values(countyYearData).forEach(data => {
                    const year = data.year;
                    const county = data.county;

                    if (!yearMap[year]) yearMap[year] = { year };

                    if (data.values.length > 0) {
                        const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
                        yearMap[year][`${condition} (${county})`] = avg;
                    }
                });
            }
        });

        // Convert to array and sort by year
        const result = Object.values(yearMap).sort((a, b) => parseInt(a.year) - parseInt(b.year));
        setTrendData(result);
    };

    // Update trend data whenever selections change
    useEffect(() => {
        updateTrendData();
    }, [rawData, selectedConditions, selectedCounties]);

    const toggleCondition = (condition) => {
        setSelectedConditions(prev => {
            if (prev.includes(condition)) {
                return prev.filter(p => p !== condition);
            } else {
                return [...prev, condition];
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
        if (conditionOptions.length) {
            setSelectedConditions([conditionOptions[0].id]);
        }
        setSelectedCounties(['All']);
    };

    // Generate dynamic lines for the chart
    const generateLines = () => {
        const lines = [];

        selectedConditions.forEach(condition => {
            const baseColor = CONDITION_COLORS[condition] || '#999';

            if (selectedCounties.includes('All')) {
                lines.push(
                    <Line
                        key={`${condition}-All`}
                        type="monotone"
                        dataKey={`${condition} (All)`}
                        name={`${getConditionLabel(condition)} (All)`}
                        stroke={baseColor}
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
                            key={`${condition}-${county}`}
                            type="monotone"
                            dataKey={`${condition} (${county})`}
                            name={`${getConditionLabel(condition)} (${county.replace(' County', '')})`}
                            stroke={color}
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

    // Helper to get readable condition labels
    const getConditionLabel = (conditionId) => {
        const option = conditionOptions.find(opt => opt.id === conditionId);
        return option ? option.label : conditionId;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Richmond, Virginia CBSA Bridge Condition Trends</h2>
                <p className="text-center text-gray-600 mb-6">National Bridge Inventory (NBI) Data</p>

                {/* Selection Section: Bridge Condition Type */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Bridge Condition:</h3>
                    <div className="flex flex-wrap gap-2">
                        {conditionOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => toggleCondition(option.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                                    ${selectedConditions.includes(option.id)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selection Section: Location to Compare */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Select Location to Compare:</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => toggleCounty('All')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                                ${selectedCounties.includes('All')
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            All
                        </button>
                        {countyOptions.map(county => (
                            <button
                                key={county}
                                onClick={() => toggleCounty(county)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                                    ${selectedCounties.includes(county)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {county.replace(' County', '')}
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
            {trendData.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart
                            data={trendData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis
                                dataKey="year"
                                label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
                            />
                            <YAxis
                                label={{
                                    value: selectedConditions.length === 1
                                        ? `Average Rating (Scale 1-9)`
                                        : 'Average Rating',
                                    angle: -90,
                                    position: "insideLeft"
                                }}
                                domain={[0, 9]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {generateLines()}
                        </LineChart>
                    </ResponsiveContainer>

                    <div className="mt-4 text-sm text-gray-600">
                        {selectedConditions.length > 0 && selectedCounties.length > 0 ? (
                            <p>
                                Showing data for: {selectedConditions.map(c => getConditionLabel(c)).join(', ')} in {selectedCounties.join(', ')}
                            </p>
                        ) : (
                            <p>Please select at least one condition and location to display data.</p>
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


export default BridgeConditionTrend;