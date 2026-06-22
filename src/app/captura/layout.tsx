import Link from "next/link";
import { getPublicSeoContext } from "@/lib/seo/public-context";

export default async function CapturaLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPublicSeoContext();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"
        aria-hidden="true"
      />

      <header className="relative border-b border-border/60 bg-background/80 px-4 py-3 text-center text-sm">
        <Link href="/vitrine" className="font-semibold text-primary hover:underline">
          {ctx.siteName}
        </Link>
      </header>

      <main
        id="conteudo-principal"
        className="relative flex flex-1 items-center justify-center p-4"
      >
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="relative border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {ctx.siteName} ·{" "}
          <Link href="/privacidade" className="hover:underline">
            Política de privacidade
          </Link>
          {" · "}
          <Link href="/vitrine" className="hover:underline">
            Ver imóveis
          </Link>
        </p>
      </footer>
    </div>
  );
}
