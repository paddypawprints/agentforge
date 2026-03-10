import { useCallback, useEffect, useRef, useState } from "react";
import { useAgentStore } from "../store/agentStore";
import { getSystemPrompt } from "../services/orchestrator";
import { Message } from "../types/agent";

interface ScrollState {
  isAtBottom: boolean;
  autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
  offset?: number;
  smooth?: boolean;
  content?: React.ReactNode;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { offset = 20, smooth = false, content } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastContentHeight = useRef(0);
  const userHasScrolled = useRef(false);

  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  const checkIsAtBottom = useCallback(
    (element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = useCallback(
    (instant?: boolean) => {
      if (!scrollRef.current) return;

      const targetScrollTop =
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      userHasScrolled.current = false;
    },
    [smooth]
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom(scrollRef.current);

    setScrollState((prev) => ({
      isAtBottom: atBottom,
      // Re-enable auto-scroll if at the bottom
      autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
    }));
  }, [checkIsAtBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const currentHeight = scrollElement.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight.current;

    if (hasNewContent) {
      if (scrollState.autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight.current === 0);
        });
      }
      lastContentHeight.current = currentHeight;
    }
  }, [content, scrollState.autoScrollEnabled, scrollToBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      if (scrollState.autoScrollEnabled) {
        scrollToBottom(true);
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [scrollState.autoScrollEnabled, scrollToBottom]);

  const disableAutoScroll = useCallback(() => {
    const atBottom = scrollRef.current
      ? checkIsAtBottom(scrollRef.current)
      : false;

    // Only disable if not at bottom
    if (!atBottom) {
      userHasScrolled.current = true;
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
  };
}

/**
 * MessageHistory Component
 * Shows the system prompt + only the messages from the last user turn onward.
 * This gives a clean view of one full LLM exchange: what was sent and what came back.
 */
export function MessageHistory() {
  const { messages } = useAgentStore();
  const { scrollRef } = useAutoScroll({ offset: 20, smooth: true });

  // Slice out only the current exchange (from the last user message onward)
  const lastUserIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i;
    }
    return -1;
  })();

  // ─── 4-colour palette + helpers ─────────────────────────────────────────
  const G   = '#00ff41';               // green  – headings, entity labels
  const B   = '#00e5ff';               // blue   – tool / structured data
  const A   = '#ffe600';               // amber  – user / system roles
  const T   = '#dce8d4';               // text   – all body content
  const gBd = 'rgba(0,255,65,0.35)';
  const bBd = 'rgba(0,229,255,0.30)';
  const aBd = 'rgba(255,230,0,0.40)';
  const gBg = 'rgba(0,255,65,0.05)';
  const bBg = 'rgba(0,229,255,0.06)';
  const aBg = 'rgba(255,230,0,0.08)';
  // ─────────────────────────────────────────────────────────────────────────

  const currentTurn: Message[] = lastUserIdx >= 0 ? messages.slice(lastUserIdx) : [];
  const systemPrompt = getSystemPrompt();
  const turnCount = messages.filter((m) => m.role === 'user').length;

  if (messages.length === 0) {
    return (
      <div ref={scrollRef} style={{ minHeight: '12rem', overflowY: 'auto', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="pkd-text-mono text-center" style={{ fontSize: '0.875rem', color: A }}>
          [ NO MESSAGES ] — Type a message below and press SEND to start the conversation.
        </p>
      </div>
    );
  }

  // ─── shared style helpers ────────────────────────────────────────────────
  const label = (color: string) => ({ fontSize: '0.75rem' as const, color, letterSpacing: '0.08em' });
  const body  = (color: string) => ({ fontSize: '0.875rem' as const, color, margin: 0 as const, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const });
  const box   = (bg: string, bd: string) => ({ padding: '0.5rem 0.75rem', background: bg, border: `1px solid ${bd}`, borderRadius: '2px' });
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div ref={scrollRef} style={{ maxHeight: '36rem', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Turn counter */}
      {turnCount > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: aBd }} />
          <span className="pkd-text-mono" style={{ ...label(A), whiteSpace: 'nowrap' }}>
            SHOWING TURN {turnCount} OF {turnCount}
          </span>
          <div style={{ flex: 1, height: '1px', background: aBd }} />
        </div>
      )}

      {/* System prompt block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="pkd-text-mono" style={label(A)}>⬡ SYSTEM</span>
        <div style={{ ...box(aBg, aBd), padding: '0.65rem 0.9rem' }}>
          <pre className="pkd-text-mono" style={{ ...body(T), maxHeight: '7rem', overflowY: 'auto' }}>{systemPrompt}</pre>
        </div>
      </div>

      {currentTurn.map((message: Message) => {

        /* ── STATUS messages ─────────────────────────────────────────── */
        if (message.role === 'status') {
          let parsed: any = null;
          try { parsed = JSON.parse(message.content); } catch {}

          /* Orchestrator: sending to LLM */
          if (parsed?.type === 'llm_call') {
            const callLabel = parsed.callNum === 1 ? 'sending to LLM' : `sending to LLM (call #${parsed.callNum})`;
            const ctxMsgs: any[] = parsed.contextMessages || [];
            return (
              <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderLeft: `2px solid ${gBd}`, paddingLeft: '0.75rem' }}>
                <span className="pkd-text-mono" style={label(G)}>
                  <span style={{ opacity: 0.55 }}>Orchestrator:</span> {callLabel}
                </span>
                <div style={{ ...box(gBg, gBd), display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <span className="pkd-text-mono" style={label(G)}>{ctxMsgs.length + 1} messages in context</span>
                  {/* System — always first */}
                  <pre title="SYSTEM" className="pkd-text-mono" style={{ ...body(T), maxHeight: '4rem', overflowY: 'auto', cursor: 'default' }}>{systemPrompt}</pre>
                  {ctxMsgs.map((msg: any, i: number) => {
                    if (msg.role === 'user') return (
                      <pre key={i} title="USER" className="pkd-text-mono" style={{ ...body(T), cursor: 'default' }}>{msg.content}</pre>
                    );
                    if (msg.role === 'assistant') {
                      const tc = msg.tool_calls?.[0];
                      let toolStr = '';
                      if (tc) { try { toolStr = `${tc.function.name}(${JSON.stringify(JSON.parse(tc.function.arguments), null, 2)})`; } catch { toolStr = `${tc.function.name}(${tc.function.arguments})`; } }
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          {msg.content && <pre title="LLM (prior turn)" className="pkd-text-mono" style={{ ...body(T), cursor: 'default' }}>{msg.content}</pre>}
                          {tc && <pre title="LLM tool call" className="pkd-text-mono" style={{ ...body(B), cursor: 'default' }}>→ {toolStr}</pre>}
                        </div>
                      );
                    }
                    if (msg.role === 'tool') {
                      const pretty = (() => { try { return JSON.stringify(JSON.parse(msg.content), null, 2); } catch { return msg.content; } })();
                      return <pre key={i} title="TOOL RESULT" className="pkd-text-mono" style={{ ...body(B), cursor: 'default', maxHeight: '4rem', overflowY: 'auto' }}>{pretty}</pre>;
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          }

          /* LLM response + Orchestrator decision */
          if (parsed?.type === 'llm_response') {
            const isToolCall = parsed.finish_reason === 'tool_calls';
            const inputStr = isToolCall ? (() => { try { return JSON.stringify(parsed.tool_input, null, 2); } catch { return String(parsed.tool_input); } })() : null;
            return (
              <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* LLM block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderLeft: `2px solid ${gBd}`, paddingLeft: '0.75rem' }}>
                  <span className="pkd-text-mono" style={label(G)}>
                    <span style={{ opacity: 0.55 }}>LLM:</span> response received
                  </span>
                  <div style={{ ...box(gBg, gBd), display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <span className="pkd-text-mono" style={label(G)}>
                      finish_reason: <span style={{ color: isToolCall ? A : G, fontWeight: 600 }}>{parsed.finish_reason}</span>
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <span className="pkd-text-mono" style={label(G)}>TEXT CONTENT</span>
                      <pre className="pkd-text-mono" style={body(T)}>{parsed.responseContent || '(none)'}</pre>
                    </div>
                    {isToolCall && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span className="pkd-text-mono" style={label(A)}>TOOL CALL — structured output, separate from text</span>
                        <pre className="pkd-text-mono" style={body(B)}>{parsed.tool_name}({inputStr})</pre>
                      </div>
                    )}
                  </div>
                </div>
                {/* Orchestrator block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderLeft: `2px solid ${gBd}`, paddingLeft: '0.75rem' }}>
                  <span className="pkd-text-mono" style={label(G)}>
                    <span style={{ opacity: 0.55 }}>Orchestrator:</span> processing LLM response
                  </span>
                  <div style={box(gBg, gBd)}>
                    {isToolCall ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className="pkd-text-mono" style={{ ...label(G), fontWeight: 600 }}>
                          Decision: call tool <span style={{ color: B }}>{parsed.tool_name}</span>
                        </span>
                        <pre className="pkd-text-mono" style={body(T)}>{inputStr}</pre>
                      </div>
                    ) : (
                      <span className="pkd-text-mono" style={{ ...label(G), fontWeight: 600 }}>Decision: yield to UI</span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          /* Fallback */
          return (
            <div key={message.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: gBd }} />
              <span className="pkd-text-mono" style={{ ...label(G), whiteSpace: 'nowrap' }}>{message.content}</span>
              <div style={{ flex: 1, height: '1px', background: gBd }} />
            </div>
          );
        }

        /* ── USER message ─────────────────────────────────────────────── */
        if (message.role === 'user') return (
          <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
            <span className="pkd-text-mono" style={label(A)}>USER</span>
            <div style={{ maxWidth: '85%', ...box(aBg, aBd), padding: '0.65rem 0.9rem' }}>
              <p className="pkd-text-mono" style={body(T)}>{message.content}</p>
            </div>
          </div>
        );

        /* ── TOOL result ──────────────────────────────────────────────── */
        if (message.role === 'tool') {
          const pretty = (() => { try { return JSON.stringify(JSON.parse(message.content), null, 2); } catch { return message.content; } })();
          return (
            <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="pkd-text-mono" style={label(B)}>→ TOOL RESULT INJECTED</span>
              <div style={{ ...box(bBg, bBd), padding: '0.65rem 0.9rem' }}>
                <pre className="pkd-text-mono" style={body(B)}>{pretty}</pre>
              </div>
            </div>
          );
        }

        /* ── ASSISTANT final response ─────────────────────────────────── */
        return (
          <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="pkd-text-mono" style={label(G)}>✓ ASSISTANT</span>
            <div style={{ ...box(gBg, gBd), padding: '0.65rem 0.9rem' }}>
              <p className="pkd-text-mono" style={body(T)}>{message.content}</p>
            </div>
          </div>
        );

      })}
    </div>
  );
}
