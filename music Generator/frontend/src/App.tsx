import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratorPage from './pages/GeneratorPage';
import PianoPage from './pages/PianoPage';
import LibraryPage from './pages/LibraryPage';
import PresetsPage from './pages/PresetsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f1f5f9',
        padding: '20px'
      }}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/piano" element={<PianoPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/presets" element={<PresetsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;