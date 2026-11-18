import { useState } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  User,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Inbox,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_COMMS_TEMPLATES,
  buildWhatsAppLink,
  type CommsTemplate,
} from "@/lib/admin-comms";
import type { ClientInquiry } from "@/lib/inquiries";
import { recordAdminLog } from "@/lib/admin-logs";

interface AdminCommsViewProps {
  inquiries: ClientInquiry[];
  adminEmail: string;
}

export function AdminCommsView({ inquiries, adminEmail }: AdminCommsViewProps) {
  const latestInquiry = inquiries.length > 0 ? inquiries[0] : null;

  const [selectedTemplate, setSelectedTemplate] = useState<CommsTemplate>(
    DEFAULT_COMMS_TEMPLATES[0] ?? {
      id: "proposal_initial",
      name: "Initial Discovery & Proposal",
      category: "Proposal",
      subject: "Custom Digital Solution Proposal — Creare Mind Studio",
      message: "Hello {{clientName}},\n\nThank you for reaching out to Creare Mind regarding {{serviceName}}.",
    }
  );
  const [recipientName, setRecipientName] = useState(latestInquiry?.name || "");
  const [recipientPhone, setRecipientPhone] = useState(latestInquiry?.phone || "");
  const [serviceName, setServiceName] = useState(latestInquiry?.service || "");
  const [amountVal, setAmountVal] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Compute interpolated message
  const interpolatedMessage = selectedTemplate.message
    .replace(/{name}/g, recipientName || "[Client Name]")
    .replace(/{service}/g, serviceName || "[Service]")
    .replace(/{amount}/g, amountVal || "[Amount]")
    .replace(/{link}/g, previewLink || "[Staging Link]")
    .replace(/{invoiceNumber}/g, invoiceNumber || "[Invoice Number]");

  const handleSelectInquiry = (inq: ClientInquiry) => {
    setRecipientName(inq.name);
    setRecipientPhone(inq.phone);
    setServiceName(inq.service || "Custom Software");
    toast.success(`Loaded details for ${inq.name}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(interpolatedMessage);
    setCopied(true);
    toast.success("WhatsApp message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    if (!recipientPhone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const url = buildWhatsAppLink(recipientPhone, interpolatedMessage);
    recordAdminLog(
      adminEmail,
      "Dispatched WhatsApp",
      "Inquiries",
      `Sent ${selectedTemplate.title} to ${recipientName || recipientPhone}`
    );
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              <MessageSquare className="h-3 w-3 text-emerald-600" />
              Direct Client Messaging Hub
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              WhatsApp Cloud Bridge
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            WhatsApp &amp; Communication Center
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Fast 1-click professional message dispatch for proposals, payment reminders, and milestone demos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Inquiry Quick Selector & Templates */}
        <div className="space-y-5 lg:col-span-5">
          {/* Quick Intake Picker */}
          {inquiries.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Inbox className="h-3.5 w-3.5 text-blue-600" /> Load from Recent Inquiries
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {inquiries.slice(0, 6).map((inq) => (
                  <button
                    key={inq.id}
                    onClick={() => handleSelectInquiry(inq)}
                    className="w-full text-left rounded-xl border border-neutral-200 p-2.5 text-xs hover:border-emerald-300 hover:bg-neutral-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-neutral-900">{inq.name}</div>
                      <div className="text-[11px] text-neutral-500">{inq.service} • {inq.phone}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Select Message Template
            </span>
            <div className="space-y-2">
              {DEFAULT_COMMS_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`w-full text-left rounded-xl p-3 text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs"
                        : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{tmpl.title}</span>
                      <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600 font-medium">
                        {tmpl.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Customization & Live WhatsApp Preview */}
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 text-sm">Message Parameters &amp; Variables</h3>
              <span className="text-[11px] font-mono text-neutral-400">Auto-interpolated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">WhatsApp Phone *</label>
                <input
                  type="text"
                  placeholder="+91 98401 23456"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Service Requested</label>
                <input
                  type="text"
                  placeholder="e.g. Shop Billing POS Counter"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Amount / Quotation</label>
                <input
                  type="text"
                  placeholder="e.g. ₹65,000"
                  value={amountVal}
                  onChange={(e) => setAmountVal(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Staging / Preview Link</label>
                <input
                  type="text"
                  placeholder="https://preview.crearemind.in"
                  value={previewLink}
                  onChange={(e) => setPreviewLink(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Invoice Reference</label>
                <input
                  type="text"
                  placeholder="CM/2026/089"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900"
                />
              </div>
            </div>

            {/* Live WhatsApp Bubble Preview in Authentic Light Green */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                Live WhatsApp Chat Bubble Preview
              </span>
              <div className="rounded-2xl border border-neutral-200 bg-[#EFEAE2] p-5">
                <div className="rounded-2xl bg-[#DCF8C6] border border-[#C5E8A8] text-neutral-900 p-4 max-w-lg shadow-xs text-xs leading-relaxed space-y-2">
                  <p>{interpolatedMessage}</p>
                  <div className="flex justify-end text-[10px] text-neutral-500 font-medium">
                    Just now • Sent via Creare Mind
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>

              <button
                onClick={handleLaunchWhatsApp}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Launch WhatsApp Chat ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
