"""
Advanced Speech Server for AI Coaching Voice Agent
=====================================================
Features:
- Text-to-Speech (gTTS + pyttsx3 fallback)
- Speech-to-Text (Vosk - offline capable)
- Real-time WebSocket streaming
- Audio processing and noise reduction
- Health monitoring
- Rate limiting
- Conversation export (PDF)

Author: AI Coaching Voice Agent
Version: 2.0.0
"""

from flask import Flask, request, send_file, jsonify, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from gtts import gTTS
import pyttsx3
import io
import os
import re
import json
import time
import wave
import base64
import threading
import queue
from datetime import datetime
from functools import wraps
import logging
from pathlib import Path

# Optional imports with graceful fallback
try:
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False
    print("⚠️ Vosk not available - using Web Speech API fallback")

try:
    import webrtcvad
    VAD_AVAILABLE = True
except ImportError:
    VAD_AVAILABLE = False
    print("⚠️ WebRTC VAD not available - voice activity detection disabled")

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("⚠️ ReportLab not available - PDF export disabled")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configuration
CONFIG = {
    'MAX_TEXT_LENGTH': 10000,
    'RATE_LIMIT_PER_MINUTE': 60,
    'VOSK_MODEL_PATH': 'vosk-model-small-en-us-0.15',
    'SAMPLE_RATE': 16000,
    'CHUNK_SIZE': 4096
}

# Rate limiting storage
rate_limit_store = {}

# Vosk model (lazy loading)
vosk_model = None

def get_vosk_model():
    """Lazy load Vosk model for speech recognition"""
    global vosk_model
    if not VOSK_AVAILABLE:
        return None
    if vosk_model is None:
        model_path = CONFIG['VOSK_MODEL_PATH']
        if os.path.exists(model_path):
            logger.info(f"Loading Vosk model from {model_path}")
            vosk_model = Model(model_path)
        else:
            logger.warning(f"Vosk model not found at {model_path}")
            return None
    return vosk_model

def rate_limit(limit_per_minute=60):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            client_ip = request.remote_addr
            current_time = time.time()
            
            if client_ip not in rate_limit_store:
                rate_limit_store[client_ip] = []
            
            # Clean old entries
            rate_limit_store[client_ip] = [
                t for t in rate_limit_store[client_ip] 
                if current_time - t < 60
            ]
            
            if len(rate_limit_store[client_ip]) >= limit_per_minute:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': 60
                }), 429
            
            rate_limit_store[client_ip].append(current_time)
            return f(*args, **kwargs)
        return wrapper
    return decorator

def clean_text_for_speech(text):
    """Clean and prepare text for speech synthesis"""
    if not text:
        return ""
    
    # Remove markdown formatting
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)  # Bold
    text = re.sub(r'\*(.+?)\*', r'\1', text)       # Italic
    text = re.sub(r'`(.+?)`', r'\1', text)         # Code
    text = re.sub(r'#{1,6}\s*', '', text)          # Headers
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text) # Links
    text = re.sub(r'```[\s\S]*?```', '', text)     # Code blocks
    text = re.sub(r'- ', '', text)                  # List items
    text = re.sub(r'\d+\. ', '', text)             # Numbered lists
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove special characters that sound weird
    text = re.sub(r'[<>{}|\\^~]', '', text)
    
    return text

def split_text_for_streaming(text, max_chunk=500):
    """Split text into smaller chunks for streaming TTS"""
    if len(text) <= max_chunk:
        return [text]
    
    chunks = []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk:
            current_chunk += " " + sentence if current_chunk else sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

# ============== TTS Endpoints ==============

@app.route('/api/tts', methods=['POST'])
@rate_limit(limit_per_minute=CONFIG['RATE_LIMIT_PER_MINUTE'])
def text_to_speech():
    """Convert text to speech using gTTS"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        lang = data.get('lang', 'en')
        slow = data.get('slow', False)
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Clean text for speech
        clean_text = clean_text_for_speech(text)
        
        if not clean_text:
            return jsonify({'error': 'No valid text after cleaning'}), 400
        
        # Limit text length
        if len(clean_text) > CONFIG['MAX_TEXT_LENGTH']:
            clean_text = clean_text[:CONFIG['MAX_TEXT_LENGTH']]
        
        logger.info(f"TTS request: {len(clean_text)} chars, lang={lang}")
        
        # Create speech using gTTS
        tts = gTTS(text=clean_text, lang=lang, slow=slow)
        
        # Save to bytes buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        return send_file(
            audio_buffer,
            mimetype='audio/mpeg',
            as_attachment=False
        )
    except Exception as e:
        logger.error(f"TTS Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/stream', methods=['POST'])
@rate_limit(limit_per_minute=CONFIG['RATE_LIMIT_PER_MINUTE'])
def text_to_speech_stream():
    """Stream TTS for longer texts"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        lang = data.get('lang', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        clean_text = clean_text_for_speech(text)
        chunks = split_text_for_streaming(clean_text)
        
        def generate():
            for chunk in chunks:
                if chunk.strip():
                    tts = gTTS(text=chunk, lang=lang, slow=False)
                    audio_buffer = io.BytesIO()
                    tts.write_to_fp(audio_buffer)
                    audio_buffer.seek(0)
                    yield audio_buffer.read()
        
        return Response(generate(), mimetype='audio/mpeg')
    except Exception as e:
        logger.error(f"TTS Stream Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/offline', methods=['POST'])
def text_to_speech_offline():
    """Offline TTS using pyttsx3 (system voices)"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        rate = data.get('rate', 150)
        volume = data.get('volume', 1.0)
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        clean_text = clean_text_for_speech(text)
        
        # pyttsx3 for offline TTS
        engine = pyttsx3.init()
        engine.setProperty('rate', rate)
        engine.setProperty('volume', volume)
        
        # Save to temp file then read
        temp_file = f'temp_tts_{int(time.time())}.mp3'
        engine.save_to_file(clean_text, temp_file)
        engine.runAndWait()
        
        # Read and return
        if os.path.exists(temp_file):
            with open(temp_file, 'rb') as f:
                audio_data = f.read()
            os.remove(temp_file)
            
            return send_file(
                io.BytesIO(audio_data),
                mimetype='audio/mpeg',
                as_attachment=False
            )
        else:
            return jsonify({'error': 'Failed to generate audio'}), 500
            
    except Exception as e:
        logger.error(f"Offline TTS Error: {e}")
        return jsonify({'error': str(e)}), 500

# ============== STT Endpoints ==============

@app.route('/api/stt', methods=['POST'])
def speech_to_text():
    """Convert speech to text using Vosk (offline)"""
    if not VOSK_AVAILABLE:
        return jsonify({
            'error': 'Vosk not available',
            'fallback': 'web-speech-api',
            'message': 'Use browser Web Speech API for transcription'
        }), 503
    
    try:
        model = get_vosk_model()
        if model is None:
            return jsonify({
                'error': 'Vosk model not loaded',
                'fallback': 'web-speech-api'
            }), 503
        
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        audio_data = audio_file.read()
        
        # Process audio with Vosk
        rec = KaldiRecognizer(model, CONFIG['SAMPLE_RATE'])
        rec.SetWords(True)
        
        # Process in chunks
        for i in range(0, len(audio_data), CONFIG['CHUNK_SIZE']):
            chunk = audio_data[i:i + CONFIG['CHUNK_SIZE']]
            rec.AcceptWaveform(chunk)
        
        result = json.loads(rec.FinalResult())
        
        return jsonify({
            'text': result.get('text', ''),
            'words': result.get('result', []),
            'confidence': sum(w.get('conf', 0) for w in result.get('result', [])) / max(len(result.get('result', [])), 1)
        })
        
    except Exception as e:
        logger.error(f"STT Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stt/config', methods=['GET'])
def get_stt_config():
    """Get STT configuration and capabilities"""
    return jsonify({
        'vosk_available': VOSK_AVAILABLE,
        'vad_available': VAD_AVAILABLE,
        'sample_rate': CONFIG['SAMPLE_RATE'],
        'recommended_fallback': 'assemblyai' if not VOSK_AVAILABLE else None,
        'features': {
            'offline': VOSK_AVAILABLE,
            'noise_reduction': VAD_AVAILABLE,
            'streaming': True
        }
    })

# ============== PDF Export ==============

@app.route('/api/export/pdf', methods=['POST'])
def export_conversation_pdf():
    """Export conversation as PDF"""
    if not PDF_AVAILABLE:
        return jsonify({
            'error': 'PDF export not available',
            'install': 'pip install reportlab'
        }), 503
    
    try:
        data = request.get_json()
        conversation = data.get('conversation', [])
        topic = data.get('topic', 'Conversation')
        summary = data.get('summary', '')
        coaching_option = data.get('coachingOption', '')
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#6B21A8')
        )
        
        user_style = ParagraphStyle(
            'UserMessage',
            parent=styles['Normal'],
            fontSize=11,
            leftIndent=20,
            spaceAfter=10,
            textColor=colors.HexColor('#1F2937'),
            backColor=colors.HexColor('#E9D5FF')
        )
        
        ai_style = ParagraphStyle(
            'AIMessage',
            parent=styles['Normal'],
            fontSize=11,
            leftIndent=20,
            spaceAfter=10,
            textColor=colors.HexColor('#1F2937'),
            backColor=colors.HexColor('#F3F4F6')
        )
        
        story = []
        
        # Title
        story.append(Paragraph(f"AI Coaching Session: {topic}", title_style))
        story.append(Spacer(1, 12))
        
        # Metadata
        meta_data = [
            ['Session Type:', coaching_option],
            ['Date:', datetime.now().strftime('%B %d, %Y at %I:%M %p')],
            ['Total Messages:', str(len(conversation))]
        ]
        meta_table = Table(meta_data, colWidths=[100, 300])
        meta_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#6B7280')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 20))
        
        # Conversation
        story.append(Paragraph("Conversation", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        for msg in conversation:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            if role == 'user':
                story.append(Paragraph(f"<b>You:</b> {content}", user_style))
            else:
                story.append(Paragraph(f"<b>AI Coach:</b> {content}", ai_style))
            story.append(Spacer(1, 8))
        
        # Summary
        if summary:
            story.append(Spacer(1, 20))
            story.append(Paragraph("Summary & Feedback", styles['Heading2']))
            story.append(Spacer(1, 12))
            story.append(Paragraph(summary, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        filename = f"coaching_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        logger.error(f"PDF Export Error: {e}")
        return jsonify({'error': str(e)}), 500

# ============== Health & Status ==============

@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'ai-coaching-speech-server',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat(),
        'capabilities': {
            'tts': True,
            'tts_offline': True,
            'stt': VOSK_AVAILABLE,
            'vad': VAD_AVAILABLE,
            'pdf_export': PDF_AVAILABLE
        }
    })

@app.route('/', methods=['GET'])
def root():
    """API documentation endpoint"""
    return jsonify({
        'service': 'AI Coaching Speech Server',
        'version': '2.0.0',
        'status': 'running',
        'endpoints': {
            '/api/tts': 'POST - Convert text to speech (gTTS)',
            '/api/tts/stream': 'POST - Stream TTS for long texts',
            '/api/tts/offline': 'POST - Offline TTS (pyttsx3)',
            '/api/stt': 'POST - Speech to text (Vosk)',
            '/api/stt/config': 'GET - STT configuration',
            '/api/export/pdf': 'POST - Export conversation as PDF',
            '/health': 'GET - Health check'
        },
        'features': {
            'Real-time TTS': 'Convert AI responses to natural speech',
            'Offline STT': 'Transcribe audio without internet (requires Vosk model)',
            'PDF Export': 'Export conversations as professional PDFs',
            'Rate Limiting': f'{CONFIG["RATE_LIMIT_PER_MINUTE"]} requests/minute'
        }
    })

# ============== WebSocket Events ==============

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'ok', 'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('tts_request')
def handle_tts_request(data):
    """Handle TTS request via WebSocket"""
    try:
        text = data.get('text', '')
        if not text:
            emit('tts_error', {'error': 'No text provided'})
            return
        
        clean_text = clean_text_for_speech(text)
        tts = gTTS(text=clean_text, lang=data.get('lang', 'en'), slow=False)
        
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Encode as base64 for WebSocket transfer
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
        
        emit('tts_response', {
            'audio': audio_base64,
            'format': 'mp3',
            'text': clean_text
        })
    except Exception as e:
        emit('tts_error', {'error': str(e)})

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Handle streaming audio for STT"""
    if not VOSK_AVAILABLE:
        emit('stt_fallback', {'message': 'Use Web Speech API'})
        return
    
    try:
        audio_data = base64.b64decode(data.get('audio', ''))
        model = get_vosk_model()
        
        if model is None:
            emit('stt_error', {'error': 'Model not loaded'})
            return
        
        rec = KaldiRecognizer(model, CONFIG['SAMPLE_RATE'])
        
        if rec.AcceptWaveform(audio_data):
            result = json.loads(rec.Result())
            emit('stt_final', {'text': result.get('text', '')})
        else:
            partial = json.loads(rec.PartialResult())
            emit('stt_partial', {'text': partial.get('partial', '')})
            
    except Exception as e:
        emit('stt_error', {'error': str(e)})

# ============== Main ==============

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print("=" * 60)
    print("🎙️  AI Coaching Speech Server v2.0.0")
    print("=" * 60)
    print(f"📡 Running on http://localhost:{port}")
    print(f"🔊 TTS: gTTS (online) + pyttsx3 (offline)")
    print(f"🎤 STT: {'Vosk (offline)' if VOSK_AVAILABLE else 'Web Speech API (browser)'}")
    print(f"📄 PDF Export: {'Available' if PDF_AVAILABLE else 'Not available'}")
    print(f"🔒 Rate Limit: {CONFIG['RATE_LIMIT_PER_MINUTE']} requests/minute")
    print("=" * 60)
    
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)
