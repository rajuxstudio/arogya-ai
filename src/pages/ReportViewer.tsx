import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight,
  Send, Sparkles, FileText, Activity, AlertTriangle, CheckCircle2, Bot,
} from "lucide-react";
import { getReport, MedicalReport, riskColor, formatDate } from "@/lib/reportStore";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: number;
}

const buildSummaryMessage = (r: MedicalReport): string => {
  const findings = r.findings.map((f) => `• **${f.label}**: ${f.value} (${f.status})`).join("\n");
  const suggestions = r.suggestions.map((s) => `• ${s}`).join("\n");
  return `**Report Summary**\n${r.summary}\n\n**Key Findings**\n${findings}\n\n**Risk Level**: ${r.risk.toUpperCase()}\n\n**Suggestions**\n${suggestions}`;
};

const QUICK_ACTIONS = [
  "Summarize Report",
  "Explain Risks",
  "Suggest Diet",
  "Is this serious?",
];

const ReportViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<MedicalReport | undefined>();
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 3;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const r = getReport(id);
    setReport(r);
    if (r) {
      setMessages([{
        id: "m-init",
        role: "ai",
        text: buildSummaryMessage(r),
        ts: Date.now(),
      }]);
    }
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim() || !report) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes("summari")) reply = report.summary;
      else if (lower.includes("risk") || lower.includes("serious")) {
        reply = `Based on the ${report.type.toLowerCase()}, the overall risk is **${report.risk.toUpperCase()}**. ${
          report.risk === "high"
            ? "I recommend consulting a specialist promptly."
            : report.risk === "medium"
            ? "Lifestyle changes and a follow-up in 2–3 weeks are advised."
            : "No immediate concerns — maintain your current routine."
        }`;
      } else if (lower.includes("diet") || lower.includes("food")) {
        reply = `Recommended diet:\n${report.suggestions.map((s) => `• ${s}`).join("\n")}`;
      } else {
        reply = `Looking at your ${report.type}: ${report.summary} Let me know if you'd like specifics on any finding.`;
      }
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "ai", text: reply, ts: Date.now() }]);
      setThinking(false);
    }, 900);
  };

  const findingsHighlights = useMemo(
    () => report?.findings.filter((f) => f.status !== "normal") ?? [],
    [report]
  );

  if (!report) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Report not found.</p>
          <Link to="/files" className="text-primary text-sm font-semibold">← Back to File Manager</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(215_40%_8%)] text-[hsl(210_40%_96%)]">
      {/* Top bar */}
      <header className="h-14 px-5 flex items-center justify-between border-b border-white/10 backdrop-blur-xl bg-[hsl(215_40%_6%/0.7)] sticky top-0 z-10">
        <Link
          to="/files"
          className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Files
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg gradient-primary grid place-items-center">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">{report.name}</p>
            <p className="text-[10px] text-white/60 mt-0.5">{report.type} • {formatDate(report.uploadedAt)}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskColor(report.risk)}`}>
          {report.risk === "high" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
          {report.risk} risk
        </span>
      </header>

      {/* Split layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Viewer */}
        <section className="lg:w-[65%] flex flex-col border-r border-white/10">
          {/* Controls */}
          <div className="h-12 px-4 flex items-center justify-between bg-white/[0.02] border-b border-white/10">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-lg grid place-items-center hover:bg-white/10 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold px-2">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 rounded-lg grid place-items-center hover:bg-white/10 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="h-8 w-8 rounded-lg grid place-items-center hover:bg-white/10 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold px-2 min-w-[48px] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="h-8 w-8 rounded-lg grid place-items-center hover:bg-white/10 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-2" />
              <button
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Document canvas */}
          <div className="flex-1 overflow-auto p-8 bg-[hsl(215_40%_5%)]">
            <div
              className="bg-white text-slate-900 rounded-lg shadow-2xl mx-auto p-10 transition-transform origin-top"
              style={{ width: "min(100%, 720px)", transform: `scale(${zoom / 100})` }}
            >
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-6">
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-900">{report.type} Report</h1>
                  <p className="text-xs text-slate-500 mt-1">Patient: Aarav Sharma • DOB: 15-Jun-2002</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Date</p>
                  <p className="text-sm font-semibold">{formatDate(report.uploadedAt)}</p>
                </div>
              </div>

              <h2 className="font-display text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Clinical Summary</h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">{report.summary}</p>

              <h2 className="font-display text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Test Results</h2>
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-6">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Parameter</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Value</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.findings.map((f) => (
                    <tr key={f.label} className="border-t border-slate-100">
                      <td className="p-3 text-slate-700">{f.label}</td>
                      <td className={`p-3 font-semibold ${
                        f.status === "high" ? "bg-red-50 text-red-700" :
                        f.status === "low" ? "bg-amber-50 text-amber-700" :
                        "text-slate-900"
                      }`}>{f.value}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          f.status === "high" ? "bg-red-100 text-red-700" :
                          f.status === "low" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2 className="font-display text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Recommendations</h2>
              <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>

              <p className="text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-200">
                Page {page} of {totalPages} — Generated by ArogyaAI
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: AI Chat */}
        <aside className="lg:w-[35%] flex flex-col bg-[hsl(215_40%_7%)]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-[hsl(215_40%_7%)] glow-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm">AI Health Assistant</p>
              <p className="text-[10px] text-success flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Active • Analyzing report
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          {/* Highlights chip strip */}
          {findingsHighlights.length > 0 && (
            <div className="px-5 py-3 border-b border-white/10 flex flex-wrap gap-1.5 bg-white/[0.02]">
              {findingsHighlights.map((f) => (
                <span
                  key={f.label}
                  className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                    f.status === "high" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
                  }`}
                >
                  {f.label} {f.status === "high" ? "↑" : "↓"}
                </span>
              ))}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                    m.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-white/5 border border-white/10 rounded-bl-sm"
                  }`}
                >
                  {m.text.split("**").map((chunk, i) =>
                    i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-5 pt-3 pb-2 flex flex-wrap gap-1.5 border-t border-white/10">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a}
                onClick={() => send(a)}
                disabled={thinking}
                className="text-[11px] px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-primary/15 hover:border-primary/40 hover:text-primary transition-colors font-medium disabled:opacity-50"
              >
                {a}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="px-5 py-4 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your report..."
              className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)] hover:opacity-90 transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default ReportViewer;
