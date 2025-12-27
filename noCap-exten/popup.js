// ===============================
// POPUP SCRIPT - Modern & Optimized
// ===============================

const API_URL = 'http://localhost:3000/chat';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkBackendStatus();
  setupEventListeners();
  loadRecentResults();
});

// ===============================
// SETTINGS MANAGEMENT
// ===============================
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['autoHighlight', 'showTooltips', 'highlightEnabled']);
    document.getElementById('autoHighlight').checked = result.autoHighlight !== false;
    document.getElementById('showTooltips').checked = result.showTooltips !== false;
    updateToggleButtonText(result.highlightEnabled === true);
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

function saveSetting(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

// ===============================
// BACKEND STATUS CHECK
// ===============================
async function checkBackendStatus() {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = statusIndicator.querySelector('.status-text');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:3000/', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      statusDot.classList.add('connected');
      statusText.textContent = 'Connected';
      statusIndicator.classList.add('success');
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Offline';
    statusIndicator.classList.remove('success');
    statusIndicator.classList.add('error');
  }
}

// ===============================
// EVENT LISTENERS
// ===============================
function setupEventListeners() {
  // Analyze page button
  document.getElementById('analyzePageBtn').addEventListener('click', handleAnalyzePage);
  
  // Toggle highlight button
  document.getElementById('toggleHighlightBtn').addEventListener('click', handleToggleHighlight);
  
  // Settings toggles
  document.getElementById('autoHighlight').addEventListener('change', (e) => {
    saveSetting('autoHighlight', e.target.checked);
    sendMessageToContent({ type: 'UPDATE_SETTINGS', autoHighlight: e.target.checked });
  });
  
  document.getElementById('showTooltips').addEventListener('change', (e) => {
    saveSetting('showTooltips', e.target.checked);
    sendMessageToContent({ type: 'UPDATE_SETTINGS', showTooltips: e.target.checked });
  });
}

async function handleAnalyzePage() {
  const btn = document.getElementById('analyzePageBtn');
  const originalText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span>Analyzing...</span>';
  
  try {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to get selected text or analyze page
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' });
    
    if (response && response.success) {
      showSuccessMessage('Page analyzed! Check the highlights.');
    } else {
      showErrorMessage('No slang words found or analysis failed.');
    }
  } catch (error) {
    console.error('Error analyzing page:', error);
    showErrorMessage('Could not analyze page. Make sure backend is running.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function handleToggleHighlight() {
  try {
    const result = await chrome.storage.sync.get(['highlightEnabled']);
    const newState = !result.highlightEnabled;
    
    await chrome.storage.sync.set({ highlightEnabled: newState });
    updateToggleButtonText(newState);
    
    // Notify content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { 
      type: 'TOGGLE_HIGHLIGHT', 
      enabled: newState 
    }).catch(() => {
      // Content script might not be loaded
    });
  } catch (error) {
    console.error('Error toggling highlight:', error);
  }
}

function updateToggleButtonText(enabled) {
  const textEl = document.getElementById('toggleHighlightText');
  textEl.textContent = enabled ? 'Disable Highlights' : 'Enable Highlights';
}

// ===============================
// MESSAGE PASSING
// ===============================
function sendMessageToContent(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
        // Content script might not be loaded
      });
    }
  });
}

// ===============================
// RECENT RESULTS
// ===============================
function loadRecentResults() {
  chrome.storage.local.get(['recentResults'], (result) => {
    const results = result.recentResults || [];
    if (results.length > 0) {
      displayRecentResults(results.slice(0, 5));
    }
  });
}

function displayRecentResults(results) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsList = document.getElementById('resultsList');
  
  resultsSection.style.display = 'block';
  resultsList.innerHTML = results.map(item => `
    <div class="result-item">
      <div class="result-word">${escapeHtml(item.word)}</div>
      <div class="result-meaning">${escapeHtml(item.meaning)}</div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===============================
// NOTIFICATIONS
// ===============================
function showSuccessMessage(message) {
  showNotification(message, 'success');
}

function showErrorMessage(message) {
  showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
  // Simple notification implementation
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    z-index: 10000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  }
`;
document.head.appendChild(style);
