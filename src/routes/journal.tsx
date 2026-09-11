import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/he/app-shell";
import { BalancePanel } from "@/components/he/balance-panel";
import { ThreadPanel } from "@/components/he/thread-panel";
import { TodayPanel } from "@/components/he/today-panel";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({ component: Journal });

type Tab = "today" | "thread" | "balance";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "today", label: "Today", hint: "Log a reading for this moment. You can keep more than one today." },
  { id: "thread", label: "Thread", hint: "Archive of every day and every name. Together does not show these." },
  { id: "balance", label: "Balance", hint: "This week and month against the last, by name or all together." },
];

function Journal() {
  const [tab, setTab] = useState<Tab>("today");
  const [lastScore, setLastScore] = useState<number | null>(null);

  return (
    <AppShell score={lastScore}>
      <nav className="mb-8 grid grid-cols-3 gap-1 rounded-lg bg-ink/6 p-1" aria-label="Journal views">
        {TABS.map((item) => (
          <Hint key={item.id} label={item.hint}>
            <button
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "h-11 w-full rounded-md text-sm transition-[background-color,color] duration-[var(--motion-quick)]",
                tab === item.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          </Hint>
        ))}
      </nav>
      {tab === "today" ? (
        <TodayPanel onLogged={setLastScore} />
      ) : tab === "thread" ? (
        <ThreadPanel />
      ) : (
        <BalancePanel />
      )}
    </AppShell>
  );
}
