import Link from "next/link";
import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/metadata";
import { getPublicSeoContext } from "@/lib/seo/public-context";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getPublicSeoContext();
  return publicPageMetadata(
    `Vitrine de imóveis — ${ctx.siteName}`,
    `${ctx.tagline} Confira apartamentos, casas e imóveis comerciais disponíveis.`,
    "/vitrine",
    { siteName: ctx.siteName },
  );
}

export default async function VitrineLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPublicSeoContext();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/vitrine" className="text-lg font-bold text-primary">
            {ctx.siteName}
          </Link>
          <nav aria-label="Navegação principal" className="flex items-center gap-4 text-sm">
            <Link href="/vitrine" className="text-muted-foreground hover:text-foreground">
              Imóveis
            </Link>
            <Link href="/captura" className="text-muted-foreground hover:text-foreground">
              Fale conosco
            </Link>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Área do corretor
            </Link>
          </nav>
        </div>
      </header>
      <main id="conteudo-principal" className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {ctx.siteName} ·{" "}
          <Link href="/privacidade" className="hover:underline">
            Política de privacidade
          </Link>
        </p>
      </footer>
    </div>
  );
}
