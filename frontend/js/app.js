/**
 * SMS Slang Translator - Frontend Application
 * Premium version with dark mode, animations, and enhanced UX
 */

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    TOAST_DURATION: 3000,
    TYPING_SPEED: 20, // ms per character
    THEME_KEY: 'sms-translator-theme'
};

// DOM Elements
const elements = {
    inputText: document.getElementById('input-text'),
    outputText: document.getElementById('output-text'),
    translateBtn: document.getElementById('translate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    copyBtn: document.getElementById('copy-btn'),
    slangList: document.getElementById('slang-list'),
    slangCount: document.getElementById('slang-count'),
    searchSlang: document.getElementById('search-slang'),
    apiStatus: document.getElementById('api-status'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    themeLabel: document.getElementById('theme-label')
};

// State
let slangDictionary = {};
let isApiOnline = false;
let currentTheme = 'light';

/**
 * Theme Management
 */
function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem(CONFIG.THEME_KEY, theme);

    if (theme === 'dark') {
        elements.themeIcon.textContent = '☀️';
        elements.themeLabel.textContent = 'Light Mode';
    } else {
        elements.themeIcon.textContent = '🌙';
        elements.themeLabel.textContent = 'Dark Mode';
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

/**
 * Show toast notification with animation
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', or default)
 */
function showToast(message, type = '') {
    elements.toastMessage.textContent = message;
    elements.toast.className = 'toast ' + type;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, CONFIG.TOAST_DURATION);
}

/**
 * Make API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
    const url = CONFIG.API_BASE_URL + endpoint;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        throw new Error('API request failed with status ' + response.status);
    }

    return response.json();
}

/**
 * Check API health status
 */
async function checkApiHealth() {
    try {
        const data = await apiRequest('/health');

        if (data.status === 'healthy') {
            elements.apiStatus.textContent = 'Online';
            elements.apiStatus.className = 'status-indicator online';
            isApiOnline = true;
        } else {
            throw new Error('API unhealthy');
        }
    } catch (error) {
        elements.apiStatus.textContent = 'Offline';
        elements.apiStatus.className = 'status-indicator offline';
        isApiOnline = false;
        console.error('API Health Check Failed:', error);
    }
}

/**
 * Load slang dictionary from API
 */
/**
 * Load slang dictionary
 * Priorities:
 * 1. Local SLANG_DATA (generated from slang.txt) - Fastest & Offline
 * 2. API /slang endpoint - Dynamic
 */
async function loadSlangDictionary() {
    // Check for local data first (Direct mapping from slang.txt)
    if (typeof SLANG_DATA !== 'undefined') {
        console.log('Loaded slang dictionary from local file');
        slangDictionary = SLANG_DATA;
        elements.slangCount.textContent = Object.keys(SLANG_DATA).length + ' items';
        renderSlangList(slangDictionary);

        // We have data, so we don't strictly *need* the API for the dictionary
        // But we can check API health separately
        return;
    }

    try {
        const data = await apiRequest('/slang');
        slangDictionary = data.slang;
        elements.slangCount.textContent = data.count + ' items';
        renderSlangList(slangDictionary);
    } catch (error) {
        elements.slangList.innerHTML = '<p class="no-results">Failed to load abbreviations. Please check if the API is running.</p>';
        elements.slangCount.textContent = 'Error';
        console.error('Failed to load slang dictionary:', error);
    }
}

/**
 * Render slang list in the UI
 * @param {Object} slang - Slang dictionary object
 */
function renderSlangList(slang) {
    if (Object.keys(slang).length === 0) {
        elements.slangList.innerHTML = '<p class="no-results">No abbreviations found.</p>';
        return;
    }

    const sortedKeys = Object.keys(slang).sort();

    let html = '';
    for (const key of sortedKeys) {
        const escapedKey = escapeHtml(key);
        const escapedValue = escapeHtml(slang[key]);
        html += '<div class="slang-item" role="listitem">' +
            '<span class="slang-abbr">' + escapedKey + '</span>' +
            '<span class="slang-meaning">= ' + escapedValue + '</span>' +
            '</div>';
    }

    elements.slangList.innerHTML = html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Filter slang list based on search term
 * @param {string} searchTerm - Search term
 */
function filterSlangList(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
        renderSlangList(slangDictionary);
        return;
    }

    const filtered = {};
    for (const key of Object.keys(slangDictionary)) {
        if (key.toLowerCase().includes(term) ||
            slangDictionary[key].toLowerCase().includes(term)) {
            filtered[key] = slangDictionary[key];
        }
    }

    renderSlangList(filtered);
}

/**
 * Typing animation effect for output
 * @param {string} text - Text to type
 * @param {HTMLElement} element - Target element
 */
async function typeText(text, element) {
    element.innerHTML = '';
    element.classList.add('has-content');

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);

    for (let i = 0; i < text.length; i++) {
        const char = document.createTextNode(text[i]);
        element.insertBefore(char, cursor);
        await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_SPEED));
    }

    // Remove cursor after typing
    setTimeout(() => {
        cursor.remove();
    }, 1000);
}

