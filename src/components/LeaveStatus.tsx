import React, { useState, useRef, useEffect, useCallback } from "react";
import { CalendarDays, Clock, Palmtree, Sun, Thermometer, Ban } from "lucide-react";
import type { LeaveApplicationStatus } from "../lib/leaveApplications";
import { APIService } from "../services/api";

type LeaveStatusProps = {
  variant?: "full" | "dashboard";
};


const LEAVE_TYPE_META: Record<string, { icon: React.ElementType; color: string }> = {
  annual: { icon: Palmtree, color: "from-indigo-500 to-violet-600" },
  sick: { icon: Thermometer, color: "from-rose-500 to-pink-600" },
  casual: { icon: CalendarDays, color: "from-emerald-500 to-teal-600" },
  short: { icon: Clock, color: "from-amber-500 to-orange-600" },
  halfday: { icon: Sun, color: "from-cyan-500 to-blue-600" },
  unpaid: { icon: Ban, color: "from-slate-600 to-slate-700" },
};

const LEAVE_BALANCES: Record<string, string> = {
  annual: "14 days",
  sick: "8 days",
  casual: "6 days",
  short: "4 hours",
  halfday: "5 days",
  unpaid: "—",
};

const AVAILABLE_UNITS: Record<string, number> = {
  annual: 14,
  sick: 8,
  casual: 6,
  short: 4,
  halfday: 5,
  unpaid: 0,
};

const EMPLOYEES: Record<string, string> = {
  EMP001: "Ahmed Khan",
  EMP002: "Sara Ali",
  EMP003: "Bilal Hussain",
  EMP004: "Ayesha Malik",
};

type ToastType = "success" | "error" | "info";
type Toast = { msg: string; type: ToastType } | null;

type LeaveRecord = {
  id: string;
  applicationDate: string;
  employeeCode: string;
  employee: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: LeaveApplicationStatus;
  comments: string;
  createdAt: string;
};

const countLeaveUnits = (leaveType: string, fromDate: string, toDate: string) => {
  if (leaveType === "short") return 0.5;
  if (leaveType === "halfday") return 0.5;
  if (!fromDate || !toDate) return 0;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffMs = end.getTime() - start.getTime();
  return diffMs >= 0 ? Math.floor(diffMs / 86400000) + 1 : 0;
};

