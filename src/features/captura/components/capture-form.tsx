"use client";

import { useState } from "react";
import Link from "next/link";
import { capturePublicLead } from "@/actions/leads";
import { BrandHeader } from "@/components/layout/brand-header";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

interface CaptureFormProps {
  propertyCode?: string;
  propertyTitle?: string;
  defaultInterest?: string;
}

export function CaptureForm({ propertyCode, propertyTitle, defaultInterest }: CaptureFormProps) {
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
        propertyCode: propertyCode || undefined,
        website: (form.get("website") as string) || undefined,
        lgpdConsent: form.get("lgpd") === "on",
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
    <Card>
      <CardHeader>
        <BrandHeader
          headingId="captura-heading"
          title={propertyTitle ? `Interesse em ${propertyTitle}` : "Encontre seu imóvel ideal"}
          description={
            propertyTitle
              ? "Preencha seus dados e o corretor responsável entrará em contato"
              : "Preencha o formulário e um corretor especializado entrará em contato com você"
          }
        />
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden="true" />
            <p className="font-medium">Obrigado pelo interesse!</p>
            <p className="text-sm text-muted-foreground">Seu lead foi registrado automaticamente no ImobiCRM.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => setSuccess(false)}>Enviar outro</Button>
              <Button variant="outline" asChild>
                <Link href="/vitrine">Ver imóveis</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input
                id="interest"
                name="interest"
                placeholder="Ex: Apartamento 3 quartos"
                maxLength={200}
                defaultValue={defaultInterest}
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                id="lgpd"
                name="lgpd"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
              />
              <Label htmlFor="lgpd" className="text-xs font-normal leading-relaxed text-muted-foreground">
                Li e aceito a{" "}
                <Link href="/privacidade" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  política de privacidade
                </Link>{" "}
                e autorizo o uso dos meus dados conforme a LGPD. *
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Quero ser contactado"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/vitrine" className="text-primary hover:underline">
                Ver imóveis disponíveis
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
