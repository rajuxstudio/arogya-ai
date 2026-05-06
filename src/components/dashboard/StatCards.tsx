import { Heart, Activity, Droplet, TrendingUp } from "lucide-react";

const stats = [
  { icon: Heart, label: "Heart Rate", value: "72", unit: "bpm", trend: "+2%", color: "from-rose-500 to-pink-500", iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
  { icon: Activity, label: "Blood Pressure", value: "120/80", unit: "mmHg", trend: "Stable", color: "from-cyan-500 to-blue-500", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: Droplet, label: "Oxygen", value: "98", unit: "% SpO₂", trend: "+1%", color: "from-teal-500 to-cyan-500", iconBg: "bg-accent/10", iconColor: "text-accent" },
];

export const StatCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
    {stats.map((s, i) => (
      <div
        key={s.label}
        className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all hover:shadow-[var(--shadow-elevated)] group"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`h-10 w-10 rounded-xl ${s.iconBg} grid place-items-center`}>
            <s.icon className={`h-5 w-5 ${s.iconColor}`} />
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
            <TrendingUp className="h-3 w-3" /> {s.trend}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="font-display text-3xl font-bold">{s.value}</p>
          <p className="text-xs text-muted-foreground font-medium">{s.unit}</p>
        </div>
        {/* Mini sparkline */}
        <svg viewBox="0 0 100 24" className="w-full h-6 mt-3">
          <path
            d="M0,18 L15,12 L30,15 L45,8 L60,11 L75,5 L100,9"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0,18 L15,12 L30,15 L45,8 L60,11 L75,5 L100,9 L100,24 L0,24 Z"
            fill="hsl(var(--primary) / 0.1)"
          />
        </svg>
      </div>
    ))}
  </div>
);
