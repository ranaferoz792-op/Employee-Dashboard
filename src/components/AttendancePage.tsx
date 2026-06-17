import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Filter } from "lucide-react";
import { APIService, AttendanceRecordJSON, AttendanceRecordStatus } from "../services/api";

const attendancePageConfig = {
  title: "Attendance",
  description: "Review attendance records and filter them by date range.",
  filters: {
    fromDateLabel: "From Date",
    toDateLabel: "To Date",
    buttonLabel: "Filter",
  },
  table: {
    columns: [
      { key: "date", label: "Date" },
      { key: "day", label: "Day" },
      { key: "status", label: "Status" },
    ],
  },
};

const statusStyles: Record<AttendanceRecordStatus, string> = {
  Present: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/20",
  Absent: "bg-rose-500/15 text-rose-200 ring-rose-500/20",
  Leave: "bg-amber-500/15 text-amber-200 ring-amber-500/20",
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-");
  return day && month && year ? `${day}-${month}-${year}` : date;
}

function formatDisplayDay(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "-";
  return parsedDate.toLocaleDateString("en-US", { weekday: "long" });
}

function filterRecords(records: AttendanceRecordJSON[], fromDate: string, toDate: string) {
  const endDate = toDate || todayString();

  return records.filter((record) => {
    if (fromDate && record.date < fromDate) return false;
    return record.date <= endDate;
  });
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecordJSON[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  useEffect(() => {
    let mounted = true;

    APIService.getAllAttendance().then((attendanceRecords) => {
      if (mounted) setRecords(attendanceRecords);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredRecords = useMemo(
    () => filterRecords(records, appliedFromDate, appliedToDate),
    [records, appliedFromDate, appliedToDate],
  );

  const applyFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <CalendarCheck className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              {attendancePageConfig.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{attendancePageConfig.description}</p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 ring-1 ring-white/10">
            {filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}
          </span>
        </header>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-300">
                {attendancePageConfig.filters.fromDateLabel}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-300">
                {attendancePageConfig.filters.toDateLabel}
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <button
              type="button"
              onClick={applyFilter}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              <Filter className="h-4 w-4" />
              {attendancePageConfig.filters.buttonLabel}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {attendancePageConfig.table.columns.map((column) => (
                    <th key={column.key} className="px-4 py-3">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-slate-300">{formatDisplayDate(record.date)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDisplayDay(record.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[record.status]}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <p className="border-t border-white/10 px-4 py-10 text-center text-sm text-slate-500">
              No attendance records found for the selected date range.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
