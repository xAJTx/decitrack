import { File, Paths } from "expo-file-system";
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

function safeName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "_") || "employe";
}

async function shareUri(
  uri: string,
  mimeType: string,
  uti: string,
  title: string,
): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error("Le partage n'est pas disponible sur cet appareil");
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: uti });
}

export async function exportCSV(
  employee: Employee,
  monthKey: string,
  entries: Entry[],
): Promise<void> {
  const rows = buildRows(entries);
  const lines = [
    `Employe;${employee.name}`,
    `Mois;${formatMonthLabel(monthKey)}`,
    "",
    "Date;Debut;Fin;Pause (min);Heures (standard);Heures (decimal)",
  ];
  for (const { entry, minutes } of rows) {
    const breakMin = entry.breaks.reduce((s, b) => {
      const bs = b.start.split(":");
      const be = b.end.split(":");
      if (bs.length === 2 && be.length === 2) {
        const dm =
          Number(be[0]) * 60 +
          Number(be[1]) -
          (Number(bs[0]) * 60 + Number(bs[1]));
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

  // Stable SDK 54 File API (avoids the deprecated /legacy module that
  // failed to write on some Android devices).
  const file = new File(Paths.cache, `DeciTrack_${safeName(employee.name)}_${monthKey}.csv`);
  try {
    if (file.exists) file.delete();
  } catch {
    // ignore stale-file cleanup errors
  }
  file.create();
  file.write(csv);

  await shareUri(
    file.uri,
    "text/csv",
    "public.comma-separated-values-text",
    "Exporter le recapitulatif (CSV)",
  );
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
        <td class="c">${entry.start} &ndash; ${entry.end}</td>
        <td class="c">${formatStandard(minutes)}</td>
        <td class="c dec">${toDecimal(minutes)} h</td>
      </tr>`,
    )
    .join("");

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      <h1>DeciTrack &mdash; Recapitulatif</h1>
      <div class="sub">${employee.name} &middot; ${formatMonthLabel(monthKey)}</div>
      <table>
        <thead>
          <tr><th>Date</th><th style="text-align:center">Horaire</th><th style="text-align:center">Standard</th><th style="text-align:center">Decimal (admin)</th></tr>
        </thead>
        <tbody>${bodyRows || '<tr><td colspan="4">Aucune entree</td></tr>'}</tbody>
      </table>
      <div class="total">Total du mois : ${formatStandard(total)} &nbsp;&middot;&nbsp; <span class="dec">${toDecimal(total)} h</span></div>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await shareUri(
    uri,
    "application/pdf",
    "com.adobe.pdf",
    "Exporter le recapitulatif (PDF)",
  );
}
