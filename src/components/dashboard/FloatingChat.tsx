import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Brain, Maximize2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Conversation,
  generateAiReply,
  loadConversations,
  newConversation,
  saveConversations,
} from "@/lib/chatStore";

export const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all = loadConversations();
    setConv(all[0] ?? newConversation());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conv?.messages.length, open]);

  const send = () => {
    if (!input.trim() || !conv) return;
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, text: input, ts: Date.now() };
    const updated: Conversation = {
      ...conv,
      title: conv.messages.length <= 1 ? input.slice(0, 40) : conv.title,
      messages: [...conv.messages, userMsg],
      updatedAt: Date.now(),
    };
    setConv(updated);
    setInput("");

    setTimeout(() => {
      const aiMsg = { id: crypto.randomUUID(), role: "ai" as const, text: generateAiReply(userMsg.text), ts: Date.now() };
      const withAi: Conversation = { ...updated, messages: [...updated.messages, aiMsg], updatedAt: Date.now() };
      setConv(withAi);
      const all = loadConversations().filter((c) => c.id !== withAi.id);
      saveConversations([withAi, ...all]);
    }, 700);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-primary text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)] hover:scale-110 transition-transform glow-pulse"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && conv && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] glass-card rounded-3xl flex flex-col animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center shadow-[var(--shadow-glow)]">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">AI Health Assistant</h3>
                <p className="text-[10px] text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/assistant"
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Open full view"
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {conv.messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border/50">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                type="text"
                placeholder="Describe your symptoms…"
                className="w-full h-10 pl-3.5 pr-11 rounded-xl bg-secondary/70 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={send}
                className="absolute right-1.5 top-1.5 h-7 w-7 rounded-lg gradient-primary grid place-items-center text-primary-foreground hover:scale-105 transition-transform"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 justify-center">
              <Sparkles className="h-3 w-3 text-primary" /> Powered by ArogyaAI
            </p>
          </div>
        </div>
      )}
    </>
  );
};
