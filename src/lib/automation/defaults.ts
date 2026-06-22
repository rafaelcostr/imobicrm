import type { Prisma } from "@prisma/client";

export type DefaultAutomationInput = Omit<Prisma.AutomationCreateManyInput, "organizationId">;

export const DEFAULT_AUTOMATIONS: DefaultAutomationInput[] = [
  {
    name: "Primeiro contato em 2h",
    description: "Cria tarefa de ligação 2 horas após cadastro do lead",
    trigger: "lead_created",
    conditions: {},
    actions: [
      {
        type: "create_task",
        title: "Ligar para o lead",
        taskType: "LIGACAO",
        delayHours: 2,
      },
    ],
    isActive: true,
    isSystem: true,
    sortOrder: 1,
  },
  {
    name: "WhatsApp de boas-vindas",
    description: "Envia template de boas-vindas após captação pública",
    trigger: "lead_captured",
    conditions: {},
    actions: [
      {
        type: "send_whatsapp",
        templateName: "Boas-vindas",
      },
    ],
    isActive: true,
    isSystem: true,
    sortOrder: 2,
  },
  {
    name: "Visita concluída → Proposta",
    description: "Move o lead para etapa Proposta quando a visita é concluída",
    trigger: "visit_completed",
    conditions: {},
    actions: [{ type: "move_stage", stage: "PROPOSTA" }],
    isActive: true,
    isSystem: true,
    sortOrder: 3,
  },
  {
    name: "Retorno após primeiro contato",
    description: "Agenda retorno 24h após mover para Primeiro Contato",
    trigger: "stage_changed",
    conditions: { toStage: "PRIMEIRO_CONTATO" },
    actions: [
      {
        type: "create_task",
        title: "Retorno — primeiro contato",
        taskType: "RETORNO",
        delayHours: 24,
      },
    ],
    isActive: true,
    isSystem: true,
    sortOrder: 4,
  },
  {
    name: "Alerta de lead frio",
    description: "Notifica o corretor quando o lead fica sem interação",
    trigger: "cold_lead",
    conditions: { daysInactive: 7 },
    actions: [
      {
        type: "notify_broker",
        title: "Lead sem interação",
        message: "{nome} está sem contato há {dias} dias. Retome o atendimento.",
      },
    ],
    isActive: true,
    isSystem: true,
    sortOrder: 5,
  },
  {
    name: "Comissão gerada na venda",
    description: "Notifica o corretor quando uma venda gera comissão",
    trigger: "sale_closed",
    conditions: {},
    actions: [{ type: "notify_commission" }],
    isActive: true,
    isSystem: true,
    sortOrder: 6,
  },
];
