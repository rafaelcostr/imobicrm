"use client";

import { useRouter } from "next/navigation";
import { CommissionStatus } from "@prisma/client";
import { updateCommissionStatus } from "@/features/commissions/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMISSION_STATUS_LABELS } from "@/lib/labels";
import { toast } from "sonner";

const STATUS_FLOW: CommissionStatus[] = [
  "PENDENTE",
  "EM_PROCESSAMENTO",
  "PAGO",
];

export function CommissionStatusSelect({
  commissionId,
  status,
  canManage,
}: {
  commissionId: string;
  status: CommissionStatus;
  canManage: boolean;
}) {
  const router = useRouter();

  if (!canManage) {
    return (
      <span className="text-sm">{COMMISSION_STATUS_LABELS[status]}</span>
    );
  }

  async function handleChange(next: CommissionStatus) {
    try {
      await updateCommissionStatus(commissionId, next);
      toast.success("Status atualizado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  }

  return (
    <Select value={status} onValueChange={(v) => handleChange(v as CommissionStatus)}>
      <SelectTrigger className="h-8 w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_FLOW.map((s) => (
          <SelectItem key={s} value={s}>
            {COMMISSION_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
