import React, { useState, useRef } from "react";
import {
  Upload,
  X,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { APIService } from "../services/api";

const LEAVE_BALANCES: Record<string, string> = {
  annual: "14 days",
  sick: "8 days",
  casual: "6 days",
  short: "4 hours",
  halfday: "5 days",
  unpaid: "—",
};

const TIME_BASED = new Set(["short", "halfday"]);

const EMPLOYEES: Record<string, string> = {
  EMP001: "Ahmed Khan",
  EMP002: "Sara Ali",
  EMP003: "Bilal Hussain",
  EMP004: "Ayesha Malik",
};

type Toast = { msg: string; type: "success" | "error" | "info" } | null;

type LeaveApplicationProps = {
  onClose?: () => void;
};

export default function LeaveApplication({ onClose }: LeaveApplicationProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [applicationNo, setApplicationNo] = useState(() => "LV-" + Math.floor(1000 + Math.random() * 9000));

  const [applicationDate, setApplicationDate] = useState(today);
  const [employeeCode, setEmployeeCode] = useState("");
  const [employee, setEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
 // const [comments, setComments] = useState(""); // ✅ FIXED
  const [image, setImage] = useState<string | null>(null);

  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timeEnabled = TIME_BASED.has(leaveType);
  const leaveBalance = LEAVE_BALANCES[leaveType] || "";

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const validate = (): string | null => {
    if (!applicationDate) return "Application Date is required";
    if (!employeeCode) return "Employee Code is required";
    if (!employee) return "Invalid Employee Code";
    if (!leaveType) return "Leave Type is required";
    if (!startDate) return "Start Date is required";
    if (!endDate) return "End Date is required";
    if (!reason) return "Reason is required";

    if (new Date(endDate) < new Date(startDate))
      return "End Date must be after Start Date";

    if (timeEnabled) {
      if (!startTime) return "Start Time is required";
      if (!endTime) return "End Time is required";
      if (endTime <= startTime) return "End Time must be after Start Time";
    }

    return null;
  };

  const resetForm = () => {
    setEmployeeCode("");
    setEmployee("");
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
   // setComments("");
    setImage(null);
    setApplicationDate(today);
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return showToast(error, "error");

    try {
      await APIService.submitLeaveRequest({
        applicationNo,
        applicationDate,
        employeeCode,
        employeeName: employee,
        leaveType,
        startDate: startDate,
        endDate: endDate,
        startTime: timeEnabled ? startTime : undefined,
        endTime: timeEnabled ? endTime : undefined,
        reason,
      });

      showToast("Application submitted successfully", "success");
      setApplicationNo("LV-" + Math.floor(1000 + Math.random() * 9000));
      resetForm();
    } catch (err) {
      console.error(err);
      showToast("Submission failed.", "error");
    }
  };

  const handleCancel = () => {
    resetForm();
    showToast("Form cancelled", "info");
  };

  const handleClose = () => {
    showToast("Closed", "info");
    onClose?.();
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return setImage(null);

    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleLeaveTypeChange = (value: string) => {
    setLeaveType(value);
    if (!TIME_BASED.has(value)) {
      setStartTime("");
      setEndTime("");
    }
  };

  const fieldCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50";

  const labelCls = "text-xs font-medium text-slate-300";
  const reqCls =
    "text-xs font-medium text-slate-300 before:mr-1 before:text-rose-400 before:content-['*']";

  return (
    <div className="relative p-6">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-2 text-white shadow-2xl ${
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

      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <h1 className="text-sm font-semibold text-slate-100">Leave Application</h1>
          </div>

          <button onClick={handleClose} className="text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="space-y-4">
            <Field label="Application No" labelCls={labelCls}>
              <input value={applicationNo} disabled className={fieldCls} />
            </Field>

            <Field label="Application Date" labelCls={reqCls}>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className={fieldCls}
              />
            </Field>

            <Field label="Employee Code" labelCls={labelCls}>
              <input
                value={employeeCode}
                onChange={(e) => {
                  const code = e.target.value.toUpperCase();
                  setEmployeeCode(code);
                  setEmployee(EMPLOYEES[code] || "");
                }}
                className={fieldCls}
                placeholder="EMP001"
              />
            </Field>

            <Field label="Employee" labelCls={labelCls}>
              <input value={employee} disabled className={fieldCls} />
            </Field>

            <Field label="Leave Type" labelCls={reqCls}>
              <select
                value={leaveType}
                onChange={(e) => handleLeaveTypeChange(e.target.value)}
                className={`${fieldCls} dashboard-select`}
              >
                <option value="">Select</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="short">Short Leave</option>
                <option value="halfday">Half Day</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </Field>

            <Field label="Leave Balance" labelCls={labelCls}>
              <input value={leaveBalance} disabled className={fieldCls} />
            </Field>

            <Field label="Start Date" labelCls={reqCls}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldCls}
              />
            </Field>

            <Field label="End Date" labelCls={reqCls}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={fieldCls}
              />
            </Field>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4">
            <Field label="Reason" labelCls={labelCls}>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${fieldCls} min-h-[140px]`}
                //className={fieldCls}
              />
            </Field>

            {/* <Field label="Comments" labelCls={labelCls}>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className={fieldCls}
              />
            </Field> */}

            <Field label="Image" labelCls={labelCls}>
              <div className="relative w-full rounded-lg border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
                <label className="flex flex-col items-center justify-center gap-2 p-5 cursor-pointer w-full">
                  <input type="file" hidden onChange={onImage} />
                  {image ? (
                    <div className="flex items-center gap-3 w-full">
                      <img src={image} className="h-14 w-14 rounded object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">Attachment Selected</p>
                        <p className="text-[10px] text-emerald-400">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04]">
                        <Upload className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-300">
                          Click to upload file
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, PDF up to 5MB</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </Field>

            <Field label="Start Time" labelCls={timeEnabled ? reqCls : labelCls}>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={!timeEnabled}
                className={fieldCls}
              />
            </Field>

            <Field label="End Time" labelCls={timeEnabled ? reqCls : labelCls}>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!timeEnabled}
                className={fieldCls}
              />
            </Field>
          </div>
        </div>

        <footer className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={handleSubmit}
            className="bg-emerald-600 px-4 py-2 rounded text-white"
          >
            Submit
          </button>

          <button
            onClick={handleCancel}
            className="bg-slate-600 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  labelCls,
  children,
}: {
  label: string;
  labelCls: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
      <label className={labelCls}>{label}</label>
      <div>{children}</div>
    </div>
  );
}
