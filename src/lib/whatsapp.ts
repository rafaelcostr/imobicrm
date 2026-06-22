const GRAPH_API_VERSION = "v21.0";

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_VERIFY_TOKEN,
  );
}

export function normalizeWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return digits;
}

export function buildWhatsAppUrl(raw: string): string {
  const phone = normalizeWhatsAppPhone(raw);
  return phone ? `https://wa.me/${phone}` : "#";
}

export type SendWhatsAppResult = {
  externalId: string;
  status: string;
};

export async function sendWhatsAppTextMessage(
  toPhone: string,
  body: string,
): Promise<SendWhatsAppResult> {
  if (!isWhatsAppConfigured()) {
    throw new Error("WhatsApp API não configurada");
  }

  const token = process.env.WHATSAPP_TOKEN!;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const to = normalizeWhatsAppPhone(toPhone);

  if (to.length < 12) {
    throw new Error("Número de WhatsApp inválido");
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
    },
  );

  const data = (await response.json()) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Falha ao enviar mensagem WhatsApp");
  }

  const externalId = data.messages?.[0]?.id;
  if (!externalId) {
    throw new Error("Resposta inválida da API WhatsApp");
  }

  return { externalId, status: "SENT" };
}

export async function findLeadIdByPhone(phone: string): Promise<string | null> {
  const { prisma } = await import("@/lib/prisma");
  const normalized = normalizeWhatsAppPhone(phone);
  const suffix = normalized.slice(-8);

  if (suffix.length < 8) return null;

  const lead = await prisma.lead.findFirst({
    where: {
      OR: [
        { phone: { contains: suffix } },
        { whatsapp: { contains: suffix } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  return lead?.id ?? null;
}
