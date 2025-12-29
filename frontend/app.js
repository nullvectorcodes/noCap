import { remember } from "./chatMemory.js";

// ===============================
// SECURITY & SAFETY UTILITIES
// ===============================

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize user input for security (XSS prevention only)
 * DO NOT remove slang, Hinglish, emojis, or language patterns
 * Only remove security risks: HTML tags and script injection
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Only remove dangerous control characters (null bytes, etc.)
  // Keep newlines, tabs, emojis, and all text content
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove potential script tags and HTML injection (security only)
  // But preserve the text content inside
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // DO NOT trim here - preserve original spacing
  // Only trim if truly empty after security cleanup
  return sanitized;
}

/**
 * Validate input length
 */
function validateInputLength(input, maxLength = 2000) {
  return input.length > 0 && input.length <= maxLength;
}

/**
 * Safe DOM element getter with validation
 */
function getElementSafely(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found`);
  }
  return element;
}

/**
 * Safe text content setter
 */
function setTextContent(element, text) {
  if (!element || !(element instanceof Node)) {
    return false;
  }
  element.textContent = typeof text === 'string' ? text : String(text);
  return true;
}

/**
 * Validate theme value
 */
function validateTheme(theme) {
  if (typeof theme !== 'string') {
    return 'light';
  }
  return theme === 'light' || theme === 'dark' ? theme : 'light';
}

/**
 * Safe JSON parse with validation
 */
function safeJsonParse(jsonString, fallback = null) {
  try {
    if (typeof jsonString !== 'string') {
      return fallback;
    }
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (e) {
    console.error('JSON parse error:', e);
    return fallback;
  }
}

/**
 * Validate slang object structure
 */
function validateSlangObject(slang) {
  if (!slang || typeof slang !== 'object') {
    return false;
  }
  if (typeof slang.word !== 'string' || slang.word.length === 0) {
    return false;
  }
  if (typeof slang.meaning !== 'string' || slang.meaning.length === 0) {
    return false;
  }
  if (slang.example && typeof slang.example !== 'string') {
    return false;
  }
  return true;
}

// Constants
const MAX_INPUT_LENGTH = 2000;
const MAX_SLANG_WORDS = 20; // Limit to prevent abuse

// Predefined slang list - explicit matches only
// Set automatically removes duplicates
const SLANG_LIST = new Set([
  // Single word slang
  'mid', 'fr', 'cap', 'nocap', 'lowkey', 'highkey', 'bet', 'facts', 'deadass', 'sus',
  'bussin', 'bussin\'', 'slaps', 'vibe', 'vibes', 'vibing', 'vibin', 'slay', 'slayed',
  'slaying', 'periodt', 'period', 'tea', 'spill', 'spilling', 'shook', 'stan',
  'stanning', 'stanned', 'simp', 'simping', 'simped', 'ghost', 'ghosting', 'ghosted',
  'flex', 'flexing', 'flexed', 'clout', 'salty', 'extra', 'snatched', 'snatch',
  'snatching', 'goat', 'goated', 'fire', 'fuego', 'lit', 'frfr', 'ong', 'ongod',
  'tbh', 'tb', 'ngl', 'yolo', 'fomo', 'jomo', 'smh', 'imo', 'imho', 'irl', 'dm',
  'pm', 'lol', 'lmao', 'lmfao', 'rofl', 'wtf', 'omg', 'omfg', 'ttyl', 'brb', 'gtg',
  'wyd', 'hmu', 'fyi', 'asap', 'rn', 'idk', 'idek', 'ikr', 'ik', 'yeet', 'yeeted',
  'yeeting', 'drip', 'dripping', 'dripped', 'bop', 'bops', 'banger', 'bangers',
  'cringe', 'cringy', 'cringey', 'based', 'woke', 'cancel', 'cancelled', 'canceling',
  'ship', 'shipping', 'shipped', 'otp', 'canon', 'headcanon', 'fanon', 'thirsty',
  'thirst', 'thirsting', 'thirsted', 'breadcrumb', 'breadcrumbing', 'breadcrumbed',
  'zodiac', 'mood', 'same', 'wig', 'savage', 'savagery', 'roast', 'roasting',
  'roasted', 'burn', 'burning', 'burned', 'burnt', 'drag', 'dragging', 'dragged',
  'salt', 'salting', 'salted',
  // Multi-word slang (checked first)
  'no cap', 'low key', 'high key', 'fr fr', 'dead ass', 'on god', 'ngl fr',
  'and that\'s on period', 'and that\'s on periodt', 'spill the tea', 'spill tea',
  'throwing shade', 'threw shade', 'read for filth', 'read to filth',
  'wig snatched', 'wig flew', 'wig flew off', 'the goat', 'goat status',
  'being extra', 'clap back', 'clapback', 'clapping back', 'clapped back',
  'dragged for filth', 'clout chasing', 'zodiac sign', 'same energy',
  'same vibes', 'vibe check'
]);

/**
 * ARCHITECTURAL PRINCIPLE: CENTRALIZED INPUT NORMALIZATION
 * =======================================================
 * This function normalizes user input for semantic processing (slang detection, etc.)
 * 
 * CRITICAL RULES:
 * 1. This is ONLY for semantic processing, NOT for UI display
 * 2. Original input must be preserved separately for UI
 * 3. Normalization removes trailing punctuation only (not internal)
 * 4. Preserves: emojis, Hinglish, internal punctuation, expressive characters
 * 
 * WHY THIS EXISTS:
 * - Prevents "fr???" from breaking slang detection
 * - Ensures "fr", "fr?", "fr???" all resolve to "fr" for processing
 * - Allows semantic logic to work on clean text while UI shows original
 * 
 * EXAMPLES:
 * Input: "fr???" → Normalized: "fr"
 * Input: "wassup bro!!!" → Normalized: "wassup bro"
 * Input: "kya???" → Normalized: "kya"
 * Input: "😂😂😂" → Normalized: "😂😂😂" (preserved)
 */
function normalizeInput(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Step 1: Lowercase (for consistent matching)
  let normalized = text.toLowerCase();
  
  // Step 2: Normalize whitespace (multiple spaces → single space)
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Step 3: Remove trailing punctuation only (preserve internal punctuation)
  // This handles: fr???, fr?!?, wassup bro!!!, etc.
  normalized = normalized.replace(/[?!.,;:]+$/g, '');
  
  // Step 4: Trim leading/trailing spaces
  normalized = normalized.trim();
  
  return normalized;
}

/**
 * Tokenize normalized input text for word-by-word processing
 * This is used AFTER normalization, so input is already clean
 */
function tokenizeInput(text) {
  if (typeof text !== 'string') {
    return [];
  }
  // Split by whitespace (punctuation already removed by normalizeInput)
  return text
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * ARCHITECTURAL PRINCIPLE: SEMANTIC PROCESSING ON NORMALIZED INPUT
 * ================================================================
 * This function detects slang words from user input.
 * 
 * CRITICAL RULE: This function MUST receive normalized input.
 * Raw user input (with punctuation, mixed case) should NEVER be passed here.
 * 
 * WHY: Prevents "fr???" from breaking detection, ensures consistent matching
 * 
 * USAGE:
 * ❌ WRONG: detectSlangWords(userInput)
 * ✅ CORRECT: const normalized = normalizeInput(userInput);
 *            detectSlangWords(normalized);
 * 
 * Returns array of detected slang terms in order of appearance
 */
function detectSlangWords(normalizedInput) {
  // Input should already be normalized before calling this function
  // But we validate and normalize again as a safety measure
  if (typeof normalizedInput !== 'string' || normalizedInput.trim().length === 0) {
    return [];
  }

  // Ensure input is normalized (defensive check)
  const normalized = normalizeInput(normalizedInput);
  if (normalized.length === 0) {
    return [];
  }
  
  const tokens = tokenizeInput(normalized);
  const detectedSlang = [];
  const seenSlang = new Set();

  // Check for multi-word slang first (longer phrases)
  // Sort by length (longest first) to avoid partial matches
  const multiWordSlang = Array.from(SLANG_LIST)
    .filter(slang => slang.includes(' '))
    .sort((a, b) => b.length - a.length);
  
  for (const slang of multiWordSlang) {
    if (normalized.includes(slang) && !seenSlang.has(slang)) {
      detectedSlang.push(slang);
      seenSlang.add(slang);
      // Mark all words in this multi-word slang as seen to prevent single-word matches
      slang.split(/\s+/).forEach(word => seenSlang.add(word.toLowerCase()));
    }
  }

  // Check single-word slang (only if not part of multi-word slang)
  for (const token of tokens) {
    const normalizedToken = token.trim();
    if (normalizedToken.length > 0 && 
        SLANG_LIST.has(normalizedToken) && 
        !seenSlang.has(normalizedToken)) {
      detectedSlang.push(normalizedToken);
      seenSlang.add(normalizedToken);
    }
  }

  // Remove duplicates while preserving order
  return Array.from(new Set(detectedSlang));
}

// Hide preloader when page loads
window.addEventListener("load", () => {
  const preloader = getElementSafely("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 300);
  }
});

document.addEventListener("DOMContentLoaded", () => {

  let chatStarted = false;

  const input = getElementSafely("chatInput");
  const inputSecondary = getElementSafely("chatInputSecondary");
  const button = getElementSafely("actionBtn");
  const buttonSecondary = getElementSafely("actionBtnSecondary");
  const toggleBtn = getElementSafely("themeToggle");
  const root = document.documentElement;
  const responseArea = getElementSafely("responseArea");
  
  // Validate critical elements
  if (!input || !button || !responseArea) {
    console.error('Critical DOM elements not found');
    return;
  }
  
  // Use the active input (primary initially, secondary after chat starts)
  let activeInput = input;
  let activeButton = button;

  /* ===============================
     THEME
     =============================== */
  try {
    const savedTheme = localStorage.getItem("theme");
    const validatedTheme = validateTheme(savedTheme);
    if (validatedTheme) {
      root.setAttribute("data-theme", validatedTheme);
    }
  } catch (e) {
    console.warn('Theme loading error:', e);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      try {
        const currentTheme = root.getAttribute("data-theme") || "light";
        const next = currentTheme === "dark" ? "light" : "dark";
        const validatedNext = validateTheme(next);
        root.setAttribute("data-theme", validatedNext);
        localStorage.setItem("theme", validatedNext);
      } catch (e) {
        console.error('Theme toggle error:', e);
      }
    });
  }

  /* ===============================
     AUTO RESIZE
     =============================== */
  function autoResize(el) {
    if (!el || !(el instanceof HTMLElement)) {
      return;
    }
    try {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    } catch (e) {
      console.warn('Auto resize error:', e);
    }
  }

  function handleInputChange(el, btn) {
    if (!el || !btn) {
      return;
    }
    try {
      autoResize(el);
      const hasValue = el.value && el.value.trim().length > 0;
      if (hasValue) {
        btn.classList.remove("inactive");
        setTextContent(btn, "→");
      } else {
        btn.classList.add("inactive");
        setTextContent(btn, "→");
      }
    } catch (e) {
      console.warn('Input change handler error:', e);
    }
  }

  if (input && button) {
    input.addEventListener("input", () => handleInputChange(input, button));
  }
  if (inputSecondary && buttonSecondary) {
    inputSecondary.addEventListener("input", () => handleInputChange(inputSecondary, buttonSecondary));
  }

  /* ===============================
     ERROR MESSAGE HANDLER
     =============================== */
  function getErrorMessage(errorType) {
    // Validate error type
    if (typeof errorType !== 'string') {
      errorType = 'UNKNOWN_ERROR';
    }
    
    const errorMessages = {
      "NETWORK_ERROR": {
        title: "Connection Failed",
        description: "Couldn't connect to the server. The backend may be starting up (Render free tier can take 30-60 seconds to wake).",
        solution: "Please wait a moment and try again. The backend is hosted on Render and may need a moment to wake up."
      },
      "SERVER_ERROR": {
        title: "Waking up AI…",
        description: "Please try again in a few seconds.",
        solution: "The backend server is starting up. This usually takes 30-60 seconds on Render's free tier."
      },
      "ENDPOINT_NOT_FOUND": {
        title: "Service Not Available",
        description: "The API endpoint couldn't be found.",
        solution: "Ensure the backend server is running: `cd backend && node server.js`"
      },
      "REQUEST_ERROR": {
        title: "Request Failed",
        description: "Something went wrong with your request.",
        solution: "Please try again, or check that all services are running properly."
      },
      "INVALID_RESPONSE": {
        title: "Invalid Response",
        description: "The server returned an unexpected response format.",
        solution: "Check the browser console for details, and ensure LM Studio is configured correctly."
      },
      "EMPTY_RESPONSE": {
        title: "Empty Response",
        description: "The AI didn't return any content to analyze.",
        solution: "Make sure LM Studio has a model loaded and try again. You may need to reload the model."
      },
      "INVALID_FORMAT": {
        title: "Response Format Error",
        description: "The AI response wasn't in the expected format.",
        solution: "Try rephrasing your message or check if the LM Studio model supports structured outputs."
      },
      "PARSE_ERROR": {
        title: "Parse Error",
        description: "Couldn't parse the AI's response correctly.",
        solution: "The response may contain invalid JSON. Try asking a simpler question or check the model configuration."
      },
      "INVALID_STRUCTURE": {
        title: "Invalid Data Structure",
        description: "The response structure doesn't match what we expected.",
        solution: "This might be a model compatibility issue. Try using a different model or updating the prompt configuration."
      },
      "INPUT_TOO_LONG": {
        title: "Input Too Long",
        description: `Your message exceeds the maximum length of ${MAX_INPUT_LENGTH} characters.`,
        solution: "Please shorten your message and try again."
      },
      "INVALID_INPUT": {
        title: "Invalid Input",
        description: "The input contains invalid characters or is empty.",
        solution: "Please enter a valid message."
      }
    };

    // Return specific error or default (all values are safe, no user input)
    return errorMessages[errorType] || {
      title: "Something Went Wrong",
      description: "An unexpected error occurred.",
      solution: "Please try again, or refresh the page if the problem persists."
    };
  }

  /* ===============================
     SEND MESSAGE
     =============================== */

  /**
   * Render user message immediately (decoupled from AI processing)
   * This ensures user messages ALWAYS appear, even if AI fails
   * 
   * KEY FIX: User messages render BEFORE any validation or AI calls
   * This supports: Hinglish, slang, emojis, lowercase, informal language
   */
  function renderUserMessage(messageText) {
    if (!responseArea || !messageText) {
      return null;
    }
    
    try {
      const userMessageDiv = document.createElement('div');
      userMessageDiv.className = 'message user';
      userMessageDiv.textContent = messageText; // Use textContent for safety
      responseArea.appendChild(userMessageDiv);
      
      // Auto-scroll to user message
      setTimeout(() => {
        userMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      
      return userMessageDiv;
    } catch (e) {
      console.error('Error rendering user message:', e);
      // Even if rendering fails, try to show something
      try {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'message user';
        fallbackDiv.textContent = String(messageText).substring(0, 100);
        responseArea.appendChild(fallbackDiv);
        return fallbackDiv;
      } catch (fallbackError) {
        console.error('Fallback rendering also failed:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Render system message for connection errors (non-blocking)
   * Styled differently from user/AI messages - neutral/warning style
   * Does NOT block further user input
   */
  function renderSystemMessage(message, type = 'info') {
    if (!responseArea) {
      return;
    }
    
    try {
      const systemDiv = document.createElement('div');
      systemDiv.className = `message system system-${type}`;
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'system-icon';
      if (type === 'error' || type === 'warning') {
        iconSpan.textContent = '⚠️';
      } else {
        iconSpan.textContent = 'ℹ️';
      }
      
      const textSpan = document.createElement('span');
      textSpan.className = 'system-text';
      textSpan.textContent = message;
      
      systemDiv.appendChild(iconSpan);
      systemDiv.appendChild(textSpan);
      responseArea.appendChild(systemDiv);
      
      // Auto-scroll to system message
      setTimeout(() => {
        systemDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      
      return systemDiv;
    } catch (e) {
      console.error('Error rendering system message:', e);
      return null;
    }
  }

  /**
   * Render AI fallback message when processing fails
   * Ensures chat flow continues even on errors
   */
  function renderAIFallback(detectedWord) {
    if (!responseArea) {
      return;
    }
    
    try {
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai';

      const aiEntry = document.createElement('div');
      aiEntry.className = 'ai-entry';

      const wordDiv = document.createElement('div');
      wordDiv.className = 'word';
      wordDiv.textContent = detectedWord || 'slang';

      const meaningDiv = document.createElement('div');
      meaningDiv.className = 'meaning';
      meaningDiv.textContent = `"${detectedWord || 'this term'}" is a slang expression. I couldn't process it right now, but it's definitely Gen-Z slang!`;

      const exampleDiv = document.createElement('div');
      exampleDiv.className = 'example';
      exampleDiv.textContent = `Example: People use "${detectedWord || 'this'}" in casual conversations.`;

      aiEntry.appendChild(wordDiv);
      aiEntry.appendChild(meaningDiv);
      aiEntry.appendChild(exampleDiv);
      aiMessage.appendChild(aiEntry);
      responseArea.appendChild(aiMessage);
      
      setTimeout(() => {
        aiMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (e) {
      console.error('Error rendering AI fallback:', e);
    }
  }

  /**
   * ARCHITECTURAL PRINCIPLE: INPUT PIPELINE & MESSAGE PROCESSING
   * ============================================================
   * This function is designed to NEVER block future messages, no matter what.
   * 
   * INPUT PIPELINE (MANDATORY FLOW):
   * 1. Raw User Input → Security Sanitization (HTML/script injection only)
   * 2. Original Message → Rendered in UI (preserves punctuation, emojis, Hinglish)
   * 3. Normalized Message → Semantic Processing (slang detection, etc.)
   * 
   * KEY DESIGN DECISIONS:
   * 1. User message rendering is COMPLETELY independent of backend
   * 2. Original input is ALWAYS preserved for UI display
   * 3. Normalization happens ONLY for semantic processing (not UI)
   * 4. Each message is processed in a fire-and-forget async function
   * 5. NO global state is modified during backend processing
   * 6. Button/input state is managed locally, not globally
   * 7. Errors are UI-only and never affect logic flow
   * 
   * NORMALIZATION GUARANTEE:
   * - "fr???", "fr?!?", "fr!!!!!" all normalize to "fr" for processing
   * - Original punctuation/emojis preserved in UI
   * - Semantic functions NEVER receive raw user input
   * 
   * This ensures that even if the backend fails 100 times in a row,
   * the 101st message will still work perfectly.
   */
  function sendMessage() {
    // Validate active input
    if (!activeInput || !activeButton || !responseArea) {
      console.error('Required elements not available');
      return;
    }

    // Get input value - preserve original for rendering
    const rawMessage = activeInput.value || '';
    const trimmedMessage = rawMessage.trim();
    
    // ONLY block if truly empty (trim() === "")
    if (trimmedMessage.length === 0) {
      return;
    }

    // Sanitize ONLY for security (HTML/script injection)
    // DO NOT remove words, slang, or language patterns
    const sanitizedMessage = sanitizeInput(rawMessage);
    
    // After security sanitization, check if truly empty
    // But be lenient - only block if completely empty
    const finalSanitized = sanitizedMessage.trim();
    if (finalSanitized.length === 0) {
      // Only return if sanitization removed everything (security issue)
      return;
    }

    // Check length limit (but still render message even if too long)
    const message = finalSanitized;
    const isTooLong = !validateInputLength(message, MAX_INPUT_LENGTH);

    /* === UI SWITCH (ONLY ONCE) === */
    if (!chatStarted) {
      chatStarted = true;
      try {
        document.body.classList.add("chat-started");

        const greeting = getElementSafely("greetingScreen");
        if (greeting) greeting.style.display = "none";

        const chatBox = getElementSafely("chatBox");
        if (chatBox) chatBox.style.display = "block";
        
        // Switch to secondary input (validate it exists)
        if (inputSecondary && buttonSecondary) {
          activeInput = inputSecondary;
          activeButton = buttonSecondary;
        }
      } catch (e) {
        console.error('UI switch error:', e);
      }
    }

    /* === CAPTURE LOCAL REFERENCES (CRITICAL FOR INDEPENDENCE) === */
    // Capture button/input references at THIS moment
    // This ensures each message has its own snapshot, preventing interference
    const currentButton = activeButton;
    const currentInput = activeInput;

    /* === RENDER USER MESSAGE FIRST (BEFORE ANY AI LOGIC) === */
    // This ensures user messages ALWAYS appear, even if AI fails
    // User message rendering is COMPLETELY decoupled from backend
    // CRITICAL: Render ORIGINAL message (exactly as user typed) for UI
    // Normalization happens later in processMessageAsync for semantic processing only
    // This preserves: punctuation, emojis, Hinglish, expressive characters
    const userMessageDiv = renderUserMessage(message);
    
    // If rendering failed completely, reset input and return
    if (!userMessageDiv) {
      if (currentInput) {
        currentInput.value = "";
        currentInput.style.height = "auto";
        currentInput.focus();
      }
      if (currentButton) {
        currentButton.classList.add("inactive");
        setTextContent(currentButton, "→");
      }
      return;
    }

    /* === RESET INPUT IMMEDIATELY (NON-BLOCKING) === */
    // Input is unlocked immediately so user can send more messages
    // Backend processing happens in background
    // This happens SYNCHRONOUSLY to ensure input is always ready
    try {
      if (currentInput) {
        currentInput.value = "";
        currentInput.style.height = "auto";
        // NEVER disable input - allow unlimited messages during backend downtime
        currentInput.disabled = false;
        currentInput.focus();
      }
      // Reset button to ready state immediately
      // This ensures button is always usable, regardless of backend status
      if (currentButton) {
        currentButton.classList.add("inactive");
        setTextContent(currentButton, "→");
        currentButton.disabled = false;
      }
    } catch (e) {
      console.warn('Error resetting input:', e);
    }

    // Show length warning if needed (non-blocking)
    if (isTooLong) {
      renderSystemMessage(`Message is longer than ${MAX_INPUT_LENGTH} characters. It may be truncated.`, 'warning');
    }

    /* === PROCESS MESSAGE ASYNCHRONOUSLY (FIRE-AND-FORGET) === */
    // This function is completely independent - no shared state
    // Each message gets its own isolated processing context
    // Failures here NEVER affect future messages
    // Button/input state is already reset above - this only handles backend communication
    processMessageAsync(message);
  }

  /**
   * ARCHITECTURAL PRINCIPLE:
   * ========================
   * This function processes a single message independently.
   * 
   * Key guarantees:
   * 1. NO global state is modified (no button/input state changes)
   * 2. Errors are caught and rendered as UI-only system messages
   * 3. NO shared mutable state between messages
   * 4. One failure cannot affect other messages
   * 
   * This is fire-and-forget: we don't wait for it, and we don't care if it fails.
   * Button/input state is managed in sendMessage() synchronously, not here.
   */
  function processMessageAsync(message) {
    // Fire-and-forget async processing
    // We don't await this - it runs independently
    (async () => {
      try {
        // Preserve original message for UI/memory (exactly as user typed)
        remember("user", message);

        /* === ARCHITECTURAL PRINCIPLE: NORMALIZE BEFORE SEMANTIC PROCESSING === */
        // CRITICAL: All semantic processing (slang detection, etc.) must use normalized input
        // Original input is preserved for UI display and memory
        // This ensures "fr???", "fr?!?", "fr!!!!!" all resolve to "fr" for processing
        const normalizedMessage = normalizeInput(message);
        
        // Detect slang words using explicit list matching
        // MUST use normalized input - never pass raw user input to semantic functions
        // But process ALL messages, even if no slang detected (for Hinglish, etc.)
        const detectedSlangWords = detectSlangWords(normalizedMessage);
        
        // Use the first detected slang word, or the normalized message if none detected
        // This allows processing of Hinglish and other slang not in our list
        // Note: We use normalized message here for backend, but original is preserved in memory
        const slangToExplain = detectedSlangWords.length > 0 ? detectedSlangWords[0] : normalizedMessage;

        // Create AbortController for proper cleanup
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 60000);

        let res;
        try {
          res = await fetch("https://nocap-xsa5.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // Send original message for context, but normalized slang for processing
              message: message, // Original preserved for backend context
              slang: slangToExplain // Normalized for consistent processing
            }),
            signal: abortController.signal
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          // Render system message for connection errors (non-blocking)
          // User can continue sending messages
          // NO global state is modified - this is UI-only
          if (fetchError.name === 'TimeoutError' || fetchError.name === 'AbortError' || fetchError.name === 'AbortSignal') {
            renderSystemMessage("Connection timeout. Backend may be starting up (Render free tier takes 30-60 seconds). Your message was saved.", 'warning');
            return;
          }
          
          // Check if backend is sleeping (common on Render free tier)
          if (fetchError.message && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError'))) {
            renderSystemMessage("Backend is offline or starting up. Your message was saved. Try again in a few seconds.", 'warning');
            return;
          }
          
          // Generic network error
          renderSystemMessage("Network error. Your message was saved. Please try again.", 'error');
          return;
        }

        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          // UI-only error - no state changes
          renderSystemMessage("Invalid response from server. Your message was saved.", 'error');
          return;
        }

        if (!res.ok) {
          // Handle errors gracefully - show system message, don't block
          // NO global state is modified
          if (res.status === 400) {
            // Validation error - show fallback AI response
            renderAIFallback(slangToExplain);
            return;
          }
          
          // Server errors - show system message (UI-only)
          if (res.status === 0 || res.status >= 500) {
            renderSystemMessage("Server error. Backend may be starting up. Your message was saved.", 'warning');
          } else if (res.status === 404) {
            renderSystemMessage("Service endpoint not found. Your message was saved.", 'error');
          } else {
            renderSystemMessage("Request failed. Your message was saved. Please try again.", 'error');
          }
          return;
        }

        if (!data || !data.reply) {
          // UI-only error - no state changes
          renderSystemMessage("Empty response from server. Your message was saved.", 'warning');
          return;
        }

        // data.reply is plain text, parse it to extract Meaning and Example
        const replyText = typeof data.reply === 'string' ? data.reply : String(data.reply || '');

        // Validate response length
        if (replyText.length > 100000) { // Prevent memory issues
          // UI-only error - no state changes
          renderSystemMessage("Response too large. Your message was saved.", 'warning');
          return;
        }

      // Parse the response to extract meaning and example
      // Try multiple patterns to catch different formats
      const meaningMatch = replyText.match(/Meaning:\s*(.+?)(?:\n|Example:|$)/is) || 
                          replyText.match(/meaning:\s*(.+?)(?:\n|example:|$)/is) ||
                          replyText.match(/Meaning\s*[:\-]\s*(.+?)(?:\n|Example|Example:|$)/is);
      
      const exampleMatch = replyText.match(/Example:\s*(.+?)(?:\n|Meaning:|$)/is) ||
                          replyText.match(/example:\s*(.+?)(?:\n|meaning:|$)/is) ||
                          replyText.match(/Example\s*[:\-]\s*(.+?)$/is) ||
                          replyText.match(/Example\s*[:\-]\s*(.+?)(?:\n|$)/is);
      
      let meaning = meaningMatch ? meaningMatch[1].trim() : '';
      let example = exampleMatch ? exampleMatch[1].trim() : '';
      
      // Use the slang word that was sent to backend
      // If no slang was detected, use a generic term
      const detectedWord = detectedSlangWords.length > 0 ? slangToExplain : (message.split(/\s+/)[0] || 'term');
      
      /**
       * Validate and clean example sentence
       * Rules: ONE sentence, ≤15 words, never just the slang word, never raw input
       */
      function validateAndCleanExample(exampleText, slangWord, originalInput) {
        if (!exampleText || exampleText.trim().length === 0) {
          return null;
        }
        
        // Remove quotes if present
        let cleaned = exampleText.replace(/^["']|["']$/g, '').trim();
        
        // Never use slang word alone as example
        if (cleaned.toLowerCase() === slangWord.toLowerCase()) {
          return null;
        }
        
        // Never fallback to raw input text
        if (cleaned.toLowerCase() === originalInput.toLowerCase().trim()) {
          return null;
        }
        
        // Extract first sentence only
        const firstSentence = cleaned.split(/[.!?]+/)[0].trim();
        if (firstSentence.length === 0) {
          return null;
        }
        
        // Count words
        const wordCount = firstSentence.split(/\s+/).filter(w => w.length > 0).length;
        
        // Must be ≤15 words
        if (wordCount > 15) {
          // Truncate to 15 words, ensuring we don't break mid-sentence
          const words = firstSentence.split(/\s+/).slice(0, 15);
          let truncated = words.join(' ');
          // Remove trailing punctuation that might be incomplete
          truncated = truncated.replace(/[,;:]\s*$/, '');
          return truncated + '.';
        }
        
        // Ensure it ends with punctuation
        if (!/[.!?]$/.test(firstSentence)) {
          return firstSentence + '.';
        }
        
        return firstSentence;
      }
      
      /**
       * Generate default example if needed
       */
      function generateDefaultExample(slangWord) {
        const defaults = {
          'fr': 'That was crazy, fr.',
          'mid': 'The movie was mid, not great.',
          'cap': 'No cap, that really happened.',
          'nocap': 'No cap, I saw it myself.',
          'no cap': 'No cap, that\'s the truth.',
          'lowkey': 'I\'m lowkey excited about it.',
          'highkey': 'I\'m highkey disappointed.',
          'bet': 'Bet, I\'ll be there.',
          'facts': 'Facts, you\'re absolutely right.',
          'deadass': 'Deadass, I mean it.',
          'sus': 'That seems sus to me.',
          'slay': 'You slay in that outfit.',
          'periodt': 'That\'s the truth, periodt.',
          'period': 'That\'s final, period.',
          'tea': 'Spill the tea already.',
          'vibe': 'This place has good vibes.',
          'vibes': 'I\'m getting good vibes here.',
          'fire': 'That song is fire.',
          'lit': 'The party was lit.',
          'goat': 'He\'s the goat of basketball.'
        };
        
        return defaults[slangWord.toLowerCase()] || `"${slangWord}" is used in casual conversation.`;
      }
      
      // Clean and validate example
      example = validateAndCleanExample(example, detectedWord, message);
      
      // If example is invalid, try to generate default
      if (!example) {
        const defaultExample = generateDefaultExample(detectedWord);
        // Validate the default - it should always pass, but check anyway
        example = validateAndCleanExample(defaultExample, detectedWord, finalMessage);
        // If default also fails (shouldn't happen), use a safe fallback
        if (!example) {
          const safeFallback = `People use "${detectedWord}" in casual conversations.`;
          example = validateAndCleanExample(safeFallback, detectedWord, finalMessage);
          // Last resort - use a very simple example
          if (!example) {
            example = `Example: "${detectedWord}" is commonly used.`;
          }
        }
      }
      
      // Final validation: ensure meaning exists and is not empty
      if (!meaning || meaning.trim().length === 0) {
        // Try to extract from full reply text
        const sentences = replyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let fallbackMeaning = sentences.find(s => {
          const trimmed = s.trim();
          return trimmed.length > 10 && 
                 !trimmed.toLowerCase().includes('example') &&
                 !trimmed.toLowerCase().startsWith('meaning') &&
                 trimmed.toLowerCase() !== detectedWord.toLowerCase();
        });
        
        if (fallbackMeaning) {
          meaning = fallbackMeaning.trim();
          } else {
          meaning = `"${detectedWord}" is a slang term used in casual conversation.`;
        }
      }
      
      // Ensure meaning is not too short
      if (meaning.trim().length < 10) {
        meaning = `"${detectedWord}" is a slang term used in casual conversation.`;
      }

      // Validate AI output before rendering
      // Do NOT render if: only word, empty meaning, or empty/invalid example
      const hasValidMeaning = meaning && meaning.trim().length > 0 && meaning.trim().toLowerCase() !== detectedWord.toLowerCase();
      const hasValidExample = example && example.trim().length > 0 && example.trim().toLowerCase() !== detectedWord.toLowerCase();
      
      if (!hasValidMeaning || !hasValidExample) {
        // Invalid output - show fallback instead of silently failing
        // User message is already visible, so show graceful AI response
        // NO state changes - this is UI-only
        renderAIFallback(detectedWord);
        return;
      }

      // Render AI message in conversation timeline
      try {
        // Create AI message container
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message ai';

        // Create AI entry structure
        const aiEntry = document.createElement('div');
        aiEntry.className = 'ai-entry';

        // Word
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.textContent = detectedWord;
        aiEntry.appendChild(wordDiv);

        // Meaning (guaranteed to exist after validation)
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'meaning';
        meaningDiv.textContent = meaning;
        aiEntry.appendChild(meaningDiv);

        // Example (guaranteed to exist after validation)
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example';
        exampleDiv.textContent = example;
        aiEntry.appendChild(exampleDiv);

        aiMessage.appendChild(aiEntry);
        responseArea.appendChild(aiMessage);
        
        // Auto-scroll to the AI message smoothly (debounced)
        clearTimeout(processMessageAsync.scrollTimeout);
        processMessageAsync.scrollTimeout = setTimeout(() => {
          if (aiMessage && aiMessage.parentNode) {
            aiMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
        
        // Success - no state changes needed (button already reset in sendMessage)
      } catch (renderError) {
        console.error('Error rendering reply:', renderError);
        // UI-only error - no state changes
        renderSystemMessage("Error rendering response. Your message was saved.", 'error');
      }
    } catch (err) {
      // Unexpected error - show system message (UI-only)
      // NO global state is modified - this error cannot affect future messages
      console.error('Unexpected error in processMessageAsync:', err);
      renderSystemMessage("Unexpected error. Your message was saved.", 'error');
    }
    })(); // End async IIFE - fire-and-forget, no await
  }

  /**
   * Safely render error message
   */
  function renderError(errorMessage) {
    if (!responseArea || !errorMessage) {
      return;
    }

    try {
      // Limit error messages to prevent accumulation
      const existingErrors = responseArea.querySelectorAll('.error-message');
      if (existingErrors.length > 3) {
        // Remove oldest error messages, keep only last 3
        for (let i = 0; i < existingErrors.length - 3; i++) {
          existingErrors[i].remove();
        }
      }

      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'error-icon';
      iconDiv.textContent = '⚠️';

      const contentDiv = document.createElement('div');
      contentDiv.className = 'error-content';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'error-title';
      titleDiv.textContent = escapeHtml(errorMessage.title || 'Error');

      const descDiv = document.createElement('div');
      descDiv.className = 'error-description';
      descDiv.textContent = escapeHtml(errorMessage.description || '');

      contentDiv.appendChild(titleDiv);
      contentDiv.appendChild(descDiv);

      if (errorMessage.solution) {
        const solutionDiv = document.createElement('div');
        solutionDiv.className = 'error-solution';
        solutionDiv.textContent = '💡 ' + escapeHtml(errorMessage.solution);
        contentDiv.appendChild(solutionDiv);
      }

      errorDiv.appendChild(iconDiv);
      errorDiv.appendChild(contentDiv);
      responseArea.appendChild(errorDiv);

      // Auto-scroll to error (debounced to prevent multiple scrolls)
      clearTimeout(renderError.scrollTimeout);
      renderError.scrollTimeout = setTimeout(() => {
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (e) {
      console.error('Error rendering error message:', e);
    }
  }

  /* ===============================
     EVENTS
     =============================== */
  if (button) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  if (buttonSecondary) {
    buttonSecondary.addEventListener("click", (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  if (inputSecondary) {
    inputSecondary.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

});
