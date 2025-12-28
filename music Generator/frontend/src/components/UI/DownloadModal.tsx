import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import './DownloadModal.css';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string;
  filename: string;
  title?: string;
}

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  downloadUrl,
  filename,
  title = 'Downloading File'
}) => {
  const [progress, setProgress] = useState<DownloadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
    speed: 0,
    timeRemaining: 0
  });
  const [status, setStatus] = useState<'preparing' | 'downloading' | 'completed' | 'error'>('preparing');
  const [error, setError] = useState<string>('');

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds === Infinity || seconds < 0) return 'Calculating...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const downloadFile = async () => {
    try {
      setStatus('downloading');
      setError('');
      
      const startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;

      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        throw new Error('Response body is not available');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        const currentTime = Date.now();
        const timeDiff = (currentTime - lastTime) / 1000;
        
        if (timeDiff >= 0.1) { // Update progress every 100ms
          const speed = (loaded - lastLoaded) / timeDiff;
          const timeRemaining = speed > 0 ? (total - loaded) / speed : 0;
          
          setProgress({
            loaded,
            total,
            percentage: total > 0 ? (loaded / total) * 100 : 0,
            speed,
            timeRemaining
          });
          
          lastLoaded = loaded;
          lastTime = currentTime;
        }
      }

      // Create blob and download
      const blob = new Blob(chunks as BlobPart[]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('completed');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (isOpen && downloadUrl) {
      downloadFile();
    }
  }, [isOpen, downloadUrl]);

  const handleClose = () => {
    if (status === 'downloading') {
      // Confirm before closing during download
      if (window.confirm('Download is in progress. Are you sure you want to cancel?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="download-modal-overlay">
      <div className="download-modal">
        <div className="download-modal-header">
          <h3>{title}</h3>
          <button 
            className="download-modal-close" 
            onClick={handleClose}
            disabled={status === 'downloading'}
          >
            ×
          </button>
        </div>
        
        <div className="download-modal-content">
          <div className="download-info">
            <div className="download-filename">{filename}</div>
            <div className="download-size">
              {progress.total > 0 && (
                <span>{formatBytes(progress.loaded)} / {formatBytes(progress.total)}</span>
              )}
            </div>
          </div>

          {status === 'preparing' && (
            <div className="download-status">
              <div className="spinner"></div>
              <span>Preparing download...</span>
            </div>
          )}

          {status === 'downloading' && (
            <div className="download-progress">
              <ProgressBar 
                progress={progress.percentage}
                variant="primary"
                size="large"
                animated={true}
                showPercentage={true}
              />
              <div className="download-details">
                <div className="download-speed">
                  Speed: {formatBytes(progress.speed)}/s
                </div>
                <div className="download-eta">
                  ETA: {formatTime(progress.timeRemaining)}
                </div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="download-status success">
              <div className="checkmark">✓</div>
              <span>Download completed successfully!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="download-status error">
              <div className="error-icon">✕</div>
              <span>Error: {error}</span>
              <button 
                className="retry-button"
                onClick={downloadFile}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;