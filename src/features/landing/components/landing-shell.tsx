import Link from "next/link";
import { Building2 } from "lucide-react";

type LandingShellProps = {
  siteName: string;
  children: React.ReactNode;
  nav?: React.ReactNode;
  footerExtra?: React.ReactNode;
};

export function LandingShell({ siteName, children, nav, footerExtra }: LandingShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Building2 className="h-5 w-5" />
            </span>
            <span>{siteName}</span>
          </Link>
          {nav ?? (
            <nav aria-label="Navegação principal" className="flex items-center gap-3 text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Link>
            </nav>
          )}
        </div>
      </header>

      {children}

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteName}
          {footerExtra}
        </p>
      </footer>
    </div>
  );
}
