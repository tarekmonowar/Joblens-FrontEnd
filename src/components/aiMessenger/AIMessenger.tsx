'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/config/runtime';
import { cn } from '@/lib/utils';

/* ─────────────────────── Types ─────────────────────── */

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  /** True while the typewriter animation is still revealing text */
  streaming?: boolean;
}

/* ─────────────────────── Constants ─────────────────────── */

const DEFAULT_QUESTIONS = [
  'How can Joblens help me find a job?',
  'What features does this website have?',
  'What technologies are used?',
];

const WELCOME_STORAGE_KEY = 'joblens-ai-welcome-seen';
const PILL_PHRASES = ['Need help?', 'Ask Joblens', 'Chat now'];
const PILL_INTERVAL_MS = 2400;
const WELCOME_AUTO_DISMISS_MS = 12_000;
const WELCOME_INITIAL_DELAY_MS = 1500;

/** Controls how many characters are revealed per animation frame based on backlog size. */
function getCharsPerFrame(backlog: number): number {
  if (backlog <= 0) return 0;
  if (backlog < 40) return 1;
  if (backlog < 120) return 2;
  if (backlog < 240) return 4;
  if (backlog < 500) return 7;
  return 12;
}

/* ─────────────────────── Markdown Renderers ─────────────────────── */

