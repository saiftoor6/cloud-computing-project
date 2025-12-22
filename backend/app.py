"""
SMS Slang Translator Backend API
A Flask application that provides REST API endpoints for translating SMS abbreviations
"""
import os
import csv
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Get the directory of this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Path to slang.txt in parent directory
SLANG_FILE = os.path.join(BASE_DIR, '..', 'slang.txt')


def load_slang_dictionary():
    """Load the slang dictionary from the text file."""
    slang_dict = {}
    try:
        with open(SLANG_FILE, 'r', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter='=')
            for row in reader:
                if len(row) >= 2:
                    slang_dict[row[0].upper()] = row[1]
    except FileNotFoundError:
        print(f"Warning: Slang file not found at {SLANG_FILE}")
    return slang_dict


# Load slang dictionary once at startup
SLANG_DICTIONARY = load_slang_dictionary()


def translate_text(user_string):
    """
    Translate SMS abbreviations in the given text to their full phrases.
    
    Args:
        user_string: The input text containing potential abbreviations
        
    Returns:
        Translated text with abbreviations expanded
    """
    if not user_string:
        return ""
    
    words = user_string.split(" ")
    translated_words = []
    
    for word in words:
        # Remove special characters for matching, but keep track of original
        clean_word = re.sub('[^a-zA-Z0-9-_.]', '', word)
        
        # Check if the cleaned word (uppercase) exists in our dictionary
        if clean_word.upper() in SLANG_DICTIONARY:
            translated_words.append(SLANG_DICTIONARY[clean_word.upper()])
        else:
            translated_words.append(word)
    
    return ' '.join(translated_words)


@app.route('/')
def home():
    """Home endpoint with API information."""
    return jsonify({
        'message': 'Welcome to SMS Slang Translator API',
        'version': '1.0.0',
        'endpoints': {
            '/translate': 'POST - Translate SMS abbreviations',
            '/slang': 'GET - Get all available slang translations'
        }
    })


@app.route('/translate', methods=['POST'])
def translate():
    """
    Translate SMS abbreviations in the given text.
    
    Request body:
        {"text": "Hey brb need to check something asap"}
        
    Response:
        {"original": "...", "translated": "...", "success": true}
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing "text" field in request body'
            }), 400
        
        original_text = data['text']
        translated_text = translate_text(original_text)
        
        return jsonify({
            'success': True,
            'original': original_text,
            'translated': translated_text
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/slang', methods=['GET'])
def get_slang():
    """
    Get all available slang translations.
    
    Response:
        {"slang": {"LOL": "Laughing Out Loud", ...}, "count": 100}
    """
    return jsonify({
        'slang': SLANG_DICTIONARY,
        'count': len(SLANG_DICTIONARY)
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'slang_loaded': len(SLANG_DICTIONARY) > 0,
        'slang_count': len(SLANG_DICTIONARY)
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
