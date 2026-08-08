import jsPDF from 'jspdf';
import { Entry, formatStandard, toDecimal, workedMinutes } from '@/utils/time';
import { formatFullDate, formatMonthLabel } from '@/utils/dates';
import { Employee } from './AppStore';

type Row = { entry: Entry; minutes: number };

function buildRows(entries: Entry[]): Row[] {
  return entries.map((entry) => ({ entry, minutes: workedMinutes(entry) }));
}

function totalMinutes(rows: Row[]): number {
  return rows.reduce((sum, r) => sum + r.minutes, 0);
}

function safeName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_') || 'employe';
}

export async function exportCSV(
  employee: Employee,
  monthKey: string,
  entries: Entry[],
  getCompanyName: (id?: string) => string = () => ''
): Promise<void> {
  const rows = buildRows(entries);
  const lines = [
    `Employe;${employee.name}`,
    `Mois;${formatMonthLabel(monthKey)}`,
    '',
    'Date;Entreprise;Debut;Fin;Pause (min);Heures (standard);Heures (decimal)',
  ];

  for (const { entry, minutes } of rows) {
    const breakMin = entry.breaks.reduce((s, b) => {
      const bs = b.start.split(':');
      const be = b.end.split(':');
      if (bs.length === 2 && be.length === 2) {
        const dm = Number(be[0]) * 60 + Number(be[1]) - (Number(bs[0]) * 60 + Number(bs[1]));
        return s + (dm > 0 ? dm : 0);
      }
      return s;
    }, 0);

    lines.push(
      [
        entry.date,
        getCompanyName(entry.companyId),
        entry.start,
        entry.end,
        String(breakMin),
        formatStandard(minutes),
        toDecimal(minutes),
      ].join(';')
    );
  }

  const total = totalMinutes(rows);
  lines.push('');
  lines.push(`TOTAL;;;;;${formatStandard(total)};${toDecimal(total)}`);

  const csv = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `DeciTrack_${safeName(employee.name)}_${monthKey}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function exportPDF(
  employee: Employee,
  monthKey: string,
  entries: Entry[],
  getCompanyName: (id?: string) => string = () => ''
): Promise<void> {
  const rows = buildRows(entries);
  const total = totalMinutes(rows);

  const bodyRows = rows
    .map(
      ({ entry, minutes }) => `
      <tr>
        <td>${formatFullDate(entry.date)}</td>
        <td>${getCompanyName(entry.companyId) || '&ndash;'}</td>
        <td class="c">${entry.start} &ndash; ${entry.end}</td>
        <td class="c">${formatStandard(minutes)}</td>
        <td class="c dec">${toDecimal(minutes)} h</td>
      </tr>`
    )
    .join('');

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
      <h1>DeciTrack &mdash; Recapitulatif</h1>
      <div class="sub">${employee.name} &middot; ${formatMonthLabel(monthKey)}</div>
      <table>
        <thead>
          <tr><th>Date</th><th>Entreprise</th><th style="text-align:center">Horaire</th><th style="text-align:center">Standard</th><th style="text-align:center">Decimal (admin)</th></tr>
        </thead>
        <tbody>${bodyRows || '<tr><td colspan="5">Aucune entree</td></tr>'}</tbody>
      </table>
      <div class="total">Total du mois : ${formatStandard(total)} &nbsp;&middot;&nbsp; <span class="dec">${toDecimal(total)} h</span></div>
    </body>
  </html>`;

  const doc = new jsPDF();
  doc.html(html, {
    callback: (instance) => {
      instance.save(`DeciTrack_${safeName(employee.name)}_${monthKey}.pdf`);
    },
    margin: 10,
    autoPaging: 'text',
  });
}
