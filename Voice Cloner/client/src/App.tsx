import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import VoiceCloningPage from './pages/VoiceCloningPage/VoiceCloningPage';
import RealTimeProcessingPage from './pages/RealTimeProcessingPage/RealTimeProcessingPage';
import VoiceLibraryPage from './pages/VoiceLibraryPage/VoiceLibraryPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import { useAppSelector } from './hooks/reduxHooks';

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth) as any;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, pt: isAuthenticated ? 8 : 0 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          
          {/* Protected routes */}
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/voice-cloning" element={isAuthenticated ? <VoiceCloningPage /> : <Navigate to="/login" />} />
          <Route path="/real-time" element={isAuthenticated ? <RealTimeProcessingPage /> : <Navigate to="/login" />} />
          <Route path="/library" element={isAuthenticated ? <VoiceLibraryPage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;