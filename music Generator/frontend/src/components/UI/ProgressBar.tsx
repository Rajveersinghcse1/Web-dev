import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = 'primary',
  size = 'medium',
  animated = true
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`progress-bar-container ${size}`}>
      {label && (
        <div className="progress-bar-label">
          <span>{label}</span>
          {showPercentage && (
            <span className="progress-bar-percentage">{clampedProgress.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={`progress-bar ${variant}`}>
        <div 
          className={`progress-bar-fill ${animated ? 'animated' : ''}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {!label && showPercentage && (
            <span className="progress-bar-text">{clampedProgress.toFixed(0)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;