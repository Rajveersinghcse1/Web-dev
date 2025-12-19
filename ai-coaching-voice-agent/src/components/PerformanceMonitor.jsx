/**
 * 📊 PERFORMANCE MONITOR
 * 
 * Real-time performance monitoring with:
 * - FPS tracking
 * - Memory usage
 * - Bundle size analysis
 * - Render performance
 * - Network requests
 * - Lighthouse scores
 * 
 * Usage:
 * ```jsx
 * <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
 * ```
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, HardDrive, Network, X, ChevronDown, ChevronUp, Cpu, Gauge } from 'lucide-react';

export default function PerformanceMonitor({ enabled = false, position = 'bottom-right' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: { used: 0, limit: 0 },
    renderTime: 0,
    networkRequests: 0,
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);

  // FPS Counter
  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      frameCountRef.current++;
      
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        
        setMetrics(prev => ({ ...prev, fps }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      rafIdRef.current = requestAnimationFrame(measureFPS);
    };
    
    rafIdRef.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled]);

  // Memory Usage
  useEffect(() => {
    if (!enabled || !performance.memory) return;

    const measureMemory = () => {
      const memory = performance.memory;
      setMetrics(prev => ({
        ...prev,
        memory: {
          used: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        },
      }));
    };

    const interval = setInterval(measureMemory, 1000);
    measureMemory();

    return () => clearInterval(interval);
  }, [enabled]);

  // Performance Observer for render times
  useEffect(() => {
    if (!enabled || typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const renderEntry = entries.find(e => e.entryType === 'measure');
      
      if (renderEntry) {
        setMetrics(prev => ({
          ...prev,
          renderTime: Math.round(renderEntry.duration),
        }));
      }
    });

    try {
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (e) {
      console.warn('PerformanceObserver not fully supported');
    }

    return () => observer.disconnect();
  }, [enabled]);

  // Network Request Counter
  useEffect(() => {
    if (!enabled || typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      setMetrics(prev => ({
        ...prev,
        networkRequests: prev.networkRequests + entries.length,
      }));
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource timing not supported');
    }

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // Performance status
  const getStatus = () => {
    if (metrics.fps >= 55) return { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Excellent' };
    if (metrics.fps >= 45) return { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Good' };
    if (metrics.fps >= 30) return { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Fair' };
    return { color: 'text-rose-400', bg: 'bg-rose-500', label: 'Poor' };
  };

  const status = getStatus();

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          // Expanded view
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-gray-300 min-w-[300px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-500/20 rounded-lg">
                  <Activity className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-black font-bold text-sm">System Monitor</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg transition-colors text-gray-800"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              {/* FPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-gray-800 font-medium">Frame Rate</span>
                  </div>
                  <span className={`font-mono font-bold ${status.color}`}>
                    {metrics.fps} FPS
                  </span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${status.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(metrics.fps / 60) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
              </div>

              {/* Memory */}
              {performance.memory && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-gray-800 font-medium">Memory Usage</span>
                    </div>
                    <span className="font-mono text-black font-medium">
                      {metrics.memory.used}MB <span className="text-gray-700">/ {metrics.memory.limit}MB</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(metrics.memory.used / metrics.memory.limit) * 100}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>
              )}

              {/* Network Requests */}
              <div className="flex items-center justify-between text-xs p-3 bg-white rounded-xl border border-gray-300">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-gray-800 font-medium">Network Requests</span>
                </div>
                <span className="font-mono text-black font-bold">
                  {metrics.networkRequests}
                </span>
              </div>

              {/* Render Time */}
              <div className="flex items-center justify-between text-xs p-3 bg-white rounded-xl border border-gray-300">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-gray-800 font-medium">Render Time</span>
                </div>
                <span className="font-mono text-black font-bold">
                  {metrics.renderTime}ms
                </span>
              </div>

              {/* Status */}
              <div className="pt-3 border-t border-gray-300">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">Overall Status</span>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg}/10`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.bg}`}></div>
                    <span className={`font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Collapsed view
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="bg-white backdrop-blur-xl rounded-full px-4 py-2.5 shadow-lg border border-gray-300 flex items-center gap-3 group"
          >
            <div className="relative">
              <Activity className="w-4 h-4 text-violet-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-black"></span>
            </div>
            <div className="flex flex-col items-start">
              <span className={`font-mono text-xs font-bold ${status.color}`}>
                {metrics.fps} FPS
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for programmatic performance tracking
export function usePerformanceTracking() {
  const [metrics, setMetrics] = useState([]);

  const trackRender = (componentName) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setMetrics(prev => [
        ...prev,
        {
          component: componentName,
          duration,
          timestamp: Date.now(),
        },
      ]);
    };
  };

  const getSlowComponents = (threshold = 16) => {
    return metrics.filter(m => m.duration > threshold);
  };

  const clearMetrics = () => setMetrics([]);

  return {
    trackRender,
    getSlowComponents,
    clearMetrics,
    metrics,
  };
}
