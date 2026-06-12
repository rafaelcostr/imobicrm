"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/layout/brand-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/actions/auth";
import { toast } from "sonner";

export function RecoverPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordResetAction(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    setSent(true);
    toast.success(result.message);
  }

  return (
    <Card>
      <CardHeader>
        <BrandHeader
          title="Recuperar senha"
          description="Informe seu e-mail e enviaremos instruções para redefinir sua senha"
        />
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-center text-sm text-muted-foreground">
            Verifique sua caixa de entrada. Em ambiente de desenvolvimento, o link aparece no console do servidor.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar instruções"}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
