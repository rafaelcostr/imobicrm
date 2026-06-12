import { getTasks } from "@/features/agenda/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageMetadata } from "@/lib/metadata";
import { TASK_TYPE_LABELS } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import { AgendaTaskToggle } from "@/components/modules/agenda/agenda-task-toggle";

export const metadata = pageMetadata("Agenda", "Visitas, ligações, reuniões e retornos agendados.");

export default async function AgendaPage() {
  const tasks = await getTasks();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader title="Agenda" description="Visitas, ligações, reuniões e retornos agendados" />

      <section aria-label="Próximos eventos">
        <Card>
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <Badge variant="secondary">{TASK_TYPE_LABELS[task.type]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDateTime(task.startAt)}</p>
                  {task.lead && (
                    <p className="text-xs text-muted-foreground">
                      Lead: {task.lead.name} · {task.lead.phone}
                    </p>
                  )}
                </div>
                <AgendaTaskToggle taskId={task.id} completed={task.completed} />
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground">Nenhum evento agendado</p>
            )}
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
