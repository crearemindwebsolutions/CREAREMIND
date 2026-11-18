import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { ScheduleItem } from "@/lib/intern-data";

interface InternCalendarViewProps {
  schedule: ScheduleItem[];
}

export function InternCalendarView({ schedule }: InternCalendarViewProps) {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthName = today.toLocaleDateString("en-US", { month: "long" });
  const currentYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState<number>(currentDay);
  const [activeView, setActiveView] = useState<"day" | "week" | "month">("month");
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduleItem | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group real events by day of month from the schedule prop
  const eventsByDay = new Map<number, ScheduleItem[]>();
  schedule.forEach((item) => {
    if (item.date) {
      const parsedDate = new Date(item.date);
      if (!isNaN(parsedDate.getTime())) {
        const d = parsedDate.getDate();
        if (!eventsByDay.has(d)) eventsByDay.set(d, []);
        eventsByDay.get(d)!.push(item);
      }
    }
  });

  const selectedDaySchedule = schedule.filter((item) => {
    if (!item.date) return false;
    const parsed = new Date(item.date);
    return !isNaN(parsed.getTime()) && parsed.getDate() === selectedDate;
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 border border-neutral-200">
              <CalendarIcon className="h-3 w-3 text-neutral-700" />
              <span>Intern Schedule</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-neutral-900">
              {currentMonthName} {currentYear}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Standups, sprint reviews, task deliverables, and technical mentor syncs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-xs">
              <button
                onClick={() => setActiveView("day")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  activeView === "day"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setActiveView("week")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  activeView === "week"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveView("month")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  activeView === "month"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Month View Grid */}
        <div className="mt-6 border border-neutral-200 rounded-xl overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-[11px] font-semibold text-neutral-500 py-2">
            {daysOfWeek.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 bg-white">
            {monthDays.map((day) => {
              const isToday = day === currentDay;
              const isSelected = day === selectedDate;
              const dayEvents = eventsByDay.get(day) || [];
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[75px] sm:min-h-[85px] p-2 transition-colors cursor-pointer relative ${
                    isSelected ? "bg-neutral-100/70" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-neutral-900 text-white font-bold"
                          : isSelected
                          ? "bg-neutral-200 text-neutral-900"
                          : "text-neutral-700"
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline text-[9px] font-mono text-neutral-900 font-semibold">
                        Today
                      </span>
                    )}
                  </div>

                  {hasEvents && (
                    <div className="mt-1.5 space-y-1">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-800 border border-neutral-200 truncate"
                        >
                          {evt.time ? `${evt.time} ` : ""}{evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] font-mono text-neutral-400 pl-0.5">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900">
            Agenda for {selectedDate} {currentMonthName} {currentYear}
          </h3>
          <span className="text-xs font-mono text-neutral-500">
            {selectedDaySchedule.length} Events Scheduled
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {selectedDaySchedule.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs">
              <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
              <p className="font-semibold text-neutral-700">No events scheduled for this date</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Sprint syncs, tech reviews, and standups will appear here when scheduled by your mentor.
              </p>
            </div>
          ) : (
            selectedDaySchedule.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMeeting(item)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-800 shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                      {item.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {item.time} ({item.duration})
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                      <span>&bull;</span>
                      <span>Host: {item.mentor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Joining meeting room: ${item.title} (${item.location})`);
                    }}
                    className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    Join Call
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-800 uppercase tracking-wider">
                  {selectedMeeting.type}
                </span>
                <h4 className="mt-2 text-base font-bold text-neutral-900">
                  {selectedMeeting.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <span>Time:</span>
                <strong className="text-neutral-900 font-mono">{selectedMeeting.time}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <strong className="text-neutral-900">{selectedMeeting.location}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Conducted by:</span>
                <strong className="text-neutral-900">{selectedMeeting.mentor}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Connecting to ${selectedMeeting.title}`);
                  setSelectedMeeting(null);
                }}
                className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Launch Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

