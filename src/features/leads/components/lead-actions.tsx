"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LeadActionsProps {
  leadId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function LeadActions({ leadId, canEdit, canDelete }: LeadActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este lead permanentemente? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteLead(leadId);
      toast.success("Lead excluído");
      router.push("/leads");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir lead");
      setDeleting(false);
    }
  }

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/leads/${leadId}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      )}
      {canDelete && (
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? "Excluindo..." : "Excluir"}
        </Button>
      )}
    </div>
  );
}
