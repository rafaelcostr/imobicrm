import Link from "next/link";
import { getUsers } from "@/features/users/actions";
import { UsersTable } from "@/features/users/components/users-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { Plus } from "lucide-react";

export const metadata = pageMetadata("Usuários", "Gestão de usuários do sistema.");

export default async function UsersSettingsPage() {
  const users = await getUsers();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Usuários"
        description="Gerencie contas, perfis e acesso ao sistema"
        actions={
          <Button asChild>
            <Link href="/configuracoes/usuarios/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo usuário
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </section>
  );
}
