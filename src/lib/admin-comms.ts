export interface CommsTemplate {
  id: string;
  title: string;
  category: "Lead Follow-up" | "Project Kickoff" | "Milestone Update" | "Invoice & Payment" | "Review & Handover";
  message: string;
}

export const DEFAULT_COMMS_TEMPLATES: CommsTemplate[] = [
  {
    id: "lead-ack",
    title: "Instant Lead Acknowledgment & Kickoff Call",
    category: "Lead Follow-up",
    message:
      "Hello {name}, thank you for contacting Creare Mind (crearemind.in)! We have received your inquiry regarding {service}. Our engineering desk is reviewing your requirements. Are you available for a quick 10-minute discovery call today to discuss your timeline and feature scope?",
  },
  {
    id: "formal-quote",
    title: "Project Proposal & Quotation Dispatch",
    category: "Lead Follow-up",
    message:
      "Hello {name}, your customized project proposal and quotation for {service} is ready from Creare Mind. The total estimated investment is {amount}. You can review the scope breakdown and milestone deliverable dates. Please let us know if you'd like any modifications!",
  },
  {
    id: "kickoff-deposit",
    title: "Kickoff Confirmation & Architecture Start",
    category: "Project Kickoff",
    message:
      "Hi {name}, congratulations! We have officially kicked off development for your {service} project at Creare Mind. Our lead engineer has initialized the repository and UI Figma tokens. You can track progress directly with us here anytime.",
  },
  {
    id: "milestone-ready",
    title: "Milestone Demo & Live Staging Ready",
    category: "Milestone Update",
    message:
      "Hi {name}! We have achieved the next major development milestone for your project. You can preview the live staging build at {link}. Please test and let us know your valuable thoughts or adjustments.",
  },
  {
    id: "invoice-reminder",
    title: "Invoice & UPI Payment Details",
    category: "Invoice & Payment",
    message:
      "Dear {name}, your invoice #{invoiceNumber} for {amount} is generated for {service}. You can complete payment via UPI: 8072719603@upi or direct bank transfer. Kindly share the screenshot/UTR once transferred so we can issue your tax receipt immediately.",
  },
  {
    id: "launch-handover",
    title: "Official Production Launch & Domain Pointing",
    category: "Review & Handover",
    message:
      "Exciting news {name}! Your {service} is fully tested, optimized for Google SEO, and deployed live! All source access, credentials, and documentation have been securely handed over. Thank you for partnering with Creare Mind!",
  },
];

export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  // Default to +91 if Indian number missing country code
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

