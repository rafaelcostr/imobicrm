"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

const LINKS = [
  { href: "/configuracoes", label: "Visão geral", permission: "settings:view" as const },
  { href: "/configuracoes/geral", label: "Geral", permission: "settings:manage" as const },
  { href: "/configuracoes/usuarios", label: "Usuários", permission: "users:manage" as const },
  { href: "/configuracoes/equipes", label: "Equipes", permission: "teams:manage" as const },
  { href: "/configuracoes/integracoes", label: "Integrações", permission: "settings:view" as const },
  { href: "/configuracoes/funil", label: "Funil", permission: "settings:view" as const },
];

export function SettingsNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = LINKS.filter((l) => hasPermission(role, l.permission));

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-lg border border-border p-1"
      aria-label="Configurações"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
