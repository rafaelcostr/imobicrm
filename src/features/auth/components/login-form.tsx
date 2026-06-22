"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandHeader } from "@/components/layout/brand-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";

type LoginFormProps = {
  brandTitle?: string;
  brandDescription?: string;
  organizationSlug?: string;
};

export function LoginForm({
  brandTitle = BRAND.product,
  brandDescription = "Entre com seu e-mail e senha para acessar o sistema",
  organizationSlug,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrg = searchParams.get("org")?.trim() ?? "";
  const resolvedOrgSlug = organizationSlug || queryOrg || undefined;
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <BrandHeader title={brandTitle} description={brandDescription} />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de login">
          {resolvedOrgSlug ? (
            <input type="hidden" name="organizationSlug" value={resolvedOrgSlug} />
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/recuperar-senha" className="text-primary hover:underline">
            Esqueceu sua senha?
          </Link>
        </p>
        {!organizationSlug && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link href="/cadastro" className="text-primary hover:underline">
              Criar conta da imobiliária
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
