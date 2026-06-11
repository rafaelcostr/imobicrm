"use client";

import { useState } from "react";
import { sendWhatsAppMessage } from "@/actions/modules";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

interface Props {
  leads: { id: string; name: string; phone: string }[];
  templates: { id: string; name: string; content: string }[];
  messages: {
    id: string;
    content: string;
    direction: string;
    sentAt: Date;
    lead: { name: string };
  }[];
}

export function WhatsAppChat({ leads, templates, messages }: Props) {
  const router = useRouter();
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (template) setContent(template.content);
  }

  async function handleSend() {
    if (!leadId || !content.trim()) return;
    setLoading(true);
    try {
      await sendWhatsAppMessage(leadId, content);
      setContent("");
      toast.success("Mensagem registrada (integração pendente)");
      router.refresh();
    } catch {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg p-3 text-sm ${
              msg.direction === "OUTBOUND" ? "ml-8 bg-primary/10" : "mr-8 bg-muted"
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">{msg.lead.name}</p>
            <p>{msg.content}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(msg.sentAt)}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Nenhuma mensagem registrada</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={leadId} onValueChange={setLeadId}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Selecionar lead" /></SelectTrigger>
          <SelectContent>
            {leads.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={applyTemplate}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Usar template" /></SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Digite sua mensagem..." rows={3} className="flex-1" />
        <Button onClick={handleSend} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
