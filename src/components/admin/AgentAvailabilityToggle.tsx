import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
  label?: string;
  compact?: boolean;
}

export function AgentAvailabilityToggle({ isOnline, onToggle, label = "Disponível", compact = false }: Props) {
  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "p-3 border rounded-lg")}>
      <Switch checked={isOnline} onCheckedChange={onToggle} />
      {!compact && <span className="text-sm">{label}</span>}
      <Badge
        variant="outline"
        className={cn(
          "text-[10px]",
          isOnline
            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isOnline ? "Online" : "Offline"}
      </Badge>
    </div>
  );
}
