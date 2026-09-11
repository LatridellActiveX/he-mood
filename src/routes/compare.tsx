import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/he/app-shell";
import { YinYang } from "@/components/he/yin-yang";
import { bandFor } from "@/lib/philosophy";
import { listMoodsForDay, type MoodRow } from "@/lib/mood-api";
import { avg, minutesOfDay, todayIso } from "@/lib/mood-stats";
import { Hint } from "@/components/ui/tooltip";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const day = todayIso();
  const [rows, setRows] = useState<MoodRow[] | null>(null);

  useEffect(() => {
    void listMoodsForDay({ data: { day } }).then(setRows);
    const id = window.setInterval(() => {
      void listMoodsForDay({ data: { day } }).then(setRows);
    }, 20000);
    return () => window.clearInterval(id);
  }, [day]);

  const byTag = useMemo(() => {
    const map = new Map<string, MoodRow[]>();
    for (const r of rows ?? []) {
      const list = map.get(r.tagName) ?? [];
      list.push(r);
      map.set(r.tagName, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const nowPct = (minutesOfDay(new Date().toISOString()) / (24 * 60)) * 100;

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-xs tracking-[0.22em] text-muted uppercase">Together · 同</p>
        <h2 className="mt-1 font-display text-3xl text-ink">Today, side by side</h2>
        <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted">
          {format(new Date(), "EEEE, MMMM d")}. Readings as they land through the day. Older days stay in
          Thread — they are not shown here.
        </p>
      </header>

      {rows == null ? (
        <p className="text-sm text-muted">Gathering…</p>
      ) : !byTag.length ? (
        <div className="rounded-xl border border-line bg-surface px-5 py-10 text-center">
          <p className="font-han text-2xl text-ink">同</p>
          <p className="mt-2 text-sm text-muted">No names have logged yet today. Add a tag on Journal, then keep a reading.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {byTag.map(([name, logs]) => {
            const latest = logs[logs.length - 1]!;
            const mean = avg(logs.map((l) => ({ date: l.day, score: l.score })));
            return (
              <article key={name} className="rounded-xl border border-line bg-surface p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl text-ink">{name}</p>
                    <p className="text-xs text-muted">
                      {logs.length} reading{logs.length === 1 ? "" : "s"} · avg{" "}
                      <span className="tabular-nums text-ink">{mean?.toFixed(1)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-right">
                      <span className="font-han text-xl text-ink">{bandFor(latest.score).han}</span>
                      <span className="ml-2 font-display text-2xl tabular-nums text-jade">{latest.score}</span>
                    </p>
                    <Hint label="Latest reading for this name today.">
                      <span className="inline-flex">
                        <YinYang score={mean} size={48} />
                      </span>
                    </Hint>
                  </div>
                </div>
                <div className="relative h-12 rounded-md bg-ink/6">
                  <Hint label="Now — the day is still moving.">
                    <div
                      className="absolute top-0 h-full w-px bg-jade/50"
                      style={{ left: `${nowPct}%` }}
                    />
                  </Hint>
                  {logs.map((l) => {
                    const pct = (minutesOfDay(l.loggedAt) / (24 * 60)) * 100;
                    const time = format(new Date(l.loggedAt), "h:mm a");
                    return (
                      <Hint
                        key={l.id}
                        label={`${l.tagName}: ${l.score} at ${time}${l.note ? ` — ${l.note}` : ""}`}
                      >
                        <button
                          type="button"
                          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink p-0"
                          style={{ left: `${pct}%` }}
                          aria-label={`${l.score} at ${time}`}
                        />
                      </Hint>
                    );
                  })}
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-muted">
                  <span>12a</span>
                  <span>6a</span>
                  <span>12p</span>
                  <span>6p</span>
                  <span>12a</span>
                </div>
                <ol className="mt-4 flex flex-col gap-2">
                  {logs.map((l) => (
                    <li key={l.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="tabular-nums text-muted">{format(new Date(l.loggedAt), "h:mm a")}</span>
                      <span className="font-han text-ink">{bandFor(l.score).han}</span>
                      <span className="tabular-nums text-jade">{l.score}</span>
                      <span className="min-w-0 flex-1 truncate text-ink/80">{l.note}</span>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
