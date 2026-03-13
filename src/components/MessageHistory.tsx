import { useCallback, useEffect, useRef, useState } from "react";
import { Exchange, PromptMessage } from "../types/agent";

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
 * MessageHistory — renders a single Exchange returned by orchestrate() or sendMessage().
 * No store, no JSON parsing, no position arithmetic — just typed data rendered directly.
 */
export function MessageHistory({ exchange, turnCount }: { exchange: Exchange | null; turnCount?: number }) {
  const { scrollRef } = useAutoScroll({ offset: 20, smooth: true, content: exchange });

  const G   = 'var(--pkd-primary)';
  const B   = 'var(--pkd-secondary)';
  const A   = 'var(--pkd-warning)';
  const M   = 'var(--pkd-accent)';
  const T   = 'var(--pkd-foreground-muted)';
  const gBd = 'var(--pkd-primary-border)';
  const bBd = 'var(--pkd-secondary-border)';
  const aBd = 'var(--pkd-warning-border)';
  const mBd = 'var(--pkd-accent-border, #c0392b55)';
  const gBg = 'var(--pkd-primary-bg)';
  const aBg = 'var(--pkd-warning-bg)';

  const label = (color: string) => ({ fontSize: 'var(--pkd-text-xs)' as const, color, letterSpacing: '0.08em' });
  const body  = (color: string) => ({ fontSize: 'var(--pkd-text-sm)' as const, color, margin: 0 as const, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const });
  const box   = (bg: string, bd: string) => ({ padding: '0.65rem 0.9rem', background: bg, border: `1px solid ${bd}`, borderRadius: '2px' });

  if (!exchange) {
    return (
      <div ref={scrollRef} style={{ minHeight: '12rem', overflowY: 'auto', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="pkd-text-mono text-center" style={{ fontSize: 'var(--pkd-text-sm)', color: A }}>
          [ NO MESSAGES ] — Type a message below and press SEND to start.
        </p>
      </div>
    );
  }

  // Render a single PromptMessage from the REQUEST section, colour-coded by source
  const renderPromptMsg = (msg: PromptMessage, i: number) => {
    switch (msg.source) {
      case 'system':
        return (
          <div key={i} style={{ borderLeft: `2px solid ${aBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span className="pkd-text-mono" style={{ ...label(A), fontWeight: 700 }}>SYSTEM PROMPT</span>
            <pre className="pkd-text-mono" style={{ ...body(T), maxHeight: '5rem', overflowY: 'auto' }}>{msg.text}</pre>
          </div>
        );
      case 'memory_user':
        return (
          <div key={i} style={{ borderLeft: `2px solid ${mBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span className="pkd-text-mono" style={{ ...label(M), fontWeight: 700 }}>MEMORY · USER</span>
            <pre className="pkd-text-mono" style={body(T)}>{msg.text}</pre>
          </div>
        );
      case 'memory_assistant':
        return (
          <div key={i} style={{ borderLeft: `2px solid ${mBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span className="pkd-text-mono" style={{ ...label(M), fontWeight: 700 }}>MEMORY · ASSISTANT</span>
            <pre className="pkd-text-mono" style={body(T)}>{msg.text}</pre>
          </div>
        );
      case 'user':
        return (
          <div key={i} style={{ borderLeft: `2px solid ${aBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span className="pkd-text-mono" style={{ ...label(A), fontWeight: 700 }}>USER</span>
            <pre className="pkd-text-mono" style={body(T)}>{msg.text}</pre>
          </div>
        );
      case 'tool_call': {
        let args = '';
        try { args = JSON.stringify(msg.toolInput, null, 2); } catch { args = String(msg.toolInput); }
        return (
          <div key={i} style={{ borderLeft: `2px solid ${bBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span className="pkd-text-mono" style={{ ...label(B), fontWeight: 700 }}>TOOL CALL</span>
            <pre className="pkd-text-mono" style={{ ...body(B) }}>{msg.toolName}({args})</pre>
          </div>
        );
      }
      case 'tool_response': {
        const pretty = (() => { try { return JSON.stringify(JSON.parse(msg.text), null, 2); } catch { return msg.text; } })();
        return (
          <div key={i} style={{ borderLeft: `2px solid ${bBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span className="pkd-text-mono" style={{ ...label(B), fontWeight: 700 }}>TOOL RESULT</span>
            <pre className="pkd-text-mono" style={{ ...body(B), maxHeight: '5rem', overflowY: 'auto' }}>{pretty}</pre>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div ref={scrollRef} style={{ height: '100%', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Turn counter */}
      {turnCount && turnCount > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: aBd }} />
          <span className="pkd-text-mono" style={{ ...label(A), whiteSpace: 'nowrap' }}>TURN {turnCount}</span>
          <div style={{ flex: 1, height: '1px', background: aBd }} />
        </div>
      )}

      {/* USER bubble */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
        <span className="pkd-text-mono" style={label(A)}>USER</span>
        <div style={{ maxWidth: '85%', ...box(aBg, aBd) }}>
          <p className="pkd-text-mono" style={body(T)}>{exchange.userQuery}</p>
        </div>
      </div>

      {/* One card per LLM round */}
      {exchange.rounds.map((round, roundIdx) => (
        <div key={roundIdx} style={{ border: `1px solid ${gBd}`, borderRadius: '4px' }}>

          {/* Card header */}
          <div style={{ padding: '0.35rem 0.75rem', background: gBg, borderBottom: `1px solid ${gBd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="pkd-text-mono" style={{ ...label(G), fontWeight: 700, letterSpacing: '0.1em' }}>
              LLM CALL {exchange.rounds.length > 1 ? `${roundIdx + 1} OF ${exchange.rounds.length}` : ''}
            </span>
            <span className="pkd-text-mono" style={{ ...label(G), opacity: 0.6 }}>
              {round.request.length} message{round.request.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* REQUEST */}
          <div style={{ padding: '0.6rem 0.75rem', borderBottom: `1px solid ${gBd}`, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '14rem', overflowY: 'auto' }}>
            <span className="pkd-text-mono" style={{ ...label(G), opacity: 0.55 }}>REQUEST</span>
            {round.request.map((msg, i) => renderPromptMsg(msg, i))}
          </div>

          {/* RESPONSE */}
          <div style={{ padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: '4rem', maxHeight: '14rem', overflowY: 'auto' }}>
            <span className="pkd-text-mono" style={{ ...label(G), opacity: 0.55 }}>
              RESPONSE · finish_reason: <span style={{ color: round.finish_reason === 'tool_calls' ? A : G, fontWeight: 700 }}>{round.finish_reason}</span>
            </span>
            {round.text && (
              <div style={{ borderLeft: `2px solid ${gBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span className="pkd-text-mono" style={{ ...label(G), fontWeight: 700 }}>TEXT</span>
                <pre className="pkd-text-mono" style={body(T)}>{round.text}</pre>
              </div>
            )}
            {round.finish_reason === 'tool_calls' && round.toolName && (
              <div style={{ borderLeft: `2px solid ${bBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span className="pkd-text-mono" style={{ ...label(B), fontWeight: 700 }}>TOOL CALL REQUEST</span>
                <pre className="pkd-text-mono" style={body(B)}>
                  {round.toolName}({(() => { try { return JSON.stringify(round.toolInput, null, 2); } catch { return String(round.toolInput); } })()})
                </pre>
              </div>
            )}
            {round.toolResult && (
              <div style={{ borderLeft: `2px solid ${bBd}`, paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span className="pkd-text-mono" style={{ ...label(B), fontWeight: 700 }}>TOOL RESULT</span>
                <pre className="pkd-text-mono" style={{ ...body(B), maxHeight: '5rem', overflowY: 'auto' }}>
                  {(() => { try { return JSON.stringify(JSON.parse(round.toolResult!), null, 2); } catch { return round.toolResult; } })()}
                </pre>
              </div>
            )}
          </div>

        </div>
      ))}

    </div>
  );
}
