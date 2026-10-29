import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Creare Mind" },
      { name: "description", content: "Read the Terms of Service for Creare Mind. Understand the rules, rights, and responsibilities governing use of our website building services." },
      { property: "og:title", content: "Terms of Service — Creare Mind" },
      { property: "og:description", content: "Read the Terms of Service for Creare Mind website building platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const lastUpdated = "October 13, 2026";

  return (
    <section className="min-h-screen bg-paper px-5 pb-28 pt-36 text-ink md:px-10">
      <div className="mx-auto max-w-[860px]">
        {/* Header */}
        <div className="border-b border-ink/15 pb-10">
          <p className="label-xs text-ink-muted">Legal Terms</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight md:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral mt-10 space-y-10 text-[15px] leading-relaxed text-ink/90">
          <section>
            <h2 className="text-2xl font-medium text-ink">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using the website building tools, services, and online platforms provided by{" "}
              <strong>Creare Mind</strong> (&quot;Creare Mind&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) at{" "}
              <a href="https://crearemind.in" className="underline underline-offset-4">https://crearemind.in</a>,
              you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
              please discontinue use of our services immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">2. User Accounts &amp; Registration</h2>
            <p className="mt-3">
              To utilize certain features, such as accessing customer services, managing projects, or uploading media,
              you must create an account via email and password, email OTP verification, or Google Sign-In. You agree to:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the confidentiality and security of your account credentials.</li>
              <li>Promptly notify us of any unauthorized use or security compromise of your account.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">3. Services &amp; Project Delivery</h2>
            <p className="mt-3">
              Creare Mind provides custom software development, mobile application engineering, shop billing POS solutions,
              website templates, video editing, and digital marketing services delivered on transparent project milestones:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Project Milestones:</strong> Service fees and delivery timelines are agreed upon upfront according
                to your custom project requirements and architectural scope.
              </li>
              <li>
                <strong>Client Ownership:</strong> You retain full ownership of your custom code, website deliverables, and
                business assets upon final delivery.
              </li>
              <li>
                <strong>Service Availability:</strong> We strive to maintain 99.9% uptime, but we do not guarantee
                uninterrupted or error-free operation during scheduled maintenance or unforeseen infrastructure disruptions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">4. User Content &amp; Media Ownership</h2>
            <p className="mt-3">
              You retain all intellectual property rights and full ownership of any content, photographs, videos,
              text, or branding elements that you upload to the platform (&quot;User Content&quot;). By uploading User Content,
              you grant Creare Mind a non-exclusive, worldwide, royalty-free license solely to host, store, display,
              and format your content as necessary to operate your website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">5. Acceptable Use Policy</h2>
            <p className="mt-3">You agree not to use the platform to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Upload or distribute content that is unlawful, defamatory, fraudulent, or infringes on intellectual property rights.</li>
              <li>Transmit malware, viruses, harmful scripts, or automated scraping bots.</li>
              <li>Attempt to circumvent Row Level Security, reverse-engineer, or breach authentication mechanisms.</li>
              <li>Engage in unauthorized bulk messaging or email spam.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">6. Intellectual Property of Creare Mind</h2>
            <p className="mt-3">
              All platform software, website layouts, template designs, trademarks, visual styling, animations, and documentation
              are the exclusive intellectual property of Creare Mind and its licensors. You may not copy, reproduce, or resell
              the underlying platform source code without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">7. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, Creare Mind shall not be liable for any indirect, incidental,
              consequential, or punitive damages, including loss of business profits, data loss, or service interruption,
              arising out of or in connection with the use or inability to use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">8. Modifications to Terms</h2>
            <p className="mt-3">
              We reserve the right to revise or update these Terms of Service at our discretion. Any modifications will be
              effective immediately upon posting to this page, with an updated revision date. Your continued use of the
              service constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">9. Contact Information</h2>
            <p className="mt-3">
              For legal inquiries, terms clarification, or notices, please contact us at:
            </p>
            <div className="mt-4 rounded-lg border border-ink/15 bg-paper-2 p-5 text-sm">
              <p className="font-medium text-ink">Creare Mind Legal Inquiries</p>
              <p className="mt-1 text-ink-muted">Phone &amp; WhatsApp: <a href="tel:+918072719603" className="text-ink underline">+91 80727 19603</a></p>
              <p className="mt-0.5 text-ink-muted">Email: <a href="mailto:crearemindwebsolutions@gmail.com" className="text-ink underline">crearemindwebsolutions@gmail.com</a></p>
              <p className="mt-0.5 text-ink-muted">Website: <a href="https://crearemind.in" className="text-ink underline">https://crearemind.in</a></p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-16 border-t border-ink/15 pt-8">
          <Link to="/" className="text-sm font-medium text-ink underline underline-offset-4">
            ← Return to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
