# SMS Slang Translator

A full-stack web application that converts SMS abbreviations and text slang to their full phrases. Built with Python Flask backend and a modern HTML/CSS/JavaScript frontend.

## 🚀 Features

- **Real-time Translation**: Convert SMS abbreviations like "brb", "lol", "asap" to full phrases
- **Modern Web Interface**: Clean, responsive UI that works on desktop and mobile
- **104+ Abbreviations**: Comprehensive dictionary of common SMS slang
- **Search & Browse**: Easily find and explore all available abbreviations
- **Copy to Clipboard**: One-click copy of translated text
- **API Health Monitoring**: Real-time status indicator for backend connection
- **Offline Fallback**: Local translation when API is unavailable

## 📸 Screenshots

### Main Interface
![SMS Slang Translator Interface](https://github.com/user-attachments/assets/c834cb12-aff6-4a20-8fca-43f7e7abbc7d)

### Translation in Action
![Translation Example](https://github.com/user-attachments/assets/56122bed-1238-489f-964a-f8193e305f7c)

## 🛠️ Project Structure

```
cloud-computing-project/
├── backend/                 # Flask REST API
│   ├── app.py              # Main application
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── frontend/               # Web interface
│   ├── index.html          # Main page
│   ├── css/
│   │   └── styles.css      # Styling
│   ├── js/
│   │   └── app.js          # Application logic
│   └── README.md           # Frontend documentation
├── slang.txt               # Abbreviation dictionary
├── Script.py               # Original CLI script
└── README.md               # This file
```

## 🏃 Quick Start

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

The API will be available at `http://localhost:5000`

### 2. Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Serve the frontend (using Python)
python -m http.server 8080
```

Open your browser and go to `http://localhost:8080`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/translate` | POST | Translate text |
| `/slang` | GET | Get all abbreviations |
| `/health` | GET | Health check |

### Example API Usage

```bash
# Translate text
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hey brb lol ttyl"}'

# Response:
{
  "success": true,
  "original": "Hey brb lol ttyl",
  "translated": "Hey Be Right Back Laughing Out Loud Talk To You Later"
}
```

## 🔤 Sample Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| LOL | Laughing Out Loud |
| BRB | Be Right Back |
| ASAP | As Soon As Possible |
| BTW | By The Way |
| TTYL | Talk To You Later |
| IDK | I Don't Know |
| IMO | In My Opinion |
| GOAT | Greatest Of All Time |

...and 96+ more!

## 🛠️ Technologies Used

### Backend
- **Python 3** - Programming language
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Gunicorn** - Production WSGI server

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - No framework dependencies
- **Google Fonts** - Inter font family

## 📝 Original CLI Script

The original command-line script is still available:

```bash
python Script.py
```

Enter messages like "Hey Rishabh brb!!" and get: "Hey Rishabh Be Right Back"

## 📚 Tutorial

Based on: [Python Script to Turn Text Message Abbreviations Into Actual Phrases](https://medium.com/nerd-stuff/python-script-to-turn-text-message-abbreviations-into-actual-phrases-d5db6f489222)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
