"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { requireOrganizationId } from "@/lib/organization";
import { ingestInboundLead } from "@/lib/lead-ingestion";
import { parseLeadSource } from "@/lib/integrations";

const HEADER_ALIASES: Record<string, string> = {
  nome: "name",
  name: "name",
  telefone: "phone",
  phone: "phone",
  celular: "phone",
  email: "email",
  "e-mail": "email",
  interesse: "interest",
  interest: "interest",
  cidade: "city",
  city: "city",
  estado: "state",
  state: "state",
  uf: "state",
  origem: "source",
  source: "source",
  portal: "portal",
  codigo_imovel: "propertyCode",
  propertycode: "propertyCode",
  imovel: "propertyCode",
};

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map((h) => {
    const key = h.toLowerCase().replace(/\s+/g, "_");
    return HEADER_ALIASES[key] ?? key;
  });

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

export async function importLeadsFromCsv(csvContent: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:create");

  const rows = parseCsv(csvContent);
  if (rows.length === 0) {
    throw new Error("CSV vazio ou sem linhas de dados");
  }

  const organizationId = requireOrganizationId(user);

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name?.trim();
    const phone = row.phone?.trim();

    if (!name || !phone) {
      errors.push(`Linha ${i + 2}: nome e telefone são obrigatórios`);
      skipped++;
      continue;
    }

    try {
      const result = await ingestInboundLead({
        organizationId,
        name,
        phone,
        email: row.email || null,
        interest: row.interest || null,
        city: row.city || null,
        state: row.state || null,
        source: parseLeadSource(row.source),
        propertyCode: row.propertyCode,
        externalSource: row.portal || "csv_import",
        externalId: `csv-${i + 2}-${name}-${phone.replace(/\D/g, "")}`,
        lgpdConsentAt: new Date(),
        historyAction: "IMPORTACAO_CSV",
        historyDescription: `Lead importado via CSV (linha ${i + 2})`,
        automationTrigger: "lead_created",
        notifyBroker: true,
      });

      if (result.created) created++;
      else skipped++;
    } catch (err) {
      errors.push(
        `Linha ${i + 2}: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
      skipped++;
    }
  }

  revalidatePath("/leads");
  revalidatePath("/funil");

  return { created, skipped, total: rows.length, errors: errors.slice(0, 10) };
}
