import { notFound } from "next/navigation";
import { getTeamOptions } from "@/features/teams/actions";
import { getUserById } from "@/features/users/actions";
import { UserForm } from "@/features/users/components/user-form";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Editar usuário", "Atualizar dados do usuário.");

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, teams] = await Promise.all([getUserById(id), getTeamOptions()]);
  if (!user) notFound();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader title="Editar usuário" description={user.name} />
      <UserForm
        mode="edit"
        userId={user.id}
        teams={teams}
        defaultValues={{
          name: user.name,
          email: user.email,
          role: user.role as "ADMIN" | "GESTOR" | "CORRETOR",
          phone: user.phone,
          creci: user.creci,
          teamId: user.teamId,
          monthlyGoal: user.monthlyGoal ? Number(user.monthlyGoal) : null,
          isActive: user.isActive,
          replyToEmail: user.replyToEmail,
          emailSignature: user.emailSignature,
        }}
      />
    </section>
  );
}
