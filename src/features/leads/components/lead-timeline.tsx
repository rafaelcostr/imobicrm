import Link from "next/link";
import {
  Clock,
  Mail,
  MessageCircle,
  Paperclip,
  StickyNote,
  History,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { TimelineEntry } from "@/features/leads/timeline";

const ICONS = {
  history: History,
  note: StickyNote,
  task: Clock,
  whatsapp: MessageCircle,
  email: Mail,
  attachment: Paperclip,
} as const;

const LABELS = {
  history: "Histórico",
  note: "Nota",
  task: "Tarefa",
  whatsapp: "WhatsApp",
  email: "E-mail",
  attachment: "Anexo",
} as const;

export function LeadTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>;
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => {
        const Icon = ICONS[entry.type];
        return (
          <div key={entry.id} className="relative flex gap-4 pb-6">
            {index < entries.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-border" />
            )}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{entry.title}</p>
                <span className="text-[10px] text-muted-foreground">
                  {LABELS[entry.type]}
                </span>
              </div>
              {entry.description && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {entry.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(entry.createdAt)}
                {entry.actor ? ` · ${entry.actor}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LeadDuplicateAlert({
  duplicates,
  currentId,
}: {
  duplicates: { id: string; name: string; phone: string; email: string | null }[];
  currentId: string;
}) {
  const others = duplicates.filter((d) => d.id !== currentId);
  if (others.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
      <p className="font-medium text-amber-600 dark:text-amber-400">
        Possível lead duplicado
      </p>
      <ul className="mt-2 space-y-1">
        {others.map((d) => (
          <li key={d.id}>
            <Link href={`/leads/${d.id}`} className="text-primary hover:underline">
              {d.name}
            </Link>
            {" · "}
            {d.phone}
            {d.email ? ` · ${d.email}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
