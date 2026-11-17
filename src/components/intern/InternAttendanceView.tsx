import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  FileQuestion,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { AttendanceDay } from "@/lib/intern-data";

interface InternAttendanceViewProps {
  attendance: AttendanceDay[];
  isCheckedIn: boolean;
  checkInTime: string;
  checkOutTime: string;
  onToggleCheckIn: () => void;
}

export function InternAttendanceView({
  attendance,
  isCheckedIn,
  checkInTime,
  checkOutTime,
  onToggleCheckIn,
}: InternAttendanceViewProps) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState("2026-11-20");
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const presentDays = attendance.filter((a) => a.status === "present").length;
  const totalWorkingDays = attendance.filter((a) => a.status !== "weekend").length;
  const attendancePercentage =
    totalWorkingDays > 0
      ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
      : "100.0";

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setShowLeaveModal(false);
      setLeaveReason("");
      alert("Leave / Permission request submitted to mentor Gowthaman PR for review.");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Check-In Action Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Internship Attendance Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Shift Attendance &amp; Logs
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Daily check-ins are verified for stipend processing, university attendance letters, and performance reviews.
            </p>
          </div>

          {/* Real-time Check-in Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Today&apos;s Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCheckedIn ? "bg-emerald-500 animate-ping" : "bg-neutral-400"
                  }`}
                />
                <span className="text-sm font-bold text-neutral-900">
                  {isCheckedIn ? "Present (Checked In)" : "Shift Concluded"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">
                {isCheckedIn
                  ? `In: ${checkInTime} &bull; Active`
                  : checkOutTime
                  ? `Out: ${checkOutTime}`
                  : "Not checked in yet"}
              </p>
            </div>

            <button
              onClick={onToggleCheckIn}
              className={`rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                isCheckedIn
                  ? "bg-neutral-900 hover:bg-neutral-800"
                  : "bg-neutral-900 hover:bg-neutral-800"
              }`}
            >
              {isCheckedIn ? "Check Out Shift" : "Check In Now"}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Attendance Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
            Attendance Rate
          </span>
          <span className="mt-1 text-2xl font-bold text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] tabular-nums block">
            {attendancePercentage}%
          </span>
          <span className="mt-1 block text-[11px] text-emerald-600 font-medium">
            Exceeds 85% requirement
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
            Days Present
          </span>
          <span className="mt-1 text-2xl font-bold text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] tabular-nums block">
            {presentDays} Days
          </span>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Out of {totalWorkingDays} working days
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
            Average Shift Duration
          </span>
          <span className="mt-1 text-2xl font-bold text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] tabular-nums block">
            {totalWorkingDays > 0 ? "8h 30m" : "—"}
          </span>
          <span className="mt-1 block text-[11px] text-neutral-500">
            {totalWorkingDays > 0 ? "Daily average logged" : "No shifts recorded yet"}
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
            Leaves / Permissions
          </span>
          <span className="mt-1 text-2xl font-bold text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] tabular-nums block">
            0 Days
          </span>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="mt-1 block text-[11px] font-semibold text-neutral-900 hover:underline cursor-pointer"
          >
            Apply for Leave &rarr;
          </button>
        </div>
      </div>

      {/* Monthly Attendance Log Table */}
      <div className="rounded-xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 bg-neutral-50/70">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              November 2026 Shift Log Sheet
            </h3>
            <p className="text-[11px] text-neutral-500">
              Verified timestamps recorded through Creare Mind internal portal.
            </p>
          </div>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
          >
            Request Leave / OD
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200/80 bg-white text-neutral-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Shift Status</th>
                <th className="py-2.5 px-4">Check-In</th>
                <th className="py-2.5 px-4">Check-Out</th>
                <th className="py-2.5 px-4">Logged Hours</th>
                <th className="py-2.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                    <p className="font-semibold text-neutral-700">No shift logs recorded yet</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Click &ldquo;Check In Now&rdquo; above to log your daily working shifts.
                    </p>
                  </td>
                </tr>
              ) : (
                attendance.map((row, i) => {
                  const isWeekend = row.status === "weekend";
                  return (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        isWeekend ? "bg-neutral-50/40 text-neutral-400" : "hover:bg-neutral-50"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium">{row.date}</td>
                      <td className="py-3 px-4">
                        {row.status === "present" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Present
                          </span>
                        ) : (
                          <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                            Weekend
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700">
                        {row.checkIn || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700">
                        {row.checkOut || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900">
                        {row.totalHours || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.status === "present" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-neutral-900">
                  Request Leave / On-Duty Permission
                </h4>
                <p className="text-xs text-neutral-500">
                  Submit an advance request for college exams, personal leave, or university OD.
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Requested Date
                </label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Final year semester lab examination / Anna University symposium..."
                  className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitted}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {leaveSubmitted ? "Submitting..." : "Send Request to Mentor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

