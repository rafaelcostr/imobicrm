"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Plus, Building2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";

const mobileNav: { href: string; label: string; icon: React.ElementType; permission: Permission }[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/leads", label: "Leads", icon: Users, permission: "leads:view" },
  { href: "/leads/novo", label: "Novo", icon: Plus, permission: "leads:create" },
  { href: "/imoveis", label: "Imóveis", icon: Building2, permission: "properties:view" },
];

interface MobileNavProps {
  role: Role;
  userName: string;
}

export function MobileNav({ role, userName }: MobileNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = mobileNav.filter((i) => hasPermission(role, i.permission));

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div>
          <p className="text-sm font-bold">IMOBI CRM</p>
          <p className="text-xs text-muted-foreground">Olá, {userName.split(" ")[0]}!</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative h-full w-64">
            <Sidebar role={role} collapsed={false} onToggle={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-background md:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
