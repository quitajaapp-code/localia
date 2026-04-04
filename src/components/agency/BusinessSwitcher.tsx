import { useAgencyContext } from "@/hooks/useAgency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function BusinessSwitcher() {
  const { isAgency, clients, selectedBusinessId, setSelectedBusinessId } = useAgencyContext();

  if (!isAgency || clients.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Building2 className="h-4 w-4 text-sidebar-foreground/60 shrink-0" />
      <Select value={selectedBusinessId ?? ""} onValueChange={setSelectedBusinessId}>
        <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
          <SelectValue placeholder="Selecionar cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.business_id} value={c.business_id}>
              {c.business_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
