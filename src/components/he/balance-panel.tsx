import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { YinYang } from "@/components/he/yin-yang";
import { listArchive, listTags, type MoodRow, type TagRow } from "@/lib/mood-api";
import { avg, monthWindows, series, weekWindows } from "@/lib/mood-stats";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function CompareCard({
  title,
  current,
  previous,
  currentLabel,
  previousLabel,
}: {
  title: string;
  current: number | null;
  previous: number | null;
  currentLabel: string;
  previousLabel: string;
}) {
  const delta = current != null && previous != null ? current - previous : null;
  const word =
    delta == null
      ? "Not enough days yet."
      : delta > 0.3
        ? "More yang than before — brighter, more outward."
        : delta < -0.3
          ? "More yin than before — quieter, more inward."
          : "Nearly even. The middle is holding.";

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">{title}</p>
          <p className="mt-2 font-display text-3xl tabular-nums text-ink">
            {current == null ? "—" : current.toFixed(1)}
          </p>
          <p className="text-xs text-muted">{currentLabel} average</p>
        </div>
        <YinYang score={current} size={64} />
      </div>
      <p className="text-sm leading-relaxed text-muted">
        {previousLabel}: {previous == null ? "—" : previous.toFixed(1)}
        {delta != null ? (
          <span className="ml-2 tabular-nums text-ink">
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}
          </span>
        ) : null}
      </p>
      <p className="text-sm leading-relaxed text-ink/80">{word}</p>
    </article>
  );
}

export function BalancePanel() {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [tagId, setTagId] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<MoodRow[]>([]);

  useEffect(() => {
    void listTags().then(setTags);
  }, []);

  useEffect(() => {
    void listArchive({ data: { tagId } }).then(setRows);
  }, [tagId]);

  const points = useMemo(() => rows.map((r) => ({ date: r.day, score: r.score })), [rows]);
  const week = weekWindows(points);
  const month = monthWindows(points);
  const chart = series(points, 14);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs tracking-[0.22em] text-muted uppercase">Balance · 阴阳</p>
        <h2 className="mt-1 font-display text-3xl text-ink">Compare the current with the last</h2>
        <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted">
          Filter by a name to read one thread, or all names together.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Hint label="Week and month averages across every name.">
          <button
            type="button"
            onClick={() => setTagId(undefined)}
            className={cn(
              "h-11 rounded-md border px-3 text-sm",
              tagId == null ? "border-ink bg-ink text-paper" : "border-line bg-surface",
            )}
          >
            All names
          </button>
        </Hint>
        {tags.map((t) => (
          <Hint key={t.id} label={`Balance for ${t.name} only.`}>
            <button
              type="button"
              onClick={() => setTagId(t.id)}
              className={cn(
                "h-11 rounded-md border px-3 text-sm",
                tagId === t.id ? "border-ink bg-ink text-paper" : "border-line bg-surface",
              )}
            >
              {t.name}
            </button>
          </Hint>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CompareCard
          title="Week"
          current={avg(week.current)}
          previous={avg(week.previous)}
          currentLabel={week.labels.current}
          previousLabel={week.labels.previous}
        />
        <CompareCard
          title="Month"
          current={avg(month.current)}
          previous={avg(month.previous)}
          currentLabel={month.labels.current}
          previousLabel={month.labels.previous}
        />
      </div>
      <section className="rounded-xl border border-line bg-surface p-5">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Fourteen days</p>
        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 10]} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                  fontSize: 13,
                }}
                formatter={(v) => [v ?? "—", "Score"]}
                labelFormatter={(_, pts) => (pts[0]?.payload?.date as string) ?? ""}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-jade)"
                fill="var(--color-jade)"
                fillOpacity={0.12}
                strokeWidth={2}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
