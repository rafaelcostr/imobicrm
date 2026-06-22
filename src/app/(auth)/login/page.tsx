import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/metadata";
import { LoginForm } from "@/features/auth/components/login-form";
import { getLandingContext } from "@/lib/seo/landing-context";

export const metadata = pageMetadata("Entrar", `Acesse o ${BRAND.product} com e-mail e senha.`);

export default async function LoginPage() {
  const ctx = await getLandingContext();

  return (
    <div className="space-y-4">
      <LoginForm
        brandTitle={ctx.variant === "tenant" ? ctx.siteName : BRAND.product}
        brandDescription={
          ctx.variant === "tenant"
            ? `Acesso restrito à equipe ${ctx.siteName}`
            : "Entre com seu e-mail e senha para acessar o sistema"
        }
        organizationSlug={ctx.variant === "tenant" ? ctx.slug : undefined}
      />
      <nav
        aria-label="Links úteis"
        className="rounded-lg border border-border bg-card/50 px-4 py-3 text-center text-sm text-muted-foreground"
      >
        <Link href="/" className="text-primary hover:underline">
          ← Voltar ao início
        </Link>
        {" · "}
        <Link href="/vitrine" className="hover:text-foreground hover:underline">
          Ver imóveis
        </Link>
        {ctx.variant === "saas" && (
          <>
            {" · "}
            <Link href="/cadastro" className="hover:text-foreground hover:underline">
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
