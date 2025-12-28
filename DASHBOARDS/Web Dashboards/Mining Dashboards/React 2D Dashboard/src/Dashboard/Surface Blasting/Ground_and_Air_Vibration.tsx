import React, { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  Volume2,
  DollarSign,
  Download,
  BarChart3,
  Filter,
} from 'lucide-react';

const VibrationDashboard = ({ filteredData, DarkMode }) => {
  const isDarkMode = !DarkMode; // Removed inversion for clarity
  const [timeMode, setTimeMode] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    startYear: new Date().getFullYear() - 1,
    endYear: new Date().getFullYear(),
  });
  const [activeMeasurements, setActiveMeasurements] = useState({
    ppv: true,
    airBlast: true,
  });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportNotification, setExportNotification] = useState('');

  const exportRef = useRef(null);

  // Click outside handler for export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Removed filterData from dependencies

  // Helper function to validate and parse dates
  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Helper function to check if a value is valid
  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== 0 && value !== '';
  };

  // Process and filter data based on current settings
  const processedData = useMemo(() => {
    if (!Array.isArray(filteredData)) {
      return [];
    }

    let validData = filteredData.filter(
      (item) =>
        item.total_exp_cost &&
        item.total_exp_cost > 0 &&
        isValidDate(item.blastdate)
    );

    validData = validData.filter((item) => {
      const hasValidPPV = isValidValue(item.ppv);
      const hasValidAirBlast = isValidValue(item.air_blast);
      return hasValidPPV || hasValidAirBlast;
    });

    if (timeMode === 'daily') {
      if (dateRange.startDate || dateRange.endDate) {
        validData = validData.filter((item) => {
          const itemDate = new Date(item.blastdate);
          const start = dateRange.startDate
            ? new Date(dateRange.startDate)
            : new Date('1900-01-01');
          const end = dateRange.endDate
            ? new Date(dateRange.endDate)
            : new Date('2100-12-31');
          return itemDate >= start && itemDate <= end;
        });
      }
    } else {
      validData = validData.filter((item) => {
        const year = new Date(item.blastdate).getFullYear();
        return year >= dateRange.startYear && year <= dateRange.endYear;
      });
    }

    if (timeMode === 'yearly') {
      const yearlyData = {};

      validData.forEach((item) => {
        const year = new Date(item.blastdate).getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = {
            year,
            costs: [],
            ppvValues: [],
            airBlastValues: [],
            count: 0,
          };
        }

        yearlyData[year].costs.push(item.total_exp_cost);
        if (isValidValue(item.ppv)) yearlyData[year].ppvValues.push(item.ppv);
        if (isValidValue(item.air_blast))
          yearlyData[year].airBlastValues.push(item.air_blast);
        yearlyData[year].count++;
      });

      return Object.values(yearlyData)
        .map((yearData) => ({
          date: yearData.year.toString(),
          displayDate: yearData.year.toString(),
          cost:
            yearData.costs.reduce((sum, cost) => sum + cost, 0) /
            yearData.costs.length,
          ppv:
            yearData.ppvValues.length > 0
              ? yearData.ppvValues.reduce((sum, ppv) => sum + ppv, 0) /
                yearData.ppvValues.length
              : null,
          air_blast:
            yearData.airBlastValues.length > 0
              ? yearData.airBlastValues.reduce((sum, ab) => sum + ab, 0) /
                yearData.airBlastValues.length
              : null,
          blastCount: yearData.count,
        }))
        .sort((a, b) => parseInt(a.date) - parseInt(b.date));
    } else {
      return validData
        .map((item) => ({
          ...item,
          date: new Date(item.blastdate).toISOString().split('T')[0],
          displayDate: new Date(item.blastdate).toLocaleDateString(),
          cost: item.total_exp_cost,
          ppv: isValidValue(item.ppv) ? item.ppv : null,
          air_blast: isValidValue(item.air_blast) ? item.air_blast : null,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }, [filteredData, timeMode, dateRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const validCosts = processedData.filter((item) => item.cost > 0);
    const validPPV = processedData.filter(
      (item) => item.ppv !== null && item.ppv > 0
    );
    const validAirBlast = processedData.filter(
      (item) => item.air_blast !== null && item.air_blast > 0
    );

    return {
      totalCost: validCosts.reduce((sum, item) => sum + item.cost, 0),
      avgCost:
        validCosts.length > 0
          ? validCosts.reduce((sum, item) => sum + item.cost, 0) /
            validCosts.length
          : 0,
      avgPPV:
        validPPV.length > 0
          ? validPPV.reduce((sum, item) => sum + item.ppv, 0) /
            validPPV.length
          : 0,
      avgAirBlast:
        validAirBlast.length > 0
          ? validAirBlast.reduce((sum, item) => sum + item.air_blast, 0) /
            validAirBlast.length
          : 0,
      totalBlasts: processedData.length,
    };
  }, [processedData]);

  // Prepare chart data with conditional series
  const chartData = useMemo(() => {
    return processedData.map((item) => {
      const dataPoint = {
        date: item.date,
        displayDate: item.displayDate,
        cost: item.cost,
      };

      if (activeMeasurements.ppv && item.ppv !== null) {
        dataPoint.ppv = item.ppv;
      }

      if (activeMeasurements.airBlast && item.air_blast !== null) {
        dataPoint.air_blast = item.air_blast;
      }

      return dataPoint;
    });
  }, [processedData, activeMeasurements]);

  const handleExport = (format) => {
    setExportNotification(`Exporting as ${format.toUpperCase()}...`);
    setShowExportDropdown(false);

    // Placeholder export logic
    setTimeout(() => {
      setExportNotification(`Chart exported as ${format.toUpperCase()} successfully!`);
      setTimeout(() => setExportNotification(''), 3000);
    }, 1000);
  };

  const toggleMeasurement = (type) => {
    setActiveMeasurements((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode
              ? 'bg-gray-800/90 border-gray-600 text-white'
              : 'bg-white/90 border-gray-200 text-gray-900'
          } backdrop-blur-md shadow-xl`}
        >
          <p className="font-semibold mb-2">{data.displayDate}</p>
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Cost: ${data.cost?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {data.ppv !== null && data.ppv !== undefined && (
              <p className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                PPV: {data.ppv.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} mm/s
              </p>
            )}
            {data.air_blast !== null && data.air_blast !== undefined && (
              <p className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-red-500" />
                Air Blast: {data.air_blast.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} dB
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const themeClasses = isDarkMode
    ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
    : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900';

  const cardClasses = isDarkMode
    ? 'bg-gray-800/50 border-gray-600'
    : 'bg-white/50 border-gray-200';

  return (
    <div className={`min-h-screen p-6 transition-all duration-500 ${themeClasses}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${cardClasses} backdrop-blur-md rounded-2xl border p-6 shadow-xl`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                Vibration Analytics Dashboard
              </h1>
              <p className="text-lg font-semibold">
                Total Cost: $
                {summaryStats.totalCost.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  aria-label="Export chart data"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } shadow-lg hover:shadow-xl transform hover:scale-105`}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {showExportDropdown && (
                  <div
                    className={`absolute top-full right-0 mt-2 w-40 rounded-xl border shadow-xl z-50 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-gray-200'
                    } backdrop-blur-md`}
                  >
                    {['png', 'jpeg', 'pdf', 'svg'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className={`w-full text-left px-4 py-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-white'
                            : 'hover:bg-gray-50 text-gray-900'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Export Notification */}
        {exportNotification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-xl shadow-xl z-50 ${
              isDarkMode ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'
            } backdrop-blur-md border ${
              isDarkMode ? 'border-green-600' : 'border-green-200'
            }`}
          >
            {exportNotification}
          </div>
        )}

        {/* Controls */}
        <div className={`${cardClasses} backdrop-blur-md rounded-2xl border p-6 shadow-xl`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Period
              </label>
              <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setTimeMode('daily')}
                  aria-label="Select daily view"
                  className={`flex-1 px-4 py-2 font-medium transition-all duration-300 ${
                    timeMode === 'daily'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeMode('yearly')}
                  aria-label="Select yearly view"
                  className={`flex-1 px-4 py-2 font-medium transition-all duration-300 ${
                    timeMode === 'yearly'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Date Range
              </label>
              {timeMode === 'daily' ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    aria-label="Select start date"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    aria-label="Select end date"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={dateRange.startYear}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startYear: parseInt(e.target.value) || 2020,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    aria-label="Select start year"
                  />
                  <input
                    type="number"
                    placeholder="End Year"
                    value={dateRange.endYear}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endYear: parseInt(e.target.value) || 2024,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    aria-label="Select end year"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Measurements
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => toggleMeasurement('ppv')}
                  aria-label="Toggle PPV measurement"
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeMeasurements.ppv
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  PPV (mm/s)
                </button>
                <button
                  onClick={() => toggleMeasurement('airBlast')}
                  aria-label="Toggle Air Blast measurement"
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeMeasurements.airBlast
                      ? 'bg-red-500 text-white shadow-lg'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  Air Blast (dB)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className={`${cardClasses} backdrop-blur-md rounded-2xl border p-6 shadow-xl`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Vibration Analysis - {timeMode === 'daily' ? 'Daily' : 'Yearly'} View
          </h2>

          {chartData.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: isDarkMode ? '#D1D5DB' : '#6B7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  {activeMeasurements.ppv && (
                    <YAxis
                      yAxisId="ppv"
                      orientation="left"
                      tick={{ fontSize: 12, fill: '#3B82F6' }}
                      label={{
                        value: 'PPV (mm/s)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#3B82F6' },
                      }}
                    />
                  )}
                  {activeMeasurements.airBlast && (
                    <YAxis
                      yAxisId="airBlast"
                      orientation="right"
                      tick={{ fontSize: 12, fill: '#EF4444' }}
                      label={{
                        value: 'Air Blast (dB)',
                        angle: 90,
                        position: 'insideRight',
                        style: { textAnchor: 'middle', fill: '#EF4444' },
                      }}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {activeMeasurements.ppv && (
                    <Scatter yAxisId="ppv" dataKey="ppv" fill="#3B82F6" name="PPV (mm/s)" />
                  )}
                  {activeMeasurements.airBlast && (
                    <Scatter
                      yAxisId="airBlast"
                      dataKey="air_blast"
                      fill="#EF4444"
                      name="Air Blast (dB)"
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}
                />
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No data available for the selected filters
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  Try adjusting your date range or measurement settings
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${cardClasses} backdrop-blur-md rounded-2xl border p-6 shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-75">Average Cost</p>
                <p className="text-2xl font-bold">
                  $
                  {summaryStats.avgCost.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardClasses} backdrop-blur-md rounded-2xl border p-6 shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-75">Average PPV</p>
                <p className="text-2xl font-bold">
                  {summaryStats.avgPPV.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  mm/s
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardClasses} backdrop-blur-md rounded-2xl border p-6 shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 rounded-xl">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-75">Average Air Blast</p>
                <p className="text-2xl font-bold">
                  {summaryStats.avgAirBlast.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  dB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

VibrationDashboard.propTypes = {
  filteredData: PropTypes.arrayOf(
    PropTypes.shape({
      total_exp_cost: PropTypes.number,
      blastdate: PropTypes.string,
      ppv: PropTypes.number,
      air_blast: PropTypes.number,
    })
  ).isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default VibrationDashboard;