import express from "express";
import cors from "cors";
import fetch from "node-fetch";


const app = express();
app.use(cors());
app.use(express.json());

const LM_STUDIO_URL = "http://192.168.1.18:1234/v1/chat/completions";

// ---------------------------------------------
// Health Check
// ---------------------------------------------
app.get("/", (req, res) => {
  res.send("✅ Word History API running");
});

// ---------------------------------------------
// 🧠 NEW: CHAT WITH MEMORY ENDPOINT (REQUIRED)
// ---------------------------------------------
app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const response = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct-v0.3",
        messages,
        temperature: 0.1,
        max_tokens: 512

      })
    });

    const data = await response.json();

    console.log("🧠 LM STUDIO RAW RESPONSE:\n", JSON.stringify(data, null, 2));

    // 🔴 HARD VALIDATION
    if (
      !data ||
      !Array.isArray(data.choices) ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      return res.status(500).json({
        error: "LM Studio returned no message content",
        raw: data
      });
    }

    // ✅ ONLY send real model output
    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("❌ /chat error:", err);
    res.status(500).json({ error: err.message });
  }
});



// ---------------------------------------------
// 1️⃣ WORD HISTORY ENDPOINT (UNCHANGED)
// ---------------------------------------------
app.post("/history", async (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: "Word is required" });
  }

  const prompt = `
Return ONLY valid JSON.
No markdown. No explanation. No extra text.

Word: "${word}"

JSON format:

{
  "meaning": "short and clear (1 line)",
  "origin": "very brief origin (1 line)",
  "modern_use": "how people use it today (1 line)",
  "example": "one simple example sentence"
}
`;

  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-7b-instruct-v0.3",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON");

    res.json(JSON.parse(match[0]));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI response failed" });
  }
});

// ---------------------------------------------
// 2️⃣ SLANG ANALYZER ENDPOINT (UNCHANGED)
// ---------------------------------------------
app.post("/analyze", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const prompt = `
Analyze the following message.

Message:
"${message}"

Respond ONLY in valid JSON.

{
  "context": "overall meaning",
  "tone": "tone",
  "slang": [{ "word": "", "meaning": "" }],
  "plain_english": "rewritten sentence"
}
`;

  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-7b-instruct-v0.3",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON");

    res.json(JSON.parse(match[0]));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI response failed" });
  }
});

// ---------------------------------------------
// Start Server
// ---------------------------------------------
app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
