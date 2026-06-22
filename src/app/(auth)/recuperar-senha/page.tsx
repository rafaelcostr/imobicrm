import { pageMetadata } from "@/lib/metadata";
import { BRAND } from "@/lib/brand";
import { RecoverPasswordForm } from "@/features/auth/components/recover-password-form";

export const metadata = pageMetadata(
  "Recuperar senha",
  `Solicite a redefinição da sua senha do ${BRAND.product}.`,
);

export default function RecoverPasswordPage() {
  return <RecoverPasswordForm />;
}
