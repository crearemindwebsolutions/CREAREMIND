import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { ClipboardPaste, Eye, EyeOff, Check } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PasswordRules {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function checkPasswordRules(pass: string): PasswordRules {
  return {
    minLength: pass.length >= 8,
    hasUpper: /[A-Z]/.test(pass),
    hasLower: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[^A-Za-z0-9]/.test(pass),
  };
}

function isPasswordStrong(rules: PasswordRules): boolean {
  return (
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial
  );
}

function getStrengthScore(rules: PasswordRules): number {
  return [
    rules.minLength,
    rules.hasUpper,
    rules.hasLower,
    rules.hasNumber,
    rules.hasSpecial,
  ].filter(Boolean).length;
}

function PasswordStrengthIndicator({
  rules,
  score,
  value,
}: {
  rules: PasswordRules;
  score: number;
  value: string;
}) {
  const getStrengthLabel = () => {
    if (value.length === 0) return { text: "Required", color: "text-ink-muted", barColor: "bg-ink/10" };
    if (score <= 2) return { text: "Weak", color: "text-red-500", barColor: "bg-red-500" };
    if (score < 5) return { text: "Moderate", color: "text-amber-500", barColor: "bg-amber-500" };
    return { text: "Strong", color: "text-emerald-600", barColor: "bg-emerald-600" };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-2 rounded-lg border border-ink/10 bg-paper-2/60 p-3 text-xs animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-ink-muted">Password Strength</span>
        <span className={`text-[11px] font-semibold ${strength.color}`}>
          {strength.text}
        </span>
      </div>

      {/* 5-segment strength progress bar */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((seg) => (
          <div
            key={seg}
            className={`h-full rounded-full transition-all duration-300 ${
              value.length > 0 && seg <= score ? strength.barColor : "bg-ink/10"
            }`}
          />
        ))}
      </div>

      {/* Checklist of required items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {[
          { met: rules.minLength, text: "At least 8 characters" },
          { met: rules.hasUpper, text: "At least 1 uppercase (A-Z)" },
          { met: rules.hasLower, text: "At least 1 lowercase (a-z)" },
          { met: rules.hasNumber, text: "At least 1 number (0-9)" },
          { met: rules.hasSpecial, text: "At least 1 symbol (!@#$...)" },
        ].map((req, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              req.met ? "text-emerald-600 font-medium" : "text-ink-muted"
            }`}
          >
            <div
              className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full transition-colors ${
                req.met
                  ? "bg-emerald-600 text-white"
                  : "border border-ink/25 text-transparent"
              }`}
            >
              <Check className="h-2 w-2 stroke-[3]" />
            </div>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const safePath = (p: unknown) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && p !== "/pricing" ? p : "/services");

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: safePath(s["redirect"]) }),
  head: () => ({
    meta: [
      { title: "Sign in — Creare Mind" },
      { name: "description", content: "Sign in or create your Creare Mind account to access digital software and services." },
      { property: "og:title", content: "Sign in — Creare Mind" },
      { property: "og:description", content: "Sign in or create your Creare Mind account to access digital software and services." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();
  const [mode, setMode] = useState<"in" | "up" | "otp" | "forgot" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const passwordRules = checkPasswordRules(password);
  const passwordScore = getStrengthScore(passwordRules);
  const isPasswordValid = isPasswordStrong(passwordRules);

  const newPasswordRules = checkPasswordRules(newPassword);
  const newPasswordScore = getStrengthScore(newPasswordRules);
  const isNewPasswordValid = isPasswordStrong(newPasswordRules);

  useEffect(() => { if (user) navigate({ to: redirect, replace: true }); }, [user, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "up" && !isPasswordValid) {
      setMsg({
        ok: false,
        t: "Please ensure your password meets all strength requirements.",
      });
      return;
    }
    setBusy(true); setMsg(null);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (error) {
        setMsg({ ok: false, t: error.message });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // User is already registered in Supabase!
        setMsg({
          ok: false,
          t: "This email is already registered. Please sign in with your password.",
        });
        setMode("in");
      } else if (!data.session) {
        setMode("otp");
        setMsg({ ok: true, t: "We've sent a 6-digit verification code to your email." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) setMsg({ ok: false, t: error.message });
    }
    setBusy(false);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length < 6) {
      setMsg({ ok: false, t: "Please enter the full 6-digit code." });
      return;
    }
    setBusy(true); setMsg(null);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleanOtp,
      type: "signup",
    });

    setBusy(false);
    if (error) {
      setMsg({ ok: false, t: error.message });
    } else if (data.session || data.user) {
      setMsg({ ok: true, t: "Verified! Signing you in…" });
      navigate({ to: redirect, replace: true });
    }
  };

  const resendOtp = async () => {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) setMsg({ ok: false, t: error.message });
    else setMsg({ ok: true, t: "A new 6-digit code has been sent to your email." });
    setBusy(false);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, "").slice(0, 6);
      if (digits) {
        setOtp(digits);
        setMsg(null);
      }
    } catch {
      setMsg({ ok: false, t: "Could not read clipboard. Please paste or type manually." });
    }
  };

  const requestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth",
    });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, t: error.message });
    } else {
      setMode("reset");
      setOtp("");
      setMsg({ ok: true, t: "We've sent a 6-digit password reset code to your email." });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length < 6) {
      setMsg({ ok: false, t: "Please enter the 6-digit recovery code." });
      return;
    }
    if (!isNewPasswordValid) {
      setMsg({
        ok: false,
        t: "New password must meet all strength requirements (uppercase, lowercase, number, symbol, min 8 chars).",
      });
      return;
    }
    setBusy(true); setMsg(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleanOtp,
      type: "recovery",
    });

    if (verifyError) {
      setBusy(false);
      setMsg({ ok: false, t: verifyError.message });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setBusy(false);

    if (updateError) {
      setMsg({ ok: false, t: updateError.message });
    } else {
      setMsg({ ok: true, t: "Password updated successfully!" });
      navigate({ to: redirect, replace: true });
    }
  };

  const google = async () => {
    sessionStorage.setItem("postAuth", redirect);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) setMsg({ ok: false, t: error.message ?? "Google sign-in failed" });
  };

  useEffect(() => {
    const p = sessionStorage.getItem("postAuth");
    if (user && p) { sessionStorage.removeItem("postAuth"); navigate({ to: safePath(p), replace: true }); }
  }, [user, navigate]);

  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true" || params.get("admin") === "true") {
        const isAdminLogin = params.get("admin") === "true" || params.get("demo") === "true";
        const email = isAdminLogin ? "gowthamandharshan4@gmail.com" : "crearemindwebsolutions@gmail.com";
        const demoSession = {
          access_token: "dev-mock-access-token",
          user: {
            id: "7d9b431e-4512-421b-871f-0e98031d8f12",
            email,
            created_at: "2026-01-15T10:30:00Z",
            user_metadata: {
              full_name: "Gowtham Dharshan",
              phone: "+91 80727 19603",
              role: "admin",
            },
            app_metadata: {
              provider: "email",
            },
          },
        };
        localStorage.setItem("creare_dev_session", JSON.stringify(demoSession));
        window.location.href = safePath(redirect);
      }
    }
  }, [redirect]);

  const input = "h-12 w-full border border-ink/20 bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-ink";

  return (
    <section className="grid min-h-screen place-items-center bg-paper px-5 pb-20 pt-32 text-ink">
      <div className="w-full max-w-md">
        {mode === "otp" ? (
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl">Verify your email</h1>
            <p className="mt-3 text-sm text-ink-muted">
              Enter the 6-digit code sent to <strong className="text-ink">{email}</strong>.
            </p>

            <form onSubmit={verifyOtp} className="mt-8 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={1} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={2} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={3} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={4} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={5} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                  </InputOTPGroup>
                </InputOTP>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste code from clipboard
                </button>
              </div>

              <button
                type="submit"
                disabled={busy || otp.length < 6}
                className="btn-ink w-full justify-center disabled:opacity-50"
              >
                {busy ? "Verifying…" : "Confirm & Sign In"}
              </button>
            </form>

            {msg && (
              <p role="status" className={`mt-4 text-sm ${msg.ok ? "text-ink" : "text-destructive"}`}>
                {msg.t}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-ink-muted">
              <button
                type="button"
                onClick={resendOtp}
                disabled={busy}
                className="text-ink underline underline-offset-4 disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setMode("up"); setMsg(null); }}
                className="hover:text-ink"
              >
                Change email
              </button>
            </div>
          </div>
        ) : mode === "forgot" ? (
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl">Forgot password?</h1>
            <p className="mt-3 text-sm text-ink-muted">
              Enter your email address and we&apos;ll send you a 6-digit recovery code.
            </p>

            <form onSubmit={requestPasswordReset} className="mt-8 space-y-4">
              <input
                required
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
              <button disabled={busy} className="btn-ink w-full justify-center disabled:opacity-50">
                {busy ? "Sending code…" : "Send Recovery Code"}
              </button>
            </form>

            {msg && (
              <p role="status" className={`mt-4 text-sm ${msg.ok ? "text-ink" : "text-destructive"}`}>
                {msg.t}
              </p>
            )}

            <p className="mt-8 text-sm text-ink-muted">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => { setMode("in"); setMsg(null); }}
                className="text-ink underline underline-offset-4"
              >
                Sign in
              </button>
            </p>
          </div>
        ) : mode === "reset" ? (
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl">Reset password</h1>
            <p className="mt-3 text-sm text-ink-muted">
              Enter the 6-digit code sent to <strong className="text-ink">{email}</strong> and pick a new password.
            </p>

            <form onSubmit={handlePasswordReset} className="mt-8 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={1} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={2} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={3} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={4} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                    <InputOTPSlot index={5} className="h-12 w-12 border-ink/20 text-lg text-ink" />
                  </InputOTPGroup>
                </InputOTP>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste code from clipboard
                </button>
              </div>

              <div className="relative">
                <input
                  required
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New password"
                  aria-label="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${input} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <PasswordStrengthIndicator
                rules={newPasswordRules}
                score={newPasswordScore}
                value={newPassword}
              />

              <button
                type="submit"
                disabled={busy || otp.length < 6 || !isNewPasswordValid}
                className="btn-ink w-full justify-center disabled:opacity-50"
              >
                {busy ? "Updating password…" : "Update Password & Sign In"}
              </button>
            </form>

            {msg && (
              <p role="status" className={`mt-4 text-sm ${msg.ok ? "text-ink" : "text-destructive"}`}>
                {msg.t}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-ink-muted">
              <button
                type="button"
                onClick={requestPasswordReset}
                disabled={busy}
                className="text-ink underline underline-offset-4 disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setMode("in"); setMsg(null); }}
                className="hover:text-ink"
              >
                Back to sign in
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
              {mode === "in" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              {mode === "in" ? "Sign in to access your account." : "Create your account to get started with Creare Mind."}
            </p>

            <button
              onClick={google}
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 border border-ink/20 text-sm font-medium transition-colors hover:bg-paper-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  fill="currentColor"
                  d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14zM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z"
                />
              </svg>
              Continue with Google
            </button>
            <div className="my-6 flex items-center gap-4 text-xs text-ink-muted">
              <span className="h-px flex-1 bg-ink/15" />or<span className="h-px flex-1 bg-ink/15" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "up" && (
                <input
                  required
                  placeholder="Full name"
                  aria-label="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={input}
                />
              )}
              <input
                required
                type="email"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${input} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {mode === "up" && (
                <PasswordStrengthIndicator
                  rules={passwordRules}
                  score={passwordScore}
                  value={password}
                />
              )}

              {mode === "in" && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setMsg(null); }}
                    className="text-xs text-ink-muted hover:text-ink underline underline-offset-4"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                disabled={busy || (mode === "up" && !isPasswordValid)}
                className="btn-ink w-full justify-center disabled:opacity-50"
              >
                {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
              </button>
            </form>
            {msg && (
              <p role="status" className={`mt-4 text-sm ${msg.ok ? "text-ink" : "text-destructive"}`}>
                {msg.t}
              </p>
            )}

            <p className="mt-8 text-sm text-ink-muted">
              {mode === "in" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "in" ? "up" : "in");
                  setMsg(null);
                  setShowPassword(false);
                }}
                className="text-ink underline underline-offset-4"
              >
                {mode === "in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
