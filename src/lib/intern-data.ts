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
  role: "Intern Engineer",
  company: "Creare Mind Studio",
  startDate: "—",
  endDate: "—",
  mentorName: "Gowthaman PR",
  mentorRole: "Head of Engineering & Founder",
  mentorEmail: "gowthamandharshan4@gmail.com",
  bio: "Engineering Intern contributing to Creare Mind software systems and digital platforms.",
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "https://crearemind.in",
  emergencyContact: "—",
  skills: [
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Git",
  ],
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
    role: internDetails?.roleTitle || "Intern Engineer",
    company: company || "Creare Mind Studio",
    startDate: internDetails?.startDate || "—",
    endDate: internDetails?.endDate || "—",
    mentorName: internDetails?.mentorName || "Gowthaman PR",
    mentorRole: "Head of Engineering & Founder",
    mentorEmail: "gowthamandharshan4@gmail.com",
    bio: "Engineering Intern contributing to Creare Mind software systems and digital platforms.",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "https://crearemind.in",
    emergencyContact: "—",
    skills: ["React", "TypeScript", "Tailwind CSS", "Git"],
  };
}

// Production Mode: Empty arrays for real-data runtime
export const INITIAL_TASKS: InternTask[] = [];

export const INITIAL_PROJECTS: InternProject[] = [];

export const INITIAL_SCHEDULE: ScheduleItem[] = [];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export const INITIAL_ATTENDANCE: AttendanceDay[] = [];

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: "RES-01",
    title: "Creare Mind Engineering Handbook & Standards",
    category: "Guidelines",
    format: "PDF",
    sizeOrDuration: "2.4 MB",
    description: "Core coding guidelines, Git workflow, branch naming, review process, and code quality standards.",
    url: "#",
  },
  {
    id: "RES-02",
    title: "React 19 & TanStack Start Architectural Blueprint",
    category: "Engineering",
    format: "Doc",
    sizeOrDuration: "18 pages",
    description: "Deep dive into server-side streaming, TanStack Router file-based routing, and Supabase client patterns.",
    url: "#",
  },
  {
    id: "RES-03",
    title: "Creare Mind Design System & Figma Token Library",
    category: "Design",
    format: "Figma",
    sizeOrDuration: "v3.2 Spec",
    description: "Component tokens, color palettes, spacing matrix, typography scales, and Lucide icon usage.",
    url: "#",
  },
  {
    id: "RES-04",
    title: "POS Billing System Architecture Walkthrough",
    category: "Videos",
    format: "Video",
    sizeOrDuration: "28 min",
    description: "Founder walkthrough explaining offline SQLite synchronization, ESC/POS printing, and barcode processing.",
    url: "#",
  },
  {
    id: "RES-05",
    title: "Tailwind CSS v4 Utility Guide & Layout Patterns",
    category: "Engineering",
    format: "Doc",
    sizeOrDuration: "12 pages",
    description: "Best practices for CSS variables, custom breakpoints, dark/light theme tokens, and kinetic micro-animations.",
    url: "#",
  },
  {
    id: "RES-06",
    title: "Internship Milestones & Evaluation Rubric",
    category: "Guidelines",
    format: "PDF",
    sizeOrDuration: "1.1 MB",
    description: "Complete breakdown of bi-weekly sprint reviews, performance scoring criteria, and stipend progression.",
    url: "#",
  },
];
