"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { z } from "zod";
import { AuthError } from "next-auth";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { passwordSchema } from "@/lib/password-policy";
import { loginSchema } from "@/lib/validations/schemas";
import { assertRateLimit } from "@/lib/server-rate-limit";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

const resetRequestSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(32),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export async function loginAction(formData: FormData) {
  await assertRateLimit("login", 10, 15 * 60_000);

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos" };
    }
    throw error;
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  await assertRateLimit("password-reset", 3, 60 * 60_000);

  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (user) {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/redefinir-senha?token=${token}`;

    if (isEmailConfigured()) {
      await sendPasswordResetEmail(user.email, resetUrl);
    } else if (process.env.NODE_ENV === "development") {
      console.info(`[ImobiCRM] Link de recuperação: ${resetUrl}`);
    }
  }

  return {
    success: true,
    message: "Se o e-mail existir, enviaremos instruções de recuperação.",
  };
}

export async function resetPasswordAction(formData: FormData) {
  await assertRateLimit("password-reset-submit", 5, 60 * 60_000);

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const tokenHash = hashToken(parsed.data.token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Token inválido ou expirado" };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId, usedAt: null },
    }),
  ]);

  return { success: true, message: "Senha redefinida com sucesso!" };
}
