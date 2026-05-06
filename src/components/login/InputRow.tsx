import type { ReactNode } from "react";

export function InputRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all duration-200 hover:border-slate-300 focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-[#1d4ed8]/15">
      <span className="text-slate-400 transition-colors group-focus-within:text-[#1d4ed8]">{icon}</span>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(29,78,216,0.7)] transition-all hover:from-[#1e40af] hover:to-[#1d4ed8] hover:shadow-[0_18px_40px_-12px_rgba(29,78,216,0.85)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
      {message}
    </p>
  );
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
      {message}
    </p>
  );
}