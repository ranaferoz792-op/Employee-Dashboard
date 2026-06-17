// ============================================================================
// 🔌 APIService: Employee Portal Data & Integration Hub
// ============================================================================
// ENGLISH:
// This file acts as the single source of truth for all data operations.
// It is designed to use localStorage as a mock database, but it is 100%
// ready to connect to any legacy or external system via standard JSON.
// 
// ROMAN URDU:
// Ye file aapke dashboard ke saare data (Login, Leaves, Profile) ko control karti hai.
// Abhi ye data ko browser ke 'localStorage' mein save aur load karegi, lekin isko aise
// design kiya gaya hai ke jab aap apna 'purana (legacy) system' attach karenge, toh aapko
// poore UI code ko touch nahi karna padega. Bas is file ke functions ko update karna hoga!



// ============================================================================
// 📋 1. JSON DATA CONTRACTS (Portal Data Structures)
// ============================================================================

export interface EmployeeProfileJSON {
  email: string;
  name: string;
  role: string;
  department: string;
  employeeCode: string;
}

export interface LeaveApplicationJSON {
  applicationNo: string;
  applicationDate: string;
  employeeCode: string;
  employeeName: string;
  leaveType: string; // 'annual' | 'sick' | 'casual' | 'short' | 'halfday' | 'unpaid'
  startDate: string;
  endDate: string;
  startTime?: string; // Optional for hourly leaves
  endTime?: string;   // Optional for hourly leaves
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export type AttendanceStatType = "total" | "present" | "absent" | "leave";

export interface AttendanceStatJSON {
  label: string;
  value: string;
  type: AttendanceStatType;
}

export interface AttendanceSummaryJSON {
  stats: AttendanceStatJSON[];
  dateFilter: {
    fromDatePlaceholder: string;
    toDatePlaceholder: string;
  };
  percentage: number;
}

export type AttendanceRecordStatus = "Present" | "Absent" | "Leave";

export interface AttendanceRecordJSON {
  id: string;
  date: string;
  status: AttendanceRecordStatus;
}

export interface EmployeeSettingsJSON {
  email: string;
  password: string;
  name: string;
  employeeCode: string;
  role: string;
  department: string;
}

type JsonRecord = Record<string, unknown>;
type StoredAccount = { email: string; password: string; verified: boolean };

function isJsonRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: JsonRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }
  return fallback;
}

function readAttendanceType(value: unknown): AttendanceStatType {
  return value === "present" || value === "absent" || value === "leave" || value === "total"
    ? value
    : "total";
}

function readPercentage(value: unknown, fallback: number) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(Math.max(Math.round(numericValue), 0), 100);
}

function readAttendanceStatus(value: unknown): AttendanceRecordStatus {
  return value === "Absent" || value === "Leave" || value === "Present"
    ? value
    : "Present";
}

// ============================================================================
// 👵 2. LEGACY SYSTEM MAPPERS (Purane System ke Data ko Naye mein badalne ka tarika)
// ============================================================================
// ROMAN URDU:
// Agar aapke purane legacy system ke JSON response ke keys (fields) alag hain,
// toh aap unhe yahan map kar sakte hain. UI code ko isse koi farq nahi padega!

/**
 * Maps legacy employee profile JSON keys to the dashboard format.
 * Example: If your old system has "user_email" instead of "email", map it here!
 */
export function mapLegacyProfileData(legacyProfile: JsonRecord): EmployeeProfileJSON {
  return {
    email: readString(legacyProfile, ["user_email", "email"], "employee@numericsoft.com"),
    name: readString(legacyProfile, ["full_name", "name"], "Employee"),
    role: readString(legacyProfile, ["job_title", "role"], "Product Team"),
    department: readString(legacyProfile, ["dept_name", "department"], "Engineering"),
    employeeCode: readString(legacyProfile, ["emp_id", "employeeCode"], "EMP001"),
  };
}

/**
 * Maps legacy leave records JSON keys to the dashboard format.
 * Example: If your old system uses "AppNo" instead of "applicationNo", map it here!
 */
