import { LayoutDashboard, Bot, FolderKanban, Calendar, UserCog, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { PricingDialog } from "@/components/PricingDialog";

const items = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { title: "AI Assistant", icon: Bot, to: "/assistant" },
  { title: "File Management", icon: FolderKanban, to: "/files" },
  { title: "Calendar", icon: Calendar, to: "/calendar" },
  { title: "User Settings", icon: UserCog, to: "/settings" },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const [pricingOpen, setPricingOpen] = useState(false);
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 p-5 flex flex-col gap-8 glass-panel border-r border-border/50">
      <div className="flex items-center gap-3">
        <img src={logo} alt="ArogyaAI" className="h-10 w-10 rounded-xl" />
        <div>
          <h1 className="font-display font-bold text-lg leading-none">ArogyaAI</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Smart Health</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-1">Menu</p>
        {items.map((item) => {
          const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.title}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-[var(--transition-smooth)] group relative ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:translate-x-1"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-primary" />
              )}
              <span
                className={`grid place-items-center h-9 w-9 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/60 group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </span>
              <span className={`flex-1 text-left ${isActive ? "font-semibold" : ""}`}>{item.title}</span>
              {isActive && (
                <span className="h-2 w-2 rounded-full bg-primary glow-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 rounded-2xl glass-card text-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative">
          <div className="h-10 w-10 mx-auto rounded-full gradient-primary grid place-items-center mb-2 shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="text-xs font-semibold">Upgrade to Pro</p>
          <p className="text-[10px] text-muted-foreground mt-1">Unlock advanced AI insights</p>
          <button onClick={() => setPricingOpen(true)} className="mt-3 w-full text-xs gradient-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Upgrade
          </button>
        </div>
      </div>
      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
    </aside>
  );
};
