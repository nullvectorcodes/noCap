import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/chat", (req, res) => {
  console.log("🔥 CHAT ENDPOINT HIT");
  res.json({ ok: true, message: "server.js is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥🔥🔥 SERVER.JS IS RUNNING 🔥🔥🔥");
  console.log(`Server listening on port ${PORT}`);
});
