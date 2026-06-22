import { pageMetadata } from "@/lib/metadata";
import { BRAND } from "@/lib/brand";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = pageMetadata(
  "Redefinir senha",
  `Crie uma nova senha segura para sua conta ${BRAND.product}.`,
);

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
