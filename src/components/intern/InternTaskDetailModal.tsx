import React, { useState } from "react";
import {
  X,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  Send,
  Upload,
  FileText,
  Star,
  Check,
  Sparkles,
  Link2,
} from "lucide-react";
import type { InternTask } from "@/lib/intern-data";

interface InternTaskDetailModalProps {
  task: InternTask | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: InternTask["status"]) => void;
  onSubmitWork: (
    taskId: string,
    data: { notes: string; link: string; fileCount?: number }
  ) => void;
}

export function InternTaskDetailModal({
  task,
  onClose,
  onUpdateStatus,
  onSubmitWork,
}: InternTaskDetailModalProps) {
  if (!task) return null;

  const [notes, setNotes] = useState(task.submission?.notes || "");
  const [link, setLink] = useState(task.submission?.link || "");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const priorityStyles = {
    High: "bg-rose-50 text-rose-700 border-rose-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-neutral-100 text-neutral-600 border-neutral-200",
  }[task.priority];

  const statusStyles = {
    "Not Started": "bg-neutral-100 text-neutral-700 border border-neutral-200",
    "In Progress": "bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200",
    "Under Review": "bg-amber-50 text-amber-800 font-semibold border border-amber-200",
    Completed: "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200",
  }[task.status];

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setAttachedFiles((prev) => [...prev, ...names]);
    }
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitWork(task.id, {
        notes,
        link,
        fileCount: attachedFiles.length || 1,
      });
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 bg-neutral-50/70 p-5">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-neutral-500">
                {task.id}
              </span>
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${priorityStyles}`}
              >
                {task.priority} Priority
              </span>
              <span className="text-neutral-300">&bull;</span>
              <span className="text-xs text-neutral-500 font-medium truncate">
                {task.project}
              </span>
            </div>
            <h3 className="mt-1.5 text-base sm:text-lg font-bold text-neutral-900">
              {task.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-neutral-700">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Assigned Date
              </span>
              <span className="font-semibold text-neutral-800">{task.assignedDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Due Deadline
              </span>
              <span className="font-semibold text-neutral-900 font-mono">{task.dueDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Current Status
              </span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5 ${statusStyles}`}
              >
                {task.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Update Status
              </span>
              <select
                value={task.status}
                onChange={(e) =>
                  onUpdateStatus(task.id, e.target.value as InternTask["status"])
                }
                className="mt-0.5 rounded border border-neutral-300 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-800 focus:border-neutral-900 focus:outline-hidden"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono mb-1.5">
              Task Objectives &amp; Description
            </h4>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed bg-white p-3.5 rounded-xl border border-neutral-200/70">
              {task.description}
            </p>
          </div>

          {/* Deliverables Checklist */}
          {task.deliverables && task.deliverables.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono mb-2">
                Required Deliverables
              </h4>
              <div className="space-y-1.5">
                {task.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-neutral-200/60 bg-neutral-50/50 p-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-neutral-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments / Specifications */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono mb-2">
                Reference Documents &amp; Specs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="h-4 w-4 text-neutral-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-neutral-800 truncate">
                          {file.name}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {file.size} &bull; {file.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading reference spec: ${file.name}`)}
                      className="text-neutral-900 hover:text-neutral-700 text-xs font-semibold px-2 py-1 rounded hover:bg-neutral-100 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentor Feedback (if present) */}
          {task.feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between text-emerald-800">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span className="font-bold text-xs">
                    Mentor Feedback &bull; {task.feedback.rating}/5.0
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">
                  Reviewed {task.feedback.date}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-700 leading-relaxed italic">
                &ldquo;{task.feedback.comment}&rdquo;
              </p>
              <div className="mt-2 text-[11px] text-emerald-900 font-semibold">
                &mdash; {task.feedback.mentorName}
              </div>
            </div>
          )}

          {/* Previous Submission Log (if present) */}
          {task.submission && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Last Submitted Deliverable
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {task.submission.submittedAt}
                </span>
              </div>
              {task.submission.link && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-900 font-mono truncate">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <a
                    href={task.submission.link}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline truncate"
                  >
                    {task.submission.link}
                  </a>
                </div>
              )}
              {task.submission.notes && (
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {task.submission.notes}
                </p>
              )}
            </div>
          )}

          {/* Submission Section */}
          <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-neutral-900" />
                  Submit Task Deliverable
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Provide your Pull Request URL, live demo, or upload deliverables for mentor review.
                </p>
              </div>
              {submitSuccess && (
                <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Submitted for Review!
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Deliverable URL (GitHub PR / Figma / Staging Link)
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://github.com/crearemind/.../pull/48"
                    className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-8 pr-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Submission Notes &amp; Implementation Summary
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain what was built, testing steps performed, and any edge cases handled..."
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              {/* Upload Deliverable File */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Attach Screenshots, Logs, or Build Artifacts (Optional)
                </label>
                <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-center hover:bg-neutral-50 transition-colors">
                  <Upload className="h-5 w-5 text-neutral-400 mb-1" />
                  <span className="text-[11px] text-neutral-600 font-medium">
                    Drag &amp; drop files here, or{" "}
                    <label className="text-neutral-900 hover:underline font-semibold cursor-pointer">
                      browse
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleSimulateFileUpload}
                      />
                    </label>
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    Supports ZIP, PNG, PDF, JSON up to 25 MB
                  </span>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {attachedFiles.map((fn, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700"
                      >
                        <FileText className="h-3 w-3 text-neutral-500" />
                        {fn}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!notes.trim() && !link.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Work for Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-2xs">
            <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-900">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">
                Confirm Work Submission?
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                This will submit your deliverables for{" "}
                <strong className="text-neutral-800">{task.id}</strong> to your assigned mentor (
                {task.feedback?.mentorName || "Gowthaman PR"}) and move the task to{" "}
                <strong className="text-amber-800">&ldquo;Under Review&rdquo;</strong>.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Back to Editing
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Yes, Submit Work"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

