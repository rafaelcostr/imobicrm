"use server";

import { revalidatePath } from "next/cache";
import {
  PropertyStatus,
  MediaType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { sanitizeString } from "@/lib/utils";
import { propertySchema } from "@/lib/validations/schemas";
import { buildPaginatedResult, parsePagination } from "@/lib/pagination";
import { isStorageConfigured, uploadFile, deleteFileByUrl, inferMediaType } from "@/lib/storage";
import type { z } from "zod";

function buildPropertyWhere(
  user: { id: string; role: Role },
  filters?: { search?: string; status?: PropertyStatus },
) {
  return {
    ...(user.role === "CORRETOR" ? { brokerId: user.id } : {}),
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { code: { contains: filters.search, mode: "insensitive" as const } },
            { city: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function getProperties(filters?: {
  search?: string;
  status?: PropertyStatus;
  page?: string;
  pageSize?: string;
}) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:view");

  const { page, pageSize, skip } = parsePagination(filters);
  const where = buildPropertyWhere(user, filters);

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        media: { where: { type: "IMAGE" }, take: 1 },
        broker: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function getPropertyOptions(availableOnly = true) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:view");

  return prisma.property.findMany({
    where: {
      ...(user.role === "CORRETOR" ? { brokerId: user.id } : {}),
      ...(availableOnly ? { status: "DISPONIVEL" } : {}),
    },
    select: { id: true, title: true, code: true, price: true, city: true },
    orderBy: { title: "asc" },
    take: 200,
  });
}

export async function getPropertyById(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:view");

  const property = await prisma.property.findUnique({
    where: { id },
    include: { media: { orderBy: { sortOrder: "asc" } }, broker: true },
  });

  if (!property) return null;
  if (user.role === "CORRETOR" && property.brokerId !== user.id) {
    throw new Error("Acesso negado");
  }
  return property;
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:create");

  const parsed = propertySchema.parse(data);

  const property = await prisma.property.create({
    data: {
      code: sanitizeString(parsed.code, 30).toUpperCase(),
      title: sanitizeString(parsed.title, 200),
      description: parsed.description ? sanitizeString(parsed.description, 5000) : null,
      type: parsed.type,
      purpose: parsed.purpose,
      price: parsed.price,
      condoFee: parsed.condoFee,
      iptu: parsed.iptu,
      bedrooms: parsed.bedrooms,
      bathrooms: parsed.bathrooms,
      suites: parsed.suites,
      garages: parsed.garages,
      totalArea: parsed.totalArea,
      builtArea: parsed.builtArea,
      street: parsed.street,
      number: parsed.number,
      complement: parsed.complement,
      neighborhood: parsed.neighborhood,
      city: sanitizeString(parsed.city, 100),
      state: parsed.state.toUpperCase(),
      zipCode: parsed.zipCode,
      status: parsed.status ?? "DISPONIVEL",
      isPublished: parsed.isPublished ?? false,
      publishedAt: parsed.isPublished ? new Date() : null,
      brokerId: user.id,
    },
  });

  revalidatePath("/imoveis");
  revalidatePath("/dashboard");
  return property;
}

export async function updateProperty(id: string, data: z.infer<typeof propertySchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:edit");

  await getPropertyById(id);

  const parsed = propertySchema.parse(data);

  const property = await prisma.property.update({
    where: { id },
    data: {
      code: sanitizeString(parsed.code, 30).toUpperCase(),
      title: sanitizeString(parsed.title, 200),
      description: parsed.description ? sanitizeString(parsed.description, 5000) : null,
      type: parsed.type,
      purpose: parsed.purpose,
      price: parsed.price,
      condoFee: parsed.condoFee ?? null,
      iptu: parsed.iptu ?? null,
      bedrooms: parsed.bedrooms,
      bathrooms: parsed.bathrooms,
      suites: parsed.suites,
      garages: parsed.garages,
      totalArea: parsed.totalArea ?? null,
      builtArea: parsed.builtArea ?? null,
      street: parsed.street ?? null,
      number: parsed.number ?? null,
      complement: parsed.complement ?? null,
      neighborhood: parsed.neighborhood ?? null,
      city: sanitizeString(parsed.city, 100),
      state: parsed.state.toUpperCase(),
      zipCode: parsed.zipCode ?? null,
      status: parsed.status ?? "DISPONIVEL",
      ...(parsed.isPublished !== undefined && {
        isPublished: parsed.isPublished,
        publishedAt: parsed.isPublished ? new Date() : null,
      }),
    },
  });

  revalidatePath("/imoveis");
  revalidatePath("/dashboard");
  revalidatePath("/vitrine");
  revalidatePath(`/imoveis/${id}`);
  return property;
}

export async function deleteProperty(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:delete");

  await getPropertyById(id);

  await prisma.property.delete({ where: { id } });
  revalidatePath("/imoveis");
  revalidatePath("/vitrine");
}

export async function uploadPropertyMedia(propertyId: string, formData: FormData) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:edit");

  if (!isStorageConfigured()) {
    throw new Error("Upload indisponível: configure R2/S3 nas variáveis S3_* do .env");
  }

  await getPropertyById(propertyId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione um arquivo para upload");
  }

  const uploaded = await uploadFile(file, "property", propertyId, { allowPdf: true });
  const type = inferMediaType(uploaded.contentType);

  const count = await prisma.propertyMedia.count({ where: { propertyId } });

  const media = await prisma.propertyMedia.create({
    data: {
      propertyId,
      url: uploaded.url,
      type,
      fileName: file.name,
      sortOrder: count,
    },
  });

  revalidatePath(`/imoveis/${propertyId}`);
  revalidatePath("/vitrine");
  return media;
}

export async function deletePropertyMedia(mediaId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:edit");

  const media = await prisma.propertyMedia.findUnique({
    where: { id: mediaId },
    include: { property: true },
  });
  if (!media) throw new Error("Mídia não encontrada");

  await getPropertyById(media.propertyId);

  if (isStorageConfigured() && media.url.startsWith("http")) {
    await deleteFileByUrl(media.url).catch(() => undefined);
  }

  await prisma.propertyMedia.delete({ where: { id: mediaId } });

  revalidatePath(`/imoveis/${media.propertyId}`);
  revalidatePath("/vitrine");
}

export async function addPropertyMedia(
  propertyId: string,
  media: { url: string; type: MediaType; fileName?: string },
) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:edit");

  await getPropertyById(propertyId);

  return prisma.propertyMedia.create({
    data: {
      propertyId,
      url: media.url,
      type: media.type,
      fileName: media.fileName,
    },
  });
}