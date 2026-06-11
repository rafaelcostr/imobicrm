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
import type { z } from "zod";

export async function getProperties(filters?: { search?: string; status?: PropertyStatus }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:view");

  return prisma.property.findMany({
    where: {
      ...(user.role === "CORRETOR" ? { brokerId: user.id } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { code: { contains: filters.search, mode: "insensitive" } },
              { city: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      media: { where: { type: "IMAGE" }, take: 1 },
      broker: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
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
      brokerId: user.id,
    },
  });

  revalidatePath("/imoveis");
  revalidatePath("/dashboard");
  return property;
}

export async function updateProperty(id: string, data: Partial<z.infer<typeof propertySchema>>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:edit");

  await getPropertyById(id);

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...(data.title && { title: sanitizeString(data.title, 200) }),
      ...(data.price && { price: data.price }),
      ...(data.status && { status: data.status }),
      ...(data.description !== undefined && {
        description: data.description ? sanitizeString(data.description, 5000) : null,
      }),
    },
  });

  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${id}`);
  return property;
}

export async function deleteProperty(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "properties:delete");

  await getPropertyById(id);

  await prisma.property.delete({ where: { id } });
  revalidatePath("/imoveis");
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