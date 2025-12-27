import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// Security: Limit request body size (10MB max)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: CORS configuration - restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGIN || 'http://localhost:8000' 
    : true, // Allow all in development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security: Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const LM_STUDIO_URL = "http://192.168.1.18:1234/v1/chat/completions";
const LM_STUDIO_LOCAL = "http://127.0.0.1:1234/v1/chat/completions";

// Security: Configuration constants
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES_COUNT = 50;
const MAX_WORD_LENGTH = 200;
const FETCH_TIMEOUT = 30000; // 30 seconds
const MAX_RESPONSE_SIZE = 100000; // 100KB max response

// ===============================
// SECURITY & VALIDATION UTILITIES
// ===============================

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }
  // Remove control characters except newlines, tabs, and carriage returns
  return str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validate message array
 */
function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'messages must be an array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'messages array cannot be empty' };
  }

  if (messages.length > MAX_MESSAGES_COUNT) {
    return { valid: false, error: `messages array cannot exceed ${MAX_MESSAGES_COUNT} items` };
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: 'each message must be an object' };
    }

    if (typeof msg.role !== 'string' || !['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: 'message role must be "user", "assistant", or "system"' };
    }

    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'message content must be a string' };
    }

    const sanitized = sanitizeString(msg.content);
    if (sanitized.length === 0) {
      return { valid: false, error: 'message content cannot be empty' };
    }

    if (sanitized.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `message content cannot exceed ${MAX_MESSAGE_LENGTH} characters` };
    }
  }

  return { valid: true };
}

/**
 * Validate word input
 */
function validateWord(word) {
  if (typeof word !== 'string') {
    return { valid: false, error: 'word must be a string' };
  }

  const sanitized = sanitizeString(word);
  if (sanitized.length === 0) {
    return { valid: false, error: 'word cannot be empty' };
  }

  if (sanitized.length > MAX_WORD_LENGTH) {
    return { valid: false, error: `word cannot exceed ${MAX_WORD_LENGTH} characters` };
  }

  return { valid: true, sanitized };
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Safe JSON parse
 */
function safeJsonParse(str, fallback = null) {
  try {
    if (typeof str !== 'string') {
      return fallback;
    }
    if (str.length > MAX_RESPONSE_SIZE) {
      return fallback;
    }
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Extract JSON from text safely
 */
function extractJsonSafely(text) {
  if (typeof text !== 'string' || text.length > MAX_RESPONSE_SIZE) {
    return null;
  }

  try {
    // Try parsing directly first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON object
    const match = text.match(/\{[\s\S]{1,100000}\}/);
    if (match && match[0]) {
      return safeJsonParse(match[0], null);
    }
    return null;
  }
}

// ---------------------------------------------
// Health Check
// ---------------------------------------------
app.get("/", (req, res) => {
  res.json({ 
    status: "ok",
    message: "Word History API running",
    timestamp: new Date().toISOString()
  });
});

// ---------------------------------------------
// 🧠 NEW: CHAT WITH MEMORY ENDPOINT (REQUIRED)
// ---------------------------------------------
app.post("/chat", async (req, res) => {
  console.log("🔥 ENTERED /chat ROUTE");
  console.log("🔥 REQUEST BODY:", req.body);
  try {
    const { message, temperature } = req.body;

    // Validate message exists
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "message must be a string" });
    }

    const sanitizedMessage = sanitizeString(message);
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: "message cannot be empty" });
    }

    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        error: `message cannot exceed ${MAX_MESSAGE_LENGTH} characters` 
      });
    }

    // Validate and sanitize temperature
    const safeTemperature = typeof temperature === 'number' 
      ? Math.max(0, Math.min(2, temperature)) 
      : 0.1;

    // Get Groq API key from environment variable
    const groqApiKey = process.env["no-cap"];
    if (!groqApiKey || typeof groqApiKey !== 'string' || groqApiKey.trim().length === 0) {
      console.error("❌ /chat: Groq API key not found in environment variable 'no-cap'");
      return res.status(500).json({ 
        error: "Server configuration error" 
      });
    }

    // Prepare request payload for Groq with proper messages array format
    const payload = {
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: sanitizedMessage
        }
      ],
      temperature: safeTemperature
    };

    console.log("🔥 ABOUT TO CALL GROQ");
    let response;
    try {
      response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey.trim()}`
        },
        body: JSON.stringify(payload)
      }, FETCH_TIMEOUT);
    } catch (fetchError) {
      console.error("❌ /chat fetch error:", fetchError.message);
      return res.status(503).json({ 
        error: "Could not connect to Groq API" 
      });
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error?.message || `HTTP ${response.status}`;
      } catch {
        errorDetail = `HTTP ${response.status}`;
      }
      console.error("❌ Groq API response not OK:", response.status, errorDetail);
      return res.status(502).json({ 
        error: "Groq API returned an error" 
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("❌ /chat JSON parse error:", jsonError);
      return res.status(502).json({ 
        error: "Invalid response from Groq API" 
      });
    }

    // Validate response structure
    if (
      !data ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0 ||
      !data.choices[0] ||
      !data.choices[0].message ||
      typeof data.choices[0].message.content !== 'string'
    ) {
      console.error("❌ /chat invalid response structure:", data);
      return res.status(502).json({
        error: "Groq API returned invalid response format"
      });
    }

    const content = data.choices[0].message.content;
    
    // Validate content length
    if (content.length > MAX_RESPONSE_SIZE) {
      console.error("❌ /chat response too large:", content.length);
      return res.status(502).json({
        error: "Response from Groq API is too large"
      });
    }

    // ✅ Send sanitized model output
    res.json({
      reply: content
    });

  } catch (err) {
    console.error("❌ /chat error:", err);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "An error occurred processing your request" 
      : err.message;
    res.status(500).json({ error: errorMessage });
  }
});



// ---------------------------------------------
// 1️⃣ WORD HISTORY ENDPOINT (SECURED)
// ---------------------------------------------
app.post("/history", async (req, res) => {
  try {
    const { word } = req.body;

    // Validate word
    const validation = validateWord(word);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const safeWord = validation.sanitized;

    // Use template literal safely (word is already sanitized)
    const prompt = `Return ONLY valid JSON.
