import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RealTimeState {
  isConnected: boolean;
  isStreaming: boolean;
  inputLanguage: string;
  outputLanguage: string;
  voiceModelId: string | null;
  emotionMode: 'neutral' | 'happy' | 'sad' | 'excited' | 'angry' | 'calm';
  latency: number;
  audioStream: MediaStream | null;
  error: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  streamingStats: {
    bytesTransmitted: number;
    packetsLost: number;
    avgLatency: number;
    quality: number;
  };
}

const initialState: RealTimeState = {
  isConnected: false,
  isStreaming: false,
  inputLanguage: 'en',
  outputLanguage: 'en',
  voiceModelId: null,
  emotionMode: 'neutral',
  latency: 0,
  audioStream: null,
  error: null,
  connectionStatus: 'disconnected',
  streamingStats: {
    bytesTransmitted: 0,
    packetsLost: 0,
    avgLatency: 0,
    quality: 100,
  },
};

const realTimeSlice = createSlice({
  name: 'realTime',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<'disconnected' | 'connecting' | 'connected' | 'error'>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },
    startStreaming: (state) => {
      state.isStreaming = true;
      state.error = null;
    },
    stopStreaming: (state) => {
      state.isStreaming = false;
    },
    setInputLanguage: (state, action: PayloadAction<string>) => {
      state.inputLanguage = action.payload;
    },
    setOutputLanguage: (state, action: PayloadAction<string>) => {
      state.outputLanguage = action.payload;
    },
    setVoiceModelId: (state, action: PayloadAction<string | null>) => {
      state.voiceModelId = action.payload;
    },
    setEmotionMode: (state, action: PayloadAction<'neutral' | 'happy' | 'sad' | 'excited' | 'angry' | 'calm'>) => {
      state.emotionMode = action.payload;
    },
    setLatency: (state, action: PayloadAction<number>) => {
      state.latency = action.payload;
    },
    setAudioStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.audioStream = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.connectionStatus = 'error';
      state.isConnected = false;
      state.isStreaming = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStreamingStats: (state, action: PayloadAction<Partial<RealTimeState['streamingStats']>>) => {
      state.streamingStats = { ...state.streamingStats, ...action.payload };
    },
    resetRealTimeState: (state) => {
      state.isConnected = false;
      state.isStreaming = false;
      state.audioStream = null;
      state.error = null;
      state.connectionStatus = 'disconnected';
      state.latency = 0;
      state.streamingStats = {
        bytesTransmitted: 0,
        packetsLost: 0,
        avgLatency: 0,
        quality: 100,
      };
    },
  },
});

export const {
  setConnectionStatus,
  startStreaming,
  stopStreaming,
  setInputLanguage,
  setOutputLanguage,
  setVoiceModelId,
  setEmotionMode,
  setLatency,
  setAudioStream,
  setError,
  clearError,
  updateStreamingStats,
  resetRealTimeState,
} = realTimeSlice.actions;

export default realTimeSlice.reducer;