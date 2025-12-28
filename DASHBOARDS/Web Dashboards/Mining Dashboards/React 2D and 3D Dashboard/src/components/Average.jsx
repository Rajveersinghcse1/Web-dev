
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Sun, Moon, Calendar, TrendingUp, Eye, Layers, RotateCcw, ZoomIn, Menu, X } from 'lucide-react';
import * as THREE from 'three';

const Data = ({ filteredData = [] }) => {
  const [isDark, setIsDark] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('2D');
  const [timeMode, setTimeMode] = useState('Yearly');
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 3);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoveredData, setHoveredData] = useState(null);
  const [activeStacks, setActiveStacks] = useState({
    drilling: true,
    manpower: true,
    initiator: true,
    explosive: true
  });

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const meshesRef = useRef([]);

  // Sample data for demonstration
  const mockData = [
    { blastdate: "2024-01-15", drilling_cost: 15000, man_power_cost: 8000, blast_accessoriesdelay_cost: 3000, total_exp_cost: 12000 },
    { blastdate: "2024-02-20", drilling_cost: 18000, man_power_cost: 9500, blast_accessoriesdelay_cost: 3500, total_exp_cost: 14000 },
    { blastdate: "2024-03-10", drilling_cost: 16500, man_power_cost: 8800, blast_accessoriesdelay_cost: 3200, total_exp_cost: 13500 },
    { blastdate: "2024-04-05", drilling_cost: 19000, man_power_cost: 10000, blast_accessoriesdelay_cost: 4000, total_exp_cost: 15000 },
    { blastdate: "2024-05-12", drilling_cost: 17000, man_power_cost: 9200, blast_accessoriesdelay_cost: 3300, total_exp_cost: 13800 },
    { blastdate: "2024-06-08", drilling_cost: 20000, man_power_cost: 11000, blast_accessoriesdelay_cost: 4200, total_exp_cost: 16000 }
  ];

  const workingData = filteredData.length > 0 ? filteredData : mockData;

  // Filter out invalid data
  const validData = useMemo(() => {
    return workingData.filter(item => 
      item.total_exp_cost !== 0 && 
      item.total_exp_cost !== null && 
      item.total_exp_cost !== ""
    );
  }, [workingData]);

  // Process data based on time mode
  const processedData = useMemo(() => {
    if (timeMode === 'Yearly') {
      const yearlyData = {};
      validData.forEach(item => {
        const year = new Date(item.blastdate).getFullYear();
        if (year >= startYear && year <= endYear) {
          if (!yearlyData[year]) {
            yearlyData[year] = {
              period: year.toString(),
              drilling: 0,
              manpower: 0,
              initiator: 0,
              explosive: 0,
              count: 0
            };
          }
          yearlyData[year].drilling += item.drilling_cost;
          yearlyData[year].manpower += item.man_power_cost;
          yearlyData[year].initiator += item.blast_accessoriesdelay_cost;
          yearlyData[year].explosive += item.total_exp_cost;
          yearlyData[year].count += 1;
        }
      });
      
      return Object.values(yearlyData).map(item => ({
        ...item,
        drilling: Math.round(item.drilling / item.count),
        manpower: Math.round(item.manpower / item.count),
        initiator: Math.round(item.initiator / item.count),
        explosive: Math.round(item.explosive / item.count)
      }));
    } else {
      return validData
        .filter(item => {
          if (!startDate || !endDate) return true;
          const date = new Date(item.blastdate);
          return date >= new Date(startDate) && date <= new Date(endDate);
        })
        .map(item => ({
          period: item.blastdate,
          drilling: item.drilling_cost,
          manpower: item.man_power_cost,
          initiator: item.blast_accessoriesdelay_cost,
          explosive: item.total_exp_cost
        }));
    }
  }, [validData, timeMode, startYear, endYear, startDate, endDate]);

  // Export functionality
  const handleExport = (format) => {
    if (viewMode === '2D' && chartRef.current) {
      const svgElement = chartRef.current.querySelector('svg');
      if (svgElement) {
        exportChart(svgElement, format);
      }
    } else if (viewMode === '3D' && canvasRef.current) {
      export3DChart(canvasRef.current, format);
    }
    setIsExportOpen(false);
  };

  const exportChart = (svgElement, format) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = svgElement.clientWidth || 800;
    canvas.height = svgElement.clientHeight || 600;
    
    img.onload = () => {
      ctx.fillStyle = isDark ? '#1f2937' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `blast-cost-chart.${format}`;
      
      if (format === 'png' || format === 'jpeg') {
        link.href = canvas.toDataURL(`image/${format}`);
      } else if (format === 'pdf') {
        // For PDF, we'll use the PNG data
        link.href = canvas.toDataURL('image/png');
        link.download = 'blast-cost-chart.png';
      } else if (format === 'svg') {
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
      }
      
      link.click();
    };
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  const export3DChart = (canvas, format) => {
    const link = document.createElement('a');
    link.download = `blast-cost-3d-chart.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`);
    link.click();
  };

  // Initialize 3D scene
  useEffect(() => {
    if (viewMode === '3D' && canvasRef.current) {
      // Clean up previous scene
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDark ? 0x1a1a2e : 0xf8fafc);
      
      const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
      });
      
      const rect = canvasRef.current.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.4 : 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.6 : 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Add point lights for better illumination
      const pointLight1 = new THREE.PointLight(0x4f46e5, 0.5, 100);
      pointLight1.position.set(-10, 10, 10);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x06b6d4, 0.5, 100);
      pointLight2.position.set(10, 10, -10);
      scene.add(pointLight2);
      
      // Raycaster for hover detection
      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;
      
      // Create 3D bars
      const barWidth = 0.8;
      const barDepth = 0.8;
      const spacing = 2;
      const colors = {
        drilling: new THREE.Color(0x3b82f6),
        manpower: new THREE.Color(0x10b981),
        initiator: new THREE.Color(0xf59e0b),
        explosive: new THREE.Color(0xef4444)
      };

      const meshes = [];
      
      processedData.forEach((dataPoint, index) => {
        let currentHeight = 0;
        const xPos = (index - processedData.length / 2) * spacing;
        
        Object.entries(activeStacks).forEach(([key, isActive]) => {
          if (!isActive) return;
          
          const value = dataPoint[key] || 0;
          const normalizedHeight = Math.max(value / 5000, 0.1); // Normalize for visualization
          
          const geometry = new THREE.BoxGeometry(barWidth, normalizedHeight, barDepth);
          const material = new THREE.MeshPhongMaterial({ 
            color: colors[key],
            transparent: true,
            opacity: 0.9,
            shininess: 100
          });
          
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(xPos, currentHeight + normalizedHeight / 2, 0);
          cube.castShadow = true;
          cube.receiveShadow = true;
          
          // Add data to mesh for hover detection
          cube.userData = {
            period: dataPoint.period,
            category: key,
            value: value,
            originalColor: colors[key].clone()
          };
          
          scene.add(cube);
          meshes.push(cube);
          currentHeight += normalizedHeight;
        });
      });

      meshesRef.current = meshes;
      
      camera.position.set(0, 8, 30);
      camera.lookAt(0, 20, 0);
      
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      
      // Animation loop
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        
        // Smooth rotation
        scene.rotation.y += 0.003;
        
        renderer.render(scene, camera);
      };
      animate();
      
      // Mouse controls and hover detection
      let isMouseDown = false;
      let mouseX = 0;
      let mouseY = 0;
      
      const handleMouseDown = (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
      };
      
      const handleMouseMove = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (!isMouseDown) {
          // Hover detection
          raycaster.setFromCamera(mouseRef.current, camera);
          const intersects = raycaster.intersectObjects(meshes);
          
          // Reset all materials
          meshes.forEach(mesh => {
            mesh.material.color.copy(mesh.userData.originalColor);
            mesh.material.emissive.setHex(0x000000);
          });
          
          if (intersects.length > 0) {
            const hoveredMesh = intersects[0].object;
            hoveredMesh.material.emissive.setHex(0x333333);
            setHoveredData(hoveredMesh.userData);
            canvasRef.current.style.cursor = 'pointer';
          } else {
            setHoveredData(null);
            canvasRef.current.style.cursor = 'grab';
          }
        } else {
          const deltaX = event.clientX - mouseX;
          const deltaY = event.clientY - mouseY;
          
          scene.rotation.y += deltaX * 0.01;
          scene.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, scene.rotation.x + deltaY * 0.01));
          
          mouseX = event.clientX;
          mouseY = event.clientY;
          canvasRef.current.style.cursor = 'grabbing';
        }
      };
      
      const handleMouseUp = () => {
        isMouseDown = false;
        canvasRef.current.style.cursor = 'grab';
      };

      const handleMouseLeave = () => {
        setHoveredData(null);
        meshes.forEach(mesh => {
          mesh.material.color.copy(mesh.userData.originalColor);
          mesh.material.emissive.setHex(0x000000);
        });
      };
      
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      canvasRef.current.addEventListener('mouseup', handleMouseUp);
      canvasRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      // Handle window resize
      const handleResize = () => {
        if (canvasRef.current && camera && renderer) {
          const rect = canvasRef.current.getBoundingClientRect();
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          renderer.setSize(rect.width, rect.height);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('mousedown', handleMouseDown);
          canvasRef.current.removeEventListener('mousemove', handleMouseMove);
          canvasRef.current.removeEventListener('mouseup', handleMouseUp);
          canvasRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
        window.removeEventListener('resize', handleResize);
        if (renderer) {
          renderer.dispose();
        }
      };
    }
  }, [viewMode, processedData, activeStacks, isDark]);

  const toggleStack = (stackName) => {
    setActiveStacks(prev => ({
      ...prev,
      [stackName]: !prev[stackName]
    }));
  };

  const stackConfig = [
    { key: 'drilling', label: 'Drilling', color: '#3b82f6', icon: '🔧' },
    { key: 'manpower', label: 'Manpower', color: '#10b981', icon: '👥' },
    { key: 'initiator', label: 'Initiator', color: '#f59e0b', icon: '⚡' },
    { key: 'explosive', label: 'Explosive', color: '#ef4444', icon: '💥' }
  ];

  const exportOptions = [
    { label: 'PNG', value: 'png' },
    { label: 'JPEG', value: 'jpeg' },
    { label: 'PDF', value: 'pdf' },
    { label: 'SVG', value: 'svg' }
  ];

  const totalCost = processedData.reduce((sum, item) => 
    sum + (activeStacks.drilling ? item.drilling : 0) + 
          (activeStacks.manpower ? item.manpower : 0) + 
          (activeStacks.initiator ? item.initiator : 0) + 
          (activeStacks.explosive ? item.explosive : 0), 0
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="container mx-auto p-2 sm:p-4 lg:p-8">
        {/* Main Dashboard Card */}
        <div className={`backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border transition-all duration-500 ${
          isDark 
            ? 'bg-gray-800/90 border-gray-700/50 shadow-black/20' 
            : 'bg-white/80 border-white/20 shadow-purple-500/10'
        }`}>
          
          {/* Header Section - Mobile Optimized */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200/20">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Blast Cost Analytics
                  </h1>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Interactive dashboard • Total: ₹{totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`sm:hidden p-2 rounded-xl transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' 
                      : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
                  }`}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Desktop Controls */}
                <div className="hidden sm:flex items-center gap-3">
                  {/* Theme Toggle */}
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 ${
                      isDark 
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                        : 'bg-gray-900/10 text-gray-700 hover:bg-gray-900/20'
                    }`}
                  >
                    {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  
                  {/* Export Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsExportOpen(!isExportOpen)}
                      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 ${
                        isDark 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      }`}
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    {isExportOpen && (
                      <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${
                        isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
                      }`}>
                        {exportOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleExport(option.value)}
                            className={`w-full px-4 py-3 text-left transition-colors hover:bg-opacity-80 first:rounded-t-2xl last:rounded-b-2xl ${
                              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Export as {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden mt-4 pt-4 border-t border-gray-200/20">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-gray-900/10 text-gray-700'
                    }`}
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {isDark ? 'Light' : 'Dark'}
                  </button>
                  
                  <button
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-green-500/10 text-green-600'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Section - Mobile Optimized */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            
            {/* View Mode Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Eye className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  View Mode
                </span>
              </div>
              
              <div className={`flex rounded-xl sm:rounded-2xl p-1 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/80'}`}>
                {['2D', '3D'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 sm:flex-none sm:px-6 py-2 px-4 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                      viewMode === mode
                        ? isDark 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-blue-500 text-white shadow-lg'
                        : isDark 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    {mode} View
                  </button>
                ))}
              </div>
            </div>

            {/* Time Mode Controls - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time Period
                  </span>
                </div>
                
                <div className={`flex rounded-xl sm:rounded-2xl p-1 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/80'}`}>
                  {['Yearly', 'Daily'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeMode(mode)}
                      className={`flex-1 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                        timeMode === mode
                          ? isDark 
                            ? 'bg-purple-500 text-white shadow-lg' 
                            : 'bg-purple-500 text-white shadow-lg'
                          : isDark 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {timeMode === 'Yearly' ? (
                    <>
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Start Year
                        </label>
                        <input
                          type="number"
                          value={startYear}
                          onChange={(e) => setStartYear(parseInt(e.target.value))}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>

                       <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          End Year
                        </label>
                        <input
                          type="number"
                          value={endYear}
                          onChange={(e) => setEndYear(parseInt(e.target.value))}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white' 
                              : 'bg-white/80 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                       
                    </>
                  ) : (
                    <>
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white' 
                              : 'bg-white/80 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white' 
                              : 'bg-white/80 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section - Mobile Optimized */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 relative ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
              {viewMode === '2D' ? (
                <div className="h-64 sm:h-80 lg:h-96 xl:h-[500px]" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="period" 
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        fontSize={12}
                        tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          fontSize: '14px'
                        }}
                        formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                      />
                      <Legend />
                      {activeStacks.drilling && (
                        <Bar dataKey="drilling" stackId="cost" fill="#3b82f6" name="Drilling" radius={[0, 0, 0, 0]} />
                      )}
                      {activeStacks.manpower && (
                        <Bar dataKey="manpower" stackId="cost" fill="#10b981" name="Manpower" radius={[0, 0, 0, 0]} />
                      )}
                      {activeStacks.initiator && (
                        <Bar dataKey="initiator" stackId="cost" fill="#f59e0b" name="Initiator" radius={[0, 0, 0, 0]} />
                      )}
                      {activeStacks.explosive && (
                        <Bar dataKey="explosive" stackId="cost" fill="#ef4444" name="Explosive" radius={[2, 2, 0, 0]} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[500px] flex items-center justify-center">
                  <canvas 
                    ref={canvasRef}
                    className="rounded-xl sm:rounded-2xl shadow-inner max-w-full max-h-full"
                    style={{ width: '100%', height: '100%', cursor: 'grab' }}
                  />
                  
                  {/* 3D Controls Overlay */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col sm:flex-row gap-2">
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'}`}>
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      <span className="hidden sm:inline">Drag to rotate</span>
                      <span className="sm:hidden">Drag</span>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'}`}>
                      <ZoomIn className="w-3 h-3 inline mr-1" />
                      <span className="hidden sm:inline">Scroll to zoom</span>
                      <span className="sm:hidden">Scroll</span>
                    </div>
                  </div>

                  {/* Hover Data Display */}
                  {hoveredData && (
                    <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border max-w-xs ${
                      isDark ? 'bg-gray-800/95 border-gray-700 text-white' : 'bg-white/95 border-gray-200 text-gray-900'
                    }`}>
                      <div className="text-sm sm:text-base font-semibold mb-2">
                        {hoveredData.period}
                      </div>
                      <div className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stackConfig.find(s => s.key === hoveredData.category)?.color }}
                          />
                          <span className="capitalize">{hoveredData.category}:</span>
                        </div>
                        <div className="font-bold text-sm sm:text-base">
                          ₹{hoveredData.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stack Toggle Controls - Mobile Optimized */}
          <div className="p-4 sm:p-6 lg:p-8 pt-0">
            <div className="flex items-center gap-2 mb-4">
              <Layers className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Cost Categories
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 lg:gap-4">
              {stackConfig.map((stack) => (
                <button
                  key={stack.key}
                  onClick={() => toggleStack(stack.key)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
                    activeStacks[stack.key]
                      ? 'shadow-lg transform'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                  style={{
                    backgroundColor: activeStacks[stack.key] ? stack.color + '20' : (isDark ? '#374151' : '#f3f4f6'),
                    borderColor: stack.color,
                    borderWidth: activeStacks[stack.key] ? '2px' : '1px',
                    color: activeStacks[stack.key] ? stack.color : (isDark ? '#9ca3af' : '#6b7280')
                  }}
                >
                  <span className="text-base sm:text-lg">{stack.icon}</span>
                  <span className="font-medium hidden sm:inline">{stack.label}</span>
                  <span className="font-medium sm:hidden text-xs">{stack.label.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Export Menu */}
          {isExportOpen && (
            <div className="sm:hidden p-4 border-t border-gray-200/20">
              <div className="grid grid-cols-2 gap-2">
                {exportOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleExport(option.value)}
                    className={`p-3 rounded-xl transition-colors text-sm font-medium ${
                      isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-gray-100/50 text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    Export {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats - Mobile Optimized */}
        <div className="mt-4 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {stackConfig.map((stack) => (
            <div
              key={stack.key}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                isDark ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white/50 border-white/30'
              } border`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  style={{ backgroundColor: stack.color }}
                />
                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {stack.label}
                </span>
              </div>
              <div className={`mt-1 sm:mt-2 text-sm sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ₹{processedData
                  .reduce((sum, item) => sum + (activeStacks[stack.key] ? item[stack.key] : 0), 0)
                  .toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Data;