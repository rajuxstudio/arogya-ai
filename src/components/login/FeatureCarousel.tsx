import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import slideDashboard from "@/assets/login/slide-dashboard.png";
import slideAssistant from "@/assets/login/slide-assistant.png";
import slideBodyscan from "@/assets/login/slide-bodyscan.png";

const SLIDES = [
  {
    image: slideBodyscan,
    title: "AI Body Scan & Vitals",
    description:
      "Visualize your full-body health in real time — heart rate, oxygen, blood pressure and AI-powered organ insights, all in one immersive scan.",
    accent: "from-sky-500/30 to-blue-600/20",
  },
  {
    image: slideAssistant,
    title: "Your AI Health Companion",
    description:
      "Ask questions, upload reports, and receive instant summaries, risk analysis, and smart suggestions powered by AI.",
    accent: "from-blue-500/30 to-indigo-600/20",
  },
  {
    image: slideDashboard,
    title: "Smart Health Dashboard",
    description:
      "Track appointments, medications, hospital visits and reports — beautifully organized with a smart calendar and timeline view.",
    accent: "from-cyan-500/30 to-blue-600/20",
  },
];

export function FeatureCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const go = (dir: number) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[index];

  return (
    <div
      className="relative flex h-full w-full max-w-[860px] flex-col items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setMouse({ x: 0, y: 0 });
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        });
      }}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#38bdf8]/40 via-[#1d4ed8]/25 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-[360px] w-[360px] rounded-full border border-white/10" />

      <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/85 backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-sky-300" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">ArogyaAI · AI Health</span>
      </div>

      <div className="relative z-10 flex h-[480px] w-full items-center justify-center">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              i === index
                ? "opacity-100 scale-100 translate-x-0"
                : i < index
                  ? "opacity-0 scale-[0.96] -translate-x-12"
                  : "opacity-0 scale-[0.96] translate-x-12"
            }`}
          >
            <div className={`absolute inset-10 rounded-[2.5rem] bg-gradient-to-br ${s.accent} blur-3xl`} />
            <img
              src={s.image}
              alt={s.title}
              className="relative h-[420px] w-[680px] max-h-[420px] max-w-full object-contain drop-shadow-[0_40px_70px_rgba(8,20,60,0.55)] transition-transform duration-500 ease-out"
              style={{
                transform:
                  i === index ? `translate3d(${mouse.x * 12}px, ${mouse.y * 12}px, 0) scale(1)` : undefined,
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-8 max-w-[520px] text-center text-white">
        <div key={index} className="animate-[fadeUp_0.6s_ease-out]">
          <h2 className="text-[28px] font-bold leading-tight tracking-tight">{slide.title}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70">{slide.description}</p>
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>

      <div className="relative z-10 mt-8 flex w-full max-w-[520px] items-center justify-between">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-white" : "w-3 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}