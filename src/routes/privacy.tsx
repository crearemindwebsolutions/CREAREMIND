import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Creare Mind" },
      { name: "description", content: "Read the Privacy Policy of Creare Mind. Learn how we collect, use, and protect your personal information and media." },
      { property: "og:title", content: "Privacy Policy — Creare Mind" },
      { property: "og:description", content: "Learn how Creare Mind collects, uses, and safeguards your personal data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const lastUpdated = "October 13, 2026";

  return (
    <section className="min-h-screen bg-paper px-5 pb-28 pt-36 text-ink md:px-10">
      <div className="mx-auto max-w-[860px]">
        {/* Header */}
        <div className="border-b border-ink/15 pb-10">
          <p className="label-xs text-ink-muted">Legal & Compliance</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-ink-muted">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral mt-10 space-y-10 text-[15px] leading-relaxed text-ink/90">
          <section>
            <h2 className="text-2xl font-medium text-ink">1. Introduction</h2>
            <p className="mt-3">
              Welcome to <strong>Creare Mind</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), accessible from{" "}
              <a href="https://crearemind.in" className="underline underline-offset-4">https://crearemind.in</a>.
              We are committed to respecting your privacy and protecting the personal data you share with us.
              This Privacy Policy explains what information we collect, how we use and protect it, and your rights
              regarding your personal data when using our website builder platform, services, and associated APIs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">2. Information We Collect</h2>
            <p className="mt-3">We collect several types of information from and about users of our platform:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Account Information:</strong> When you register on Creare Mind, we collect your full name, email address,
                and encrypted authentication credentials.
              </li>
              <li>
                <strong>Third-Party Authentication Data (Google Sign-In):</strong> If you choose to sign in using Google, we
                receive your basic profile details (name, email address, and profile picture) as authorized by your Google consent.
              </li>
              <li>
                <strong>Media &amp; User Assets:</strong> Any images, videos, audio, or graphics you upload to our platform
                are stored via our media delivery network (Cloudinary) and indexed in our database (Supabase).
              </li>
              <li>
                <strong>Project &amp; Inquiry Information:</strong> Information relating to your software project scope,
                inquiries, service requests, and project communications.
              </li>
              <li>
                <strong>Technical &amp; Log Data:</strong> Internet Protocol (IP) addresses, browser type, device specifications,
                access times, and pages visited on our platform to help diagnose technical issues and optimize performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">3. How We Use Your Information</h2>
            <p className="mt-3">We utilize the collected information for the following legitimate business purposes:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To provide, operate, maintain, and enhance the Creare Mind website building platform.</li>
              <li>To authenticate your identity, process secure logins, and send security verification codes (OTP).</li>
              <li>To host, optimize, and serve your uploaded website media via high-performance content delivery networks.</li>
              <li>To communicate important updates, account alerts, security notices, and administrative messages.</li>
              <li>To prevent fraudulent activity, unauthorized access, and abuse of our platform infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">4. Third-Party Service Providers</h2>
            <p className="mt-3">
              We partner with trusted, industry-leading infrastructure providers to deliver our services. These partners
              only process data as required to perform their specific functions:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Supabase:</strong> Provides secure cloud database storage and authentication services with Row Level
                Security (RLS).
              </li>
              <li>
                <strong>Cloudinary:</strong> Provides high-speed cloud asset hosting, automatic optimization, and CDN media distribution.
              </li>
              <li>
                <strong>Google Identity Services:</strong> Provides single sign-on authentication for users choosing Google login.
              </li>
              <li>
                <strong>Resend:</strong> Handles transactional emails, such as 6-digit OTP verification codes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">5. Data Security &amp; Retention</h2>
            <p className="mt-3">
              We implement comprehensive technical and organizational security measures, including SSL/TLS encryption for
              all data in transit, tokenized authentication, and database-level access control policies (RLS). We retain
              your personal data only as long as your account remains active or as necessary to fulfill legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">6. Your Rights &amp; Choices</h2>
            <p className="mt-3">
              You retain complete ownership over your data. You have the right to access, update, export, or request
              the permanent deletion of your profile, media files, and account information at any time. To exercise these rights,
              contact our support team directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">7. Cookies &amp; Local Storage</h2>
            <p className="mt-3">
              We use essential session tokens and local browser storage to keep you securely signed in and preserve your
              preferences across sessions. We do not sell your personal data or browsing activity to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink">8. Contact Us</h2>
            <p className="mt-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information,
              please reach out to us at:
            </p>
            <div className="mt-4 rounded-lg border border-ink/15 bg-paper-2 p-5 text-sm">
              <p className="font-medium text-ink">Creare Mind Privacy &amp; Data Team</p>
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
