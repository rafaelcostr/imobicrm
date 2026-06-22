import { NextResponse } from "next/server";
import { runColdLeadAutomations } from "@/lib/automation/engine";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await runColdLeadAutomations();
  return NextResponse.json({ ok: true, ...result });
}
