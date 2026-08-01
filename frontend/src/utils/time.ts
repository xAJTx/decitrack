// Work-hours time math and formatting utilities.

export type Break = { start: string; end: string };

export type Entry = {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  breaks: Break[];
  note?: string;
  createdAt: string;
};

// Parse "HH:MM" -> minutes since midnight. Returns null when invalid/empty.
export function parseTime(value?: string): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

// Total break minutes for a list of break pairs.
export function breakMinutes(breaks: Break[]): number {
  let total = 0;
  for (const b of breaks) {
    const s = parseTime(b.start);
    const e = parseTime(b.end);
    if (s === null || e === null) continue;
    if (e > s) total += e - s;
  }
  return total;
}

// Net worked minutes for an entry. Returns 0 when start/end incomplete/invalid.
export function workedMinutes(entry: {
  start: string;
  end: string;
  breaks: Break[];
}): number {
  const s = parseTime(entry.start);
  const e = parseTime(entry.end);
  if (s === null || e === null) return 0;
  if (e <= s) return 0;
  const gross = e - s;
  const net = gross - breakMinutes(entry.breaks);
  return net > 0 ? net : 0;
}

// "10 h 30" style standard display.
export function formatStandard(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

// Compact "10h30" style.
export function formatCompact(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

// Administrative decimal hours, 2 decimals. 30min -> "10.50".
export function toDecimal(minutes: number): string {
  return (minutes / 60).toFixed(2);
}

// Validate an entry's fields; returns an error string or null.
export function validateEntry(entry: {
  start: string;
  end: string;
  breaks: Break[];
}): string | null {
  const s = parseTime(entry.start);
  const e = parseTime(entry.end);
  if (s === null) return "Heure de début invalide";
  if (e === null) return "Heure de fin invalide";
  if (e <= s) return "L'heure de fin doit être après le début";
  for (const b of entry.breaks) {
    const bs = parseTime(b.start);
    const be = parseTime(b.end);
    if (b.start || b.end) {
      if (bs === null || be === null) return "Pause invalide";
      if (be <= bs) return "Fin de pause avant le début";
      if (bs < s || be > e) return "Pause hors des heures de travail";
    }
  }
  return null;
}
