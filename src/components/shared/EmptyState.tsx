import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, actionIcon, secondaryLabel, onSecondary }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-6">{icon}</div>
      <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button size="lg" onClick={onAction} className="btn-press">
          {actionIcon}
          {actionLabel}
        </Button>
      )}
      {secondaryLabel && onSecondary && (
        <Button variant="ghost" size="sm" onClick={onSecondary} className="mt-3">
          {secondaryLabel}
        </Button>
      )}
    </div>
  );
}
