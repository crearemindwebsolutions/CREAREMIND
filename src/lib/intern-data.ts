export interface InternProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  college: string;
  department: string;
  role: string;
  startDate: string;
  endDate: string;
  mentorName: string;
  mentorRole: string;
  mentorEmail: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  emergencyContact: string;
  skills: string[];
  company?: string;
}

export interface InternTask {
  id: string;
  title: string;
  project: string;
  assignedDate: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Under Review" | "Completed";
  description: string;
  deliverables: string[];
  attachments: { name: string; size: string; type: string }[];
  submission?: {
    notes: string;
    link: string;
    submittedAt: string;
    fileCount: number;
  };
  feedback?: {
    mentorName: string;
    rating: number;
    comment: string;
    date: string;
  };
}

export interface InternProject {
  id: string;
  name: string;
  description: string;
  mentor: string;
  progress: number;
  deadline: string;
  status: "In Progress" | "Testing" | "Review" | "Completed";
  teamMembers: { name: string; role: string }[];
  milestones: { title: string; completed: boolean; dueDate: string }[];
  resources: { name: string; url: string; type: "Figma" | "GitHub" | "API Docs" | "Notion" }[];
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: "Meeting" | "Review" | "Deadline" | "Discussion";
  time: string;
  duration: string;
  location: string;
  mentor: string;
  completed?: boolean;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: "Company" | "Engineering" | "Mentor" | "Event";
  content: string;
  timestamp: string;
  author: string;
  authorRole: string;
  unread: boolean;
  priority?: "Normal" | "Urgent";
}

export interface ActivityItem {
  id: string;
  title: string;
  type: "task_completed" | "task_assigned" | "project_updated" | "feedback_received" | "announcement";
  timestamp: string;
  detail: string;
}

export interface AttendanceDay {
  date: string;
  status: "present" | "absent" | "weekend" | "holiday" | "leave";
  checkIn?: string;
  checkOut?: string;
  totalHours?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: "Guidelines" | "Engineering" | "Design" | "Videos";
  format: "PDF" | "Doc" | "Figma" | "Video" | "Repo";
  sizeOrDuration: string;
  description: string;
  url: string;
}

export const INITIAL_INTERN_PROFILE: InternProfile = {
  id: "INT-00000000",
  name: "Intern Engineer",
  email: "",
  phone: "—",
  college: "—",
  department: "Creare Mind Engineering",
  role: "Intern",
  company: "Creare Mind Studio",
  startDate: "—",
  endDate: "—",
  mentorName: "Gowthaman PR",
  mentorRole: "Head of Engineering & Founder",
  mentorEmail: "gowthamandharshan4@gmail.com",
  bio: "",
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "https://crearemind.in",
  emergencyContact: "—",
  skills: [],
};

export function createInitialProfile(
  email?: string,
  name?: string,
  id?: string,
  internDetails?: {
    roleTitle?: string;
    college?: string;
    department?: string;
    mentorName?: string;
    startDate?: string;
    endDate?: string;
  },
  phone?: string,
  company?: string
): InternProfile {
  const safeEmail = (email || "").trim().toLowerCase();
  const safeName = (name || "").trim() || (safeEmail ? safeEmail.split("@")[0] : "Intern");
  const safeId = id ? (id.startsWith("INT-") ? id : `INT-${id}`) : "INT-00000000";

  return {
    id: safeId,
    name: safeName,
    email: safeEmail,
    phone: phone && phone !== "—" ? phone : "—",
    college: internDetails?.college || "—",
    department: internDetails?.department || "Creare Mind Engineering",
    role: internDetails?.roleTitle || "Intern",
    company: company || "Creare Mind Studio",
    startDate: internDetails?.startDate || "—",
    endDate: internDetails?.endDate || "—",
    mentorName: internDetails?.mentorName || "Gowthaman PR",
    mentorRole: "Head of Engineering & Founder",
    mentorEmail: "gowthamandharshan4@gmail.com",
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "https://crearemind.in",
    emergencyContact: "—",
    skills: [],
  };
}

// Production Mode: Empty arrays for real-data runtime
export const INITIAL_TASKS: InternTask[] = [];

export const INITIAL_PROJECTS: InternProject[] = [];

export const INITIAL_SCHEDULE: ScheduleItem[] = [];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export const INITIAL_ATTENDANCE: AttendanceDay[] = [];

export const INITIAL_RESOURCES: ResourceItem[] = [];
