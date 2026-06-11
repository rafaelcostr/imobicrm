"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLeadNote } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function LeadNotesForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addLeadNote(leadId, content);
      setContent("");
      toast.success("Nota adicionada");
      router.refresh();
    } catch {
      toast.error("Erro ao adicionar nota");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Adicionar uma nota..."
        rows={2}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "..." : "Salvar"}
      </Button>
    </form>
  );
}
