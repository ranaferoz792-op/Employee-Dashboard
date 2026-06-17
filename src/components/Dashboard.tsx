import React from "react";
import { Clock, CheckCircle2, FileText, TrendingUp } from "lucide-react";
import LeaveStatus from "./LeaveStatus";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}

export default function DashboardContent() {
  const greeting = getGreeting();
  // const stats = [
  //   { label: "Hours This Week", value: "37.5", change: "+4.2%", icon: Clock, color: "from-indigo-500 to-violet-600" },
  //   { label: "Tasks Completed", value: "28", change: "+12%", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
  //   { label: "Performance", value: "94%", change: "+3.1%", icon: TrendingUp, color: "from-amber-500 to-orange-600" },
  //   { label: "Pending Reviews", value: "5", change: "-2", icon: FileText, color: "from-rose-500 to-pink-600" },
  // ];

  return (
    <div className="space-y-6 p-6 animate-[fadeUp_.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-slate-400">Your leave balances and requests at a glance.</p>
      </div>

      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{ animationDelay: `${i * 70}ms` }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] animate-[fadeUp_.5s_ease-out_both]"
            >
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-500">{s.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{s.value}</p>
                <span className="text-xs font-medium text-emerald-400">{s.change}</span>
              </div>
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div> */}

      <LeaveStatus variant="dashboard" />
    </div>
  );
}


      {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">My Tasks</h3>
              <p className="text-xs text-slate-500">Today and upcoming</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-2">
            {tasks.map((t, i) => (
              <li
                key={i}
                className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-white/10 hover:bg-white/[0.03]"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    t.done
                      ? "border-emerald-500/50 bg-emerald-500/20"
                      : "border-white/20 group-hover:border-indigo-400/50"
                  }`}
                >
                  {t.done && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${t.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                    {t.title}
                  </p>
                  <p className="text-xs text-slate-500">Due {t.due}</p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    t.priority === "High"
                      ? "bg-rose-500/15 text-rose-300"
                      : t.priority === "Medium"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {t.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <p className="text-xs text-slate-500">Last 24 hours</p>
          <ul className="mt-4 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-semibold">
                  {a.who.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-slate-200">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-slate-400">{a.what}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div> */}
 
