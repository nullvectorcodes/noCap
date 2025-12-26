// ===============================
// CONTENT SCRIPT - Optimized & Performant
// ===============================

const API_URL = 'http://localhost:3000/chat';

// State management
let state = {
  highlightEnabled: true,
  autoHighlight: true,
  showTooltips: true,
  tooltip: null,
  highlightOverlay: null,
  isProcessing: false,
  debounceTimer: null,
  consecutiveFailures: 0,
  lastErrorTime: null,
  apiUnavailable: false
};

// Dictionary cache
const wordCache = new Map();

// ===============================
// INITIALIZATION
// ===============================
(function init() {
  loadSettings();
  setupMessageListener();
  if (state.autoHighlight) {
    observePage();
  }
})();

// ===============================
// SETTINGS MANAGEMENT
// ===============================
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['highlightEnabled', 'autoHighlight', 'showTooltips']);
    state.highlightEnabled = result.highlightEnabled !== false;
    state.autoHighlight = result.autoHighlight !== false;
    state.showTooltips = result.showTooltips !== false;
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_HIGHLIGHT') {
      state.highlightEnabled = message.enabled;
      if (!message.enabled) {
        clearAllHighlights();
      }
      sendResponse({ success: true });
    } else if (message.type === 'UPDATE_SETTINGS') {
      if (message.autoHighlight !== undefined) {
        state.autoHighlight = message.autoHighlight;
      }
      if (message.showTooltips !== undefined) {
        state.showTooltips = message.showTooltips;
      }
      sendResponse({ success: true });
    } else if (message.type === 'ANALYZE_PAGE') {
      analyzePage().then(result => sendResponse(result)).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true; // Async response
    }
    return true;
  });
}

// ===============================
// SELECTION HANDLER (OPTIMIZED)
// ===============================
let lastSelectionTime = 0;
const SELECTION_DEBOUNCE = 100;

// Only handle mouseup for text selection, not in input fields
document.addEventListener('mouseup', (e) => {
  // Skip if clicking on input, textarea, or contenteditable elements
  const target = e.target;
  if (target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable ||
      target.closest('input, textarea, [contenteditable]')) {
    return;
  }
  handleSelection(e);
}, true);

document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') clearTooltip();
}, true);

function handleSelection(e) {
  if (!state.highlightEnabled || state.isProcessing) return;
  
  // Don't process if user is interacting with form elements
  const target = e?.target;
  if (target && (
    target.tagName === 'INPUT' || 
    target.tagName === 'TEXTAREA' || 
    target.tagName === 'SELECT' ||
    target.isContentEditable ||
    target.closest('input, textarea, select, [contenteditable]')
  )) {
    return;
  }
  
  const now = Date.now();
  if (now - lastSelectionTime < SELECTION_DEBOUNCE) return;
  lastSelectionTime = now;

  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => {
    processSelection();
  }, 150);
}

function processSelection() {
  // Check if user is currently typing in an input field
  const activeElement = document.activeElement;
  if (activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.isContentEditable
  )) {
    return; // Don't interfere with typing
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    clearTooltip();
    return;
  }

  // Check if selection is within an input field
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const containerElement = container.nodeType === Node.TEXT_NODE 
    ? container.parentElement 
    : container;
  
  if (containerElement && (
    containerElement.tagName === 'INPUT' ||
    containerElement.tagName === 'TEXTAREA' ||
    containerElement.isContentEditable ||
    containerElement.closest('input, textarea, [contenteditable]')
  )) {
    return; // Don't process selections within input fields
  }

  const selectedText = selection.toString().trim();
  if (!selectedText || selectedText.length > 500) {
    clearTooltip();
    selection.removeAllRanges();
    return;
  }

  // Store the bounding rect before clearing selection
  const rect = range.getBoundingClientRect();

  // Check cache first
  const cacheKey = selectedText.toLowerCase();
  if (wordCache.has(cacheKey)) {
    const cached = wordCache.get(cacheKey);
    selection.removeAllRanges();
    showTooltipWithRect(cached, rect);
    return;
  }

  // Analyze text
  analyzeText(selectedText).then(result => {
    if (result && result.slangs && result.slangs.length > 0) {
      wordCache.set(cacheKey, result);
      showTooltipWithRect(result, rect);
    } else {
      // Only show error tooltip if API is unavailable
      if (state.apiUnavailable) {
        showErrorTooltip(rect);
      } else {
        clearTooltip();
      }
    }
  }).catch(err => {
    console.error('Analysis error:', err);
    if (state.apiUnavailable) {
      showErrorTooltip(rect);
    } else {
      clearTooltip();
    }
  });

  selection.removeAllRanges();
}

