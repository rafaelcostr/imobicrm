"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignLeadBroker } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

interface LeadAssignBrokerProps {
  leadId: string;
  currentBrokerId: string | null;
  brokers: Array<{ id: string; name: string }>;
}

export function LeadAssignBroker({ leadId, currentBrokerId, brokers }: LeadAssignBrokerProps) {
  const router = useRouter();
  const [brokerId, setBrokerId] = useState(currentBrokerId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    if (!brokerId || brokerId === currentBrokerId) return;

    setLoading(true);
    try {
      await assignLeadBroker(leadId, brokerId);
      toast.success("Corretor atribuído");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atribuir corretor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1 space-y-2">
        <Label htmlFor="broker-select">Corretor responsável</Label>
        <Select value={brokerId} onValueChange={setBrokerId}>
          <SelectTrigger id="broker-select">
            <SelectValue placeholder="Selecione um corretor" />
          </SelectTrigger>
          <SelectContent>
            {brokers.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={handleAssign}
        disabled={loading || !brokerId || brokerId === currentBrokerId}
      >
        <UserCheck className="mr-2 h-4 w-4" />
        {loading ? "Atribuindo..." : "Atribuir"}
      </Button>
    </div>
  );
}
