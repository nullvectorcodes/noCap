const dictionary = {
  sheesh: {
    meaning: "Expression of disbelief or admiration",
    pronunciation: "sheesh"
  },
  lit: {
    meaning: "Exciting or excellent",
    pronunciation: "lit"
  },
  flex: {
    meaning: "To show off",
    pronunciation: "fleks"
  }
};

let highlightEl = null;
let tooltipEl = null;
let hideTimeout = null;

// ============ CLEANUP ============
function clearOverlay() {
  if (highlightEl) {
    highlightEl.style.opacity = "0";
    tooltipEl.style.opacity = "0";

    setTimeout(() => {
      highlightEl?.remove();
      tooltipEl?.remove();
      highlightEl = null;
      tooltipEl = null;
    }, 150);
  }
}

// Hide on scroll / click / ESC
["scroll", "mousedown", "keydown"].forEach(event => {
  document.addEventListener(event, e => {
    if (event === "keydown" && e.key !== "Escape") return;
    clearOverlay();
  }, true);
});

// ============ SELECTION ============
document.addEventListener("mouseup", () => {
  setTimeout(handleSelection, 10);
});

function handleSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const text = selection.toString().trim();
  if (!text) {
    clearOverlay();
    return;
  }

  const clean = text.toLowerCase().replace(/[^a-z]/g, "");
  if (!dictionary[clean]) {
    clearOverlay();
    return;
  }

  clearOverlay();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect.width) return;

  createHighlight(rect);
  createTooltip(rect, text, dictionary[clean]);

  selection.removeAllRanges();
}

// ============ UI CREATION ============
function createHighlight(rect) {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = rect.left + "px";
  el.style.top = rect.bottom - 3 + "px";
  el.style.width = rect.width + "px";
  el.style.height = "3px";
  el.style.borderRadius = "3px";
  el.style.background = "linear-gradient(90deg, #a855f7, #6366f1)";
  el.style.zIndex = "999999";
  el.style.pointerEvents = "none";
  el.style.transition = "opacity .15s ease";

  document.body.appendChild(el);
  highlightEl = el;
}

function createTooltip(rect, word, data) {
  const tip = document.createElement("div");
  tip.style.position = "fixed";
  tip.style.left = rect.left + rect.width / 2 + "px";
  tip.style.top = rect.top - 8 + "px";
  tip.style.transform = "translate(-50%, -100%) scale(.96)";
  tip.style.opacity = "0";
  tip.style.background = "linear-gradient(135deg, #1e1b4b, #312e81)";
  tip.style.color = "#fff";
  tip.style.padding = "12px 14px";
  tip.style.borderRadius = "14px";
  tip.style.width = "240px";
  tip.style.fontSize = "13px";
  tip.style.zIndex = "999999";
  tip.style.boxShadow = "0 20px 40px rgba(99,102,241,.35)";
  tip.style.backdropFilter = "blur(12px)";
  tip.style.transition = "all .2s ease";
  tip.style.pointerEvents = "none";

  tip.innerHTML = `
    <div style="color:#c4b5fd;font-weight:600">${word}</div>
    <div style="font-size:12px;opacity:.8">/${data.pronunciation}/</div>
    <div style="margin-top:6px;line-height:1.4">${data.meaning}</div>
  `;

  document.body.appendChild(tip);
  tooltipEl = tip;

  requestAnimationFrame(() => {
    tip.style.opacity = "1";
    tip.style.transform = "translate(-50%, -100%) scale(1)";
  });
}
