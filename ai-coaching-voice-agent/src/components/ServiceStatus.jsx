'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wifi, 
    WifiOff, 
    Mic, 
    Volume2, 
    Server, 
    CheckCircle, 
    XCircle,
    AlertCircle,
    RefreshCw,
    Loader2,
    Activity,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { checkAllServices, getNetworkStatus } from '@/services/GlobalServices';

/**
 * Service Status Component
 * Monitors and displays the health of system services
 * Modernized with glassmorphism and advanced animations
 */

export default function ServiceStatus({ compact = false }) {
    const [status, setStatus] = useState({
        network: true,
        pythonTTS: null,
        assemblyAI: null,
        gemini: null
    });
    const [checking, setChecking] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);

    const checkServices = async () => {
        setChecking(true);
        try {
            const results = await checkAllServices();
            setStatus(results);
            setLastChecked(new Date());
        } catch (error) {
            console.error('Service check error:', error);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        // Initial check
        const network = getNetworkStatus();
        setStatus(prev => ({ ...prev, network: network.online }));
        
        // Full service check after mount
        checkServices();

        // Listen for network changes
        const handleOnline = () => setStatus(prev => ({ ...prev, network: true }));
        const handleOffline = () => setStatus(prev => ({ ...prev, network: false }));
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const getStatusColor = (value) => {
        if (value === null) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        if (value === true) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(status.network)}`}>
                    {status.network ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {status.network ? 'Online' : 'Offline'}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(status.pythonTTS)}`}>
                    <Volume2 className="w-3 h-3" />
                    TTS
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(status.assemblyAI)}`}>
                    <Mic className="w-3 h-3" />
                    STT
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-xl p-6 relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30">
                        <Activity className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-black flex items-center gap-2">
                            System Status
                            {checking && <Loader2 className="w-3 h-3 animate-spin text-violet-400" />}
                        </h3>
                        {lastChecked && (
                            <div className="text-xs text-gray-700 mt-0.5">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={checkServices}
                    disabled={checking}
                    className="gap-2 text-gray-800 hover:text-black"
                >
                    <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {/* Network */}
                <StatusCard 
                    icon={status.network ? Wifi : WifiOff}
                    label="Network"
                    status={status.network}
                    statusText={status.network ? 'Connected' : 'Disconnected'}
                    delay={0.1}
                />

                {/* Python TTS */}
                <StatusCard 
                    icon={Volume2}
                    label="TTS Engine"
                    status={status.pythonTTS}
                    statusText={status.pythonTTS === null ? 'Checking...' : status.pythonTTS ? 'Neural Voice' : 'Browser Fallback'}
                    delay={0.2}
                />

                {/* AssemblyAI */}
                <StatusCard 
                    icon={Mic}
                    label="Speech Recog"
                    status={status.assemblyAI}
                    statusText={status.assemblyAI === null ? 'Checking...' : status.assemblyAI ? 'AssemblyAI' : 'Browser API'}
                    delay={0.3}
                />

                {/* Gemini AI */}
                <StatusCard 
                    icon={Zap}
                    label="AI Model"
                    status={status.gemini}
                    statusText={status.gemini === null ? 'Checking...' : status.gemini ? 'Gemini 2.0' : 'Unavailable'}
                    delay={0.4}
                />
            </div>

            {/* Warnings */}
            <AnimatePresence>
                {(!status.network || status.gemini === false) && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl relative z-10"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-orange-500/20 rounded-lg shrink-0">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-orange-900">Service Issues Detected</p>
                                <p className="text-xs text-orange-900/60 mt-1 leading-relaxed">
                                    {!status.network && 'No internet connection. Some features may not work. '}
                                    {status.gemini === false && 'AI service unavailable. Check your API key.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function StatusCard({ icon: Icon, label, status, statusText, delay }) {
    const getColors = (s) => {
        if (s === null) return {
            bg: 'bg-yellow-500/5',
            border: 'border-yellow-500/10',
            iconBg: 'bg-yellow-500/10',
            icon: 'text-yellow-400',
            text: 'text-yellow-900/60',
            indicator: 'bg-yellow-500'
        };
        if (s === true) return {
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/10',
            iconBg: 'bg-emerald-500/10',
            icon: 'text-emerald-400',
            text: 'text-emerald-900/60',
            indicator: 'bg-emerald-500'
        };
        return {
            bg: 'bg-red-500/5',
            border: 'border-red-500/10',
            iconBg: 'bg-red-500/10',
            icon: 'text-red-400',
            text: 'text-red-900/60',
            indicator: 'bg-red-500'
        };
    };

    const colors = getColors(status);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm hover:bg-white transition-colors group`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${colors.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className={`w-2 h-2 rounded-full ${colors.indicator} shadow-[0_0_8px_currentColor] opacity-60`} />
            </div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className={`text-sm font-medium ${colors.text.replace('/60', '')}`}>
                {statusText}
            </p>
        </motion.div>
    );
}
