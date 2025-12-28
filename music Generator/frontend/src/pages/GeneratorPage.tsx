import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DownloadModal from '../components/UI/DownloadModal';

interface GenerationTask {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url?: string;
  error?: string;
  prompt: string;
  model: string;
  duration: number;
  created_at: string;
}

const GeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('musicgen-small');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');

  const models = [
    { value: 'musicgen-small', label: 'MusicGen Small (Fast)', description: 'Quick generation, good quality' },
    { value: 'musicgen-medium', label: 'MusicGen Medium (Balanced)', description: 'Balanced speed and quality' },
    { value: 'musicgen-large', label: 'MusicGen Large (High Quality)', description: 'Best quality, slower generation' },
    { value: 'musicgen-melody', label: 'MusicGen Melody', description: 'Music with melody conditioning' }
  ];

  const durations = [10, 15, 30, 45, 60];

  const handleDownload = (audioUrl: string, taskId: string) => {
    setDownloadUrl(audioUrl);
    setDownloadFilename(`generated_music_${taskId}.wav`);
    setShowDownloadModal(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a music prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentTask(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/music/generate', {
        prompt: prompt.trim(),
        model_size: model.replace('musicgen-', ''),
        duration: duration
      });

      const newTask: GenerationTask = {
        task_id: response.data.task_id,
        status: 'pending',
        prompt: prompt.trim(),
        model: model,
        duration: duration,
        created_at: new Date().toISOString()
      };

      setCurrentTask(newTask);
      
      // Start polling for status
      pollTaskStatus(response.data.task_id);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(`http://127.0.0.1:8000/api/v1/music/status/${taskId}`);
        const updatedTask = { ...currentTask!, ...statusResponse.data };
        setCurrentTask(updatedTask);

        if (statusResponse.data.status === 'completed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          updatedTask.audio_url = `http://127.0.0.1:8000/api/v1/music/download/${taskId}`;
          setGenerationHistory(prev => [updatedTask, ...prev]);
        } else if (statusResponse.data.status === 'failed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setError(statusResponse.data.error || 'Generation failed');
        }
      } catch (err) {
        clearInterval(pollInterval);
        setIsGenerating(false);
        setError('Failed to check generation status');
      }
    }, 2000);
  };

  const examplePrompts = [
    'Upbeat electronic dance music with heavy bass and synthesizers',
    'Calm acoustic guitar melody with soft vocals for relaxation',
    'Epic orchestral soundtrack with dramatic crescendo and choir',
    'Jazz piano solo in a smoky bar atmosphere with saxophone',
    'Rock anthem with powerful drums and electric guitar riffs',
    'Ambient electronic music with ethereal pads and subtle beats',
    'Classical string quartet performing a romantic waltz',
    'Hip-hop beat with smooth jazz samples and vinyl crackle'
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#f1f5f9' }}>
          AI Music Generator
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
          Create amazing music using advanced AI models. Describe your desired music and let AI compose it for you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        {/* Main Generation Panel */}
        <div style={{ 
          backgroundColor: 'rgba(30, 41, 59, 0.8)', 
          borderRadius: '12px', 
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#f1f5f9' }}>Generate New Music</h2>
          
          {/* Model Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: '600' }}>
              AI Model:
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '16px'
              }}
            >
              {models.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label} - {m.description}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: '600' }}>
              Duration: {duration} seconds
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {durations.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: duration === d ? '#6366f1' : 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: '600' }}>
              Music Description:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to generate..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: isGenerating || !prompt.trim() ? '#4a5568' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Music'}
          </button>

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

          {/* Current Generation Status */}
          {currentTask && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ marginBottom: '12px', color: '#f1f5f9' }}>Current Generation</h3>
              <p style={{ color: '#cbd5e1', marginBottom: '8px' }}>
                <strong>Prompt:</strong> {currentTask.prompt}
              </p>
              <p style={{ color: '#cbd5e1', marginBottom: '8px' }}>
                <strong>Status:</strong> <span style={{ 
                  color: currentTask.status === 'completed' ? '#10b981' : 
                        currentTask.status === 'failed' ? '#ef4444' : '#f59e0b' 
                }}>
                  {currentTask.status.toUpperCase()}
                </span>
              </p>
              
              {currentTask.audio_url && (
                <div style={{ marginTop: '15px' }}>
                  <audio 
                    controls 
                    style={{ width: '100%', marginBottom: '10px' }}
                    src={currentTask.audio_url}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <button 
                    onClick={() => handleDownload(currentTask.audio_url!, currentTask.task_id)}
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
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Example Prompts */}
          <div style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.8)', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#f1f5f9' }}>Example Prompts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  style={{ 
                    padding: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: '#cbd5e1',
                    textAlign: 'left',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Generation History */}
          {generationHistory.length > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.8)', 
              borderRadius: '12px', 
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#f1f5f9' }}>Recent Generations</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {generationHistory.slice(0, 5).map((task, index) => (
                  <div key={task.task_id} style={{
                    padding: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <p style={{ color: '#f1f5f9', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
                      {task.prompt.substring(0, 50)}...
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
                      {task.model} • {task.duration}s
                    </p>
                    {task.audio_url && (
                      <audio controls style={{ width: '100%', height: '30px' }}>
                        <source src={task.audio_url} type="audio/wav" />
                      </audio>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

export default GeneratorPage;