import { BRAND } from "./data";
import logoAsset from "@/assets/logo-white.png.asset.json";

export function LogoMark({ className = "h-[15px] w-auto lg:h-[18px]" }: { className?: string }) {
  return <img src={logoAsset.url} alt="" aria-hidden className={`${className} w-auto object-contain shrink-0`} />;
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="whitespace-nowrap text-[15px] font-bold tracking-[0.08em] lg:text-[18px]" style={{ fontFamily: "Syne, sans-serif" }}>{BRAND}</span>
    </span>
  );
}
