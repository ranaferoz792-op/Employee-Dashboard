import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  Search,
  LogOut,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import Login from "../components/Login";
import Signup from "../components/Signup";
import OtpVerify from "../components/OtpVerify";
import ApplicationStatus from "../components/ApplicationStatus";
import LeaveApplication from "../components/LeaveApplication";
import DashboardContent from "../components/Dashboard";
import { APIService } from "../services/api";

export const Route = createFileRoute("/")({
  component: Index,
});

type Screen = "login" | "signup" | "otp" | "dashboard";

function Index() {
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "reset">("signup");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const session = APIService.getStoredSession();
    if (session && session.authenticated) {
      setEmail(session.email);
      setScreen("dashboard");
    }
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-slate-100 antialiased" />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100 antialiased selection:bg-indigo-500/40">
      {screen === "login" && (
        <Login
          email={email}
          setEmail={setEmail}
          onLogin={() => setScreen("dashboard")}
          onSignupNavigate={() => {
            setAuthMode("signup");
            setScreen("signup");
          }}
          onForgotPassword={() => {
            setAuthMode("reset");
            setScreen("signup");
          }}
        />
      )}
      {screen === "signup" && (
        <Signup
          mode={authMode}
          email={email}
          setEmail={setEmail}
          onContinue={(email) => {
            setSignupEmail(email);
            setEmail(email);
            if (authMode === "signup") {
              setScreen("otp");
            } else {
              setScreen("login");
            }
          }}
          onCancel={() => setScreen("login")}
        />
      )}
      {screen === "otp" && (
        <OtpVerify
          email={signupEmail}
          onBack={() => setScreen("signup")}
          onVerified={() => {
            setScreen("login");
          }}
        />
      )}
      {screen === "dashboard" && (
        <Dashboard
          onLogout={() => {
            APIService.clearSession();
            setEmail("");
            setScreen("login");
          }}
          email={email}
        />
      )}
    </div>
  );
}


/* --------------------------- DASHBOARD --------------------------- */
function Dashboard({ onLogout, email }: { onLogout: () => void; email: string }) {
  const [active, setActive] = useState("Dashboard");

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    //{ name: "Team", icon: Users },
   // { name: "Schedule", icon: Calendar },
    //{ name: "Documents", icon: FileText },
    { name: "Leave Application", icon: ClipboardList },
    { name: "Application Status", icon: FileText },
    { name: "Settings", icon: Settings },
  ];

  const initials = (email.split("@")[0] || "user").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0a0f1e] p-5 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">NumericSoft</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Employee</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.name;
            return (
              <button
                key={item.name}
                onClick={() => { console.log('nav click', item.name); setActive(item.name); }}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-400" : ""}`} />
                {item.name}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={onLogout}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-end border-b border-white/5 bg-[#0b1020]/80 px-6 py-4 backdrop-blur-xl">
          <div className="relative w-full max-w-md">
            {/* <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search tasks, people, documents…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
            /> */}
          </div>
          <div className="ml-4 flex items-center gap-3">
            <button className="relative rounded-lg border border-white/10 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.06]">
              <Bell className="h-4 w-4 text-slate-300" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-rose-500 ring-2 ring-[#0b1020]" />
            </button>
            <div className="hidden sm:flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold">
                {initials}
              </div>
              <div className="ml-3 hidden sm:block text-sm text-slate-300">{active}</div>
              <div className="hidden text-xs sm:block">
                <p className="font-medium text-slate-200">{email.split("@")[0] || "Employee"}</p>
                <p className="text-slate-500">Product Team</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-white/5 bg-[#0b1020]/80 px-6 py-3 md:hidden">
          {navItems.map((item) => {
            const isActive = active === item.name;
            return (
              <button
                key={item.name}
                onClick={() => { console.log('nav click', item.name); setActive(item.name); }}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "border-indigo-400 bg-indigo-500/10 text-white"
                    : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {active === "Leave Application" ? (
          <LeaveApplication />
        ) : active === "Application Status" ? (
          <ApplicationStatus />
        ) : (
          <DashboardContent />
        )}
      </main>
    </div>
  );
}