export function mapLegacyLeaveData(legacyLeave: JsonRecord): LeaveApplicationJSON {
  const rawStatus = readString(legacyLeave, ["CurrentStatus", "status"], "Pending");
  const status =
    rawStatus === "Approved" || rawStatus === "Rejected" || rawStatus === "Pending"
      ? rawStatus
      : "Pending";

  return {
    applicationNo: readString(legacyLeave, ["AppNo", "applicationNo", "id"], "LV-UNKNOWN"),
    applicationDate: readString(legacyLeave, ["ApplyDate", "applicationDate"], new Date().toISOString().slice(0, 10)),
    employeeCode: readString(legacyLeave, ["EmpCode", "employeeCode"], "EMP001"),
    employeeName: readString(legacyLeave, ["EmpName", "employeeName", "employee"], "Employee"),
    leaveType: readString(legacyLeave, ["LType", "leaveType"], "annual"),
    startDate: readString(legacyLeave, ["FromDate", "startDate", "fromDate"]),
    endDate: readString(legacyLeave, ["ToDate", "endDate", "toDate"]),
    startTime: readString(legacyLeave, ["TimeStart", "startTime"]),
    endTime: readString(legacyLeave, ["TimeEnd", "endTime"]),
    reason: readString(legacyLeave, ["Remarks", "reason", "comments"]),
    status,
    createdAt: readString(legacyLeave, ["created_at", "createdAt"], new Date().toISOString()),
  };
}

export function mapLegacyAttendanceSummary(legacyAttendance: JsonRecord): AttendanceSummaryJSON {
  const statsSource = Array.isArray(legacyAttendance.stats) ? legacyAttendance.stats : [];
  const stats = statsSource.filter(isJsonRecord).map((item) => ({
    label: readString(item, ["label"], "Attendance"),
    value: readString(item, ["value"], "0"),
    type: readAttendanceType(item.type),
  }));

  return {
    stats: stats.length ? stats : DEFAULT_ATTENDANCE_SUMMARY.stats,
    dateFilter: {
      fromDatePlaceholder: readString(
        isJsonRecord(legacyAttendance.dateFilter) ? legacyAttendance.dateFilter : {},
        ["fromDatePlaceholder"],
        DEFAULT_ATTENDANCE_SUMMARY.dateFilter.fromDatePlaceholder,
      ),
      toDatePlaceholder: readString(
        isJsonRecord(legacyAttendance.dateFilter) ? legacyAttendance.dateFilter : {},
        ["toDatePlaceholder"],
        DEFAULT_ATTENDANCE_SUMMARY.dateFilter.toDatePlaceholder,
      ),
    },
    percentage: readPercentage(legacyAttendance.percentage, DEFAULT_ATTENDANCE_SUMMARY.percentage),
  };
}

export function mapLegacyAttendanceRecord(legacyAttendance: JsonRecord): AttendanceRecordJSON {
  return {
    id: readString(legacyAttendance, ["id", "attendanceId"], "ATT-UNKNOWN"),
    date: readString(legacyAttendance, ["date", "attendanceDate"], new Date().toISOString().slice(0, 10)),
    status: readAttendanceStatus(legacyAttendance.status),
  };
}

// ============================================================================
// ⚙️ 3. DEFAULT STATIC MOCK DATA (If no data in localStorage yet)
// ============================================================================

const DEFAULT_EMPLOYEES: Record<string, string> = {
  EMP001: "Ahmed Khan",
  EMP002: "Sara Ali",
  EMP003: "Bilal Hussain",
  EMP004: "Ayesha Malik",
};

const DEFAULT_LEAVE_BALANCES: Record<string, number> = {
  annual: 14,
  sick: 8,
  casual: 6,
  short: 4,     // Hours
  halfday: 5,   // Days
  unpaid: 0,
};

