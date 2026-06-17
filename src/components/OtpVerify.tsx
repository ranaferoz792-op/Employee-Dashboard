import { useState, useRef, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import AuthBackground from "./auth/AuthBackground";
import { APIService } from "../services/api";

export type OtpVerifyProps = {
  email: string;
  onBack: () => void;
  onVerified: () => void;
};

export default function OtpVerify({ email, onBack, onVerified }: OtpVerifyProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    setError("");
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = code.join("");
    if (otpCode.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setVerifying(true);
    try {
      const verified = await APIService.verifyOtp(email, otpCode);
      if (verified) {
        onVerified();
      } else {
        setError("Invalid OTP. Try 123456 or any 6-digit code.");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const resendCode = async () => {
    setResending(true);
    setError("");
    setCode(Array(6).fill(""));
    inputs.current[0]?.focus();

    try {
      await APIService.login(email);
    } catch (err) {
      console.error(err);
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AuthBackground />
      <div className="relative w-full max-w-md animate-[fadeUp_.6s_ease-out]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter the 6-digit code sent to verify your new account for{" "}
            <span className="text-slate-200">{email || "your email"}</span>
          </p>

          <form onSubmit={verify} className="mt-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  value={c}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className={`h-13 w-12 rounded-lg border bg-white/[0.03] text-center text-xl font-semibold outline-none transition-all focus:scale-105 focus:bg-white/[0.07] focus:ring-2 ${
                    error
                      ? "border-rose-500/50 ring-rose-500/20"
                      : "border-white/10 focus:border-indigo-400/50 focus:ring-indigo-500/20"
                  }`}
                  style={{ height: "3.25rem" }}
                />
              ))}
            </div>

            {error && (
              <p className="mt-3 animate-[fadeUp_.3s_ease-out] text-xs text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="group relative mt-6 w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 active:scale-[0.98] disabled:opacity-70"
            >
              {verifying ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onBack}
                className="text-slate-400 hover:text-slate-200"
              >
                ← Use a different email
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={resending}
                className="text-indigo-400 hover:text-indigo-300 disabled:opacity-60"
              >
                {resending ? "Resending..." : "Resend code"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
