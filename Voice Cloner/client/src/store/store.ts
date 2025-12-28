import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import voiceSlice from './slices/voiceSlice';
import uiSlice from './slices/uiSlice';
import realTimeSlice from './slices/realTimeSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    voice: voiceSlice,
    ui: uiSlice,
    realTime: realTimeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['voice/setAudioData', 'realTime/setAudioStream'],
        ignoredPaths: ['voice.audioData', 'realTime.audioStream'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;