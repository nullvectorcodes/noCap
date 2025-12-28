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

    // Get input value and trim it
    const rawMessage = activeInput.value || '';
    const trimmedMessage = rawMessage.trim();
    
    // Validate input - do NOT send request if empty or whitespace-only
    if (!trimmedMessage || trimmedMessage.length === 0) {
      return;
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(trimmedMessage);
    
    // Double-check after sanitization
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

      // Final validation: ensure message is not empty before sending
      const finalMessage = message.trim();
      if (!finalMessage || finalMessage.length === 0) {
        // Unlock input if somehow we got here with empty message
        if (activeButton) {
          activeButton.disabled = false;
          setTextContent(activeButton, "Send");
        }
        if (activeInput) {
          activeInput.disabled = false;
        }
        return;
      }

      let res;
      try {
        res = await fetch("https://nocap-xsa5.onrender.com/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: finalMessage
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
        // Handle 400 (validation errors) as user input issues, not system failures
        if (res.status === 400) {
          // Don't show "Request Failed" for validation errors
          // Remove the user message div that was added
          const userMessageDivs = responseArea.querySelectorAll('.chat-user');
          if (userMessageDivs.length > 0) {
            userMessageDivs[userMessageDivs.length - 1].remove();
          }
          // Unlock the input and return silently
          if (activeButton) {
            activeButton.disabled = false;
            setTextContent(activeButton, "Send");
          }
          if (activeInput) {
            activeInput.disabled = false;
            activeInput.focus();
          }
          return;
        }
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

      // data.reply is plain text, parse it to extract Meaning and Example
      const replyText = typeof data.reply === 'string' ? data.reply : String(data.reply || '');

      // Validate response length
      if (replyText.length > 100000) { // Prevent memory issues
        throw new Error("INVALID_FORMAT");
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
      
      // If no example found, try to extract from meaning or generate a simple one
      if (!example || example.toLowerCase().includes('no example') || example.length < 5) {
        // Try to find example in the full text if not in Example: section
        const fullExampleMatch = replyText.match(/"([^"]+)"/) || replyText.match(/example[:\s]+(.+?)(?:\n|$)/i);
        if (fullExampleMatch) {
          example = fullExampleMatch[1].trim();
        } else if (meaning) {
          // Create a simple example from the meaning if available
          example = `"${detectedWord}" - ${meaning.split('.')[0]}`;
        } else {
          example = 'Example usage in context';
        }
      }
      
      // Extract the word from user message - try to find the most likely slang word
      // (usually shorter, non-common words, or the first word if message is short)
      const messageWords = message.trim().split(/\s+/);
      let detectedWord = messageWords[0] || 'word';
      
      // If message is short (1-3 words), use first word; otherwise find shortest meaningful word
      if (messageWords.length > 3) {
        const shortWords = messageWords.filter(w => w.length >= 2 && w.length <= 8 && !['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'].includes(w.toLowerCase()));
        if (shortWords.length > 0) {
          detectedWord = shortWords[0];
        }
      }

      // Render structured UI with highlighted word and example
      try {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'chat-ai';
        replyDiv.style.animation = 'fadeIn 0.4s ease-out';

        // Intro sentence at top
        const introDiv = document.createElement('div');
        introDiv.className = 'slang-intro';
        introDiv.textContent = `The word "${detectedWord}" means like ${meaning ? meaning.split('.')[0].toLowerCase() : 'this'}`;
        introDiv.style.marginBottom = '20px';
        introDiv.style.fontSize = '15px';
        introDiv.style.color = 'var(--text)';
        introDiv.style.lineHeight = '1.5';
        replyDiv.appendChild(introDiv);

        // Main content container - vertical layout
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
        mainContainer.style.gap = '16px';
        mainContainer.style.marginTop = '4px';

        // Top row: Word and example side by side
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.gap = '20px';
        topRow.style.alignItems = 'flex-start';
        topRow.style.flexWrap = 'wrap';

        // Word highlighted in purple - large and bold
        const wordDiv = document.createElement('div');
        wordDiv.className = 'slang-word-highlight';
        wordDiv.textContent = detectedWord;
        wordDiv.style.color = 'var(--purple-main)';
        wordDiv.style.fontSize = '36px';
        wordDiv.style.fontWeight = '700';
        wordDiv.style.lineHeight = '1.1';
        wordDiv.style.margin = '0';
        wordDiv.style.flexShrink = '0';
        topRow.appendChild(wordDiv);

        // Example in pill-shaped chat bubble - aligned to left
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'slang-example';
        exampleDiv.textContent = example;
        exampleDiv.style.fontSize = '14px';
        exampleDiv.style.lineHeight = '1.5';
        exampleDiv.style.color = 'var(--text)';
        exampleDiv.style.fontStyle = 'normal';
        exampleDiv.style.padding = '10px 16px';
        exampleDiv.style.background = 'rgba(139, 92, 246, 0.08)';
        exampleDiv.style.borderRadius = '18px';
        exampleDiv.style.border = '1.5px solid rgba(139, 92, 246, 0.3)';
        exampleDiv.style.boxShadow = '0 1px 4px rgba(109, 40, 217, 0.1)';
        exampleDiv.style.maxWidth = '400px';
        exampleDiv.style.flex = '1';
        exampleDiv.style.minWidth = '200px';
        topRow.appendChild(exampleDiv);

        mainContainer.appendChild(topRow);

        // Meaning below the word and example
        if (meaning) {
          const meaningDiv = document.createElement('div');
          meaningDiv.className = 'slang-meaning';
          meaningDiv.textContent = meaning;
          meaningDiv.style.fontSize = '15px';
          meaningDiv.style.lineHeight = '1.6';
          meaningDiv.style.color = 'var(--text)';
          meaningDiv.style.margin = '0';
          mainContainer.appendChild(meaningDiv);
        }

        replyDiv.appendChild(mainContainer);

        responseArea.appendChild(replyDiv);
        
        // Auto-scroll to the response area smoothly
        setTimeout(() => {
          replyDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } catch (renderError) {
        console.error('Error rendering reply:', renderError);
        throw new Error("RENDER_ERROR");
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
