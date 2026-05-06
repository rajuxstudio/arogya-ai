import anatomy from "@/assets/anatomy.png";
import { Heart, Wind, Droplet } from "lucide-react";

const indicators = [
  { icon: Heart, label: "Heart", value: "72 bpm", status: "Normal", top: "30%", left: "62%", color: "text-destructive" },
  { icon: Wind, label: "Lungs", value: "98% O₂", status: "Healthy", top: "32%", left: "12%", color: "text-primary" },
  { icon: Droplet, label: "Blood", value: "120/80", status: "Optimal", top: "55%", left: "68%", color: "text-accent" },
];

export const AnatomyView = () => (
  <div className="glass-card rounded-3xl p-6 relative overflow-hidden h-full animate-scale-in">
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Body Scan</p>
        <h2 className="font-display text-2xl font-bold mt-1">Live Health Map</h2>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        Scanning
      </div>
    </div>

    <div className="relative flex items-center justify-center h-[520px]">
      {/* Glow background */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="h-[420px] w-[420px] rounded-full" style={{ background: "var(--gradient-anatomy)" }} />
      </div>

      {/* Concentric rings */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="h-[480px] w-[480px] rounded-full border border-primary/15" />
        <div className="absolute h-[360px] w-[360px] rounded-full border border-primary/10" />
        <div className="absolute h-[240px] w-[240px] rounded-full border border-primary/10" />
      </div>

      <img
        src={anatomy}
        alt="Interactive human anatomy visualization"
        width={768}
        height={1280}
        className="relative h-full w-auto object-contain float-slow drop-shadow-[0_10px_40px_hsl(var(--primary)/0.4)]"
      />

      {/* Floating indicators */}
      {indicators.map((ind) => (
        <div
          key={ind.label}
          className="absolute group cursor-pointer"
          style={{ top: ind.top, left: ind.left }}
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping-slow" />
            <div className="relative h-3 w-3 rounded-full gradient-primary ring-4 ring-background shadow-[var(--shadow-glow)]" />
          </div>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 glass-card rounded-xl px-3 py-2 min-w-[120px] opacity-100 transition-all">
            <div className="flex items-center gap-2">
              <ind.icon className={`h-3.5 w-3.5 ${ind.color}`} />
              <p className="text-[11px] font-semibold">{ind.label}</p>
            </div>
            <p className="text-sm font-bold mt-0.5">{ind.value}</p>
            <p className="text-[10px] text-success">{ind.status}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-3 mt-4">
      {[
        { label: "Health Score", value: "92", suffix: "/100" },
        { label: "Risk Level", value: "Low", suffix: "" },
        { label: "Last Scan", value: "2m", suffix: " ago" },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl bg-secondary/60 backdrop-blur p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
          <p className="font-display text-xl font-bold mt-1">
            {s.value}<span className="text-xs text-muted-foreground font-medium">{s.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  </div>
);
