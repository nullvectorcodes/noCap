
// This file allows us to block the 'sharp' module from being imported using a webpack alias.
// This prevents Next.js or other dependencies from trying to load native bindings on Apple Silicon.

module.exports = {
    // Mock common sharp methods if needed, or just throw/log
    // For now, we want to ensure it doesn't crash the app
};

console.warn("⚠️  [Sharp Blocker] 'sharp' import was intercepted and blocked. Native optimization is disabled.");
