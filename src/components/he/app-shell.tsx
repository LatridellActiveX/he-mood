import { Link, useRouterState } from "@tanstack/react-router";
import { YinYang } from "@/components/he/yin-yang";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  score?: number | null;
};

export function AppShell({ children, score }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const journal = pathname === "/journal";
  const together = pathname === "/compare";

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pb-16 pt-8 sm:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <Hint label="Return to the landing page — what Hé is and how to use it.">
          <Link to="/" className="min-w-0 no-underline">
            <p className="font-han text-3xl leading-none text-ink">和</p>
            <h1 className="mt-1 font-display text-xl text-ink">Hé</h1>
            <p className="mt-1 text-sm text-muted">Harmony · oneness · a reading of the day</p>
          </Link>
        </Hint>
        <Hint label="Yin and yang as one circle. It turns with the latest reading.">
          <span className="inline-flex">
            <YinYang score={score ?? null} size={72} />
          </span>
        </Hint>
      </header>
      <div className="mb-8 flex gap-2">
        <Hint label="Your journal: log today, read the archive, compare weeks.">
          <Link
            to="/journal"
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-md text-sm no-underline",
              journal ? "bg-ink text-paper" : "bg-ink/6 text-ink",
            )}
          >
            Journal
          </Link>
        </Hint>
        <Hint label="Today only. Side-by-side readings for every name tag, through the day.">
          <Link
            to="/compare"
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-md text-sm no-underline",
              together ? "bg-ink text-paper" : "bg-ink/6 text-ink",
            )}
          >
            Together
          </Link>
        </Hint>
      </div>
      {children}
    </main>
  );
}
