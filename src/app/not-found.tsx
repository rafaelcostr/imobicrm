import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="conteudo-principal"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-4xl font-bold">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <nav aria-label="Links úteis" className="flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/vitrine">Ver imóveis</Link>
        </Button>
        <Button asChild>
          <Link href="/">Ir para o início</Link>
        </Button>
      </nav>
    </main>
  );
}
