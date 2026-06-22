"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTeam, deleteTeam, updateTeam } from "@/features/teams/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { Role } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type TeamRow = {
  id: string;
  name: string;
  _count: { users: number; leads: number };
  users: { id: string; name: string; role: Role; isActive: boolean }[];
};

export function TeamsPanel({ teams }: { teams: TeamRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createTeam({ name: form.get("name") as string });
      toast.success("Equipe criada");
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    try {
      await updateTeam(id, { name: editName });
      toast.success("Equipe atualizada");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir equipe "${name}"?`)) return;
    try {
      await deleteTeam(id);
      toast.success("Equipe excluída");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4">
        <div className="min-w-[200px] flex-1 space-y-2">
          <Label htmlFor="team-name">Nova equipe</Label>
          <Input id="team-name" name="name" required placeholder="Ex: Equipe Centro" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar equipe"}
        </Button>
      </form>

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {editingId === team.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button size="sm" onClick={() => handleUpdate(team.id)}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {team._count.users} membros · {team._count.leads} leads
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(team.id);
                    setEditName(team.name);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(team.id, team.name)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            {team.users.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {team.users.map((u) => (
                  <li key={u.id}>
                    <Badge variant={u.isActive ? "secondary" : "outline"}>
                      {u.name} · {ROLE_LABELS[u.role]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {teams.length === 0 && (
          <p className="text-center text-muted-foreground">Nenhuma equipe cadastrada</p>
        )}
      </div>
    </div>
  );
}
