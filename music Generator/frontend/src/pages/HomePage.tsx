import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DownloadModal from '../components/UI/DownloadModal';

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');

  const handleDownload = () => {
    if (audioUrl) {
      setDownloadUrl(audioUrl);
      setDownloadFilename(`generated_music_${Date.now()}.wav`);
      setShowDownloadModal(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/music/generate', {
        prompt: prompt,
        model_size: 'small',
        duration: 30
      });

      if (response.data.task_id) {
        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await axios.get(`http://127.0.0.1:8000/api/v1/music/status/${response.data.task_id}`);
            
            if (statusResponse.data.status === 'completed') {
              clearInterval(pollInterval);
              setAudioUrl(`http://127.0.0.1:8000/api/v1/music/download/${response.data.task_id}`);
              setIsGenerating(false);
            } else if (statusResponse.data.status === 'failed') {
              clearInterval(pollInterval);
              setError('Generation failed');
              setIsGenerating(false);
            }
          } catch (err) {
            clearInterval(pollInterval);
            setError('Error checking status');
            setIsGenerating(false);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed');
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold',
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Ultra-Advanced AI Music Generator
        </h1>
        <p style={{ 
          fontSize: '1.3rem', 
          color: '#cbd5e1', 
          marginBottom: '30px',
          maxWidth: '600px',
          margin: '0 auto 30px auto'
        }}>
          Create professional-quality music with cutting-edge AI technology. 
          From simple melodies to complex compositions.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '25px', 
        marginBottom: '40px' 
      }}>
        <Link to="/generator" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎵</div>
            <h3 style={{ color: '#f1f5f9', marginBottom: '10px', fontSize: '1.3rem' }}>
              Advanced Generator
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Create music with full control over models, duration, and advanced parameters
            </p>
          </div>
        </Link>

        <Link to="/library" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📚</div>
            <h3 style={{ color: '#f1f5f9', marginBottom: '10px', fontSize: '1.3rem' }}>
              Music Library
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Browse, organize and manage all your generated music tracks
            </p>
          </div>
        </Link>

        <Link to="/presets" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚡</div>
            <h3 style={{ color: '#f1f5f9', marginBottom: '10px', fontSize: '1.3rem' }}>
              Smart Presets
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Use pre-configured templates for instant music generation
            </p>
          </div>
        </Link>

        <Link to="/settings" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚙️</div>
            <h3 style={{ color: '#f1f5f9', marginBottom: '10px', fontSize: '1.3rem' }}>
              Settings
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Configure AI models, performance, and application preferences
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Generate Section */}
      <div style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.8)', 
        borderRadius: '12px', 
        padding: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#f1f5f9', textAlign: 'center' }}>
          Quick Generate
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '25px' }}>
          Try our AI music generation with a simple prompt
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>
            Music Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the music you want to generate..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            backgroundColor: isGenerating ? '#4a5568' : '#6366f1',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Music'}
        </button>

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

        {audioUrl && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '12px', color: '#f1f5f9' }}>Generated Music:</h3>
            <audio 
              controls 
              style={{ width: '100%' }}
              src={audioUrl}
            >
              Your browser does not support the audio element.
            </audio>
            <div style={{ marginTop: '12px' }}>
              <button 
                onClick={handleDownload}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 12px rgba(99, 102, 241, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.3)';
                }}
              >
                📥 Download Audio
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '30px',
        backgroundColor: 'rgba(30, 41, 59, 0.8)', 
        borderRadius: '12px', 
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#f1f5f9' }}>Example Prompts:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[
            'Upbeat electronic dance music with synthesizers',
            'Calm acoustic guitar melody for relaxation',
            'Epic orchestral soundtrack with dramatic crescendo',
            'Jazz piano solo in a smoky bar atmosphere',
            'Rock anthem with powerful drums and electric guitar'
          ].map((example, index) => (
            <li key={index} style={{ 
              marginBottom: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              color: '#cbd5e1'
            }}
            onClick={() => setPrompt(example)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
            }}
            >
              {example}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        downloadUrl={downloadUrl}
        filename={downloadFilename}
        title="Download Generated Music"
      />
    </div>
  );
};

export default HomePage;