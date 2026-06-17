import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatLeaveType, LeaveApplicationStatus } from "../lib/leaveApplications";
import { APIService, LeaveApplicationJSON } from "../services/api";

type ToastType = "success" | "error" | "info";
type Toast = { msg: string; type: ToastType } | null;

const STATUS_OPTIONS: Array<"Pending" | "Approved" | "Rejected"> = ["Pending", "Approved", "Rejected"];

export default function ApplicationStatus() {
  const [applications, setApplications] = useState<LeaveApplicationJSON[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await APIService.getLeaveRequests();
      setApplications(
        [...data].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      );
    } catch (err) {
      console.error("Failed to load leave requests", err);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("leave-applications-updated", onUpdate);
    return () => window.removeEventListener("leave-applications-updated", onUpdate);
  }, [refresh]);

  const showToast = (msg: string, type: ToastType = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const updateStatus = async (applicationNo: string, status: "Pending" | "Approved" | "Rejected") => {
    try {
      const next = await APIService.updateLeaveRequestStatus(applicationNo, status);
      setApplications(
        [...next].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      );
      showToast("Status updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    }
  };


  const fieldCls =
    "w-full min-w-[7.5rem] rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-slate-100 outline-none transition-all focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20";

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

      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Application Status</h2>
            <p className="mt-1 text-xs text-slate-500">
              Leave applications submitted from Leave Application appear here. Update status as needed.
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10">
            {applications.length} application{applications.length === 1 ? "" : "s"}
          </span>
        </header>

        {applications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center text-sm text-slate-500">
            No leave applications yet. Submit one from{" "}
            <span className="text-slate-300">Leave Application</span> first.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Application No</th>
                  <th className="px-4 py-3">Application Date</th>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">From Date</th>
                  <th className="px-4 py-3">To Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((row) => (
                  <tr key={row.applicationNo + row.createdAt} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium text-slate-100">{row.applicationNo}</td>
                    <td className="px-4 py-3 text-slate-300">{row.applicationDate}</td>
                    <td className="px-4 py-3 text-slate-300">{formatLeaveType(row.leaveType)}</td>
                    <td className="px-4 py-3 text-slate-300">{row.startDate}</td>
                    <td className="px-4 py-3 text-slate-300">{row.endDate}</td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        onChange={(e) =>
                          updateStatus(row.applicationNo, e.target.value as LeaveApplicationStatus)
                        }
                        className={`${fieldCls} dashboard-select`}
                        aria-label={`Status for ${row.applicationNo}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
