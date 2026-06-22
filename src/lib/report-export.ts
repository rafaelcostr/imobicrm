import { BRAND } from "@/lib/brand";

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return escapeCsvCell(JSON.stringify(value));
  const str = String(value);
  if (str.includes(";") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function flattenRow(row: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flat, flattenRow(value as Record<string, unknown>, fullKey));
    } else {
      flat[fullKey] = value;
    }
  }
  return flat;
}

export function reportDataToCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return "Nenhum dado";
  }

  const rows = data.map((item) => flattenRow(item as Record<string, unknown>));
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  const lines = [
    headers.join(";"),
    ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(";")),
  ];

  return `\uFEFF${lines.join("\n")}`;
}

export function downloadTextFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function openReportPdf(title: string, data: unknown) {
  const rows = Array.isArray(data) ? data : [data];
  const flatRows = rows.map((item) => flattenRow(item as Record<string, unknown>));
  const headers =
    flatRows.length > 0
      ? Array.from(new Set(flatRows.flatMap((row) => Object.keys(row))))
      : [];

  const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
  const tableBody = flatRows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${escapeHtml(String(row[h] ?? ""))}</td>`).join("")}</tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    p { font-size: 12px; color: #666; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; }
    tr:nth-child(even) { background: #fafafa; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${BRAND.product} — gerado em ${new Date().toLocaleString("pt-BR")}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
