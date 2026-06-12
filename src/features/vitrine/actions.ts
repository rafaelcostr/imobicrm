"use server";

import { PropertyPurpose, PropertyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, parsePagination } from "@/lib/pagination";

const publicPropertySelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  type: true,
  purpose: true,
  price: true,
  condoFee: true,
  iptu: true,
  bedrooms: true,
  bathrooms: true,
  suites: true,
  garages: true,
  totalArea: true,
  builtArea: true,
  neighborhood: true,
  city: true,
  state: true,
  status: true,
  publishedAt: true,
  media: {
    where: { type: "IMAGE" as const },
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, fileName: true, sortOrder: true },
  },
} as const;

function buildPublicWhere(filters?: {
  search?: string;
  type?: PropertyType;
  purpose?: PropertyPurpose;
  city?: string;
}) {
  return {
    isPublished: true,
    status: "DISPONIVEL" as const,
    ...(filters?.type ? { type: filters.type } : {}),
    ...(filters?.purpose ? { purpose: filters.purpose } : {}),
    ...(filters?.city
      ? { city: { contains: filters.city, mode: "insensitive" as const } }
      : {}),
    ...(filters?.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { code: { contains: filters.search, mode: "insensitive" as const } },
            { neighborhood: { contains: filters.search, mode: "insensitive" as const } },
            { city: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function getPublicProperties(filters?: {
  search?: string;
  type?: PropertyType;
  purpose?: PropertyPurpose;
  city?: string;
  page?: string;
  pageSize?: string;
}) {
  const { page, pageSize, skip } = parsePagination(filters);
  const where = buildPublicWhere(filters);

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: publicPropertySelect,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function getPublicPropertyByCode(code: string) {
  return prisma.property.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isPublished: true,
      status: "DISPONIVEL",
    },
    select: {
      ...publicPropertySelect,
      media: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, fileName: true, type: true, sortOrder: true },
      },
    },
  });
}

export async function getPublicPropertyFilterOptions() {
  const [cities, types, purposes] = await Promise.all([
    prisma.property.findMany({
      where: { isPublished: true, status: "DISPONIVEL" },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    prisma.property.groupBy({
      by: ["type"],
      where: { isPublished: true, status: "DISPONIVEL" },
    }),
    prisma.property.groupBy({
      by: ["purpose"],
      where: { isPublished: true, status: "DISPONIVEL" },
    }),
  ]);

  return {
    cities: cities.map((c) => c.city),
    types: types.map((t) => t.type),
    purposes: purposes.map((p) => p.purpose),
  };
}
