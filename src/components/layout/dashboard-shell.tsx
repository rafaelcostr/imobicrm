"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: Role;
}

export function DashboardShell({ children, userName, userRole }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar role={userRole} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>
      <div className="md:hidden">
        <MobileNav role={userRole} userName={userName} />
      </div>
      <div className="hidden md:block">
        <Header userName={userName} userRole={userRole} collapsed={collapsed} />
      </div>
      <main
        className={cn(
          "min-h-screen p-4 pb-24 transition-all duration-300 md:min-h-[calc(100vh-4rem)] md:p-6 md:pb-6",
          collapsed ? "md:ml-[72px]" : "md:ml-64",
        )}
      >
        {children}
      </main>
    </div>
  );
}
