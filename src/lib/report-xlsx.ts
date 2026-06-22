import ExcelJS from "exceljs";
import { BRAND } from "@/lib/brand";

function flattenRow(row: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flat, flattenRow(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      flat[fullKey] = JSON.stringify(value);
    } else {
      flat[fullKey] = value;
    }
  }
  return flat;
}

export async function reportDataToXlsxBuffer(
  title: string,
  data: unknown,
): Promise<Buffer> {
  const rows = Array.isArray(data) ? data : [data];
  const flatRows = rows.map((item) => flattenRow(item as Record<string, unknown>));
  const headers =
    flatRows.length > 0
      ? Array.from(new Set(flatRows.flatMap((row) => Object.keys(row))))
      : ["dados"];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = BRAND.product;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31));
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };

  for (const row of flatRows) {
    sheet.addRow(headers.map((h) => {
      const value = row[h];
      if (value instanceof Date) return value;
      if (value === null || value === undefined) return "";
      return value;
    }));
  }

  sheet.columns.forEach((column) => {
    column.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
