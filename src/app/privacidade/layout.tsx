import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata(
  "Política de Privacidade",
  "Como o ImobiCRM coleta, usa e protege seus dados pessoais conforme a LGPD.",
  "/privacidade",
);

export default function PrivacidadeLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">{children}</div>
    </main>
  );
}
