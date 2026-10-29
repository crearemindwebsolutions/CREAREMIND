import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useSession } from "@/hooks/use-session";
import { isAdmin, PRIMARY_ADMIN_EMAIL } from "@/lib/admin";
import { format8DigitUserId } from "@/lib/user-id";
import {
  useSiteContent,
  saveSiteContent,
  resetSiteContent,
  isVideoMedia,
  type WheelItemData,
  type TemplateItemData,
  type FeatureCardItemData,
  type FeatureTabItemData,
  DEFAULT_SITE_CONTENT,
} from "@/lib/site-content";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";
import {
  uploadAndSaveMedia,
  uploadMultipleMedia,
  fetchUserMedia,
  deleteMediaRecord,
  type MediaRecord,
} from "@/lib/cloudinary";
import {
  Users,
  UserPlus,
  UserCheck,
  Download,
  Key,
  Edit3,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Video,
  Copy,
  Trash2,
  Check,
  ExternalLink,
  Loader2,
  ArrowRight,
  Save,
  Plus,
  Play,
  Eye,
  Sliders,
  Settings,
  Layers,
  Sparkles,
  Search,
  Globe,
  Film,
  Phone,
  Mail,
  MapPin,
  Clock,
  Inbox,
  PhoneCall,
  MessageSquare,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  RefreshCw,
  LogOut,
  X,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredInquiries,
  saveInquiriesList,
  exportInquiriesToCsv,
  ADMIN_NOTIFICATION_EMAIL,
  type ClientInquiry,
} from "@/lib/inquiries";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console & Content Management — Creare Mind" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});


export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  provider: "Google OAuth" | "Email / Password" | "Phone OTP" | "GitHub";
  role: "Super Admin" | "Admin" | "Customer";
  joinedDate: string;
  company?: string;
}

export function generate8DigitIdFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const num = 10000000 + (abs % 90000000);
  return String(num);
}

export function generateUnique8DigitId(existingList: ManagedUser[]): string {
  const existing = new Set(existingList.map((u) => u.id));
  let id = "";
  let attempts = 0;
  do {
    const num = Math.floor(10000000 + Math.random() * 90000000);
    id = String(num);
    attempts++;
  } while (existing.has(id) && attempts < 1000);
  return id;
}

const DUMMY_EMAILS = new Set([
  "sarah.jenkins@quickcartpos.com",
  "liam.vance@aetherstudio.design",
  "elena@luminuxeskincare.com",
  "m.rossi@verveoptics.it",
]);

export function sanitizeAndDedupeUsers(list: ManagedUser[]): ManagedUser[] {
  const seenEmails = new Set<string>();
  const seenIds = new Set<string>();
  const cleaned: ManagedUser[] = [];

  // Hardcoded numbers to purge so only real user-provided phone numbers show
  const HARDCODED_PHONES = new Set([
    "+91 80727 19603",
    "+91 94421 88302",
    "+1 (415) 892-4102",
    "+44 20 7946 0912",
    "+1 (212) 555-0198",
    "+39 02 8945 1200",
  ]);

  for (const u of list) {
    if (!u || !u.email) continue;
    const emailKey = u.email.trim().toLowerCase();
    if (DUMMY_EMAILS.has(emailKey)) continue;
    if (seenEmails.has(emailKey)) continue;
    seenEmails.add(emailKey);

    let currentId = String(u.id || "").trim();
    if (!/^\d{8}$/.test(currentId) || seenIds.has(currentId)) {
      if (emailKey === "gowthamandharshan4@gmail.com") {
        currentId = "80721960";
      } else if (emailKey === "crearemindwebsolutions@gmail.com") {
        currentId = "94421883";
      } else {
        do {
          currentId = String(Math.floor(10000000 + Math.random() * 90000000));
        } while (seenIds.has(currentId));
      }
    }
    seenIds.add(currentId);

    // If phone was hardcoded or placeholder, reset to empty string unless legitimately provided
    let cleanPhone = (u.phone || "").trim();
    if (HARDCODED_PHONES.has(cleanPhone)) {
      cleanPhone = "";
    }

    cleaned.push({
      ...u,
      id: currentId,
      phone: cleanPhone,
    });
  }

  if (cleaned.length === 0) {
    return DEFAULT_MANAGED_USERS;
  }

  return cleaned;
}

const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: "80721960",
    name: "Gowthaman PR",
    email: "gowthamandharshan4@gmail.com",
    phone: "",
    provider: "Google OAuth",
    role: "Super Admin",
    joinedDate: "15 Oct 2026",
    company: "Creare Mind Founder",
  },
  {
    id: "94421883",
    name: "Dheepan Raj",
    email: "crearemindwebsolutions@gmail.com",
    phone: "",
    provider: "Email / Password",
    role: "Admin",
    joinedDate: "16 Oct 2026",
    company: "Creare Mind Co-Founder",
  },
];

type AdminTab = "inquiries" | "users" | "media" | "heroCards" | "services" | "stream" | "featureCards" | "featureTabs" | "templates" | "hero" | "branding";

function AdminPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const userIsAdmin = isAdmin(user);

  const { content, updateContent, updateSection, resetToDefaults } = useSiteContent();

  const [activeTab, setActiveTab] = useState<AdminTab>("inquiries");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Client Inquiries state (Intake from Contact form + Direct email to crearemindwebsolutions@gmail.com)
  const [inquiriesList, setInquiriesList] = useState<ClientInquiry[]>(() => getStoredInquiries());
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<"All" | ClientInquiry["status"]>("All");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [copiedInquiryId, setCopiedInquiryId] = useState<string | null>(null);

  // Real-time synchronization for inquiries
  useEffect(() => {
    const handleUpdate = () => {
      setInquiriesList(getStoredInquiries());
    };
    window.addEventListener("creare_inquiries_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("creare_inquiries_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Self-heal services if web-dev or canonical services are missing from loaded state
  useEffect(() => {
    if (content.services?.items) {
      const hasWebDev = content.services.items.some(
        (s) => s.id === "web-dev" || s.title?.toLowerCase().includes("custom websites")
      );
      const isMissingCanonical = content.services.items.length < DEFAULT_SITE_CONTENT.services.items.length;
      if (!hasWebDev || isMissingCanonical) {
        const reconciled = DEFAULT_SITE_CONTENT.services.items.map((canonical) => {
          const match = content.services.items.find(
            (s) => s.id === canonical.id || (s.title && s.title.toLowerCase() === canonical.title.toLowerCase())
          );
          return match ? { ...canonical, ...match } : canonical;
        });
        for (const extra of content.services.items) {
          if (!reconciled.some((s) => s.id === extra.id)) {
            reconciled.push(extra);
          }
        }
        updateSection("services", { items: reconciled });
      }
    }
  }, [content.services?.items, updateSection]);

  const handleUpdateInquiryStatus = (id: string, newStatus: ClientInquiry["status"]) => {
    const updated = inquiriesList.map((q) => (q.id === id ? { ...q, status: newStatus } : q));
    setInquiriesList(updated);
    saveInquiriesList(updated);
    toast.success(`Inquiry #${id} marked as "${newStatus}"`);
  };

  const handleSaveInquiryNotes = (id: string) => {
    const updated = inquiriesList.map((q) => (q.id === id ? { ...q, notes: notesDraft } : q));
    setInquiriesList(updated);
    saveInquiriesList(updated);
    setEditingNotesId(null);
    setNotesDraft("");
    toast.success("Notes saved for inquiry #" + id);
  };

  const handleDeleteInquiry = (id: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete inquiry from "${clientName}" (${id})?`)) {
      const updated = inquiriesList.filter((q) => q.id !== id);
      setInquiriesList(updated);
      saveInquiriesList(updated);
      toast.success(`Inquiry #${id} deleted.`);
    }
  };

  const handleCopyInquiryId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedInquiryId(id);
    toast.success(`Copied ticket ID ${id}`);
    setTimeout(() => setCopiedInquiryId(null), 2000);
  };

  const handleExportInquiries = () => {
    exportInquiriesToCsv(inquiriesList);
    toast.success("Client inquiries exported to CSV!");
  };

  const filteredInquiries = inquiriesList.filter((q) => {
    const matchesSearch =
      !inquirySearch.trim() ||
      q.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      q.phone.includes(inquirySearch) ||
      q.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      q.service.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      q.id.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (q.brief && q.brief.toLowerCase().includes(inquirySearch.toLowerCase()));

    const matchesStatus = inquiryStatusFilter === "All" || q.status === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // User Management state
  const [usersList, setUsersList] = useState<ManagedUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("creare_admin_users_list");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const cleaned = sanitizeAndDedupeUsers(parsed);
          localStorage.setItem("creare_admin_users_list", JSON.stringify(cleaned));
          return cleaned;
        } catch {
          return DEFAULT_MANAGED_USERS;
        }
      }
    }
    return DEFAULT_MANAGED_USERS;
  });

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "Super Admin" | "Admin" | "Customer">("all");
  const [userProviderFilter, setUserProviderFilter] = useState<"all" | "Google OAuth" | "Email / Password" | "Phone OTP" | "GitHub">("all");
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Automatically sync real authenticated session user into directory
  useEffect(() => {
    if (!user || !user.email) return;

    setUsersList((prev) => {
      const email = user.email!.trim().toLowerCase();
      const realName = (
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        email.split("@")[0]
      ).trim();
      
      // ONLY use real phone provided by the user in user_metadata or user.phone
      const realPhone = (
        (user.user_metadata?.phone as string) ||
        (user.phone as string) ||
        ""
      ).trim();

      const realProvider = (
        user.app_metadata?.provider === "google"
          ? "Google OAuth"
          : user.app_metadata?.provider === "github"
          ? "GitHub"
          : "Email / Password"
      ) as ManagedUser["provider"];

      const realRole = isAdmin(user) ? "Super Admin" : "Customer";
      const realJoinDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Recently";

      const real8DigitId = format8DigitUserId(user.id || email);
      const existingIndex = prev.findIndex((u) => u.email.toLowerCase() === email);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          id: real8DigitId, // Strictly sync the exact same 8-digit User ID matching /profile!
          name: realName,
          phone: realPhone,
          provider: realProvider,
          role: realRole,
        };
        const sanitized = sanitizeAndDedupeUsers(updated);
        localStorage.setItem("creare_admin_users_list", JSON.stringify(sanitized));
        return sanitized;
      } else {
        const newUser: ManagedUser = {
          id: real8DigitId,
          name: realName,
          email: user.email!,
          phone: realPhone,
          provider: realProvider,
          role: realRole,
          joinedDate: realJoinDate,
        };
        const sanitized = sanitizeAndDedupeUsers([newUser, ...prev]);
        localStorage.setItem("creare_admin_users_list", JSON.stringify(sanitized));
        return sanitized;
      }
    });
  }, [user]);

  // Add / Edit user modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserProvider, setNewUserProvider] = useState<ManagedUser["provider"]>("Google OAuth");
  const [newUserRole, setNewUserRole] = useState<ManagedUser["role"]>("Customer");
  const [newUserCompany, setNewUserCompany] = useState("");

  const saveUsersList = (updated: ManagedUser[]) => {
    setUsersList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("creare_admin_users_list", JSON.stringify(updated));
    }
  };

  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedUserId(id);
    toast.success("User ID copied to clipboard!");
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error("Please provide both name and email.");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const unique8DigitId = generateUnique8DigitId(usersList);
    const createdUser: ManagedUser = {
      id: unique8DigitId,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || "—",
      provider: newUserProvider,
      role: newUserRole,
      joinedDate: formattedDate,
      company: newUserCompany.trim() || undefined,
    };

    const updated = [createdUser, ...usersList];
    saveUsersList(updated);
    toast.success(`Added customer: ${createdUser.name}`);

    // Reset form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setNewUserCompany("");
    setNewUserRole("Customer");
    setNewUserProvider("Google OAuth");
    setShowAddUserModal(false);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = usersList.map((u) => (u.id === editingUser.id ? editingUser : u));
    saveUsersList(updated);
    toast.success(`Updated details for ${editingUser.name}!`);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove user "${name}" (${id})?`)) {
      const updated = usersList.filter((u) => u.id !== id);
      saveUsersList(updated);
      toast.success(`Removed user ${name}.`);
    }
  };

  const handleRoleChange = (id: string, newRole: ManagedUser["role"]) => {
    const updated = usersList.map((u) => (u.id === id ? { ...u, role: newRole } : u));
    saveUsersList(updated);
    toast.success(`Updated role to ${newRole}!`);
  };

  const handleExportCSV = () => {
    const headers = ["User ID", "Customer Name", "Email Address", "Mobile Number", "Sign-up Provider", "Account Role", "Joined Date"];
    const rows = usersList.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      `"${u.phone}"`,
      `"${u.provider}"`,
      u.role,
      `"${u.joinedDate}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `creare_users_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Exported users list to CSV!");
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);

    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchesProvider = userProviderFilter === "all" || u.provider === userProviderFilter;

    return matchesSearch && matchesRole && matchesProvider;
  });


  // Media Library states
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    completed: number;
    total: number;
    currentName: string;
  } | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all");
  const [mediaSearch, setMediaSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaRecord | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Asset picker modal for replacing images
  const [pickerTarget, setPickerTarget] = useState<{
    section: "template" | "hero" | "heroCard" | "featureCard" | "featureTab" | "service" | "stream";
    index?: number;
    field?: string;
  } | null>(null);

  // Load media library
  const loadMedia = async () => {
    try {
      setLoadingMedia(true);
      const items = await fetchUserMedia();
      setMediaList(items);
    } catch {
      // Fallback
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (userIsAdmin) {
      loadMedia();
    }
  }, [userIsAdmin]);

  const handleProcessFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress({ completed: 0, total: files.length, currentName: files[0]?.name || "" });

    try {
      const { successes, failures } = await uploadMultipleMedia(
        files,
        user?.id,
        (completed, total, currentName) => {
          setUploadProgress({ completed, total, currentName });
        }
      );

      if (successes.length > 0) {
        setMediaList((prev) => {
          const newUrls = new Set(successes.map((s) => s.url));
          return [...successes, ...prev.filter((m) => !newUrls.has(m.url))];
        });

        // If user was choosing an asset for a specific card in picker modal, immediately apply first
        if (pickerTarget && successes[0]) {
          handleApplyPickedMedia(successes[0].url);
        }

        if (!pickerTarget) {
          toast.success(`Uploaded ${successes.length} ${successes.length === 1 ? "media file" : "media files"} to Cloudinary & Database!`);
        }
      }

      if (failures.length > 0) {
        toast.error(`Failed to upload ${failures.length} ${failures.length === 1 ? "file" : "files"}. Please check file format or size.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload encountered an error.";
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (modalFileInputRef.current) modalFileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFiles(Array.from(files));
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDeleteMedia = async (media: MediaRecord | string) => {
    const id = typeof media === "string" ? media : media.id;
    const item = typeof media === "object" ? media : mediaList.find((m) => m.id === id);
    const url = item?.url;
    const publicId = item?.public_id;

    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await deleteMediaRecord(id, url, publicId);
      setMediaList((prev) => prev.filter((m) => m.id !== id && (!url || m.url !== url)));
      toast.success("Media permanently removed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete media.";
      toast.error(msg);
    }
  };

  const handleDownloadMedia = async (url: string, filename?: string) => {
    const toastId = toast.loading("Preparing download...");
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Network fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const isVid = url.includes(".mp4") || url.includes("video") || isVideoMedia(url);
      const fallbackExt = isVid ? "mp4" : "jpg";
      const cleanName = filename || url.split("/").pop()?.split("?")[0] || `creare-asset.${fallbackExt}`;
      link.download = cleanName.includes(".") ? cleanName : `${cleanName}.${fallbackExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started!", { id: toastId });
    } catch {
      // Direct browser fallback
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("download", filename || "media-asset");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Opening media file for download...", { id: toastId });
    }
  };

  const handleApplyPickedMedia = (url: string) => {
    if (!pickerTarget) return;

    if (pickerTarget.section === "template" && typeof pickerTarget.index === "number") {
      const updated = [...content.templates.items];
      if (updated[pickerTarget.index]) {
        updated[pickerTarget.index] = {
          ...updated[pickerTarget.index],
          img: url,
        };
        updateSection("templates", { items: updated });
        toast.success(`Updated template image for ${updated[pickerTarget.index].name}!`);
      }
    } else if (pickerTarget.section === "hero") {
      const updated = [...content.hero.videos, url];
      updateSection("hero", { videos: updated });
      toast.success("Added video to Hero playlist!");

    } else if (pickerTarget.section === "heroCard" && typeof pickerTarget.index === "number") {
      const currentCards = content.hero?.cards?.length
        ? content.hero.cards
        : DEFAULT_SITE_CONTENT.hero.cards;
      const updated = [...currentCards];
      if (updated[pickerTarget.index]) {
        updated[pickerTarget.index] = {
          ...updated[pickerTarget.index],
          image: url,
        };
        updateSection("hero", { cards: updated });
        toast.success(`Updated photo for "${updated[pickerTarget.index].name || updated[pickerTarget.index].title}"!`);
      }

    } else if (pickerTarget.section === "featureCard" && typeof pickerTarget.index === "number") {
      const currentCards = content.featureCards?.items?.length
        ? content.featureCards.items
        : DEFAULT_SITE_CONTENT.featureCards.items;
      const updated = [...currentCards];
      if (updated[pickerTarget.index]) {
        updated[pickerTarget.index] = {
          ...updated[pickerTarget.index],
          img: url,
        };
        updateSection("featureCards", { items: updated });
        toast.success(`Updated photo for "${updated[pickerTarget.index].t}"!`);
      }
    } else if (pickerTarget.section === "featureTab" && typeof pickerTarget.index === "number") {
      const currentTabs = content.featureTabs?.items?.length
        ? content.featureTabs.items
        : DEFAULT_SITE_CONTENT.featureTabs.items;
      const updated = [...currentTabs];
      if (updated[pickerTarget.index] && pickerTarget.field) {
        updated[pickerTarget.index] = {
          ...updated[pickerTarget.index],
          [pickerTarget.field]: url,
        };
        updateSection("featureTabs", { items: updated });
        toast.success(`Updated ${pickerTarget.field} image for tab "${updated[pickerTarget.index]?.tab}"!`);
      }
    } else if (pickerTarget.section === "service" && typeof pickerTarget.index === "number") {
      const currentServices = content.services?.items?.length
        ? content.services.items
        : DEFAULT_SITE_CONTENT.services.items;
      const updated = [...currentServices];
      if (updated[pickerTarget.index]) {
        updated[pickerTarget.index] = {
          ...updated[pickerTarget.index],
          img: url,
        };
        updateSection("services", { items: updated });
        toast.success(`Updated photo for service: "${updated[pickerTarget.index].title}"!`);
      }
    } else if (pickerTarget.section === "stream" && typeof pickerTarget.index === "number") {
      const currentStream = content.streamImages?.items?.length
        ? content.streamImages.items
        : DEFAULT_SITE_CONTENT.streamImages.items;
      const updated = [...currentStream];
      if (updated[pickerTarget.index]) {
        updated[pickerTarget.index] = {
          ...updated[pickerTarget.index],
          src: url,
        };
        updateSection("streamImages", { items: updated });
        toast.success(`Updated 3D stream card photo!`);
      }
    }

    setPickerTarget(null);
  };

  const handleSaveAll = () => {
    saveSiteContent(content);
    setSaveSuccess(true);
    toast.success("All website changes saved and published live!");
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm("Reset all website photos, videos, and settings to original defaults?")) {
      resetToDefaults();
      toast.info("Website content reset to factory defaults.");
    }
  };

  // 1. Loading State (Light Theme)
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-neutral-900 grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
          <p className="text-xs font-mono text-neutral-500">Verifying administrative security credentials…</p>
        </div>
      </div>
    );
  }

  // 2. Not Logged In -> Redirect Card (Light Theme)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-neutral-900 grid place-items-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900">Admin Authentication Required</h1>
          <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
            The Creare Mind Control Panel is restricted to authorized personnel. Please sign in with your administrative credentials.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/auth"
              search={{ redirect: "/admin" }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 transition-all"
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors py-1"
            >
              Return to Website
            </Link>

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(
                    "creare_dev_session",
                    JSON.stringify({
                      user: {
                        id: "80721960",
                        email: "gowthamandharshan4@gmail.com",
                        user_metadata: { role: "admin", full_name: "Gowthaman PR" },
                      },
                    })
                  );
                  window.location.reload();
                }}
                className="mt-2 text-[11px] text-neutral-500 hover:text-neutral-900 border border-neutral-200 bg-neutral-50 rounded-lg py-1.5 px-3 font-mono transition-colors cursor-pointer"
              >
                ⚡ [Dev Mode: Instant Admin Sign-In]
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged In, but NOT Admin -> Access Denied Screen (Light Theme)
  if (!userIsAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-neutral-900 grid place-items-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-red-600 font-semibold">
            Access Denied
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">Restricted Administrative Area</h1>
          <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
            This panel is exclusively reserved for the primary system administrator (
            <strong className="text-neutral-900">{PRIMARY_ADMIN_EMAIL}</strong>).
          </p>
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-left text-xs">
            <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Current Account</p>
            <p className="mt-0.5 font-medium text-neutral-900 truncate">{user.email}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Role: Standard Member (Unauthorized for Site CMS)</p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/profile"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Back to My Profile
            </Link>
            <button
              onClick={() => {
                navigate({ to: "/auth", search: { redirect: "/admin" } });
              }}
              className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors py-1 cursor-pointer font-medium"
            >
              Switch to Administrator Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered media items
  const filteredMedia = mediaList.filter((m) => {
    if (mediaFilter !== "all" && m.resource_type !== mediaFilter) return false;
    if (mediaSearch.trim()) {
      const q = mediaSearch.toLowerCase();
      const matchName = m.original_filename?.toLowerCase().includes(q);
      const matchUrl = m.url.toLowerCase().includes(q);
      return matchName || matchUrl;
    }
    return true;
  });

  // 4. Authorized Admin Dashboard in Pristine Light Theme
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111111] flex flex-col antialiased">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-bold tracking-tight text-neutral-900 hover:opacity-80 transition-opacity flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-900 font-bold">CREARE MIND</span>
            </Link>
            <span className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-neutral-800 font-semibold">
              <ShieldCheck className="h-3 w-3 text-neutral-900" />
              <span>Admin Console</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 text-neutral-700 font-mono text-[11px] bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {user.email}
            </span>

            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {saveSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              <span>{saveSuccess ? "Published Live!" : "Save Changes"}</span>
            </button>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700 transition-colors shadow-xs font-medium"
            >
              <span>Profile</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-3 py-1.5 text-xs transition-colors shadow-xs font-medium"
            >
              <Globe className="h-3.5 w-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Live Site</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 mx-auto max-w-7xl 2xl:max-w-[1540px] w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs">
            <p className="px-3 pt-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Content Sections
            </p>
            <nav className="space-y-1">
              {[
                { id: "inquiries", label: "Client Inquiries", icon: Inbox, count: inquiriesList.length },
                { id: "users", label: "User Management", icon: Users, count: usersList.length },
                { id: "media", label: "Photos & Media", icon: ImageIcon, count: mediaList.length },
                { id: "heroCards", label: "Hero 3D Showcase Cards", icon: Sparkles, count: (content.hero?.cards || DEFAULT_SITE_CONTENT.hero.cards).length },
                { id: "services", label: "Our Services", icon: Globe, count: (content.services?.items || DEFAULT_SITE_CONTENT.services.items).length },
                { id: "stream", label: "3D Work Stream", icon: Workflow, count: (content.streamImages?.items || DEFAULT_SITE_CONTENT.streamImages.items).length },
                { id: "featureCards", label: "Growth Cards", icon: Sparkles, count: (content.featureCards?.items || DEFAULT_SITE_CONTENT.featureCards.items).length },
                { id: "featureTabs", label: "Interactive Tabs", icon: Sliders, count: (content.featureTabs?.items || DEFAULT_SITE_CONTENT.featureTabs.items).length },
                { id: "templates", label: "Templates Gallery", icon: Layers, count: content.templates.items.length },
                { id: "hero", label: "Hero & Videos", icon: Film, count: content.hero.videos.length },
                { id: "branding", label: "Site & Contacts", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all text-left cursor-pointer ${
                      active
                        ? "bg-neutral-900 text-white font-semibold shadow-xs"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                    {typeof tab.count === "number" && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4.5 text-xs space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-neutral-900 font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Direct Publishing</span>
            </div>
            <p className="text-neutral-500 leading-relaxed text-[11px]">
              Edits made here update the website instantly. Photos and videos are securely delivered via Cloudinary global CDN.
            </p>
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="flex-1 min-w-0">
          
          {/* ============================================================ */}
          {/* TAB: CLIENT INQUIRIES & CALLBACK REQUESTS (NEW SECTION)      */}
          {/* ============================================================ */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              {/* Header with Title & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono uppercase tracking-wider font-semibold mb-2">
                    <Inbox className="w-3.5 h-3.5 text-blue-600" />
                    <span>Direct Client Intake & Form Submissions</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    Client Inquiries & Project Requests
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                    Submissions from the Contact & Project Kickoff form. All tickets are automatically forwarded to{" "}
                    <span className="font-semibold text-neutral-800 underline">{ADMIN_NOTIFICATION_EMAIL}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInquiriesList(getStoredInquiries());
                      toast.success("Client inquiries refreshed!");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportInquiries}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Inquiries CSV</span>
                  </button>
                </div>
              </div>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Total Inquiries
                  </span>
                  <div className="mt-1 text-2xl font-bold text-neutral-900">{inquiriesList.length}</div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    New Tickets
                  </span>
                  <div className="mt-1 text-2xl font-bold text-emerald-900">
                    {inquiriesList.filter((q) => q.status === "New").length}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    In Progress
                  </span>
                  <div className="mt-1 text-2xl font-bold text-blue-900">
                    {inquiriesList.filter((q) => q.status === "In Progress" || q.status === "Contacted").length}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Completed
                  </span>
                  <div className="mt-1 text-2xl font-bold text-purple-900">
                    {inquiriesList.filter((q) => q.status === "Completed").length}
                  </div>
                </div>
              </div>

              {/* Filters & Search Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search by client name, mobile, email, ticket ID, or service..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                  />
                  {inquirySearch && (
                    <button
                      onClick={() => setInquirySearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {(["All", "New", "Contacted", "In Progress", "Completed", "Archived"] as const).map((st) => {
                    const count = st === "All" ? inquiriesList.length : inquiriesList.filter((q) => q.status === st).length;
                    const isSel = inquiryStatusFilter === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setInquiryStatusFilter(st)}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSel
                            ? "bg-neutral-900 text-white shadow-xs"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                      >
                        <span>{st}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSel ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inquiries Cards List */}
              {filteredInquiries.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center text-neutral-500 shadow-xs">
                  <Inbox className="mx-auto h-10 w-10 opacity-30 text-neutral-400" />
                  <p className="mt-3 text-sm font-medium text-neutral-700">No client inquiries found.</p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                    {inquirySearch || inquiryStatusFilter !== "All"
                      ? "Try adjusting your search query or status filter."
                      : "When clients submit the callback or kickoff form on /contact, their inquiry tickets will automatically appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInquiries.map((inquiry) => {
                    const cleanPhone = inquiry.phone.replace(/[^0-9]/g, "");
                    const waMessage = `Hello ${inquiry.name}! This is Creare Mind regarding your inquiry #${inquiry.id} for ${inquiry.service}. When is a good time to discuss your project?`;
                    const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(waMessage)}`;

                    const statusStyles: Record<ClientInquiry["status"], string> = {
                      New: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
                      Contacted: "bg-blue-50 text-blue-800 border-blue-200 font-semibold",
                      "In Progress": "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
                      Completed: "bg-purple-50 text-purple-800 border-purple-200 font-semibold",
                      Archived: "bg-neutral-100 text-neutral-600 border-neutral-200 font-medium",
                    };

                    const isEditingThisNotes = editingNotesId === inquiry.id;

                    return (
                      <div
                        key={inquiry.id}
                        className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                      >
                        {/* Top bar: Ticket ID, Date, Status */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                              #{inquiry.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyInquiryId(inquiry.id)}
                              className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                              title="Copy Ticket ID"
                            >
                              {copiedInquiryId === inquiry.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <span className="text-neutral-300">•</span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-neutral-400" />
                              {inquiry.createdAt}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status Selector */}
                            <select
                              value={inquiry.status}
                              onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value as ClientInquiry["status"])}
                              className={`h-7 rounded-lg border text-xs px-2.5 outline-none cursor-pointer transition-all ${statusStyles[inquiry.status]}`}
                            >
                              <option value="New">🟢 New Lead</option>
                              <option value="Contacted">🔵 Contacted</option>
                              <option value="In Progress">🟡 In Progress</option>
                              <option value="Completed">🟣 Completed</option>
                              <option value="Archived">⚪ Archived</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleDeleteInquiry(inquiry.id, inquiry.name)}
                              className="h-7 w-7 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 grid place-items-center transition-colors cursor-pointer"
                              title="Delete inquiry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Client details & Quick action buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Client Information */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                              Client Details
                            </p>
                            <h3 className="text-base font-bold text-neutral-900">{inquiry.name}</h3>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2 text-neutral-700">
                                <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                <a
                                  href={`tel:${inquiry.phone}`}
                                  className="font-medium text-neutral-900 hover:underline"
                                >
                                  {inquiry.phone}
                                </a>
                              </div>
                              {inquiry.email && inquiry.email !== "Not provided" && (
                                <div className="flex items-center gap-2 text-neutral-700">
                                  <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                  <a
                                    href={`mailto:${inquiry.email}`}
                                    className="font-medium text-neutral-900 hover:underline truncate"
                                  >
                                    {inquiry.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Service Required */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                              Requested Service
                            </p>
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-800">
                              <span>{inquiry.service}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500">
                              Direct inquiry from Creare Mind kickoff desk
                            </p>
                          </div>

                          {/* Quick Reach Actions */}
                          <div className="space-y-1.5 flex flex-col justify-end">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                              Instant Actions
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp Client</span>
                              </a>
                              <a
                                href={`tel:${inquiry.phone}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all"
                              >
                                <PhoneCall className="h-3.5 w-3.5 text-neutral-600" />
                                <span>Call Directly</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Project Requirements / Brief block */}
                        <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 mb-3">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-1 flex items-center gap-1.5">
                            <FileText className="h-3 w-3 text-neutral-400" />
                            <span>Client Project Requirements / Scope Brief:</span>
                          </p>
                          <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap font-medium">
                            {inquiry.brief || "No detailed notes provided."}
                          </p>
                        </div>

                        {/* Internal Admin Notes */}
                        <div className="border-t border-neutral-100 pt-3">
                          {isEditingThisNotes ? (
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                                Internal Admin Follow-up Notes
                              </label>
                              <textarea
                                value={notesDraft}
                                onChange={(e) => setNotesDraft(e.target.value)}
                                placeholder="Add follow-up notes (e.g. Quoted 50k, scheduled discovery call on Tuesday, etc.)..."
                                rows={2}
                                className="w-full rounded-xl border border-neutral-200 bg-[#FAF9F6] p-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-3 py-1 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveInquiryNotes(inquiry.id)}
                                  className="px-3 py-1 rounded-lg bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800"
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-neutral-500">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] uppercase font-semibold text-neutral-400">
                                  Notes:
                                </span>
                                <span className="text-neutral-700 italic">
                                  {inquiry.notes || "No notes added yet."}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNotesId(inquiry.id);
                                  setNotesDraft(inquiry.notes || "");
                                }}
                                className="text-[11px] font-semibold text-neutral-900 hover:underline cursor-pointer"
                              >
                                {inquiry.notes ? "Edit Notes" : "+ Add Note"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 0: USER MANAGEMENT DIRECTORY                              */}
          {/* ============================================================ */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Header with Title & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-wider font-semibold mb-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Customer & Account Directory</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    User Management
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                    Manage client profiles, customer accounts, authentication providers, and access privileges.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New User</span>
                  </button>
                </div>
              </div>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Total Users
                  </span>
                  <div className="mt-1 text-2xl font-bold text-neutral-900">{usersList.length}</div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Customers
                  </span>
                  <div className="mt-1 text-2xl font-bold text-blue-600">
                    {usersList.filter((u) => u.role === "Customer").length}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Administrators
                  </span>
                  <div className="mt-1 text-2xl font-bold text-emerald-600">
                    {usersList.filter((u) => u.role !== "Customer").length}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Google OAuth
                  </span>
                  <div className="mt-1 text-2xl font-bold text-purple-600">
                    {usersList.filter((u) => u.provider === "Google OAuth").length}
                  </div>
                </div>
              </div>

              {/* Search & Filters Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by customer name, email, phone, or User ID..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 shadow-xs transition-all"
                  />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => setUserSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="h-10 px-3 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-700 outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>

                  <select
                    value={userProviderFilter}
                    onChange={(e) => setUserProviderFilter(e.target.value as any)}
                    className="h-10 px-3 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-700 outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
                  >
                    <option value="all">All Providers</option>
                    <option value="Google OAuth">Google OAuth</option>
                    <option value="Email / Password">Email / Password</option>
                    <option value="Phone OTP">Phone OTP</option>
                    <option value="GitHub">GitHub</option>
                  </select>
                </div>
              </div>

              {/* User Management Table with Exact Column Specifications */}
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-[#FAF8F5] text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 select-none">
                        <th className="py-3.5 px-4 whitespace-nowrap">User ID</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Customer Name</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Email Address</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Mobile Number</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Sign-up Provider</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Account Role</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Joined Date</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-neutral-400">
                            No users found matching your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isCopied = copiedUserId === u.id;
                          return (
                            <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                              {/* 1. User ID */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-neutral-700">{u.id}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyUserId(u.id)}
                                    className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                                    title="Copy User ID"
                                  >
                                    {isCopied ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* 2. Customer Name */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-medium text-[11px] grid place-items-center shrink-0 uppercase shadow-2xs font-mono">
                                    {u.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join("")}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-neutral-900 leading-tight">{u.name}</p>
                                    {u.company && (
                                      <p className="text-[10px] text-neutral-400 mt-0.5">{u.company}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 3. Email Address */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-neutral-700">
                                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                  <a
                                    href={`mailto:${u.email}`}
                                    className="hover:text-indigo-600 hover:underline font-medium"
                                  >
                                    {u.email}
                                  </a>
                                </div>
                              </td>

                              {/* 4. Mobile Number */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {u.phone && u.phone.trim() ? (
                                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-700">
                                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                    <span>{u.phone}</span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 italic">
                                    <span>Not provided</span>
                                  </span>
                                )}
                              </td>

                              {/* 5. Sign-up Provider */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-white border-neutral-200 text-neutral-700 shadow-2xs">
                                  {u.provider === "Google OAuth" ? (
                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                  ) : u.provider === "Email / Password" ? (
                                    <Key className="w-3 h-3 text-neutral-400 shrink-0" />
                                  ) : (
                                    <Shield className="w-3 h-3 text-neutral-400 shrink-0" />
                                  )}
                                  <span>{u.provider}</span>
                                </span>
                              </td>

                              {/* 6. Account Role */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                      u.role === "Super Admin"
                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                                        : u.role === "Admin"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}
                                  >
                                    {u.role === "Super Admin" || u.role === "Admin" ? (
                                      <ShieldCheck className="w-3 h-3" />
                                    ) : (
                                      <UserCheck className="w-3 h-3" />
                                    )}
                                    <span>{u.role}</span>
                                  </span>
                                </div>
                              </td>

                              {/* 7. Joined Date */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                                {u.joinedDate}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEditingUser(u)}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                                    title="Edit User"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title={`Delete ${u.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODAL: ADD NEW USER                                           */}
          {/* ============================================================ */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-neutral-800" />
                    <h3 className="text-base font-semibold text-neutral-900">Add New User</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={newUserCompany}
                      onChange={(e) => setNewUserCompany(e.target.value)}
                      placeholder="e.g. Acme Studio"
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                        Account Role
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                        Sign-up Provider
                      </label>
                      <select
                        value={newUserProvider}
                        onChange={(e) => setNewUserProvider(e.target.value as any)}
                        className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                      >
                        <option value="Google OAuth">Google OAuth</option>
                        <option value="Email / Password">Email / Password</option>
                        <option value="Phone OTP">Phone OTP</option>
                        <option value="GitHub">GitHub</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 font-semibold text-white shadow-xs"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODAL: EDIT USER                                              */}
          {/* ============================================================ */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-neutral-800" />
                    <h3 className="text-base font-semibold text-neutral-900">
                      Edit User ({editingUser.id})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={editingUser.email}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-100 px-3 text-neutral-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Company
                    </label>
                    <input
                      type="text"
                      value={editingUser.company || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                        Account Role
                      </label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                        className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                        Sign-up Provider
                      </label>
                      <select
                        value={editingUser.provider}
                        onChange={(e) => setEditingUser({ ...editingUser, provider: e.target.value as any })}
                        className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white"
                      >
                        <option value="Google OAuth">Google OAuth</option>
                        <option value="Email / Password">Email / Password</option>
                        <option value="Phone OTP">Phone OTP</option>
                        <option value="GitHub">GitHub</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 font-semibold text-white shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

{/* ============================================================ */}
          {/* TAB 1: MEDIA LIBRARY (PHOTOS & VIDEOS)                        */}
          {/* ============================================================ */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Media & Video Assets</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Upload photos and videos to Cloudinary. Apply any uploaded asset across the website with one click.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>{uploading ? (uploadProgress && uploadProgress.total > 1 ? `Uploading ${uploadProgress.completed + 1}/${uploadProgress.total}...` : "Uploading...") : "Upload Photos & Videos"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Upload Dropzone with full Drag & Drop support */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) {
                    handleProcessFiles(Array.from(e.dataTransfer.files));
                  }
                }}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all shadow-xs ${
                  isDragging
                    ? "border-neutral-900 bg-neutral-100 scale-[1.01]"
                    : "border-neutral-300 bg-white hover:border-neutral-900 hover:bg-neutral-50/50"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
                    <p className="mt-3 text-sm font-semibold text-neutral-900">
                      {uploadProgress && uploadProgress.total > 1
                        ? `Uploading file ${uploadProgress.completed + 1} of ${uploadProgress.total}...`
                        : "Uploading media to Cloudinary & Database..."}
                    </p>
                    {uploadProgress?.currentName && (
                      <p className="mt-1 text-xs text-neutral-500 font-mono max-w-xs truncate">
                        {uploadProgress.currentName}
                      </p>
                    )}
                    {uploadProgress && uploadProgress.total > 1 && (
                      <div className="mt-3 w-56 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 transition-all duration-300"
                          style={{ width: `${Math.round(((uploadProgress.completed) / uploadProgress.total) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 group-hover:scale-110 group-hover:border-neutral-900 group-hover:text-neutral-900 transition-all">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-neutral-900">
                      Click or drag photos & videos here to upload
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Supports multiple files at once • JPG, PNG, WebP, GIF, MP4, WebM • Automatically saved to Database
                    </p>
                  </>
                )}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white p-1 text-xs shadow-xs">
                  {(["all", "image", "video"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMediaFilter(filter)}
                      className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                        mediaFilter === filter
                          ? "bg-neutral-900 text-white font-medium shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      {filter === "all" ? `All (${mediaList.length})` : filter === "image" ? "Photos" : "Videos"}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Search media files…"
                    className="w-full h-8 pl-9 pr-3 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 shadow-xs"
                  />
                </div>
              </div>

              {/* Media Grid */}
              {loadingMedia ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="aspect-square rounded-xl bg-neutral-200/60 animate-pulse border border-neutral-200" />
                  ))}
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center text-neutral-500 shadow-xs">
                  <ImageIcon className="mx-auto h-10 w-10 opacity-30 text-neutral-400" />
                  <p className="mt-3 text-sm font-medium text-neutral-700">No media files found matching your filter.</p>
                  <p className="text-xs text-neutral-500 mt-1">Upload a photo or video above to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs transition-all hover:border-neutral-300 hover:shadow-md"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                        {item.resource_type === "video" || isVideoMedia(item.url) ? (
                          <div className="relative h-full w-full grid place-items-center bg-neutral-900">
                            <video
                              src={item.url}
                              className="size-full object-cover"
                              muted
                              loop
                              playsInline
                              autoPlay
                            />
                            <div className="absolute inset-0 bg-black/40 grid place-items-center group-hover:bg-black/20 transition-colors pointer-events-none">
                              <div className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm grid place-items-center text-neutral-900 shadow-md">
                                <Play className="h-4 w-4 fill-neutral-900 ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[9px] font-mono text-neutral-900 uppercase tracking-wider shadow-xs font-semibold">
                              Video
                            </span>
                          </div>
                        ) : (
                          <AdaptiveMedia
                            src={item.url}
                            alt={item.original_filename || "Media asset"}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setPreviewMedia(item)}
                                className="h-7 w-7 rounded-lg bg-white text-neutral-900 grid place-items-center hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm"
                                title="Preview asset"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadMedia(item.url, item.original_filename)}
                                className="h-7 w-7 rounded-lg bg-white text-neutral-900 grid place-items-center hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm"
                                title="Download asset file"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteMedia(item)}
                              className="h-7 w-7 rounded-lg bg-red-600 text-white grid place-items-center hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <button
                              onClick={() => handleDownloadMedia(item.url, item.original_filename)}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-1.5 text-[10px] font-semibold text-white transition-colors cursor-pointer shadow-sm active:scale-95"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download {item.resource_type === "video" || isVideoMedia(item.url) ? "Video" : "Photo"}</span>
                            </button>
                            <button
                              onClick={() => handleCopyUrl(item.url)}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-neutral-100 py-1.5 text-[10px] font-semibold text-neutral-900 transition-colors cursor-pointer shadow-sm"
                            >
                              {copiedUrl === item.url ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedUrl === item.url ? "Copied" : "Copy URL"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* File Details footer with direct download trigger */}
                      <div className="p-2.5 text-xs bg-white border-t border-neutral-100 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-neutral-900 text-[11px]" title={item.original_filename || item.public_id}>
                            {item.original_filename || item.public_id}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            {item.format?.toUpperCase() || "ASSET"} • {item.bytes ? `${(item.bytes / 1024).toFixed(0)} KB` : "CDN"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadMedia(item.url, item.original_filename)}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          title="Download this media file"
                        >
                          <Download className="h-3 w-3 text-neutral-600" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: HERO 3D SHOWCASE CARDS (BOTANICA, BOROUGH BARBER, ETC) */}
          {/* ============================================================ */}
          {activeTab === "heroCards" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono uppercase tracking-wider font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Homepage 3D Hero Carousel</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    Hero 3D Showcase Cards
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                    Change the images, titles, and details for the 3D rotating cards displayed directly below the main hero title on the homepage (Botanica phone app mockup, Borough Barber, Balance wellness center, etc.).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-xs transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-600" />
                    <span>View on Live Homepage</span>
                  </a>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(content.hero?.cards || DEFAULT_SITE_CONTENT.hero.cards).map((card, idx) => {
                  const heroCards = content.hero?.cards || DEFAULT_SITE_CONTENT.hero.cards;
                  return (
                    <div
                      key={card.id || idx}
                      className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                            Card #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 truncate max-w-[170px]">
                            {card.name || card.title}
                          </span>
                        </div>

                        {/* Card Image Thumbnail with Hover Change Photo Overlay */}
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-xs">
                          <AdaptiveMedia
                            src={card.image}
                            alt={card.name || card.title}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <button
                              type="button"
                              onClick={() => setPickerTarget({ section: "heroCard", index: idx })}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-neutral-100 px-3.5 py-2.5 text-xs font-semibold text-neutral-900 shadow-lg cursor-pointer transition-transform active:scale-95"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Change / Upload Photo</span>
                            </button>
                          </div>
                        </div>

                        {/* Title & Subtitle inputs */}
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Card Title
                            </label>
                            <input
                              type="text"
                              value={card.title || card.name}
                              onChange={(e) => {
                                const updated = [...heroCards];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                updateSection("hero", { cards: updated });
                              }}
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                              placeholder="e.g. Borough Barber"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Subtitle / Tagline
                            </label>
                            <input
                              type="text"
                              value={card.subtitle || ""}
                              onChange={(e) => {
                                const updated = [...heroCards];
                                updated[idx] = { ...updated[idx], subtitle: e.target.value };
                                updateSection("hero", { cards: updated });
                              }}
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-700 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                              placeholder="e.g. Precision Grooming"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Image URL / Cloudinary CDN
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={card.image}
                                onChange={(e) => {
                                  const updated = [...heroCards];
                                  updated[idx] = { ...updated[idx], image: e.target.value };
                                  updateSection("hero", { cards: updated });
                                }}
                                placeholder="Paste image link or click Browse"
                                className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white font-mono transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setPickerTarget({ section: "heroCard", index: idx })}
                                className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-3 text-xs font-semibold text-neutral-700 cursor-pointer"
                                title="Pick from media library or upload"
                              >
                                Browse
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: OUR SERVICES PAGE IMAGES & CONTENT                      */}
          {/* ============================================================ */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                      Our Services — Showcase Images & Details
                    </h2>
                    <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-mono font-medium text-white">
                      {(content.services?.items || DEFAULT_SITE_CONTENT.services.items).length} Services Configured
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Change the tablet mockup photos, turnaround times, and details displayed for each service on the{" "}
                    <Link to="/services" target="_blank" className="text-neutral-900 font-medium underline">
                      /services
                    </Link>{" "}
                    page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateSection("services", { items: DEFAULT_SITE_CONTENT.services.items });
                      toast.success("Restored all 6 default services!");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition-all cursor-pointer"
                    title="Restore default 6 services"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Reset to Defaults</span>
                  </button>
                  <Link
                    to="/services"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-xs transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Live /services</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(content.services?.items || DEFAULT_SITE_CONTENT.services.items).map((srv, idx) => {
                  const servicesList = content.services?.items || DEFAULT_SITE_CONTENT.services.items;
                  return (
                    <div
                      key={srv.id || idx}
                      className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-mono font-medium text-neutral-600">
                            {srv.category}
                          </span>
                          <h3 className="mt-1.5 text-sm font-semibold text-neutral-900">
                            {srv.title}
                          </h3>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono text-neutral-400 font-semibold">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Image Preview with Replace and Download button */}
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                        <AdaptiveMedia
                          src={srv.img}
                          alt={srv.title}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Quick Download Media button */}
                        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadMedia(srv.img, `${srv.id}-mockup.jpg`);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-black/75 backdrop-blur-xs hover:bg-black px-2.5 py-1 text-[11px] font-medium text-white shadow-md transition-all cursor-pointer"
                            title="Download Service Mockup"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <button
                            type="button"
                            onClick={() => setPickerTarget({ section: "service", index: idx })}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-neutral-100 px-4 py-2.5 text-xs font-semibold text-neutral-900 shadow-lg cursor-pointer transition-transform active:scale-95"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Change / Upload Photo</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Category Config */}
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Service Title
                            </label>
                            <input
                              type="text"
                              value={srv.title || ""}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                updateSection("services", { items: updated });
                              }}
                              placeholder="Service Title"
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white font-medium transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Category Badge
                            </label>
                            <input
                              type="text"
                              value={srv.category || ""}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[idx] = { ...updated[idx], category: e.target.value };
                                updateSection("services", { items: updated });
                              }}
                              placeholder="e.g. Software & Web"
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                            Image Asset / CDN URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={srv.img}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[idx] = { ...updated[idx], img: e.target.value };
                                updateSection("services", { items: updated });
                              }}
                              placeholder="Image URL or Cloudinary Link"
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white font-mono transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setPickerTarget({ section: "service", index: idx })}
                              className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-3 text-xs font-semibold text-neutral-700 cursor-pointer"
                              title="Pick from Media Library or Upload"
                            >
                              Browse
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Turnaround Time
                            </label>
                            <input
                              type="text"
                              value={srv.turnaround || ""}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[idx] = { ...updated[idx], turnaround: e.target.value };
                                updateSection("services", { items: updated });
                              }}
                              placeholder="e.g. 1 – 3 Weeks"
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Service ID
                            </label>
                            <input
                              type="text"
                              disabled
                              value={srv.id}
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 text-xs text-neutral-500 font-mono outline-none cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: 3D WORK STREAM (HOMEPAGE CORRIDOR)                      */}
          {/* ============================================================ */}
          {activeTab === "stream" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    3D Work Stream — Homepage Corridor
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage the rotating 3D template cards shown in the "Your work, front and centre" section on the homepage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentStream = content.streamImages?.items || DEFAULT_SITE_CONTENT.streamImages.items;
                    const newItem: StreamImageData = {
                      id: `stream-${Date.now()}`,
                      src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
                      alt: "New Creare Mind Project Showcase",
                    };
                    updateSection("streamImages", { items: [...currentStream, newItem] });
                    toast.success("Added new card to 3D corridor!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Stream Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(content.streamImages?.items || DEFAULT_SITE_CONTENT.streamImages.items).map((item, idx) => {
                  const currentStream = content.streamImages?.items || DEFAULT_SITE_CONTENT.streamImages.items;
                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                    >
                      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                        <AdaptiveMedia
                          src={item.src}
                          alt={item.alt}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <button
                            type="button"
                            onClick={() => setPickerTarget({ section: "stream", index: idx })}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-900 shadow cursor-pointer transition-transform active:scale-95"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Change Photo</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.alt}
                            onChange={(e) => {
                              const updated = [...currentStream];
                              updated[idx] = { ...updated[idx], alt: e.target.value };
                              updateSection("streamImages", { items: updated });
                            }}
                            placeholder="Project Label / Title"
                            className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white font-medium transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Remove this card from the 3D stream?")) {
                                const updated = currentStream.filter((_, i) => i !== idx);
                                updateSection("streamImages", { items: updated });
                                toast.success("Stream card removed.");
                              }
                            }}
                            className="h-8 w-8 shrink-0 rounded-lg text-neutral-400 hover:text-red-600 grid place-items-center cursor-pointer transition-colors"
                            title="Remove card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.src}
                            onChange={(e) => {
                              const updated = [...currentStream];
                              updated[idx] = { ...updated[idx], src: e.target.value };
                              updateSection("streamImages", { items: updated });
                            }}
                            placeholder="Image URL"
                            className="w-full h-7 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2 text-[11px] text-neutral-600 font-mono outline-none focus:border-neutral-900 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setPickerTarget({ section: "stream", index: idx })}
                            className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                          >
                            Browse
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: TEMPLATES GALLERY                                        */}
          {/* ============================================================ */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Templates & Portfolio Archive</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage the showcase deliverables presented on the <Link to="/templates" className="text-neutral-900 font-medium underline">/templates</Link> page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newItem: TemplateItemData = {
                      id: `tpl-${Date.now()}`,
                      name: "New Client System",
                      cat: "Custom Websites",
                      tagline: "High-performance digital application built by Creare Mind.",
                      img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
                    };
                    updateSection("templates", {
                      items: [newItem, ...content.templates.items],
                    });
                    toast.success("Added new template project!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.templates.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Image Preview with Replace */}
                      <div className="relative aspect-video w-36 shrink-0 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                        <AdaptiveMedia
                          src={item.img}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPickerTarget({ section: "template", index: idx })}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Change Photo</span>
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...content.templates.items];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              updateSection("templates", { items: updated });
                            }}
                            className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                            placeholder="Project Name"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete ${item.name}?`)) {
                                const updated = content.templates.items.filter((_, i) => i !== idx);
                                updateSection("templates", { items: updated });
                                toast.success("Project removed.");
                              }
                            }}
                            className="ml-2 h-7 w-7 rounded-lg text-neutral-400 hover:text-red-600 transition-colors grid place-items-center cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <select
                          value={item.cat}
                          onChange={(e) => {
                            const updated = [...content.templates.items];
                            updated[idx] = { ...updated[idx], cat: e.target.value };
                            updateSection("templates", { items: updated });
                          }}
                          className="w-full h-7 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2 text-[11px] text-neutral-800 font-medium outline-none focus:border-neutral-900 focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="Custom Websites">Custom Websites</option>
                          <option value="Mobile Apps">Mobile Apps</option>
                          <option value="Shop Billing POS">Shop Billing POS</option>
                          <option value="Social Media & Video">Social Media & Video</option>
                          <option value="SaaS & Dashboards">SaaS & Dashboards</option>
                          <option value="Retail & Commerce">Retail & Commerce</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                        Tagline / Overview
                      </label>
                      <textarea
                        rows={2}
                        value={item.tagline}
                        onChange={(e) => {
                          const updated = [...content.templates.items];
                          updated[idx] = { ...updated[idx], tagline: e.target.value };
                          updateSection("templates", { items: updated });
                        }}
                        className="w-full rounded-lg border border-neutral-200 bg-[#FAF9F6] p-2 text-xs text-neutral-700 outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: GROWTH SHOWCASE CARDS                                    */}
          {/* ============================================================ */}
          {activeTab === "featureCards" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Growth Showcase Cards
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage the 5 visual cards shown in the "Everything your business needs to grow" homepage section.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentCards = content.featureCards?.items?.length
                      ? content.featureCards.items
                      : DEFAULT_SITE_CONTENT.featureCards.items;
                    const newCard: FeatureCardItemData = {
                      id: `fc-${Date.now()}`,
                      t: "New Growth Service",
                      d: "High-impact digital capability built for scaling modern brands.",
                      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                      link: "/services",
                    };
                    updateSection("featureCards", {
                      items: [...currentCards, newCard],
                    });
                    toast.success("Added new growth card!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Growth Card</span>
                </button>
              </div>

              {/* Section Headline Config */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={content.featureCards?.heading || "Everything your business needs to grow"}
                  onChange={(e) =>
                    updateSection("featureCards", {
                      heading: e.target.value,
                      items: content.featureCards?.items || DEFAULT_SITE_CONTENT.featureCards.items,
                    })
                  }
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all font-medium"
                  placeholder="Everything your business needs to grow"
                />
              </div>

              {/* Grid of Growth Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(content.featureCards?.items?.length
                  ? content.featureCards.items
                  : DEFAULT_SITE_CONTENT.featureCards.items
                ).map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Visual Image with Replace Button */}
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                        <AdaptiveMedia
                          src={card.img}
                          alt={card.t}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono text-white">
                          Card #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPickerTarget({ section: "featureCard", index: idx, field: "img" })
                          }
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1.5 cursor-pointer backdrop-blur-xs"
                        >
                          <Upload className="h-5 w-5" />
                          <span>Change Photo</span>
                        </button>
                      </div>

                      {/* Title & Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={card.t}
                          onChange={(e) => {
                            const currentCards = content.featureCards?.items?.length
                              ? content.featureCards.items
                              : DEFAULT_SITE_CONTENT.featureCards.items;
                            const updated = [...currentCards];
                            updated[idx] = { ...updated[idx], t: e.target.value };
                            updateSection("featureCards", { items: updated });
                          }}
                          className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                          placeholder="Card Title"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete card "${card.t}"?`)) {
                              const currentCards = content.featureCards?.items?.length
                                ? content.featureCards.items
                                : DEFAULT_SITE_CONTENT.featureCards.items;
                              const updated = currentCards.filter((_, i) => i !== idx);
                              updateSection("featureCards", { items: updated });
                              toast.success("Card removed.");
                            }
                          }}
                          className="h-8 w-8 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors grid place-items-center cursor-pointer shrink-0"
                          title="Delete Card"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={card.d}
                          onChange={(e) => {
                            const currentCards = content.featureCards?.items?.length
                              ? content.featureCards.items
                              : DEFAULT_SITE_CONTENT.featureCards.items;
                            const updated = [...currentCards];
                            updated[idx] = { ...updated[idx], d: e.target.value };
                            updateSection("featureCards", { items: updated });
                          }}
                          className="w-full rounded-lg border border-neutral-200 bg-[#FAF9F6] p-2 text-xs text-neutral-700 outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none"
                          placeholder="Card description text..."
                        />
                      </div>

                      {/* Target Link */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                          Target Link
                        </label>
                        <input
                          type="text"
                          value={card.link}
                          onChange={(e) => {
                            const currentCards = content.featureCards?.items?.length
                              ? content.featureCards.items
                              : DEFAULT_SITE_CONTENT.featureCards.items;
                            const updated = [...currentCards];
                            updated[idx] = { ...updated[idx], link: e.target.value };
                            updateSection("featureCards", { items: updated });
                          }}
                          className="w-full h-7 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2 text-[11px] text-neutral-600 outline-none focus:border-neutral-900 focus:bg-white transition-all font-mono"
                          placeholder="/services#web-dev"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: INTERACTIVE FEATURE TABS & MOCKUPS                       */}
          {/* ============================================================ */}
          {activeTab === "featureTabs" && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Interactive Showcase Tabs
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage the 7 interactive tabs shown in the "Grow your business" homepage section. You can customize the full-bleed card photo or video, headline, and subtitle for every tab.
                </p>
              </div>

              {/* Section Headlines */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={content.featureTabs?.heading || "Grow your business"}
                      onChange={(e) =>
                        updateSection("featureTabs", {
                          heading: e.target.value,
                          items: content.featureTabs?.items || DEFAULT_SITE_CONTENT.featureTabs.items,
                        })
                      }
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all font-medium"
                      placeholder="Grow your business"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={
                        content.featureTabs?.subtitle ||
                        "Everything from web & mobile development to shop billing and digital growth."
                      }
                      onChange={(e) =>
                        updateSection("featureTabs", {
                          subtitle: e.target.value,
                          items: content.featureTabs?.items || DEFAULT_SITE_CONTENT.featureTabs.items,
                        })
                      }
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                      placeholder="Subtitle description..."
                    />
                  </div>
                </div>
              </div>

              {/* List of 7 Tabs */}
              <div className="space-y-6">
                {(content.featureTabs?.items?.length
                  ? content.featureTabs.items
                  : DEFAULT_SITE_CONTENT.featureTabs.items
                ).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-300 transition-all space-y-4"
                  >
                    {/* Header pill & Title */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-neutral-900 text-white px-2.5 py-0.5 text-[10px] font-mono font-semibold">
                          Tab #{idx + 1}
                        </span>
                        <span className="font-semibold text-sm text-neutral-900">
                          {item.tab} — "{item.serifTitle}"
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        Target Page: <span className="text-neutral-900 font-medium">{item.page}</span>
                      </div>
                    </div>

                    {/* Showcase Card Photo / Video */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2 font-semibold">
                        Showcase Card Photo / Video
                      </p>
                      <div className="max-w-md">
                        <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-600 font-semibold">
                            <span>Card Backdrop Media</span>
                            <span className="text-[9px] text-neutral-400">Full-bleed photo</span>
                          </div>
                          <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 group">
                            <AdaptiveMedia src={item.bgImage} alt="" className="size-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setPickerTarget({
                                  section: "featureTab",
                                  index: idx,
                                  field: "bgImage",
                                  serial: 1,
                                } as any)
                              }
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Change Photo / Video</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-neutral-400">Atmospheric background media for this card</p>
                        </div>
                      </div>
                    </div>

                    {/* Copywriting Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                          Editorial Serif Headline
                        </label>
                        <input
                          type="text"
                          value={item.serifTitle}
                          onChange={(e) => {
                            const currentTabs = content.featureTabs?.items?.length
                              ? content.featureTabs.items
                              : DEFAULT_SITE_CONTENT.featureTabs.items;
                            const updated = [...currentTabs];
                            updated[idx] = { ...updated[idx], serifTitle: e.target.value };
                            updateSection("featureTabs", { items: updated });
                          }}
                          className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                          placeholder="Offer services"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                          Tab Nav Label
                        </label>
                        <input
                          type="text"
                          value={item.tab}
                          onChange={(e) => {
                            const currentTabs = content.featureTabs?.items?.length
                              ? content.featureTabs.items
                              : DEFAULT_SITE_CONTENT.featureTabs.items;
                            const updated = [...currentTabs];
                            updated[idx] = { ...updated[idx], tab: e.target.value };
                            updateSection("featureTabs", { items: updated });
                          }}
                          className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                          placeholder="Services"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                          Subtitle Description
                        </label>
                        <input
                          type="text"
                          value={item.subtitle}
                          onChange={(e) => {
                            const currentTabs = content.featureTabs?.items?.length
                              ? content.featureTabs.items
                              : DEFAULT_SITE_CONTENT.featureTabs.items;
                            const updated = [...currentTabs];
                            updated[idx] = { ...updated[idx], subtitle: e.target.value };
                            updateSection("featureTabs", { items: updated });
                          }}
                          className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-700 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                          placeholder="Promote your experiences and offerings..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: HERO & VIDEOS                                          */}
          {/* ============================================================ */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Hero & Video Loop Manager</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure the primary hero headline, sub-headline, and the looping video playlist.
                </p>
              </div>

              {/* Text Fields */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      Top Badge Label
                    </label>
                    <input
                      type="text"
                      value={content.hero.badge}
                      onChange={(e) => updateSection("hero", { badge: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={content.hero.heading}
                      onChange={(e) => updateSection("hero", { heading: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                    Sub-headline Description
                  </label>
                  <textarea
                    rows={2}
                    value={content.hero.subheading}
                    onChange={(e) => updateSection("hero", { subheading: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-[#FAF9F6] p-3 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Primary CTA Button
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={content.hero.ctaPrimaryText}
                        onChange={(e) => updateSection("hero", { ctaPrimaryText: e.target.value })}
                        placeholder="Text (e.g. Explore Works)"
                        className="w-1/2 h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                      />
                      <input
                        type="text"
                        value={content.hero.ctaPrimaryLink}
                        onChange={(e) => updateSection("hero", { ctaPrimaryLink: e.target.value })}
                        placeholder="Link (e.g. /templates)"
                        className="w-1/2 h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-600 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Secondary CTA Button
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={content.hero.ctaSecondaryText}
                        onChange={(e) => updateSection("hero", { ctaSecondaryText: e.target.value })}
                        placeholder="Text (e.g. Start a Project)"
                        className="w-1/2 h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                      />
                      <input
                        type="text"
                        value={content.hero.ctaSecondaryLink}
                        onChange={(e) => updateSection("hero", { ctaSecondaryLink: e.target.value })}
                        placeholder="Link (e.g. /contact)"
                        className="w-1/2 h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-600 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Playlist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Hero Looping Video Playlist ({content.hero.videos.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPickerTarget({ section: "hero" })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Video from Library</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {content.hero.videos.map((vidUrl, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-neutral-200 bg-white p-3 flex items-center gap-4 shadow-xs hover:border-neutral-300 transition-colors"
                    >
                      <div className="relative aspect-video w-28 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200">
                        <video src={vidUrl} className="size-full object-cover" muted loop />
                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-white">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={vidUrl}
                          onChange={(e) => {
                            const updated = [...content.hero.videos];
                            updated[idx] = e.target.value;
                            updateSection("hero", { videos: updated });
                          }}
                          placeholder="Video URL"
                          className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white font-mono transition-all"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = content.hero.videos.filter((_, i) => i !== idx);
                          updateSection("hero", { videos: updated });
                          toast.success("Video removed from hero playlist.");
                        }}
                        className="h-8 w-8 rounded-lg text-neutral-400 hover:text-red-600 transition-colors grid place-items-center cursor-pointer"
                        title="Remove video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ============================================================ */}
              {/* HERO 3D CAROUSEL SHOWCASE CARDS (Botanica, Borough Barber, Balance) */}
              {/* ============================================================ */}
              <div className="space-y-4 pt-6 border-t border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      Hero 3D Showcase Cards ({(content.hero?.cards || DEFAULT_SITE_CONTENT.hero.cards).length})
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Change the images, titles, and details for the rotating 3D cards displayed directly below the hero headline on the homepage.
                    </p>
                  </div>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />
                    <span>View on Homepage</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(content.hero?.cards || DEFAULT_SITE_CONTENT.hero.cards).map((card, idx) => {
                    const heroCards = content.hero?.cards || DEFAULT_SITE_CONTENT.hero.cards;
                    return (
                      <div
                        key={card.id || idx}
                        className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3.5 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                      >
                        {/* Header badge */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                            Card #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 truncate max-w-[150px]">
                            {card.name || card.title}
                          </span>
                        </div>

                        {/* Card Image with Hover Change Photo button */}
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group">
                          <AdaptiveMedia
                            src={card.image}
                            alt={card.name || card.title}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <button
                              type="button"
                              onClick={() => setPickerTarget({ section: "heroCard", index: idx })}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-900 shadow-lg cursor-pointer transition-transform active:scale-95"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Change / Upload Photo</span>
                            </button>
                          </div>
                        </div>

                        {/* Title & Subtitle inputs */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Card Title
                            </label>
                            <input
                              type="text"
                              value={card.title || card.name}
                              onChange={(e) => {
                                const updated = [...heroCards];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                updateSection("hero", { cards: updated });
                              }}
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                              placeholder="e.g. Borough Barber"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Subtitle / Tagline
                            </label>
                            <input
                              type="text"
                              value={card.subtitle || ""}
                              onChange={(e) => {
                                const updated = [...heroCards];
                                updated[idx] = { ...updated[idx], subtitle: e.target.value };
                                updateSection("hero", { cards: updated });
                              }}
                              className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2.5 text-xs text-neutral-700 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                              placeholder="e.g. Precision Grooming"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                              Image URL / Cloudinary Link
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={card.image}
                                onChange={(e) => {
                                  const updated = [...heroCards];
                                  updated[idx] = { ...updated[idx], image: e.target.value };
                                  updateSection("hero", { cards: updated });
                                }}
                                placeholder="Paste image link or upload"
                                className="w-full h-7 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-2 text-[11px] text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white font-mono transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setPickerTarget({ section: "heroCard", index: idx })}
                                className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-2.5 text-[11px] font-semibold text-neutral-700 cursor-pointer"
                              >
                                Browse
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: SITE SETTINGS & BRANDING                               */}
          {/* ============================================================ */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Global Site & Contact Info</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Update public contact details, announcement bar, and social channels displayed in the header and footer.
                </p>
              </div>

              {/* Announcement Bar */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-neutral-900">Top Announcement Banner</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.branding.announcement.enabled}
                      onChange={(e) =>
                        updateSection("branding", {
                          announcement: {
                            ...content.branding.announcement,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Banner Message
                    </label>
                    <input
                      type="text"
                      value={content.branding.announcement.text}
                      onChange={(e) =>
                        updateSection("branding", {
                          announcement: {
                            ...content.branding.announcement,
                            text: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Action Link URL
                    </label>
                    <input
                      type="text"
                      value={content.branding.announcement.linkUrl}
                      onChange={(e) =>
                        updateSection("branding", {
                          announcement: {
                            ...content.branding.announcement,
                            linkUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900">Contact & Support Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      <Phone className="h-3 w-3 text-neutral-900" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={content.branding.phone}
                      onChange={(e) => updateSection("branding", { phone: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      <Mail className="h-3 w-3 text-neutral-900" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={content.branding.email}
                      onChange={(e) => updateSection("branding", { email: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      <MapPin className="h-3 w-3 text-neutral-900" />
                      Physical Address / Headquarters
                    </label>
                    <input
                      type="text"
                      value={content.branding.address}
                      onChange={(e) => updateSection("branding", { address: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 font-semibold">
                      <Clock className="h-3 w-3 text-neutral-900" />
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={content.branding.workingHours}
                      onChange={(e) => updateSection("branding", { workingHours: e.target.value })}
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900">Social Media Profiles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={content.branding.instagramUrl}
                      onChange={(e) => updateSection("branding", { instagramUrl: e.target.value })}
                      className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={content.branding.linkedinUrl}
                      onChange={(e) => updateSection("branding", { linkedinUrl: e.target.value })}
                      className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      YouTube URL
                    </label>
                    <input
                      type="text"
                      value={content.branding.youtubeUrl}
                      onChange={(e) => updateSection("branding", { youtubeUrl: e.target.value })}
                      className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={content.branding.githubUrl}
                      onChange={(e) => updateSection("branding", { githubUrl: e.target.value })}
                      className="w-full h-8 rounded-lg border border-neutral-200 bg-[#FAF9F6] px-3 text-xs text-neutral-800 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Asset Picker Modal (Select from Media Library or URL) */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
          <div className="max-w-2xl w-full max-h-[85vh] rounded-2xl border border-neutral-200 bg-white flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Choose Asset from Cloudinary Library</h3>
                <p className="text-[11px] text-neutral-500">Click any uploaded image or paste an image URL below.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File Now</span>
                </button>
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget(null)}
                  className="h-8 w-8 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors grid place-items-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Direct URL input */}
            <div className="p-4 border-b border-neutral-100 bg-[#FAF9F6]">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                Or Paste Direct Image / Video URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                      handleApplyPickedMedia((e.target as HTMLInputElement).value);
                    }
                  }}
                  id="custom-url-input"
                  className="flex-1 h-8 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-900 outline-none focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("custom-url-input") as HTMLInputElement;
                    if (el?.value) handleApplyPickedMedia(el.value);
                  }}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Apply URL
                </button>
              </div>
            </div>

            {/* Media Library Thumbnails */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {mediaList.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  <p>No media found in Cloudinary library yet.</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-neutral-900 font-medium underline"
                  >
                    Upload a photo or video
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleApplyPickedMedia(m.url)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer hover:border-neutral-900 transition-all hover:scale-105 shadow-xs"
                    >
                      {m.resource_type === "video" || isVideoMedia(m.url) ? (
                        <div className="relative size-full bg-neutral-950 flex items-center justify-center">
                          <video src={m.url} muted loop autoPlay playsInline className="size-full object-cover opacity-80" />
                          <div className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-mono text-white flex items-center gap-1 border border-white/10">
                            <Video className="h-2.5 w-2.5 text-blue-400" />
                            <span>VIDEO</span>
                          </div>
                        </div>
                      ) : (
                        <AdaptiveMedia src={m.url} alt="" className="size-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-[10px] font-bold">
                        Select
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md grid place-items-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-12 right-0 h-9 w-9 rounded-full bg-white/90 text-neutral-900 grid place-items-center hover:bg-white transition-colors cursor-pointer shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>

            {previewMedia.resource_type === "video" || isVideoMedia(previewMedia.url) ? (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl border border-neutral-200 bg-black"
              />
            ) : (
              <AdaptiveMedia
                src={previewMedia.url}
                alt=""
                className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl border border-neutral-200 bg-white object-contain"
              />
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleDownloadMedia(previewMedia.url, previewMedia.original_filename)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download {previewMedia.resource_type === "video" || isVideoMedia(previewMedia.url) ? "Video" : "Photo"}</span>
              </button>
              <button
                onClick={() => handleCopyUrl(previewMedia.url)}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Asset URL</span>
              </button>
              <a
                href={previewMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 text-xs text-neutral-800 transition-colors shadow-sm font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5 text-neutral-600" />
                <span>Open in Cloudinary CDN</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
