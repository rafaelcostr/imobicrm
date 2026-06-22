import type { LeadSource, LeadStage, TaskType } from "@prisma/client";

export const AUTOMATION_TRIGGERS = [
  "lead_created",
  "lead_captured",
  "stage_changed",
  "visit_completed",
  "sale_closed",
  "cold_lead",
] as const;

export type AutomationTrigger = (typeof AUTOMATION_TRIGGERS)[number];

export type AutomationConditions = {
  source?: LeadSource;
  fromStage?: LeadStage;
  toStage?: LeadStage;
  daysInactive?: number;
};

export type CreateTaskAction = {
  type: "create_task";
  title: string;
  taskType: TaskType;
  delayHours?: number;
};

export type MoveStageAction = {
  type: "move_stage";
  stage: LeadStage;
};

export type SendWhatsAppAction = {
  type: "send_whatsapp";
  templateName?: string;
  content?: string;
};

export type NotifyBrokerAction = {
  type: "notify_broker";
  title: string;
  message: string;
};

export type NotifyCommissionAction = {
  type: "notify_commission";
};

export type AutomationAction =
  | CreateTaskAction
  | MoveStageAction
  | SendWhatsAppAction
  | NotifyBrokerAction
  | NotifyCommissionAction;

export type AutomationContext = {
  trigger: AutomationTrigger;
  leadId?: string;
  userId?: string;
  fromStage?: LeadStage;
  toStage?: LeadStage;
  source?: LeadSource;
  visitId?: string;
  saleId?: string;
};

export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  lead_created: "Lead criado",
  lead_captured: "Captação pública",
  stage_changed: "Etapa alterada",
  visit_completed: "Visita concluída",
  sale_closed: "Venda fechada",
  cold_lead: "Lead frio (inatividade)",
};

export const ASSIGNMENT_MODE_LABELS: Record<string, string> = {
  ROUND_ROBIN: "Round-robin (roleta)",
  BY_LOAD: "Por carga (menos leads ativos)",
  BY_REGION: "Por região (cidade do lead)",
};
