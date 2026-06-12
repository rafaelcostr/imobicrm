/** Calcula variação percentual mês atual vs mês anterior. */
export function calcTrend(current: number, previous: number): number {
  if (previous > 0) {
    return Math.round(((current - previous) / previous) * 100);
  }
  return current > 0 ? 100 : 0;
}
