import { pageMetadata } from "@/lib/metadata";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = pageMetadata("Entrar", "Acesse o ImobiCRM com e-mail e senha.");

export default function LoginPage() {
  return <LoginForm />;
}
