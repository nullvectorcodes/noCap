// frontend/chatMemory.js

const STORAGE_KEY = "noCap_conversation";
const MAX_MESSAGES = 6;
const MAX_CONTENT_LENGTH = 5000; // Limit message content length

let memory = [];

/**
 * Safe localStorage getter
 */
function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('localStorage get error:', e);
    return null;
  }
}

/**
 * Safe localStorage setter
 */
function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('localStorage set error:', e);
    // Handle quota exceeded error
    if (e.name === 'QuotaExceededError') {
      // Clear old messages and try again
      try {
        memory = memory.slice(-Math.floor(MAX_MESSAGES / 2));
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        return false;
      }
    }
    return false;
  }
}

/**
 * Validate message object
 */
function validateMessage(msg) {
  if (!msg || typeof msg !== 'object') {
    return false;
  }
  if (typeof msg.role !== 'string' || !['user', 'assistant', 'system'].includes(msg.role)) {
    return false;
  }
  if (typeof msg.content !== 'string' || msg.content.length === 0) {
    return false;
  }
  if (msg.content.length > MAX_CONTENT_LENGTH) {
    return false;
  }
  return true;
}

/**
 * Sanitize content
 */
function sanitizeContent(content) {
  if (typeof content !== 'string') {
    return '';
  }
  // Remove control characters except newlines and tabs
  return content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Safe JSON parse
 */
function safeJsonParse(str, fallback = []) {
  try {
    if (typeof str !== 'string') {
      return fallback;
    }
    const parsed = JSON.parse(str);
    if (!Array.isArray(parsed)) {
      return fallback;
    }
    // Validate all messages
    return parsed.filter(validateMessage);
  } catch (e) {
    console.warn('JSON parse error in chatMemory:', e);
    return fallback;
  }
}

// Load memory on startup (safely)
const saved = safeLocalStorageGet(STORAGE_KEY);
if (saved) {
  const parsed = safeJsonParse(saved, []);
  if (Array.isArray(parsed)) {
    memory = parsed.slice(-MAX_MESSAGES); // Limit to max messages
  }
}

// Save a message
export function remember(role, content) {
  // Validate inputs
  if (typeof role !== 'string' || !['user', 'assistant', 'system'].includes(role)) {
    console.warn('Invalid role:', role);
    return false;
  }

  if (typeof content !== 'string') {
    console.warn('Content must be a string');
    return false;
  }

  // Sanitize content
  const sanitized = sanitizeContent(content);
  if (sanitized.length === 0) {
    console.warn('Content is empty after sanitization');
    return false;
  }

  if (sanitized.length > MAX_CONTENT_LENGTH) {
    console.warn('Content exceeds maximum length');
    return false;
  }

  // Add to memory
  try {
    memory.push({ role, content: sanitized });

    // Limit memory size
    if (memory.length > MAX_MESSAGES) {
      memory = memory.slice(-MAX_MESSAGES);
    }

    // Save to localStorage
    const jsonString = JSON.stringify(memory);
    const saved = safeLocalStorageSet(STORAGE_KEY, jsonString);
    
    if (!saved) {
      console.warn('Failed to save to localStorage');
      // Remove the last item if save failed
      memory.pop();
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error in remember:', e);
    return false;
  }
}

// Get full memory
export function getMemory() {
  // Return a copy to prevent external modification
  return JSON.parse(JSON.stringify(memory));
}

// Clear memory (optional)
export function clearMemory() {
  try {
    memory = [];
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Error clearing memory:', e);
    return false;
  }
}
