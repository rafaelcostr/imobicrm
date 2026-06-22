"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { registerOrganization } from "@/features/onboarding/actions";
import { BrandHeader } from "@/components/layout/brand-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export function RegisterOrganizationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const result = await registerOrganization({
        orgName: form.get("orgName") as string,
        slug: (form.get("slug") as string) || undefined,
        adminName: form.get("adminName") as string,
        adminEmail: form.get("adminEmail") as string,
        password: form.get("password") as string,
      });
      toast.success("Conta criada!", {
        description: `Acesse em ${result.slug}.seu-dominio.com ou informe o slug no login`,
      });
      router.push(`/login?org=${encodeURIComponent(result.slug)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <BrandHeader
          title="Criar imobiliária"
          description={`Trial de 14 dias — comece a usar o ${BRAND.product} agora`}
        />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nome da imobiliária *</Label>
            <Input id="orgName" name="orgName" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Endereço (slug)</Label>
            <Input id="slug" name="slug" placeholder="alpha-imoveis" maxLength={48} />
            <p className="text-xs text-muted-foreground">
              Será usado no subdomínio: slug.seudominio.com
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminName">Seu nome *</Label>
            <Input id="adminName" name="adminName" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">E-mail admin *</Label>
            <Input id="adminEmail" name="adminEmail" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar conta trial"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
