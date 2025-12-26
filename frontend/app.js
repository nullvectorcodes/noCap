import { remember } from "./chatMemory.js";

// Hide preloader when page loads
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 300);
  }
});

document.addEventListener("DOMContentLoaded", () => {

  let chatStarted = false;

  const input = document.getElementById("chatInput");
  const inputSecondary = document.getElementById("chatInputSecondary");
  const button = document.getElementById("actionBtn");
  const buttonSecondary = document.getElementById("actionBtnSecondary");
  const toggleBtn = document.getElementById("themeToggle");
  const root = document.documentElement;
  const responseArea = document.getElementById("responseArea");
  
  // Use the active input (primary initially, secondary after chat starts)
  let activeInput = input;
  let activeButton = button;

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
  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function handleInputChange(el, btn) {
    autoResize(el);
    if (el.value.trim()) {
      btn.classList.remove("inactive");
      btn.textContent = "→";
    } else {
      btn.classList.add("inactive");
      btn.textContent = "→";
    }
  }

  input.addEventListener("input", () => handleInputChange(input, button));
  if (inputSecondary) {
    inputSecondary.addEventListener("input", () => handleInputChange(inputSecondary, buttonSecondary));
  }

  /* ===============================
     SEND MESSAGE
     =============================== */

  async function sendMessage() {
    const message = activeInput.value.trim();
    if (!message) return;

    /* === UI SWITCH (ONLY ONCE) === */
    if (!chatStarted) {
      chatStarted = true;
      document.body.classList.add("chat-started");

      const greeting = document.getElementById("greetingScreen");
      if (greeting) greeting.style.display = "none";

      const chatBox = document.getElementById("chatBox");
      if (chatBox) chatBox.style.display = "block";
      
      // Switch to secondary input
      activeInput = inputSecondary;
      activeButton = buttonSecondary;
    }

    /* === SHOW USER MESSAGE === */
    responseArea.innerHTML += `
    <div class="chat-user">
      ${message}
    </div>
  `;

    /* === LOCK INPUT === */
    activeButton.disabled = true;
    activeButton.textContent = "…";
    activeInput.disabled = true;

    try {
      remember("user", message);

      const messages = [
        {
          role: "user",
          content:
            "You are noCap, an intent-aware slang analyzer.\n\n" +
            "STEP 1 — UNDERSTAND INTENT:\n" +
            "- Determine whether the message is casual, informal, or conversational.\n" +
            "- If the tone is casual, evaluate words in their INFORMAL sense.\n\n" +
            "STEP 2 — IDENTIFY ALL SLANG & INFORMAL WORDS:\n" +
            "- Identify EVERY slang word, abbreviation, or informal term in the message.\n" +
            "- This includes: slang terms (mid, fr, cap, bet, etc.), abbreviations (fr = for real, etc.), informal expressions.\n" +
            "- DO NOT skip any slang words - find ALL of them in the message.\n" +
            "- Each slang word should have its own entry in the slangs array.\n\n" +
            "JSON FORMAT:\n" +
            '{"highlighted_message":"", "slangs":[{"word":"","pronunciation":"","meaning":"","example":""}]}\n\n' +
            "IMPORTANT: Include ALL slang words found in the message. For example, if the message is 'the party was mid fr', you must identify BOTH 'mid' AND 'fr' as separate slang words.\n\n" +
            "Message:\n" + message
        }
      ];
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          temperature: 0.1
        })
      });

      const data = await res.json();
      if (!res.ok || !data.reply) {
        throw new Error("Invalid AI response");
      }

      const aiText = data.reply;

      let parsed;
      try {
        parsed = JSON.parse(aiText);
      } catch {
        const match = aiText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found");
        parsed = JSON.parse(match[0]);
      }

      if (parsed.slangs.length > 0) {
        // Render each slang word in the new format
        parsed.slangs.forEach(s => {
          // Create intro message - make it natural and friendly
          const meaningLower = s.meaning.toLowerCase();
          const introMessage = `The word "${s.word}" means like ${meaningLower}`;
          
          responseArea.innerHTML += `
            <div class="word-definition-container">
              <div class="intro-message">${introMessage}</div>
              <div class="dashed-separator"></div>
              <div class="word-definition-card">
                <div class="word-section">
                  <div class="word-title">${s.word}</div>
                  <div class="word-meaning">${s.meaning}</div>
                </div>
                ${s.example ? `
                  <div class="example-bubble">
                    ${s.example}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
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
      responseArea.innerHTML += `
      <div class="chat-ai" style="color:red;">
        ❌ ${err.message}
      </div>
    `;
    }

    /* === RESET INPUT === */
    activeInput.value = "";
    activeInput.style.height = "auto";
    activeInput.disabled = false;
    activeButton.disabled = false;
    activeButton.classList.add("inactive");
    activeButton.textContent = "→";
    activeInput.focus();
  }

  /* ===============================
     EVENTS
     =============================== */
  button.addEventListener("click", sendMessage);
  if (buttonSecondary) {
    buttonSecondary.addEventListener("click", sendMessage);
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  if (inputSecondary) {
    inputSecondary.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

});
