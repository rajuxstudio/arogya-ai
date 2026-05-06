import type { ReactNode } from "react";
import { FeatureCarousel } from "./FeatureCarousel";
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
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-slate-900">
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-[38.2%] lg:px-14">
          <div className="relative w-full max-w-[420px]">
            <div className="mb-8 flex flex-col items-start">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#38bdf8] shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)]">
                  <img src={logo} alt="ArogyaAI" className="h-7 w-7 object-contain brightness-0 invert" />
                </div>
                <span className="text-base font-semibold tracking-tight text-slate-900">ArogyaAI</span>
              </div>
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900">{title}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>
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