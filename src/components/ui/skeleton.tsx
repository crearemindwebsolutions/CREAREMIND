import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "light" | "auto";
}

function Skeleton({ className, variant = "auto", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-300",
        variant === "light"
          ? "bg-neutral-200/70 skeleton-shimmer-light border border-neutral-200/60"
          : variant === "dark"
          ? "bg-white/[0.06] skeleton-shimmer border border-white/[0.05]"
          : "bg-white/[0.06] skeleton-shimmer border border-white/[0.05] dark:bg-white/[0.06]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
