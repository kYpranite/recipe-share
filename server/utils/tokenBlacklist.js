// Simple in-memory token blacklist
const blacklistedTokens = new Set();

export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

export const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Optional: Clean up expired tokens periodically
setInterval(() => {
  // This is a simple cleanup that you might want to implement differently in production
  blacklistedTokens.clear();
}, 24 * 60 * 60 * 1000); // Clear every 24 hours 