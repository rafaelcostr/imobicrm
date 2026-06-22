import { getTeamOptions } from "@/features/teams/actions";
import { UserForm } from "@/features/users/components/user-form";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Novo usuário", "Convidar ou cadastrar usuário.");

export default async function NewUserPage() {
  const teams = await getTeamOptions();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader title="Novo usuário" description="O convite será enviado por e-mail (se SMTP configurado)" />
      <UserForm teams={teams} />
    </section>
  );
}