No markdown. No explanation. No extra text.

Word: "${safeWord}"

JSON format:

{
  "meaning": "short and clear (1 line)",
  "origin": "very brief origin (1 line)",
  "modern_use": "how people use it today (1 line)",
  "example": "one simple example sentence"
}
`;

    let response;
    try {
      response = await fetchWithTimeout(LM_STUDIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral-7b-instruct-v0.3",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4
        })
      }, FETCH_TIMEOUT);
    } catch (fetchError) {
      console.error("❌ /history fetch error:", fetchError.message);
      return res.status(503).json({ 
        error: "Could not connect to LM Studio" 
      });
    }

    if (!response.ok) {
      return res.status(502).json({ 
        error: "LM Studio returned an error" 
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("❌ /history JSON parse error:", jsonError);
      return res.status(502).json({ 
        error: "Invalid response from LM Studio" 
      });
    }

    if (
      !data ||
      !Array.isArray(data.choices) ||
      !data.choices[0] ||
      !data.choices[0].message ||
      typeof data.choices[0].message.content !== 'string'
    ) {
      return res.status(502).json({
        error: "LM Studio returned invalid response format"
      });
    }

    const rawText = data.choices[0].message.content;

    const parsed = extractJsonSafely(rawText);
    if (!parsed) {
      return res.status(502).json({ 
        error: "Model did not return valid JSON" 
      });
    }

    res.json(parsed);

  } catch (err) {
    console.error("❌ /history error:", err);
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "AI response failed" 
      : err.message;
    res.status(500).json({ error: errorMessage });
  }
});

// ---------------------------------------------
// 2️⃣ SLANG ANALYZER ENDPOINT (SECURED)
// ---------------------------------------------
app.post("/analyze", async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (typeof message !== 'string') {
      return res.status(400).json({ error: "Message must be a string" });
    }

    const sanitized = sanitizeString(message);
    if (sanitized.length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (sanitized.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` 
      });
    }

    // Use template literal safely (message is already sanitized)
    const prompt = `Analyze the following message.

Message:
"${sanitized}"

Respond ONLY in valid JSON.

{
  "context": "overall meaning",
  "tone": "tone",
  "slang": [{ "word": "", "meaning": "" }],
  "plain_english": "rewritten sentence"
}
`;

    let response;
    try {
      response = await fetchWithTimeout(LM_STUDIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral-7b-instruct-v0.3",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4
        })
      }, FETCH_TIMEOUT);
    } catch (fetchError) {
      console.error("❌ /analyze fetch error:", fetchError.message);
      return res.status(503).json({ 
        error: "Could not connect to LM Studio" 
      });
    }

    if (!response.ok) {
      return res.status(502).json({ 
        error: "LM Studio returned an error" 
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("❌ /analyze JSON parse error:", jsonError);
      return res.status(502).json({ 
        error: "Invalid response from LM Studio" 
      });
    }

    if (
      !data ||
      !Array.isArray(data.choices) ||
      !data.choices[0] ||
      !data.choices[0].message ||
      typeof data.choices[0].message.content !== 'string'
    ) {
      return res.status(502).json({
        error: "LM Studio returned invalid response format"
      });
    }

    const rawText = data.choices[0].message.content;

    const parsed = extractJsonSafely(rawText);
    if (!parsed) {
      return res.status(502).json({ 
        error: "Model did not return valid JSON" 
      });
    }

    res.json(parsed);

  } catch (err) {
    console.error("❌ /analyze error:", err);
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "AI response failed" 
      : err.message;
    res.status(500).json({ error: errorMessage });
  }
});

// ---------------------------------------------
// 404 Handler
// ---------------------------------------------
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path 
  });
});

// ---------------------------------------------
// Global Error Handler
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? "An error occurred" 
    : err.message;
  res.status(500).json({ error: errorMessage });
});

// ---------------------------------------------
// Start Server
// ---------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
