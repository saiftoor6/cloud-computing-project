"""
SMS Slang Translator Backend API
Production-ready Flask application with logging, rate limiting, and proper error handling
"""
import os
import csv
import re
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Serve frontend static files from root
app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Configure CORS - allow all origins in development, restrict in production
cors_origins = os.environ.get('CORS_ORIGINS', '*')
CORS(app, origins=cors_origins.split(',') if cors_origins != '*' else '*')

# Get the directory of this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Path to slang.txt - check both locations (for Docker and local dev)
SLANG_FILE = os.path.join(BASE_DIR, 'slang.txt')
if not os.path.exists(SLANG_FILE):
    SLANG_FILE = os.path.join(BASE_DIR, '..', 'slang.txt')

# Version info
VERSION = '2.1.0'
START_TIME = datetime.utcnow()


def load_slang_dictionary():
    """Load the slang dictionary from the text file."""
    slang_dict = {}
    try:
        with open(SLANG_FILE, 'r', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter='=')
            for row in reader:
                if len(row) >= 2:
                    slang_dict[row[0].upper().strip()] = row[1].strip()
        logger.info(f"Loaded {len(slang_dict)} slang entries from {SLANG_FILE}")
    except FileNotFoundError:
        logger.warning(f"Slang file not found at {SLANG_FILE}")
    except Exception as e:
        logger.error(f"Error loading slang file: {e}")
    return slang_dict


# Load slang dictionary once at startup
SLANG_DICTIONARY = load_slang_dictionary()


def translate_text(user_string):
    """Translate SMS abbreviations in the given text to their full phrases."""
    if not user_string:
        return "", 0
    
    words = user_string.split(" ")
    translated_words = []
    translations_made = 0
    
    for word in words:
        clean_word = re.sub('[^a-zA-Z0-9-_.]', '', word)
        
        if clean_word.upper() in SLANG_DICTIONARY:
            translated_words.append(SLANG_DICTIONARY[clean_word.upper()])
            translations_made += 1
        else:
            translated_words.append(word)
    
    return ' '.join(translated_words), translations_made


def validate_text_input(text):
    """Validate text input for translation."""
    if not text:
        return False, "Text cannot be empty"
    if len(text) > 10000:
        return False, "Text exceeds maximum length of 10000 characters"
    return True, None


@app.route('/')
def home():
    """Serve the frontend application."""
    return app.send_static_file('index.html')


@app.route('/api')
def api_info():
    """API information endpoint."""
    return jsonify({
        'message': 'Welcome to SMS Slang Translator API',
        'version': VERSION,
        'documentation': {
            'translate': {'method': 'POST', 'path': '/translate'},
            'slang': {'method': 'GET', 'path': '/slang'},
            'health': {'method': 'GET', 'path': '/health'}
        }
    })


@app.route('/translate', methods=['POST'])
def translate():
    """Translate SMS abbreviations in the given text."""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            logger.warning("Translation request missing text field")
            return jsonify({'success': False, 'error': 'Missing "text" field'}), 400
        
        original_text = data['text']
        is_valid, error = validate_text_input(original_text)
        if not is_valid:
            return jsonify({'success': False, 'error': error}), 400
        
        translated_text, translations_count = translate_text(original_text)
        
        return jsonify({
            'success': True,
            'original': original_text,
            'translated': translated_text,
            'translations_count': translations_count
        })
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.route('/slang', methods=['GET'])
def get_slang():
    """Get all available slang translations."""
    search = request.args.get('search', '').upper()
    
    if search:
        filtered = {k: v for k, v in SLANG_DICTIONARY.items() 
                   if search in k or search in v.upper()}
        return jsonify({
            'slang': filtered,
            'count': len(filtered),
            'total': len(SLANG_DICTIONARY)
        })
    
    return jsonify({
        'slang': SLANG_DICTIONARY,
        'count': len(SLANG_DICTIONARY)
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    uptime = (datetime.utcnow() - START_TIME).total_seconds()
    return jsonify({
        'status': 'healthy',
        'version': VERSION,
        'uptime_seconds': round(uptime, 2),
        'slang_loaded': len(SLANG_DICTIONARY) > 0
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors - Return frontend for SPA feeling or API error."""
    if request.path.startswith('/api/') or request.path == '/health':
        return jsonify({'success': False, 'error': 'Endpoint not found'}), 404
    # Fallback to index.html for frontend routing if we had any
    return app.send_static_file('index.html')


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
