import { supabase } from "@/integrations/supabase/client";

export type ProjectStage =
  | "Discovery"
  | "Design & Wireframe"
  | "In Development"
  | "Client Review & QA"
  | "Completed"
  | "Maintenance";

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface AdminProject {
  id: string; // e.g. "CM-PRJ-101"
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "Custom Website" | "Mobile App" | "Shop Billing POS" | "Video Editing & Reels" | "Custom Software / ERP";
  budget: number;
  currency: "INR" | "USD" | "EUR";
  stage: ProjectStage;
  progressPercent: number; // 0 - 100
  startDate: string;
  targetDeliveryDate: string;
  liveUrl?: string;
  assignedLead: string; // "Gowthaman" | "Dheepan Raj" | etc.
  milestones: ProjectMilestone[];
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = "creare_admin_projects";

// Sample/dummy IDs to automatically clean up from production storage
const FAKE_PROJECT_IDS = new Set(["CM-PRJ-101", "CM-PRJ-102", "CM-PRJ-103"]);

export function isFakeProject(item: any): boolean {
  if (!item) return true;
  const id = String(item.id || "").trim();
  const client = String(item.clientName || "").toLowerCase();
  if (FAKE_PROJECT_IDS.has(id)) return true;
  if (client.includes("royal textiles") || client.includes("aura haute") || client.includes("freshmart")) {
    return true;
  }
  return false;
}

export function getStoredProjects(): AdminProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any fake/sample items from previous versions
        const genuine = parsed.filter((p) => !isFakeProject(p));
        if (genuine.length !== parsed.length) {
          saveProjectsList(genuine);
        }
        return genuine;
      }
    }
  } catch (e) {
    console.warn("Failed to load admin projects from localStorage:", e);
  }
  return [];
}

export function saveProjectsList(projects: AdminProject[]): void {
  if (typeof window === "undefined") return;
  try {
    const realOnly = projects.filter((p) => !isFakeProject(p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
    window.dispatchEvent(new CustomEvent("creare_projects_updated", { detail: realOnly }));
  } catch (e) {
    console.error("Failed to save admin projects to localStorage:", e);
  }
}

/**
 * Synchronize full projects collection to cloud
 */
export async function syncAllProjectsToCloud(projects: AdminProject[]): Promise<void> {
  try {
    for (const p of projects) {
      await saveProjectToCloud(p);
    }
  } catch (e) {
    console.warn("Failed to sync projects to cloud:", e);
  }
}

/**
 * Fetch all admin projects from Supabase cloud database
 */
export async function fetchProjectsFromCloud(): Promise<AdminProject[]> {
  try {
    const { data, error } = await supabase
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "admin_project")
      .order("created_at", { ascending: false });

    const cloudProjects: AdminProject[] = [];
    const seenIds = new Set<string>();
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.url) {
            const parsed = JSON.parse(row.url) as AdminProject & { isDeleted?: boolean };
            if (parsed && parsed.id) {
              if (seenIds.has(parsed.id)) continue;
              seenIds.add(parsed.id);
              if (parsed.isDeleted) continue;
              if (!isFakeProject(parsed)) {
                cloudProjects.push(parsed);
              }
            }
          }
        } catch {}
      }
    }

    const local = getStoredProjects();
    const map = new Map<string, AdminProject>();
    for (const prj of [...cloudProjects, ...local]) {
      if (!map.has(prj.id)) {
        map.set(prj.id, prj);
      }
    }
    const combined = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveProjectsList(combined);
    return combined;
  } catch (err) {
    console.warn("Could not fetch projects from Supabase cloud:", err);
    return getStoredProjects();
  }
}

/**
 * Save an individual project to Supabase cloud database
 */
export async function saveProjectToCloud(project: AdminProject): Promise<boolean> {
  try {
    const prjKey = `CREARE_PROJECT_${project.id}`;
    await supabase.from("media").delete().eq("public_id", prjKey);
    const { error } = await supabase.from("media").insert({
      public_id: prjKey,
      resource_type: "admin_project",
      url: JSON.stringify(project),
      original_filename: project.title,
    });

    const current = getStoredProjects();
    const updated = [project, ...current.filter((p) => p.id !== project.id)];
    saveProjectsList(updated);

    return !error;
  } catch (err) {
    console.warn("Could not save project to cloud:", err);
    return false;
  }
}

/**
 * Delete a project from Supabase cloud database
 */
export async function deleteProjectFromCloud(projectId: string): Promise<boolean> {
  try {
    const prjKey = `CREARE_PROJECT_${projectId}`;
    // Insert deletion tombstone
    await supabase.from("media").insert({
      public_id: prjKey,
      resource_type: "admin_project",
      url: JSON.stringify({ id: projectId, isDeleted: true }),
      original_filename: `DELETED_${projectId}`,
    });

    const current = getStoredProjects();
    const updated = current.filter((p) => p.id !== projectId);
    saveProjectsList(updated);

    return true;
  } catch (err) {
    console.warn("Could not delete project from cloud:", err);
    return false;
  }
}
