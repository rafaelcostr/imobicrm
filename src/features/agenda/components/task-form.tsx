"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TaskType } from "@prisma/client";
import { createTask, updateTask } from "@/features/agenda/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_TYPE_LABELS } from "@/lib/labels";
import { toast } from "sonner";

type LeadOption = { id: string; name: string; phone: string };

type TaskFormProps = {
  leads: LeadOption[];
  mode?: "create" | "edit";
  taskId?: string;
  defaultValues?: {
    title: string;
    description?: string | null;
    type: TaskType;
    startAt: Date;
    endAt?: Date | null;
    leadId?: string | null;
  };
};

function toDatetimeLocalValue(date: Date | string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const NONE_LEAD = "__none__";

export function TaskForm({
  leads,
  mode = "create",
  taskId,
  defaultValues,
}: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TaskType>(defaultValues?.type ?? "LIGACAO");
  const [leadId, setLeadId] = useState(defaultValues?.leadId ?? NONE_LEAD);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      type,
      startAt: new Date(form.get("startAt") as string),
      endAt: form.get("endAt")
        ? new Date(form.get("endAt") as string)
        : undefined,
      leadId: leadId !== NONE_LEAD ? leadId : undefined,
    };

    try {
      if (mode === "edit" && taskId) {
        await updateTask(taskId, payload);
        toast.success("Tarefa atualizada!");
        router.push("/agenda");
      } else {
        await createTask(payload);
        toast.success("Tarefa criada!");
        router.refresh();
        (e.target as HTMLFormElement).reset();
        setType("LIGACAO");
        setLeadId(NONE_LEAD);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar tarefa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <p className="text-sm font-medium">
        {mode === "edit" ? "Editar tarefa" : "Nova tarefa"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="task-title">Título *</Label>
          <Input
            id="task-title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            placeholder="Ex: Ligar para confirmar visita"
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Lead vinculado</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_LEAD}>Nenhum</SelectItem>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name} · {l.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-start">Início *</Label>
          <Input
            id="task-start"
            name="startAt"
            type="datetime-local"
            required
            defaultValue={
              defaultValues ? toDatetimeLocalValue(defaultValues.startAt) : undefined
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-end">Término</Label>
          <Input
            id="task-end"
            name="endAt"
            type="datetime-local"
            defaultValue={
              defaultValues?.endAt
                ? toDatetimeLocalValue(defaultValues.endAt)
                : undefined
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-description">Descrição</Label>
        <Textarea
          id="task-description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="Detalhes da tarefa..."
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Salvando..."
            : mode === "edit"
              ? "Salvar alterações"
              : "Criar tarefa"}
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="outline" asChild>
            <Link href="/agenda">Cancelar</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
