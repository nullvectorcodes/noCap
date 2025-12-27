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
 * Validate and sanitize user input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
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

  async function sendMessage() {
    // Validate active input
    if (!activeInput || !activeButton || !responseArea) {
      console.error('Required elements not available');
      return;
    }

    // Get and sanitize input
    const rawMessage = activeInput.value || '';
    const sanitizedMessage = sanitizeInput(rawMessage);
    
    // Validate input
    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      return;
    }

    if (!validateInputLength(sanitizedMessage, MAX_INPUT_LENGTH)) {
      const errorMessage = getErrorMessage("INPUT_TOO_LONG");
      renderError(errorMessage);
      return;
    }

    const message = sanitizedMessage;

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

    /* === SHOW USER MESSAGE (SAFELY) === */
    try {
      const userMessageDiv = document.createElement('div');
      userMessageDiv.className = 'chat-user';
      userMessageDiv.textContent = message; // Use textContent for safety
      responseArea.appendChild(userMessageDiv);
    } catch (e) {
      console.error('Error rendering user message:', e);
      return;
    }

    /* === LOCK INPUT === */
    try {
      if (activeButton) {
        activeButton.disabled = true;
        setTextContent(activeButton, "…");
      }
      if (activeInput) {
        activeInput.disabled = true;
      }
    } catch (e) {
      console.warn('Error locking input:', e);
    }

    try {
      remember("user", message);

      let res;
      try {
        res = await fetch("https://nocap-xsa5.onrender.com/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message
          }),
          signal: AbortSignal.timeout(60000) // 60 second timeout for Render free tier
        });
      } catch (fetchError) {
        if (fetchError.name === 'TimeoutError' || fetchError.name === 'AbortError') {
          throw new Error("NETWORK_ERROR");
        }
        // Check if backend is sleeping (common on Render free tier)
        if (fetchError.message && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError'))) {
          throw new Error("NETWORK_ERROR");
        }
        throw new Error("NETWORK_ERROR");
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error("INVALID_RESPONSE");
      }

      if (!res.ok) {
        if (data && data.error) {
          throw new Error(data.error);
        }
        if (res.status === 0 || res.status >= 500) {
          throw new Error("SERVER_ERROR");
        } else if (res.status === 404) {
          throw new Error("ENDPOINT_NOT_FOUND");
        } else {
          throw new Error("REQUEST_ERROR");
        }
      }

      if (!data || !data.reply) {
        throw new Error("EMPTY_RESPONSE");
      }

      const aiText = typeof data.reply === 'string' ? data.reply : String(data.reply || '');

      // Validate response length
      if (aiText.length > 100000) { // Prevent memory issues
        throw new Error("INVALID_FORMAT");
      }

      let parsed;
      try {
        parsed = safeJsonParse(aiText, null);
        if (!parsed) {
          throw new Error("PARSE_ERROR");
        }
      } catch (parseError) {
        // Try to extract JSON from the response
        const match = aiText.match(/\{[\s\S]{1,100000}\}/);
        if (!match || !match[0]) {
          throw new Error("INVALID_FORMAT");
        }
        try {
          parsed = safeJsonParse(match[0], null);
          if (!parsed) {
            throw new Error("PARSE_ERROR");
          }
        } catch {
          throw new Error("PARSE_ERROR");
        }
      }

      if (!parsed || !Array.isArray(parsed.slangs)) {
        throw new Error("INVALID_STRUCTURE");
      }

      // Limit number of slang words to prevent abuse
      const slangWords = parsed.slangs.slice(0, MAX_SLANG_WORDS);

      if (slangWords.length > 0) {
        // Render each slang word in the new format (safely)
        slangWords.forEach(s => {
          // Validate slang object structure
          if (!validateSlangObject(s)) {
            console.warn('Invalid slang object:', s);
            return; // Skip invalid entries
          }

          // Sanitize all values
          const safeWord = escapeHtml(s.word);
          const safeMeaning = escapeHtml(s.meaning);
          const safeMeaningLower = safeMeaning.toLowerCase();
          const safeExample = s.example ? escapeHtml(s.example) : null;
          const safeIntroMessage = escapeHtml(`The word "${safeWord}" means like ${safeMeaningLower}`);

          // Create elements safely using DOM methods instead of innerHTML
          try {
            const container = document.createElement('div');
            container.className = 'word-definition-container';

            const introDiv = document.createElement('div');
            introDiv.className = 'intro-message';
            introDiv.textContent = safeIntroMessage;

            const separator = document.createElement('div');
            separator.className = 'dashed-separator';

            const card = document.createElement('div');
            card.className = 'word-definition-card';

            const wordSection = document.createElement('div');
            wordSection.className = 'word-section';

            const wordTitle = document.createElement('div');
            wordTitle.className = 'word-title';
            wordTitle.textContent = safeWord;

            const wordMeaning = document.createElement('div');
            wordMeaning.className = 'word-meaning';
            wordMeaning.textContent = safeMeaning;

            wordSection.appendChild(wordTitle);
            wordSection.appendChild(wordMeaning);

            if (safeExample) {
              const exampleBubble = document.createElement('div');
              exampleBubble.className = 'example-bubble';
              exampleBubble.textContent = safeExample;
              card.appendChild(wordSection);
              card.appendChild(exampleBubble);
            } else {
              card.appendChild(wordSection);
            }

            container.appendChild(introDiv);
            container.appendChild(separator);
            container.appendChild(card);

            responseArea.appendChild(container);
          } catch (renderError) {
            console.error('Error rendering slang word:', renderError);
            // Continue with next item instead of breaking
          }
        });
        
        // Auto-scroll to the response area smoothly
        setTimeout(() => {
          const firstWordContainer = responseArea.querySelector('.word-definition-container');
          if (firstWordContainer) {
            firstWordContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            responseArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err?.message || 'UNKNOWN_ERROR');
      renderError(errorMessage);
    } finally {
      /* === RESET INPUT === */
      try {
        if (activeInput) {
          activeInput.value = "";
          activeInput.style.height = "auto";
          activeInput.disabled = false;
          activeInput.focus();
        }
        if (activeButton) {
          activeButton.disabled = false;
          activeButton.classList.add("inactive");
          setTextContent(activeButton, "→");
        }
      } catch (resetError) {
        console.warn('Error resetting input:', resetError);
      }
    }
  }

  /**
   * Safely render error message
   */
  function renderError(errorMessage) {
    if (!responseArea || !errorMessage) {
      return;
    }

    try {
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

      // Auto-scroll to error
      setTimeout(() => {
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
