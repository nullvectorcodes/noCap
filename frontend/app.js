alert("app.js loaded");

import { remember, getMemory } from "./chatmemory.js";

document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("chatInput");
  const button = document.getElementById("actionBtn");
  const toggleBtn = document.getElementById("themeToggle");
  const root = document.documentElement;
  const responseArea = document.getElementById("responseArea");

  /* ===============================
     THEME
     =============================== */
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  toggleBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ===============================
     AUTO RESIZE
     =============================== */
  function autoResize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  }

  input.addEventListener("input", () => {
    autoResize();
    if (input.value.trim()) {
      button.classList.remove("inactive");
      button.textContent = "↑";
    } else {
      button.classList.add("inactive");
      button.textContent = "Search";
    }
  });

  /* ===============================
     SEND MESSAGE (WITH MEMORY)
     =============================== */
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    button.disabled = true;
    button.textContent = "…";
    input.disabled = true;

    responseArea.innerHTML = `<p style="margin-top:16px;">🧠 Analyzing…</p>`;

    try {
      // 1️⃣ remember user message
      remember("user", message);

      const memory = getMemory();

      // 2️⃣ build messages (NO system role)
      const INSTRUCTIONS =
        "You are noCap.\n" +
        "You MUST respond with ONLY raw JSON.\n" +
        "DO NOT add explanations, markdown, or extra text.\n" +
        "DO NOT say anything before or after the JSON.\n" +
        "If no slang exists, return empty arrays.\n\n" +
        "JSON FORMAT (STRICT):\n" +
        '{"highlighted_message":"", "slangs":[{"word":"","pronunciation":"","meaning":"","example":""}]}\n\n';

      const messages = [
  {
    role: "user",
    content:
      "You are noCap, an intent-aware slang analyzer.\n\n" +

      "STEP 1 — UNDERSTAND INTENT:\n" +
      "- Determine whether the message is casual, informal, or conversational.\n" +
      "- If the tone is casual, evaluate words in their INFORMAL sense.\n\n" +

      "STEP 2 — IDENTIFY SLANG & INFORMAL EVALUATORS:\n" +
      "- Treat words as slang if they are used to casually judge, rate, or react to something.\n" +
      "- Words like 'mid', 'fire', 'dead', 'lit', 'cringe' MUST be treated as slang when used as informal evaluation, even if they exist in standard English.\n\n" +

      "STRICT EXCLUSION RULES:\n" +
      "- Do NOT mark concrete nouns (party, movie, food, place) as slang.\n" +
      "- Do NOT mark grammar helpers ('the', 'was', 'is', 'thi') unless they clearly add informal tone.\n\n" +

      "PHRASE & CONTEXT RULES:\n" +
      "- If an evaluative slang word appears alone (e.g. 'mid'), it is STILL slang.\n" +
      "- If slang words appear consecutively, group them as ONE phrase.\n" +
      "- Prefer semantic meaning over dictionary classification.\n\n" +

      "MULTI-LANGUAGE RULES:\n" +
      "- Detect slang across mixed languages (English, Hinglish, Telugu, Malayalam, etc.) when used casually.\n" +
      "- Romanized regional slang is valid.\n\n" +

      "OUTPUT RULES:\n" +
      "- Analyze ONLY the message below.\n" +
      "- Return EXACTLY ONE JSON object.\n" +
      "- No explanations outside JSON.\n\n" +

      "JSON FORMAT:\n" +
      '{"highlighted_message":"", "slangs":[{"word":"","pronunciation":"","meaning":"","example":""}]}\n\n' +

      "Message:\n" + message
  }
];






      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.1
        })
      });

      const data = await res.json();
      console.log("RAW BACKEND RESPONSE:", data);

      if (!res.ok || !data.reply) {
        throw new Error("Invalid AI response");
      }

      const aiText = data.reply;

      // 3️⃣ remember assistant reply
      // remember("assistant", aiText);

      /* ===============================
         SAFE JSON EXTRACTION
         =============================== */
      let parsed;

      try {
        parsed = JSON.parse(aiText);
      } catch {
        const match = aiText.match(/\{[\s\S]*\}/);
        if (!match) {
          console.error("RAW AI OUTPUT:", aiText);
          throw new Error("No JSON found in response");
        }
        parsed = JSON.parse(match[0]);
      }

      const renderedMessage = parsed.highlighted_message
        .replaceAll("<slang>", `<span class="slang-highlight">`)
        .replaceAll("</slang>", "</span>");

      const slangList = parsed.slangs.map(s => s.word).join(", ");

      responseArea.innerHTML = `
      <div class="message-preview">
        ${renderedMessage}
      </div>

      <div style="margin-top:12px;font-size:14px;color:var(--text-muted);">
        <strong>Detected slang${parsed.slangs.length > 1 ? "s" : ""}:</strong>
        ${slangList}
      </div>

      <div class="slang-cards">
        ${parsed.slangs.map(s => `
          <div class="slang-card">
            <div class="slang-word">${s.word}</div>

            <div class="slang-pronunciation">
              Pronunciation: <strong>/${s.pronunciation}/</strong>
            </div>

            <div class="slang-meaning">
              <strong>Meaning:</strong> ${s.meaning}
            </div>

            <div style="margin-top:8px;font-size:13px;color:var(--text-muted);">
              <strong>Example:</strong> <em>${s.example}</em>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    } catch (err) {
      console.error(err);
      responseArea.innerHTML = `
      <p style="color:red;margin-top:16px;">
        ❌ AI Error: ${err.message}
      </p>
    `;
    }

    /* ===============================
       RESET UI
       =============================== */
    input.value = "";
    input.style.height = "44px";
    input.disabled = false;
    button.disabled = false;
    button.classList.add("inactive");
    button.textContent = "Search";
    input.focus();
  }


  /* ===============================
     EVENTS
     =============================== */
  button.addEventListener("click", () => {
    if (!button.classList.contains("inactive")) sendMessage();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

});
