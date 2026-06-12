import { pageMetadata } from "@/lib/metadata";
import { RecoverPasswordForm } from "@/features/auth/components/recover-password-form";

export const metadata = pageMetadata("Recuperar senha", "Solicite a redefinição da sua senha do ImobiCRM.");

export default function RecoverPasswordPage() {
  return <RecoverPasswordForm />;
}
