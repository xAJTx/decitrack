import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { Employee } from "@/src/store/AppStore";
import { formatFullDate, formatMonthLabel } from "@/src/utils/dates";
import {
  Entry,
  formatStandard,
  toDecimal,
  workedMinutes,
} from "@/src/utils/time";

type Row = { entry: Entry; minutes: number };

function buildRows(entries: Entry[]): Row[] {
  return entries.map((entry) => ({ entry, minutes: workedMinutes(entry) }));
}

function totalMinutes(rows: Row[]): number {
  return rows.reduce((sum, r) => sum + r.minutes, 0);
}

export async function exportCSV(
  employee: Employee,
  monthKey: string,
  entries: Entry[],
): Promise<void> {
  const rows = buildRows(entries);
  const lines = [
    `Employé;${employee.name}`,
    `Mois;${formatMonthLabel(monthKey)}`,
    "",
    "Date;Début;Fin;Pause (min);Heures (standard);Heures (décimal)",
  ];
  for (const { entry, minutes } of rows) {
    const breakMin = entry.breaks.reduce((s, b) => {
      const bs = b.start.split(":");
      const be = b.end.split(":");
      if (bs.length === 2 && be.length === 2) {
        const dm =
          Number(be[0]) * 60 + Number(be[1]) - (Number(bs[0]) * 60 + Number(bs[1]));
        return s + (dm > 0 ? dm : 0);
      }
      return s;
    }, 0);
    lines.push(
      [
        entry.date,
        entry.start,
        entry.end,
        String(breakMin),
        formatStandard(minutes),
        toDecimal(minutes),
      ].join(";"),
    );
  }
  const total = totalMinutes(rows);
  lines.push("");
  lines.push(`TOTAL;;;;${formatStandard(total)};${toDecimal(total)}`);

  const csv = "\uFEFF" + lines.join("\n");
  const fileUri = `${FileSystem.cacheDirectory}DeciTrack_${employee.name.replace(/\s+/g, "_")}_${monthKey}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Exporter le récapitulatif (CSV)",
      UTI: "public.comma-separated-values-text",
    });
  }
}

export async function exportPDF(
  employee: Employee,
  monthKey: string,
  entries: Entry[],
): Promise<void> {
  const rows = buildRows(entries);
  const total = totalMinutes(rows);

  const bodyRows = rows
    .map(
      ({ entry, minutes }) => `
      <tr>
        <td>${formatFullDate(entry.date)}</td>
        <td class="c">${entry.start} – ${entry.end}</td>
        <td class="c">${formatStandard(minutes)}</td>
        <td class="c dec">${toDecimal(minutes)} h</td>
      </tr>`,
    )
    .join("");

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { font-family: -apple-system, Helvetica, Arial, sans-serif; }
        body { padding: 32px; color: #111; }
        h1 { font-size: 22px; margin: 0 0 4px; color: #E65100; letter-spacing: 1px; }
        .sub { font-size: 13px; color: #555; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; background: #111; color: #fff; padding: 10px; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        td.c { text-align: center; }
        td.dec { color: #E65100; font-weight: 700; }
        .total { margin-top: 20px; font-size: 16px; font-weight: 700; }
        .total .dec { color: #E65100; }
      </style>
    </head>
    <body>
      <h1>DeciTrack — Récapitulatif</h1>
      <div class="sub">${employee.name} · ${formatMonthLabel(monthKey)}</div>
      <table>
        <thead>
          <tr><th>Date</th><th style="text-align:center">Horaire</th><th style="text-align:center">Standard</th><th style="text-align:center">Décimal (admin)</th></tr>
        </thead>
        <tbody>${bodyRows || '<tr><td colspan="4">Aucune entrée</td></tr>'}</tbody>
      </table>
      <div class="total">Total du mois : ${formatStandard(total)} &nbsp;·&nbsp; <span class="dec">${toDecimal(total)} h</span></div>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Exporter le récapitulatif (PDF)",
      UTI: "com.adobe.pdf",
    });
  }
}
