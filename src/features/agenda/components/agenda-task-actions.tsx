"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTask } from "@/features/agenda/actions";
import { AgendaTaskToggle } from "@/components/modules/agenda/agenda-task-toggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AgendaTaskActions({
  taskId,
  completed,
}: {
  taskId: string;
  completed: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Excluir esta tarefa? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      await deleteTask(taskId);
      toast.success("Tarefa excluída");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir tarefa");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AgendaTaskToggle taskId={taskId} completed={completed} />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/agenda/${taskId}/editar`} aria-label="Editar tarefa">
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        aria-label="Excluir tarefa"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
