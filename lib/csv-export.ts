export type CsvCell = string | number | boolean | Date | null | undefined;

export function downloadCsvForExcel(
  filename: string,
  headers: CsvCell[],
  rows: CsvCell[][],
) {
  const content = [
    "sep=;",
    toCsvRow(headers),
    ...rows.map((row) => toCsvRow(row)),
  ].join("\r\n");

  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsvRow(row: CsvCell[]) {
  return row.map(toCsvCell).join(";");
}

function toCsvCell(value: CsvCell) {
  const normalized = value instanceof Date ? value.toISOString() : value ?? "";
  return `"${String(normalized)
    .replaceAll('"', '""')
    .replaceAll(/\r?\n/g, " ")}"`;
}
