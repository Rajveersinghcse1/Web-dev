import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Mic,
  Stop,
  PlayArrow,
  CloudUpload,
  Save,
  GraphicEq,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import {
  startRecording,
  stopRecording,
  setAudioData,
  setRecordingDuration,
  startProcessing,
  setProcessingProgress,
  stopProcessing,
  setError,
  setCloneRequest,
  updateCloneRequest,
} from '../../store/slices/voiceSlice';

const VoiceCloningPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const voiceState = useAppSelector((state) => state.voice) as any; // Temporary fix
  const {
    isRecording,
    audioData,
    recordingDuration,
    isProcessing,
    processingProgress,
    error,
    cloneRequest,
  } = voiceState;

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize clone request
  useEffect(() => {
    if (!cloneRequest) {
      dispatch(setCloneRequest({
        id: Date.now().toString(),
        modelName: '',
        audioFile: null,
        language: 'en',
        gender: 'neutral',
        description: '',
        tags: [],
        isPublic: false,
      }));
    }
  }, [cloneRequest, dispatch]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        dispatch(setAudioData(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      dispatch(startRecording());
      
      // Start duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        dispatch(setRecordingDuration(elapsed));
      }, 1000);
      
      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          dispatch(stopRecording());
          clearInterval(timer);
        }
      }, 60000);
      
    } catch (err) {
      dispatch(setError('Failed to access microphone. Please check permissions.'));
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      dispatch(stopRecording());
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        const audioBlob = new Blob([file], { type: file.type });
        dispatch(setAudioData(audioBlob));
        dispatch(updateCloneRequest({ audioFile: file }));
      } else {
        dispatch(setError('Please select a valid audio file.'));
      }
    }
  };

  const playAudio = () => {
    if (audioData && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioData);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const processVoiceClone = async () => {
    if (!cloneRequest?.modelName || !audioData) {
      dispatch(setError('Please provide a model name and audio data.'));
      return;
    }

    dispatch(startProcessing());
    
    // Simulate processing with progress updates
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        dispatch(setProcessingProgress(100));
        dispatch(stopProcessing());
        // Here you would typically make an API call to process the voice clone
      } else {
        dispatch(setProcessingProgress(currentProgress));
      }
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
        Voice Cloning Studio 🎙️
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Create ultra-realistic voice models with advanced AI
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(setError(''))}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Recording Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Record Voice Sample
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: isRecording ? 'error.main' : 'primary.main',
                    animation: isRecording ? 'recording-pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                >
                  <Mic sx={{ fontSize: 60 }} />
                </Avatar>
                
                {isRecording && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="error">
                      {formatTime(recordingDuration)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recording... (Max 60s)
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {!isRecording ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Mic />}
                      onClick={startVoiceRecording}
                      sx={{ minWidth: 140 }}
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Stop />}
                      onClick={stopVoiceRecording}
                      sx={{ minWidth: 140 }}
                    >
                      Stop Recording
                    </Button>
                  )}
                  
                  {audioData && (
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={playAudio}
                    >
                      Play
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                OR
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Audio File
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              
              <audio ref={audioRef} style={{ display: 'none' }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Model Configuration
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Model Name"
                  value={cloneRequest?.modelName || ''}
                  onChange={(e) => dispatch(updateCloneRequest({ modelName: e.target.value }))}
                  fullWidth
                  required
                />
                
                <TextField
                  label="Description"
                  value={cloneRequest?.description || ''}
                  onChange={(e) => dispatch(updateCloneRequest({ description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={cloneRequest?.language || 'en'}
                        onChange={(e) => dispatch(updateCloneRequest({ language: e.target.value }))}
                        label="Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                        <MenuItem value="it">Italian</MenuItem>
                        <MenuItem value="pt">Portuguese</MenuItem>
                        <MenuItem value="ru">Russian</MenuItem>
                        <MenuItem value="ja">Japanese</MenuItem>
                        <MenuItem value="ko">Korean</MenuItem>
                        <MenuItem value="zh">Chinese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={cloneRequest?.gender || 'neutral'}
                        onChange={(e) => dispatch(updateCloneRequest({ gender: e.target.value as any }))}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="neutral">Neutral</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Tags (Press Enter to add)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {cloneRequest?.tags.map((tag: string, index: number) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => {
                          const newTags = cloneRequest.tags.filter((_: string, i: number) => i !== index);
                          dispatch(updateCloneRequest({ tags: newTags }));
                        }}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Save />}
                  onClick={processVoiceClone}
                  disabled={!cloneRequest?.modelName || !audioData || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Create Voice Model'}
                </Button>
                
                {isProcessing && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Processing: {Math.round(processingProgress)}%
                    </Typography>
                    <LinearProgress variant="determinate" value={processingProgress} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tips Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            💡 Tips for Best Results
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GraphicEq sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Audio Quality</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Use high-quality audio (48kHz+) in a quiet environment for best results.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Mic sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Recording Length</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Record 30-60 seconds of clear speech with natural variation.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Save sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Content Guidelines</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Read naturally and include various phonemes for better voice coverage.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default VoiceCloningPage;