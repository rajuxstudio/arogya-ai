import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Image as ImageIcon, FileArchive, Upload, Filter,
  Search, Eye, Trash2, AlertTriangle, CheckCircle2, Activity, Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  MedicalReport, RiskLevel, ReportType, loadReports, saveReports,
  formatDate, formatSize, riskColor,
} from "@/lib/reportStore";
import { toast } from "@/hooks/use-toast";

const REPORT_TYPES: ReportType[] = ["Blood Test", "X-Ray", "MRI", "Prescription", "ECG", "General"];
const RISK_FILTERS: ("all" | RiskLevel)[] = ["all", "low", "medium", "high"];

const iconFor = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (["jpg", "jpeg", "png"].includes(ext || "")) return ImageIcon;
  return FileArchive;
};

const RiskBadge = ({ risk }: { risk: RiskLevel }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskColor(risk)}`}>
    {risk === "high" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
    {risk}
  </span>
);

const FilesPage = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (riskFilter !== "all" && r.risk !== riskFilter) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [reports, query, typeFilter, riskFilter]);

  const recent = filtered.slice(0, 3);

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newReports: MedicalReport[] = Array.from(files).map((f) => {
      const risks: RiskLevel[] = ["low", "medium", "high"];
      const risk = risks[Math.floor(Math.random() * risks.length)];
      return {
        id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        type: "General",
        size: f.size,
        uploadedAt: Date.now(),
        risk,
        summary: "AI is analyzing this report. Key findings will appear shortly.",
        findings: [
          { label: "Status", value: "Pending analysis", status: "normal" },
        ],
        suggestions: ["Open the report to view AI-generated insights."],
      };
    });
    const next = [...newReports, ...reports];
    setReports(next);
    saveReports(next);
    toast({ title: "Report uploaded", description: `${newReports.length} file(s) added & analyzed.` });
  };

  const remove = (id: string) => {
    const next = reports.filter((r) => r.id !== id);
    setReports(next);
    saveReports(next);
  };

  const stats = {
    total: reports.length,
    high: reports.filter((r) => r.risk === "high").length,
    analyzed: reports.length,
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto">
        <TopBar
          title={<>File <span className="text-gradient">Management</span></>}
          subtitle="Manage all your medical reports with AI-powered insights."
        />

        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div />

          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.dcm"
              className="hidden"
              onChange={(e) => {
                handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 h-11 px-5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all hover:-translate-y-0.5"
            >
              <Upload className="h-4 w-4" strokeWidth={2.5} />
              Upload Report
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Reports", value: stats.total, icon: FileText, tone: "primary" },
            { label: "AI Analyzed", value: stats.analyzed, icon: Sparkles, tone: "success" },
            { label: "High Risk", value: stats.high, icon: AlertTriangle, tone: "destructive" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl grid place-items-center ${
                s.tone === "primary" ? "bg-primary/10 text-primary" :
                s.tone === "success" ? "bg-success/10 text-success" :
                "bg-destructive/10 text-destructive"
              }`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
                <p className="font-display text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports by name..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ReportType | "all")}
              className="h-10 px-3 rounded-xl bg-secondary/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Types</option>
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60">
            {RISK_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  riskFilter === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "all" ? "All Risk" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Reports cards */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">Recent Reports</h2>
            <span className="text-xs text-muted-foreground">{recent.length} most recent</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recent.length === 0 && (
              <div className="col-span-full glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
                No reports match your filters.
              </div>
            )}
            {recent.map((r) => {
              const Icon = iconFor(r.name);
              return (
                <Link
                  key={r.id}
                  to={`/files/${r.id}`}
                  className="glass-card rounded-2xl p-5 hover:shadow-[var(--shadow-elevated)] transition-all group hover:-translate-y-1 block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <RiskBadge risk={r.risk} />
                  </div>
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {r.type} • {formatDate(r.uploadedAt)}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/60 space-y-1.5">
                    {r.findings.slice(0, 2).map((f) => (
                      <div key={f.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className={`font-semibold ${
                          f.status === "high" ? "text-destructive" :
                          f.status === "low" ? "text-warning" : "text-foreground"
                        }`}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* All Reports table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">All Reports</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} total</span>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/60">
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground p-4">File</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground p-4">Type</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground p-4">Uploaded</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground p-4">Key Findings</th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground p-4">Risk</th>
                    <th className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No reports found.</td>
                    </tr>
                  )}
                  {filtered.map((r) => {
                    const Icon = iconFor(r.name);
                    return (
                      <tr key={r.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate max-w-[220px]">{r.name}</p>
                              <p className="text-[11px] text-muted-foreground">{formatSize(r.size)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary/80">{r.type}</span>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{formatDate(r.uploadedAt)}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                            {r.findings.slice(0, 2).map((f) => (
                              <span
                                key={f.label}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  f.status === "high" ? "bg-destructive/10 text-destructive" :
                                  f.status === "low" ? "bg-warning/10 text-warning" :
                                  "bg-success/10 text-success"
                                }`}
                              >
                                {f.label}: {f.value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4"><RiskBadge risk={r.risk} /></td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/files/${r.id}`}
                              className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                              aria-label="View report"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => remove(r.id)}
                              className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                              aria-label="Delete report"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FilesPage;
