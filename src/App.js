import React, { useState } from 'react';
import BridgeConditionsChart from './BridgeConditionsChart';
import CommuteModeChart from './CommuteModeChart';
import CongestionChart from './CongestionChart';
import MilesDrivenChart from './MilesDrivenChart';
import PavementConditionsChart from './PavementConditionsChart';
import TransitConditionsChart from './TransitConditionsChart';
import TransitRidershipChart from './TransitRidershipChart';
import TransportationSafetyChart from './TransportationSafetyChart';

const TrackingProgressApp = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterBy, setFilterBy] = useState('category');
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Categories for the sidebar with added image placeholders
  const categories = [
    { id: 'sustainability', name: 'Sustainability', color: '#00474e', image: './images/sustain-icon.png' },
    { id: 'equity', name: 'Equity', color: '#166871', image: './images/equity-icon.png' },
    { id: 'resiliency', name: 'Resiliency', color: '#4d8185', image: './images/resil-icon.png' },
    { id: 'environment', name: 'Environment', color: '#006227', image: './images/enviro-icon.png' },
    { id: 'community', name: 'Community', color: '#004c6c', image: './images/comm-icon.png' },
    { id: 'transportation', name: 'Transportation', color: '#433c59', image: './images/transpo-icon.png' },
    { id: 'economy', name: 'Economy', color: '#721e52', image: './images/econo-icon.png' }
  ];

  // Indicators data with stats for hover effect and added image placeholders
  const indicators = [
    {
      id: 'air-quality',
      title: 'Air Quality',
      category: 'environment',
      newData: false,
      stat: '15% improvement',
      statDesc: 'in air quality index',
      image: './images/air_quality.svg'
    },
    {
      id: 'bridge-conditions',
      title: 'Bridge Conditions',
      category: 'transportation',
      newData: false,
      stat: '8.2% improvement',
      statDesc: 'in overall condition ratings',
      hasDetailView: true,
      image: './images/bridge_conditions.svg'
    },
    {
      id: 'business-formations',
      title: 'Business Formations',
      category: 'economy',
      newData: false,
      stat: '95% growth',
      statDesc: 'in annual applications',
      image: './images/business_formations.svg'
    },
    {
      id: 'community-integration',
      title: 'Community Integration',
      category: 'community',
      newData: false,
      stat: '12% increase',
      statDesc: 'in community participation',
      image: './images/community_integration.svg'
    },
    {
      id: 'commute-mode',
      title: 'Commute Mode',
      category: 'transportation',
      newData: true,
      stat: '7.5% shift',
      statDesc: 'to sustainable modes',
      image: './images/nonsov_mode_share.svg'
    },
    {
      id: 'congestion',
      title: 'Congestion',
      category: 'transportation',
      newData: false,
      stat: '3.2% reduction',
      statDesc: 'in peak hour delays',
      image: './images/roadway_reliability.svg'
    },
    {
      id: 'educational-attainment',
      title: 'Educational Attainment',
      category: 'equity',
      newData: false,
      stat: '5.7% increase',
      statDesc: 'in degree completion',
      image: './images/educational_attainment.svg'
    },
    {
      id: 'greenhouse-gas',
      title: 'Greenhouse Gas Emissions',
      category: 'environment',
      newData: false,
      stat: '10.5% reduction',
      statDesc: 'in carbon emissions',
      image: './images/emissions.svg'
    },
    {
      id: 'gdp',
      title: 'Gross Domestic Product',
      category: 'economy',
      newData: true,
      stat: '4.2% growth',
      statDesc: 'in regional economy',
      image: './images/exports.svg'
    },
    {
      id: 'housing-affordability',
      title: 'Housing Affordability',
      category: 'equity',
      newData: false,
      stat: '7% decline',
      statDesc: 'in affordability index',
      image: './images/affordable_housing.svg'
    },
    // Remaining indicators...
    {
      id: 'housing-permits', title: 'Housing Permits',
      category: 'community', newData: false, stat: '18% increase', statDesc: 'in new permits',
      image: './images/housing_activity.svg'
    },
    {
      id: 'income', title: 'Income', category: 'equity', newData: false, stat: '3.8% growth',
      statDesc: 'in median income', image: './images/income_inequality.svg'
    },
    {
      id: 'job-growth', title: 'Job Growth', category: 'economy', newData: false, stat: '12% increase',
      statDesc: 'in regional employment', image: './images/job_growth.svg'
    },
    {
      id: 'labor-force', title: 'Labor Force', category: 'economy', newData: false, stat: '2.1% expansion', statDesc: 'in labor participation',
      image: './images/labor_force.svg'
    },
    {
      id: 'land-consumption', title: 'Land Consumption', category: 'environment', newData: true, stat: '5.3% reduction', statDesc: 'in per capita use',
      image: './images/land_consumption.svg'
    },
    {
      id: 'miles-driven', title: 'Miles Driven', category: 'transportation', newData: false, stat: '1.7% decrease', statDesc: 'in per capita VMT',
      image: './images/miles_driven.svg'
    },
    {
      id: 'mortgage-lending', title: 'Mortgage Lending', category: 'economy', newData: false, stat: '9.4% increase', statDesc: 'in loan approvals',
      image: './images/mortgage_lending.svg'
    },
    {
      id: 'pavement-conditions', title: 'Pavement Conditions', category: 'transportation', newData: false, stat: '6.8% improvement', statDesc: 'in surface quality',
      image: './images/pavement_conditions.svg'
    },
    {
      id: 'population-growth', title: 'Population Growth', category: 'community', newData: false, stat: '1.2% annual growth', statDesc: 'in regional population',
      image: './images/population_growth.svg'
    },
    {
      id: 'transit-conditions', title: 'Transit Conditions', category: 'transportation', newData: false, stat: '5.5% improvement', statDesc: 'in system quality',
      image: './images/transit_conditions.svg'
    },
    {
      id: 'transit-ridership', title: 'Transit Ridership', category: 'transportation', newData: false, stat: '8.7% rise', statDesc: 'in quarterly ridership',
      image: './images/transit_ridership.svg'
    },
    {
      id: 'transportation-safety', title: 'Transportation Safety', category: 'transportation', newData: false, stat: '11.3% reduction', statDesc: 'in traffic incidents',
      image: './images/roadway_safety.svg'
    },
    {
      id: 'water-quality', title: 'Water Quality', category: 'environment', newData: false, stat: '7.9% improvement', statDesc: 'in water quality index',
      image: './images/water_quality.svg'
    },
    {
      id: '2050', title: '2050', category: 'sustainability', newData: false, stat: '43% progress', statDesc: 'toward long-term goals',
      image: './images/tp_homepage_logo.png'
    }
  ];

  // All indicators remain in the grid, but we'll visually filter them
  const filteredIndicators = indicators;

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? 'all' : categoryId);
  };

  const handleIndicatorClick = (indicator) => {
    setSelectedIndicator(indicator.id === selectedIndicator ? null : indicator.id);
  };

  // Render the detail view based on the selected indicator
  const renderDetailView = () => {
    if (selectedIndicator === 'bridge-conditions') {
      return <BridgeConditionsChart />;
    }
    else if (selectedIndicator === 'commute-mode') {
      return <CommuteModeChart />;
    }
    else if (selectedIndicator === 'congestion') {
      return <CongestionChart />;
    }
    else if (selectedIndicator === 'miles-driven') {
      return <MilesDrivenChart />;
    }
    else if (selectedIndicator === 'pavement-conditions') {
      return <PavementConditionsChart />;
    }
    else if (selectedIndicator === 'transit-conditions') {
      return <TransitConditionsChart />;
    }
    else if (selectedIndicator === 'transit-ridership') {
      return <TransitRidershipChart />;
    }
    else if (selectedIndicator === 'transportation-safety') {
      return <TransportationSafetyChart />;
    }

    // For other indicators that don't have specific detail components yet
    const indicator = indicators.find(ind => ind.id === selectedIndicator);
    if (!indicator) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{indicator.title}</h2>
          <div className="bg-teal-600 text-white px-3 py-1 rounded-full">
            {indicator.category.charAt(0).toUpperCase() + indicator.category.slice(1)}
          </div>
        </div>

        <div className="flex items-center mb-6">
          <img
            src={indicator.image}
            alt={indicator.title}
            className="w-16 h-16 mr-4"
          />
          <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-md flex items-center">
            <div className="text-lg font-bold mr-2">{indicator.stat}</div>
            <div className="text-sm">{indicator.statDesc}</div>
          </div>
        </div>

        <div className="text-gray-700 mb-6">
          <p>
            This placeholder detail view shows basic information about the {indicator.title} indicator.
            In a complete implementation, this would include more detailed charts, analysis,
            and historical trend data specific to this indicator.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
          <p>Last updated: 2023</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <button onClick={() => { }} className="text-teal-600 font-bold text-xl">
              TCAMPO Performance Dashboard
            </button>
            <div className="flex space-x-4">
              {/* <button className="px-4 py-2 border-2 border-teal-600 text-teal-600 font-medium">
                How To
              </button>
              <button className="px-4 py-2 text-teal-600 font-medium">
                About
              </button> */}
            </div>
            <div>
              <span className="text-xl font-bold text-teal-600"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-4">
        {/* Filter bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2 font-medium">Filter by:</label>
            <select
              id="filter"
              className="border border-gray-300 px-2 py-1"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="category">category</option>
            </select>
          </div>

          {selectedIndicator && (
            <button
              onClick={() => setSelectedIndicator(null)}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm font-medium flex items-center"
            >
              <span className="mr-1">×</span> Close Detail View
            </button>
          )}
        </div>

        {/* Main content area with sidebar and grid */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-48 mb-4 md:mb-0 md:mr-4">
            <ul>
              {categories.map((category) => (
                <li key={category.id} className="mb-1">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className="w-full flex items-center px-4 py-3 text-white font-medium"
                    style={{
                      backgroundColor: category.color,
                      opacity: selectedCategory === 'all' || selectedCategory === category.id ? 1 : 0.5
                    }}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-8 mr-2"
                    />
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main content area - Grid or Detail View */}
          <div className="flex-1">
            {selectedIndicator ? (
              // Detail view
              renderDetailView()
            ) : (
              // Grid view
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {filteredIndicators.map((indicator) => {
                  const isDisabled = selectedCategory !== 'all' && indicator.category !== selectedCategory;

                  return (
                    <button
                      key={indicator.id}
                      onClick={() => {
                        if (!isDisabled) handleIndicatorClick(indicator);
                      }}
                      disabled={isDisabled}
                      className={`relative aspect-square flex flex-col items-center justify-center p-2 text-white transition-all group ${isDisabled
                        ? 'bg-gray-400 cursor-not-allowed opacity-40'
                        : `bg-teal-600 hover:opacity-90 ${indicator.hasDetailView ? 'cursor-pointer hover:scale-105' : 'hover:-translate-y-1'}`
                        }`}
                    >
                      {indicator.newData && (
                        <div className="absolute top-1 right-1 bg-black bg-opacity-20 text-white text-xs px-1 py-0.5">
                          new data!
                        </div>
                      )}
                      <div className={`w-12 h-12 mb-1 flex items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}>
                        {/* Replace icon placeholder with image placeholder */}
                        <img
                          src={indicator.image}
                          alt={indicator.title}
                          className="w-10 h-10"
                        />
                      </div>
                      <div className="text-xs text-center font-medium">
                        {indicator.title}
                      </div>

                      {/* Hover overlay with additional data */}
                      <div className="absolute inset-0 bg-teal-700 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="font-bold mb-1">
                          {indicator.stat}
                        </div>
                        <div className="text-xs text-center">
                          {indicator.statDesc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingProgressApp;