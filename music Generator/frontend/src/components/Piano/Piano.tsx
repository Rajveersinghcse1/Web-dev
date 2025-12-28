import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Download, Mic, MicOff, Volume2, Settings, RotateCcw, Music } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import { MidiExporter } from './MidiExporter';
import './Piano.css';

interface Note {
  key: string;
  frequency: number;
  timestamp: number;
  velocity: number;
  duration?: number;
}

interface BeatPattern {
  name: string;
  pattern: boolean[];
  sound: string;
}

const Piano: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<Note[]>([]);
  const [currentTempo, setCurrentTempo] = useState(120);
  const [volume, setVolume] = useState(0.5);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [beatSequencer, setBeatSequencer] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Piano keys configuration
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  const keyboardMap: Record<string, string> = {
    'q': 'C', 'w': 'D', 'e': 'E', 'r': 'F', 't': 'G', 'y': 'A', 'u': 'B',
    '2': 'C#', '3': 'D#', '5': 'F#', '6': 'G#', '7': 'A#',
    'z': 'C', 'x': 'D', 'c': 'E', 'v': 'F', 'b': 'G', 'n': 'A', 'm': 'B',
    's': 'C#', 'd': 'D#', 'g': 'F#', 'h': 'G#', 'j': 'A#'
  };

  // Beat patterns for the sequencer
  const beatPatterns: BeatPattern[] = [
    { name: 'Kick', pattern: [true, false, false, false, true, false, false, false], sound: 'kick' },
    { name: 'Snare', pattern: [false, false, true, false, false, false, true, false], sound: 'snare' },
    { name: 'Hi-Hat', pattern: [true, true, true, true, true, true, true, true], sound: 'hihat' },
    { name: 'Open Hat', pattern: [false, false, false, true, false, false, false, true], sound: 'openhat' }
  ];

  const [patternStates, setPatternStates] = useState<Record<string, boolean[]>>(
    beatPatterns.reduce((acc, pattern) => {
      acc[pattern.name] = [...pattern.pattern];
      return acc;
    }, {} as Record<string, boolean[]>)
  );

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current!.currentTime);
    }
  }, [volume]);

  // Calculate frequency for a note
  const getNoteFrequency = (note: string, octave: number): number => {
    const noteFrequencies: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    
    const baseFreq = noteFrequencies[note];
    return baseFreq * Math.pow(2, octave - 4);
  };

  // Play a note
  const playNote = useCallback((note: string, velocity: number = 0.5) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const frequency = getNoteFrequency(note, selectedOctave);
    const oscillator = audioContextRef.current.createOscillator();
    const noteGain = audioContextRef.current.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    
    noteGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    noteGain.gain.linearRampToValueAtTime(velocity, audioContextRef.current.currentTime + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1.5);
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNodeRef.current);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 1.5);
    
    oscillatorsRef.current.set(note, oscillator);
    setActiveNotes(prev => new Set(prev).add(note));
    
    // Record the note if recording
    if (isRecording && recordingStartTime) {
      const noteData: Note = {
        key: note,
        frequency,
        timestamp: Date.now() - recordingStartTime,
        velocity
      };
      setRecordedNotes(prev => [...prev, noteData]);
    }
    
    // Remove from active notes after a short delay
    setTimeout(() => {
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
      oscillatorsRef.current.delete(note);
    }, 100);
  }, [isRecording, recordingStartTime, selectedOctave]);

  // Stop a note
  const stopNote = useCallback((note: string) => {
    const oscillator = oscillatorsRef.current.get(note);
    if (oscillator) {
      try {
        oscillator.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
      oscillatorsRef.current.delete(note);
    }
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const note = keyboardMap[event.key.toLowerCase()];
      if (note && !activeNotes.has(note)) {
        event.preventDefault();
        playNote(note, 0.7);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = keyboardMap[event.key.toLowerCase()];
      if (note) {
        event.preventDefault();
        stopNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote, activeNotes]);

  // Recording controls
  const startRecording = () => {
    setRecordedNotes([]);
    setRecordingStartTime(Date.now());
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingStartTime(null);
  };

  // Playback controls
  const playRecording = () => {
    if (recordedNotes.length === 0) return;
    
    setIsPlaying(true);
    setPlaybackPosition(0);
    
    recordedNotes.forEach((note, index) => {
      const timeout = setTimeout(() => {
        playNote(note.key, note.velocity);
        setPlaybackPosition(index + 1);
        
        if (index === recordedNotes.length - 1) {
          setIsPlaying(false);
          setPlaybackPosition(0);
        }
      }, note.timestamp);
      
      playbackTimeoutRef.current = timeout;
    });
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackPosition(0);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
  };

  // Export recording
  const exportRecording = () => {
    if (recordedNotes.length === 0) return;
    
    const data = {
      notes: recordedNotes,
      tempo: currentTempo,
      octave: selectedOctave,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `piano-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as MIDI
  const exportMidi = () => {
    if (recordedNotes.length === 0) return;
    
    const midiNotes = MidiExporter.convertNotesToMidi(recordedNotes, selectedOctave);
    const midiData = MidiExporter.exportMidi(midiNotes, currentTempo);
    MidiExporter.downloadMidi(midiData, `piano-recording-${Date.now()}.mid`);
  };

  // Clear recording
  const clearRecording = () => {
    setRecordedNotes([]);
    setPlaybackPosition(0);
  };

  // Metronome
  const toggleMetronome = () => {
    if (metronome) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
      setMetronome(false);
    } else {
      const interval = 60000 / currentTempo;
      metronomeIntervalRef.current = setInterval(() => {
        if (audioContextRef.current) {
          const oscillator = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          
          oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
          gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
          
          oscillator.connect(gain);
          gain.connect(audioContextRef.current.destination);
          
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.1);
        }
      }, interval);
      setMetronome(true);
    }
  };

  // Generate drum sound
  const playDrumSound = (sound: string) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    switch (sound) {
      case 'kick':
        oscillator.frequency.setValueAtTime(60, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, ctx.currentTime);
        break;
      case 'snare':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        break;
      case 'hihat':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, ctx.currentTime);
        break;
      case 'openhat':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(6000, ctx.currentTime);
        break;
    }
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  };

  // Handle audio recording completion
  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log('Recording completed:', audioBlob);
    // Here you could upload to backend or process further
  };

  // Play beat sequence
  const playSequence = () => {
    if (isPlayingSequence) {
      stopSequence();
      return;
    }

    setIsPlayingSequence(true);
    setCurrentStep(0);
    
    const stepDuration = (60 / currentTempo) * 250; // Quarter notes at current tempo
    
    sequenceIntervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 8;
        
        // Play sounds for active patterns at current step
        beatPatterns.forEach(pattern => {
          if (patternStates[pattern.name][prev]) {
            playDrumSound(pattern.sound);
          }
        });
        
        return nextStep;
      });
    }, stepDuration);
  };

  const stopSequence = () => {
    setIsPlayingSequence(false);
    setCurrentStep(0);
    if (sequenceIntervalRef.current) {
      clearInterval(sequenceIntervalRef.current);
    }
  };

  return (
    <div className="piano-container">
      <div className="piano-header">
        <h2>🎹 Ultra Advanced Piano Studio</h2>
        <div className="piano-controls">
          {/* Recording Controls */}
          <div className="control-group">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`control-btn ${isRecording ? 'recording' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{isRecording ? <MicOff /> : <Mic />}{isRecording ? 'Stop Recording' : 'Record'}</span>
            </button>
            
            <button
              onClick={isPlaying ? stopPlayback : playRecording}
              className="control-btn"
              disabled={recordedNotes.length === 0}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{isPlaying ? <Square /> : <Play />}{isPlaying ? 'Stop' : 'Play'}</span>
            </button>
            
            <button onClick={clearRecording} className="control-btn">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RotateCcw /> Clear</span>
            </button>
            
            <button
              onClick={exportRecording}
              className="control-btn"
              disabled={recordedNotes.length === 0}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Download /> Export JSON</span>
            </button>
            
            <button
              onClick={exportMidi}
              className="control-btn"
              disabled={recordedNotes.length === 0}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Music /> Export MIDI</span>
            </button>
          </div>

          {/* Settings */}
          <div className="control-group">
            <label>
              Octave:
              <select
                value={selectedOctave}
                onChange={(e) => setSelectedOctave(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(oct => (
                  <option key={oct} value={oct}>{oct}</option>
                ))}
              </select>
            </label>
            
            <label>
              Tempo:
              <input
                type="range"
                min="60"
                max="200"
                value={currentTempo}
                onChange={(e) => setCurrentTempo(Number(e.target.value))}
              />
              <span>{currentTempo} BPM</span>
            </label>
            
            <label>
              <Volume2 size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </label>
            
            <button
              onClick={toggleMetronome}
              className={`control-btn ${metronome ? 'active' : ''}`}
            >
              Metronome
            </button>
            
            <button
              onClick={() => setShowAudioRecorder(!showAudioRecorder)}
              className={`control-btn ${showAudioRecorder ? 'active' : ''}`}
            >
              Audio Recorder
            </button>
          </div>
        </div>
      </div>

      {/* Recording Status */}
      {recordedNotes.length > 0 && (
        <div className="recording-info">
          <p>Recorded Notes: {recordedNotes.length}</p>
          {isPlaying && (
            <div className="playback-progress">
              Progress: {playbackPosition} / {recordedNotes.length}
            </div>
          )}
        </div>
      )}

      {/* Beat Sequencer */}
      <div className="beat-sequencer">
        <div className="sequencer-header">
          <h3>🥁 Beat Sequencer</h3>
          <div className="sequencer-controls">
            <button
              onClick={playSequence}
              className={`control-btn ${isPlayingSequence ? 'active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {isPlayingSequence ? <Square /> : <Play />}
                {isPlayingSequence ? 'Stop' : 'Play'} Sequence
              </span>
            </button>
            <button
              onClick={() => setBeatSequencer(!beatSequencer)}
              className="control-btn"
            >
              <span>{beatSequencer ? 'Hide' : 'Show'} Sequencer</span>
            </button>
          </div>
        </div>
        
        {beatSequencer && (
          <div className="sequencer-grid">
            {beatPatterns.map((pattern) => (
              <div key={pattern.name} className="pattern-row">
                <label className="pattern-label">{pattern.name}</label>
                <div className="pattern-steps">
                  {patternStates[pattern.name].map((active, index) => (
                    <button
                      key={index}
                      className={`step-btn ${active ? 'active' : ''} ${
                        isPlayingSequence && index === currentStep ? 'playing' : ''
                      }`}
                      onClick={() => {
                        const newStates = { ...patternStates };
                        newStates[pattern.name][index] = !active;
                        setPatternStates(newStates);
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="play-pattern-btn"
                  onClick={() => playDrumSound(pattern.sound)}
                >
                  <span>▶</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      )}

      {/* Piano Keyboard */}
      <div className="piano-keyboard">
        <div className="keyboard-info">
          <p>Use your computer keyboard to play! Q-U for white keys, 2,3,5,6,7 for black keys</p>
        </div>
        
        <div className="keys-container">
          {/* White Keys */}
          <div className="white-keys">
            {whiteKeys.map((note) => (
              <button
                key={note}
                className={`white-key ${activeNotes.has(note) ? 'active' : ''}`}
                onMouseDown={() => playNote(note, 0.7)}
                onMouseUp={() => stopNote(note)}
                onMouseLeave={() => stopNote(note)}
              >
                <span className="key-label">{note}</span>
              </button>
            ))}
          </div>
          
          {/* Black Keys */}
          <div className="black-keys">
            {blackKeys.map((note, index) => {
              const positions = [0.75, 1.75, 4.75, 5.75, 6.75];
              return (
                <button
                  key={note}
                  className={`black-key ${activeNotes.has(note) ? 'active' : ''}`}
                  style={{ left: `${positions[index] * 14.28}%` }}
                  onMouseDown={() => playNote(note, 0.7)}
                  onMouseUp={() => stopNote(note)}
                  onMouseLeave={() => stopNote(note)}
                >
                  <span className="key-label">{note}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Piano;