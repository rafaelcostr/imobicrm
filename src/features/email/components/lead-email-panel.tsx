"use client";

import { useState } from "react";
import { sendLeadEmail } from "@/features/email/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";
import { EMAIL_STATUS_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExternalLink, Send } from "lucide-react";

type EmailMessage = {
  id: string;
  subject: string;
  body: string;
  direction: string;
  status: string;
  toEmail: string;
  sentAt: Date;
  user?: { name: string } | null;
};

export function LeadEmailPanel({
  leadId,
  leadName,
  leadEmail,
  emails,
  smtpConfigured,
  canSend,
  compact = false,
}: {
  leadId: string;
  leadName: string;
  leadEmail: string | null;
  emails: EmailMessage[];
  smtpConfigured: boolean;
  canSend: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setLoading(true);
    try {
      const result = await sendLeadEmail(leadId, subject, body);
      setSubject("");
      setBody("");
      if (result.sentViaSmtp) {
        toast.success("E-mail enviado via SMTP");
      } else if (result.message.status === "FAILED") {
        toast.error("Falha ao enviar. Tente novamente ou use o cliente de e-mail.");
      } else {
        toast.success("E-mail registrado", {
          description: "Abra seu cliente de e-mail para enviar manualmente",
        });
        if (result.mailtoUrl) {
          window.open(result.mailtoUrl, "_blank", "noopener,noreferrer");
        }
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  }

  if (!leadEmail) {
    return (
      <p className="text-sm text-muted-foreground">
        Cadastre um e-mail no lead para enviar mensagens.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={smtpConfigured ? "success" : "warning"}>
          {smtpConfigured ? "SMTP ativo" : "Modo manual (mailto)"}
        </Badge>
        <span className="text-xs text-muted-foreground">{leadEmail}</span>
      </div>

      <div
        className={`space-y-3 overflow-y-auto rounded-lg border border-border p-4 ${
          compact ? "max-h-72" : "max-h-96"
        }`}
      >
        {emails.map((email) => {
          const outbound = email.direction === "OUTBOUND";
          return (
            <div
              key={email.id}
              className={`rounded-lg p-3 text-sm ${
                outbound ? "ml-8 bg-primary/10" : "mr-8 bg-muted"
              }`}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {outbound ? email.user?.name ?? "Você" : leadName}
                </span>
                {outbound && (
                  <Badge variant="secondary" className="text-[10px]">
                    {EMAIL_STATUS_LABELS[email.status] ?? email.status}
                  </Badge>
                )}
              </div>
              <p className="font-medium">{email.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {email.body}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(email.sentAt)}
              </p>
            </div>
          );
        })}
        {emails.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum e-mail registrado ainda.
          </p>
        )}
      </div>

      {canSend ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor={`email-subject-${leadId}`}>Assunto</Label>
            <Input
              id={`email-subject-${leadId}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto do e-mail"
              maxLength={200}
            />
          </div>
          <div className="flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Olá ${leadName}, ...`}
              rows={compact ? 3 : 4}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !subject.trim() || !body.trim()}
              aria-label="Enviar e-mail"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!smtpConfigured && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`mailto:${encodeURIComponent(leadEmail)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Abrir cliente de e-mail
              </a>
            </Button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Você não tem permissão para enviar e-mails neste lead.
        </p>
      )}
    </div>
  );
}
