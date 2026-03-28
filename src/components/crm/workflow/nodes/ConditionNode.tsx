import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[200px] shadow-sm bg-card ${
        selected ? "border-warning ring-2 ring-warning/30" : "border-warning/40"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-warning !w-3 !h-3 !border-2 !border-card" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded bg-warning/10">
          <GitBranch className="h-3.5 w-3.5 text-warning" />
        </div>
        <span className="text-[10px] font-semibold text-warning uppercase">Condição</span>
      </div>
      <p className="text-xs font-medium text-foreground">{(data as any).label}</p>
      <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
        <span className="text-success font-semibold">✓ Sim</span>
        <span className="text-destructive font-semibold">✗ Não</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "30%" }}
        className="!bg-success !w-3 !h-3 !border-2 !border-card"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "70%" }}
        className="!bg-destructive !w-3 !h-3 !border-2 !border-card"
      />
    </div>
  );
}
