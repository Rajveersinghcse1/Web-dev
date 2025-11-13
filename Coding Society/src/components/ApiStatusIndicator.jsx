import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Server, Shield, Zap } from 'lucide-react';
import codeExecutionService from '../services/codeExecutionService';

/**
 * API Status Indicator Component
 * Shows the current status of the Piston API and execution mode
 */
const ApiStatusIndicator = ({ className = '' }) => {
  const [apiStatus, setApiStatus] = useState({
    available: false,
    status: 0,
    runtimeCount: 0,
    loading: true
  });
  const [isRealMode, setIsRealMode] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await codeExecutionService.getApiStatus();
      setApiStatus({ ...status, loading: false });
      setLastCheck(new Date());
    } catch (error) {
      setApiStatus({
        available: false,
        status: 0,
        runtimeCount: 0,
        loading: false,
        error: error.message
      });
      setLastCheck(new Date());
    }
  };

  const toggleApiMode = () => {
    const newMode = !isRealMode;
    setIsRealMode(newMode);
    codeExecutionService.setApiMode(newMode);
  };

  const getStatusColor = () => {
    if (apiStatus.loading) return 'text-yellow-500';
    if (apiStatus.available && isRealMode) return 'text-green-500';
    if (!apiStatus.available && isRealMode) return 'text-red-500';
    return 'text-blue-500'; // Simulation mode
  };

  const getStatusIcon = () => {
    if (apiStatus.loading) return Activity;
    if (apiStatus.available && isRealMode) return Server;
    if (!apiStatus.available && isRealMode) return WifiOff;
    return Shield; // Simulation mode
  };

  const getStatusText = () => {
    if (apiStatus.loading) return 'Checking API...';
    if (!isRealMode) return 'Simulation Mode';
    if (apiStatus.available) return `API Online (${apiStatus.runtimeCount} languages)`;
    return 'API Offline';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
        <span className="text-sm font-medium text-white">{getStatusText()}</span>
        
        {/* Mode Toggle Button */}
        <button
          onClick={toggleApiMode}
          className="ml-2 px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
          title={isRealMode ? 'Switch to Simulation Mode' : 'Switch to Real API Mode'}
        >
          {isRealMode ? <Zap className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
        </button>
      </div>
      
      {/* Detailed Status Tooltip */}
      <div className="relative group">
        <button className="text-white/60 hover:text-white/80 transition-colors">
          <Activity className="w-4 h-4" />
        </button>
        
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Execution Mode:</span>
              <span className={`font-medium ${isRealMode ? 'text-green-400' : 'text-blue-400'}`}>
                {isRealMode ? 'Real API' : 'Simulation'}
              </span>
            </div>
            
            {isRealMode && (
              <>
                <div className="flex justify-between">
                  <span>API Status:</span>
                  <span className={`font-medium ${apiStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                    {apiStatus.available ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Languages:</span>
                  <span className="font-medium">{apiStatus.runtimeCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Response Code:</span>
                  <span className="font-medium">{apiStatus.status || 'N/A'}</span>
                </div>
              </>
            )}
            
            {lastCheck && (
              <div className="flex justify-between text-gray-400">
                <span>Last Check:</span>
                <span>{lastCheck.toLocaleTimeString()}</span>
              </div>
            )}
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <p className="text-gray-400">
                {isRealMode 
                  ? 'Using Piston API for real code execution across 50+ languages'
                  : 'Using local simulation for basic code execution patterns'
                }
              </p>
            </div>
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusIndicator;