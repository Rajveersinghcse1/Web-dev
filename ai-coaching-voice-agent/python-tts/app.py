from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import io
import os
import re
import logging
import time

# Basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('python-tts')

app = Flask(__name__)

# Allow configuring allowed origins via env var; fallback to allow all for LAN/dev
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*')
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Limits
MAX_TEXT_LENGTH = int(os.environ.get('MAX_TTS_TEXT_LENGTH', 5000))


def clean_text_for_speech(text: str) -> str:
    """Clean user-provided text to improve TTS output."""
    if not text:
        return ""

    # remove Markdown-like constructs but keep content
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'#{1,6}\s*', '', text)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)

    # collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'python-tts', 'timestamp': time.time()}), 200


@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    start_time = time.time()
    try:
        # Accept JSON body or form data
        data = None
        if request.is_json:
            data = request.get_json()
        else:
            # fallback to form or fields
            data = request.form.to_dict() or request.values.to_dict()

        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        text = data.get('text') or data.get('message') or ''
        lang = (data.get('lang') or 'en').strip()

        if not text:
            logger.warning('TTS request with empty text')
            return jsonify({'error': 'No text provided'}), 400

        # Clean text
        clean_text = clean_text_for_speech(text)
        if not clean_text:
            logger.warning('Text cleaned to empty string')
            return jsonify({'error': 'Text empty after cleaning'}), 400

        # Enforce max length
        if len(clean_text) > MAX_TEXT_LENGTH:
            logger.info('Truncating text to MAX_TEXT_LENGTH')
            clean_text = clean_text[:MAX_TEXT_LENGTH]

        logger.info(f'Generating TTS (chars={len(clean_text)}, lang={lang})')

        # Create TTS
        tts = gTTS(text=clean_text, lang=lang, slow=False)

        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)

        duration = time.time() - start_time
        logger.info(f'TTS generated in {duration:.2f}s')

        # Return streaming file response
        return send_file(
            audio_fp,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name='speech.mp3'
        )

    except Exception as e:
        logger.exception('Error generating TTS')
        return jsonify({'error': 'TTS generation failed', 'message': str(e)}), 500


@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'python-tts',
        'status': 'running',
        'endpoints': {
            '/api/tts': 'POST - Convert text to speech (JSON `{ "text": "..." }`)',
            '/health': 'GET - Health check'
        }
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    logger.info(f'Starting python-tts on {host}:{port} - CORS origins: {allowed_origins}')
    # Use debug=False in production; debug=True is convenient for local dev
    app.run(host=host, port=port, debug=True)