// ===============================
// API INTEGRATION
// ===============================
async function analyzeText(text) {
  if (state.isProcessing) return null;
  
  // Prevent API spam if we're in unavailable state
  if (state.apiUnavailable) {
    const timeSinceLastError = Date.now() - (state.lastErrorTime || 0);
    // Wait 30 seconds before retrying after failures
    if (timeSinceLastError < 30000) {
      return null;
    }
    // Reset after 30 seconds
    state.apiUnavailable = false;
    state.consecutiveFailures = 0;
  }
  
  state.isProcessing = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `You are noCap, an intent-aware slang analyzer. Identify ALL slang words, abbreviations, or informal terms in this message. Return JSON format: {"highlighted_message":"", "slangs":[{"word":"","pronunciation":"","meaning":"","example":""}]}\n\nMessage: ${text}`
        }],
        temperature: 0.1
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 503 || response.status === 502) {
        state.consecutiveFailures++;
        state.lastErrorTime = Date.now();
        
        // Mark as unavailable after 3 consecutive failures
        if (state.consecutiveFailures >= 3) {
          state.apiUnavailable = true;
          console.warn('noCap: Backend service unavailable. Please ensure backend server and LM Studio are running.');
        }
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Reset failure counter on success
    state.consecutiveFailures = 0;
    state.apiUnavailable = false;
    state.lastErrorTime = null;

    const data = await response.json();
    if (!data.reply) return null;

    const parsed = parseJsonSafely(data.reply);
    return parsed;

  } catch (error) {
    // Only log if it's not a timeout or abort (those are expected)
    if (error.name !== 'AbortError' && !state.apiUnavailable) {
      console.error('noCap API error:', error.message);
    }
    return null;
  } finally {
    state.isProcessing = false;
  }
}

function parseJsonSafely(str) {
  try {
    return JSON.parse(str);
  } catch {
    const match = str.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}

async function analyzePage() {
  const textContent = document.body.innerText || document.body.textContent || '';
  const chunks = textContent.split(/\s+/).slice(0, 1000).join(' ');
  
  const result = await analyzeText(chunks);
  if (result && result.slangs) {
    highlightSlangWords(result.slangs);
    return { success: true, count: result.slangs.length };
  }
  return { success: false };
}

// ===============================
// TOOLTIP (OPTIMIZED)
// ===============================
function showTooltipWithRect(data, rect) {
  if (!state.showTooltips || !data.slangs || data.slangs.length === 0) {
    return;
  }

  clearTooltip();

  // Handle case where rect has no dimensions
  if (!rect || (!rect.width && !rect.height)) {
    return;
  }

  // If width or height is 0, use minimum dimensions
  if (!rect.width) rect.width = 1;
  if (!rect.height) rect.height = 1;

  const firstSlang = data.slangs[0];
  const tooltip = createTooltipElement(firstSlang, rect);
  
  document.body.appendChild(tooltip);
  state.tooltip = tooltip;

  // Animate in
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, -100%) scale(1)';
  });

  // Auto-hide after 5 seconds
  setTimeout(clearTooltip, 5000);
}

