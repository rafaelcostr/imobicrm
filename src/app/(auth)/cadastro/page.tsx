import { RegisterOrganizationForm } from "@/features/onboarding/components/register-organization-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Criar conta",
  "Cadastre sua imobiliária no Syntra Imóveis — trial gratuito.",
);

export default function CadastroPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md items-center p-4">
      <RegisterOrganizationForm />
    </section>
  );
}
