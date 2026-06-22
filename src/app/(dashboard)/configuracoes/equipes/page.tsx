import { getTeams } from "@/features/teams/actions";
import { TeamsPanel } from "@/features/teams/components/teams-panel";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Equipes", "Gestão de equipes comerciais.");

export default async function TeamsSettingsPage() {
  const teams = await getTeams();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Equipes"
        description="Organize corretores e acompanhe leads por equipe"
      />
      <TeamsPanel teams={teams} />
    </section>
  );
}
