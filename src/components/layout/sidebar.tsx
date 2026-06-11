"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";
import { hasPermission, type Permission } from "@/lib/permissions";

const navItems: { href: string; label: string; icon: React.ElementType; permission: Permission }[] = [
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

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const filtered = navItems.filter((item) => hasPermission(role, item.permission));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Home className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold tracking-wide">IMOBI CRM</p>
            <p className="text-xs text-muted-foreground">Gestão imobiliária</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={onToggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Recolher</span>}
        </Button>
      </div>
    </aside>
  );
}
