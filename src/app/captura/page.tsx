"use client";

import { useState } from "react";
import { capturePublicLead } from "@/actions/leads";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CapturaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await capturePublicLead({
        name: form.get("name") as string,
        phone: form.get("phone") as string,
        email: (form.get("email") as string) || undefined,
        interest: (form.get("interest") as string) || undefined,
        website: (form.get("website") as string) || undefined,
      });
      setSuccess(true);
      toast.success("Cadastro realizado! Entraremos em contato em breve.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <Card className="relative w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Encontre seu imóvel ideal</CardTitle>
          <CardDescription>
            Preencha o formulário e um corretor especializado entrará em contato com você
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="font-medium">Obrigado pelo interesse!</p>
              <p className="text-sm text-muted-foreground">Seu lead foi registrado automaticamente no ImobiCRM.</p>
              <Button variant="outline" onClick={() => setSuccess(false)}>Enviar outro</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot anti-bot — não preencher */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" name="phone" required maxLength={20} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest">Interesse</Label>
                <Input id="interest" name="interest" placeholder="Ex: Apartamento 3 quartos" maxLength={200} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Quero ser contactado"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Seus dados estão protegidos conforme a LGPD
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
