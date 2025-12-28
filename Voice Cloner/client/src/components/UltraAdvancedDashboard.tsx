import React, { useState, useEffect } from 'react';
import './UltraAdvancedDashboard.css';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  VoiceFrequencyChart,
  VoiceAmplitudeChart,
  VoicePitchChart,
  EmotionDistributionChart,
  VoiceQualityRadar,
  SpectralAnalysisChart,
} from './charts/VoiceAnalyticsCharts';
import {
  getRealTimeAnalytics,
  getDashboardStats,
  getEmotionDistribution,
  getVoiceQualityMetrics,
  generateAIInsights,
  exportAnalyticsReport,
  type VoiceAnalyticsData,
  type EmotionData,
  type QualityMetric,
} from '../services/analyticsService';
import {
  Mic,
  Volume2,
  BarChart3,
  Activity,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Download,
  Settings,
  Headphones,
  Radio,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Calendar,
  Eye,
  Star,
  Shield,
  Cpu,
  Waves,
  CheckCircle,
} from 'lucide-react';

interface DashboardStats {
  totalClones: number;
  activeUsers: number;
  avgClarity: number;
  successRate: number;
  avgProcessingTime: number;
}

const UltraAdvancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [realTimeData, setRealTimeData] = useState<VoiceAnalyticsData[]>([]);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [qualityData, setQualityData] = useState<QualityMetric[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalClones: 0,
    activeUsers: 0,
    avgClarity: 0,
    successRate: 0,
    avgProcessingTime: 0,
  });
  const [voiceMetrics, setVoiceMetrics] = useState({
    clarity: 85,
    similarity: 92,
    naturalness: 88,
    emotion: 'Neutral',
    confidence: 94,
    pitch: 220,
    volume: 75,
    duration: 0,
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [stats, emotions, quality, realTime] = await Promise.all([
          getDashboardStats(),
          getEmotionDistribution(),
          getVoiceQualityMetrics(),
          getRealTimeAnalytics(),
        ]);

        setDashboardStats(stats);
        setEmotionData(emotions);
        setQualityData(quality);
        setRealTimeData(realTime);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Simulated real-time data updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newData = await getRealTimeAnalytics();
        setRealTimeData(newData);
      } catch (error) {
        // Fallback to simulated data
        const newDataPoint = {
          frequency: Math.random() * 8000 + 85,
          amplitude: Math.random() * 100,
          pitch: Math.random() * 400 + 80,
          formant: Math.random() * 3000 + 500,
          spectralCentroid: Math.random() * 5000 + 1000,
          timestamp: new Date().toISOString(),
          emotion: ['Happy', 'Sad', 'Angry', 'Neutral', 'Excited'][Math.floor(Math.random() * 5)],
          clarity: Math.random() * 100,
          volume: Math.random() * 100,
          mfcc: Array.from({ length: 13 }, () => Math.random() * 2 - 1),
        };
        
        setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleExportReport = async (format: 'json' | 'csv' = 'json') => {
    try {
      await exportAnalyticsReport(format);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      const insights = await generateAIInsights();
      console.log('AI Insights:', insights);
      // You could show these insights in a modal or notification
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    trend?: 'up' | 'down';
  }> = ({ title, value, icon, change, trend }) => (
    <Card className="bg-slate-800 border-slate-600 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-300 mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                <p className={`text-sm font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {change}
                </p>
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <div className="text-blue-400">
                {icon}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Waves className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Voice Analytics Studio
                </h1>
                <p className="text-slate-400 mt-1 text-lg">Advanced AI-powered voice analysis and monitoring</p>
              </div>
            </div>
            
            {/* Real-time Status Indicator */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {isStreaming ? 'Live Data Stream' : 'Data Stream Paused'}
                </span>
              </div>
              <Badge variant="outline" className="border-blue-400 text-blue-400">
                <Activity className="mr-1 h-3 w-3" />
                Real-time
              </Badge>
            </div>
          </div>
          
          {/* Advanced Control Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Enhanced Time Range Selector */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-md rounded-2xl p-3 border border-slate-600/50 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="h-4 w-4 text-blue-400" />
              </div>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent text-sm text-white border-none outline-none cursor-pointer font-medium min-w-[120px] focus:text-blue-400 transition-colors"
                style={{
                  background: 'transparent',
                  color: 'white',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}
              >
                <option value="1h" style={{background: '#1e293b', color: 'white'}}>Last Hour</option>
                <option value="6h" style={{background: '#1e293b', color: 'white'}}>Last 6 Hours</option>
                <option value="24h" style={{background: '#1e293b', color: 'white'}}>Last 24 Hours</option>
                <option value="7d" style={{background: '#1e293b', color: 'white'}}>Last 7 Days</option>
              </select>
            </div>
            
            {/* Enhanced Filter Selector */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-md rounded-2xl p-3 border border-slate-600/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Filter className="h-4 w-4 text-purple-400" />
              </div>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-transparent text-sm text-white border-none outline-none cursor-pointer font-medium min-w-[140px] focus:text-purple-400 transition-colors"
                style={{
                  background: 'transparent',
                  color: 'white',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}
              >
                <option value="all" style={{background: '#1e293b', color: 'white'}}>All Data</option>
                <option value="high-quality" style={{background: '#1e293b', color: 'white'}}>High Quality</option>
                <option value="emotions" style={{background: '#1e293b', color: 'white'}}>Emotions Only</option>
                <option value="pitch" style={{background: '#1e293b', color: 'white'}}>Pitch Analysis</option>
              </select>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsStreaming(!isStreaming)}
                variant="outline"
                size="sm"
                className="group relative overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all duration-300 rounded-xl px-4 py-2 shadow-lg hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {isStreaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span className="font-medium">{isStreaming ? 'Pause' : 'Play'}</span>
                </div>
              </Button>
              
              <Button
                onClick={() => setIsRecording(!isRecording)}
                className={`group relative overflow-hidden ${
                  isRecording 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse shadow-red-500/30' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30'
                } text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl px-6 py-3 font-semibold`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Mic className={`h-5 w-5 ${isRecording ? 'animate-bounce' : ''}`} />
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="group relative overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all duration-300 rounded-xl p-3 shadow-lg hover:shadow-purple-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Settings className="h-4 w-4 relative" />
              </Button>
            </div>
          </div>
        </div>

        {/* Simplified Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Total Clones</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.totalClones.toLocaleString()}
                </p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/30">
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-900 border-green-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-200">Active Users</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.activeUsers}
                </p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.2%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/30">
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-purple-900 border-purple-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">Avg Clarity</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.avgClarity}%
                </p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.1%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/30">
                <Headphones className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-orange-900 border-orange-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-200">Success Rate</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.successRate}%
                </p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.8%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/30">
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-cyan-900 border-cyan-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-200">Processing Time</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.avgProcessingTime}s
                </p>
                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -0.3s
                </p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/30">
                <Clock className="h-8 w-8 text-cyan-200" />
              </div>
            </div>
          </Card>
        </div>

        {/* Simplified Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-slate-800 border border-slate-600 p-2 rounded-lg grid grid-cols-5 gap-2">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-colors duration-300"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="realtime" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-colors duration-300"
            >
              <Activity className="mr-2 h-4 w-4" />
              Real-time
            </TabsTrigger>
            <TabsTrigger 
              value="quality" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-colors duration-300"
            >
              <Brain className="mr-2 h-4 w-4" />
              Quality Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="spectral" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg transition-colors duration-300"
            >
              <Radio className="mr-2 h-4 w-4" />
              Spectral Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="emotions" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg transition-colors duration-300"
            >
              <Zap className="mr-2 h-4 w-4" />
              Emotion Tracking
            </TabsTrigger>
          </TabsList>

          {/* Simplified Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Chart Area */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="ultra-dashboard-card group p-6 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border-slate-700 hover:border-slate-600/70 shadow-2xl hover:shadow-3xl hover:scale-[1.01] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                  <div className="relative flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm group-hover:from-blue-400/30 group-hover:to-cyan-400/30 transition-all duration-300">
                        <Volume2 className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-slate-100 transition-colors duration-300">Voice Frequency Analysis</h3>
                        <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">Real-time frequency spectrum analysis</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-400/50 text-blue-400 hover:border-blue-300 hover:text-blue-300 backdrop-blur-sm bg-blue-500/10 transition-all duration-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                      Live
                    </Badge>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <VoiceFrequencyChart data={realTimeData} height={300} />
                  </div>
                </Card>

                <Card className="ultra-dashboard-card group p-6 bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 hover:border-emerald-600/50 shadow-2xl hover:shadow-3xl hover:scale-[1.01] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                  <div className="relative flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm group-hover:from-green-400/30 group-hover:to-emerald-400/30 transition-all duration-300">
                        <BarChart3 className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-slate-100 transition-colors duration-300">Amplitude & Volume</h3>
                        <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">Voice amplitude and volume levels</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">Peak</div>
                        <div className="text-lg font-semibold text-green-400 group-hover:text-green-300 transition-colors duration-300">94.2 dB</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <VoiceAmplitudeChart data={realTimeData} height={300} />
                  </div>
                </Card>
              </div>

              {/* Enhanced Side Panel */}
              <div className="space-y-6">
                {/* Real-time Voice Metrics */}
                <Card className="ultra-dashboard-card group p-6 bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 hover:border-purple-600/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                  <div className="relative flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm group-hover:from-purple-400/30 group-hover:to-violet-400/30 transition-all duration-300">
                      <Activity className="h-5 w-5 text-purple-400 group-hover:text-purple-300 group-hover:animate-pulse transition-all duration-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-slate-100 transition-colors duration-300">Live Metrics</h3>
                  </div>
                  <div className="relative space-y-4">
                    {[
                      { label: 'Pitch', value: '185 Hz', color: 'text-blue-400', progress: 65 },
                      { label: 'Clarity', value: '94.2%', color: 'text-green-400', progress: 94 },
                      { label: 'Volume', value: '78 dB', color: 'text-yellow-400', progress: 78 },
                      { label: 'Emotion', value: 'Calm', color: 'text-purple-400', progress: 85 }
                    ].map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm">{metric.label}</span>
                          <span className={`font-semibold ${metric.color}`}>{metric.value}</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              metric.label === 'Pitch' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              metric.label === 'Clarity' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              metric.label === 'Volume' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${metric.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Voice Quality Score */}
                <Card className="ultra-dashboard-card group p-6 bg-gradient-to-br from-cyan-900/40 via-blue-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 hover:border-cyan-600/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                  <div className="relative flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm group-hover:from-cyan-400/30 group-hover:to-blue-400/30 transition-all duration-300">
                      <Star className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 group-hover:animate-pulse transition-all duration-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-slate-100 transition-colors duration-300">Quality Score</h3>
                  </div>
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20"></div>
                      <div className="relative text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        94.2
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">Overall voice quality assessment</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">Excellent</div>
                        <div className="text-slate-400">Clarity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">Great</div>
                        <div className="text-slate-400">Tone</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="ultra-dashboard-card group p-6 bg-gradient-to-br from-orange-900/40 via-amber-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-sm">
                      <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    <Button className="ultra-action-btn group/btn relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-purple-400/20 to-indigo-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <div className="p-1 mr-2 rounded bg-white/10 backdrop-blur-sm">
                          <Download className="h-4 w-4" />
                        </div>
                        Export Report
                      </div>
                    </Button>
                    <Button className="ultra-action-btn group/btn relative w-full overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-slate-200 border border-slate-500/50 hover:border-slate-400/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-400/0 via-slate-300/10 to-slate-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <div className="p-1 mr-2 rounded bg-emerald-500/20 backdrop-blur-sm group-hover/btn:bg-emerald-400/30 transition-colors duration-300">
                          <RefreshCw className="h-4 w-4 text-emerald-400 group-hover/btn:animate-spin" />
                        </div>
                        Refresh Data
                      </div>
                    </Button>
                    <Button className="ultra-action-btn group/btn relative w-full overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-slate-200 border border-slate-500/50 hover:border-slate-400/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-400/0 via-slate-300/10 to-slate-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <div className="p-1 mr-2 rounded bg-amber-500/20 backdrop-blur-sm group-hover/btn:bg-amber-400/30 transition-colors duration-300">
                          <Settings className="h-4 w-4 text-amber-400 group-hover/btn:animate-pulse" />
                        </div>
                        Configure
                      </div>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Real-time Tab */}
          <TabsContent value="realtime" className="space-y-8">
            <Card className="p-6 bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Activity className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Real-time Pitch Tracking</h3>
                    <p className="text-slate-400 text-sm">Live pitch analysis and tracking</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                  Streaming
                </Badge>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4">
                <VoicePitchChart data={realTimeData} height={350} />
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl">
                <h4 className="text-white text-lg font-semibold mb-4">Current Pitch</h4>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  {voiceMetrics.pitch} Hz
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(voiceMetrics.pitch / 500) * 100}%` }}
                  ></div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-900/40 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl">
                <h4 className="text-white text-lg font-semibold mb-4">Volume Level</h4>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3">
                  {voiceMetrics.volume} dB
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${voiceMetrics.volume}%` }}
                  ></div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-900/40 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl">
                <h4 className="text-white text-lg font-semibold mb-4">Emotion</h4>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                  {voiceMetrics.emotion}
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400">
                  Detected
                </Badge>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Quality Analysis Tab */}
          <TabsContent value="quality" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-gradient-to-br from-red-900/40 via-pink-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Brain className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Voice Quality Radar</h3>
                    <p className="text-slate-400 text-sm">Multi-dimensional quality assessment</p>
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <VoiceQualityRadar data={qualityData} height={300} />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-900/40 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-6">Quality Metrics</h3>
                <div className="space-y-6">
                  {qualityData.map((metric, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">{metric.quality}</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Spectral Analysis Tab */}
          <TabsContent value="spectral" className="space-y-8">
            <Card className="p-6 bg-gradient-to-br from-cyan-900/40 via-sky-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Radio className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Spectral Characteristics</h3>
                  <p className="text-slate-400 text-sm">Advanced spectral analysis and formant tracking</p>
                </div>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4">
                <SpectralAnalysisChart data={realTimeData} height={400} />
              </div>
            </Card>
          </TabsContent>

          {/* Enhanced Emotion Tracking Tab */}
          <TabsContent value="emotions" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-gradient-to-br from-yellow-900/40 via-amber-800/30 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Zap className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Emotion Distribution</h3>
                    <p className="text-slate-400 text-sm">Emotional tone analysis breakdown</p>
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <EmotionDistributionChart data={emotionData} height={300} />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 backdrop-blur-sm border-slate-700 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-6">Emotion Timeline</h3>
                <div className="space-y-4">
                  {emotionData.map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: emotion.color }}
                        ></div>
                        <span className="text-white font-medium">{emotion.emotion}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-300 font-semibold">{emotion.value}%</span>
                        <div className="w-20 bg-slate-700/50 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              backgroundColor: emotion.color,
                              width: `${emotion.value}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Footer Actions */}
        <div className="flex justify-center mt-12 space-x-6">
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition-all duration-300 px-8 py-3"
            onClick={() => handleExportReport('csv')}
          >
            <Download className="mr-2 h-5 w-5" />
            Export Report
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
            onClick={handleGenerateInsights}
          >
            <Brain className="mr-2 h-5 w-5" />
            Generate AI Insights
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UltraAdvancedDashboard;