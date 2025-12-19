'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Target,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  Award,
  Clock,
  Users,
  FileText,
  Share2
} from 'lucide-react';
import { useMLStore, useMLActions } from '@/lib/mlEngine';
import { useToast } from '@/hooks/useToast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

// ==================== CHART COMPONENTS ====================

/**
 * Performance Trend Chart
 * Shows performance over time with prediction line
 */
const PerformanceTrendChart = ({ data, predictions }) => {
  const chartData = data.map((d, i) => ({
    session: i + 1,
    score: d.score,
    predicted: predictions.find(p => p.sessionNumber === i + 1)?.prediction || null,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
          dataKey="session" 
          stroke="#ffffff60" 
          tick={{ fontSize: 12, fill: '#ffffff60' }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="#ffffff60" 
          tick={{ fontSize: 12, fill: '#ffffff60' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            color: '#fff',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#ffffff80' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Area
          type="monotone"
          dataKey="score"
          fill="url(#performanceGradient)"
          stroke="#8B5CF6"
          strokeWidth={3}
          name="Actual Score"
          activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6' }}
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Predicted"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/**
 * Learning Curve Analysis Chart
 * Shows learning progression stages
 */
const LearningCurveChart = ({ data }) => {
  const movingAvg = [];
  const window = 3;
  
  for (let i = window - 1; i < data.length; i++) {
    const windowData = data.slice(i - window + 1, i + 1);
    const avg = windowData.reduce((sum, d) => sum + d.score, 0) / window;
    movingAvg.push({
      session: i + 1,
      score: data[i].score,
      movingAverage: Math.round(avg),
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={movingAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
          dataKey="session" 
          stroke="#ffffff60" 
          tick={{ fontSize: 12, fill: '#ffffff60' }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="#ffffff60" 
          tick={{ fontSize: 12, fill: '#ffffff60' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            color: '#fff',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#ffffff80' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366F1"
          strokeWidth={1}
          dot={{ r: 3, fill: '#6366F1' }}
          name="Raw Score"
          strokeOpacity={0.5}
        />
        <Line
          type="monotone"
          dataKey="movingAverage"
          stroke="#10B981"
          strokeWidth={3}
          name="Trend (3-session avg)"
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Anomaly Detection Chart
 * Highlights unusual performance spikes/drops
 */
const AnomalyChart = ({ data, anomalies }) => {
  const chartData = data.map((d, i) => ({
    session: i + 1,
    score: d.score,
    isAnomaly: anomalies.some(a => a.sessionNumber === i + 1 && a.isAnomaly),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
          dataKey="session" 
          type="number" 
          name="Session" 
          stroke="#ffffff60"
          tick={{ fontSize: 12, fill: '#ffffff60' }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          dataKey="score" 
          type="number" 
          name="Score" 
          stroke="#ffffff60"
          tick={{ fontSize: 12, fill: '#ffffff60' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-300">
                  <p className="font-bold text-black">Session {data.session}</p>
                  <p className="text-sm text-gray-800">Score: {data.score}</p>
                  {data.isAnomaly && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Anomaly Detected
                    </p>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        <Scatter name="Performance" data={chartData} fill="#8B5CF6">
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isAnomaly ? '#EF4444' : '#8B5CF6'} 
              r={entry.isAnomaly ? 6 : 4}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

// ==================== UI COMPONENTS ====================

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color, delay }) => {
  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  // Map old color props to new keys if necessary, or just use the color prop if it matches
  const activeColorKey = Object.keys(colorClasses).find(k => color.includes(k)) || 'violet';
  const activeColor = colorClasses[activeColorKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white backdrop-blur-md border border-gray-300 rounded-2xl p-6 shadow-lg hover:bg-white transition-all group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-3xl font-bold mt-2 text-black tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
          )}
          {trend && <div className="mt-3">{trend}</div>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${activeColor.split(' ')[1]} border ${activeColor.split(' ')[2]} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${activeColor.split(' ')[0]}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== EXPORT UTILITIES ====================

/**
 * Export data as CSV
 */
const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

/**
 * Export dashboard as PDF
 */
const exportToPDF = async (elementRef, filename) => {
  const element = elementRef.current;
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#000000', // Dark background for PDF
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};

// ==================== MAIN COMPONENT ====================

export default function AdvancedAnalytics() {
  const dashboardRef = useRef(null);
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('all'); // all, week, month
  const [activeTab, setActiveTab] = useState('overview'); // overview, trends, patterns, anomalies

  const performanceHistory = useMLStore(state => state.performanceHistory);
  const predictions = useMLStore(state => state.predictions);
  const anomalies = useMLStore(state => state.anomalies);
  const trends = useMLStore(state => state.trends);
  const patterns = useMLStore(state => state.patterns);

  const {
    recordPerformance,
    getPrediction,
    getLearningCurve,
    getVolatility,
  } = useMLActions();

  // Generate sample data if empty (for demo)
  useEffect(() => {
    if (performanceHistory.length === 0) {
      // Add sample data
      for (let i = 1; i <= 20; i++) {
        const baseScore = 500 + i * 15;
        const variance = (Math.random() - 0.5) * 100;
        recordPerformance(i, Math.round(baseScore + variance));
      }
    }
  }, []);

  // Calculate statistics
  const stats = {
    totalSessions: performanceHistory.length,
    avgScore: performanceHistory.length > 0
      ? Math.round(
          performanceHistory.reduce((sum, d) => sum + d.score, 0) / performanceHistory.length
        )
      : 0,
    bestScore: performanceHistory.length > 0
      ? Math.max(...performanceHistory.map(d => d.score))
      : 0,
    volatility: getVolatility(),
    anomalyCount: anomalies.filter(a => a.isAnomaly).length,
  };

  const handleExportCSV = () => {
    exportToCSV(performanceHistory, 'performance_data');
    toast({
      title: "Data Exported",
      description: "Your performance data has been downloaded as CSV.",
    });
  };

  const handleExportPDF = () => {
    exportToPDF(dashboardRef, 'analytics_report');
    toast({
      title: "Report Generated",
      description: "Your analytics report has been downloaded as PDF.",
    });
  };

  return (
    <div className="space-y-8" ref={dashboardRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
            Advanced Analytics
          </h2>
          <p className="text-gray-800 mt-2 ml-1">
            Machine learning powered insights and predictions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium transition-colors text-black"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-black rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Score"
          value={stats.avgScore}
          subtitle="Across all sessions"
          icon={Activity}
          color="text-purple-600"
          delay={0.1}
          trend={
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+12% vs last week</span>
            </div>
          }
        />
        <StatCard
          title="Best Performance"
          value={stats.bestScore}
          subtitle="Personal record"
          icon={Award}
          color="text-yellow-500"
          delay={0.2}
        />
        <StatCard
          title="Volatility Index"
          value={stats.volatility.toFixed(2)}
          subtitle="Performance stability"
          icon={Zap}
          color="text-blue-500"
          delay={0.3}
        />
        <StatCard
          title="Anomalies Detected"
          value={stats.anomalyCount}
          subtitle="Unusual patterns"
          icon={AlertTriangle}
          color="text-red-500"
          delay={0.4}
        />
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="border-b border-gray-300 p-2">
          <div className="flex gap-2 overflow-x-auto">
            {['overview', 'trends', 'patterns', 'anomalies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-800 hover:bg-white hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Performance Trajectory
                  </h3>
                  <PerformanceTrendChart data={performanceHistory} predictions={predictions} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Learning Curve
                    </h3>
                    <LearningCurveChart data={performanceHistory} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Anomaly Detection
                    </h3>
                    <AnomalyChart data={performanceHistory} anomalies={anomalies} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-bold text-black mb-4">Detailed Trend Analysis</h3>
                <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700">
                    Advanced trend analysis visualization coming soon...
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'patterns' && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-bold text-black mb-4">Learning Pattern Recognition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patterns.length > 0 ? (
                    patterns.map((pattern, i) => (
                      <div key={i} className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <p className="font-medium text-indigo-300">{pattern.name}</p>
                        <p className="text-sm text-indigo-400/60 mt-1">{pattern.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700">
                        No specific patterns detected yet. Continue training to generate insights.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'anomalies' && (
              <motion.div
                key="anomalies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-bold text-black mb-4">Detected Anomalies</h3>
                <div className="space-y-3">
                  {anomalies.filter(a => a.isAnomaly).length > 0 ? (
                    anomalies.filter(a => a.isAnomaly).map((anomaly, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="font-bold text-black">Session {anomaly.sessionNumber}</p>
                          <p className="text-sm text-gray-800">
                            Score deviation detected: {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}% from expected range
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-emerald-500/10 rounded-2xl p-8 text-center border border-emerald-500/20">
                      <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-emerald-300 font-medium">
                        No anomalies detected. Performance is stable!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

