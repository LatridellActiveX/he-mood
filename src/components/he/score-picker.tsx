import { bandFor } from "@/lib/philosophy";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (n: number) => void;
};

export function ScorePicker({ value, onChange }: Props) {
  const band = bandFor(value);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <Hint label={`${band.en} — the quality of this reading on the yin–yang path.`}>
          <p className="font-display text-4xl leading-none text-ink">{band.han}</p>
        </Hint>
        <div className="text-right">
          <p className="text-sm tracking-wide text-muted uppercase">{band.en}</p>
          <p className="font-display text-3xl tabular-nums leading-none text-jade">{value}</p>
        </div>
      </div>
      <p className="text-sm text-muted">From stillness (yin) to brightness (yang). The middle is 和.</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = n === value;
          const b = bandFor(n);
          return (
            <Hint key={n} label={`${n} · ${b.han} ${b.en}`}>
              <button
                type="button"
                onClick={() => onChange(n)}
                aria-label={`Score ${n}, ${b.en}`}
                aria-pressed={active}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-sm text-sm tabular-nums transition-[background-color,color,transform] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  active ? "bg-ink text-paper" : "border border-line bg-surface text-ink hover:bg-ink/8",
                )}
              >
                {n}
              </button>
            </Hint>
          );
        })}
      </div>
    </div>
  );
}
