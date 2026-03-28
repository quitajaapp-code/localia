import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";

export function ActionNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm bg-card ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-primary/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3 !border-2 !border-card" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded bg-primary/10">
          <Play className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-[10px] font-semibold text-primary uppercase">Ação</span>
      </div>
      <p className="text-xs font-medium text-foreground">{(data as any).label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
