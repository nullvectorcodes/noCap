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
        { role: "user", content: userMessage }
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
  console.log("🔥🔥🔥 SERVER.JS IS RUNNING 🔥🔥🔥");
  console.log(`Server listening on port ${PORT}`);
});
