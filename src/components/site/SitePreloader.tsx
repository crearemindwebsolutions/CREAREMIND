import { useEffect, useState } from "react";
import { Logo } from "./Logo";

/**
 * Luxury Creare Mind initial page load / refresh preloader.
 * Prevents any flash of unstyled content, intermediate video transitions, or legacy assets on page refresh.
 */
export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Hold preloader briefly for smooth initialization and asset synchronization
    const timer = setTimeout(() => {
      setFading(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 450); // Matches fade duration
      return () => clearTimeout(removeTimer);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        backgroundColor: "#07080a",
        zIndex: 99999,
        transition: "opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: fading ? 0 : 1,
        transform: fading ? "scale(1.015)" : "scale(1)",
        pointerEvents: fading ? "none" : "auto",
      }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#07080a] text-white select-none overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_65%)]" />

      {/* Center Branding & Progress */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="scale-110 sm:scale-125 mb-6 transition-transform duration-700 animate-pulse">
          <Logo />
        </div>

        <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-medium">
          Studio &amp; Digital Engineering
        </p>

        {/* Minimal luxury loading indicator */}
        <div className="mt-7 w-32 sm:w-40 h-[1.5px] rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-white to-transparent animate-[shimmer_1.2s_infinite]"
            style={{
              animation: "creare-shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes creare-shimmer {
          0% {
            left: -50%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SitePreloader;