function createTooltipElement(slang, rect) {
  const tooltip = document.createElement('div');
  tooltip.className = 'nocap-tooltip';
  
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;
  
  const left = rect.left + rect.width / 2 + scrollX;
  const top = rect.top + scrollY;
  
  tooltip.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    transform: translate(-50%, -100%) scale(0.95);
    opacity: 0;
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    color: #fff;
    padding: 14px 16px;
    border-radius: 12px;
    min-width: 220px;
    max-width: 300px;
    font-size: 13px;
    line-height: 1.5;
    z-index: 999999;
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
  `;
  
  const word = escapeHtml(slang.word || '');
  const meaning = escapeHtml(slang.meaning || '');
  const example = slang.example ? escapeHtml(slang.example) : null;
  
  tooltip.innerHTML = `
    <div style="color: #c4b5fd; font-weight: 600; font-size: 15px; margin-bottom: 6px;">${word}</div>
    <div style="color: #fff; opacity: 0.95; margin-bottom: ${example ? '8px' : '0'}; line-height: 1.5;">${meaning}</div>
    ${example ? `<div style="color: #a78bfa; opacity: 0.8; font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-style: italic;">"${example}"</div>` : ''}
  `;
  
  return tooltip;
}

function clearTooltip() {
  if (state.tooltip) {
    state.tooltip.style.opacity = '0';
    state.tooltip.style.transform = 'translate(-50%, -100%) scale(0.95)';
    setTimeout(() => {
      state.tooltip?.remove();
      state.tooltip = null;
    }, 200);
  }
}

function showErrorTooltip(rect) {
  clearTooltip();
  
  const tooltip = document.createElement('div');
  tooltip.className = 'nocap-tooltip nocap-error';
  
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;
  
  const left = rect.left + rect.width / 2 + scrollX;
  const top = rect.top + scrollY;
  
  tooltip.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    transform: translate(-50%, -100%) scale(0.95);
    opacity: 0;
    background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
    color: #fff;
    padding: 12px 16px;
    border-radius: 12px;
    min-width: 220px;
    max-width: 280px;
    font-size: 13px;
    line-height: 1.5;
    z-index: 999999;
    box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);
    backdrop-filter: blur(12px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
  `;
  
  tooltip.innerHTML = `
    <div style="color: #fca5a5; font-weight: 600; font-size: 14px; margin-bottom: 6px;">⚠️ Service Unavailable</div>
    <div style="color: #fff; opacity: 0.9; font-size: 12px; line-height: 1.4;">
      Backend server or LM Studio may not be running. Please check your setup.
    </div>
  `;
  
  document.body.appendChild(tooltip);
  state.tooltip = tooltip;

  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, -100%) scale(1)';
  });

  setTimeout(clearTooltip, 4000);
}

// ===============================
// HIGHLIGHTING
// ===============================
function highlightSlangWords(slangs) {
  // Implementation for auto-highlighting words on page
  // This can be expanded based on requirements
}

function clearAllHighlights() {
  document.querySelectorAll('.nocap-highlight').forEach(el => {
    el.classList.remove('nocap-highlight');
  });
}

// ===============================
// PAGE OBSERVATION (OPTIMIZED)
// ===============================
function observePage() {
  if (!state.autoHighlight) return;
  
  // Use MutationObserver only if needed for dynamic content
  // For now, we'll skip it to improve performance
}

// ===============================
// UTILITIES
// ===============================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// Cleanup on scroll/click outside (but not in input fields)
document.addEventListener('scroll', clearTooltip, true);
document.addEventListener('mousedown', (e) => {
  // Don't interfere with input fields
  const target = e.target;
  if (target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable ||
      target.closest('input, textarea, [contenteditable]')) {
    clearTooltip();
    return;
  }
  
  if (state.tooltip && !state.tooltip.contains(target)) {
    clearTooltip();
  }
}, true);
