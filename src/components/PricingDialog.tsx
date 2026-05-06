import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Sparkles, X, Zap, Crown } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  name: string;
  price: string;
  period: string;
  highlight?: boolean;
  icon: typeof Sparkles;
  features: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Sparkles,
    features: ["Basic AI insights", "5 reports / month", "Calendar reminders", "Community support"],
    cta: "Current plan",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    highlight: true,
    icon: Zap,
    features: ["Advanced AI analysis", "Unlimited reports", "Personalized habits", "Priority chat support", "Health trends export"],
    cta: "Upgrade to Pro",
  },
  {
    name: "Family",
    price: "₹999",
    period: "per month",
    icon: Crown,
    features: ["Everything in Pro", "Up to 5 members", "Shared calendar", "Doctor consultations", "Dedicated success manager"],
    cta: "Choose Family",
  },
];

export const PricingDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  if (!open) return null;

  const handleSelect = (plan: Plan) => {
    if (plan.name === "Free") {
      toast.info("You're already on the Free plan");
      return;
    }
    toast.success(`${plan.name} plan selected`, {
      description: "Payment integration coming soon.",
    });
    onOpenChange(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-5xl bg-card border border-border/60 rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-[var(--shadow-elevated)] my-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 h-9 w-9 rounded-full grid place-items-center hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold">
            Upgrade your <span className="text-gradient">health journey</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Choose the plan that fits you. Cancel anytime.</p>

          <div className="mt-5 inline-flex p-1 rounded-full bg-secondary border border-border/50">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  billing === b ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                }`}
              >
                {b} {b === "yearly" && <span className="ml-1 text-[10px] opacity-80">-20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => {
            const Icon = p.icon;
            const yearly = p.price !== "₹0" && billing === "yearly";
            const display = yearly ? `₹${Math.round(parseInt(p.price.replace("₹", "")) * 12 * 0.8)}` : p.price;
            return (
              <div
                key={p.name}
                className={`relative rounded-2xl p-6 border ${
                  p.highlight
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                    : "border-border/60 bg-secondary/30"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full gradient-primary text-primary-foreground uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center mb-4">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-xl">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{display}</span>
                  <span className="text-xs text-muted-foreground">/ {yearly ? "year" : p.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelect(p)}
                  className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    p.highlight
                      ? "gradient-primary text-primary-foreground hover:opacity-90"
                      : "bg-secondary border border-border hover:bg-secondary/80"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Secure payments · 7-day money back · Trusted by 10,000+ users
        </p>
      </div>
    </div>,
    document.body
  );
};
