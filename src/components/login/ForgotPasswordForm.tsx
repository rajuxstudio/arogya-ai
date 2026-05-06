import { useState } from "react";
import { CheckCircle2, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { InputRow, PrimaryButton, ErrorBanner, SuccessBanner } from "./InputRow";
import { sendPasswordResetOtp, verifyResetOtpAndUpdatePassword } from "@/lib/auth";
import { emailSchema, otpSchema, passwordSchema } from "@/lib/auth-schemas";

type Step = "request" | "verify" | "done";

export function ForgotPasswordForm({
  onBackToSignin,
}: {
  onBackToSignin: () => void;
}) {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setSubmitting(true);
    const res = await sendPasswordResetOtp(parsed.data);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setInfo(`We sent a 6-digit code to ${parsed.data}.`);
    setStep("verify");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const otpParsed = otpSchema.safeParse(otp);
    if (!otpParsed.success) return setError(otpParsed.error.issues[0]?.message ?? "Invalid code");
    const pwParsed = passwordSchema.safeParse(password);
    if (!pwParsed.success) return setError(pwParsed.error.issues[0]?.message ?? "Invalid password");

    setSubmitting(true);
    const res = await verifyResetOtpAndUpdatePassword(email, otpParsed.data, pwParsed.data);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Password updated!</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              You can now sign in with your new password.
            </p>
          </div>
        </div>
        <PrimaryButton type="button" onClick={onBackToSignin}>
          Back to sign in
        </PrimaryButton>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <form onSubmit={handleReset} className="space-y-3.5">
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
        <InputRow icon={<Lock className="h-4 w-4" />}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 6)"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="new-password"
            required
          />
        </InputRow>
        <PrimaryButton disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset password
        </PrimaryButton>
        <button
          type="button"
          onClick={onBackToSignin}
          className="block w-full text-center text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          ← Back to sign in
        </button>
        <ErrorBanner message={error} />
      </form>
    );
  }

  return (
    <form onSubmit={handleRequest} className="space-y-3.5">
      <p className="text-sm text-slate-500">
        Enter the email associated with your account and we'll send you a 6-digit verification code.
      </p>
      <InputRow icon={<Mail className="h-4 w-4" />}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          autoComplete="email"
          autoFocus
          required
        />
      </InputRow>
      <PrimaryButton disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Send verification code
      </PrimaryButton>
      <button
        type="button"
        onClick={onBackToSignin}
        className="block w-full text-center text-xs text-slate-500 hover:text-slate-700 hover:underline"
      >
        ← Back to sign in
      </button>
      <ErrorBanner message={error} />
    </form>
  );
}