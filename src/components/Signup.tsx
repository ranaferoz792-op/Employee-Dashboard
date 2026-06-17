import { useState } from "react";
import { Briefcase, Mail, Lock } from "lucide-react";
import AuthBackground from "./auth/AuthBackground";
import { APIService } from "../services/api";

export type SignupProps = {
  mode: "signup" | "reset";
  email: string;
  setEmail: (v: string) => void;
  onContinue: (email: string) => void;
  onCancel: () => void;
};

export default function Signup({ mode, email, setEmail, onContinue, onCancel }: SignupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const success =
        mode === "signup"
          ? await APIService.signup(email, password)
          : await APIService.resetPassword(email, password);

      if (success) {
        onContinue(email);
      } else {
        setError(
          mode === "signup"
            ? "Signup failed. Please use a valid email and password."
            : "Password reset failed. Please verify your email and try again."
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        mode === "signup"
          ? "Signup failed. Please try again."
          : "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AuthBackground />
      <div className="relative w-full max-w-md animate-[fadeUp_.6s_ease-out]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Employee Dashboard</h1>
              <p className="text-xs text-slate-400">Employee Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signup" ? "Create account" : "Forgot password"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "signup"
              ? "Signup with your work email and password. Then verify via OTP."
              : "Enter your email and new password to reset your account."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Email address
              </label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 active:scale-[0.98] disabled:opacity-70"
            >
              <span className="relative z-10">
                {loading
                  ? mode === "signup"
                    ? "Creating account..."
                    : "Resetting password..."
                  : mode === "signup"
                  ? "Create account"
                  : "Reset password"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-300 hover:text-slate-100"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
