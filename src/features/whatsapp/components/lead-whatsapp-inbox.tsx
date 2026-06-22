"use client";

import { useState } from "react";
import { sendWhatsAppMessage } from "@/features/whatsapp/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { WHATSAPP_STATUS_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExternalLink, Send } from "lucide-react";

type Message = {
  id: string;
  content: string;
  direction: string;
  status: string;
  sentAt: Date;
  user?: { name: string } | null;
};

type Template = { id: string; name: string; content: string };

export function LeadWhatsAppInbox({
  leadId,
  leadName,
  messages,
  templates,
  apiConfigured,
  waMeUrl,
  compact = false,
}: {
  leadId: string;
  leadName: string;
  messages: Message[];
  templates: Template[];
  apiConfigured: boolean;
  waMeUrl: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (template) setContent(template.content.replace("{nome}", leadName));
  }

  async function handleSend() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const result = await sendWhatsAppMessage(leadId, content);
      setContent("");
      if (result.sentViaApi) {
        toast.success("Mensagem enviada via WhatsApp API");
      } else {
        toast.success("Mensagem registrada", {
          description: "Abra o WhatsApp Web para enviar manualmente",
        });
        if (result.fallbackUrl) {
          window.open(result.fallbackUrl, "_blank", "noopener,noreferrer");
        }
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={apiConfigured ? "success" : "warning"}>
          {apiConfigured ? "API conectada" : "Modo manual (wa.me)"}
        </Badge>
        {!apiConfigured && (
          <Button variant="outline" size="sm" asChild>
            <a href={waMeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              Abrir WhatsApp
            </a>
          </Button>
        )}
      </div>

      <div
        className={`space-y-2 overflow-y-auto rounded-lg border border-border p-4 ${
          compact ? "max-h-72" : "max-h-96"
        }`}
      >
        {messages.map((msg) => {
          const outbound = msg.direction === "OUTBOUND";
          return (
            <div
              key={msg.id}
              className={`rounded-lg p-3 text-sm ${
                outbound ? "ml-8 bg-primary/10" : "mr-8 bg-muted"
              }`}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {outbound ? msg.user?.name ?? "Você" : leadName}
                </span>
                {outbound && (
                  <Badge variant="secondary" className="text-[10px]">
                    {WHATSAPP_STATUS_LABELS[msg.status] ?? msg.status}
                  </Badge>
                )}
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(msg.sentAt)}
              </p>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Inicie a conversa abaixo.
          </p>
        )}
      </div>

      {templates.length > 0 && (
        <Select onValueChange={applyTemplate}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Usar template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite sua mensagem..."
          rows={compact ? 2 : 3}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={loading || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Ctrl+Enter para enviar</p>
    </div>
  );
}
