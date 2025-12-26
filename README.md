# 🚀 noCap

> **Break down slang like it's nothing** — An intelligent, intent-aware slang analyzer that understands modern language, abbreviations, and informal expressions.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![AI](https://img.shields.io/badge/AI-LM%20Studio-FF6B6B?style=flat)](https://lmstudio.ai/)

---

## ✨ What is noCap?

**noCap** is a smart slang analyzer that helps you understand informal language, slang terms, and abbreviations used in everyday conversations. Whether you're trying to decode "the party was mid fr" or understand what "bet, no cap" actually means, noCap breaks it down for you with clear explanations and examples.

Perfect for:
- 🎓 Learning modern slang and abbreviations
- 💬 Understanding casual conversations
- 🌍 Decoding mixed-language expressions (English, Hinglish, etc.)
- 🔍 Analyzing informal communication

---

## 🌟 Features

### For Users
- **🎯 Multi-Word Detection** - Identifies ALL slang words in a single message (not just one!)
- **🧠 Intent-Aware Analysis** - Understands context to provide accurate meanings
- **📱 Beautiful, Responsive UI** - Works seamlessly on desktop, tablet, and mobile
- **🌙 Dark Mode** - Eye-friendly dark theme for late-night browsing
- **⚡ Real-time Analysis** - Instant breakdowns as you type
- **💾 Conversation Memory** - Remembers context for better understanding

### Technical Highlights
- **🔒 Privacy-First** - Runs locally with LM Studio, your data stays on your machine
- **🚀 Fast & Efficient** - Optimized prompts for quick responses
- **🎨 Modern Design** - Smooth animations and polished UI
- **📱 Mobile-First** - Fully responsive design for all devices
- **♿ Accessible** - Clean, readable interface with proper ARIA labels

---

## 🎬 How It Works

### For Users
1. **Type or paste** any message containing slang, abbreviations, or informal language
2. **Get instant breakdowns** - Each slang word is identified and explained
3. **See examples** - Understand how each word is used in context
4. **Continue conversations** - Analyze multiple messages in a session

### Example
```
Input: "the party was mid fr"

Output:
• mid: of average quality or not particularly impressive
  Example: "the party was mid fr"
  
• fr: for real (used to emphasize truthfulness)
  Example: "the party was mid fr"
```

### Behind the Scenes (For Developers)
1. **Frontend** captures user input and sends it to the backend
2. **Backend** processes the message through an intent-aware prompt system
3. **LM Studio** (local LLM) analyzes the message using advanced prompting techniques
4. **Response parsing** extracts slang words, meanings, and examples
5. **UI rendering** displays results in an elegant, organized format

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [LM Studio](https://lmstudio.ai/) installed and running
- A compatible language model loaded in LM Studio (recommended: Mistral 7B)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd projects
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure LM Studio
1. Open LM Studio
2. Load a compatible model (e.g., `mistral-7b-instruct-v0.3`)
3. Start the local server (usually runs on `http://localhost:1234`)

### Step 4: Start the Backend Server
```bash
cd backend
node server.js
```
The backend will run on `http://localhost:3000`

### Step 5: Open the Frontend
Simply open `frontend/index.html` in your browser, or use a local server:

```bash
# Using Python 3
cd frontend
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server frontend -p 8000
```

Then visit `http://localhost:8000` in your browser.

---

## 💻 Tech Stack

### Frontend
- **Vanilla JavaScript (ES6+)** - Modern, framework-free JavaScript
- **CSS3** - Advanced animations, gradients, and responsive design
- **HTML5** - Semantic, accessible markup
- **Local Storage API** - Conversation memory management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **node-fetch** - HTTP client for API requests

### AI/ML
- **LM Studio** - Local LLM hosting
- **Mistral 7B Instruct** - Language model (recommended)
- **Custom Prompting** - Intent-aware, multi-word detection prompts

### Design & UX
- **Custom CSS Animations** - Smooth transitions and effects
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Full theme system
- **Accessibility** - ARIA labels, keyboard navigation

---

## 📁 Project Structure

```
projects/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # All styling (responsive, animations, themes)
│   ├── app.js              # Main application logic
│   ├── chatMemory.js       # Conversation memory management
│   └── chatRenderer.js     # (Future: rendering utilities)
│
├── backend/
│   ├── server.js           # Express server & API endpoints
│   ├── routes/
│   │   └── chat.js         # Chat route handlers
│   ├── services/
│   │   └── aiService.js    # AI service integrations
│   └── package.json        # Dependencies
│
├── noCap-exten/            # Browser extension (optional)
│   ├── manifest.json
│   ├── content.js
│   └── popup.js
│
└── README.md               # This file
```

---

## 🎨 Key Features Explained

### Intent-Aware Analysis
noCap doesn't just look for slang words—it understands the **intent** and **context** of your message. This means:
- ✅ Accurate detection in casual conversations
- ✅ Fewer false positives
- ✅ Better understanding of mixed-language content

### Multi-Word Detection
Unlike basic analyzers, noCap identifies **every** slang word in your message:
- ✅ "mid fr" → Detects both "mid" AND "fr"
- ✅ "bet no cap" → Finds all slang terms
- ✅ Multiple abbreviations in one message

### Privacy-First
Everything runs **locally** on your machine:
- ✅ No data sent to external servers
- ✅ Conversations stay private
- ✅ Works offline (after initial setup)

---

## 🚀 Usage Examples

### Basic Usage
1. Open the application in your browser
2. Type a message like: `"that movie was fire fr"`
3. Get instant breakdowns:
   - **fire**: excellent or impressive
   - **fr**: for real (emphasizing truth)

### Advanced Usage
- **Multiple queries**: Continue the conversation to analyze different messages
- **Copy-paste**: Paste entire messages or conversations
- **Mixed languages**: Works with English, Hinglish, and informal mixes

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

---

## 📝 License

This project is open source. Feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- Built with [LM Studio](https://lmstudio.ai/) for local LLM hosting
- Uses [Mistral AI](https://mistral.ai/) models
- Inspired by the need to understand modern, evolving language

---

## 📞 Support

Having issues? Check that:
1. ✅ LM Studio is running with a loaded model
2. ✅ Backend server is running on port 3000
3. ✅ Browser console for any error messages

---

<div align="center">

**Made with ❤️ for understanding modern language**

[⭐ Star this repo](https://github.com) · [🐛 Report Bug](https://github.com) · [💡 Request Feature](https://github.com)

</div>
