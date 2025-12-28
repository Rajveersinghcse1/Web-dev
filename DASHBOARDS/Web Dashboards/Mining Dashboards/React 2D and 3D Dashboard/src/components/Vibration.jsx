import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as THREE from 'three';
import { Download, RotateCcw, ZoomIn, ZoomOut, Sun, Moon, Monitor, Smartphone, Tablet, Eye, EyeOff, Calendar, Filter, Settings, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GroundAirVibrationScatter = () => {
  // Theme and responsive states
  const [theme, setTheme] = useState('dark');
  const [deviceType, setDeviceType] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Visualization states
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [ppvVisible, setPpvVisible] = useState(true);
  const [airBlastVisible, setAirBlastVisible] = useState(true);
  
  // Data and filters
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [ppvRange, setPpvRange] = useState({ min: 0, max: 100 });
  const [airBlastRange, setAirBlastRange] = useState({ min: 0, max: 200 });
  
  // 3D Scene refs
  const mount3D = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const renderer = useRef(null);
  const controls = useRef(null);

  // Sample vibration data
  const rawData = useMemo(() => [
    { blastdate: '2024-01-15', ppv: 12.5, air_blast: 125.3, location: 'Zone A' },
    { blastdate: '2024-01-20', ppv: 15.2, air_blast: 132.1, location: 'Zone B' },
    { blastdate: '2024-02-05', ppv: 8.7, air_blast: 0, location: 'Zone C' }, // air_blast missing
    { blastdate: '2024-02-10', ppv: 0, air_blast: 128.5, location: 'Zone D' }, // ppv missing
    { blastdate: '2024-02-15', ppv: 0, air_blast: 0, location: 'Zone E' }, // both missing - exclude
    { blastdate: '2024-03-01', ppv: 22.1, air_blast: 142.8, location: 'Zone A' },
    { blastdate: '2024-03-10', ppv: 18.9, air_blast: 138.2, location: 'Zone B' },
    { blastdate: '2024-03-20', ppv: 11.3, air_blast: 129.7, location: 'Zone C' },
    { blastdate: '2024-04-05', ppv: 25.6, air_blast: 145.1, location: 'Zone D' },
    { blastdate: '2024-04-15', ppv: 14.2, air_blast: 133.9, location: 'Zone A' },
  ], []);

  // Add yearwise/datewise toggle state
  const [filterMode, setFilterMode] = useState('datewise'); // 'datewise' or 'yearwise'
  const [year, setYear] = useState(new Date().getFullYear());

  // Add yearwise start/end year state
  const yearOptions = useMemo(() => Array.from(new Set(rawData.map(item => new Date(item.blastdate).getFullYear()))).sort((a, b) => b - a), [rawData]);
  const [yearRange, setYearRange] = useState({ start: yearOptions[yearOptions.length - 1] || 2024, end: yearOptions[0] || 2024 });
  const [yearError, setYearError] = useState('');

  // Enhanced data filtering logic
  const filteredData = useMemo(() => {
    if (filterMode === 'yearwise') {
      if (yearRange.start > yearRange.end) {
        setYearError('Start year must be less than or equal to end year.');
        return [];
      } else {
        setYearError('');
      }
    }
    return rawData.filter(item => {
      const ppvEmpty = item.ppv === 0 || item.ppv === null || item.ppv === '' || item.ppv === undefined;
      const airBlastEmpty = item.air_blast === 0 || item.air_blast === null || item.air_blast === '' || item.air_blast === undefined;
      if (ppvEmpty && airBlastEmpty) return false;
      const itemDate = new Date(item.blastdate);
      if (filterMode === 'yearwise') {
        return itemDate.getFullYear() >= Number(yearRange.start) && itemDate.getFullYear() <= Number(yearRange.end);
      } else {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      }
    });
  }, [rawData, dateRange, filterMode, yearRange]);

  // Prepare data for 2D scatter plot
  const scatterData = useMemo(() => {
    return filteredData.map(item => ({
      ...item,
      timestamp: new Date(item.blastdate).getTime(),
      ppvDisplay: (item.ppv === 0 || item.ppv === null || item.ppv === "" || item.ppv === undefined) ? null : item.ppv,
      airBlastDisplay: (item.air_blast === 0 || item.air_blast === null || item.air_blast === "" || item.air_blast === undefined) ? null : item.air_blast
    }));
  }, [filteredData]);

  // Device detection
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // 3D Scene initialization
  useEffect(() => {
    if (viewMode === '3d' && mount3D.current) {
      initScene3D();
      renderData3D();
    }
    
    return () => {
      if (renderer.current) {
        renderer.current.dispose();
      }
    };
  }, [viewMode, filteredData, theme]);

  const initScene3D = () => {
    if (!mount3D.current) return;

    // Scene setup
    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(theme === 'dark' ? 0x0a0a0a : 0xf8fafc);

    // Camera setup
    const aspect = mount3D.current.clientWidth / mount3D.current.clientHeight;
    camera.current = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.current.position.set(10, 10, 10);

    // Renderer setup
    renderer.current = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.current.setSize(mount3D.current.clientWidth, mount3D.current.clientHeight);
    renderer.current.shadowMap.enabled = true;
    renderer.current.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mount3D.current.appendChild(renderer.current.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    scene.current.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 
      theme === 'dark' ? 0x333333 : 0x888888, 
      theme === 'dark' ? 0x111111 : 0xcccccc
    );
    scene.current.add(gridHelper);

    // Controls (basic mouse interaction)
    const animate = () => {
      requestAnimationFrame(animate);
      if (renderer.current && scene.current && camera.current) {
        renderer.current.render(scene.current, camera.current);
      }
    };
    animate();
  };

  const renderData3D = () => {
    if (!scene.current) return;

    // Clear existing data points
    const objectsToRemove = [];
    scene.current.traverse((child) => {
      if (child.userData.isDataPoint) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => scene.current.remove(obj));

    // Add PPV points (spheres)
    if (ppvVisible) {
      filteredData.forEach((item, index) => {
        if (item.ppv && item.ppv > 0) {
          const geometry = new THREE.SphereGeometry(0.2, 16, 16);
          const material = new THREE.MeshPhongMaterial({ 
            color: theme === 'dark' ? 0x3b82f6 : 0x1e40af,
            transparent: true,
            opacity: 0.8
          });
          const sphere = new THREE.Mesh(geometry, material);
          
          sphere.position.set(
            (index - filteredData.length / 2) * 2, // X: time spread
            item.ppv / 5, // Y: PPV value scaled
            0 // Z: PPV layer
          );
          
          sphere.userData = { isDataPoint: true, type: 'ppv', data: item };
          scene.current.add(sphere);
        }
      });
    }

    // Add Air Blast points (pyramids)
    if (airBlastVisible) {
      filteredData.forEach((item, index) => {
        if (item.air_blast && item.air_blast > 0) {
          const geometry = new THREE.ConeGeometry(0.15, 0.4, 8);
          const material = new THREE.MeshPhongMaterial({ 
            color: theme === 'dark' ? 0xef4444 : 0xdc2626,
            transparent: true,
            opacity: 0.8
          });
          const cone = new THREE.Mesh(geometry, material);
          
          cone.position.set(
            (index - filteredData.length / 2) * 2, // X: time spread
            item.air_blast / 10, // Y: Air blast scaled
            2 // Z: Air blast layer
          );
          
          cone.userData = { isDataPoint: true, type: 'air_blast', data: item };
          scene.current.add(cone);
        }
      });
    }
  };

  // Enhanced export function with PDF and SVG
  const exportChart = async (format, quality = 'high') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ground-air-vibration-${viewMode}-${timestamp}`;
    const chartElement = document.querySelector('.recharts-wrapper') || mount3D.current;
    if (!chartElement) return;
    if (format === 'pdf') {
      html2canvas(chartElement, { scale: quality === 'high' ? 3 : 2, backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff' }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height + 80] });
        pdf.setFillColor(theme === 'dark' ? 10 : 255, theme === 'dark' ? 10 : 255, theme === 'dark' ? 10 : 255);
        pdf.rect(0, 0, canvas.width, canvas.height + 80, 'F');
        pdf.addImage(imgData, 'PNG', 0, 40, canvas.width, canvas.height);
        pdf.setFontSize(22);
        pdf.setTextColor(theme === 'dark' ? 255 : 0);
        pdf.text('Ground & Air Vibration', 20, 30);
        pdf.setFontSize(12);
        pdf.text(`Exported: ${timestamp} | Mode: ${viewMode.toUpperCase()} | Filter: ${filterMode === 'yearwise' ? yearRange.start + ' to ' + yearRange.end : dateRange.start + ' to ' + dateRange.end}`, 20, canvas.height + 65);
        pdf.text(`Total Records: ${filteredData.length}`, 20, canvas.height + 80);
        pdf.save(`${filename}.pdf`);
      });
    } else if (format === 'svg') {
      // SVG export for 2D only (Recharts)
      if (viewMode === '2d') {
        const svgElem = chartElement.querySelector('svg');
        if (svgElem) {
          const serializer = new XMLSerializer();
          let source = serializer.serializeToString(svgElem);
          // Add XML declaration
          if (!source.match(/^<\?xml/)) {
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
          }
          const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // For 3D, fallback to PNG and rename as SVG (not true SVG)
        exportChart('png', quality);
      }
    } else {
      // PNG/JPEG for both 2D/3D
      html2canvas(chartElement, { scale: quality === 'high' ? 3 : 2, backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff' }).then(canvas => {
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.${format}`;
          a.click();
          URL.revokeObjectURL(url);
        }, `image/${format}`, format === 'jpeg' ? 0.95 : 1.0);
      });
    }
  };

  // Custom tooltip for 2D
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className={`p-4 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-900/90 border-gray-700 text-white' 
            : 'bg-white/90 border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold text-lg mb-2">{data.blastdate}</p>
          <p className="text-sm mb-1">Location: <span className="font-medium">{data.location}</span></p>
          {data.ppvDisplay && (
            <p className="text-blue-400 text-sm">PPV: <span className="font-bold">{data.ppvDisplay} mm/s</span></p>
          )}
          {data.airBlastDisplay && (
            <p className="text-red-400 text-sm">Air Blast: <span className="font-bold">{data.airBlastDisplay} dB</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  const themeClasses = {
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
      card: 'bg-gray-800/50 backdrop-blur-xl border-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      button: 'bg-gray-700/50 hover:bg-gray-600/50 text-white',
      buttonActive: 'bg-blue-600 hover:bg-blue-500 text-white',
      input: 'bg-gray-700/50 border-gray-600 text-white',
    },
    light: {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
      card: 'bg-white/70 backdrop-blur-xl border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      button: 'bg-gray-100/70 hover:bg-gray-200/70 text-gray-900',
      buttonActive: 'bg-blue-600 hover:bg-blue-500 text-white',
      input: 'bg-white/70 border-gray-300 text-gray-900',
    }
  };

  const currentTheme = themeClasses[theme];

  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className={`min-h-screen transition-all duration-500 ${currentTheme.bg} p-2 sm:p-4 lg:p-6`}>
      <div className={`rounded-3xl border shadow-2xl transition-all duration-500 ${currentTheme.card} ${
        isFullscreen ? 'fixed inset-4 z-50' : 'max-w-7xl mx-auto'
      }`}>
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-300/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme.text}`}>
                  Ground & Air Vibration
                </h1>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  Advanced Scatter Plot Analysis • {filteredData.length} Data Points
                </p>
              </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-xl transition-all duration-300 ${currentTheme.button} hover:scale-105`}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Device Type Indicator */}
              <div className={`px-3 py-2 rounded-xl ${currentTheme.card} border flex items-center gap-2`}>
                {deviceType === 'mobile' && <Smartphone className="w-4 h-4" />}
                {deviceType === 'tablet' && <Tablet className="w-4 h-4" />}
                {deviceType === 'desktop' && <Monitor className="w-4 h-4" />}
                <span className={`text-xs font-medium ${currentTheme.textSecondary}`}>
                  {deviceType.toUpperCase()}
                </span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-gray-300/20">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    viewMode === '2d' ? currentTheme.buttonActive : currentTheme.button
                  }`}
                >
                  2D View
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    viewMode === '3d' ? currentTheme.buttonActive : currentTheme.button
                  }`}
                >
                  3D View
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-xl transition-all duration-300 ${currentTheme.button} hover:scale-105`}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="p-4 sm:p-6 border-b border-gray-300/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Filter Mode Toggle */}
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${currentTheme.text}`}>Filter Mode:</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterMode('datewise')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-300 ${filterMode === 'datewise' ? currentTheme.buttonActive : currentTheme.button}`}
                >
                  Datewise
                </button>
                <button
                  onClick={() => setFilterMode('yearwise')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-300 ${filterMode === 'yearwise' ? currentTheme.buttonActive : currentTheme.button}`}
                >
                  Yearwise
                </button>
              </div>
            </div>

            {/* Filters: show year or date pickers based on mode */}
            {filterMode === 'datewise' ? (
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 ${currentTheme.input}`}
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 ${currentTheme.input}`}
                />
              </div>
            ) : (
              <div className="space-y-2 flex gap-2">
                <select
                  aria-label="Start Year"
                  value={yearRange.start}
                  onChange={e => setYearRange(prev => ({ ...prev, start: e.target.value }))}
                  className={`w-1/2 px-3 py-2 rounded-xl border transition-all duration-300 ${currentTheme.input}`}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select
                  aria-label="End Year"
                  value={yearRange.end}
                  onChange={e => setYearRange(prev => ({ ...prev, end: e.target.value }))}
                  className={`w-1/2 px-3 py-2 rounded-xl border transition-all duration-300 ${currentTheme.input}`}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {yearError && <div className="text-red-500 text-xs mt-1">{yearError}</div>}
              </div>
            )}

            {/* Export Controls */}
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${currentTheme.text}`}>Export Options</h3>
              <div className="relative">
                <button
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${currentTheme.button} hover:scale-105 w-full`}
                  onClick={() => setShowExportMenu(m => !m)}
                  aria-haspopup="menu"
                  aria-expanded={showExportMenu}
                  aria-controls="export-menu"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Escape') setShowExportMenu(false); }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs">Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div id="export-menu" role="menu" className={`absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700`}> 
                    <button role="menuitem" tabIndex={0} onClick={() => { setShowExportMenu(false); exportChart('png', 'high'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">PNG</button>
                    <button role="menuitem" tabIndex={0} onClick={() => { setShowExportMenu(false); exportChart('jpeg', 'high'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">JPEG</button>
                    <button role="menuitem" tabIndex={0} onClick={() => { setShowExportMenu(false); exportChart('pdf', 'high'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">PDF</button>
                    <button role="menuitem" tabIndex={0} onClick={() => { setShowExportMenu(false); exportChart('svg', 'high'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">SVG</button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${currentTheme.text}`}>Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <div className={`px-3 py-2 rounded-xl ${currentTheme.card} border`}>
                  <div className={`${currentTheme.textSecondary}`}>Total Records</div>
                  <div className={`font-bold text-lg ${currentTheme.text}`}>{filteredData.length}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Chart Area */}
        <div className="p-4 sm:p-6">
          {viewMode === '2d' ? (
            <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData} margin={{ top: 20, right: 80, bottom: 60, left: 60 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="timestamp"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="ppv"
                    orientation="left"
                    label={{ value: 'PPV (mm/s)', angle: -90, position: 'insideLeft' }}
                    stroke={theme === 'dark' ? '#3b82f6' : '#1e40af'}
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="airblast"
                    orientation="right"
                    label={{ value: 'Air Blast (dB)', angle: 90, position: 'insideRight' }}
                    stroke={theme === 'dark' ? '#ef4444' : '#dc2626'}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  
                  {ppvVisible && (
                    <Scatter
                      yAxisId="ppv"
                      name="PPV (mm/s)"
                      dataKey="ppvDisplay"
                      fill={theme === 'dark' ? '#3b82f6' : '#1e40af'}
                      strokeWidth={2}
                      stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
                      opacity={0.8}
                    />
                  )}
                  
                  {airBlastVisible && (
                    <Scatter
                      yAxisId="airblast"
                      name="Air Blast (dB)"
                      dataKey="airBlastDisplay"
                      fill={theme === 'dark' ? '#ef4444' : '#dc2626'}
                      strokeWidth={2}
                      stroke={theme === 'dark' ? '#f87171' : '#ef4444'}
                      opacity={0.8}
                      shape="triangle"
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div 
              ref={mount3D} 
              className="h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-gray-300/20"
              style={{ background: theme === 'dark' ? '#0a0a0a' : '#f8fafc' }}
            />
          )}
        </div>

        {/* Data Visibility Controls - Positioned below X-axis */}
        <div className="p-4 sm:p-6 border-t border-gray-300/20">
          <div className="max-w-md mx-auto">
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${currentTheme.text} text-center`}>Data Visibility</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setPpvVisible(!ppvVisible)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    ppvVisible ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : currentTheme.button
                  }`}
                >
                  {ppvVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">PPV Data</span>
                </button>
                <button
                  onClick={() => setAirBlastVisible(!airBlastVisible)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    airBlastVisible ? 'bg-red-500/20 text-red-400 border border-red-500/30' : currentTheme.button
                  }`}
                >
                  {airBlastVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">Air Blast Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 sm:p-6 border-t border-gray-300/20 ${currentTheme.textSecondary} text-center`}>
          <p className="text-sm">
            Powered by Advanced Visualization Technology • 
            {viewMode === '2d' ? ' Interactive 2D Scatter Plot' : ' Immersive 3D Visualization'} • 
            Auto-responsive Design
          </p>
        </div>

      </div>
    </div>
  );
};

export default GroundAirVibrationScatter;
