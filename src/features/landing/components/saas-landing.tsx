import Link from "next/link";
import {
  BarChart3,
  Building2,
  Kanban,
  MessageCircle,
  Users,
} from "lucide-react";
import { BRAND, BRAND_PRODUCTS_LIST } from "@/lib/brand";
import { LandingShell } from "@/features/landing/components/landing-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Users,
    title: "Gestão de leads",
    description: "Centralize captação, histórico e follow-up em um só lugar.",
  },
  {
    icon: Kanban,
    title: "Funil visual",
    description: "Acompanhe visitas, propostas e vendas etapa a etapa.",
  },
  {
    icon: Building2,
    title: "Vitrine pública",
    description: "Publique imóveis com página otimizada para buscas.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integrado",
    description: "Converse com leads sem sair do CRM.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e metas",
    description: "KPIs, comissões e desempenho da equipe em tempo real.",
  },
] as const;

export function SaasLanding() {
  return (
    <LandingShell
      siteName={BRAND.company}
      nav={
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <Link href="/vitrine" className="text-muted-foreground hover:text-foreground">
            {BRAND.products.imoveis}
          </Link>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Acessar CRM
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </nav>
      }
      footerExtra={
        <>
          {" · "}
          <span>{BRAND.platform}</span>
          {" · "}
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
        </>
      }
    >
      <main id="conteudo-principal">
        <section
          aria-labelledby="hero-heading"
          className="border-b border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background px-4 py-16 sm:py-24"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-primary">
              {BRAND.platform}
            </p>
            <h1 id="hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
              {BRAND.products.imoveis}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              O CRM imobiliário da {BRAND.company} organiza leads, funil, imóveis, agenda e
              comissões — com vitrine pública pronta para SEO.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/login">Acessar CRM</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cadastro">Criar conta grátis</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Entrar no painel
              </Link>
              {" · "}Sem cartão de crédito · Trial 14 dias
            </p>
          </div>
        </section>

        <section aria-labelledby="products-heading" className="mx-auto max-w-6xl px-4 py-16">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 id="products-heading" className="text-2xl font-bold sm:text-3xl">
              Ecossistema {BRAND.company}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Uma plataforma, múltiplos produtos verticais — começando pelo mercado imobiliário.
            </p>
          </header>
          <ul role="list" className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_PRODUCTS_LIST.map((item) => (
              <li key={item.key}>
                <Card className={`h-full ${item.active ? "border-primary/40" : "opacity-80"}`}>
                  <CardHeader className="pb-2">
                    <p className="text-2xl" aria-hidden="true">
                      {item.emoji}
                    </p>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.active ? (
                      <Badge>Disponível</Badge>
                    ) : (
                      <Badge variant="secondary">Em breve</Badge>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="features-heading" className="border-t border-border mx-auto max-w-6xl px-4 py-16">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 id="features-heading" className="text-2xl font-bold sm:text-3xl">
              Tudo que sua operação imobiliária precisa
            </h2>
            <p className="mt-2 text-muted-foreground">
              Do primeiro contato ao fechamento — com automações, integrações e controle por equipe.
            </p>
          </header>
          <ul role="list" className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div
                      className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="border-t border-border bg-muted/30 px-4 py-16"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="cta-heading" className="text-2xl font-bold">
              Pronto para modernizar sua imobiliária?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Crie sua conta no {BRAND.products.imoveis}, convide a equipe e publique sua vitrine.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/cadastro">Criar conta da imobiliária</Link>
            </Button>
          </div>
        </section>
      </main>
    </LandingShell>
  );
}
