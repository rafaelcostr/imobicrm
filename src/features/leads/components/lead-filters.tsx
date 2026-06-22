import Link from "next/link";
import { LeadSource, LeadStage, LeadTemperature } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STAGE_LABELS,
  LEAD_TEMPERATURE_LABELS,
} from "@/lib/labels";

type BrokerOption = { id: string; name: string };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LeadFilters({
  brokers,
  values,
  showBrokerFilter,
}: {
  brokers: BrokerOption[];
  values: {
    q?: string;
    source?: string;
    stage?: string;
    temperature?: string;
    brokerId?: string;
  };
  showBrokerFilter: boolean;
}) {
  return (
    <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-6" role="search">
      <Input
        name="q"
        defaultValue={values.q}
        placeholder="Nome, e-mail ou telefone..."
        className="lg:col-span-2"
      />
      <select name="source" defaultValue={values.source ?? ""} className={selectClass}>
        <option value="">Todas origens</option>
        {(Object.keys(LEAD_SOURCE_LABELS) as LeadSource[]).map((s) => (
          <option key={s} value={s}>
            {LEAD_SOURCE_LABELS[s]}
          </option>
        ))}
      </select>
      <select name="stage" defaultValue={values.stage ?? ""} className={selectClass}>
        <option value="">Todas etapas</option>
        {(Object.keys(LEAD_STAGE_LABELS) as LeadStage[]).map((s) => (
          <option key={s} value={s}>
            {LEAD_STAGE_LABELS[s]}
          </option>
        ))}
      </select>
      <select name="temperature" defaultValue={values.temperature ?? ""} className={selectClass}>
        <option value="">Todas temperaturas</option>
        {(Object.keys(LEAD_TEMPERATURE_LABELS) as LeadTemperature[]).map((t) => (
          <option key={t} value={t}>
            {LEAD_TEMPERATURE_LABELS[t]}
          </option>
        ))}
      </select>
      {showBrokerFilter && (
        <select name="brokerId" defaultValue={values.brokerId ?? ""} className={selectClass}>
          <option value="">Todos corretores</option>
          {brokers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-2 lg:col-span-2">
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/leads">Limpar</Link>
        </Button>
      </div>
    </form>
  );
}
