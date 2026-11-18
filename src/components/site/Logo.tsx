import { BRAND } from "./data";
import logoAsset from "@/assets/logo-white.png.asset.json";

export function LogoMark({
  className = "h-[15px] w-auto lg:h-[18px]",
  variant = "white",
}: {
  className?: string;
  variant?: "white" | "black";
}) {
  const src = variant === "black" ? "/logo-black.png" : logoAsset.url;
  return <img src={src} alt="Creare Mind Logo" aria-hidden className={`${className} w-auto object-contain shrink-0`} />;
}

export function Logo({ variant = "white" }: { variant?: "white" | "black" }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark variant={variant} />
      <span className="whitespace-nowrap text-[15px] font-bold tracking-[0.08em] lg:text-[18px]" style={{ fontFamily: "Syne, sans-serif" }}>{BRAND}</span>
    </span>
  );
}
