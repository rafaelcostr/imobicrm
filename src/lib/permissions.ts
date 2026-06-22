import { Role } from "@prisma/client";

export type Permission =
  | "dashboard:view"
  | "leads:view"
  | "leads:create"
  | "leads:edit"
  | "leads:delete"
  | "leads:assign"
  | "funnel:view"
  | "funnel:move"
  | "properties:view"
  | "properties:create"
  | "properties:edit"
  | "properties:delete"
  | "brokers:view"
  | "brokers:edit"
  | "commissions:view"
  | "commissions:manage"
  | "agenda:view"
  | "agenda:manage"
  | "whatsapp:view"
  | "whatsapp:manage"
  | "reports:view"
  | "reports:export"
  | "settings:view"
  | "settings:manage"
  | "teams:manage"
  | "users:manage"
  | "automations:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "leads:delete",
    "leads:assign",
    "funnel:view",
    "funnel:move",
    "properties:view",
    "properties:create",
    "properties:edit",
    "properties:delete",
    "brokers:view",
    "brokers:edit",
    "commissions:view",
    "commissions:manage",
    "agenda:view",
    "agenda:manage",
    "whatsapp:view",
    "whatsapp:manage",
    "reports:view",
    "reports:export",
    "settings:view",
    "settings:manage",
    "teams:manage",
    "users:manage",
    "automations:manage",
  ],
  ADMIN: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "leads:delete",
    "leads:assign",
    "funnel:view",
    "funnel:move",
    "properties:view",
    "properties:create",
    "properties:edit",
    "properties:delete",
    "brokers:view",
    "brokers:edit",
    "commissions:view",
    "commissions:manage",
    "agenda:view",
    "agenda:manage",
    "whatsapp:view",
    "whatsapp:manage",
    "reports:view",
    "reports:export",
    "settings:view",
    "settings:manage",
    "teams:manage",
    "users:manage",
    "automations:manage",
  ],
  GESTOR: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "leads:assign",
    "funnel:view",
    "funnel:move",
    "properties:view",
    "properties:create",
    "properties:edit",
    "brokers:view",
    "commissions:view",
    "commissions:manage",
    "agenda:view",
    "agenda:manage",
    "whatsapp:view",
    "whatsapp:manage",
    "reports:view",
    "reports:export",
    "settings:view",
    "teams:manage",
    "automations:manage",
  ],
  CORRETOR: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "funnel:view",
    "funnel:move",
    "properties:view",
    "properties:create",
    "brokers:view",
    "commissions:view",
    "agenda:view",
    "agenda:manage",
    "whatsapp:view",
    "reports:view",
    "reports:export",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error("Acesso negado. Você não possui permissão para esta ação.");
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  CORRETOR: "Corretor",
};
