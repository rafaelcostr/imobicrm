import nodemailer from "nodemailer";

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
    subject: "Recuperação de senha — ImobiCRM",
    text: `Recebemos uma solicitação para redefinir sua senha no ImobiCRM.\n\nAcesse o link abaixo (válido por 1 hora):\n${resetUrl}\n\nSe você não solicitou, ignore este e-mail.`,
    html: `
      <p>Recebemos uma solicitação para redefinir sua senha no <strong>ImobiCRM</strong>.</p>
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
      <p><a href="${leadLink}">Ver lead no ImobiCRM</a></p>
    `,
  });
}
