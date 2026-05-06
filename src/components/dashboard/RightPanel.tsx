import { AlertCircle, CheckCircle2 } from "lucide-react";
import { HealthyHabits } from "./HealthyHabits";

const insights = [
  {
    severity: "Mild",
    title: "Possible Vitamin D Deficiency",
    advice: "Increase sun exposure & consider supplements.",
    color: "warning",
  },
  {
    severity: "Normal",
    title: "Cardiovascular Health Stable",
    advice: "Maintain current exercise routine.",
    color: "success",
  },
];

export const RightPanel = () => (
  <div className="flex flex-col gap-5 h-full">
    {/* AI Insights */}
    <div className="glass-card rounded-3xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm">AI Insights</h3>
        <span className="text-[10px] text-muted-foreground">Updated 2m ago</span>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins) => (
          <div key={ins.title} className="p-3 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer group">
            <div className="flex items-start gap-2.5">
              {ins.color === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{ins.title}</p>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      ins.color === "success" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}
                  >
                    {ins.severity}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{ins.advice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Healthy Habits */}
    <HealthyHabits />
  </div>
);
