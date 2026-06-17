export const LEAVE_APPLICATIONS_KEY = "leaveApplications";

export type LeaveApplicationStatus = "Pending" | "Approved" | "Rejected";

export type LeaveApplicationRecord = {
  applicationNo: string;
  applicationDate: string;
  employeeCode: string;
  employee: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  status: LeaveApplicationStatus;
  createdAt: string;
};

export function generateApplicationNo() {
  return "LV-" + Math.floor(1000 + Math.random() * 9000);
}

export function loadLeaveApplications(): LeaveApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEAVE_APPLICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaveApplicationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLeaveApplications(records: LeaveApplicationRecord[]) {
  localStorage.setItem(LEAVE_APPLICATIONS_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("leave-applications-updated"));
}

export function appendLeaveApplication(
  record: Omit<LeaveApplicationRecord, "status" | "createdAt"> & {
    status?: LeaveApplicationStatus;
    createdAt?: string;
  },
) {
  const next: LeaveApplicationRecord = {
    ...record,
    status: record.status ?? "Pending",
    createdAt: record.createdAt ?? new Date().toISOString(),
  };
  saveLeaveApplications([...loadLeaveApplications(), next]);
}

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  casual: "Casual Leave",
  short: "Short Leave",
  halfday: "Half Day",
  unpaid: "Unpaid",
};

export function formatLeaveType(value: string) {
  return LEAVE_TYPE_LABELS[value] ?? value;
}
