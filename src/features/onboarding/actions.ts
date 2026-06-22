"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/server-rate-limit";
import { passwordSchema } from "@/lib/password-policy";
import {
  PLAN_DEFAULTS,
  slugifyOrganization,
  assertOrganizationLimit,
} from "@/lib/organization";
import { DEFAULT_AUTOMATIONS } from "@/lib/automation/defaults";

const registerSchema = z.object({
  orgName: z.string().min(2).max(120),
  slug: z.string().min(2).max(48).optional(),
  adminName: z.string().min(2).max(120),
  adminEmail: z.string().email(),
  password: passwordSchema,
});

export async function registerOrganization(data: z.infer<typeof registerSchema>) {
  await assertRateLimit("register-org", 5, 60 * 60_000);

  const parsed = registerSchema.parse(data);
  const slug = slugifyOrganization(parsed.slug ?? parsed.orgName);
  const email = parsed.adminEmail.toLowerCase();

  if (!slug) throw new Error("Slug da organização inválido");

  const slugTaken = await prisma.organization.findUnique({ where: { slug } });
  if (slugTaken) throw new Error("Este endereço (slug) já está em uso");

  const emailTaken = await prisma.user.findFirst({
    where: { email, organizationId: { not: null } },
  });
  if (emailTaken) throw new Error("E-mail já cadastrado em outra organização");

  const trial = PLAN_DEFAULTS.TRIAL;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + (trial.trialDays ?? 14));

  const passwordHash = await hash(parsed.password, 12);

  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: parsed.orgName,
        slug,
        plan: "TRIAL",
        maxUsers: trial.maxUsers,
        maxLeads: trial.maxLeads,
        maxProperties: trial.maxProperties,
        trialEndsAt,
        billingEmail: email,
      },
    });

    await tx.systemConfig.create({
      data: {
        organizationId: org.id,
        companyName: parsed.orgName,
        tagline: "Gestão comercial imobiliária",
      },
    });

    await tx.automation.createMany({
      data: DEFAULT_AUTOMATIONS.map((item) => ({
        ...item,
        organizationId: org.id,
      })),
    });

    await tx.user.create({
      data: {
        organizationId: org.id,
        name: parsed.adminName,
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

    return org;
  });

  revalidatePath("/super-admin");
  return { organizationId: organization.id, slug: organization.slug };
}

export async function checkSlugAvailable(slugInput: string) {
  const slug = slugifyOrganization(slugInput);
  if (!slug) return { available: false, slug: "" };
  const existing = await prisma.organization.findUnique({ where: { slug } });
  return { available: !existing, slug };
}

export async function assertCanCreateUser(organizationId: string) {
  await assertOrganizationLimit(organizationId, "users");
}
