import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findLeadIdByPhone, normalizeWhatsAppPhone } from "@/lib/whatsapp";

type WebhookMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};

type WebhookStatus = {
  id: string;
  status: string;
  timestamp: string;
};

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    challenge &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ received: true });
    }

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;

        for (const message of (value.messages ?? []) as WebhookMessage[]) {
          await handleInboundMessage(message);
        }

        for (const status of (value.statuses ?? []) as WebhookStatus[]) {
          await handleStatusUpdate(status);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WhatsApp Webhook]", error);
    return NextResponse.json({ received: true });
  }
}

async function handleInboundMessage(message: WebhookMessage) {
  if (message.type !== "text" || !message.text?.body) return;

  const existing = await prisma.whatsAppMessage.findUnique({
    where: { externalId: message.id },
  });
  if (existing) return;

  const leadId = await findLeadIdByPhone(message.from);
  if (!leadId) {
    console.warn("[WhatsApp] Lead não encontrado para", message.from);
    return;
  }

  await prisma.$transaction([
    prisma.whatsAppMessage.create({
      data: {
        leadId,
        direction: "INBOUND",
        content: message.text.body,
        status: "RECEIVED",
        externalId: message.id,
        phone: normalizeWhatsAppPhone(message.from),
      },
    }),
    prisma.lead.update({
      where: { id: leadId },
      data: { lastContactAt: new Date() },
    }),
    prisma.leadHistory.create({
      data: {
        leadId,
        action: "WHATSAPP_RECEBIDO",
        description: "Mensagem recebida via WhatsApp",
      },
    }),
  ]);
}

async function handleStatusUpdate(status: WebhookStatus) {
  const mapped =
    status.status === "delivered"
      ? "DELIVERED"
      : status.status === "read"
        ? "READ"
        : status.status === "failed"
          ? "FAILED"
          : status.status === "sent"
            ? "SENT"
            : status.status.toUpperCase();

  await prisma.whatsAppMessage.updateMany({
    where: { externalId: status.id },
    data: { status: mapped },
  });
}
