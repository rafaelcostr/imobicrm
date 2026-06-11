"use client";

import {
  Bar,
  BarChart,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STAGE_LABELS } from "@/lib/labels";
import type { LeadStage } from "@prisma/client";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#6366f1"];

interface SalesChartProps {
  data: { month: string; total: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por mês</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Vendas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface SourceChartProps {
  data: { name: string; value: number }[];
}

export function SourceChart({ data }: SourceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads por origem</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface FunnelChartProps {
  data: { stage: LeadStage; _count: { id: number } }[];
}

export function ConversionFunnel({ data }: FunnelChartProps) {
  const chartData = data.map((d) => ({
    name: LEAD_STAGE_LABELS[d.stage],
    value: d._count.id,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de conversão</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Funnel dataKey="value" data={chartData} isAnimationActive>
              <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" />
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface BrokerRankingProps {
  data: { id: string; name: string; sales: number; leads: number; commission: number }[];
}

export function BrokerRankingChart({ data }: BrokerRankingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de corretores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((broker, i) => (
            <div key={broker.id} className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium">{broker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {broker.sales} vendas · {broker.leads} leads
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-500">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(broker.commission)}
              </span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
