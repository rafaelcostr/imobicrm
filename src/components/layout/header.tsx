"use client";

import { LogOut, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { ROLE_LABELS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface HeaderProps {
  userName: string;
  userRole: Role;
  collapsed: boolean;
}

export function Header({ userName, userRole, collapsed }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md md:flex transition-all duration-300",
        collapsed ? "ml-[72px]" : "ml-64",
      )}
    >
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar clientes, imóveis..." className="pl-10" />
      </div>

      <Button size="sm" className="hidden sm:flex">
        <Plus className="mr-2 h-4 w-4" />
        Novo
      </Button>

      <NotificationsBell />

      <Button
        variant="ghost"
        size="icon"
        aria-label="Alternar tema"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Sair" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
