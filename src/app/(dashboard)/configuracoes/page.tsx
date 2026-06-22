import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getSettingsOverview } from "@/features/settings/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/metadata";
import { Shield, Database, Lock, Users, UsersRound, Plug, Zap } from "lucide-react";
import type { Role } from "@prisma/client";

export const metadata = pageMetadata("Configurações", `Administração do ${BRAND.product}.`);

export default async function SettingsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const { config, integrations } = await getSettingsOverview();

  const cards = [
    {
      href: "/configuracoes/usuarios",
      label: "Usuários",
      desc: "Criar, editar e desativar contas",
      icon: Users,
      show: hasPermission(role, "users:manage"),
    },
    {
      href: "/configuracoes/equipes",
      label: "Equipes",
      desc: "Organizar corretores em equipes",
      icon: UsersRound,
      show: hasPermission(role, "teams:manage"),
    },
    {
      href: "/configuracoes/automacoes",
      label: "Automações",
      desc: "Regras automáticas e distribuição de leads",
      icon: Zap,
      show: hasPermission(role, "settings:view"),
    },
    {
      href: "/configuracoes/integracoes",
      label: "Integrações",
      desc: "SMTP, armazenamento e APIs",
      icon: Plug,
      show: hasPermission(role, "settings:view"),
    },
    {
      href: "/configuracoes/geral",
      label: "Geral",
      desc: "Nome da empresa, metas e captação",
      icon: Shield,
      show: hasPermission(role, "settings:manage"),
    },
  ].filter((c) => c.show);

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Configurações"
        description={`${config.companyName}${config.tagline ? ` — ${config.tagline}` : ""}`}
      />

      {cards.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-5 w-5 text-primary" />
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plug className="h-5 w-5 text-primary" />
              E-mail (SMTP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={integrations.smtp ? "success" : "warning"}>
              {integrations.smtp ? "Configurado" : "Não configurado"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-primary" />
              Armazenamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={integrations.storage ? "success" : "secondary"}>
              {integrations.storage ? "S3/R2 ativo" : "Local (public/uploads)"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-5 w-5 text-primary" />
              LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consentimento registrado na captação pública de leads.
            </p>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
