import { useState } from "react";
import { CheckCircle2, Loader2, Lock, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { InputRow, PrimaryButton, ErrorBanner, SuccessBanner } from "./InputRow";
import { resendSignupOtp, signUpWithEmail, verifySignupOtp } from "@/lib/auth";
import { otpSchema, signUpSchema } from "@/lib/auth-schemas";

type Step = "form" | "otp" | "success";

export function SignUpForm({
  onSwitchToSignin,
  onAccountCreated,
}: {
  onSwitchToSignin: () => void;
  onAccountCreated: (email: string) => void;
}) {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = signUpSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const res = await signUpWithEmail(parsed.data);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setInfo(`We sent a 6-digit verification code to ${parsed.data.email}.`);
    setStep("otp");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    const res = await verifySignupOtp(email, parsed.data);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setStep("success");
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const res = await resendSignupOtp(email);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setInfo("A new code has been sent to your email.");
  }

  if (step === "success") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Account created!</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Your email <span className="font-medium">{email}</span> has been verified. You can sign in now.
            </p>
          </div>
        </div>
        <PrimaryButton type="button" onClick={() => onAccountCreated(email)}>
          Continue to sign in
        </PrimaryButton>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerify} className="space-y-3.5">
        <SuccessBanner message={info} />
        <InputRow icon={<ShieldCheck className="h-4 w-4" />}>
          <input
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit code"
            className="w-full bg-transparent text-center text-base tracking-[0.5em] text-slate-900 outline-none placeholder:text-slate-400 placeholder:tracking-normal placeholder:text-sm"
            autoFocus
            required
          />
        </InputRow>
        <PrimaryButton disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify email
        </PrimaryButton>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setError(null);
              setInfo(null);
            }}
            className="hover:text-slate-700 hover:underline"
          >
            ← Edit details
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={submitting}
            className="font-medium text-[#1d4ed8] hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        </div>
        <ErrorBanner message={error} />
      </form>
    );
  }

  return (
    <>
      <form onSubmit={handleSignup} className="space-y-3.5">
        <InputRow icon={<UserIcon className="h-4 w-4" />}>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="name"
            required
          />
        </InputRow>
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
            placeholder="Create a password (min 6)"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="new-password"
            required
          />
        </InputRow>
        <PrimaryButton disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </PrimaryButton>
      </form>

      <ErrorBanner message={error} />

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="font-semibold text-[#1d4ed8] hover:underline"
        >
          Sign in
        </button>
      </p>
    </>
  );
}