import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Link for any menu/footer label, redirecting to /contact or external socials */
export function NavLink({ name, className, children }: { name: string; className?: string; children?: ReactNode }) {
  if (name === "Instagram") {
    return (
      <a
        href="https://www.instagram.com/crearemind.in"
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children ?? name}
      </a>
    );
  }
  if (name === "LinkedIn") {
    return (
      <a
        href="https://www.linkedin.com/company/creare-mind/"
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children ?? name}
      </a>
    );
  }
  if (name === "About" || name === "About Us") {
    return (
      <Link to="/about" className={className}>
        {children ?? name}
      </Link>
    );
  }

  // All menu items (Products, Solutions, Resources, Client Support, Dedicated Teams, etc.) redirect to contact page
  return (
    <Link to="/contact" className={className}>
      {children ?? name}
    </Link>
  );
}
