import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Sun, Moon, Calendar, TrendingUp, Layers, Menu, X, Filter, BarChart3 } from 'lucide-react';

const BlastCostAnalytics = ({ filteredData ,  DarkMode}) => {
  // State management
  const isDark =!DarkMode;
  const [timeMode, setTimeMode] = useState('Daily');
  const [startYear, setStartYear] = useState(2023);
  const [endYear, setEndYear] = useState(2024);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [activeStacks, setActiveStacks] = useState({
    drilling: true,
    manpower: true,
    accessories: true,
    explosive: true
  });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chartRef = useRef(null);

  // Mock data for demonstration
  const mockData = filteredData ;

  // Data processing with validation
  const processedData = useMemo(() => {
    // Filter out invalid records
    const validData = mockData.filter(record => 
      record.total_exp_cost && 
      record.total_exp_cost !== 0 && 
      record.total_exp_cost !== null && 
      record.total_exp_cost !== '' &&
      record.blastdate
    );

    if (timeMode === 'Yearly') {
      // Group by year and calculate averages
      const yearGroups = validData.reduce((acc, record) => {
        const year = new Date(record.blastdate).getFullYear();
        if (year >= startYear && year <= endYear) {
          if (!acc[year]) {
            acc[year] = { records: [], year: year };
          }
          acc[year].records.push(record);
        }
        return acc;
      }, {});

      return Object.values(yearGroups).map(group => {
        const avgDrilling = group.records.reduce((sum, r) => sum + (r.drilling_cost || 0), 0) / group.records.length;
        const avgManpower = group.records.reduce((sum, r) => sum + (r.man_power_cost || 0), 0) / group.records.length;
        const avgAccessories = group.records.reduce((sum, r) => sum + (r.blast_accessoriesdelay_cost || 0), 0) / group.records.length;
        const avgExplosive = group.records.reduce((sum, r) => sum + (r.total_exp_cost || 0), 0) / group.records.length;

        return {
          period: group.year.toString(),
          drilling_cost: Math.round(avgDrilling),
          man_power_cost: Math.round(avgManpower),
          blast_accessoriesdelay_cost: Math.round(avgAccessories),
          total_exp_cost: Math.round(avgExplosive),
          count: group.records.length
        };
      }).sort((a, b) => parseInt(a.period) - parseInt(b.period));
    } else {
      // Daily view with date filtering
      return validData
        .filter(record => {
          const recordDate = new Date(record.blastdate);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return recordDate >= start && recordDate <= end;
        })
        .map(record => ({
          ...record,
          period: new Date(record.blastdate).toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric' 
          })
        }))
        .sort((a, b) => new Date(a.blastdate) - new Date(b.blastdate));
    }
  }, [mockData, timeMode, startYear, endYear, startDate, endDate]);

  // Calculate totals
  const totals = useMemo(() => {
    return processedData.reduce((acc, record) => ({
      drilling: acc.drilling + (record.drilling_cost || 0),
      manpower: acc.manpower + (record.man_power_cost || 0),
      accessories: acc.accessories + (record.blast_accessoriesdelay_cost || 0),
      explosive: acc.explosive + (record.total_exp_cost || 0),
      total: acc.total + (record.drilling_cost || 0) + (record.man_power_cost || 0) + (record.blast_accessoriesdelay_cost || 0) + (record.total_exp_cost || 0)
    }), { drilling: 0, manpower: 0, accessories: 0, explosive: 0, total: 0 });
  }, [processedData]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Toggle stack visibility
  const toggleStack = (stackName) => {
    setActiveStacks(prev => ({
      ...prev,
      [stackName]: !prev[stackName]
    }));
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className={`p-4 rounded-2xl shadow-2xl border ${
          isDark 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-600' 
            : 'bg-white/90 backdrop-blur-xl border-gray-200'
        }`}>
          <p className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {timeMode === 'Yearly' ? `Year ${label}` : `Date: ${label}`}
          </p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {entry.name}
                  </span>
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
            <div className={`pt-2 mt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Total:
                </span>
                <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Export functionality - Working implementation
  const handleExport = async (format) => {
    try {
      const chartElement = chartRef.current;
      if (!chartElement) {
        alert('Chart not found for export');
        return;
      }

      // Get the chart container
      const chartContainer = chartElement.querySelector('.recharts-wrapper') || chartElement;
      
      if (format === 'PNG' || format === 'JPEG') {
        // Create canvas from the chart
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const rect = chartContainer.getBoundingClientRect();
        canvas.width = rect.width * 2; // Higher resolution
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        // Set background
        ctx.fillStyle = isDark ? '#1f2937' : '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Get SVG data from the chart
        const svgElement = chartContainer.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            
            // Download the image
            const link = document.createElement('a');
            link.download = `blast-cost-analytics.${format.toLowerCase()}`;
            link.href = canvas.toDataURL(`image/${format.toLowerCase()}`, 0.9);
            link.click();
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
      } else if (format === 'SVG') {
        // Export as SVG
        const svgElement = chartContainer.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.download = 'blast-cost-analytics.svg';
          link.href = url;
          link.click();
          
          URL.revokeObjectURL(url);
        }
      } else if (format === 'CSV') {
        // Export data as CSV
        const headers = ['Period', 'Drilling Cost', 'Manpower Cost', 'Accessories Cost', 'Explosive Cost', 'Total'];
        const csvContent = [
          headers.join(','),
          ...processedData.map(row => [
            row.period,
            row.drilling_cost || 0,
            row.man_power_cost || 0,
            row.blast_accessoriesdelay_cost || 0,
            row.total_exp_cost || 0,
            (row.drilling_cost || 0) + (row.man_power_cost || 0) + (row.blast_accessoriesdelay_cost || 0) + (row.total_exp_cost || 0)
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'blast-cost-analytics.csv';
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
      } else if (format === 'JSON') {
        // Export data as JSON
        const jsonData = {
          exportDate: new Date().toISOString(),
          timeMode: timeMode,
          dateRange: timeMode === 'Daily' ? { startDate, endDate } : { startYear, endYear },
          summary: totals,
          data: processedData
        };
        
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'blast-cost-analytics.json';
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
      }
      
      setIsExportOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const stackCategories = [
    { key: 'drilling', label: 'Drilling Cost', color: '#3b82f6', icon: '🔧' },
    { key: 'manpower', label: 'Manpower Cost', color: '#10b981', icon: '👥' },
    { key: 'accessories', label: 'Accessories Cost', color: '#f59e0b', icon: '⚡' },
    { key: 'explosive', label: 'Explosive Cost', color: '#ef4444', icon: '💥' }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Blast Cost Analytics
                </h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Mining Operations Dashboard
                </p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl font-semibold ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}>
                Total: {formatCurrency(totals.total)}
              </div>
              
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                
                {isExportOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border z-50 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {['PNG', 'JPEG', 'SVG', 'CSV', 'JSON'].map(format => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className={`w-full text-left px-4 py-3 hover:bg-opacity-10 transition-colors ${
                          isDark 
                            ? 'text-white hover:bg-white' 
                            : 'text-gray-900 hover:bg-gray-900'
                        } first:rounded-t-xl last:rounded-b-xl`}
                      >
                        Export as {format}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              
            </div>

            {/* Mobile Controls */}
            <div className="flex sm:hidden items-center gap-3">
              {/* Export Button */}
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Download className="w-5 h-5" />
              </button>
              
            
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`sm:hidden border-t ${
            isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'
          } backdrop-blur-xl`}>
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className={`text-center p-3 rounded-xl font-semibold ${
                isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                Total: {formatCurrency(totals.total)}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Controls Section */}
        <div className={`rounded-2xl p-6 mb-8 backdrop-blur-xl border ${
          isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/50 border-gray-200'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time Mode Toggle */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                View Mode
              </label>
              <div className={`flex rounded-xl p-1 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {['Daily', 'Yearly'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTimeMode(mode)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      timeMode === mode
                        ? isDark 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-white text-blue-600 shadow-md'
                        : isDark 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range Controls */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Filter className="w-4 h-4 inline mr-2" />
                {timeMode === 'Yearly' ? 'Year Range' : 'Date Range'}
              </label>
              
              {timeMode === 'Yearly' ? (
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Start Year"
                  />
                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="End Year"
                  />
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Stack Controls */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Layers className="w-4 h-4 inline mr-2" />
                Cost Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stackCategories.map(category => (
                  <button
                    key={category.key}
                    onClick={() => toggleStack(category.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeStacks[category.key]
                        ? 'shadow-md transform scale-105'
                        : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{
                      backgroundColor: activeStacks[category.key] ? category.color + '20' : undefined,
                      color: activeStacks[category.key] ? category.color : undefined,
                      border: `2px solid ${activeStacks[category.key] ? category.color : 'transparent'}`
                    }}
                  >
                    <span className="text-xs">{category.icon}</span>
                    <span className="truncate">{category.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className={`rounded-2xl p-6 mb-8 backdrop-blur-xl border ${
          isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <h2 className={`text-xl sm:text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Cost Breakdown Analysis
            </h2>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {processedData.length} records
            </div>
          </div>

          <div ref={chartRef} className="h-96 sm:h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? '#374151' : '#e5e7eb'} 
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="period" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '14px'
                  }}
                />
                
                {activeStacks.drilling && (
                  <Bar 
                    dataKey="drilling_cost" 
                    stackId="costs" 
                    fill="#3b82f6" 
                    name="Drilling Cost"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {activeStacks.manpower && (
                  <Bar 
                    dataKey="man_power_cost" 
                    stackId="costs" 
                    fill="#10b981" 
                    name="Manpower Cost"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {activeStacks.accessories && (
                  <Bar 
                    dataKey="blast_accessoriesdelay_cost" 
                    stackId="costs" 
                    fill="#f59e0b" 
                    name="Accessories Cost"
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {activeStacks.explosive && (
                  <Bar 
                    dataKey="total_exp_cost" 
                    stackId="costs" 
                    fill="#ef4444" 
                    name="Explosive Cost"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stackCategories.map((category, index) => {
            const value = totals[category.key];
            return (
              <div
                key={category.key}
                className={`p-4 sm:p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                    : 'bg-white/50 border-gray-200 hover:bg-white/70'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <span className="text-lg">{category.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm sm:text-base truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.label}
                    </h3>
                  </div>
                </div>
                <p className={`text-xl sm:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(value)}
                </p>
                <p className={`text-xs sm:text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {((value / totals.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Export Modal Overlay for Mobile */}
      {isExportOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
                      <div className={`w-full rounded-t-3xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Export Options
              </h3>
              <button
                onClick={() => setIsExportOpen(false)}
                className={`p-2 rounded-xl ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['PNG', 'JPEG', 'PDF', 'SVG'].map(format => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    isDark 
                      ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 text-white' 
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-900'
                  }`}
                >
                  <Download className="w-6 h-6 mx-auto mb-2" />
                  <span className="block font-medium">Export as {format}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlastCostAnalytics;