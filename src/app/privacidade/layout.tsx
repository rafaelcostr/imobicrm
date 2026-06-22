import Link from "next/link";
import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/metadata";
import { getPublicSeoContext } from "@/lib/seo/public-context";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getPublicSeoContext();
  return publicPageMetadata(
    "Política de Privacidade",
    `Como a ${ctx.siteName} coleta, usa e protege seus dados pessoais conforme a LGPD.`,
    "/privacidade",
    { siteName: ctx.siteName },
  );
}

export default async function PrivacidadeLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPublicSeoContext();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/vitrine" className="font-semibold text-primary hover:underline">
            {ctx.siteName}
          </Link>
          <nav aria-label="Navegação auxiliar">
            <Link href="/captura" className="text-sm text-muted-foreground hover:text-foreground">
              Fale conosco
            </Link>
          </nav>
        </div>
      </header>
      <main id="conteudo-principal" className="px-4 py-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {ctx.siteName} ·{" "}
          <Link href="/vitrine" className="hover:underline">
            Vitrine de imóveis
          </Link>
        </p>
      </footer>
    </div>
  );
}
