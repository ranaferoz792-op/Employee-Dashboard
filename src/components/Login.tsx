import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import AuthBackground from "./auth/AuthBackground";
import BrandLogo from "./BrandLogo";
import { APIService } from "../services/api";

export type LoginProps = {
  email: string;
  setEmail: (v: string) => void;
  onLogin: () => void;
  onSignupNavigate: () => void;
  onForgotPassword: () => void;
};

export default function Login({ email, setEmail, onLogin, onSignupNavigate, onForgotPassword }: LoginProps) {
  const [password, setPassword] = useState("");
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

    setLoading(true);
    try {
      const success = await APIService.authenticate(email, password);
      if (success) {
        onLogin();
      } else {
        setError("Invalid email/password or account not verified.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
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
            <BrandLogo />
            <div>
              <h1 className="text-lg font-semibold">Employee Portal</h1>
              <p className="text-xs text-slate-400">Employee Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Welcome</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter your work email and password to sign in.
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-slate-400">
                <input type="checkbox" className="accent-indigo-500" />
                Remember me
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 active:scale-[0.98] disabled:opacity-70"
            >
              <span className="relative z-10">
                {loading ? "Signing in..." : "Sign in"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-rose-400">{error}</p>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSignupNavigate}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
