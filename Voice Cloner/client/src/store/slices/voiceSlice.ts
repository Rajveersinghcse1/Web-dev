import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VoiceModel {
  id: string;
  name: string;
  description: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  createdAt: string;
  isPublic: boolean;
  ownerId: string;
  fileUrl: string;
  sampleAudioUrl: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  tags: string[];
}

export interface VoiceCloneRequest {
  id: string;
  modelName: string;
  audioFile: File | null;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
  tags: string[];
  isPublic: boolean;
}

interface VoiceState {
  models: VoiceModel[];
  currentModel: VoiceModel | null;
  cloneRequest: VoiceCloneRequest | null;
  isRecording: boolean;
  audioData: Blob | null;
  recordingDuration: number;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
  audioContext: AudioContext | null;
  mediaRecorder: MediaRecorder | null;
  isPlaying: boolean;
  currentAudioId: string | null; // Just store the ID instead of the DOM element
}

const initialState: VoiceState = {
  models: [],
  currentModel: null,
  cloneRequest: null,
  isRecording: false,
  audioData: null,
  recordingDuration: 0,
  isProcessing: false,
  processingProgress: 0,
  error: null,
  audioContext: null,
  mediaRecorder: null,
  isPlaying: false,
  currentAudioId: null,
};

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    setModels: (state, action: PayloadAction<VoiceModel[]>) => {
      state.models = action.payload;
    },
    setCurrentModel: (state, action: PayloadAction<VoiceModel | null>) => {
      state.currentModel = action.payload;
    },
    setCloneRequest: (state, action: PayloadAction<VoiceCloneRequest>) => {
      state.cloneRequest = action.payload;
    },
    updateCloneRequest: (state, action: PayloadAction<Partial<VoiceCloneRequest>>) => {
      if (state.cloneRequest) {
        state.cloneRequest = { ...state.cloneRequest, ...action.payload };
      }
    },
    startRecording: (state) => {
      state.isRecording = true;
      state.recordingDuration = 0;
      state.error = null;
    },
    stopRecording: (state) => {
      state.isRecording = false;
    },
    setAudioData: (state, action: PayloadAction<Blob>) => {
      state.audioData = action.payload;
    },
    setRecordingDuration: (state, action: PayloadAction<number>) => {
      state.recordingDuration = action.payload;
    },
    startProcessing: (state) => {
      state.isProcessing = true;
      state.processingProgress = 0;
      state.error = null;
    },
    setProcessingProgress: (state, action: PayloadAction<number>) => {
      state.processingProgress = action.payload;
    },
    stopProcessing: (state) => {
      state.isProcessing = false;
      state.processingProgress = 0;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.isRecording = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAudioContext: (state, action: PayloadAction<AudioContext>) => {
      // Note: AudioContext cannot be serialized, handle carefully
      state.audioContext = action.payload;
    },
    setMediaRecorder: (state, action: PayloadAction<MediaRecorder>) => {
      // Note: MediaRecorder cannot be serialized, handle carefully
      state.mediaRecorder = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentAudio: (state, action: PayloadAction<string | null>) => {
      state.currentAudioId = action.payload;
    },
    addModel: (state, action: PayloadAction<VoiceModel>) => {
      state.models.push(action.payload);
    },
    updateModel: (state, action: PayloadAction<{ id: string; updates: Partial<VoiceModel> }>) => {
      const index = state.models.findIndex(model => model.id === action.payload.id);
      if (index !== -1) {
        state.models[index] = { ...state.models[index], ...action.payload.updates };
      }
    },
    deleteModel: (state, action: PayloadAction<string>) => {
      state.models = state.models.filter(model => model.id !== action.payload);
      if (state.currentModel?.id === action.payload) {
        state.currentModel = null;
      }
    },
    resetVoiceState: (state) => {
      state.cloneRequest = null;
      state.audioData = null;
      state.recordingDuration = 0;
      state.isProcessing = false;
      state.processingProgress = 0;
      state.error = null;
      state.isRecording = false;
      state.isPlaying = false;
      state.currentAudioId = null;
    },
  },
});

export const {
  setModels,
  setCurrentModel,
  setCloneRequest,
  updateCloneRequest,
  startRecording,
  stopRecording,
  setAudioData,
  setRecordingDuration,
  startProcessing,
  setProcessingProgress,
  stopProcessing,
  setError,
  clearError,
  setAudioContext,
  setMediaRecorder,
  setIsPlaying,
  setCurrentAudio,
  addModel,
  updateModel,
  deleteModel,
  resetVoiceState,
} = voiceSlice.actions;

export default voiceSlice.reducer;