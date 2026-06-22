"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { assertLeadAccess } from "@/lib/access-control";
import { sanitizeString } from "@/lib/utils";
import {
  buildMailtoUrl,
  isEmailConfigured,
  sendLeadDirectEmail,
} from "@/lib/email";
import { z } from "zod";

const sendEmailSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

function appendSignature(body: string, signature?: string | null): string {
  if (!signature?.trim()) return body;
  return `${body.trim()}\n\n--\n${signature.trim()}`;
}

export async function getLeadEmails(leadId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");
  await assertLeadAccess(leadId, user.id, user.role as Role);

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, name: true, email: true },
  });
  if (!lead) throw new Error("Lead não encontrado");

  const emails = await prisma.leadEmail.findMany({
    where: { leadId },
    include: { user: { select: { name: true } } },
    orderBy: { sentAt: "asc" },
  });

  return {
    lead,
    emails,
    smtpConfigured: isEmailConfigured(),
  };
}

export async function sendLeadEmail(
  leadId: string,
  subject: string,
  body: string,
) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");
  await assertLeadAccess(leadId, user.id, user.role as Role);

  const parsed = sendEmailSchema.parse({ subject, body });

  const [lead, broker] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: leadId },
      select: { email: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, replyToEmail: true, emailSignature: true },
    }),
  ]);

  if (!lead) throw new Error("Lead não encontrado");
  if (!lead.email) throw new Error("Lead sem e-mail cadastrado");

  const emailSubject = sanitizeString(parsed.subject, 200);
  const emailBody = appendSignature(
    sanitizeString(parsed.body, 10000),
    broker?.emailSignature,
  );
  const toEmail = lead.email.toLowerCase();
  const replyTo = broker?.replyToEmail ?? broker?.email ?? undefined;
  const fromEmail = process.env.SMTP_FROM ?? undefined;

  let status = "DRAFT";
  let sentViaSmtp = false;

  if (isEmailConfigured()) {
    try {
      await sendLeadDirectEmail({
        to: toEmail,
        subject: emailSubject,
        text: emailBody,
        replyTo,
      });
      status = "SENT";
      sentViaSmtp = true;
    } catch {
      status = "FAILED";
    }
  }

  const mailtoUrl = buildMailtoUrl({
    to: toEmail,
    subject: emailSubject,
    body: emailBody,
  });

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.leadEmail.create({
      data: {
        leadId,
        userId: user.id,
        direction: "OUTBOUND",
        subject: emailSubject,
        body: emailBody,
        status,
        toEmail,
        fromEmail,
      },
    });

    await tx.lead.update({
      where: { id: leadId },
      data: { lastContactAt: new Date() },
    });

    await tx.leadHistory.create({
      data: {
        leadId,
        userId: user.id,
        action: sentViaSmtp ? "EMAIL_ENVIADO" : "EMAIL_REGISTRADO",
        description: sentViaSmtp
          ? `E-mail enviado: ${emailSubject}`
          : `E-mail registrado (SMTP indisponível): ${emailSubject}`,
      },
    });

    return created;
  });

  revalidatePath(`/leads/${leadId}`);

  return {
    message,
    sentViaSmtp,
    mailtoUrl: sentViaSmtp ? undefined : mailtoUrl,
  };
}
