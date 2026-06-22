"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { toggleUserActive } from "@/features/users/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/permissions";
import { Pencil, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  team: { name: string } | null;
  _count: { leads: number };
};

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();

  async function handleToggle(id: string, isActive: boolean) {
    const msg = isActive
      ? "Desativar este usuário?"
      : "Reativar este usuário?";
    if (!confirm(msg)) return;
    try {
      await toggleUserActive(id);
      toast.success(isActive ? "Usuário desativado" : "Usuário reativado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-3 pr-4">Nome</th>
            <th className="pb-3 pr-4">Perfil</th>
            <th className="pb-3 pr-4">Equipe</th>
            <th className="pb-3 pr-4">Leads</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border/50">
              <td className="py-3 pr-4">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </td>
              <td className="py-3 pr-4">{ROLE_LABELS[user.role]}</td>
              <td className="py-3 pr-4">{user.team?.name ?? "—"}</td>
              <td className="py-3 pr-4">{user._count.leads}</td>
              <td className="py-3 pr-4">
                <Badge variant={user.isActive ? "success" : "secondary"}>
                  {user.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/configuracoes/usuarios/${user.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(user.id, user.isActive)}
                    aria-label={user.isActive ? "Desativar" : "Ativar"}
                  >
                    {user.isActive ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
