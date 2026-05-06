import { useEffect, useState } from "react";
import { Loader2, Lock, Mail, X } from "lucide-react";
import { InputRow, PrimaryButton, ErrorBanner, SuccessBanner } from "./InputRow";
import { GoogleButton } from "./GoogleButton";
import { DEMO_ACCOUNTS, demoLogin, forgetAccount, getRememberedAccounts, signInWithPassword } from "@/lib/auth";
import { signInSchema } from "@/lib/auth-schemas";
import { lovable } from "@/integrations/lovable";

export function SignInForm({
  initialEmail,
  successMessage,
  onSuccess,
  onSwitchToSignup,
  onForgotPassword,
}: {
  initialEmail?: string;
  successMessage?: string;
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remembered, setRemembered] = useState<string[]>(() => getRememberedAccounts());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const res = await signInWithPassword(parsed.data.email, parsed.data.password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    onSuccess();
  }

  async function quickLogin(emailVal: string, passwordVal: string) {
    setError(null);
    setSubmitting(true);
    const res = await signInWithPassword(emailVal, passwordVal);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    onSuccess();
  }

  async function handleDemoLogin(email: string) {
    setError(null);
    setSubmitting(true);

    const result = await demoLogin(email);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSuccess();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error.message ?? "Could not sign in.");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <InputRow icon={<Mail className="h-4 w-4" />}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="email"
            required
          />
        </InputRow>
        <InputRow icon={<Lock className="h-4 w-4" />}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="current-password"
            required
          />
        </InputRow>

        <div className="flex items-center justify-end pt-0.5">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-medium text-[#1d4ed8] transition-colors hover:text-[#0b3bb0] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </PrimaryButton>
      </form>

      {/* Recently used on this device */}
      {remembered.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recently used on this device
          </p>
          <div className="flex flex-wrap gap-2">
            {remembered.map((e) => (
              <span
                key={e}
                className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 text-xs text-slate-700"
              >
                <button
                  type="button"
                  onClick={() => setEmail(e)}
                  className="hover:text-[#1d4ed8]"
                >
                  {e}
                </button>
                <button
                  type="button"
                  aria-label={`Forget ${e}`}
                  onClick={() => {
                    forgetAccount(e);
                    setRemembered(getRememberedAccounts());
                  }}
                  className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="my-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        or continue with
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={submitting} />

      {/* Demo accounts */}
      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Quick demo login
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin(a.email)}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition hover:border-[#1d4ed8]/40 hover:bg-[#1d4ed8]/5 disabled:opacity-60"
            >
              <span className="font-medium">{a.label}</span>
              <span className="text-[10px] text-slate-400">{a.email}</span>
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner message={error} />

      <p className="mt-7 text-center text-sm text-slate-500">
        New to ArogyaAI?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-[#1d4ed8] hover:underline"
        >
          Create an account
        </button>
      </p>
    </>
  );
}