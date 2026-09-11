import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScorePicker } from "@/components/he/score-picker";
import { YinYang } from "@/components/he/yin-yang";
import { Hint } from "@/components/ui/tooltip";
import { ELEMENTS, quoteForDay, type ElementId } from "@/lib/philosophy";
import { createTag, listTags, logMood, type TagRow } from "@/lib/mood-api";
import { todayIso } from "@/lib/mood-stats";
import { cn } from "@/lib/utils";

const TAG_KEY = "he-active-tag-id";

export function TodayPanel({ onLogged }: { onLogged?: (score: number) => void }) {
  const today = todayIso();
  const [tags, setTags] = useState<TagRow[]>([]);
  const [tagId, setTagId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [score, setScore] = useState(5);
  const [element, setElement] = useState<ElementId | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void listTags().then((rows) => {
      setTags(rows);
      const stored = Number(localStorage.getItem(TAG_KEY) || 0);
      const found = rows.find((t) => t.id === stored);
      setTagId(found?.id ?? rows[0]?.id ?? null);
    });
  }, []);

  const quote = useMemo(() => quoteForDay(today), [today]);
  const active = tags.find((t) => t.id === tagId);

  async function addTag() {
    setError(null);
    setBusy(true);
    try {
      const tag = await createTag({ data: { name: newName } });
      setTags((prev) => {
        if (prev.some((t) => t.id === tag.id)) return prev;
        return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
      });
      setTagId(tag.id);
      localStorage.setItem(TAG_KEY, String(tag.id));
      setNewName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add name");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!tagId) {
      setError("Add a name tag first.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await logMood({
        data: { tagId, day: today, score, element: element ?? null, note },
      });
      localStorage.setItem(TAG_KEY, String(tagId));
      setNote("");
      setSaved(true);
      onLogged?.(score);
      window.setTimeout(() => setSaved(false), 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Today</p>
          <h2 className="mt-1 font-display text-3xl text-ink text-balance">{format(new Date(), "EEEE, MMM d")}</h2>
          <p className="mt-3 max-w-prose text-pretty text-sm leading-relaxed text-muted">
            <span className="font-han text-ink">{quote.han}</span>
            <span className="mx-2 text-line">·</span>
            {quote.en}
          </p>
        </div>
        <Hint label="This mark turns as yin (still) or yang (bright) from the score you choose.">
          <span className="inline-flex">
            <YinYang score={score} size={88} />
          </span>
        </Hint>
      </header>

      <fieldset>
        <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">Name tag</legend>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Hint key={t.id} label={`Log as ${t.name}. Readings under this name appear on Together today.`}>
              <button
                type="button"
                onClick={() => {
                  setTagId(t.id);
                  localStorage.setItem(TAG_KEY, String(t.id));
                }}
                aria-pressed={t.id === tagId}
                className={cn(
                  "h-11 rounded-md border px-3 text-sm",
                  t.id === tagId ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink",
                )}
              >
                {t.name}
              </button>
            </Hint>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Hint label="A short public name, not an email. Shared with anyone who has the app.">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add a name"
              maxLength={24}
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade/40"
            />
          </Hint>
          <Hint label="Save this name to the shared tag table.">
            <Button type="button" variant="outline" onClick={() => void addTag()} disabled={busy || !newName.trim()}>
              Tag
            </Button>
          </Hint>
        </div>
        <p className="mt-2 text-xs text-muted">
          Logging as {active ? active.name : "—"}. Each reading is kept. Together shows only today.
        </p>
      </fieldset>

      <ScorePicker value={score} onChange={setScore} />

      <fieldset>
        <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">Five phases · 五行</legend>
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => {
            const on = element === el.id;
            return (
              <Hint key={el.id} label={`${el.han} ${el.en} — ${el.hint}. Optional. Names the quality, not a diagnosis.`}>
                <button
                  type="button"
                  onClick={() => setElement(on ? null : el.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex h-11 min-w-11 items-center gap-2 rounded-md border px-3 text-sm",
                    on ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink hover:border-ink/40",
                  )}
                >
                  <span className="font-han">{el.han}</span>
                  <span className="hidden sm:inline">{el.en}</span>
                </button>
              </Hint>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-xs tracking-[0.18em] text-muted uppercase">Note</span>
        <Hint label="Optional. Short words only. This board is shared.">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="What moved. What stayed still."
            className="min-h-24 w-full resize-y rounded-lg border border-line bg-surface px-4 py-3 text-base leading-relaxed text-ink placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade/40"
          />
        </Hint>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Hint label="Writes this reading to the archive. Together will show it until midnight.">
          <Button type="button" onClick={() => void save()} disabled={busy} className="w-full sm:w-auto">
            Keep this reading
          </Button>
        </Hint>
        <p className="text-sm text-muted" aria-live="polite">
          {error ?? (saved ? "Held." : "You can log more than once today.")}
        </p>
      </div>
    </div>
  );
}
