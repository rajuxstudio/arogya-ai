import { useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { FeatureCarousel } from "./FeatureCarousel";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import logo from "@/assets/logo.png";


/**
 * Two-column auth layout used by login / signup / forgot-password screens.
 * Form lives on the left (~38%); illustrations on the right (~62%).
 */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme());

  useEffect(() => {
    const handler = (e: Event) => setTheme((e as CustomEvent).detail as Theme);
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-white/90 text-slate-900 shadow-sm transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 dark:bg-slate-900 lg:w-[38.2%] lg:px-14">
          <div className="relative w-full max-w-[420px]">
            <div className="mb-8 flex flex-col items-start">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#38bdf8] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)]">
                  <img src={logo} alt="ArogyaAI" className="h-7 w-7 object-contain brightness-0 invert" />
                </div>
                <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">ArogyaAI</span>
              </div>
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">{title}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500 dark:text-slate-300">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

        <div className="relative hidden w-[61.8%] items-center justify-center overflow-hidden bg-[#0a1738] px-10 py-12 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1d4ed8_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_#0c4a6e_0%,_transparent_50%),linear-gradient(135deg,#0a1738_0%,#0b1e4d_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <FeatureCarousel />
        </div>
      </div>
    </div>
  );
}