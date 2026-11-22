import React, { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { InternProfile } from "@/lib/intern-data";

interface InternHelpViewProps {
  profile: InternProfile;
}

export function InternHelpView({ profile }: InternHelpViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How are daily shift hours verified and logged?",
      a: "Attendance is recorded using the Check-In and Check-Out buttons on the Attendance desk. Maintain an average of 8-9 hours per working day. Timestamps are verified by your mentor and used for stipend processing.",
    },
    {
      q: "What is the procedure for Pull Request submission?",
      a: "Create branches following 'feat(module): description' or 'fix(module): description'. Once ready, submit the PR URL under 'My Tasks' -> 'Submit Work' before 06:00 PM on sprint deadline days.",
    },
    {
      q: "How can I request college exam leave or On-Duty permissions?",
      a: "Navigate to the Attendance tab and click 'Request Leave / OD'. Submit the requested date and a brief description at least 48 hours in advance so your mentor can adjust sprint targets.",
    },
    {
      q: "When and how are internship certificates and letters issued?",
      a: "Official Creare Mind Internship Completion Certificates and University recommendation letters are signed by founder Gowthaman PR upon successful completion of your internship tenure and capstone project.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 border border-neutral-200">
          <HelpCircle className="h-3 w-3 text-neutral-700" />
          <span>Support &amp; Mentorship Desk</span>
        </div>
        <h2 className="mt-2 text-xl font-bold text-neutral-900">
          Help, Mentorship &amp; Studio Guidelines
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Get in touch with your assigned engineering mentor, review FAQs, or report environment issues.
        </p>
      </div>

      {/* Mentor Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mentor 1: Gowthaman PR */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-900 text-white font-bold text-sm shadow-xs font-mono">
              GP
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Gowthaman PR</h3>
              <p className="text-xs text-neutral-500">Head of Engineering &amp; Founder</p>
            </div>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Direct mentor for React 19 architecture, POS billing engine, and production code reviews.
          </p>
          <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700">
            <a
              href="mailto:gowthamandharshan4@gmail.com"
              className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              <span>gowthamandharshan4@gmail.com</span>
            </a>
            <a
              href="https://wa.me/916382068495"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-emerald-800 transition-colors font-medium text-emerald-700"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct WhatsApp Desk: +91 63820 68495</span>
            </a>
          </div>
        </div>

        {/* Mentor 2: Dheepan Raj */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-900 text-white font-bold text-sm shadow-xs font-mono">
              DR
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Dheepan Raj</h3>
              <p className="text-xs text-neutral-500">Technical Co-Founder &amp; Product</p>
            </div>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Product requirements, client portal UI/UX specifications, and Figma asset alignment.
          </p>
          <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700">
            <a
              href="mailto:crearemindwebsolutions@gmail.com"
              className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              <span>crearemindwebsolutions@gmail.com</span>
            </a>
            <span className="flex items-center gap-2 text-neutral-500">
              <Phone className="h-3.5 w-3.5 text-neutral-400" />
              <span>Studio Desk Line: Available during shifts</span>
            </span>
          </div>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-neutral-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform ${
                      isOpen ? "rotate-180 text-neutral-900" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-neutral-600 leading-relaxed bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InternSettingsView({ profile }: { profile: InternProfile }) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [standupAlerts, setStandupAlerts] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-neutral-900">Account &amp; Notification Settings</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Manage your communication preferences and local portal session.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          Notification Preferences
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
            <div>
              <span className="font-semibold text-neutral-800 block">Daily Standup Reminders</span>
              <span className="text-neutral-400 text-[11px]">Receive notification 15 mins before 10:00 AM standup</span>
            </div>
            <input
              type="checkbox"
              checked={standupAlerts}
              onChange={(e) => setStandupAlerts(e.target.checked)}
              className="rounded accent-neutral-900 h-4 w-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
            <div>
              <span className="font-semibold text-neutral-800 block">Task Assignment &amp; Deadline Alerts</span>
              <span className="text-neutral-400 text-[11px]">Notify when a new task is assigned or due within 24h</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded accent-neutral-900 h-4 w-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
            <div>
              <span className="font-semibold text-neutral-800 block">Mentor Feedback &amp; PR Approvals</span>
              <span className="text-neutral-400 text-[11px]">Notify when mentor rates a deliverable</span>
            </div>
            <input
              type="checkbox"
              checked={reviewAlerts}
              onChange={(e) => setReviewAlerts(e.target.checked)}
              className="rounded accent-neutral-900 h-4 w-4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          Intern Security &amp; Credentials
        </h3>
        <p className="text-xs text-neutral-600">
          Your portal session is tied to your verified email: <strong>{profile.email}</strong>.
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-xs text-neutral-500">Internship ID: {profile.id}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(profile.id);
              alert("Intern ID copied to clipboard!");
            }}
            className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
          >
            Copy ID
          </button>
        </div>
      </div>
    </div>
  );
}