export default function LeaveStatus({ variant = "full" }: LeaveStatusProps) {
  const isDashboard = variant === "dashboard";
  const today = new Date().toISOString().slice(0, 10);
  const [applicationDate, setApplicationDate] = useState(today);
  const [employeeCode, setEmployeeCode] = useState("");
  const [employee, setEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<LeaveApplicationStatus>("Pending");
  const [comments, setComments] = useState("");
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: ToastType = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const validate = (): string | null => {
    if (!employeeCode) return "Employee Code is required";
    if (!leaveType) return "Leave Type is required";
    if (!fromDate) return "From Date is required";
    if (!toDate) return "To Date is required";
    if (toDate < fromDate) return "To Date must be after From Date";
    return null;
  };

  const reset = () => {
    setEmployeeCode("");
    setEmployee("");
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setStatus("Pending");
    setComments("");
    setApplicationDate(today);
  };

  const refresh = useCallback(async () => {
    try {
      const data = await APIService.getLeaveRequests();
      const mappedRecords: LeaveRecord[] = data.map((item) => ({
        id: item.applicationNo,
        applicationDate: item.applicationDate,
        employeeCode: item.employeeCode,
        employee: item.employeeName,
        leaveType: item.leaveType,
        fromDate: item.startDate,
        toDate: item.endDate,
        status: item.status,
        comments: item.reason,
        createdAt: item.createdAt,
      }));
      setRecords(mappedRecords);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
    }
  }, []);

  const handleSubmit = async () => {
    const e = validate();
    if (e) return showToast(e, "error");

    const recordId = "LS-" + Math.floor(1000 + Math.random() * 9000);

    try {
      await APIService.submitLeaveRequest({
        applicationNo: recordId,
        applicationDate,
        employeeCode,
        employeeName: employee,
        leaveType,
        startDate: fromDate,
        endDate: toDate,
        reason: comments,
        status,
        createdAt: new Date().toISOString(),
      });
      
      showToast("Leave status saved", "success");
      reset();
      refresh();
    } catch (err) {
      console.error(err);
      showToast("Failed to save", "error");
    }
  };

  const handleCancel = () => {
    reset();
    showToast("Cancelled", "info");
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("leave-applications-updated", onUpdate);
    return () => window.removeEventListener("leave-applications-updated", onUpdate);
  }, [refresh]);

  const approvedRecords = records.filter((record) => record.status === "Approved");
  const pendingRecords = records.filter((record) => record.status === "Pending");

  const leaveUsage = Object.keys(AVAILABLE_UNITS).reduce<Record<string, number>>((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<string, number>);

  approvedRecords.forEach((record) => {
    leaveUsage[record.leaveType] ||= 0;
    leaveUsage[record.leaveType] += countLeaveUnits(record.leaveType, record.fromDate, record.toDate);
  });

  const summaryRows = Object.entries(AVAILABLE_UNITS).map(([type, total]) => {
    const used = leaveUsage[type] ?? 0;
    const remaining = type === "unpaid" ? "—" : Math.max(total - used, 0);
    return {
      type,
      available: type === "unpaid" ? "—" : `${total}`,
      used: type === "unpaid" ? "—" : `${used}`,
      remaining: type === "unpaid" ? "—" : `${remaining}`,
      label: type === "halfday" ? "Half Day" : type === "short" ? "Short" : type.charAt(0).toUpperCase() + type.slice(1),
    };
  });

  const fieldCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-emerald-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-500/20";
  const labelCls = "text-xs font-medium text-slate-300";

  const recentRecords = [...records].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);

  if (isDashboard) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Leave overview</h2>
            <p className="mt-1 text-sm text-slate-400">Balances, pending requests, and recent activity.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-amber-500/20">
              {pendingRecords.length} pending
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10">
              {records.length} total request{records.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryRows.map((row) => {
            const meta = LEAVE_TYPE_META[row.type] ?? LEAVE_TYPE_META.annual;
            const Icon = meta.icon;
            return (
              <div
                key={row.type}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{row.label}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Used</p>
                    <p className="mt-0.5 text-xl font-semibold text-slate-100">{row.used}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Remaining</p>
                    <p className="mt-0.5 text-xl font-semibold text-emerald-400">{row.remaining}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Pending requests</h3>
              <span className="text-xs text-slate-500">Awaiting approval</span>
            </div>
            {pendingRecords.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
                No pending leave requests right now.
              </p>
            ) : (
              <ul className="space-y-3">
                {pendingRecords.slice(0, 5).map((record) => (
                  <li
                    key={record.id}
                    className="rounded-lg border border-white/10 bg-[#08101f]/60 px-4 py-3 transition-colors hover:border-white/15"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-100">{record.employee}</p>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                        Pending
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {record.leaveType} · {record.fromDate} → {record.toDate}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Recent leave history</h3>
              <span className="text-xs text-slate-500">Last {recentRecords.length} entries</span>
            </div>
            {records.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
                No leave history yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Period</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.map((record) => (
                      <tr key={record.id} className="border-t border-white/10 text-slate-200">
                        <td className="px-3 py-2.5 text-slate-300">{record.applicationDate}</td>
                        <td className="px-3 py-2.5 capitalize">{record.leaveType}</td>
                        <td className="px-3 py-2.5 text-slate-400">
                          {record.fromDate} → {record.toDate}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              record.status === "Approved"
                                ? "bg-emerald-500/15 text-emerald-200"
                                : record.status === "Rejected"
                                  ? "bg-rose-500/15 text-rose-200"
                                  : "bg-amber-500/15 text-amber-200"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div> */}
      </div>
    );
  }

  return (
    <div className="relative p-6">
      {toast && (
        <div
          className={`pointer-events-none fixed right-6 top-6 z-50 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-2xl ${
            toast.type === "error"
              ? "bg-rose-600"
              : toast.type === "success"
              ? "bg-emerald-600"
              : "bg-slate-800"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Leave Status</h2>
            <p className="text-xs text-slate-500">Pending leaves, history, and remaining balances.</p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10">
            {pendingRecords.length} pending request{pendingRecords.length === 1 ? "" : "s"}
          </span>
        </header>

        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {summaryRows.map((row) => (
            <div key={row.type} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{row.label}</p>
              <div className="mt-3 flex items-baseline gap-4">
                <div>
                  <p className="text-sm text-slate-300">Used</p>
                  <p className="text-lg font-semibold text-white">{row.used}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Remaining</p>
                  <p className="text-lg font-semibold text-white">{row.remaining}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Pending Leaves</h3>
            <span className="text-xs text-slate-500">Showing pending requests only</span>
          </div>
          {pendingRecords.length === 0 ? (
            <p className="text-sm text-slate-500">No pending leave requests at the moment.</p>
          ) : (
            <div className="space-y-3">
              {pendingRecords.map((record) => (
                <div key={record.id} className="rounded-2xl border border-white/10 bg-[#08101f]/80 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{record.employee} ({record.employeeCode})</p>
                      <p className="text-xs text-slate-400">{record.applicationDate} · {record.leaveType} leave</p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-200">Pending</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {record.fromDate} → {record.toDate}
                  </p>
                  {record.comments && <p className="mt-2 text-xs text-slate-500">{record.comments}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-100">Leave History</h3>
            <p className="text-xs text-slate-500">Recent applications and their status.</p>
          </div>
          {records.length === 0 ? (
            <p className="text-sm text-slate-500">No leave records yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="bg-slate-950/70 text-slate-400">
                  <tr>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Period</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...records]
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                    .map((record) => (
                      <tr key={record.id} className="border-t border-white/10">
                        <td className="px-3 py-3 text-slate-200">{record.applicationDate}</td>
                        <td className="px-3 py-3 text-slate-200">{record.leaveType}</td>
                        <td className="px-3 py-3 text-slate-200">{record.fromDate} → {record.toDate}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            record.status === "Approved"
                              ? "bg-emerald-500/15 text-emerald-200"
                              : record.status === "Rejected"
                              ? "bg-rose-500/15 text-rose-200"
                              : "bg-amber-500/15 text-amber-200"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div> */}

        {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className={labelCls}>Application Date</label>
            <input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} className={fieldCls} />

            <label className={labelCls}>Employee Code</label>
            <input
              value={employeeCode}
              onChange={(e) => {
                const code = e.target.value.toUpperCase();
                setEmployeeCode(code);
                setEmployee(EMPLOYEES[code] || "");
              }}
              placeholder="e.g. EMP001"
              className={fieldCls}
            />

            <label className={labelCls}>Employee</label>
            <input value={employee} disabled className={fieldCls} />

            <label className={labelCls}>Leave Type</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className={`${fieldCls} dashboard-select`}>
              <option value="">Select</option>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="short">Short</option>
              <option value="halfday">Half Day</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <label className={labelCls}>Leave Balance</label>
            <input value={LEAVE_BALANCES[leaveType] || ""} disabled className={fieldCls} />
          </div>

          <div className="space-y-3">
            <label className={labelCls}>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={fieldCls} />

            <label className={labelCls}>To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={fieldCls} />

            <label className={labelCls}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldCls} dashboard-select`}>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

            <label className={labelCls}>Comments</label>
            <textarea rows={4} value={comments} onChange={(e) => setComments(e.target.value)} className={fieldCls + " resize-none"} />
          </div>
        </div> */}

        {/* <footer className="mt-4 flex justify-end gap-3">
          <button onClick={handleSubmit} className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-medium text-white shadow-lg">Save</button>
          <button onClick={handleCancel} className="rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2 text-xs font-medium text-white shadow-lg">Cancel</button>
        </footer> */}
      </div>
    </div>
  );
}
  
