import Link from "next/link";
import { getLeadOptions } from "@/actions/leads";
import { getTasks } from "@/features/agenda/actions";
import { TaskForm } from "@/features/agenda/components/task-form";
import { AgendaTaskActions } from "@/features/agenda/components/agenda-task-actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageMetadata } from "@/lib/metadata";
import { TASK_TYPE_LABELS } from "@/lib/labels";
import { formatDateTime, cn } from "@/lib/utils";

export const metadata = pageMetadata(
  "Agenda",
  "Visitas, ligações, reuniões e retornos agendados.",
);

const TABS = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendentes" },
  { id: "completed", label: "Concluídas" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status: TabId = TABS.some((t) => t.id === rawStatus)
    ? (rawStatus as TabId)
    : "all";

  const [tasks, leads] = await Promise.all([
    getTasks({ status }),
    getLeadOptions(),
  ]);

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Agenda"
        description={`${pendingCount} tarefa${pendingCount !== 1 ? "s" : ""} pendente${pendingCount !== 1 ? "s" : ""}`}
      />

      <nav
        className="flex gap-1 rounded-lg border border-border p-1"
        aria-label="Filtros da agenda"
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "all" ? "/agenda" : `/agenda?status=${t.id}`}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors",
              status === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
            aria-current={status === t.id ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <TaskForm leads={leads} />

      <section aria-label="Próximos eventos">
        <Card>
          <CardHeader>
            <CardTitle>
              {status === "completed"
                ? "Tarefas concluídas"
                : status === "pending"
                  ? "Tarefas pendentes"
                  : "Próximos eventos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "font-medium",
                        task.completed && "line-through text-muted-foreground",
                      )}
                    >
                      {task.title}
                    </p>
                    <Badge variant="secondary">{TASK_TYPE_LABELS[task.type]}</Badge>
                    {task.completed && <Badge variant="success">Concluída</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(task.startAt)}
                    {task.endAt ? ` → ${formatDateTime(task.endAt)}` : ""}
                  </p>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  )}
                  {task.lead && (
                    <p className="text-xs text-muted-foreground">
                      Lead:{" "}
                      <Link
                        href={`/leads/${task.lead.id}`}
                        className="text-primary hover:underline"
                      >
                        {task.lead.name}
                      </Link>{" "}
                      · {task.lead.phone}
                    </p>
                  )}
                  {task.user && (
                    <p className="text-xs text-muted-foreground">
                      Responsável: {task.user.name}
                    </p>
                  )}
                </div>
                <AgendaTaskActions taskId={task.id} completed={task.completed} />
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="py-6 text-center text-muted-foreground">
                {status === "completed"
                  ? "Nenhuma tarefa concluída"
                  : status === "pending"
                    ? "Nenhuma tarefa pendente"
                    : "Nenhum evento agendado"}
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
