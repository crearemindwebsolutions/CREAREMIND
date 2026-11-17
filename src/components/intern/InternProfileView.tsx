import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  ShieldCheck,
  Globe,
  Github,
  Linkedin,
  Save,
  Check,
  AlertCircle,
  Plus,
  X,
  Camera,
} from "lucide-react";
import type { InternProfile } from "@/lib/intern-data";

interface InternProfileViewProps {
  profile: InternProfile;
  onUpdateProfile: (updated: Partial<InternProfile>) => void;
}

export function InternProfileView({
  profile,
  onUpdateProfile,
}: InternProfileViewProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    bio: profile.bio,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
    emergencyContact: profile.emergencyContact,
  });

  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...formData,
      skills,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Profile Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with Initials & Upload button */}
          <div className="relative group shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-900 text-white text-2xl font-black shadow-xs font-mono">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <button
              onClick={() => alert("Upload photo feature: Please select a JPEG or PNG profile picture.")}
              title="Change profile avatar"
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-neutral-700 shadow-md border border-neutral-200 hover:text-neutral-900 cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono text-xs font-semibold text-neutral-400">
                {profile.id}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                Active Intern
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-neutral-900">
              {profile.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-neutral-600">{profile.role}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-neutral-400" />
                {profile.college}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                {profile.startDate} &mdash; {profile.endDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Verified Internship Details (Read-only) */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Internship Terms (Official Record)
              </h3>
              <p className="text-[11px] text-neutral-500">
                These fields are locked by HR and engineering administration.
              </p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Read Only</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/60">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Official Email
              </span>
              <span className="text-xs font-semibold text-neutral-800">{profile.email}</span>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/60">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Assigned Mentor
              </span>
              <span className="text-xs font-semibold text-neutral-800">
                {profile.mentorName} ({profile.mentorRole.split("&")[0]})
              </span>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200/60">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Degree &amp; Department
              </span>
              <span className="text-xs font-semibold text-neutral-800 truncate block">
                {profile.department}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Editable Personal Information */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900">
              Personal &amp; Contact Details
            </h3>
            <p className="text-[11px] text-neutral-500">
              Keep your contact and emergency information updated for communications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Portfolio / Personal Website URL
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) =>
                  setFormData({ ...formData, portfolioUrl: e.target.value })
                }
                placeholder="https://yourname.dev"
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Short Professional Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills & Badges */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900">
              Technical Skills &amp; Stack
            </h3>
            <p className="text-[11px] text-neutral-500">
              Add the frameworks, libraries, and tools you use in your daily internship tasks.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Docker, GraphQL, Redis..."
              className="flex-1 rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-2 text-xs font-semibold cursor-pointer"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-neutral-500">
            {isSaved ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <Check className="h-4 w-4" /> Changes saved successfully!
              </span>
            ) : (
              <span>Review your changes before clicking save.</span>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}

