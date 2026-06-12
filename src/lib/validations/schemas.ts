import { z } from "zod";
import {
  LeadSource,
  LeadStage,
  LeadTemperature,
  PropertyType,
  PropertyPurpose,
  PropertyStatus,
  TaskType,
} from "@prisma/client";
import { passwordSchema } from "@/lib/password-policy";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: passwordSchema,
});

export const leadSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(120),
  phone: z.string().min(8, "Telefone obrigatório").max(20),
  whatsapp: z.string().max(20).optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  city: z.string().max(80).optional(),
  state: z.string().max(2).optional(),
  interest: z.string().max(200).optional(),
  priceRange: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  source: z.nativeEnum(LeadSource),
  temperature: z.nativeEnum(LeadTemperature).optional(),
  brokerId: z.string().optional(),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  stage: z.nativeEnum(LeadStage).optional(),
});

export const propertySchema = z.object({
  code: z.string().min(2).max(30),
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(PropertyType),
  purpose: z.nativeEnum(PropertyPurpose),
  price: z.coerce.number().positive(),
  condoFee: z.coerce.number().optional(),
  iptu: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  suites: z.coerce.number().int().min(0),
  garages: z.coerce.number().int().min(0),
  totalArea: z.coerce.number().optional(),
  builtArea: z.coerce.number().optional(),
  street: z.string().max(150).optional(),
  number: z.string().max(20).optional(),
  complement: z.string().max(80).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  zipCode: z.string().max(10).optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(TaskType),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  leadId: z.string().optional(),
});

export const visitSchema = z.object({
  leadId: z.string().min(1),
  propertyId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

export const proposalSchema = z.object({
  leadId: z.string().min(1),
  propertyId: z.string().min(1),
  amount: z.coerce.number().positive(),
  notes: z.string().max(1000).optional(),
});

export const saleSchema = z.object({
  leadId: z.string().optional(),
  propertyId: z.string().min(1),
  amount: z.coerce.number().positive(),
  commissionPercentage: z.coerce.number().min(0).max(100).default(3),
});

export const publicLeadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  interest: z.string().max(200).optional(),
  lgpdConsent: z.literal(true, {
    message: "É necessário aceitar a política de privacidade.",
  }),
});
