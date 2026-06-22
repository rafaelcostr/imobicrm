import {
  LeadStage,
  NotificationType,
  Prisma,
  TaskType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/system-config";
import {
  isWhatsAppConfigured,
  normalizeWhatsAppPhone,
  sendWhatsAppTextMessage,
} from "@/lib/whatsapp";
import type {
  AutomationAction,
  AutomationConditions,
  AutomationContext,
  AutomationTrigger,
} from "@/lib/automation/types";

function parseConditions(raw: Prisma.JsonValue): AutomationConditions {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as AutomationConditions;
}

function parseActions(raw: Prisma.JsonValue): AutomationAction[] {
  if (!Array.isArray(raw)) return [];
  return raw as AutomationAction[];
}

function matchesConditions(
  conditions: AutomationConditions,
  ctx: AutomationContext,
  lead?: { source: string; stage: LeadStage } | null,
): boolean {
  if (conditions.source && ctx.source !== conditions.source && lead?.source !== conditions.source) {
    return false;
  }
  if (conditions.fromStage && ctx.fromStage !== conditions.fromStage) return false;
  if (conditions.toStage && ctx.toStage !== conditions.toStage) return false;
  return true;
}

function applyPlaceholders(
  text: string,
  vars: Record<string, string>,
): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

async function logAutomation(
  automationId: string,
  leadId: string | undefined,
  status: "success" | "skipped" | "failed",
  message?: string,
) {
  await prisma.automationLog.create({
    data: { automationId, leadId, status, message },
  });
}

async function executeAction(
  action: AutomationAction,
  lead: {
    id: string;
    organizationId: string;
    name: string;
    phone: string;
    whatsapp: string | null;
    brokerId: string | null;
    stage: LeadStage;
  },
  actorUserId?: string,
  saleId?: string,
): Promise<string | void> {
  switch (action.type) {
    case "create_task": {
      const userId = lead.brokerId ?? actorUserId;
      if (!userId) return "Sem corretor para atribuir tarefa";

      const startAt = new Date();
      startAt.setHours(startAt.getHours() + (action.delayHours ?? 0));

      await prisma.task.create({
        data: {
          organizationId: lead.organizationId,
          title: applyPlaceholders(action.title, { nome: lead.name }),
          type: action.taskType as TaskType,
          startAt,
          userId,
          leadId: lead.id,
        },
      });
      return;
    }

    case "move_stage": {
      if (lead.stage === action.stage) return "Lead já está na etapa alvo";

      await prisma.$transaction([
        prisma.lead.update({
          where: { id: lead.id },
          data: { stage: action.stage, lastContactAt: new Date() },
        }),
        prisma.leadHistory.create({
          data: {
            leadId: lead.id,
            userId: actorUserId,
            action: "ETAPA_ALTERADA",
            fromStage: lead.stage,
            toStage: action.stage,
            description: `Automação moveu lead para ${action.stage}`,
          },
        }),
      ]);
      return;
    }

    case "send_whatsapp": {
      const phone = lead.whatsapp ?? lead.phone;
      if (!phone) return "Lead sem telefone/WhatsApp";

      let content = action.content ?? "";
      if (action.templateName) {
        const template = await prisma.whatsAppTemplate.findFirst({
          where: { name: action.templateName, active: true },
        });
        if (!template) return `Template "${action.templateName}" não encontrado`;
        content = template.content;
      }

      if (!content.trim()) return "Conteúdo WhatsApp vazio";

      content = applyPlaceholders(content, { nome: lead.name });
      const normalizedPhone = normalizeWhatsAppPhone(phone);

      let externalId: string | null = null;
      let status = "DRAFT";
      let sentViaApi = false;

      if (isWhatsAppConfigured()) {
        try {
          const result = await sendWhatsAppTextMessage(phone, content);
          externalId = result.externalId;
          status = result.status;
          sentViaApi = true;
        } catch {
          status = "FAILED";
        }
      }

      await prisma.$transaction([
        prisma.whatsAppMessage.create({
          data: {
            leadId: lead.id,
            userId: actorUserId,
            direction: "OUTBOUND",
            content,
            status,
            externalId,
            phone: normalizedPhone,
          },
        }),
        prisma.leadHistory.create({
          data: {
            leadId: lead.id,
            action: sentViaApi ? "WHATSAPP_ENVIADO" : "WHATSAPP_REGISTRADO",
            description: sentViaApi
              ? "WhatsApp automático enviado (captação)"
              : "WhatsApp automático registrado (API indisponível)",
          },
        }),
        prisma.lead.update({
          where: { id: lead.id },
          data: { lastContactAt: new Date() },
        }),
      ]);
      return;
    }

    case "notify_broker": {
      if (!lead.brokerId) return "Lead sem corretor atribuído";

      const config = await getSystemConfig(lead.organizationId);
      const days = config.coldLeadDays;

      await prisma.notification.create({
        data: {
          userId: lead.brokerId,
          type: NotificationType.LEAD,
          title: applyPlaceholders(action.title, { nome: lead.name, dias: String(days) }),
          message: applyPlaceholders(action.message, { nome: lead.name, dias: String(days) }),
          link: `/leads/${lead.id}`,
        },
      });
      return;
    }

    case "notify_commission": {
      if (!saleId || !lead.brokerId) return "Venda ou corretor ausente";

      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: { commission: true, property: { select: { title: true } } },
      });
      if (!sale?.commission) return "Comissão não encontrada";

      const amount = Number(sale.commission.amount).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      await prisma.notification.create({
        data: {
          userId: lead.brokerId,
          type: NotificationType.COMMISSION,
          title: "Comissão gerada",
          message: `Venda de ${sale.property.title} — comissão ${amount}`,
          link: "/comissoes",
        },
      });
      return;
    }

    default:
      return "Ação desconhecida";
  }
}

