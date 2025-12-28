import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Play, Square, Download, Save } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      // Setup Web Audio API for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(new ArrayBuffer(bufferLength));
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start visualization
      visualize();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, [isRecording]);

  const visualize = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = dataArrayRef.current;
    
    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      if (!isRecording) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(freqData);
      
      canvasCtx.fillStyle = 'rgba(20, 20, 40, 0.3)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (freqData[i] / 255) * canvas.height;
        
        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;
        
        canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [audioURL, isPlaying]);

  const downloadRecording = useCallback(() => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
    }
  }, [audioURL]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-recorder">
      <div className="recorder-header">
        <h3>🎙️ Audio Recorder</h3>
      </div>
      
      <div className="recorder-controls">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`recorder-btn ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? <MicOff /> : <Mic />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {audioURL && (
          <>
            <button
              onClick={playRecording}
              className="recorder-btn"
            >
              {isPlaying ? <Square /> : <Play />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={downloadRecording}
              className="recorder-btn"
            >
              <Download />
              Download
            </button>
          </>
        )}
      </div>
      
      <div className="recording-info">
        <div className="time-display">
          {formatTime(recordingTime)}
        </div>
        
        {isRecording && (
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className="audio-visualizer"
          />
        )}
      </div>
      
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default AudioRecorder;