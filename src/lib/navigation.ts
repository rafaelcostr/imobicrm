import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  UserCircle,
  Wallet,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  Plus,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
};

export const sidebarNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/leads", label: "Leads", icon: Users, permission: "leads:view" },
  { href: "/funil", label: "Funil de Vendas", icon: Kanban, permission: "funnel:view" },
  { href: "/imoveis", label: "Imóveis", icon: Building2, permission: "properties:view" },
  { href: "/corretor", label: "Área do Corretor", icon: UserCircle, permission: "brokers:view" },
  { href: "/comissoes", label: "Comissões", icon: Wallet, permission: "commissions:view" },
  { href: "/agenda", label: "Agenda", icon: Calendar, permission: "agenda:view" },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle, permission: "whatsapp:view" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, permission: "reports:view" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, permission: "settings:view" },
];

export const mobileNavItems: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/leads", label: "Leads", icon: Users, permission: "leads:view" },
  { href: "/leads/novo", label: "Novo", icon: Plus, permission: "leads:create" },
  { href: "/imoveis", label: "Imóveis", icon: Building2, permission: "properties:view" },
];
