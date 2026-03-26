import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("animate-fade-in");
            el.classList.remove("opacity-0", "translate-y-6");
          }, delay);
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn("opacity-0 translate-y-6 transition-all duration-700 ease-out will-change-transform", className)}>
      {children}
    </div>
  );
}
