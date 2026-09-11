import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { YinYang } from "@/components/he/yin-yang";

export const Route = createFileRoute("/")({ component: Landing });

const STEPS = [
  {
    han: "名",
    title: "Name tags",
    body: "Each person logs under a short name. Add yours once; it lives in the shared table.",
  },
  {
    han: "记",
    title: "Readings",
    body: "Score the moment from stillness (yin) to brightness (yang). The middle is 和. Optional five-phase tag and a short note.",
  },
  {
    han: "同",
    title: "Together",
    body: "A separate page compares every tagged name for today only, as readings land through the day.",
  },
  {
    han: "连",
    title: "Thread",
    body: "Every day is archived. Together never shows yesterday; Thread keeps the long record.",
  },
];

function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pb-20 pt-10 sm:px-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-han text-4xl leading-none text-ink">和</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Hé</h1>
          <p className="mt-2 max-w-prose text-pretty text-base leading-relaxed text-muted">
            A quiet mood journal. Not a clinic. Harmony, yin and yang, and oneness — 天人合一.
          </p>
        </div>
        <Hint label="Yin and yang as one. The mark turns with the reading.">
          <span className="inline-flex">
            <YinYang score={5} size={88} />
          </span>
        </Hint>
      </header>

      <ol className="mt-12 flex flex-col gap-4">
        {STEPS.map((s) => (
          <li key={s.title} className="rounded-xl border border-line bg-surface p-5">
            <p className="font-han text-xl text-ink">{s.han}</p>
            <h2 className="mt-1 font-display text-2xl text-ink">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-8 rounded-xl border border-line bg-surface p-5">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">The scale</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          1–2 静 stillness · 3–4 沉 depth · 5–6 和 harmony · 7–8 动 motion · 9–10 明 brightness.
          Hover any control once you enter — each feature has a short hint.
        </p>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/journal">Enter the journal</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/compare">View Together</Link>
        </Button>
      </div>
    </main>
  );
}
