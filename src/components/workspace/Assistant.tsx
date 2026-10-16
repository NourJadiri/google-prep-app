import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { APICallError, DefaultChatTransport, type UIMessage } from "ai";
import { forgetPassword, loadPassword, loadSpot, savePassword, saveSpot, type Spot } from "../../lib/assistant";
import { renderAnswer } from "./answer";
import Icon from "../shared/Icon";
import "./assistant.css";

/* The assistant: a small window over the workspace for the questions a
 * session throws up — syntax, an approach, a bug. ⌘K (Ctrl+K) or the
 * header's Ask button brings it up; on a phone it is a bottom sheet.
 *
 * useChat, the AI SDK's React hook, owns the conversation and the stream;
 * the window is ours. Every question carries what it is about: the code,
 * when it changed since the last question, and the latest run's report,
 * when there is a new one. So the history reads like a pairing session and
 * the newest snapshot is always the editor as it is now. The problem rides
 * along in every request and becomes the system prompt server-side
 * (worker/assistant.ts), which also owns the model, the caps and the
 * key. All this window holds is the password, in lib/assistant.
 *
 * Lives inside Body, which is keyed by problem: a new problem is a new chat.
 * Closing only hides it, so the conversation survives a ⌘K round trip.
 */

export interface AskContext {
  problem: { title: string; source: string; statement: string };
  code: string;
  /** The latest run's report (claude.ts runReport), or null before any run. */
  run: string | null;
}

interface Meta {
  /** On a question: the code it was asked about, when it changed since the last one. */
  code?: string;
  /** On a question: the run report, when it is new since the last one. */
  run?: string;
  /** On an answer: the API's stop reason. */
  stop?: string | null;
}

type Msg = UIMessage<Meta>;

/* The Worker refuses a conversation longer than this. */
const MAX_TURNS = 40;

const STARTERS = ["Why does my code fail?", "Is my approach on the right track?", "What's the complexity of my code?"];

const textOf = (m: Msg): string => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

/* The newest snapshot of this kind that went out with a question. */
function lastSent(messages: Msg[], key: "code" | "run"): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const v = m?.role === "user" ? m.metadata?.[key] : undefined;
    if (v !== undefined) return v;
  }
  return undefined;
}

/* The wire shape the Worker checks, field by field. */
function toTurn(m: Msg) {
  const text = textOf(m);
  if (m.role !== "user") return { role: "assistant" as const, text };
  return {
    role: "user" as const,
    text,
    ...(m.metadata?.code !== undefined ? { code: m.metadata.code } : {}),
    ...(m.metadata?.run ? { run: m.metadata.run } : {}),
  };
}

interface Trouble {
  /** locked: password refused. setup: no endpoint or no secrets here. full: too long to send. */
  kind: "locked" | "setup" | "full" | "other";
  text: string;
}

function troubleOf(e: Error): Trouble {
  if (APICallError.isInstance(e)) {
    switch (e.statusCode) {
      case 401:
        return { kind: "locked", text: "That password didn't work." };
      case 503:
        return {
          kind: "setup",
          text: "The assistant isn't set up on this deployment. It needs ANTHROPIC_API_KEY and ASSISTANT_PASSWORD as secrets on the Cloudflare Worker.",
        };
      case 404:
      case 405:
        return { kind: "setup", text: "No assistant endpoint here. Locally, run the app through wrangler dev (see the README)." };
      case 413:
        return { kind: "full", text: "This conversation is too long to send. Start a new one." };
    }
    let said: unknown;
    try {
      said = (JSON.parse(e.responseBody ?? "") as { error?: unknown }).error;
    } catch {
      said = undefined;
    }
    return { kind: "other", text: typeof said === "string" ? `The server said: ${said}.` : `The server answered ${e.statusCode ?? "with an error"}.` };
  }
  if (e instanceof TypeError) return { kind: "other", text: "Couldn't reach the server. Check the connection and retry." };
  /* Errors from inside the stream arrive already worded by the Worker. */
  return { kind: "other", text: e.message || "Something went wrong." };
}

/* ------------------------------ placement ------------------------------ */

const GAP = 12;
const MIN_W = 320;
const MIN_H = 300;

/* Inside the viewport, whatever the window was left at on a bigger screen. */
function fit(s: Spot): Spot {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.max(MIN_W, Math.min(s.w, vw - 2 * GAP));
  const h = Math.max(MIN_H, Math.min(s.h, vh - 2 * GAP));
  return {
    w,
    h,
    x: Math.max(GAP, Math.min(s.x, vw - w - GAP)),
    y: Math.max(GAP, Math.min(s.y, vh - h - GAP)),
  };
}

/* Bottom right, over the console, where it covers the least of the code. */
function firstSpot(): Spot {
  const w = 400;
  const h = Math.min(560, window.innerHeight - 140);
  return fit({ w, h, x: window.innerWidth - w - 24, y: window.innerHeight - h - 24 });
}

/* ------------------------------- the window ------------------------------- */