function extractAssistantMarkdown(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const body = payload as Record<string, unknown>;
  const data = body.data;
  if (typeof data === 'string') return data.trim();
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string') return message.trim();
  }
  const error = body.error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message.trim();
  }
  return '';
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 text-[13.5px] leading-[1.7] text-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 ml-0.5 list-disc space-y-1.5 pl-4 marker:text-primary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 ml-0.5 list-decimal space-y-2 pl-[1.15rem] marker:font-semibold marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-0.5 text-[13.5px] leading-[1.7] [&>p]:mb-1 [&>p:last-child]:mb-0 [&>ul]:my-1.5 [&>ol]:my-1.5">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-3 text-[15px] font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-3 text-[15px] font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1.5 mt-3 text-[13.5px] font-semibold text-primary first:mt-0">{children}</h4>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-3 text-[13.5px] font-semibold text-primary first:mt-0">{children}</h4>
  ),
  code: ({ children, className }) => {
    const isBlock = /language-/.test(className ?? '');
    if (isBlock) {
      return <code className="font-mono text-[12px] text-foreground">{children}</code>;
    }
    return (
      <code className="rounded-md bg-primary/10 px-1 py-0.5 font-mono text-[12px] text-primary">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-background px-3 py-2.5 text-[12px] leading-relaxed">
      {children}
    </pre>
  ),
  a: ({ children, href }) => {
    const internal = Boolean(href?.startsWith('/'));
    return (
      <a
        href={href}
        target={internal ? undefined : '_blank'}
        rel={internal ? undefined : 'noopener noreferrer'}
        className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/40 pl-3 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12.5px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-border bg-muted/50">{children}</thead>,
  th: ({ children }) => (
    <th className="px-2 py-1.5 font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-border px-2 py-1.5 text-foreground">{children}</td>
  ),
};

/* ─────────────────────── Component ─────────────────────── */

export function AIChatMessenger() {
  /* ── UI State ── */
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [pillIdx, setPillIdx] = useState(0);

  /* ── Refs ── */
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Typewriter animation state (kept in refs to avoid re-renders on every character)
  const bufferRef = useRef(''); // Full text received from the network
  const displayedLenRef = useRef(0); // Number of characters currently visible
  const streamDoneRef = useRef(false); // Whether the network stream has ended
  const animationFrameRef = useRef<number | null>(null);
  const activeAiIdRef = useRef<string | null>(null);
  const messageIdRef = useRef(0);

  const nextMessageId = (prefix: string) => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  /* ── Rotating pill label while chat is closed ── */
  useEffect(() => {
    if (isOpen) return;
    const timer = setInterval(
      () => setPillIdx((i) => (i + 1) % PILL_PHRASES.length),
      PILL_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [isOpen]);

  /* ── First-visit welcome bubble ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(WELCOME_STORAGE_KEY)) return;
    const timer = setTimeout(() => setShowWelcome(true), WELCOME_INITIAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showWelcome) return;
    const timer = setTimeout(() => {
      setShowWelcome(false);
      localStorage.setItem(WELCOME_STORAGE_KEY, '1');
    }, WELCOME_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [showWelcome]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_STORAGE_KEY, '1');
    }
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    dismissWelcome();
  }, [dismissWelcome]);

  /* ── Auto-scroll to latest message ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Cleanup animation frame on unmount ── */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /* ── Typewriter animation loop ── */
  const tick = useCallback(function tick() {
    const aiId = activeAiIdRef.current;
    if (!aiId) {
      animationFrameRef.current = null;
      return;
    }

    const backlog = bufferRef.current.length - displayedLenRef.current;
    const step = getCharsPerFrame(backlog);

    if (step > 0) {
      displayedLenRef.current = Math.min(displayedLenRef.current + step, bufferRef.current.length);

      const visible = bufferRef.current.slice(0, displayedLenRef.current);

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === aiId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content: visible, streaming: true };
        return updated;
      });
    }

    const caughtUp = displayedLenRef.current >= bufferRef.current.length && streamDoneRef.current;

    if (caughtUp) {
      // All text revealed — finalize the message (hides the blinking cursor)
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === aiId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], streaming: false };
        return updated;
      });
      activeAiIdRef.current = null;
      animationFrameRef.current = null;
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, []);

  /** Ensures the animation loop is running (safe to call multiple times). */
  const ensureAnimationRunning = useCallback(() => {
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  /* ── Send message to backend, then typewriter the markdown reply ── */
  const sendToAI = async (history: Message[]) => {
    bufferRef.current = '';
    displayedLenRef.current = 0;
    streamDoneRef.current = false;

    try {
      setIsThinking(true);

      const response = await fetch(`${env.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      const markdown = extractAssistantMarkdown(payload);

      if (!response.ok || !markdown) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const aiMessageId = nextMessageId('ai');
      activeAiIdRef.current = aiMessageId;

      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          content: '',
          sender: 'ai',
          timestamp: new Date(),
          streaming: true,
        },
      ]);

      setIsThinking(false);
      bufferRef.current = markdown;
      streamDoneRef.current = true;
      ensureAnimationRunning();
    } catch (error) {
      console.error('[AIMessenger] Chat error:', error);

      streamDoneRef.current = true;
      activeAiIdRef.current = null;

      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId('error'),
          content: 'Sorry, the AI service is currently unavailable. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  /* ── Message submission handlers ── */
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: nextMessageId('user'),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInputValue('');
    void sendToAI(history);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  /* ─────────────────────── Render ─────────────────────── */

  return (
    <>
      {/* ── Floating Chat Button (visible when chat is closed) ── */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-end gap-2 sm:gap-3">
          {/* Welcome bubble or rotating pill */}
          {showWelcome ? (
            <div
              role="button"
              tabIndex={0}
              onClick={openChat}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openChat();
              }}
              className="tm-ai-bubble-in relative mb-3 max-w-[200px] sm:max-w-[230px] cursor-pointer rounded-2xl rounded-br-sm bg-card border border-border px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl shadow-primary/10 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/15 transition-shadow"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissWelcome();
                }}
                aria-label="Dismiss"
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>

              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4 text-primary tm-ai-sparkle shrink-0"
                  strokeWidth={2.5}
                />
                <p className="text-sm font-semibold text-primary tm-ai-shimmer">Need help?</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask the <span className="font-semibold text-primary">{env.appName} Assistant</span>{' '}
                — anything about this site.
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground/80">Click to start chatting →</p>

              {/* Tail pointing toward the chat icon */}
              <span className="absolute -right-1.5 bottom-4 h-3 w-3 rotate-45 border-t border-r border-border bg-card" />
            </div>
          ) : (
            <button
              type="button"
              onClick={openChat}
              aria-label="Open Joblens chat"
              className="tm-ai-bubble-in relative mb-3 flex items-center gap-1.5 rounded-full bg-card border border-border pl-2.5 pr-3 py-1.5 shadow-md shadow-primary/10 backdrop-blur-xl hover:shadow-lg hover:shadow-primary/15 hover:scale-[1.04] transition-all cursor-pointer"
            >
              <Sparkles
                className="h-3.5 w-3.5 text-primary tm-ai-sparkle shrink-0"
                strokeWidth={2.8}
              />
              <span
                key={pillIdx}
                className="tm-ai-text-pop inline-block min-w-[68px] text-center text-[12px] font-bold text-primary whitespace-nowrap"
              >
                {PILL_PHRASES[pillIdx]}
              </span>
              {/* Tail */}
              <span className="absolute -right-1 bottom-3 h-2.5 w-2.5 rotate-45 border-t border-r border-border bg-card" />
            </button>
          )}

          {/* Main floating button with pulse rings */}
          <div className="relative tm-ai-float">
            {/* Pulse rings */}
            <span aria-hidden className="tm-ai-ring absolute inset-0 rounded-full bg-primary/30" />
            <span
              aria-hidden
              className="tm-ai-ring absolute inset-0 rounded-full bg-primary/20"
              style={{ animationDelay: '1.2s' }}
            />

            <Button
              onClick={openChat}
              aria-label="Open Joblens chat"
              className="relative h-12 w-12 sm:h-14 sm:w-14 xl:h-16 xl:w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-110 hover:-rotate-6 cursor-pointer"
            >
              <MessageCircle className="!h-5 !w-5 sm:!h-6 sm:!w-6" strokeWidth={2.5} />
            </Button>

            {/* Online indicator dot */}
            <span
              aria-hidden
              className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-success animate-ping"
            />
            <span
              aria-hidden
              className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background"
            />
          </div>
        </div>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="fixed z-[60] chat-shadow animate-slide-up overflow-hidden flex flex-col rounded-xl bg-card shadow-2xl shadow-primary/10 border border-border
            top-3 right-3 bottom-3 left-3
            sm:top-auto sm:left-auto sm:bottom-6 sm:right-6
            sm:w-[420px] sm:h-[640px] sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 flex items-center justify-between border-b border-primary/15 bg-primary">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="text-primary-foreground font-semibold text-sm sm:text-base tracking-wide">
                  {env.appName} Assistant
                </h3>
                <p className="text-primary-foreground/70 text-[11px] sm:text-xs truncate">
                  Online • Typically replies instantly
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground rounded-full cursor-pointer bg-primary-foreground/10 border border-primary-foreground/15 hover:bg-primary-foreground/20 hover:text-primary-foreground shrink-0 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 sm:space-y-4 bg-background">
            {/* Welcome state with default questions */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="bg-muted border border-border rounded-xl p-4 max-w-[85%]">
                  <p className="text-sm text-foreground">
                    👋 Hi! I&apos;m your assistant for{' '}
                    <span className="font-semibold text-primary">{env.appName}</span>. How can I
                    help you today?
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-1">Quick questions:</p>
                  {DEFAULT_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      className="block w-full text-left bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-xl p-3 text-sm text-foreground transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] cursor-pointer"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-fade-in',
                  message.sender === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    message.sender === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-primary p-3.5 text-primary-foreground shadow-sm shadow-primary/20'
                      : 'w-full max-w-full rounded-2xl rounded-bl-sm border border-border/70 bg-card px-3.5 py-3 text-foreground shadow-sm',
                  )}
                >
                  {message.sender === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="ai-markdown min-w-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                      {message.streaming && (
                        <span className="ml-0.5 inline-block h-3.5 w-1.5 align-[-2px] animate-pulse rounded-[1px] bg-primary" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between mt-1.5">
                    <p
                      className={cn(
                        'text-xs',
                        message.sender === 'user'
                          ? 'text-primary-foreground/60'
                          : 'text-muted-foreground',
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {message.sender === 'ai' && (
                      <span className="text-xs text-primary/70">{env.appName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted border border-border rounded-2xl rounded-bl-sm p-3 max-w-[85%] flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-border bg-card">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-input focus-visible:ring-ring !text-foreground !bg-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-0 text-sm"
                disabled={isThinking}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isThinking}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 shrink-0 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-40 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
