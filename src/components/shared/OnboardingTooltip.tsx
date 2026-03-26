import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface OnboardingTooltipProps {
  id: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export function OnboardingTooltip({ id, children, position = "bottom" }: OnboardingTooltipProps) {
  const storageKey = `localai_tooltip_${id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) setVisible(true);
  }, [storageKey]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(storageKey, "1");
  };

  if (!visible) return null;

  return (
    <div className={`relative z-30 animate-fade-in ${position === "top" ? "mb-3" : "mt-3"}`}>
      <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm shadow-medium flex items-start gap-2 max-w-sm">
        <span className="flex-1">{children}</span>
        <button onClick={dismiss} className="shrink-0 hover:opacity-70 transition-opacity mt-0.5">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className={`absolute left-6 w-3 h-3 bg-primary rotate-45 ${position === "top" ? "-bottom-1.5" : "-top-1.5"}`} />
    </div>
  );
}
