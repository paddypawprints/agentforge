/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  memory.ts  —  CONVERSATION MEMORY                              ║
 * ║                                                                  ║
 * ║  This is the entire memory system for the agent. It is ~35      ║
 * ║  lines of plain TypeScript — no database, no embeddings, no     ║
 * ║  vector search.                                                  ║
 * ║                                                                  ║
 * ║  HOW IT WORKS                                                    ║
 * ║  After every completed exchange, orchestrate() calls             ║
 * ║  addMemoryEntry(userQuery, finalAnswer) to record the turn.      ║
 * ║  On the NEXT call, orchestrate() calls getMemory() and prepends  ║
 * ║  every stored turn to the prompt before the new user message.    ║
 * ║  The LLM therefore sees the full conversation history on every   ║
 * ║  call, even though it is a stateless function that remembers     ║
 * ║  nothing between requests.                                       ║
 * ║                                                                  ║
 * ║  WHY IT IS SEPARATE FROM THE UI STORE                           ║
 * ║  The UI renders exchanges (request + response + tool calls)      ║
 * ║  as a trace. Resetting that trace (CLEAR button) wipes the UI    ║
 * ║  display. Memory is deliberately separate so that clearing the   ║
 * ║  trace ALSO resets memory — the CLEAR button calls clearMemory() ║
 * ║  explicitly to ensure the two stay in sync.                      ║
 * ║                                                                  ║
 * ║  WHAT COUNTS AS A "TURN"                                        ║
 * ║  One MemoryEntry = one complete user → agent exchange.           ║
 * ║  If the agent called three tools before answering, all of that   ║
 * ║  is collapsed into a single { user, assistant } pair in memory.  ║
 * ║  The detailed tool trace lives in the Exchange object returned   ║
 * ║  by orchestrate() and rendered by the UI — memory only needs     ║
 * ║  the essentials to give the LLM context.                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/**
 * A single completed conversation turn.
 *
 * `user`      — the original question the user sent.
 * `assistant` — the final natural-language answer the agent gave back.
 *               Tool calls and intermediate reasoning are NOT stored here;
 *               only the final answer the user saw.
 */
export type MemoryEntry = {
  user: string;
  assistant: string;
};

/**
 * The in-memory store. A plain module-level array — no framework, no
 * external state, no persistence. It lives for the lifetime of the page.
 * Refreshing the browser wipes it automatically.
 */
const store: MemoryEntry[] = [];

/**
 * Record a completed turn.
 *
 * Call this AFTER the agent has produced its final answer — i.e. after
 * orchestrate() resolves. Passing the user query and the final answer
 * is all that is needed; the full tool trace is not stored here.
 *
 * Called by orchestrate() automatically at the end of every successful run.
 */
export function addMemoryEntry(user: string, assistant: string): void {
  store.push({ user, assistant });
}

/**
 * Return all stored turns, oldest first.
 *
 * Returns a shallow copy so callers cannot accidentally mutate the store.
 * Called by orchestrate() at the start of every run to build the prompt:
 *
 *   const memory = getMemory();
 *   const prompt = [
 *     systemMessage,
 *     ...memory.flatMap(m => [
 *       { role: 'user',      content: m.user      },
 *       { role: 'assistant', content: m.assistant },
 *     ]),
 *     { role: 'user', content: userQuery },
 *   ];
 *
 * The LLM receives the full history on every call. That is the only reason
 * it appears to "remember" previous messages.
 */
export function getMemory(): MemoryEntry[] {
  return [...store];
}

/**
 * Wipe all stored turns.
 *
 * Called by the CLEAR button in App.tsx. After this, the next call to
 * orchestrate() will send only the system prompt and the new user message —
 * the agent will have no recollection of previous exchanges.
 */
export function clearMemory(): void {
  store.length = 0;
}

/**
 * How many turns are currently stored.
 *
 * Useful for displaying turn count in the UI header, and for guard
 * conditions if you want to cap memory at N turns.
 */
export function memorySize(): number {
  return store.length;
}
