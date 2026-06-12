"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleVisitComplete } from "@/features/deals/actions";
import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";

export function VisitCompleteToggle({ visitId, completed }: { visitId: string; completed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(completed);

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleVisitComplete(visitId);
      setDone((v) => !v);
      toast.success(done ? "Visita reaberta" : "Visita concluída");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar visita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={done ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      aria-pressed={done}
    >
      {done ? <Check className="mr-1 h-4 w-4" /> : <Circle className="mr-1 h-4 w-4" />}
      {done ? "Concluída" : "Marcar concluída"}
    </Button>
  );
}
