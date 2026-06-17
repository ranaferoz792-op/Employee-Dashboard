import { useEffect, useState } from "react";
import type React from "react";
import { CalendarDays, CheckCircle2, Filter, Percent, Plane, XCircle } from "lucide-react";
import { APIService, AttendanceSummaryJSON, AttendanceStatType } from "../services/api";

type AttendanceConfig = AttendanceSummaryJSON;

const attendanceConfig: AttendanceConfig = {
  stats: [
    { label: "Total Attendance", value: "22", type: "total" },
    { label: "Present Days", value: "18", type: "present" },
    { label: "Absent Days", value: "2", type: "absent" },
    { label: "Leave Days", value: "2", type: "leave" },
  ],
  dateFilter: {
    fromDatePlaceholder: "From Date",
    toDatePlaceholder: "To Date",
  },
  percentage: 82,
};

const statMeta: Record<
  AttendanceStatType,
  { icon: React.ElementType; color: string; accent: string }
> = {
  total: {
    icon: CalendarDays,
    color: "from-indigo-500 to-violet-600",
    accent: "text-indigo-300",
  },
  present: {
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-600",
    accent: "text-emerald-300",
  },
  absent: {
    icon: XCircle,
    color: "from-rose-500 to-pink-600",
    accent: "text-rose-300",
  },
  leave: {
    icon: Plane,
    color: "from-amber-500 to-orange-600",
    accent: "text-amber-300",
  },
};

export default function AttendanceCard() {
  const [config, setConfig] = useState<AttendanceConfig>(attendanceConfig);

  useEffect(() => {
    let mounted = true;

    APIService.getAttendanceSummary().then((summary) => {
      if (mounted) setConfig(summary);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const percentage = Math.min(Math.max(config.percentage, 0), 100);
  const fieldCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20";

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Attendance</h2>
          <p className="mt-1 text-sm text-slate-400">Track attendance status and filter records by date.</p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[1fr_1fr_auto] lg:max-w-xl">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">
              {config.dateFilter.fromDatePlaceholder}
            </span>
            <input
              type="date"
              aria-label={config.dateFilter.fromDatePlaceholder}
              className={fieldCls}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">
              {config.dateFilter.toDatePlaceholder}
            </span>
            <input
              type="date"
              aria-label={config.dateFilter.toDatePlaceholder}
              className={fieldCls}
            />
          </label>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 active:scale-[0.98]"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.stats.map((stat) => {
          const meta = statMeta[stat.type] ?? statMeta.total;
          const Icon = meta.icon;

          return (
            <div
              key={`${stat.type}-${stat.label}`}
              className="rounded-xl border border-white/10 bg-slate-950/60 p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.color} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  {stat.type}
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-500">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${meta.accent}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
              <Percent className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100">Attendance Percentage</p>
              <p className="text-xs text-slate-500">Current selected period</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-100">{percentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </section>
  );
}
