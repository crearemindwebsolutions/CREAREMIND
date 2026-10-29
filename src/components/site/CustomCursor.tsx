import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

/**
 * Wraps an area and shows a lerp-following pill label instead of the cursor.
 * getLabel returns null to hide the pill.
 */
export function CursorZone({
  children, getLabel, className = "", onZoneClick,
}: {
  children: ReactNode;
  getLabel: (x: number, width: number, target: HTMLElement) => string | null;
  className?: string;
  onZoneClick?: (label: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!label) return;
    let raf = 0;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (pill.current) pill.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [label]);

  const onMove = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    setLabel(getLabel(e.clientX - r.left, r.width, e.target as HTMLElement));
  };

  return (
    <div
      ref={ref}
      className={`relative ${label ? "cursor-none" : ""} ${className}`}
      onMouseMove={onMove}
      onMouseLeave={() => setLabel(null)}
      onClick={() => onZoneClick?.(label)}
    >
      {children}
      <div ref={pill} className="pointer-events-none absolute left-0 top-0 z-30 hidden md:block" aria-hidden>
        <div
          className={`label-xs whitespace-nowrap rounded-full bg-paper px-4 py-2 text-ink transition-all duration-300 ease-expo ${label ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          {label ?? ""}
        </div>
      </div>
    </div>
  );
}
