import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";

export function DelayNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 border-dashed min-w-[160px] shadow-sm bg-card ${
        selected ? "border-muted-foreground ring-2 ring-muted-foreground/30" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-card" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded bg-muted">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Delay</span>
      </div>
      <p className="text-xs font-medium text-foreground">{(data as any).label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
