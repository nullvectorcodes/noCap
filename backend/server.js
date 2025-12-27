import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message?.trim();

    if (!userMessage) {
      return res.status(400).json({ error: "message must be a non-empty string" });
    }

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are noCap, a multilingual slang explainer that understands slang from ANY language including English, Hinglish (Hindi-English mix), Spanish, Telugu, and all other languages.\n\nYour task:\n1. Identify the slang word or phrase in the message (it could be in any language or mixed languages)\n2. Understand the context and cultural meaning\n3. Always provide:\n   Meaning: [clear explanation of what it means]\n   Example: [a real example sentence showing how it's used, in quotes]\n\nIMPORTANT:\n- ALWAYS provide an Example, even if you need to create one based on the meaning\n- The example should be a complete sentence showing the slang in context\n- Handle code-switching (mixing languages) like Hinglish, Spanglish, etc.\n- Understand context - the same word might mean different things in different languages\n- Be concise but clear\n\nFormat your response exactly as:\nMeaning: [explanation]\nExample: [example sentence in quotes]"
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
