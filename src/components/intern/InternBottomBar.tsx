import React, { useState } from "react";
import {
  Pin,
  MessageSquare,
  Users,
  FileText,
  MessageCircle,
  HelpCircle,
  Search,
  Maximize2,
  X,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import type { InternProfile } from "@/lib/intern-data";

interface InternBottomBarProps {
  profile: InternProfile;
  onOpenHelp: () => void;
  onOpenSearch: () => void;
}

export function InternBottomBar({
  profile,
  onOpenHelp,
  onOpenSearch,
}: InternBottomBarProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setShowFeedbackModal(false);
      setFeedbackText("");
      alert("Feedback received! Thank you for helping improve the Creare Mind engineering experience.");
    }, 1200);
  };

  return (
    <>
      {/* Fixed Bottom Utility Bar in Creare Mind Colors */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex h-9 items-center justify-between border-t border-neutral-200/90 bg-white/95 px-3 sm:px-6 backdrop-blur-md text-[11px] font-medium text-neutral-600 select-none">
        {/* Left Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => alert("My Pins: No pinned tasks yet.")}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <Pin className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden xs:inline">My Pins</span>
          </button>

          <button
            onClick={() => alert("Chats: Instant messaging with team mentors is active.")}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
            <span>Chats</span>
          </button>

          <button
            onClick={() => alert("Contacts: Studio leadership and peer interns directory.")}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Contacts</span>
          </button>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          {/* Offer Letter Status in Creare Mind Signature Styling */}
          <button
            onClick={() => setShowOfferModal(true)}
            className="flex items-center gap-1.5 font-semibold text-neutral-900 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <FileText className="h-3.5 w-3.5 text-neutral-700" />
            <span>Offer Letter Status</span>
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="hidden sm:flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5 text-neutral-400" />
            <span>Feedback</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden md:inline">Need Help?</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="text-neutral-500 hover:text-neutral-900 cursor-pointer"
            title="Search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="text-neutral-500 hover:text-neutral-900 cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>

      {/* Offer Letter Status Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-900 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Internship Offer Letter
                  </h3>
                  <p className="text-xs text-neutral-400">CREARE MIND Engineering Studio</p>
                </div>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Offer Accepted &amp; Active
                </span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                  Verified
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Offer Letter reference <strong>CM-INT-{profile.id || "00000000"}</strong> has been digitally signed and ratified by Creare Mind core engineering leadership.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Candidate</span>
                <strong className="text-neutral-900">{profile.name}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Designation</span>
                <strong className="text-neutral-900">{profile.role}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Tenure</span>
                <span className="text-neutral-700 font-mono">{profile.startDate} &mdash; {profile.endDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Reporting Mentor</span>
                <span className="text-neutral-700">{profile.mentorName}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Status: Signed PDF on file</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  onClick={() => alert(`Downloading signed Offer Letter PDF (CM-INT-${profile.id || "00000000"}.pdf)...`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Send Workspace Feedback
                </h3>
                <p className="text-xs text-neutral-500">
                  Share suggestions to improve the Creare Mind engineering studio and internship portal.
                </p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-3">
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What can we do to improve your daily workflows, mentorship, or tools?..."
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSent}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  {feedbackSent ? "Sending..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
