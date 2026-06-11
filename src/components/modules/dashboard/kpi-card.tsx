import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  className?: string;
}

export function KpiCard({ title, value, trend, icon: Icon, className }: KpiCardProps) {
  const positive = trend !== undefined && trend >= 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className={cn("mt-1 flex items-center text-xs", positive ? "text-emerald-500" : "text-red-500")}>
            {positive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {positive ? "+" : ""}
            {trend}% em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
