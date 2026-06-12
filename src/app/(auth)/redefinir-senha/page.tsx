import { pageMetadata } from "@/lib/metadata";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = pageMetadata("Redefinir senha", "Crie uma nova senha segura para sua conta ImobiCRM.");

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
