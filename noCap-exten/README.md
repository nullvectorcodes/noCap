# noCap. Browser Extension

A beautiful and performant browser extension for decoding slang, abbreviations, and informal language on any webpage.

## Features

- 🎨 **Beautiful UI** - Modern design matching the noCap website
- ⚡ **High Performance** - Optimized with debouncing and efficient event handling
- 🔍 **Smart Analysis** - Select text to instantly decode slang words
- 💡 **Tooltips** - Elegant tooltips showing word meanings and examples
- ⚙️ **Customizable** - Toggle highlights and tooltips
- 🌐 **API Integration** - Connects to your local noCap backend

## Installation

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `noCap-exten` folder
5. The extension icon should appear in your toolbar

## Setup

1. Make sure your noCap backend is running on `http://localhost:3000`
2. Click the extension icon to open the popup
3. The status indicator will show "Connected" when the backend is available

## Usage

### Analyzing Selected Text
1. Select any text on a webpage
2. A tooltip will appear showing slang word meanings
3. Tooltips automatically hide after 5 seconds or when you click elsewhere

### Analyzing Entire Page
1. Click the extension icon
2. Click "Analyze Page" button
3. Slang words will be highlighted on the page

### Settings
- **Auto-highlight slang**: Automatically highlight slang words on pages
- **Show tooltips**: Display tooltips when selecting text

## Icon Files

The extension requires icon files. Create the following PNG files in the `noCap-exten` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any purple-themed icon matching the noCap branding.

## Development

### File Structure
```
noCap-exten/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI structure
├── popup.js           # Popup functionality
├── content.js         # Content script (injected into web pages)
├── style.css          # Styles for popup and tooltips
└── README.md          # This file
```

### Performance Optimizations
- Debounced selection handling (150ms)
- Request caching to avoid duplicate API calls
- Efficient event listeners with proper cleanup
- Optimized DOM manipulation using requestAnimationFrame
- Auto-hide tooltips to prevent UI clutter

## Troubleshooting

**Extension not working:**
- Ensure backend is running on port 3000
- Check browser console for errors
- Reload the extension in `chrome://extensions/`

**Tooltips not showing:**
- Verify "Show tooltips" setting is enabled
- Check that you're selecting text (not just clicking)
- Ensure backend API is responding correctly

## License

Part of the noCap project.

