"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createWhatsAppTemplate,
  deleteWhatsAppTemplate,
  toggleWhatsAppTemplate,
  updateWhatsAppTemplate,
} from "@/features/whatsapp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Template = {
  id: string;
  name: string;
  content: string;
  active: boolean;
};

export function WhatsAppTemplatesPanel({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createWhatsAppTemplate({
        name: form.get("name") as string,
        content: form.get("content") as string,
      });
      toast.success("Template criado");
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    try {
      await updateWhatsAppTemplate(id, { name: editName, content: editContent });
      toast.success("Template atualizado");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este template?")) return;
    try {
      await deleteWhatsAppTemplate(id);
      toast.success("Template excluído");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      await toggleWhatsAppTemplate(id, !active);
      router.refresh();
    } catch {
      toast.error("Erro ao alterar template");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Novo template</p>
        <p className="text-xs text-muted-foreground">
          Use {"{nome}"} para inserir o nome do lead automaticamente.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Nome</Label>
            <Input id="tpl-name" name="name" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tpl-content">Mensagem</Label>
            <Textarea
              id="tpl-content"
              name="content"
              required
              rows={3}
              placeholder="Olá {nome}, tudo bem?"
            />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Salvando..." : "Criar template"}
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => (
          <div key={t.id} className="rounded-lg border border-border p-4">
            {editingId === t.id ? (
              <div className="space-y-2">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(t.id)}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <Badge
                      variant={t.active ? "success" : "secondary"}
                      className="mt-1"
                    >
                      {t.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingId(t.id);
                        setEditName(t.name);
                        setEditContent(t.content);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {t.content}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 h-7 px-2"
                  onClick={() => handleToggle(t.id, t.active)}
                >
                  {t.active ? "Desativar" : "Ativar"}
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
