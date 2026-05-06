import { Dumbbell, Flower2, Apple, Moon, Droplet, Footprints } from "lucide-react";

const habits = [
  {
    icon: Dumbbell,
    title: "Strength Training",
    detail: "3x / week · 30 min",
    tag: "Gym",
    reason: "Boosts metabolism & bone density",
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: Flower2,
    title: "Morning Yoga",
    detail: "Daily · 15 min",
    tag: "Yoga",
    reason: "Improves flexibility & lowers stress",
    color: "from-purple-500/20 to-pink-500/10",
  },
  {
    icon: Footprints,
    title: "10k Steps Walk",
    detail: "Daily · evening",
    tag: "Cardio",
    reason: "Supports heart health",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: Apple,
    title: "Balanced Meals",
    detail: "3 meals + 1 snack",
    tag: "Diet",
    reason: "More protein, less processed sugar",
    color: "from-orange-500/20 to-amber-500/10",
  },
  {
    icon: Droplet,
    title: "Hydration",
    detail: "2.5L water / day",
    tag: "Wellness",
    reason: "Improves focus & skin",
    color: "from-sky-500/20 to-blue-500/10",
  },
  {
    icon: Moon,
    title: "Sleep Routine",
    detail: "7-8 hrs · 11pm-6am",
    tag: "Recovery",
    reason: "Critical for immunity & mood",
    color: "from-indigo-500/20 to-violet-500/10",
  },
];

export const HealthyHabits = () => (
  <div className="glass-card rounded-3xl p-5 animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-display font-bold text-sm">Healthy Habits</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">AI-curated for your profile</p>
      </div>
      <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">Personalised</span>
    </div>
    <div className="space-y-2.5">
      {habits.map((h) => (
        <div
          key={h.title}
          className={`p-3 rounded-2xl bg-gradient-to-r ${h.color} hover:scale-[1.01] transition-transform cursor-pointer`}
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-background/60 grid place-items-center shrink-0">
              <h.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold truncate">{h.title}</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-background/70 text-foreground font-bold uppercase tracking-wider shrink-0">
                  {h.tag}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{h.detail}</p>
              <p className="text-[10px] text-foreground/70 mt-1 italic">{h.reason}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
