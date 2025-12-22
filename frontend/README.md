# SMS Slang Translator Frontend

A modern, responsive web interface for the SMS Slang Translator API.

## Features

- **Real-time Translation**: Convert SMS abbreviations to full phrases instantly
- **Slang Dictionary**: Browse all 104+ available abbreviations
- **Search**: Filter abbreviations by keyword
- **Copy to Clipboard**: One-click copy of translated text
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Fallback**: Local translation when API is unavailable
- **API Health Indicator**: Real-time API status monitoring

## Usage

### Running Locally

1. Start the backend server first (see backend/README.md)

2. Serve the frontend:
   ```bash
   # Using Python's built-in server
   python -m http.server 8080
   
   # Or using Node.js http-server
   npx http-server -p 8080
   ```

3. Open `http://localhost:8080` in your browser

### Configuration

The frontend connects to the backend API at `http://localhost:5000` by default. To change this, edit the `CONFIG.API_BASE_URL` in `js/app.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://your-api-url:port',
    TOAST_DURATION: 3000
};
```

## File Structure

```
frontend/
├── index.html      # Main HTML page
├── css/
│   └── styles.css  # Styling and responsive design
├── js/
│   └── app.js      # Application logic and API communication
└── README.md       # This file
```

## Features in Detail

### Translation
- Enter text containing SMS abbreviations (e.g., "brb", "lol", "asap")
- Click "Translate" or press Ctrl+Enter
- View the translated text with expanded phrases

### Dictionary
- Browse all available abbreviations alphabetically
- Use the search box to filter by abbreviation or meaning
- Scrollable list with 104+ entries

### Keyboard Shortcuts
- `Ctrl+Enter` / `Cmd+Enter`: Translate text

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
