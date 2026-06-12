"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProperty } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyActionsProps {
  propertyId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function PropertyActions({ propertyId, canEdit, canDelete }: PropertyActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este imóvel permanentemente? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteProperty(propertyId);
      toast.success("Imóvel excluído");
      router.push("/imoveis");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir imóvel");
      setDeleting(false);
    }
  }

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/imoveis/${propertyId}/editar`}>
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
