import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import type { ReactNode } from "react";

interface GetStartedLinkProps {
  className?: string;
  children?: ReactNode;
  to?: string;
}

/**
 * A link component for "Get Started" and "Start a Project" CTAs.
 * Navigates directly to the Contact & Callback Request page (`/contact`).
 */
export function GetStartedLink({
  className,
  children = "Get Started",
  to = "/contact",
}: GetStartedLinkProps) {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
