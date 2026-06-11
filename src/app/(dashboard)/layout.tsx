import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Role } from "@prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <DashboardShell userName={session.user.name ?? "Usuário"} userRole={session.user.role as Role}>
      {children}
    </DashboardShell>
  );
}
