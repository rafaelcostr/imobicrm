"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { assertLeadAccess } from "@/lib/access-control";
import { Role } from "@prisma/client";
import { LEAD_STAGE_LABELS } from "@/lib/labels";

export type TimelineEntry = {
  id: string;
  type: "history" | "note" | "task" | "whatsapp" | "email" | "attachment";
  title: string;
  description?: string;
  actor?: string;
  createdAt: Date;
};

export async function getLeadTimeline(leadId: string): Promise<TimelineEntry[]> {
  const user = await requireAuth();
  await assertLeadAccess(leadId, user.id, user.role as Role);

  const [histories, notes, tasks, messages, leadEmails, attachments] = await Promise.all([
    prisma.leadHistory.findMany({
      where: { leadId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.leadNote.findMany({
      where: { leadId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { leadId },
      include: { user: { select: { name: true } } },
      orderBy: { startAt: "desc" },
    }),
    prisma.whatsAppMessage.findMany({
      where: { leadId },
      include: { user: { select: { name: true } } },
      orderBy: { sentAt: "desc" },
    }),
    prisma.leadEmail.findMany({
      where: { leadId },
      include: { user: { select: { name: true } } },
      orderBy: { sentAt: "desc" },
    }),
    prisma.leadAttachment.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const entries: TimelineEntry[] = [
    ...histories.map((h) => ({
      id: h.id,
      type: "history" as const,
      title: h.description ?? h.action,
      description:
        h.fromStage && h.toStage
          ? `${LEAD_STAGE_LABELS[h.fromStage]} → ${LEAD_STAGE_LABELS[h.toStage]}`
          : undefined,
      actor: h.user?.name ?? "Sistema",
      createdAt: h.createdAt,
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: "note" as const,
      title: "Nota adicionada",
      description: n.content,
      actor: n.user.name,
      createdAt: n.createdAt,
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      title: t.completed ? `Tarefa concluída: ${t.title}` : `Tarefa: ${t.title}`,
      description: t.description ?? undefined,
      actor: t.user.name,
      createdAt: t.startAt,
    })),
    ...messages.map((m) => ({
      id: m.id,
      type: "whatsapp" as const,
      title: m.direction === "OUTBOUND" ? "WhatsApp enviado" : "WhatsApp recebido",
      description: m.content,
      actor: m.user?.name ?? "WhatsApp",
      createdAt: m.sentAt,
    })),
    ...leadEmails.map((e) => ({
      id: e.id,
      type: "email" as const,
      title: e.direction === "OUTBOUND" ? `E-mail: ${e.subject}` : `E-mail recebido: ${e.subject}`,
      description: e.body,
      actor: e.user?.name ?? "E-mail",
      createdAt: e.sentAt,
    })),
    ...attachments.map((a) => ({
      id: a.id,
      type: "attachment" as const,
      title: "Anexo adicionado",
      description: a.fileName,
      actor: undefined,
      createdAt: a.createdAt,
    })),
  ];

  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
