import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { Shield, Database, Lock } from "lucide-react";

export const metadata = pageMetadata("Configurações", "Preferências do sistema e informações de segurança.");

export default function SettingsPage() {
  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader title="Configurações" description="Preferências do sistema e informações de segurança" />

      <section aria-label="Informações de segurança" className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              Dados 100% seguros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Senhas criptografadas com bcrypt (12 rounds). Sessões JWT com expiração de 8 horas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-primary" aria-hidden="true" />
              Backup automático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure backups do PostgreSQL via provedor de nuvem ou pg_dump agendado.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
              Conformidade com a LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dados pessoais tratados conforme a Lei Geral de Proteção de Dados. Acesso por perfil de usuário.
            </p>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
