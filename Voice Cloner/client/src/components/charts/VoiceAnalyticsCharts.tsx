import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface VoiceAnalyticsData {
  frequency: number;
  amplitude: number;
  pitch: number;
  formant: number;
  spectralCentroid: number;
  mfcc: number[];
  timestamp: string;
  emotion: string;
  clarity: number;
  volume: number;
}

interface ChartProps {
  data: VoiceAnalyticsData[];
  height?: number;
  className?: string;
}

// Real-time Voice Frequency Analysis
export const VoiceFrequencyChart: React.FC<ChartProps> = ({ 
  data, 
  height = 300, 
  className = "" 
}) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Area
          type="monotone"
          dataKey="frequency"
          stroke="#3B82F6"
          fill="url(#frequencyGradient)"
          strokeWidth={2}
        />
        <defs>
          <linearGradient id="frequencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Voice Amplitude & Volume Analysis
export const VoiceAmplitudeChart: React.FC<ChartProps> = ({ 
  data, 
  height = 300, 
  className = "" 
}) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Bar dataKey="amplitude" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="volume" fill="#F59E0B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Pitch Tracking Over Time
export const VoicePitchChart: React.FC<ChartProps> = ({ 
  data, 
  height = 300, 
  className = "" 
}) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Line
          type="monotone"
          dataKey="pitch"
          stroke="#8B5CF6"
          strokeWidth={3}
          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Emotion Distribution Analysis
export const EmotionDistributionChart: React.FC<{ 
  data: { emotion: string; value: number; color: string }[];
  height?: number;
  className?: string;
}> = ({ data, height = 300, className = "" }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ emotion, percent }: any) => `${emotion} ${((percent as number) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Voice Quality Radar Chart
export const VoiceQualityRadar: React.FC<{
  data: { quality: string; value: number; fullMark: number }[];
  height?: number;
  className?: string;
}> = ({ data, height = 300, className = "" }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis 
          dataKey="quality" 
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
        />
        <PolarRadiusAxis 
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          tickCount={5}
        />
        <Radar
          name="Voice Quality"
          dataKey="value"
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// Spectral Analysis Chart
export const SpectralAnalysisChart: React.FC<ChartProps> = ({ 
  data, 
  height = 300, 
  className = "" 
}) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Area
          type="monotone"
          dataKey="spectralCentroid"
          stackId="1"
          stroke="#06B6D4"
          fill="#06B6D4"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="formant"
          stackId="1"
          stroke="#84CC16"
          fill="#84CC16"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);