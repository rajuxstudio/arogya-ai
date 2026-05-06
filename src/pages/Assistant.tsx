import { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Brain, Plus, Send, Sparkles, Trash2, Search, MessageSquare } from "lucide-react";
import {
  Conversation,
  generateAiReply,
  loadConversations,
  newConversation,
  saveConversations,
} from "@/lib/chatStore";

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const Assistant = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all = loadConversations();
    setConversations(all);
    setActiveId(all[0]?.id ?? null);
  }, []);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const persist = (next: Conversation[]) => {
    setConversations(next);
    saveConversations(next);
  };

  const startNew = () => {
    const c = newConversation();
    persist([c, ...conversations]);
    setActiveId(c.id);
  };

  const removeConv = (id: string) => {
    const next = conversations.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const send = () => {
    if (!input.trim() || !active) return;
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, text: input, ts: Date.now() };
    const updated: Conversation = {
      ...active,
      title: active.messages.length <= 1 ? input.slice(0, 40) : active.title,
      messages: [...active.messages, userMsg],
      updatedAt: Date.now(),
    };
    const nextList = [updated, ...conversations.filter((c) => c.id !== updated.id)];
    persist(nextList);
    setInput("");

    setTimeout(() => {
      const aiMsg = { id: crypto.randomUUID(), role: "ai" as const, text: generateAiReply(userMsg.text), ts: Date.now() };
      const withAi: Conversation = { ...updated, messages: [...updated.messages, aiMsg], updatedAt: Date.now() };
      persist([withAi, ...nextList.filter((c) => c.id !== withAi.id)]);
    }, 700);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.messages.some((m) => m.text.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col">
        <TopBar
          title={<>AI <span className="text-gradient">Assistant</span></>}
          subtitle="All your conversations with the AI Health Assistant."
        />

        <div className="flex-1 grid grid-cols-12 gap-5 min-h-[70vh]">
          {/* History sidebar */}
          <aside className="order-2 col-span-12 lg:col-span-4 xl:col-span-3 glass-card rounded-3xl p-4 flex flex-col">
            <button
              onClick={startNew}
              className="w-full h-10 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[var(--shadow-glow)]"
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>

            <div className="relative mt-3">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search history…"
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-secondary/70 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-4 mb-2 px-1">
              History
            </p>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No conversations</p>
              )}
              {filtered.map((c) => {
                const isActive = c.id === activeId;
                const last = c.messages[c.messages.length - 1];
                return (
                  <div
                    key={c.id}
                    className={`group rounded-xl p-3 cursor-pointer transition-colors ${
                      isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/70"
                    }`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-primary" : ""}`}>{c.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(c.updatedAt)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{last?.text}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeConv(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Chat panel */}
          <section className="order-1 col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col overflow-hidden bg-card border border-border/60 rounded-3xl p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between px-1 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center shadow-[var(--shadow-glow)]">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold">{active?.title ?? "Start a new chat"}</h3>
                  <p className="text-[11px] text-success flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> AI Assistant Online
                  </p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto py-2 space-y-3">
              {!active && (
                <div className="h-full grid place-items-center text-center text-muted-foreground">
                  <div>
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a conversation or start a new chat</p>
                  </div>
                </div>
              )}
              {active?.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                    <p className={`text-[10px] mt-1 opacity-70 ${m.role === "user" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {formatDate(m.ts)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/50 mt-2">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={!active}
                  type="text"
                  placeholder={active ? "Type your message…" : "Start a new chat to begin"}
                  className="w-full h-12 pl-4 pr-14 rounded-2xl bg-secondary/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                />
                <button
                  onClick={send}
                  disabled={!active || !input.trim()}
                  className="absolute right-2 top-2 h-8 w-8 rounded-xl gradient-primary grid place-items-center text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Assistant;
