# Creare Mind Branded Email Templates & 4-Digit OTP Setup Guide

This guide explains how to configure Supabase to send **4-digit verification codes** and use the **official Creare Mind branded email templates**.

---

## 1. How to Change Verification Code to 4 Digits in Supabase

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/project/lnfdtleuoyjkqmuonhnt).
2. In the left navigation sidebar under **CONFIGURATION**, click **Sign In / Providers**.
3. Under the **Auth Providers** list, click on **Email**.
4. Scroll down until you find the setting **"Email OTP length"** (or `Mailer OTP Length`).
5. Change the number to **`4`**.
6. Click **Save** at the bottom of the page.

*Now all future verification codes sent by Supabase will strictly be 4 digits!*

---

## 2. How to Add the Creare Mind Logo to Verification Emails

1. In your [Supabase Dashboard](https://supabase.com/dashboard/project/lnfdtleuoyjkqmuonhnt), look at the left sidebar under **NOTIFICATIONS**.
2. Click **Emails** (or **Email Templates**).
3. Update the following templates:

### A. "Confirm signup" Template:
- Click on **Confirm signup**.
- Set **Subject**: `Verify your Creare Mind Account ({{ .Token }})`
- In the **Body (HTML)** editor, select all existing text and paste the full contents of:
  `email-templates/confirm-signup.html`
- Click **Save**.

### B. "Reset Password" Template:
- Click on **Reset Password**.
- Set **Subject**: `Reset your Creare Mind Password ({{ .Token }})`
- In the **Body (HTML)** editor, select all existing text and paste the full contents of:
  `email-templates/reset-password.html`
- Click **Save**.

### C. "Magic Link" Template (Optional):
- Click on **Magic Link**.
- Set **Subject**: `Sign in to Creare Mind ({{ .Token }})`
- In the **Body (HTML)** editor, paste the contents of:
  `email-templates/magic-link.html`
- Click **Save**.

---

## Verification Features
- **Official Brand Logo**: Renders `https://www.crearemind.in/logo-black.png` at high DPI.
- **Large Monospace OTP**: Displays `{{ .Token }}` in a high-contrast card with generous letter-spacing.
- **One-Click Fallback CTA**: Provides a direct verification button linking to `{{ .ConfirmationURL }}`.
- **Universal Email Compatibility**: Tested with standard table layout for Gmail, Apple Mail, Outlook, and mobile apps.
