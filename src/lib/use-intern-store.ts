import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { ManagedUser } from "./admin-users";
import {
  InternProfile,
  InternTask,
  InternProject,
  ScheduleItem,
  AnnouncementItem,
  ActivityItem,
  AttendanceDay,
  ResourceItem,
  INITIAL_INTERN_PROFILE,
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_SCHEDULE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_ATTENDANCE,
  INITIAL_RESOURCES,
  createInitialProfile,
} from "./intern-data";

interface UseInternStoreOptions {
  user?: User | null;
  managedUser?: ManagedUser | null;
}

export function useInternStore(options?: UseInternStoreOptions) {
  const user = options?.user ?? null;
  const managedUser = options?.managedUser ?? null;

  const storagePrefix = user?.email
    ? `creare_intern_${user.email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}_`
    : "creare_intern_default_";

  function getFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(storagePrefix + key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(`Error reading ${key} from storage:`, e);
    }
    return fallback;
  }

  function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storagePrefix + key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
    }
  }

  const initialProfile = createInitialProfile(
    user?.email || managedUser?.email,
    managedUser?.name || (user?.user_metadata?.full_name as string),
    managedUser?.id,
    managedUser?.internDetails,
    managedUser?.phone,
    managedUser?.company
  );

  const [profile, setProfileState] = useState<InternProfile>(() =>
    getFromStorage("profile", initialProfile)
  );

  // Update profile when user/managedUser props change
  useEffect(() => {
    if (user?.email || managedUser?.email) {
      const updated = createInitialProfile(
        user?.email || managedUser?.email,
        managedUser?.name || (user?.user_metadata?.full_name as string),
        managedUser?.id,
        managedUser?.internDetails,
        managedUser?.phone,
        managedUser?.company
      );
      setProfileState((prev) => {
        const merged = { ...updated, ...prev, email: updated.email, id: updated.id };
        saveToStorage("profile", merged);
        return merged;
      });
    }
  }, [user?.email, managedUser?.id, managedUser?.role, managedUser?.internDetails]);

  const [tasks, setTasksState] = useState<InternTask[]>(() =>
    getFromStorage("tasks", INITIAL_TASKS)
  );

  const [projects, setProjectsState] = useState<InternProject[]>(() =>
    getFromStorage("projects", INITIAL_PROJECTS)
  );

  const [schedule, setScheduleState] = useState<ScheduleItem[]>(() =>
    getFromStorage("schedule", INITIAL_SCHEDULE)
  );

  const [announcements, setAnnouncementsState] = useState<AnnouncementItem[]>(() =>
    getFromStorage("announcements", INITIAL_ANNOUNCEMENTS)
  );

  const [activities, setActivitiesState] = useState<ActivityItem[]>(() =>
    getFromStorage("activities", INITIAL_ACTIVITIES)
  );

  const [attendance, setAttendanceState] = useState<AttendanceDay[]>(() =>
    getFromStorage("attendance", INITIAL_ATTENDANCE)
  );

  const [resources] = useState<ResourceItem[]>(INITIAL_RESOURCES);

  // Derive check-in state from today's attendance record
  const todayIso = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find((a) => a.date === todayIso);

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(() => {
    if (todayRecord) {
      return Boolean(todayRecord.checkIn && (!todayRecord.checkOut || todayRecord.checkOut === "Pending"));
    }
    return getFromStorage("isCheckedIn", false);
  });

  const [checkInTime, setCheckInTime] = useState<string>(() => {
    if (todayRecord?.checkIn) return todayRecord.checkIn;
    return getFromStorage("checkInTime", "");
  });

  const [checkOutTime, setCheckOutTime] = useState<string>(() => {
    if (todayRecord?.checkOut && todayRecord.checkOut !== "Pending") return todayRecord.checkOut;
    return getFromStorage("checkOutTime", "");
  });

  const updateProfile = (updated: Partial<InternProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updated };
      saveToStorage("profile", next);
      return next;
    });
  };

  const updateTaskStatus = (taskId: string, newStatus: InternTask["status"]) => {
    setTasksState((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      saveToStorage("tasks", next);
      return next;
    });

    addActivity({
      id: "ACT-" + Date.now(),
      title: `Task status updated: ${newStatus}`,
      type: newStatus === "Completed" ? "task_completed" : "project_updated",
      timestamp: "Just now",
      detail: `Task ${taskId} moved to ${newStatus}.`,
    });
  };

  const submitTaskWork = (taskId: string, submissionData: { notes: string; link: string; fileCount?: number }) => {
    setTasksState((prev) => {
      const next = prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "Under Review" as const,
            submission: {
              notes: submissionData.notes,
              link: submissionData.link,
              submittedAt: new Date().toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              fileCount: submissionData.fileCount || 1,
            },
          };
        }
        return t;
      });
      saveToStorage("tasks", next);
      return next;
    });

    addActivity({
      id: "ACT-" + Date.now(),
      title: `Deliverable Submitted for Review`,
      type: "task_completed",
      timestamp: "Just now",
      detail: `Task ${taskId} submitted with repository & live preview links.`,
    });
  };

  const markAnnouncementRead = (id: string) => {
    setAnnouncementsState((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, unread: false } : a));
      saveToStorage("announcements", next);
      return next;
    });
  };

  const addActivity = (act: ActivityItem) => {
    setActivitiesState((prev) => {
      const next = [act, ...prev.slice(0, 19)];
      saveToStorage("activities", next);
      return next;
    });
  };

  const toggleCheckIn = () => {
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const currentToday = new Date().toISOString().split("T")[0];

    if (isCheckedIn) {
      // Check Out
      setIsCheckedIn(false);
      setCheckOutTime(nowStr);
      saveToStorage("isCheckedIn", false);
      saveToStorage("checkOutTime", nowStr);

      setAttendanceState((prev) => {
        const existingIndex = prev.findIndex((a) => a.date === currentToday);
        const updatedRow: AttendanceDay = {
          date: currentToday,
          status: "present",
          checkIn: checkInTime || "09:00 AM",
          checkOut: nowStr,
          totalHours: "Shift Completed",
        };
        const next =
          existingIndex >= 0
            ? prev.map((row, idx) => (idx === existingIndex ? updatedRow : row))
            : [updatedRow, ...prev];
        saveToStorage("attendance", next);
        return next;
      });

      addActivity({
        id: "ACT-" + Date.now(),
        title: "Checked Out of Daily Shift",
        type: "project_updated",
        timestamp: "Just now",
        detail: `Shift concluded at ${nowStr}.`,
      });
    } else {
      // Check In
      setIsCheckedIn(true);
      setCheckInTime(nowStr);
      setCheckOutTime("");
      saveToStorage("isCheckedIn", true);
      saveToStorage("checkInTime", nowStr);
      saveToStorage("checkOutTime", "");

      setAttendanceState((prev) => {
        const existingIndex = prev.findIndex((a) => a.date === currentToday);
        const updatedRow: AttendanceDay = {
          date: currentToday,
          status: "present",
          checkIn: nowStr,
          checkOut: "Pending",
          totalHours: "Active",
        };
        const next =
          existingIndex >= 0
            ? prev.map((row, idx) => (idx === existingIndex ? updatedRow : row))
            : [updatedRow, ...prev];
        saveToStorage("attendance", next);
        return next;
      });

      addActivity({
        id: "ACT-" + Date.now(),
        title: "Checked In to Daily Shift",
        type: "project_updated",
        timestamp: "Just now",
        detail: `Attendance marked: Present at ${nowStr}.`,
      });
    }
  };

  return {
    profile,
    updateProfile,
    tasks,
    updateTaskStatus,
    submitTaskWork,
    projects,
    schedule,
    announcements,
    markAnnouncementRead,
    activities,
    attendance,
    resources,
    isCheckedIn,
    checkInTime,
    checkOutTime,
    toggleCheckIn,
  };
}
