import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadOptions } from "@/actions/leads";
import { getTask } from "@/features/agenda/actions";
import { TaskForm } from "@/features/agenda/components/task-form";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Editar Tarefa", "Atualize os dados da tarefa na agenda.");

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, leads] = await Promise.all([getTask(id), getLeadOptions()]);

  if (!task) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Editar tarefa"
        description={task.title}
        actions={
          <Link
            href="/agenda"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Voltar à agenda
          </Link>
        }
      />
      <TaskForm
        mode="edit"
        taskId={task.id}
        leads={leads}
        defaultValues={{
          title: task.title,
          description: task.description,
          type: task.type,
          startAt: task.startAt,
          endAt: task.endAt,
          leadId: task.leadId,
        }}
      />
    </section>
  );
}