async function processAutomation(
  automation: {
    id: string;
    trigger: string;
    conditions: Prisma.JsonValue;
    actions: Prisma.JsonValue;
  },
  ctx: AutomationContext,
  lead: {
    id: string;
    organizationId: string;
    name: string;
    phone: string;
    whatsapp: string | null;
    brokerId: string | null;
    stage: LeadStage;
    source: string;
  } | null,
): Promise<void> {
  const conditions = parseConditions(automation.conditions);
  if (!matchesConditions(conditions, ctx, lead)) {
    await logAutomation(automation.id, ctx.leadId, "skipped", "Condições não atendidas");
    return;
  }

  if (!lead) {
    await logAutomation(automation.id, ctx.leadId, "skipped", "Lead não encontrado");
    return;
  }

  try {
    const actions = parseActions(automation.actions);
    const notes: string[] = [];

    for (const action of actions) {
      const note = await executeAction(action, lead, ctx.userId, ctx.saleId);
      if (note) notes.push(note);
    }

    await logAutomation(
      automation.id,
      ctx.leadId,
      notes.length ? "skipped" : "success",
      notes.join("; ") || undefined,
    );
  } catch (err) {
    await logAutomation(
      automation.id,
      ctx.leadId,
      "failed",
      err instanceof Error ? err.message : "Erro desconhecido",
    );
  }
}

export async function runAutomations(ctx: AutomationContext): Promise<void> {
  let lead:
    | {
        id: string;
        organizationId: string;
        name: string;
        phone: string;
        whatsapp: string | null;
        brokerId: string | null;
        stage: LeadStage;
        source: string;
      }
    | null = null;

  if (ctx.leadId) {
    lead = await prisma.lead.findUnique({
      where: { id: ctx.leadId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        phone: true,
        whatsapp: true,
        brokerId: true,
        stage: true,
        source: true,
      },
    });
    if (!lead) return;
  }

  const automations = await prisma.automation.findMany({
    where: {
      trigger: ctx.trigger,
      isActive: true,
      ...(lead ? { organizationId: lead.organizationId } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  if (automations.length === 0) return;

  for (const automation of automations) {
    await processAutomation(automation, ctx, lead);
  }
}

export async function runColdLeadAutomations(): Promise<{ processed: number }> {
  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  let processed = 0;

  for (const org of organizations) {
    processed += await runColdLeadAutomationsForOrg(org.id);
  }

  return { processed };
}

async function runColdLeadAutomationsForOrg(organizationId: string): Promise<number> {
  const config = await getSystemConfig(organizationId);
  const daysInactive = config.coldLeadDays;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysInactive);

  const coldAutomations = await prisma.automation.findMany({
    where: { organizationId, trigger: "cold_lead", isActive: true },
  });

  if (coldAutomations.length === 0) return 0;

  const coldLeads = await prisma.lead.findMany({
    where: {
      organizationId,
      stage: { notIn: [LeadStage.VENDA_CONCLUIDA, LeadStage.PERDIDO] },
      brokerId: { not: null },
      OR: [
        { lastContactAt: { lt: cutoff } },
        { lastContactAt: null, createdAt: { lt: cutoff } },
      ],
    },
    select: { id: true },
  });

  let processed = 0;

  for (const automation of coldAutomations) {
    const conditions = parseConditions(automation.conditions);
    const requiredDays = conditions.daysInactive ?? daysInactive;

    const leadCutoff = new Date();
    leadCutoff.setDate(leadCutoff.getDate() - requiredDays);

    for (const { id: leadId } of coldLeads) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: {
          id: true,
          organizationId: true,
          name: true,
          phone: true,
          whatsapp: true,
          brokerId: true,
          stage: true,
          source: true,
          lastContactAt: true,
          createdAt: true,
        },
      });
      if (!lead) continue;

      const lastActivity = lead.lastContactAt ?? lead.createdAt;
      if (lastActivity >= leadCutoff) continue;

      const recentLog = await prisma.automationLog.findFirst({
        where: {
          automationId: automation.id,
          leadId,
          status: "success",
          createdAt: { gte: leadCutoff },
        },
      });
      if (recentLog) continue;

      const { lastContactAt, createdAt, ...leadData } = lead;
      await processAutomation(
        automation,
        { trigger: "cold_lead", leadId },
        leadData,
      );
      processed++;
    }
  }

  return processed;
}

export async function ensureDefaultAutomations(organizationId: string): Promise<void> {
  const count = await prisma.automation.count({ where: { organizationId } });
  if (count > 0) return;

  const { DEFAULT_AUTOMATIONS } = await import("@/lib/automation/defaults");
  await prisma.automation.createMany({
    data: DEFAULT_AUTOMATIONS.map((item) => ({ ...item, organizationId })),
  });
}
