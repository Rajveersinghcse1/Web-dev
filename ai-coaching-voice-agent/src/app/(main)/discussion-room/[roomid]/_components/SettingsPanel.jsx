"use client";
import React from 'react';
import { 
    Mic, Volume2, Wifi, Activity, Globe, 
    Monitor, Cpu, Zap, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPanel({ 
    sttMode, 
    setSttMode, 
    voiceEnabled, 
    setVoiceEnabled,
    serviceStatus,
    audioLevel
}) {
    return (
        <div className="h-full bg-gray-50/50 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-white">
                <h3 className="font-semibold text-gray-900">Session Settings</h3>
                <p className="text-xs text-gray-500 mt-1">Configure your audio and AI preferences</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Audio Input Section */}
                <section className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Mic className="w-3 h-3" /> Audio Input
                    </h4>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Input Source</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Active
                            </span>
                        </div>
                        <div className="p-3 space-y-2">
                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sttMode === 'assemblyai' ? 'border-purple-600' : 'border-gray-300'}`}>
                                        {sttMode === 'assemblyai' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">AssemblyAI</p>
                                        <p className="text-xs text-gray-500">High accuracy, lower latency</p>
                                    </div>
                                </div>
                            </label>
                            
                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sttMode === 'web-speech' ? 'border-purple-600' : 'border-gray-300'}`}>
                                        {sttMode === 'web-speech' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Browser Speech</p>
                                        <p className="text-xs text-gray-500">Native, no API key required</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Audio Output Section */}
                <section className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Volume2 className="w-3 h-3" /> Audio Output
                    </h4>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Voice Response</span>
                            <button 
                                onClick={() => setVoiceEnabled(!voiceEnabled)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${voiceEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${voiceEnabled ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Volume</span>
                                <span>80%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[80%]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* System Status */}
                <section className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> System Status
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center gap-2">
                            <div className={`p-2 rounded-full ${serviceStatus.network ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                <Wifi className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium text-gray-600">Network</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center gap-2">
                            <div className={`p-2 rounded-full ${serviceStatus.pythonTTS ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium text-gray-600">TTS Server</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <Button variant="outline" className="w-full gap-2 text-gray-600">
                    <RefreshCw className="w-4 h-4" />
                    Reset Session Settings
                </Button>
            </div>
        </div>
    );
}
