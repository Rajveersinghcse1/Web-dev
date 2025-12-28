"""
Audio processing utilities
"""

import os
import asyncio
import numpy as np
import torch
import torchaudio
import librosa
import soundfile as sf
from typing import Tuple, Optional, Union
import logging
from scipy import signal
from pydub import AudioSegment

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Advanced audio processing utilities"""
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
    
    async def save_audio(
        self, 
        audio_data: np.ndarray, 
        output_path: str, 
        sample_rate: int, 
        format: str = "wav"
    ):
        """Save audio data to file with format conversion"""
        
        try:
            # Ensure audio is in correct format
            if len(audio_data.shape) > 1:
                audio_data = audio_data[0]  # Take first channel if stereo
            
            # Normalize audio
            audio_data = self.normalize_audio(audio_data)
            
            # Save based on format
            if format.lower() == "wav":
                sf.write(output_path, audio_data, sample_rate, format="WAV")
            
            elif format.lower() == "mp3":
                # Save as WAV first, then convert to MP3
                temp_wav = output_path.replace(".mp3", "_temp.wav")
                sf.write(temp_wav, audio_data, sample_rate, format="WAV")
                
                # Convert to MP3 using pydub
                audio_segment = AudioSegment.from_wav(temp_wav)
                audio_segment.export(output_path, format="mp3", bitrate="320k")
                
                # Remove temp file
                os.remove(temp_wav)
            
            elif format.lower() == "flac":
                sf.write(output_path, audio_data, sample_rate, format="FLAC")
            
            else:
                # Default to WAV
                sf.write(output_path, audio_data, sample_rate, format="WAV")
            
            logger.info(f"✅ Audio saved: {output_path}")
            
        except Exception as e:
            logger.error(f"❌ Failed to save audio: {e}")
            raise
    
    def normalize_audio(self, audio_data: np.ndarray, target_db: float = -20.0) -> np.ndarray:
        """Normalize audio to target dB level"""
        
        # Convert to float32 if needed
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
        
        # Calculate RMS
        rms = np.sqrt(np.mean(audio_data ** 2))
        
        if rms > 0:
            # Calculate target amplitude
            target_amplitude = 10 ** (target_db / 20.0)
            
            # Scale audio
            scaling_factor = target_amplitude / rms
            audio_data = audio_data * scaling_factor
        
        # Clip to prevent distortion
        audio_data = np.clip(audio_data, -1.0, 1.0)
        
        return audio_data
    
    def apply_fade(
        self, 
        audio_data: np.ndarray, 
        fade_in_duration: float = 0.1, 
        fade_out_duration: float = 0.1,
        sample_rate: int = 44100
    ) -> np.ndarray:
        """Apply fade in/out to audio"""
        
        fade_in_samples = int(fade_in_duration * sample_rate)
        fade_out_samples = int(fade_out_duration * sample_rate)
        
        # Fade in
        if fade_in_samples > 0:
            fade_in = np.linspace(0, 1, fade_in_samples)
            audio_data[:fade_in_samples] *= fade_in
        
        # Fade out
        if fade_out_samples > 0:
            fade_out = np.linspace(1, 0, fade_out_samples)
            audio_data[-fade_out_samples:] *= fade_out
        
        return audio_data
    
    def apply_eq(
        self, 
        audio_data: np.ndarray, 
        low_gain: float = 0.0, 
        mid_gain: float = 0.0, 
        high_gain: float = 0.0,
        sample_rate: int = 44100
    ) -> np.ndarray:
        """Apply basic 3-band EQ"""
        
        # Design filters
        nyquist = sample_rate // 2
        
        # Low band (< 200 Hz)
        low_sos = signal.butter(2, 200 / nyquist, btype='lowpass', output='sos')
        
        # Mid band (200 Hz - 2 kHz)
        mid_sos = signal.butter(2, [200 / nyquist, 2000 / nyquist], btype='bandpass', output='sos')
        
        # High band (> 2 kHz)
        high_sos = signal.butter(2, 2000 / nyquist, btype='highpass', output='sos')
        
        # Apply filters
        low_band = signal.sosfilt(low_sos, audio_data) * (10 ** (low_gain / 20))
        mid_band = signal.sosfilt(mid_sos, audio_data) * (10 ** (mid_gain / 20))
        high_band = signal.sosfilt(high_sos, audio_data) * (10 ** (high_gain / 20))
        
        # Combine bands
        eq_audio = low_band + mid_band + high_band
        
        return self.normalize_audio(eq_audio)
    
    def change_tempo(
        self, 
        audio_data: np.ndarray, 
        tempo_factor: float,
        sample_rate: int = 44100
    ) -> np.ndarray:
        """Change tempo without affecting pitch"""
        
        return librosa.effects.time_stretch(audio_data, rate=tempo_factor)
    
    def change_pitch(
        self, 
        audio_data: np.ndarray, 
        semitones: float,
        sample_rate: int = 44100
    ) -> np.ndarray:
        """Change pitch without affecting tempo"""
        
        return librosa.effects.pitch_shift(audio_data, sr=sample_rate, n_steps=semitones)
    
    def add_reverb(
        self, 
        audio_data: np.ndarray, 
        room_size: float = 0.5, 
        damping: float = 0.5,
        sample_rate: int = 44100
    ) -> np.ndarray:
        """Add simple reverb effect"""
        
        # Simple reverb using multiple delays
        delays = [0.01, 0.02, 0.03, 0.05, 0.08]  # seconds
        gains = [0.3, 0.25, 0.2, 0.15, 0.1]
        
        reverb_audio = audio_data.copy()
        
        for delay, gain in zip(delays, gains):
            delay_samples = int(delay * sample_rate * room_size)
            if delay_samples < len(audio_data):
                # Create delayed version
                delayed = np.zeros_like(audio_data)
                delayed[delay_samples:] = audio_data[:-delay_samples]
                
                # Apply damping (low-pass filter)
                if damping > 0:
                    sos = signal.butter(2, 5000 * (1 - damping) / (sample_rate // 2), output='sos')
                    delayed = signal.sosfilt(sos, delayed)
                
                # Add to reverb
                reverb_audio += delayed * gain
        
        return self.normalize_audio(reverb_audio)
    
    def mix_audio(
        self, 
        audio_tracks: list, 
        gains: Optional[list] = None
    ) -> np.ndarray:
        """Mix multiple audio tracks"""
        
        if not audio_tracks:
            raise ValueError("No audio tracks provided")
        
        if gains is None:
            gains = [1.0] * len(audio_tracks)
        
        # Ensure all tracks have same length
        max_length = max(len(track) for track in audio_tracks)
        
        mixed_audio = np.zeros(max_length, dtype=np.float32)
        
        for track, gain in zip(audio_tracks, gains):
            # Pad track if needed
            if len(track) < max_length:
                padded_track = np.zeros(max_length, dtype=np.float32)
                padded_track[:len(track)] = track
                track = padded_track
            
            mixed_audio += track * gain
        
        return self.normalize_audio(mixed_audio)
    
    def analyze_audio(self, audio_data: np.ndarray, sample_rate: int = 44100) -> dict:
        """Analyze audio properties"""
        
        analysis = {}
        
        # Basic properties
        analysis['duration'] = len(audio_data) / sample_rate
        analysis['sample_rate'] = sample_rate
        analysis['channels'] = 1 if len(audio_data.shape) == 1 else audio_data.shape[0]
        
        # Level analysis
        analysis['rms'] = np.sqrt(np.mean(audio_data ** 2))
        analysis['peak'] = np.max(np.abs(audio_data))
        analysis['dynamic_range'] = 20 * np.log10(analysis['peak'] / analysis['rms']) if analysis['rms'] > 0 else 0
        
        # Spectral analysis
        fft = np.fft.rfft(audio_data)
        freqs = np.fft.rfftfreq(len(audio_data), 1/sample_rate)
        magnitude = np.abs(fft)
        
        # Find dominant frequency
        dominant_freq_idx = np.argmax(magnitude)
        analysis['dominant_frequency'] = freqs[dominant_freq_idx]
        
        # Spectral centroid
        analysis['spectral_centroid'] = np.sum(freqs * magnitude) / np.sum(magnitude)
        
        # Zero crossing rate
        zero_crossings = np.where(np.diff(np.signbit(audio_data)))[0]
        analysis['zero_crossing_rate'] = len(zero_crossings) / len(audio_data) * sample_rate
        
        return analysis
    
    async def process_audio_stream(
        self, 
        audio_generator, 
        effects: dict = None
    ):
        """Process audio stream with real-time effects"""
        
        effects = effects or {}
        
        async for chunk in audio_generator:
            # Apply effects to chunk
            processed_chunk = chunk
            
            if effects.get('normalize'):
                processed_chunk = self.normalize_audio(processed_chunk)
            
            if effects.get('fade_in'):
                processed_chunk = self.apply_fade(
                    processed_chunk, 
                    fade_in_duration=effects['fade_in']
                )
            
            if effects.get('eq'):
                eq_params = effects['eq']
                processed_chunk = self.apply_eq(
                    processed_chunk,
                    low_gain=eq_params.get('low', 0),
                    mid_gain=eq_params.get('mid', 0),
                    high_gain=eq_params.get('high', 0)
                )
            
            yield processed_chunk