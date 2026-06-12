import { PrismaClient, LeadStage, LeadSource, LeadTemperature, PropertyType, PropertyPurpose, PropertyStatus, CommissionStatus, TaskType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do ImobiCRM...");

  await prisma.notification.deleteMany();
  await prisma.whatsAppMessage.deleteMany();
  await prisma.report.deleteMany();
  await prisma.task.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.leadAttachment.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.leadHistory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.property.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.whatsAppTemplate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const passwordHash = await hash("Imobi@2026", 12);

  const team = await prisma.team.create({
    data: { name: "Equipe Alpha Imóveis" },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Carlos Administrador",
      email: "admin@imobicrm.com",
      passwordHash,
      role: "ADMIN",
      phone: "(11) 99999-0001",
      creci: "123456-F",
      monthlyGoal: 50000,
      teamId: team.id,
    },
  });

  const gestor = await prisma.user.create({
    data: {
      name: "Ana Gestora",
      email: "gestor@imobicrm.com",
      passwordHash,
      role: "GESTOR",
      phone: "(11) 99999-0002",
      teamId: team.id,
    },
  });

  const brokers = await Promise.all([
    prisma.user.create({
      data: {
        name: "João Silva",
        email: "joao@imobicrm.com",
        passwordHash,
        role: "CORRETOR",
        phone: "(11) 98888-1001",
        creci: "654321-F",
        monthlyGoal: 30000,
        teamId: team.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Maria Oliveira",
        email: "maria@imobicrm.com",
        passwordHash,
        role: "CORRETOR",
        phone: "(11) 98888-1002",
        creci: "789012-F",
        monthlyGoal: 25000,
        teamId: team.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Pedro Santos",
        email: "pedro@imobicrm.com",
        passwordHash,
        role: "CORRETOR",
        phone: "(11) 98888-1003",
        creci: "345678-F",
        monthlyGoal: 20000,
        teamId: team.id,
      },
    }),
  ]);

  const properties = await Promise.all([
    prisma.property.create({
      data: {
        code: "AP-001",
        title: "Apartamento no Centro",
        description: "Apartamento moderno com varanda, armários planejados e vista para a cidade.",
        type: PropertyType.APARTAMENTO,
        purpose: PropertyPurpose.VENDA,
        price: 650000,
        condoFee: 850,
        iptu: 320,
        bedrooms: 3,
        bathrooms: 2,
        suites: 1,
        garages: 2,
        totalArea: 95,
        builtArea: 85,
        street: "Rua das Flores",
        number: "120",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01001-000",
        status: PropertyStatus.DISPONIVEL,
        isPublished: true,
        publishedAt: new Date(),
        brokerId: brokers[0].id,
        media: {
          create: [{
            type: "IMAGE",
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            fileName: "ap001.jpg",
            sortOrder: 0,
          }],
        },
      },
    }),
    prisma.property.create({
      data: {
        code: "CS-002",
        title: "Casa em Condomínio Fechado",
        description: "Casa ampla com quintal, piscina e área gourmet.",
        type: PropertyType.CASA,
        purpose: PropertyPurpose.VENDA,
        price: 1200000,
        bedrooms: 4,
        bathrooms: 3,
        suites: 2,
        garages: 4,
        totalArea: 350,
        builtArea: 280,
        neighborhood: "Alphaville",
        city: "Barueri",
        state: "SP",
        status: PropertyStatus.DISPONIVEL,
        isPublished: true,
        publishedAt: new Date(),
        brokerId: brokers[1].id,
        media: {
          create: [{
            type: "IMAGE",
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            fileName: "cs002.jpg",
            sortOrder: 0,
          }],
        },
      },
    }),
    prisma.property.create({
      data: {
        code: "AP-003",
        title: "Studio Mobiliado para Aluguel",
        type: PropertyType.STUDIO,
        purpose: PropertyPurpose.ALUGUEL,
        price: 2800,
        bedrooms: 1,
        bathrooms: 1,
        garages: 1,
        builtArea: 35,
        city: "São Paulo",
        state: "SP",
        neighborhood: "Pinheiros",
        status: PropertyStatus.ALUGADO,
        brokerId: brokers[2].id,
      },
    }),
  ]);

  const leadData = [
    { name: "Roberto Almeida", phone: "(11) 97777-1001", source: LeadSource.INSTAGRAM, stage: LeadStage.VISITA_AGENDADA, temperature: LeadTemperature.QUENTE, brokerId: brokers[0].id },
    { name: "Fernanda Costa", phone: "(11) 97777-1002", source: LeadSource.INDICACAO, stage: LeadStage.PROPOSTA, temperature: LeadTemperature.QUENTE, brokerId: brokers[0].id },
    { name: "Lucas Mendes", phone: "(11) 97777-1003", source: LeadSource.GOOGLE, stage: LeadStage.QUALIFICADO, temperature: LeadTemperature.MORNO, brokerId: brokers[1].id },
    { name: "Patricia Lima", phone: "(11) 97777-1004", source: LeadSource.FACEBOOK, stage: LeadStage.PRIMEIRO_CONTATO, temperature: LeadTemperature.MORNO, brokerId: brokers[1].id },
    { name: "Marcos Vieira", phone: "(11) 97777-1005", source: LeadSource.OLX, stage: LeadStage.NEGOCIACAO, temperature: LeadTemperature.QUENTE, brokerId: brokers[2].id },
    { name: "Juliana Rocha", phone: "(11) 97777-1006", source: LeadSource.ZAP_IMOVEIS, stage: LeadStage.VENDA_CONCLUIDA, temperature: LeadTemperature.QUENTE, brokerId: brokers[2].id },
    { name: "Ricardo Nunes", phone: "(11) 97777-1007", source: LeadSource.SITE, stage: LeadStage.NOVO_LEAD, temperature: LeadTemperature.FRIO, brokerId: brokers[0].id },
    { name: "Camila Duarte", phone: "(11) 97777-1008", source: LeadSource.VIVA_REAL, stage: LeadStage.PERDIDO, temperature: LeadTemperature.FRIO, brokerId: brokers[1].id },
  ];

  for (const data of leadData) {
    await prisma.lead.create({
      data: {
        ...data,
        email: `${data.name.split(" ")[0].toLowerCase()}@email.com`,
        city: "São Paulo",
        state: "SP",
        interest: "Apartamento 3 quartos",
        priceRange: "R$ 500.000 - R$ 700.000",
        teamId: team.id,
        lastContactAt: new Date(),
        histories: {
          create: { action: "LEAD_CRIADO", description: "Lead importado pelo seed", userId: gestor.id },
        },
      },
    });
  }

  const sale = await prisma.sale.create({
    data: {
      propertyId: properties[0].id,
      brokerId: brokers[2].id,
      amount: 650000,
      closedAt: new Date(),
      commission: {
        create: {
          brokerId: brokers[2].id,
          propertyValue: 650000,
          percentage: 3,
          amount: 19500,
          status: CommissionStatus.PAGO,
          paidAt: new Date(),
        },
      },
    },
  });

  await prisma.proposal.createMany({
    data: [
      { leadId: (await prisma.lead.findFirst({ where: { name: "Fernanda Costa" } }))!.id, propertyId: properties[0].id, brokerId: brokers[0].id, amount: 620000 },
      { leadId: (await prisma.lead.findFirst({ where: { name: "Marcos Vieira" } }))!.id, propertyId: properties[1].id, brokerId: brokers[2].id, amount: 1150000 },
    ],
  });

  await prisma.visit.createMany({
    data: [
      {
        leadId: (await prisma.lead.findFirst({ where: { name: "Roberto Almeida" } }))!.id,
        propertyId: properties[0].id,
        brokerId: brokers[0].id,
        scheduledAt: new Date(Date.now() + 86400000),
      },
    ],
  });

  const today = new Date();
  await prisma.task.createMany({
    data: [
      { title: "Visita - Apartamento Centro", type: TaskType.VISITA, startAt: new Date(today.setHours(10, 0)), userId: brokers[0].id },
      { title: "Retorno - Fernanda Costa", type: TaskType.RETORNO, startAt: new Date(today.setHours(14, 30)), userId: brokers[0].id },
      { title: "Reunião de equipe", type: TaskType.REUNIAO, startAt: new Date(today.setHours(16, 0)), userId: gestor.id },
      { title: "Ligação - Lucas Mendes", type: TaskType.LIGACAO, startAt: new Date(today.setHours(11, 0)), userId: brokers[1].id },
    ],
  });

  await prisma.whatsAppTemplate.createMany({
    data: [
      { name: "Boas-vindas", content: "Olá {{nome}}! Sou corretor da Alpha Imóveis. Vi seu interesse em imóveis. Posso ajudar?" },
      { name: "Follow-up", content: "Olá {{nome}}, notei que ainda não retornamos nossa conversa. Posso enviar novas opções?" },
      { name: "Visita agendada", content: "Confirmado! Sua visita está agendada para {{data}}. Qualquer dúvida, estou à disposição." },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: brokers[0].id, type: "LEAD", title: "Novo lead", message: "Ricardo Nunes entrou pelo site", link: "/leads" },
      { userId: brokers[1].id, type: "TASK", title: "Ligação agendada", message: "Ligação com Lucas Mendes às 11h", link: "/agenda" },
    ],
  });

  console.log("✅ Seed concluído!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Admin:    admin@imobicrm.com / Imobi@2026");
  console.log("   Gestor:   gestor@imobicrm.com / Imobi@2026");
  console.log("   Corretor: joao@imobicrm.com / Imobi@2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
