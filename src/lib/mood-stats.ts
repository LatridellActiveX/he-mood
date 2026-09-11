import { format, parseISO, subDays, startOfWeek, startOfMonth, endOfMonth, addMonths } from "date-fns";

export type ScorePoint = { date: string; score: number };

export function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

export function avg(entries: ScorePoint[]) {
  if (!entries.length) return null;
  return entries.reduce((s, e) => s + e.score, 0) / entries.length;
}

function inRange(entries: ScorePoint[], from: string, to: string) {
  return entries.filter((e) => e.date >= from && e.date <= to);
}

export function weekWindows(entries: ScorePoint[], now = new Date()) {
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const lastStart = subDays(thisStart, 7);
  const lastEnd = subDays(thisStart, 1);
  return {
    current: inRange(entries, format(thisStart, "yyyy-MM-dd"), format(now, "yyyy-MM-dd")),
    previous: inRange(entries, format(lastStart, "yyyy-MM-dd"), format(lastEnd, "yyyy-MM-dd")),
    labels: { current: "This week", previous: "Last week" },
  };
}

export function monthWindows(entries: ScorePoint[], now = new Date()) {
  const thisStart = startOfMonth(now);
  const prevStart = startOfMonth(addMonths(now, -1));
  const prevEnd = endOfMonth(prevStart);
  return {
    current: inRange(entries, format(thisStart, "yyyy-MM-dd"), format(now, "yyyy-MM-dd")),
    previous: inRange(entries, format(prevStart, "yyyy-MM-dd"), format(prevEnd, "yyyy-MM-dd")),
    labels: { current: "This month", previous: "Last month" },
  };
}

export function series(entries: ScorePoint[], days = 14, now = new Date()) {
  const byDay = new Map<string, number[]>();
  for (const e of entries) {
    const list = byDay.get(e.date) ?? [];
    list.push(e.score);
    byDay.set(e.date, list);
  }
  const out: { date: string; label: string; score: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(now, i);
    const iso = format(d, "yyyy-MM-dd");
    const list = byDay.get(iso);
    const mean = list?.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
    out.push({ date: iso, label: format(d, "d"), score: mean });
  }
  return out;
}

export function parseDate(iso: string) {
  return parseISO(iso);
}

export function minutesOfDay(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}
