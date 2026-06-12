import { publicPageMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = publicPageMetadata(
  "Vitrine de imóveis",
  "Confira imóveis disponíveis para venda e aluguel.",
  "/vitrine",
);

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/vitrine" className="text-lg font-bold text-primary">
            ImobiCRM Vitrine
          </Link>
          <nav className="flex items-center gap-4 text-sm">
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
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ImobiCRM ·{" "}
        <Link href="/privacidade" className="hover:underline">
          Política de privacidade
        </Link>
      </footer>
    </div>
  );
}
