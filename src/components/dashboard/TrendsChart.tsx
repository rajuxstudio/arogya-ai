const days = ["M", "T", "W", "T", "F", "S", "S"];
const heart = [68, 72, 70, 75, 73, 71, 72];
const oxygen = [97, 98, 96, 99, 98, 98, 98];

export const TrendsChart = () => {
  const max = 100;
  const buildPath = (data: number[]) => {
    const w = 100, h = 100;
    const step = w / (data.length - 1);
    return data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step},${h - (v / max) * h}`)
      .join(" ");
  };

  return (
    <div className="glass-card rounded-3xl p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base">Health Trends</h3>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </div>
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Heart Rate</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Oxygen</span>
        </div>
      </div>

      <div className="relative h-40">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="heartGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.2" />
          ))}
          <path d={`${buildPath(heart)} L 100,100 L 0,100 Z`} fill="url(#heartGrad)" />
          <path d={buildPath(heart)} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={buildPath(oxygen)} fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2,1.5" vectorEffect="non-scaling-stroke" />
          {heart.map((v, i) => (
            <circle key={i} cx={(i / (heart.length - 1)) * 100} cy={100 - (v / max) * 100} r="1.2" fill="hsl(var(--primary))" />
          ))}
        </svg>
      </div>

      <div className="flex justify-between mt-2 px-1">
        {days.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground font-medium">{d}</span>
        ))}
      </div>
    </div>
  );
};
