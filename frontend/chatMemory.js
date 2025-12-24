// frontend/chatMemory.js

const STORAGE_KEY = "noCap_conversation";
const MAX_MESSAGES = 6;

let memory = [];

// Load memory on startup
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  memory = JSON.parse(saved);
}

// Save a message
export function remember(role, content) {
  memory.push({ role, content });

  if (memory.length > MAX_MESSAGES) {
    memory = memory.slice(-MAX_MESSAGES);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

// Get full memory
export function getMemory() {
  return memory;
}

// Clear memory (optional)
export function clearMemory() {
  memory = [];
  localStorage.removeItem(STORAGE_KEY);
}
