# SMS Slang Translator Backend

A Flask REST API that translates SMS abbreviations to their full phrases.

## Features

- **Translation API**: Convert text containing SMS abbreviations to full phrases
- **Slang Dictionary API**: Get all available abbreviations and their meanings
- **Health Check**: Monitor API status
- **CORS Support**: Enable cross-origin requests from frontend

## Installation

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

### Development
```bash
python app.py
```

The server will start on `http://localhost:5000`

### Production (with Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### GET /
Returns API information and available endpoints.

### POST /translate
Translates SMS abbreviations in the given text.

**Request Body:**
```json
{
  "text": "Hey brb need to check something asap"
}
```

**Response:**
```json
{
  "success": true,
  "original": "Hey brb need to check something asap",
  "translated": "Hey Be Right Back need to check something As Soon As Possible"
}
```

### GET /slang
Returns all available slang abbreviations and their meanings.

**Response:**
```json
{
  "slang": {
    "LOL": "Laughing Out Loud",
    "BRB": "Be Right Back",
    ...
  },
  "count": 104
}
```

### GET /health
Returns API health status.

**Response:**
```json
{
  "status": "healthy",
  "slang_loaded": true,
  "slang_count": 104
}
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `FLASK_DEBUG`: Enable debug mode (default: False)

## Testing

Test the API with curl:
```bash
# Health check
curl http://localhost:5000/health

# Translate text
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hey brb lol ttyl"}'
```
