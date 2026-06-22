import Link from "next/link";
import { PropertyStatus, PropertyType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";

type BrokerOption = { id: string; name: string };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PropertyFilters({
  brokers,
  values,
  showBrokerFilter,
}: {
  brokers: BrokerOption[];
  values: {
    q?: string;
    status?: string;
    type?: string;
    city?: string;
    brokerId?: string;
  };
  showBrokerFilter: boolean;
}) {
  return (
    <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-6" role="search">
      <Input
        name="q"
        defaultValue={values.q}
        placeholder="Título, código ou cidade..."
        className="lg:col-span-2"
      />
      <select name="status" defaultValue={values.status ?? ""} className={selectClass}>
        <option value="">Todos status</option>
        {(Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]).map((s) => (
          <option key={s} value={s}>
            {PROPERTY_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select name="type" defaultValue={values.type ?? ""} className={selectClass}>
        <option value="">Todos tipos</option>
        {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
          <option key={t} value={t}>
            {PROPERTY_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <Input name="city" defaultValue={values.city} placeholder="Cidade" />
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
          <Link href="/imoveis">Limpar</Link>
        </Button>
      </div>
    </form>
  );
}
