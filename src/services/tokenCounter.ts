// src/services/tokenCounter.ts
export function countTokens(text: string): number {
  // Simple estimation: ~4 characters per token
  // For production, use tiktoken or similar libraries for accurate counting
  return Math.ceil(text.length / 4);
}