/* Memoised: every prop is stable while you type in the editor, so typing
   never re-renders the chat. */
export default memo(Assistant);

function Assistant({
  open,
  summon,
  onClose,
  context,
  wide,
}: {
  open: boolean;
  /** Bumped by every ⌘K or Ask press that should land focus here. */
  summon: number;
  onClose: () => void;
  /** Read when a question is sent, so it is the editor as it is then. */
  context: () => AskContext;
  wide: boolean;
}) {
  const [password, setPassword] = useState(loadPassword);
  const [refused, setRefused] = useState(false);
  const [typed, setTyped] = useState("");
  const [draft, setDraft] = useState("");
  const [spot, setSpot] = useState<Spot>(() => fit(loadSpot() ?? firstSpot()));

  /* The transport is built once; these let it read the current values. */
  const pass = useRef(password);
  pass.current = password;
  const ctx = useRef(context);
  ctx.current = context;

  const transport = useMemo(
    () =>
      new DefaultChatTransport<Msg>({
        api: "/api/assistant",
        headers: () => ({ authorization: `Bearer ${pass.current ?? ""}` }),
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { problem: ctx.current().problem, turns: messages.map(toTurn) },
        }),
      }),
    []
  );
  const { messages, sendMessage, regenerate, stop, status, error, clearError, setMessages } = useChat<Msg>({
    transport,
    throttle: 50,
  });

  const trouble = error ? troubleOf(error) : null;
  const busy = status === "submitted" || status === "streaming";
  const full = messages.length + 1 > MAX_TURNS;
  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "assistant" && !textOf(last));

  /* A refused password is forgotten on the spot; the question that bounced
     stays, and goes again once a new one is in. */
  useEffect(() => {
    if (!error || troubleOf(error).kind !== "locked") return;
    forgetPassword();
    setPassword(null);
    setRefused(true);
    clearError();
  }, [error, clearError]);

  const panel = useRef<HTMLElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const key = useRef<HTMLInputElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  /* Focus comes in on every summon, and goes back on close to wherever ⌘K
     was pressed: the editor, usually. The body is nowhere: it is where focus
     falls when the lock screen's field is swapped for the composer. */
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body && !panel.current?.contains(active)) {
      returnTo.current = active;
    }
    (password ? input.current : key.current)?.focus();
  }, [open, summon, password]);

  /* Focus left inside a hidden window would swallow the next ⌘K, so it
     always leaves: back where it came from, or at least out. */
  useEffect(() => {
    if (open) return;
    const back = returnTo.current;
    returnTo.current = null;
    const active = document.activeElement;
    if (active && active !== document.body && !panel.current?.contains(active)) return;
    if (back?.isConnected) back.focus();
    else if (active instanceof HTMLElement) active.blur();
  }, [open]);

  /* The log follows the answer down, unless you've scrolled up to read. */
  const log = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  useLayoutEffect(() => {
    const el = log.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, status, error, open]);
  const onScroll = () => {
    const el = log.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  /* The composer grows with what you type, up to a few lines. */
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [draft, password]);

  function ask(raw: string) {
    const text = raw.trim();
    if (!text || busy || full || !password) return;
    const now = ctx.current();
    const metadata: Meta = {};
    if (now.code !== lastSent(messages, "code")) metadata.code = now.code;
    if (now.run && now.run !== lastSent(messages, "run")) metadata.run = now.run;
    stick.current = true;
    setDraft("");
    void sendMessage({ text, metadata });
  }

  function retry() {
    stick.current = true;
    void regenerate();
  }

  function unlock(e: FormEvent) {
    e.preventDefault();
    const p = typed.trim();
    if (!p) return;
    savePassword(p);
    setPassword(p);
    pass.current = p;
    setTyped("");
    setRefused(false);
    if (messages[messages.length - 1]?.role === "user") retry();
  }

  function lock() {
    forgetPassword();
    setPassword(null);
  }

  function fresh() {
    if (busy) void stop();
    setMessages([]);
    clearError();
    setDraft("");
    input.current?.focus();
  }

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      /* Run and Submit belong to the editor; in here, ⌘Enter never reaches
         the workspace's listener. */
      e.preventDefault();
    }
  };

  const onComposeKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask(draft);
    }
  };

  /* Dragged by its header, on a desk; remembered where it's dropped. */
  const drag = useRef<{ dx: number; dy: number; id: number } | null>(null);
  const onDragStart = (e: PointerEvent<HTMLElement>) => {
    if (!wide || e.button !== 0 || (e.target as Element).closest("button")) return;
    drag.current = { dx: e.clientX - spot.x, dy: e.clientY - spot.y, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onDragMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (d && d.id === e.pointerId) setSpot((s) => fit({ ...s, x: e.clientX - d.dx, y: e.clientY - d.dy }));
  };
  const onDragEnd = (e: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    setSpot((s) => (saveSpot(s), s));
  };

  /* Resized by its corner (CSS resize); the new size is kept too. A hidden
     window measures 0 x 0, which is not a size anyone chose. */
  useEffect(() => {
    const el = panel.current;
    if (!el || !wide) return;
    let save = 0;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      setSpot((s) => (s.w === w && s.h === h ? s : { ...s, w, h }));
      window.clearTimeout(save);
      save = window.setTimeout(() => setSpot((s) => (saveSpot(s), s)), 400);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(save);
    };
  }, [wide]);

  useEffect(() => {
    const onResize = () => setSpot((s) => fit(s));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section
      ref={panel}
      className={"asst " + (wide ? "float" : "sheet")}
      style={wide ? { left: spot.x, top: spot.y, width: spot.w, height: spot.h } : undefined}
      hidden={!open}
      role="dialog"
      aria-label="Assistant"
      onKeyDown={onKeyDown}
    >
      <header
        className="asst-head"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <Icon name="sparkles" size={15} className="asst-mark" />
        <h3>Assistant</h3>
        <span className="ws-spacer" />
        {messages.length > 0 && (
          <button className="ws-iconbtn sm" onClick={fresh} aria-label="New chat" title="New chat">
            <Icon name="rotate-ccw" size={13} />
          </button>
        )}
        {password && (
          <button className="ws-iconbtn sm" onClick={lock} aria-label="Forget the password" title="Forget the password on this device">
            <Icon name="lock" size={13} />
          </button>
        )}
        <button className="ws-iconbtn sm" onClick={onClose} aria-label="Close the assistant" title="Close (Esc)">
          <Icon name="x" size={14} />
        </button>
      </header>

      {!password ? (
        <form className="asst-lock" onSubmit={unlock}>
          <span className="asst-lockmark">
            <Icon name="lock" size={18} />
          </span>
          <p>
            <b>{refused ? "That password didn't work." : "Locked to you."}</b> Paste the password you saved in
            Cloudflare as <code>ASSISTANT_PASSWORD</code>. This browser keeps it; nothing else does.
          </p>
          <input
            ref={key}
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Assistant password"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button className="ws-btn primary" type="submit" disabled={!typed.trim()}>
            Unlock
          </button>
        </form>
      ) : (
        <>
          <div className="asst-log" ref={log} onScroll={onScroll}>
            {messages.length === 0 && (
              <div className="asst-empty">
                <p>
                  Ask about syntax, your approach or a bug. Each question takes the problem, your code and your last
                  run along.
                </p>
                <div className="asst-starters">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (m.role === "user" ? <Question key={m.id} m={m} /> : <Answer key={m.id} m={m} />))}
            {waiting && (
              <div className="asst-wait" role="status" aria-label="Thinking">
                <i />
                <i />
                <i />
              </div>
            )}
            {trouble && trouble.kind !== "locked" && (
              <div className="asst-trouble" role="alert">
                <Icon name="alert-triangle" size={14} />
                <span>{trouble.text}</span>
                {trouble.kind === "other" && (
                  <button className="ws-linkbtn" onClick={retry}>
                    Retry
                  </button>
                )}
                {trouble.kind === "full" && (
                  <button className="ws-linkbtn" onClick={fresh}>
                    New chat
                  </button>
                )}
              </div>
            )}
            {full && !busy && <p className="asst-note">This chat is full. Start a new one to keep going.</p>}
          </div>

          <form
            className="asst-compose"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <textarea
              ref={input}
              rows={1}
              value={draft}
              placeholder="Ask about this problem…"
              aria-label="Your question"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onComposeKey}
            />
            {busy ? (
              <button type="button" className="asst-send stop" onClick={() => void stop()} aria-label="Stop" title="Stop">
                <Icon name="square" size={12} />
              </button>
            ) : (
              <button type="submit" className="asst-send" disabled={!draft.trim() || full} aria-label="Send" title="Send (Enter)">
                <Icon name="send" size={14} />
              </button>
            )}
          </form>
        </>
      )}
    </section>
  );
}

function Question({ m }: { m: Msg }) {
  const code = m.metadata?.code !== undefined;
  const run = !!m.metadata?.run;
  return (
    <div className="asst-q">
      <p>{textOf(m)}</p>
      {(code || run) && (
        <span className="asst-tags" title="Sent along with this question">
          {code && <span>+ code</span>}
          {run && <span>+ last run</span>}
        </span>
      )}
    </div>
  );
}

function Answer({ m }: { m: Msg }) {
  const text = textOf(m);
  /* Safe by construction: renderAnswer lets no markup from the model
     through (answer.ts). */
  const html = useMemo(() => renderAnswer(text), [text]);
  const stop = m.metadata?.stop;
  /* Still thinking: the dots below stand in for it. */
  if (!text && stop !== "max_tokens" && stop !== "refusal") return null;
  return (
    <div className="asst-a">
      {text && <div className="md" dangerouslySetInnerHTML={{ __html: html }} />}
      {stop === "max_tokens" && <p className="asst-note">Cut off at the length limit. Ask it to go on.</p>}
      {stop === "refusal" && <p className="asst-note">Claude declined to answer that one.</p>}
    </div>
  );
}
