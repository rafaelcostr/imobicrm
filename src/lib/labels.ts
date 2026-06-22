import {
  LeadSource,
  LeadStage,
  LeadTemperature,
  PropertyType,
  PropertyPurpose,
  PropertyStatus,
  CommissionStatus,
  TaskType,
} from "@prisma/client";

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  SITE: "Site",
  INDICACAO: "Indicação",
  OLX: "OLX",
  ZAP_IMOVEIS: "Zap Imóveis",
  VIVA_REAL: "Viva Real",
};

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NOVO_LEAD: "Novo Lead",
  PRIMEIRO_CONTATO: "Primeiro Contato",
  QUALIFICADO: "Qualificado",
  VISITA_AGENDADA: "Visita Agendada",
  PROPOSTA: "Proposta",
  NEGOCIACAO: "Negociação",
  VENDA_CONCLUIDA: "Venda Concluída",
  PERDIDO: "Perdido",
};

export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  QUENTE: "Quente",
  MORNO: "Morno",
  FRIO: "Frio",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  COBERTURA: "Cobertura",
  STUDIO: "Studio",
};

export const PROPERTY_PURPOSE_LABELS: Record<PropertyPurpose, string> = {
  VENDA: "Venda",
  ALUGUEL: "Aluguel",
  VENDA_ALUGUEL: "Venda e Aluguel",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  PENDENTE: "Pendente",
  EM_PROCESSAMENTO: "Em processamento",
  PAGO: "Pago",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  VISITA: "Visita",
  LIGACAO: "Ligação",
  REUNIAO: "Reunião",
  RETORNO: "Retorno",
};

export const WHATSAPP_STATUS_LABELS: Record<string, string> = {
  SENT: "Enviada",
  DELIVERED: "Entregue",
  READ: "Lida",
  FAILED: "Falhou",
  RECEIVED: "Recebida",
};

export const EMAIL_STATUS_LABELS: Record<string, string> = {
  SENT: "Enviado",
  FAILED: "Falhou",
  DRAFT: "Rascunho (manual)",
};

export const FUNNEL_STAGES: LeadStage[] = [
  "NOVO_LEAD",
  "PRIMEIRO_CONTATO",
  "QUALIFICADO",
  "VISITA_AGENDADA",
  "PROPOSTA",
  "NEGOCIACAO",
  "VENDA_CONCLUIDA",
  "PERDIDO",
];
