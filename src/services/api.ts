// ============================================================================
// 🔌 APIService: Employee Dashboard Data & Integration Hub
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
// 📋 1. JSON DATA CONTRACTS (Dashboard Data Structures)
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
export function mapLegacyProfileData(legacyProfile: any): EmployeeProfileJSON {
  return {
    email: legacyProfile.user_email || legacyProfile.email || "employee@numericsoft.com",
    name: legacyProfile.full_name || legacyProfile.name || "Employee",
    role: legacyProfile.job_title || legacyProfile.role || "Product Team",
    department: legacyProfile.dept_name || legacyProfile.department || "Engineering",
    employeeCode: legacyProfile.emp_id || legacyProfile.employeeCode || "EMP001",
  };
}

/**
 * Maps legacy leave records JSON keys to the dashboard format.
 * Example: If your old system uses "AppNo" instead of "applicationNo", map it here!
 */
export function mapLegacyLeaveData(legacyLeave: any): LeaveApplicationJSON {
  return {
    applicationNo: legacyLeave.AppNo || legacyLeave.applicationNo || legacyLeave.id || "LV-UNKNOWN",
    applicationDate: legacyLeave.ApplyDate || legacyLeave.applicationDate || new Date().toISOString().slice(0, 10),
    employeeCode: legacyLeave.EmpCode || legacyLeave.employeeCode || "EMP001",
    employeeName: legacyLeave.EmpName || legacyLeave.employeeName || legacyLeave.employee || "Employee",
    leaveType: legacyLeave.LType || legacyLeave.leaveType || "annual",
    startDate: legacyLeave.FromDate || legacyLeave.startDate || legacyLeave.fromDate || "",
    endDate: legacyLeave.ToDate || legacyLeave.endDate || legacyLeave.toDate || "",
    startTime: legacyLeave.TimeStart || legacyLeave.startTime || "",
    endTime: legacyLeave.TimeEnd || legacyLeave.endTime || "",
    reason: legacyLeave.Remarks || legacyLeave.reason || legacyLeave.comments || "",
    status: legacyLeave.CurrentStatus || legacyLeave.status || "Pending",
    createdAt: legacyLeave.created_at || legacyLeave.createdAt || new Date().toISOString(),
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

// ============================================================================
// 🔌 4. APIService (All Data Fetching, Submissions & Operations)
// ============================================================================

const AUTH_STORAGE_KEY = "employee-dashboard-session";
const ACCOUNTS_STORAGE_KEY = "employee-dashboard-accounts";
const LEAVE_STORAGE_KEY = "leave_applications_unified";

function getStoredAccounts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item: any) => ({
          email: String(item.email || "").toLowerCase(),
          password: String(item.password || ""),
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
      return parsedArray.map((item: any) => mapLegacyLeaveData(item));
    } catch {
      return [];
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
