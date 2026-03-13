/**
 * memory.ts — Conversation memory for the agent loop.
 *
 * Stores completed user/assistant turn pairs and injects them into the
 * groqHistory array on every new orchestrate() call so the LLM has context
 * from previous turns.
 *
 * Memory is deliberately separate from the Zustand display store so it
 * persists across trace clears.  Call clearMemory() (e.g. from the CLEAR
 * button) to wipe it.
 */

export type MemoryEntry = {
  user: string;
  assistant: string;
};

const store: MemoryEntry[] = [];

/** Record a completed turn. Call after the final assistant response. */
export function addMemoryEntry(user: string, assistant: string): void {
  store.push({ user, assistant });
}

/** Return a copy of all stored turns, oldest first. */
export function getMemory(): MemoryEntry[] {
  return [...store];
}

/** Wipe all stored turns. */
export function clearMemory(): void {
  store.length = 0;
}

/** How many turns are currently stored. */
export function memorySize(): number {
  return store.length;
}
