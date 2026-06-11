import { getTasks } from "@/actions/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_TYPE_LABELS } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import { AgendaTaskToggle } from "@/components/modules/agenda/agenda-task-toggle";

export const metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agenda</h1>
        <p className="text-muted-foreground">Visitas, ligações, reuniões e retornos agendados</p>
      </div>

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
    </div>
  );
}
