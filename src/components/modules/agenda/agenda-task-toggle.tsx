"use client";

import { toggleTaskComplete } from "@/actions/modules";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AgendaTaskToggle({ taskId, completed }: { taskId: string; completed: boolean }) {
  const router = useRouter();

  async function handleToggle() {
    try {
      await toggleTaskComplete(taskId);
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar tarefa");
    }
  }

  return (
    <Button variant={completed ? "secondary" : "outline"} size="sm" onClick={handleToggle}>
      {completed ? "Concluída" : "Concluir"}
    </Button>
  );
}
