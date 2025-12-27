# noCap. - Official Documentation

**Version 3.0.0** | Last Updated: December 2024

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Color Scheme & Design System](#color-scheme--design-system)
4. [How It Works](#how-it-works)
5. [Components](#components)
6. [API Documentation](#api-documentation)
7. [Browser Extension](#browser-extension)
8. [Setup & Installation](#setup--installation)
9. [Development Guide](#development-guide)
10. [Security Features](#security-features)

---

## Project Overview

**noCap.** is an AI-powered slang translator and decoder that helps users understand informal language, abbreviations, and modern slang terms. The project consists of three main components:

1. **Frontend Web Application** - A beautiful, responsive web interface
2. **Backend API Server** - Node.js server connecting to LM Studio
3. **Browser Extension** - Chrome/Edge extension for decoding slang on any webpage

### Key Features

- 🎨 **Beautiful UI/UX** - Modern, responsive design with smooth animations
- 🌙 **Dark Mode Support** - Seamless theme switching
- ⚡ **Real-time Analysis** - Instant slang word detection and translation
- 🔍 **Browser Extension** - Decode slang on any webpage
- 🛡️ **Secure & Bulletproof** - Comprehensive security measures
- 📱 **Mobile Responsive** - Works on desktop, tablet, and mobile devices

---

## Architecture

### System Architecture

```
┌─────────────────┐
│   Frontend      │  React/Vanilla JS Web App
│   (Port 8000)   │  ├── HTML/CSS/JS
└────────┬────────┘  └── Chat Memory System
         │
         │ HTTP Requests
         │
┌────────▼────────┐
│   Backend API   │  Express.js Server
│   (Port 3000)   │  ├── /chat endpoint
└────────┬────────┘  └── Security & Validation
         │
         │ HTTP Requests
         │
┌────────▼────────┐
│   LM Studio     │  Local LLM Server
│   (Port 1234)   │  ├── Mistral-7B Model
└─────────────────┘  └── Chat Completions API

┌─────────────────┐
│ Browser Ext.    │  Chrome Extension
│   (Content)     │  ├── Content Scripts
└─────────────────┘  └── Popup Interface
```

### Technology Stack

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5/CSS3
- LocalStorage API
- Fetch API

**Backend:**
- Node.js
- Express.js
- node-fetch
- CORS middleware

**Browser Extension:**
- Chrome Extension Manifest V3
- Content Scripts
- Chrome Storage API
- Chrome Tabs API

**AI Integration:**
- LM Studio (Local LLM Server)
- Mistral-7B-Instruct Model

---

## Color Scheme & Design System

### Light Mode

#### Primary Colors
```css
--purple-main: #6D28D9        /* Primary brand color */
--purple-deep: #5B21B6        /* Hover states, accents */
--purple-soft: #EDE9FE        /* Background highlights */
--purple-glow: rgba(109, 40, 217, 0.35)  /* Shadows, glows */
```

#### Background Colors
```css
--bg-main: #F9FAFB            /* Main page background */
--bg-card: #FFFFFF            /* Card/panel backgrounds */
--bg-input: #F9FAFB           /* Input field backgrounds */
```

#### Text Colors
```css
--text-main: #111827          /* Primary text */
--text-muted: #6B7280         /* Secondary text, placeholders */
```

#### Borders & Shadows
```css
--border: #E5E7EB             /* Border color */
--shadow-strong: 0 30px 80px rgba(109, 40, 217, 0.25)  /* Large shadows */
```

### Dark Mode

#### Primary Colors
```css
--purple-main: #a78bfa        /* Bright purple for visibility */
--purple-deep: #8b5cf6        /* Darker purple accent */
--purple-soft: rgba(167, 139, 250, 0.2)  /* Subtle backgrounds */
--purple-glow: rgba(167, 139, 250, 0.4)  /* Enhanced glows */
```

#### Background Colors
```css
--bg-main: #1a1b23            /* Soft dark background */
--bg-card: #252732            /* Elevated card background */
--bg-input: #2d2f3a           /* Input surface */
```

#### Text Colors
```css
--text-main: #f3f4f6          /* Bright white for contrast */
--text-muted: #9ca3af         /* Light gray for secondary text */
```

#### Borders & Shadows
```css
--border: rgba(255, 255, 255, 0.1)  /* Subtle borders */
--shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.5)  /* Deep shadows */
```

### Typography

**Font Family:**
```css
-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", 
"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif
```

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extra Bold: 800 (for branding)

**Font Sizes:**
- Heading 1: 44px
- Heading 2: 20px
- Body: 15px
- Small: 13-14px
- Tiny: 12px

### Spacing System

- Base unit: 4px
- Small: 8px, 12px
- Medium: 16px, 20px, 24px
- Large: 32px, 40px, 48px

### Border Radius

- Small: 8px, 10px
- Medium: 12px, 14px
- Large: 16px, 18px
- Full: 50% (circles)

### Transitions

- Standard: `250ms ease`
- Smooth: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Fast: `0.2s ease`

---

## How It Works

### Frontend Application Flow

1. **User Input**
   - User types or pastes a message containing slang
   - Input is validated and sanitized (max 2000 characters)

2. **API Request**
   - Frontend sends POST request to `/chat` endpoint
   - Request includes messages array with AI prompt and user message
   - Temperature set to 0.1 for consistent results

3. **Backend Processing**
   - Backend receives and validates request
   - Forwards request to LM Studio API
   - LM Studio processes with Mistral-7B model
   - Returns JSON response with slang analysis

4. **Response Parsing**
   - Frontend receives JSON response
   - Parses and validates structure
   - Extracts slang words array

5. **Display Results**
   - Each slang word displayed in card format
   - Shows: word, pronunciation, meaning, example
   - Animations and smooth scrolling
   - User can continue conversation

### Browser Extension Flow

1. **Text Selection**
   - User selects text on any webpage
   - Extension detects selection (debounced 150ms)
   - Validates selection is not in input fields

2. **Analysis Request**
   - Extension sends selected text to backend API
   - API analyzes text for slang words
   - Returns JSON with detected slang

3. **Tooltip Display**
   - Extension creates tooltip element
   - Positions above selected text
   - Shows word, meaning, and example
   - Auto-hides after 5 seconds

4. **Cache Management**
   - Results cached to avoid duplicate API calls
   - Cache stored in memory (per-page session)

### AI Prompt Engineering

The system uses a carefully crafted prompt to ensure accurate slang detection:

```
You are noCap, an intent-aware slang analyzer.

STEP 1 — UNDERSTAND INTENT:
- Determine whether the message is casual, informal, or conversational
- If the tone is casual, evaluate words in their INFORMAL sense

STEP 2 — IDENTIFY ALL SLANG & INFORMAL WORDS:
- Identify EVERY slang word, abbreviation, or informal term
- DO NOT skip any slang words - find ALL of them
- Each slang word should have its own entry

JSON FORMAT:
{"highlighted_message":"", "slangs":[{"word":"","pronunciation":"","meaning":"","example":""}]}
```

---

## Components

### Frontend Structure

```
frontend/
├── index.html          # Main HTML structure
├── style.css           # Complete styling system
├── app.js              # Main application logic
└── chatMemory.js       # Conversation memory management
```

#### Key Frontend Components

**1. Greeting Screen**
- Welcome message with personalized greeting
- Initial input field
- Clean, centered layout

**2. Response Area**
- Dynamic content area for AI responses
- Word definition cards
- User message bubbles
- Error message displays

**3. Input System**
- Auto-resizing textarea
- Send button with visual states
- Input validation and sanitization
- Theme-aware styling

**4. Theme Toggle**
- Smooth theme switching
- Persistent storage (localStorage)
- SVG icons (sun/moon)
- Hover animations

**5. Preloader**
- Animated spinner
- Gradient text effect
- Particle animations
- Smooth fade-out

### Backend Structure

```
backend/
├── server.js           # Express server & API routes
├── routes/
│   └── chat.js        # Chat endpoint handler
├── services/
│   └── aiService.js   # AI integration service
├── middleware/
│   └── context.js     # Context middleware
└── package.json       # Dependencies
```

#### API Endpoints

**POST /chat**
- Main chat endpoint
- Accepts: `{ messages: [], temperature: number }`
- Returns: `{ reply: string }`
- Validates input, sanitizes data, handles errors

**GET /**
- Health check endpoint
- Returns: `{ status: "ok", message: string }`

**POST /history** (Legacy)
- Word history lookup
- Returns word origin and usage

**POST /analyze** (Legacy)
- Full message analysis
- Returns context, tone, slang array

### Extension Structure

```
noCap-exten/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── content.js          # Content script (injected)
└── style.css           # Popup styling (not injected)
```

#### Extension Components

**1. Popup Interface**
- Status indicator (connection status)
- Quick action buttons
- Settings toggles
- Recent results display

**2. Content Script**
- Text selection handler
- API integration
- Tooltip creation and management
- Cache system

**3. Message Passing**
- Communication between popup and content script
- Settings synchronization
- State management

---

## API Documentation

### POST /chat

**Endpoint:** `http://localhost:3000/chat`

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "AI prompt + user message"
    }
  ],
  "temperature": 0.1
}
```

**Response:**
```json
{
  "reply": "{\"highlighted_message\":\"...\",\"slangs\":[{\"word\":\"...\",\"pronunciation\":\"...\",\"meaning\":\"...\",\"example\":\"...\"}]}"
}
```

**Error Responses:**
- `400` - Invalid request (missing messages, validation failed)
- `502` - LM Studio error or invalid response
- `503` - LM Studio unavailable
- `500` - Internal server error

**Rate Limiting:**
- No explicit rate limiting
- Request timeout: 30 seconds
- Max request size: 10MB
- Max message length: 5000 characters
- Max messages array: 50 items

**Security:**
- Input sanitization
- Request size limits
- Timeout protection
- Error message sanitization (production mode)

---

## Browser Extension

### Installation

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `noCap-exten` folder

### Features

**Text Selection:**
- Select any text on a webpage
- Automatic slang detection
- Tooltip display with word meanings

**Page Analysis:**
- Analyze entire page for slang
- Highlight detected slang words
- Batch processing

**Settings:**
- Auto-highlight toggle
- Tooltip display toggle
- Settings persist across sessions

### Permissions

- `activeTab` - Access current tab content
- `scripting` - Inject content scripts
- `storage` - Save settings
- `http://localhost:3000/*` - Backend API access

### Content Script Behavior

- Runs on all URLs (`<all_urls>`)
- Runs at `document_idle` (after page load)
- Single frame only (not iframes)
- No CSS injection (styles applied inline)

---

## Setup & Installation

### Prerequisites

- Node.js 16+ installed
- LM Studio installed and configured
- Chrome/Edge browser (for extension)

### Backend Setup

```bash
cd backend
npm install
node server.js
```

**Backend runs on:** `http://localhost:3000`

### LM Studio Setup

1. Open LM Studio
2. Download/load model: `mistralai/mistral-7b-instruct-v0.3`
3. Start local server on port `1234`
4. Verify server is running

### Frontend Setup

```bash
cd frontend
# Serve with any static server, e.g.:
python3 -m http.server 8000
# or
npx serve -p 8000
# or
php -S localhost:8000
```

**Frontend runs on:** `http://localhost:8000`

### Extension Setup

1. Load extension in browser (see Browser Extension section)
2. Verify backend is running
3. Check extension popup for connection status

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGIN` - CORS origin (production only)

**LM Studio:**
- Default: `http://127.0.0.1:1234`
- Can be configured in `backend/server.js`

---

## Development Guide

### Code Style

**JavaScript:**
- ES6+ syntax
- Async/await for promises
- Descriptive variable names
- Comments for complex logic
- Error handling in all async operations

**CSS:**
- BEM-like naming (where applicable)
- CSS Variables for theming
- Mobile-first responsive design
- Animations with `cubic-bezier` easing

**File Organization:**
- Logical grouping of code
- Separation of concerns
- Utility functions at top/bottom
- Main logic in center

### Security Best Practices

**Input Validation:**
- All user input sanitized
- Length limits enforced
- Type checking
- Special character handling

**XSS Prevention:**
- HTML escaping (`escapeHtml()`)
- No `innerHTML` with user data
- `textContent` for safe text insertion
- DOM creation via `createElement()`

**API Security:**
- Request size limits
- Timeout protection
- Error message sanitization
- CORS configuration
- Security headers

### Adding New Features

1. **Frontend Feature:**
   - Add HTML structure
   - Style with CSS variables
   - Add JavaScript logic
   - Test with light/dark themes
   - Test mobile responsiveness

2. **Backend Feature:**
   - Add route handler
   - Validate input
   - Add error handling
   - Update documentation
   - Test with various inputs

3. **Extension Feature:**
   - Update manifest if needed
   - Add content script logic
   - Update popup if needed
   - Test on various websites
   - Ensure no page interference

### Testing Checklist

- [ ] Test with various slang words
- [ ] Test with long messages
- [ ] Test theme switching
- [ ] Test mobile/tablet layouts
- [ ] Test extension on different sites
- [ ] Test error scenarios
- [ ] Test backend with LM Studio offline
- [ ] Verify security measures
- [ ] Check browser console for errors

---

## Security Features

### Frontend Security

**Input Sanitization:**
```javascript
- Control character removal
- HTML entity escaping
- Length validation (max 2000 chars)
- Type checking
```

**XSS Prevention:**
```javascript
- escapeHtml() function
- textContent usage (not innerHTML)
- DOM element creation
- Safe JSON parsing
```

**Data Validation:**
```javascript
- Slang object structure validation
- Theme value validation
- DOM element existence checks
- Safe localStorage access
```

### Backend Security

**Input Validation:**
```javascript
- Message array validation
- String sanitization
- Length limits (5000 chars)
- Type checking
- Role validation (user/assistant/system)
```

**Request Protection:**
```javascript
- Request size limit (10MB)
- Request timeout (30s)
- CORS configuration
- Security headers
- Error sanitization (production)
```

**API Security:**
```javascript
- Rate limiting considerations
- AbortController for timeouts
- Safe JSON parsing
- Response validation
- Error handling
```

### Extension Security

**Content Script Safety:**
```javascript
- No CSS injection into pages
- Input field detection
- Event handler safety
- Memory management
- Error boundary handling
```

**API Communication:**
```javascript
- Request timeouts
- Error handling
- Failure tracking
- Cache management
- No sensitive data storage
```

---

## Troubleshooting

### Common Issues

**503 Service Unavailable:**
- Check LM Studio is running
- Verify model is loaded
- Check port 1234 is accessible
- Verify backend can connect to LM Studio

**Extension Not Working:**
- Reload extension in chrome://extensions
- Check backend is running
- Verify host_permissions in manifest
- Check browser console for errors

**Theme Not Persisting:**
- Check localStorage is enabled
- Verify theme value is valid
- Check for localStorage errors

**Tooltips Not Showing:**
- Check "Show tooltips" setting
- Verify backend is connected
- Check text selection is not in input field
- Verify API returned valid data

**Page Layout Issues:**
- Verify CSS not injected into pages (extension)
- Check for conflicting styles
- Reload page after extension update

---

## Project Structure

```
projects/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── chatMemory.js
├── noCap-exten/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── style.css
├── README.md
└── DOCUMENTATION.md (this file)
```

---

## Contributing

### Development Workflow

1. Make changes to appropriate component
2. Test thoroughly (see Testing Checklist)
3. Verify security measures
4. Update documentation if needed
5. Test across browsers/devices

### Code Review Checklist

- [ ] Input validation present
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Responsive design tested
- [ ] Theme compatibility verified
- [ ] No console errors
- [ ] Performance optimized
- [ ] Documentation updated

---

## License & Credits

**Project:** noCap. - Slang Translator  
**Version:** 3.0.0  
**Last Updated:** December 2024

**Technologies Used:**
- LM Studio - Local LLM Server
- Mistral-7B - Language Model
- Express.js - Backend Framework
- Chrome Extension API - Browser Extension

---

## Support & Contact

For issues, questions, or contributions, please refer to the project repository or create an issue in the issue tracker.

---

*End of Documentation*

