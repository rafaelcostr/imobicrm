import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { BRAND } from "../src/lib/brand";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Syntra@2026";

const TENANT_ACCOUNTS = [
  { email: "demo@syntra.app", name: "Usuário Demo", role: "ADMIN" as const },
  { email: "admin@syntra.app", name: "Carlos Administrador", role: "ADMIN" as const },
  { email: "gestor@syntra.app", name: "Ana Gestora", role: "GESTOR" as const },
  { email: "joao@syntra.app", name: "João Silva", role: "CORRETOR" as const },
];

/** Contas legadas do seed antigo (antes do rebrand). */
const LEGACY_EMAILS = ["admin@imobicrm.com", "gestor@imobicrm.com", "joao@imobicrm.com"];

async function main() {
  let org = await prisma.organization.findFirst({
    where: { slug: "alpha-imoveis", isActive: true },
    include: { teams: { take: 1 } },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Alpha Imóveis",
        slug: "alpha-imoveis",
        plan: "PRO",
        trialEndsAt: new Date(Date.now() + 14 * 86400000),
        systemConfig: {
          create: {
            companyName: "Alpha Imóveis",
            tagline: "Gestão comercial imobiliária",
          },
        },
        teams: { create: [{ name: "Equipe Alpha" }] },
      },
      include: { teams: { take: 1 } },
    });
  }

  const teamId =
    org.teams[0]?.id ??
    (
      await prisma.team.create({
        data: { name: "Equipe Alpha", organizationId: org.id },
      })
    ).id;

  const passwordHash = await hash(DEMO_PASSWORD, 12);

  for (const account of TENANT_ACCOUNTS) {
    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: account.email,
        },
      },
      create: {
        organizationId: org.id,
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        teamId,
        isActive: true,
      },
      update: {
        passwordHash,
        isActive: true,
        role: account.role,
        teamId,
      },
    });
  }

  for (const email of LEGACY_EMAILS) {
    await prisma.user.updateMany({
      where: { email },
      data: { passwordHash, isActive: true },
    });
  }

  await prisma.user.updateMany({
    where: { email: "super@syntra.app", role: "SUPER_ADMIN" },
    data: { passwordHash, isActive: true },
  });

  await prisma.user.updateMany({
    where: { email: "super@imobicrm.com", role: "SUPER_ADMIN" },
    data: { passwordHash, isActive: true },
  });

  console.log(`Contas de acesso prontas (${BRAND.product})`);
  console.log("");
  console.log("Use qualquer uma destas (senha igual para todas):");
  console.log(`  Senha: ${DEMO_PASSWORD}`);
  console.log("");
  for (const account of TENANT_ACCOUNTS) {
    console.log(`  ${account.email}  (${account.role})`);
  }
  console.log("");
  console.log("Legado (se existir no banco): admin@imobicrm.com / mesma senha");
  console.log("Login: http://localhost:3000/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
