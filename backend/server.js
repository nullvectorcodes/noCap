import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.post("/chat", async (req, res) => {
  console.log("🔥 ENTERED /chat ROUTE");
  console.log("🔥 REQUEST BODY:", req.body);
  
  try {
    const { messages, temperature } = req.body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }

    // Validate and sanitize temperature
    const safeTemperature = typeof temperature === 'number' 
      ? Math.max(0, Math.min(2, temperature)) 
      : 0.1;

    // Get Groq API key from environment variable
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || typeof groqApiKey !== 'string' || groqApiKey.trim().length === 0) {
      console.error("❌ /chat: Groq API key not found in environment variable 'GROQ_API_KEY'");
      return res.status(500).json({ 
        error: "Server configuration error" 
      });
    }

    // Prepare request payload for Groq
    const payload = {
      model: "llama3-8b-8192",
      messages: messages,
      temperature: safeTemperature
    };

    console.log("🔥 ABOUT TO CALL GROQ");
    let groqResponse;
    try {
      groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey.trim()}`
        },
        body: JSON.stringify(payload)
      });
    } catch (fetchError) {
      console.error("❌ /chat fetch error:", fetchError.message);
      return res.status(503).json({ 
        error: "Could not connect to Groq API" 
      });
    }

    const text = await groqResponse.text();
    console.log("🔥 GROQ STATUS:", groqResponse.status);
    console.log("🔥 GROQ BODY:", text);

    if (!groqResponse.ok) {
      return res.status(500).json({ 
        error: "Groq API returned an error", 
        status: groqResponse.status 
      });
    }

    let data;
    try {
      data = JSON.parse(text);
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

    // ✅ Send sanitized model output
    res.json({
      reply: content
    });

  } catch (err) {
    console.error("❌ /chat error:", err);
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "An error occurred processing your request" 
      : err.message;
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥🔥🔥 SERVER.JS IS RUNNING 🔥🔥🔥");
  console.log(`Server listening on port ${PORT}`);
});
