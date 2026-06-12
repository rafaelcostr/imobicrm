import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="max-w-md text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Button asChild>
        <Link href="/">Ir para o início</Link>
      </Button>
    </main>
  );
}
