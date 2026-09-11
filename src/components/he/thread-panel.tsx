import { useEffect, useState } from "react";
import { format } from "date-fns";
import { bandFor, ELEMENTS } from "@/lib/philosophy";
import { listArchive, listTags, type MoodRow, type TagRow } from "@/lib/mood-api";
import { parseDate } from "@/lib/mood-stats";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThreadPanel() {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [tagId, setTagId] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<MoodRow[] | null>(null);

  useEffect(() => {
    void listTags().then(setTags);
  }, []);

  useEffect(() => {
    setRows(null);
    void listArchive({ data: { tagId } }).then(setRows);
  }, [tagId]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs tracking-[0.22em] text-muted uppercase">Thread · 连</p>
        <h2 className="mt-1 font-display text-3xl text-ink">Archive of all days</h2>
        <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted">
          Every reading stays. Together only shows today; this list is the long thread.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Hint label="Show every name’s archive, all days.">
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
          <Hint key={t.id} label={`Only ${t.name}’s stored days.`}>
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
      {!rows ? (
        <p className="text-sm text-muted">Gathering…</p>
      ) : !rows.length ? (
        <div className="rounded-xl border border-line bg-surface px-5 py-10 text-center">
          <p className="font-display text-2xl text-ink">连</p>
          <p className="mt-2 text-sm text-muted">No readings yet for this filter.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((e) => {
            const band = bandFor(e.score);
            const el = ELEMENTS.find((x) => x.id === e.element);
            return (
              <li key={e.id} className="rounded-lg border border-line bg-surface px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {e.tagName} · {format(parseDate(e.day), "EEE, MMM d")} ·{" "}
                      {format(new Date(e.loggedAt), "h:mm a")}
                    </p>
                    <p className="mt-1 font-han text-xl text-ink">
                      {band.han}
                      <span className="ml-2 font-sans text-sm text-muted">{band.en}</span>
                    </p>
                  </div>
                  <p className="font-display text-2xl tabular-nums text-jade">{e.score}</p>
                </div>
                {el || e.note ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {el ? (
                      <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                        <span className="font-han text-ink">{el.han}</span> {el.en}
                      </span>
                    ) : null}
                    {e.note ? <p className="text-sm leading-relaxed text-ink/80">{e.note}</p> : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
