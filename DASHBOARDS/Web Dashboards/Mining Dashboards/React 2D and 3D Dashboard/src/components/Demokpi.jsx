import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import * as THREE from 'three';
import { 
  Activity, 
  Download, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  Minimize2,
  Calendar,
  FileText,
  BarChart3,
  Box,
  Filter,
  Zap
} from 'lucide-react';

// Sample realistic blast monitoring data
const generateSampleData = () => {
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
  const data = [];
  
  for (let i = 0; i < 150; i++) {
    const date = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const hasPPV = Math.random() > 0.1;
    const hasAirBlast = Math.random() > 0.1;
    
    // Skip records where both are missing/zero
    if (!hasPPV && !hasAirBlast) continue;
    
    data.push({
      id: i,
      blastdate: date.toISOString().split('T')[0],
      ppv: hasPPV ? Math.random() * 20 + 0.5 : null,
      air_blast: hasAirBlast ? Math.random() * 120 + 80 : null,
      location: zones[Math.floor(Math.random() * zones.length)],
      timestamp: date.getTime()
    });
  }
  
  return data.sort((a, b) => new Date(a.blastdate) - new Date(b.blastdate));
};

const BlastVisualizationApp = () => {
  // Core state
  const [data] = useState(generateSampleData);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter state
  const [filterMode, setFilterMode] = useState('date'); // 'date' or 'year'
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [startYear, setStartYear] = useState(2023);
  const [endYear, setEndYear] = useState(2023);
  
  // Visibility controls
  const [showPPV, setShowPPV] = useState(true);
  const [showAirBlast, setShowAirBlast] = useState(true);
  
  // Device detection
  const [deviceType, setDeviceType] = useState('desktop');
  
  // 3D refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const labelsRef = useRef([]);
  
  // Device detection effect
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };
    
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);
  
  // Filter data based on current settings
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Exclude records with no valid data
      const hasValidPPV = item.ppv !== null && item.ppv !== undefined && item.ppv > 0;
      const hasValidAirBlast = item.air_blast !== null && item.air_blast !== undefined && item.air_blast > 0;
      
      if (!hasValidPPV && !hasValidAirBlast) return false;
      
      // Apply visibility filters
      const shouldShowPPV = showPPV && hasValidPPV;
      const shouldShowAirBlast = showAirBlast && hasValidAirBlast;
      
      if (!shouldShowPPV && !shouldShowAirBlast) return false;
      
      // Apply date/year filters
      const itemDate = new Date(item.blastdate);
      
      if (filterMode === 'date') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      } else {
        const itemYear = itemDate.getFullYear();
        return itemYear >= startYear && itemYear <= endYear;
      }
    });
  }, [data, filterMode, startDate, endDate, startYear, endYear, showPPV, showAirBlast]);
  
  // Prepare chart data with proper formatting for dual axis
  const chartData = useMemo(() => {
    return filteredData.map(item => {
      const date = new Date(item.blastdate);
      return {
        ...item,
        displayPPV: showPPV ? item.ppv : null,
        displayAirBlast: showAirBlast ? item.air_blast : null,
        date: date.toLocaleDateString(),
        dateValue: date.getTime(), // For X-axis positioning
        ppvForAxis: showPPV && item.ppv ? item.ppv : undefined,
        airBlastForAxis: showAirBlast && item.air_blast ? item.air_blast : undefined
      };
    }).sort((a, b) => a.dateValue - b.dateValue);
  }, [filteredData, showPPV, showAirBlast]);
  
  // 3D Scene Setup with enhanced labels and controls
  const setup3DScene = useCallback(() => {
    if (!mountRef.current || viewMode !== '3d') return;
    
    // Clean up existing scene
    if (rendererRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
    
    // Clear existing labels
    labelsRef.current.forEach(label => {
      if (label.parentNode) label.parentNode.removeChild(label);
    });
    labelsRef.current = [];
    
    // Scene setup
    const scene = new THREE.Scene();
    const bgColor = isDarkMode ? 0x0f0f23 : 0xf8fafc;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 50, 200);
    
    // Camera with better positioning
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 25,60);
    cameraRef.current = camera;
    
    // Enhanced Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true // Important for exports
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Enhanced Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.3 : 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, isDarkMode ? 0.8 : 1.0);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far =200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // Colored accent lights
    const ppvLight = new THREE.PointLight(0x3b82f6, 0.4, 30);
    ppvLight.position.set(-20, 15, -20);
    scene.add(ppvLight);
    
    const airBlastLight = new THREE.PointLight(0xef4444, 0.4, 30);
    airBlastLight.position.set(20, 15, 20);
    scene.add(airBlastLight);
    
    // Enhanced Grid with colors
    const gridHelper = new THREE.GridHelper(80, 40, 
      isDarkMode ? 0x3b82f6 : 0x6366f1, 
      isDarkMode ? 0x374151 : 0x9ca3af
    );
    gridHelper.material.opacity = isDarkMode ? 0.4 : 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Add axis labels as 3D text
    const loader = new THREE.FontLoader();
    
    // Create simple 3D text labels using CSS3D or simple geometry
    const createAxisLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      
      context.fillStyle = isDarkMode ? '#ffffff' : '#000000';
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      context.fillText(text, 128, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(8, 2, 1);
      
      return sprite;
    };
    
    // Add axis labels
    scene.add(createAxisLabel('PPV (mm/s)', new THREE.Vector3(-45, 5, 0), 0x3b82f6));
    scene.add(createAxisLabel('Air Blast (dB)', new THREE.Vector3(45, 5, 0), 0xef4444));
    scene.add(createAxisLabel('Timeline', new THREE.Vector3(0, 5, -45), 0x10b981));
    
    // Enhanced geometries
    const ppvGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const airBlastGeometry = new THREE.ConeGeometry(0.8, 2.0, 8);
    
    // Add data points with enhanced materials
    filteredData.forEach((item, index) => {
      const timeProgress = index / (filteredData.length - 1);
      const x = (timeProgress - 0.5) * 60; // Spread along timeline
      const z = (Math.random() - 0.5) * 20; // Some random spread
      
      // PPV points (enhanced spheres)
      if (showPPV && item.ppv) {
        const intensity = Math.min(item.ppv / 20, 1);
        const hue = 0.6 - intensity * 0.4; // Blue to red gradient
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
        
        const ppvMaterial = new THREE.MeshPhongMaterial({ 
          color: color,
          emissive: color,
          emissiveIntensity: 0.2,
          shininess: 100,
          transparent: true,
          opacity: 0.9
        });
        
        const ppvMesh = new THREE.Mesh(ppvGeometry, ppvMaterial);
        ppvMesh.position.set(x - 5, item.ppv * 1.5, z);
        ppvMesh.castShadow = true;
        ppvMesh.receiveShadow = true;
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.1
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(ppvMesh.position);
        
        scene.add(ppvMesh);
        scene.add(glowMesh);
        
        // Store data for tooltips
        ppvMesh.userData = {
          type: 'ppv',
          value: item.ppv,
          date: item.blastdate,
          location: item.location
        };
      }
      
      // Air blast points (enhanced cones)
      if (showAirBlast && item.air_blast) {
        const intensity = Math.min((item.air_blast - 80) / 120, 1);
        const color = new THREE.Color().setHSL(0.0, 0.9, 0.4 + intensity * 0.3);
        
        const airBlastMaterial = new THREE.MeshPhongMaterial({ 
          color: color,
          emissive: color,
          emissiveIntensity: 0.15,
          shininess: 80,
          transparent: true,
          opacity: 0.85
        });
        
        const airBlastMesh = new THREE.Mesh(airBlastGeometry, airBlastMaterial);
        airBlastMesh.position.set(x + 5, (item.air_blast - 80) / 8, z);
        airBlastMesh.castShadow = true;
        airBlastMesh.receiveShadow = true;
        
        scene.add(airBlastMesh);
        
        // Store data for tooltips
        airBlastMesh.userData = {
          type: 'airblast',
          value: item.air_blast,
          date: item.blastdate,
          location: item.location
        };
      }
    });
    
    // Add reference planes
    const ppvPlaneGeometry = new THREE.PlaneGeometry(60, 30);
    const ppvPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    });
    const ppvPlane = new THREE.Mesh(ppvPlaneGeometry, ppvPlaneMaterial);
    ppvPlane.rotation.z = Math.PI / 2;
    ppvPlane.position.set(-5, 15, 0);
    scene.add(ppvPlane);
    
    const airBlastPlaneGeometry = new THREE.PlaneGeometry(60, 30);
    const airBlastPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    });
    const airBlastPlane = new THREE.Mesh(airBlastPlaneGeometry, airBlastPlaneMaterial);
    airBlastPlane.rotation.z = Math.PI / 2;
    airBlastPlane.position.set(5, 15, 0);
    scene.add(airBlastPlane);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    
    // Animation loop with smooth camera movement
    let autoRotateSpeed = 0.005;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Smooth auto-rotation
      if (scene) {
        scene.rotation.y += autoRotateSpeed;
      }
      
      // Animate glow effects
      scene.traverse((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          const time = Date.now() * 0.001;
          child.material.emissiveIntensity = 0.1 + Math.sin(time + child.position.x) * 0.05;
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Enhanced resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [filteredData, viewMode, isDarkMode, showPPV, showAirBlast]);
  
  // Setup 3D scene when switching to 3D mode
  useEffect(() => {
    if (viewMode === '3d') {
      const cleanup = setup3DScene();
      return cleanup;
    } else {
      // Cleanup when switching away from 3D
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [setup3DScene, viewMode]);
  
  // Enhanced export functionality
  const exportData = async (format) => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `blast-analysis-${timestamp}`;
      
      if (format === 'png' || format === 'jpeg') {
        let element;
        
        if (viewMode === '3d' && rendererRef.current) {
          // Export 3D scene directly
          const canvas = rendererRef.current.domElement;
          const link = document.createElement('a');
          link.download = `${filename}.${format}`;
          
          if (format === 'png') {
            link.href = canvas.toDataURL('image/png');
          } else {
            link.href = canvas.toDataURL('image/jpeg', 0.9);
          }
          link.click();
          return;
        } else {
          // Export 2D chart
          element = document.querySelector('.chart-container');
        }
        
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(element, { 
          scale: 2,
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          useCORS: true,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        
        if (format === 'png') {
          link.href = canvas.toDataURL('image/png');
        } else {
          link.href = canvas.toDataURL('image/jpeg', 0.9);
        }
        link.click();
        
      } else if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        
        let canvas;
        if (viewMode === '3d' && rendererRef.current) {
          canvas = rendererRef.current.domElement;
        } else {
          const { default: html2canvas } = await import('html2canvas');
          const element = document.querySelector('.chart-container');
          canvas = await html2canvas(element, { 
            scale: 2,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
          });
        }
        
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(isDarkMode ? 255 : 0);
        pdf.text('Blast Monitoring Analysis Report', 20, 25);
        
        pdf.setFontSize(12);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
        pdf.text(`Mode: ${viewMode.toUpperCase()} Visualization`, 20, 42);
        pdf.text(`Records: ${filteredData.length}`, 20, 49);
        pdf.text(`Filter: ${filterMode === 'date' ? `${startDate} to ${endDate}` : `${startYear} to ${endYear}`}`, 20, 56);
        
        // Chart
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const yPosition = Math.min(65, pageHeight - imgHeight - 20);
        
        pdf.addImage(
          canvas.toDataURL('image/png'), 
          'PNG', 
          20, 
          yPosition, 
          imgWidth, 
          Math.min(imgHeight, pageHeight - yPosition - 20)
        );
        
        // Footer
        pdf.setFontSize(10);
        pdf.text(`Page 1 of 1 • Blast Monitoring Dashboard • ${new Date().toLocaleDateString()}`, 
                 20, pageHeight - 10);
        
        pdf.save(`${filename}.pdf`);
      }
      
      // Show success notification
      console.log(`Export completed: ${filename}.${format}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };
  
  // Enhanced custom tooltip with better colors
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className={`p-4 rounded-xl shadow-2xl border-2 backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-600 text-white' 
          : 'bg-white/90 border-gray-300 text-gray-900'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <p className="font-bold text-lg">{data.location}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            📅 {data.date}
          </p>
          {data.displayPPV && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm">
                <span className="font-medium text-blue-400">PPV:</span> 
                <span className="ml-1 font-bold">{data.displayPPV.toFixed(2)} mm/s</span>
              </p>
            </div>
          )}
          {data.displayAirBlast && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-sm">
                <span className="font-medium text-red-400">Air Blast:</span> 
                <span className="ml-1 font-bold">{data.displayAirBlast.toFixed(1)} dB</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Get responsive chart dimensions
  const getChartDimensions = () => {
    const baseHeight = deviceType === 'mobile' ? '60vh' : 
                      deviceType === 'tablet' ? '65vh' : '70vh';
    return { height: baseHeight };
  };
  
  // Get responsive margins
  const getChartMargins = () => {
    if (deviceType === 'mobile') {
      return { top: 10, right: 40, bottom: 80, left: 40 };
    } else if (deviceType === 'tablet') {
      return { top: 15, right: 60, bottom: 80, left: 50 };
    }
    return { top: 20, right: 80, bottom: 80, left: 60 };
  };
  
  const themeClasses = isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900';
  
  const cardClasses = isDarkMode
    ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700'
    : 'bg-white/80 backdrop-blur-sm border-gray-200';
  
  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses} ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Header */}
      <header className={`${cardClasses} border-b p-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">
                Blast Monitoring Dashboard
              </h1>
              <p className="text-sm opacity-75">
                {filteredData.length} records • Advanced Vibration Analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Device indicator */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
              {deviceType === 'mobile' && <Smartphone className="h-3 w-3" />}
              {deviceType === 'tablet' && <Tablet className="h-3 w-3" />}
              {deviceType === 'desktop' && <Monitor className="h-3 w-3" />}
              <span className="capitalize">{deviceType}</span>
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:scale-105 transition-transform"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* View mode toggle */}
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === '2d' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('3d')} 
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === '3d'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Box className="h-4 w-4" />
              </button>
            </div>
            
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:scale-105 transition-transform"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Controls */}
      <div className={`${cardClasses} border-b p-4`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filter Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Filter Mode
            </label>
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setFilterMode('date')}
                className={`flex-1 px-3 py-2 text-sm transition-colors ${
                  filterMode === 'date'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-1" />
                Date
              </button>
              <button
                onClick={() => setFilterMode('year')}
                className={`flex-1 px-3 py-2 text-sm transition-colors ${
                  filterMode === 'year'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          
          {/* Date/Year Inputs */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {filterMode === 'date' ? 'Date Range' : 'Year Range'}
            </label>
            <div className="flex gap-2">
              {filterMode === 'date' ? (
                <>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </>
              ) : (
                <>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                  >
                    {[2022, 2023, 2024].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                  >
                    {[2022, 2023, 2024].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
          
          {/* Visibility Controls */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Zap className="h-4 w-4 inline mr-1" />
              Data Visibility
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPPV(!showPPV)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  showPPV
                    ? 'bg-blue-500 text-white border-2 border-blue-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                }`}
              >
                {showPPV ? <Eye className="h-4 w-4 inline mr-1" /> : <EyeOff className="h-4 w-4 inline mr-1" />}
                PPV
              </button>
              <button
                onClick={() => setShowAirBlast(!showAirBlast)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  showAirBlast
                    ? 'bg-red-500 text-white border-2 border-red-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                }`}
              >
                {showAirBlast ? <Eye className="h-4 w-4 inline mr-1" /> : <EyeOff className="h-4 w-4 inline mr-1" />}
                Air Blast
              </button>
            </div>
          </div>
          
          {/* Export Controls */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Download className="h-4 w-4 inline mr-1" />
              Export
            </label>
            <select
              onChange={(e) => e.target.value && exportData(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
              defaultValue=""
            >
              <option value="" disabled>Select format...</option>
              <option value="png">PNG Image</option>
              <option value="jpeg">JPEG Image</option>
              <option value="pdf">PDF Report</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="p-4 flex-1">
        <div 
          className={`chart-container ${cardClasses} border rounded-lg p-4`}
          style={{ height: getChartDimensions().height }}
        >
          {viewMode === '2d' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={getChartMargins()}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  type="number"
                  dataKey="displayPPV"
                  domain={[0, 'dataMax + 2']}
                  name="PPV (mm/s)"
                  tick={{ fontSize: deviceType === 'mobile' ? 10 : 12 }}
                  angle={deviceType === 'mobile' ? -45 : 0}
                  textAnchor={deviceType === 'mobile' ? 'end' : 'middle'}
                  height={deviceType === 'mobile' ? 80 : 60}
                />
                <YAxis 
                  type="number"
                  dataKey="displayAirBlast"
                  domain={[0, 'dataMax + 10']}
                  name="Air Blast (dB)"
                  tick={{ fontSize: deviceType === 'mobile' ? 10 : 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                {showPPV && (
                  <Scatter
                    name="PPV (mm/s)"
                    data={chartData.filter(d => d.displayPPV)}
                    fill="#3b82f6"
                    fillOpacity={0.7}
                    r={deviceType === 'mobile' ? 4 : 6}
                  />
                )}
                {showAirBlast && (
                  <Scatter
                    name="Air Blast (dB)"
                    data={chartData.filter(d => d.displayAirBlast)}
                    fill="#ef4444"
                    fillOpacity={0.7}
                    r={deviceType === 'mobile' ? 4 : 6}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div ref={mountRef} className="w-full h-full rounded-lg overflow-hidden" />
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`${cardClasses} border-t p-4`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm opacity-75">
          <div>
            Blast Monitoring Dashboard • Enterprise Grade Visualization
          </div>
          <div className="flex items-center gap-4">
            <span>Records: {filteredData.length}</span>
            <span>•</span>
            <span>Mode: {viewMode.toUpperCase()}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlastVisualizationApp;