import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Settings {
  // Audio Settings
  defaultModel: string;
  defaultDuration: number;
  audioQuality: string;
  outputFormat: string;
  
  // Performance Settings
  maxConcurrentGenerations: number;
  enableGPU: boolean;
  cacheModels: boolean;
  
  // UI Settings
  theme: string;
  autoPlay: boolean;
  showAdvanced: boolean;
  
  // API Settings
  apiBaseUrl: string;
  timeout: number;
  retryAttempts: number;
  
  // Storage Settings
  autoSave: boolean;
  maxStorageSize: number;
  cleanupInterval: number;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    // Audio Settings
    defaultModel: 'musicgen-medium',
    defaultDuration: 30,
    audioQuality: 'high',
    outputFormat: 'wav',
    
    // Performance Settings
    maxConcurrentGenerations: 3,
    enableGPU: false,
    cacheModels: true,
    
    // UI Settings
    theme: 'dark',
    autoPlay: true,
    showAdvanced: false,
    
    // API Settings
    apiBaseUrl: 'http://127.0.0.1:8000',
    timeout: 300,
    retryAttempts: 3,
    
    // Storage Settings
    autoSave: true,
    maxStorageSize: 1000,
    cleanupInterval: 7
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState({
    gpu: 'Not Available',
    memory: 'Unknown',
    storage: 'Unknown',
    apiStatus: 'Checking...'
  });

  useEffect(() => {
    loadSettings();
    checkSystemInfo();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/settings');
      setSettings(response.data.settings || settings);
    } catch (err) {
      // Use default settings if API fails
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const checkSystemInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/health');
      setSystemInfo(prev => ({
        ...prev,
        apiStatus: response.data.status === 'healthy' ? 'Connected' : 'Error'
      }));
    } catch (err) {
      setSystemInfo(prev => ({ ...prev, apiStatus: 'Disconnected' }));
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await axios.put('http://localhost:8000/api/v1/settings', settings);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        defaultModel: 'musicgen-medium',
        defaultDuration: 30,
        audioQuality: 'high',
        outputFormat: 'wav',
        maxConcurrentGenerations: 3,
        enableGPU: false,
        cacheModels: true,
        theme: 'dark',
        autoPlay: true,
        showAdvanced: false,
        apiBaseUrl: 'http://127.0.0.1:8000',
        timeout: 300,
        retryAttempts: 3,
        autoSave: true,
        maxStorageSize: 1000,
        cleanupInterval: 7
      });
    }
  };

  const testConnection = async () => {
    try {
      setSystemInfo(prev => ({ ...prev, apiStatus: 'Testing...' }));
      const response = await axios.get(`${settings.apiBaseUrl}/api/health`);
      setSystemInfo(prev => ({
        ...prev,
        apiStatus: response.data.status === 'healthy' ? 'Connected' : 'Error'
      }));
    } catch (err) {
      setSystemInfo(prev => ({ ...prev, apiStatus: 'Failed' }));
    }
  };

  const clearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached models? This will require re-downloading models on next use.')) {
      try {
        await axios.post(`${settings.apiBaseUrl}/api/v1/cache/clear`);
        alert('Cache cleared successfully');
      } catch (err) {
        alert('Failed to clear cache');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: '#cbd5e1' 
      }}>
        <div>Loading settings...</div>
      </div>
    );
  }

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ color: '#f1f5f9', marginBottom: '20px', fontSize: '1.3rem', fontWeight: '600' }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const SettingItem: React.FC<{ 
    label: string; 
    description?: string; 
    children: React.ReactNode 
  }> = ({ label, description, children }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <div>
          <label style={{ color: '#cbd5e1', fontWeight: '500', display: 'block' }}>{label}</label>
          {description && (
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '2px 0 0 0' }}>{description}</p>
          )}
        </div>
        <div style={{ minWidth: '200px' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#f1f5f9' }}>
          Settings
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
          Configure your AI Music Generator preferences and system settings
        </p>
      </div>

      {/* System Status */}
      <SettingSection title="System Status">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 'bold' }}>API</div>
            <div style={{ 
              color: systemInfo.apiStatus === 'Connected' ? '#10b981' : '#ef4444',
              fontSize: '14px'
            }}>
              {systemInfo.apiStatus}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 'bold' }}>GPU</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{systemInfo.gpu}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 'bold' }}>Memory</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{systemInfo.memory}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 'bold' }}>Storage</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{systemInfo.storage}</div>
          </div>
        </div>
      </SettingSection>

      {/* Audio Settings */}
      <SettingSection title="Audio Settings">
        <SettingItem 
          label="Default Model" 
          description="The AI model to use by default for generation"
        >
          <select
            value={settings.defaultModel}
            onChange={(e) => setSettings({...settings, defaultModel: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#f1f5f9'
            }}
          >
            <option value="musicgen-small">MusicGen Small (Fast)</option>
            <option value="musicgen-medium">MusicGen Medium (Balanced)</option>
            <option value="musicgen-large">MusicGen Large (High Quality)</option>
            <option value="musicgen-melody">MusicGen Melody</option>
          </select>
        </SettingItem>

        <SettingItem 
          label="Default Duration" 
          description="Default length for generated audio tracks"
        >
          <select
            value={settings.defaultDuration}
            onChange={(e) => setSettings({...settings, defaultDuration: parseInt(e.target.value)})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#f1f5f9'
            }}
          >
            <option value={10}>10 seconds</option>
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={45}>45 seconds</option>
            <option value={60}>60 seconds</option>
          </select>
        </SettingItem>

        <SettingItem 
          label="Audio Quality" 
          description="Quality vs speed trade-off for generation"
        >
          <select
            value={settings.audioQuality}
            onChange={(e) => setSettings({...settings, audioQuality: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#f1f5f9'
            }}
          >
            <option value="draft">Draft (Fastest)</option>
            <option value="standard">Standard</option>
            <option value="high">High Quality</option>
            <option value="ultra">Ultra (Slowest)</option>
          </select>
        </SettingItem>

        <SettingItem 
          label="Output Format" 
          description="Audio file format for downloads"
        >
          <select
            value={settings.outputFormat}
            onChange={(e) => setSettings({...settings, outputFormat: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#f1f5f9'
            }}
          >
            <option value="wav">WAV (Uncompressed)</option>
            <option value="mp3">MP3 (Compressed)</option>
            <option value="flac">FLAC (Lossless)</option>
          </select>
        </SettingItem>
      </SettingSection>

      {/* Performance Settings */}
      <SettingSection title="Performance Settings">
        <SettingItem 
          label="Max Concurrent Generations" 
          description="Maximum number of simultaneous generation tasks"
        >
          <input
            type="range"
            min={1}
            max={5}
            value={settings.maxConcurrentGenerations}
            onChange={(e) => setSettings({...settings, maxConcurrentGenerations: parseInt(e.target.value)})}
            style={{ width: '70%', marginRight: '10px' }}
          />
          <span style={{ color: '#cbd5e1', fontWeight: '600' }}>
            {settings.maxConcurrentGenerations}
          </span>
        </SettingItem>

        <SettingItem 
          label="Enable GPU Acceleration" 
          description="Use GPU for faster generation (requires compatible hardware)"
        >
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.enableGPU}
              onChange={(e) => setSettings({...settings, enableGPU: e.target.checked})}
              style={{ marginRight: '10px' }}
            />
            <span style={{ color: '#cbd5e1' }}>
              {settings.enableGPU ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </SettingItem>

        <SettingItem 
          label="Cache Models" 
          description="Keep models in memory for faster subsequent generations"
        >
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.cacheModels}
              onChange={(e) => setSettings({...settings, cacheModels: e.target.checked})}
              style={{ marginRight: '10px' }}
            />
            <span style={{ color: '#cbd5e1' }}>
              {settings.cacheModels ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </SettingItem>

        <SettingItem label="" description="">
          <button
            onClick={clearCache}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear Model Cache
          </button>
        </SettingItem>
      </SettingSection>

      {/* UI Settings */}
      <SettingSection title="User Interface">
        <SettingItem 
          label="Auto-play Generated Music" 
          description="Automatically play audio when generation completes"
        >
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.autoPlay}
              onChange={(e) => setSettings({...settings, autoPlay: e.target.checked})}
              style={{ marginRight: '10px' }}
            />
            <span style={{ color: '#cbd5e1' }}>
              {settings.autoPlay ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </SettingItem>

        <SettingItem 
          label="Show Advanced Options" 
          description="Display advanced generation parameters in the interface"
        >
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showAdvanced}
              onChange={(e) => setSettings({...settings, showAdvanced: e.target.checked})}
              style={{ marginRight: '10px' }}
            />
            <span style={{ color: '#cbd5e1' }}>
              {settings.showAdvanced ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </SettingItem>
      </SettingSection>

      {/* API Settings */}
      <SettingSection title="API Configuration">
        <SettingItem 
          label="API Base URL" 
          description="Backend server URL for API requests"
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={settings.apiBaseUrl}
              onChange={(e) => setSettings({...settings, apiBaseUrl: e.target.value})}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#f1f5f9'
              }}
            />
            <button
              onClick={testConnection}
              style={{
                padding: '8px 12px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Test
            </button>
          </div>
        </SettingItem>

        <SettingItem 
          label="Request Timeout" 
          description="Maximum time to wait for API responses (seconds)"
        >
          <input
            type="number"
            min={30}
            max={600}
            value={settings.timeout}
            onChange={(e) => setSettings({...settings, timeout: parseInt(e.target.value)})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#f1f5f9'
            }}
          />
        </SettingItem>

        <SettingItem 
          label="Retry Attempts" 
          description="Number of times to retry failed requests"
        >
          <select
            value={settings.retryAttempts}
            onChange={(e) => setSettings({...settings, retryAttempts: parseInt(e.target.value)})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#f1f5f9'
            }}
          >
            <option value={0}>No retries</option>
            <option value={1}>1 retry</option>
            <option value={3}>3 retries</option>
            <option value={5}>5 retries</option>
          </select>
        </SettingItem>
      </SettingSection>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'flex-end',
        marginTop: '30px'
      }}>
        <button
          onClick={resetSettings}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(100, 116, 139, 0.3)',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Reset to Defaults
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: saving ? '#4a5568' : (saved ? '#10b981' : '#6366f1'),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Settings')}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;