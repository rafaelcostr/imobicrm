import nodemailer from "nodemailer";
import { BRAND } from "@/lib/brand";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    throw new Error("SMTP não configurado. Verifique SMTP_HOST e SMTP_FROM no .env");
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br>"),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Recuperação de senha — ${BRAND.product}`,
    text: `Recebemos uma solicitação para redefinir sua senha no ${BRAND.product}.\n\nAcesse o link abaixo (válido por 1 hora):\n${resetUrl}\n\nSe você não solicitou, ignore este e-mail.`,
    html: `
      <p>Recebemos uma solicitação para redefinir sua senha no <strong>${BRAND.product}</strong>.</p>
      <p><a href="${resetUrl}">Redefinir minha senha</a></p>
      <p>O link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
    `,
  });
}

export async function sendLeadCaptureEmail(
  to: string,
  leadName: string,
  leadLink: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `Novo lead captado — ${leadName}`,
    text: `Um novo lead entrou pelo formulário público: ${leadName}.\n\nAcesse: ${leadLink}`,
    html: `
      <p>Novo lead captado pelo site: <strong>${leadName}</strong>.</p>
      <p><a href="${leadLink}">Ver lead no ${BRAND.product}</a></p>
    `,
  });
}

export async function sendUserInviteEmail(
  to: string,
  name: string,
  setupUrl: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `Convite ${BRAND.product} — configure sua senha`,
    text: `Olá ${name},\n\nVocê foi convidado para o ${BRAND.product} (${BRAND.platform}).\n\nDefina sua senha pelo link:\n${setupUrl}\n\nO link é válido por 7 dias.`,
    html: `
      <p>Olá <strong>${name}</strong>,</p>
      <p>Você foi convidado para acessar o <strong>${BRAND.product}</strong>.</p>
      <p><a href="${setupUrl}">Definir minha senha</a></p>
      <p>O link é válido por 7 dias.</p>
    `,
  });
}

export function buildMailtoUrl(options: {
  to: string;
  subject: string;
  body: string;
}): string {
  const params = new URLSearchParams();
  if (options.subject) params.set("subject", options.subject);
  if (options.body) params.set("body", options.body);
  const query = params.toString();
  return `mailto:${options.to}${query ? `?${query}` : ""}`;
}

export async function sendLeadDirectEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error("SMTP não configurado");
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br>"),
  });
}
