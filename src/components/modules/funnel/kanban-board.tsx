"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { moveLeadStage } from "@/actions/leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FUNNEL_STAGES, LEAD_STAGE_LABELS, LEAD_TEMPERATURE_LABELS } from "@/lib/labels";
import type { Lead, LeadStage, User } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type LeadWithBroker = Lead & { broker: Pick<User, "name"> | null };

interface KanbanBoardProps {
  leads: LeadWithBroker[];
}

export function KanbanBoard({ leads: initialLeads }: KanbanBoardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);

  const grouped = useMemo(() => {
    const map: Record<LeadStage, LeadWithBroker[]> = {} as Record<LeadStage, LeadWithBroker[]>;
    for (const stage of FUNNEL_STAGES) map[stage] = [];
    for (const lead of leads) map[lead.stage]?.push(lead);
    return map;
  }, [leads]);

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStage = destination.droppableId as LeadStage;
    setLeads((prev) =>
      prev.map((l) => (l.id === draggableId ? { ...l, stage: newStage } : l)),
    );

    try {
      await moveLeadStage(draggableId, newStage);
      toast.success("Lead movido com sucesso");
      router.refresh();
    } catch {
      setLeads(initialLeads);
      toast.error("Erro ao mover lead");
    }
  }

  const tempVariant = (t: Lead["temperature"]) =>
    t === "QUENTE" ? "hot" : t === "FRIO" ? "cold" : "warning";

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {FUNNEL_STAGES.map((stage) => (
          <div key={stage} className="min-w-[280px] flex-shrink-0">
            <Card className="h-full bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  {LEAD_STAGE_LABELS[stage]}
                  <Badge variant="secondary">{grouped[stage]?.length ?? 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Droppable droppableId={stage}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[400px] space-y-2">
                      {grouped[stage]?.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(drag, snapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              style={drag.draggableProps.style as React.CSSProperties | undefined}
                              className={`cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm active:cursor-grabbing ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30" : ""
                              }`}
                            >
                              <p className="font-medium">{lead.name}</p>
                              {lead.interest && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lead.interest}</p>
                              )}
                              <div className="mt-2 flex items-center justify-between">
                                <Badge variant={tempVariant(lead.temperature)}>
                                  {LEAD_TEMPERATURE_LABELS[lead.temperature]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{lead.phone}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