const DEFAULT_ATTENDANCE_SUMMARY: AttendanceSummaryJSON = {
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

const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecordJSON[] = [
  { id: "ATT-001", date: "2026-06-01", status: "Present" },
  { id: "ATT-002", date: "2026-06-02", status: "Present" },
  { id: "ATT-003", date: "2026-06-03", status: "Absent" },
  { id: "ATT-004", date: "2026-06-04", status: "Present" },
  { id: "ATT-005", date: "2026-06-05", status: "Leave" },
  { id: "ATT-006", date: "2026-06-08", status: "Present" },
  { id: "ATT-007", date: "2026-06-09", status: "Present" },
  { id: "ATT-008", date: "2026-06-10", status: "Present" },
  { id: "ATT-009", date: "2026-06-11", status: "Absent" },
  { id: "ATT-010", date: "2026-06-12", status: "Present" },
];

// ============================================================================
// 🔌 4. APIService (All Data Fetching, Submissions & Operations)
// ============================================================================

const AUTH_STORAGE_KEY = "employee-dashboard-session";
const ACCOUNTS_STORAGE_KEY = "employee-dashboard-accounts";
const LEAVE_STORAGE_KEY = "leave_applications_unified";
const ATTENDANCE_STORAGE_KEY = "employee_attendance_summary";
const ATTENDANCE_RECORDS_STORAGE_KEY = "employee_attendance_records";

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isJsonRecord).map((item) => ({
          email: readString(item, ["email"]).toLowerCase(),
          password: readString(item, ["password"]),
          verified: Boolean(item.verified),
        }))
      : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Array<{ email: string; password: string; verified: boolean }>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export const APIService = {
  
  // ----------------------------------------------------
  // 🔐 A. SESSION & AUTHENTICATION API CALLS
  // ----------------------------------------------------

  /**
   * Reads current active session JSON from storage.
   */
  getStoredSession(): { authenticated: boolean; email: string } | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * ROMAN URDU: Pehla step login request bhejna.
   * 🔗 FUTURE API CALL:
   * const res = await fetch('https://your-legacy-system.com/api/login.php', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ email })
   * });
   * return res.ok;
   */
  async login(email: string): Promise<boolean> {
    console.log("APIService: Sending OTP to", email);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return email.includes("@");
  },

  async signup(email: string, password: string): Promise<boolean> {
    console.log("APIService: Signing up", email);
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email.includes("@") || password.length < 6) {
      return false;
    }
    const accounts = getStoredAccounts();
    const normalizedEmail = email.toLowerCase();
    const existing = accounts.find((account) => account.email === normalizedEmail);
    if (existing) {
      existing.password = password;
      existing.verified = false;
    } else {
      accounts.push({ email: normalizedEmail, password, verified: false });
    }
    saveAccounts(accounts);
    return true;
  },

  async authenticate(email: string, password: string): Promise<boolean> {
    console.log("APIService: Authenticating", email);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const normalizedEmail = email.toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((item) => item.email === normalizedEmail);
    if (!account || account.password !== password || !account.verified) {
      return false;
    }
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ authenticated: true, email: normalizedEmail })
    );
    return true;
  },

  async resetPassword(email: string, password: string): Promise<boolean> {
    console.log("APIService: Resetting password for", email);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const normalizedEmail = email.toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((item) => item.email === normalizedEmail);
    if (!account) {
      return false;
    }
    account.password = password;
    account.verified = true;
    saveAccounts(accounts);
    return true;
  },

  /**
   * ROMAN URDU: OTP Verify karne ki API call.
   * 🔗 FUTURE API CALL:
   * const res = await fetch('https://your-legacy-system.com/api/verify_otp.php', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ email, otp })
   * });
   * const data = await res.json();
   * if (data.success) {
   *     localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ authenticated: true, email }));
   *     return true;
   * }
   * return false;
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    console.log("APIService: Verifying OTP", otp, "for", email);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const normalizedEmail = email.toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((item) => item.email === normalizedEmail);
    if (!account) {
      return false;
    }
    if (otp === "123456" || otp.length === 6) {
      account.verified = true;
      saveAccounts(accounts);
      return true;
    }
    return false;
  },

  /**
   * Clear user session on logout.
   */
  clearSession(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // ----------------------------------------------------
  // 🌴 B. LEAVE REQUESTS & STATUSES API CALLS
  // ----------------------------------------------------

  /**
   * ROMAN URDU: Purane ya naye system se saari leaves JSON list load karna.
   * 🔗 FUTURE API CALL:
   * const response = await fetch('https://your-legacy-system.com/api/leaves.php');
   * const legacyJSONList = await response.json();
   * // Convert old keys to dashboard standard:
   * return legacyJSONList.map((item: any) => mapLegacyLeaveData(item));
   */
  async getLeaveRequests(): Promise<LeaveApplicationJSON[]> {
    if (typeof window === "undefined") return [];
    
    try {
      const raw = localStorage.getItem(LEAVE_STORAGE_KEY);
      if (!raw) return [];
      
      const parsedArray = JSON.parse(raw);
      if (!Array.isArray(parsedArray)) return [];
      
      // Map each item through our legacy mapper to guarantee naye and old schema compatibility!
      return parsedArray.filter(isJsonRecord).map((item) => mapLegacyLeaveData(item));
    } catch {
      return [];
    }
  },

  async getAttendanceSummary(): Promise<AttendanceSummaryJSON> {
    if (typeof window === "undefined") return DEFAULT_ATTENDANCE_SUMMARY;

    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(DEFAULT_ATTENDANCE_SUMMARY));
        return DEFAULT_ATTENDANCE_SUMMARY;
      }

      const parsed = JSON.parse(raw);
      if (!isJsonRecord(parsed)) return DEFAULT_ATTENDANCE_SUMMARY;
      return mapLegacyAttendanceSummary(parsed);
    } catch {
      return DEFAULT_ATTENDANCE_SUMMARY;
    }
  },

  async getEmployeeSettings(email: string): Promise<EmployeeSettingsJSON> {
    const normalizedEmail = email.toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((item) => item.email === normalizedEmail);
    const employeeEntries = Object.entries(DEFAULT_EMPLOYEES);
    const employeeIndex = Math.max(
      employeeEntries.findIndex(([code]) => normalizedEmail.includes(code.toLowerCase())),
      0,
    );
    const [employeeCode, employeeName] = employeeEntries[employeeIndex] ?? ["EMP001", "Employee"];

    return {
      email: normalizedEmail || "employee@numericsoft.com",
      password: account?.password ?? "",
      name: employeeName,
      employeeCode,
      role: "Product Team",
      department: "Engineering",
    };
  },

  async getAllAttendance(): Promise<AttendanceRecordJSON[]> {
    if (typeof window === "undefined") return DEFAULT_ATTENDANCE_RECORDS;

    try {
      const raw = localStorage.getItem(ATTENDANCE_RECORDS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(ATTENDANCE_RECORDS_STORAGE_KEY, JSON.stringify(DEFAULT_ATTENDANCE_RECORDS));
        return DEFAULT_ATTENDANCE_RECORDS;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_ATTENDANCE_RECORDS;
      return parsed.filter(isJsonRecord).map((item) => mapLegacyAttendanceRecord(item));
    } catch {
      return DEFAULT_ATTENDANCE_RECORDS;
    }
  },

  /**
   * ROMAN URDU: Nayi leave submit karne ki API call.
   * 🔗 FUTURE API CALL:
   * const mappedJSON = {
   *     AppNo: record.applicationNo,
   *     EmpCode: record.employeeCode,
   *     LType: record.leaveType,
   *     FromDate: record.startDate,
   *     ToDate: record.endDate,
   *     Remarks: record.reason
   * };
   * const res = await fetch('https://your-legacy-system.com/api/apply_leave.php', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(mappedJSON)
   * });
   * return await res.json();
   */
  async submitLeaveRequest(
    record: Omit<LeaveApplicationJSON, "applicationNo" | "status" | "createdAt"> & {
      applicationNo?: string;
      status?: "Pending" | "Approved" | "Rejected";
      createdAt?: string;
    }
  ): Promise<LeaveApplicationJSON> {
    console.log("APIService: Submitting leave request:", record);
    
    const newRecord: LeaveApplicationJSON = {
      applicationNo: record.applicationNo || "LV-" + Math.floor(1000 + Math.random() * 9000),
      applicationDate: record.applicationDate,
      employeeCode: record.employeeCode,
      employeeName: record.employeeName || DEFAULT_EMPLOYEES[record.employeeCode] || "Employee",
      leaveType: record.leaveType,
      startDate: record.startDate,
      endDate: record.endDate,
      startTime: record.startTime,
      endTime: record.endTime,
      reason: record.reason,
      status: record.status || "Pending",
      createdAt: record.createdAt || new Date().toISOString(),
    };

    const currentLeaves = await this.getLeaveRequests();
    const updatedLeaves = [...currentLeaves, newRecord];
    
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(updatedLeaves));
    
    // Dispatch standard event so other parts of the dashboard know data has updated!
    window.dispatchEvent(new CustomEvent("leave-applications-updated"));
    
    return newRecord;
  },

  /**
   * ROMAN URDU: Kisi application ka status (Approved/Rejected) change karne ke liye.
   * 🔗 FUTURE API CALL:
   * const res = await fetch(`https://your-legacy-system.com/api/update_status.php`, {
   *     method: 'PUT',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ applicationNo, status })
   * });
   * return await res.json();
   */
  async updateLeaveRequestStatus(
    applicationNo: string,
    status: "Pending" | "Approved" | "Rejected"
  ): Promise<LeaveApplicationJSON[]> {
    console.log("APIService: Updating status of", applicationNo, "to", status);
    
    const currentLeaves = await this.getLeaveRequests();
    const updatedLeaves = currentLeaves.map((item) => {
      if (item.applicationNo === applicationNo) {
        return { ...item, status };
      }
      return item;
    });

    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(updatedLeaves));
    
    // Dispatch standard event
    window.dispatchEvent(new CustomEvent("leave-applications-updated"));
    
    return updatedLeaves;
  },

  // ----------------------------------------------------
  // 📊 C. DYNAMIC LEAVE BALANCES CALCULATION
  // ----------------------------------------------------

  /**
   * ROMAN URDU: Leaves balance nikalna based on approved requests.
   * Ye function automatically approved leaves ko total available mein se subtract karta hai.
   */
  async getLeaveBalances(employeeCode: string): Promise<Record<string, { available: string; used: string; remaining: string; label: string }>> {
    const allLeaves = await this.getLeaveRequests();
    
    // Filter leaves for this specific employee that are "Approved"
    const approvedLeaves = allLeaves.filter(
      (item) => item.employeeCode === employeeCode && item.status === "Approved"
    );

    // Calculate usage
    const leaveUsage: Record<string, number> = {
      annual: 0,
      sick: 0,
      casual: 0,
      short: 0,
      halfday: 0,
      unpaid: 0,
    };

    approvedLeaves.forEach((leave) => {
      let units = 0;
      if (leave.leaveType === "short" || leave.leaveType === "halfday") {
        units = 0.5;
      } else if (leave.startDate && leave.endDate) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffMs = end.getTime() - start.getTime();
        units = diffMs >= 0 ? Math.floor(diffMs / 86400000) + 1 : 0;
      }
      leaveUsage[leave.leaveType] = (leaveUsage[leave.leaveType] || 0) + units;
    });

    // Generate output structure
    const output: Record<string, { available: string; used: string; remaining: string; label: string }> = {};
    
    Object.entries(DEFAULT_LEAVE_BALANCES).forEach(([type, total]) => {
      const used = leaveUsage[type] || 0;
      const remaining = type === "unpaid" ? "—" : Math.max(total - used, 0);
      const unitLabel = type === "short" ? " hrs" : " days";
      
      let label = type.charAt(0).toUpperCase() + type.slice(1);
      if (type === "halfday") label = "Half Day";
      if (type === "short") label = "Short";

      output[type] = {
        label,
        available: type === "unpaid" ? "—" : `${total}${unitLabel}`,
        used: type === "unpaid" ? "—" : `${used}${unitLabel}`,
        remaining: type === "unpaid" ? "—" : `${remaining}${unitLabel}`,
      };
    });

    return output;
  },

  // ----------------------------------------------------
  // 👥 D. TEAM & DIRECTORY API CALLS
  // ----------------------------------------------------

  /**
   * ROMAN URDU: Team members load karne ke liye.
   */
  async getTeamMembers(): Promise<Array<{ code: string; name: string }>> {
    return Object.entries(DEFAULT_EMPLOYEES).map(([code, name]) => ({
      code,
      name,
    }));
  }
};
