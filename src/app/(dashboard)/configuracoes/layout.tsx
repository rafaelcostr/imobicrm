import { auth } from "@/lib/auth";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import type { Role } from "@prisma/client";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user?.role ?? "CORRETOR") as Role;

  return (
    <div className="space-y-6">
      <SettingsNav role={role} />
      {children}
    </div>
  );
}
