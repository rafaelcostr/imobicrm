import Link from "next/link";
import { Building2, MessageCircle, Search } from "lucide-react";
import type { TenantLandingContext } from "@/lib/seo/landing-context";
import { LandingShell } from "@/features/landing/components/landing-shell";
import { Button } from "@/components/ui/button";

type TenantLandingProps = {
  ctx: TenantLandingContext;
};

export function TenantLanding({ ctx }: TenantLandingProps) {
  return (
    <LandingShell
      siteName={ctx.siteName}
      nav={
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <Link href="/vitrine" className="text-muted-foreground hover:text-foreground">
            Imóveis
          </Link>
          <Link href="/captura" className="text-muted-foreground hover:text-foreground">
            Contato
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Área do corretor</Link>
          </Button>
        </nav>
      }
      footerExtra={
        <>
          {" · "}
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
          {" · "}
          <Link href="/vitrine" className="hover:underline">
            Imóveis
          </Link>
        </>
      }
    >
      <main id="conteudo-principal">
        <section
          aria-labelledby="tenant-hero-heading"
          className="border-b border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background px-4 py-16 sm:py-24"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-primary">{ctx.siteName}</p>
            <h1 id="tenant-hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
              {ctx.captureTitle}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{ctx.tagline}</p>
            {ctx.propertyCount > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong>{ctx.propertyCount}</strong>{" "}
                {ctx.propertyCount === 1 ? "imóvel disponível" : "imóveis disponíveis"} agora
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/vitrine">
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ver imóveis
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/captura">
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fale conosco
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="tenant-steps-heading" className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="tenant-steps-heading" className="sr-only">
            Como podemos ajudar
          </h2>
          <ul
            role="list"
            className="grid list-none gap-6 p-0 sm:grid-cols-3"
          >
            <li className="rounded-xl border border-border p-6 text-center">
              <Building2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">Encontre seu imóvel</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Navegue pela vitrine com filtros por cidade, tipo e finalidade.
              </p>
              <Link href="/vitrine" className="mt-3 inline-block text-sm text-primary hover:underline">
                Abrir vitrine
              </Link>
            </li>
            <li className="rounded-xl border border-border p-6 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">Fale com um corretor</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Informe seu interesse e receba atendimento personalizado.
              </p>
              <Link href="/captura" className="mt-3 inline-block text-sm text-primary hover:underline">
                Enviar mensagem
              </Link>
            </li>
            <li className="rounded-xl border border-border p-6 text-center">
              <Search className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">Equipe {ctx.siteName}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Corretores e gestores acessam o painel comercial pelo login.
              </p>
              <Link href="/login" className="mt-3 inline-block text-sm text-primary hover:underline">
                Área do corretor
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </LandingShell>
  );
}