/**
 * Translate text using the API
 */
async function translateText() {
    const text = elements.inputText.value.trim();

    if (!text) {
        showToast('Please enter some text to translate.', 'error');
        elements.inputText.focus();
        return;
    }

    if (!isApiOnline) {
        // Use local translation (Preferred method as per user request for direct mapping)
        const translated = localTranslate(text);
        await typeText(translated, elements.outputText);
        elements.copyBtn.disabled = false;
        showToast('Translated using local dictionary', 'success');
        return;
    }

    try {
        elements.translateBtn.disabled = true;
        elements.translateBtn.innerHTML = '<span class="btn-icon">⏳</span> Translating...';

        const data = await apiRequest('/translate', {
            method: 'POST',
            body: JSON.stringify({ text: text })
        });

        if (data.success) {
            await typeText(data.translated, elements.outputText);
            elements.copyBtn.disabled = false;
            showToast('Translation complete!', 'success');
        } else {
            throw new Error(data.error || 'Translation failed');
        }
    } catch (error) {
        // Fallback to local translation
        const translated = localTranslate(text);
        await typeText(translated, elements.outputText);
        elements.copyBtn.disabled = false;
        showToast('Used local translation (API error)', '');
        console.error('Translation error:', error);
    } finally {
        elements.translateBtn.disabled = false;
        elements.translateBtn.innerHTML = '<span class="btn-icon">🔄</span> Translate';
    }
}

/**
 * Local translation fallback
 * @param {string} text - Text to translate
 * @returns {string} - Translated text
 */
function localTranslate(text) {
    const words = text.split(' ');
    const translated = words.map(word => {
        const cleanWord = word.replace(/[^a-zA-Z0-9-_.]/g, '');
        const upperWord = cleanWord.toUpperCase();

        if (slangDictionary[upperWord]) {
            return slangDictionary[upperWord];
        }
        return word;
    });

    return translated.join(' ');
}

/**
 * Display translation result (without animation)
 * @param {string} text - Translated text
 */
function displayTranslation(text) {
    elements.outputText.innerHTML = '';
    elements.outputText.textContent = text;
    elements.outputText.classList.add('has-content');
    elements.copyBtn.disabled = false;
}

/**
 * Clear all input and output
 */
function clearAll() {
    elements.inputText.value = '';
    elements.outputText.innerHTML = '<span class="placeholder-text">Your translated text will appear here...</span>';
    elements.outputText.classList.remove('has-content');
    elements.copyBtn.disabled = true;
    elements.inputText.focus();
}

/**
 * Copy translated text to clipboard
 */
async function copyToClipboard() {
    const text = elements.outputText.textContent;

    if (!text || text === 'Your translated text will appear here...') {
        showToast('No text to copy', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');

        // Visual feedback
        elements.copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
        setTimeout(() => {
            elements.copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy to Clipboard';
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy text', 'error');
        }

        document.body.removeChild(textArea);
    }
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboard(event) {
    // Ctrl/Cmd + Enter to translate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        translateText();
    }
}

/**
 * Add ripple effect to buttons
 * @param {MouseEvent} event - Click event
 */
function addRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Initialize the application
 */
function init() {
    // Initialize theme
    initTheme();

    // Event listeners
    elements.translateBtn.addEventListener('click', translateText);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.searchSlang.addEventListener('input', (e) => filterSlangList(e.target.value));
    elements.inputText.addEventListener('keydown', handleKeyboard);
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Initial API check and data load
    checkApiHealth();
    loadSlangDictionary();

    // Periodic health check every 30 seconds
    setInterval(checkApiHealth, 30000);

    // Focus input on load
    elements.inputText.focus();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(CONFIG.THEME_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Add ripple animation style
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
