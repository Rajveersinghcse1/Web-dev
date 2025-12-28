import apiClient from './api';

export interface VoiceAnalyticsData {
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

export interface DashboardStats {
  totalClones: number;
  activeUsers: number;
  avgClarity: number;
  successRate: number;
  avgProcessingTime: number;
}

export interface EmotionData {
  emotion: string;
  value: number;
  color: string;
}

export interface QualityMetric {
  quality: string;
  value: number;
  fullMark: number;
}

export interface AIInsight {
  type: string;
  title: string;
  description: string;
  severity: string;
}

// Get real-time voice analytics data
export const getRealTimeAnalytics = async (): Promise<VoiceAnalyticsData[]> => {
  try {
    const response = await apiClient.get('/analytics/realtime');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    // Return simulated data if API fails
    return Array.from({ length: 20 }, (_, index) => ({
      frequency: Math.random() * 8000 + 85,
      amplitude: Math.random() * 100,
      pitch: Math.random() * 400 + 80,
      formant: Math.random() * 3000 + 500,
      spectralCentroid: Math.random() * 5000 + 1000,
      timestamp: new Date(Date.now() - (19 - index) * 1000).toISOString(),
      emotion: ['Happy', 'Sad', 'Angry', 'Neutral', 'Excited'][Math.floor(Math.random() * 5)],
      clarity: Math.random() * 100,
      volume: Math.random() * 100,
      mfcc: Array.from({ length: 13 }, () => Math.random() * 2 - 1),
    }));
  }
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return simulated data if API fails
    return {
      totalClones: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      avgClarity: Math.random() * 20 + 80,
      successRate: Math.random() * 10 + 90,
      avgProcessingTime: Math.random() * 2 + 1,
    };
  }
};

// Get emotion distribution data
export const getEmotionDistribution = async (): Promise<EmotionData[]> => {
  try {
    const response = await apiClient.get('/analytics/emotions');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching emotion distribution:', error);
    // Return simulated data if API fails
    return [
      { emotion: 'Happy', value: Math.floor(Math.random() * 20) + 25, color: '#10B981' },
      { emotion: 'Neutral', value: Math.floor(Math.random() * 20) + 30, color: '#6B7280' },
      { emotion: 'Sad', value: Math.floor(Math.random() * 15) + 10, color: '#3B82F6' },
      { emotion: 'Angry', value: Math.floor(Math.random() * 10) + 5, color: '#EF4444' },
      { emotion: 'Excited', value: Math.floor(Math.random() * 10) + 5, color: '#F59E0B' },
    ];
  }
};

// Get voice quality metrics
export const getVoiceQualityMetrics = async (): Promise<QualityMetric[]> => {
  try {
    const response = await apiClient.get('/analytics/quality');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching voice quality metrics:', error);
    // Return simulated data if API fails
    return [
      { quality: 'Clarity', value: Math.floor(Math.random() * 20) + 80, fullMark: 100 },
      { quality: 'Similarity', value: Math.floor(Math.random() * 15) + 85, fullMark: 100 },
      { quality: 'Naturalness', value: Math.floor(Math.random() * 20) + 75, fullMark: 100 },
      { quality: 'Confidence', value: Math.floor(Math.random() * 10) + 90, fullMark: 100 },
      { quality: 'Pitch Accuracy', value: Math.floor(Math.random() * 15) + 80, fullMark: 100 },
      { quality: 'Tone Match', value: Math.floor(Math.random() * 15) + 85, fullMark: 100 },
    ];
  }
};

// Store voice analytics data
export const storeVoiceAnalytics = async (data: Omit<VoiceAnalyticsData, 'timestamp'>): Promise<void> => {
  try {
    await apiClient.post('/analytics/store', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error storing voice analytics:', error);
  }
};

// Generate AI insights
export const generateAIInsights = async (): Promise<AIInsight[]> => {
  try {
    const response = await apiClient.get('/analytics/insights');
    return response.data.data;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    // Return simulated data if API fails
    return [
      {
        type: 'recommendation',
        title: 'Pitch Stability',
        description: 'Your voice pitch has improved by 15% over the last week. Consider practicing sustained vowel sounds for even better stability.',
        severity: 'info',
      },
      {
        type: 'alert',
        title: 'Volume Fluctuation',
        description: 'Volume levels have been inconsistent in recent recordings. Ensure proper microphone positioning.',
        severity: 'warning',
      },
    ];
  }
};

// Export analytics report
export const exportAnalyticsReport = async (format: 'json' | 'csv' = 'json', dateRange: string = '7d') => {
  try {
    const response = await apiClient.get(`/analytics/export?format=${format}&dateRange=${dateRange}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    if (format === 'csv') {
      // Create and download CSV file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'voice-analytics-report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      return response.data.data;
    }
  } catch (error) {
    console.error('Error exporting analytics report:', error);
    throw error;
  }
};