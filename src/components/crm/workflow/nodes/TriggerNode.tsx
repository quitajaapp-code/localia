import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";

export function TriggerNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm bg-card ${
        selected ? "border-warning ring-2 ring-warning/30" : "border-warning/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded bg-warning/10">
          <Zap className="h-3.5 w-3.5 text-warning" />
        </div>
        <span className="text-[10px] font-semibold text-warning uppercase">Gatilho</span>
      </div>
      <p className="text-xs font-medium text-foreground">{(data as any).label}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-warning !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
