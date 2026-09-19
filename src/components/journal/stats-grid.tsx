import { Card } from "@/components/ui/card";
import type { JournalStats } from "@/lib/journal/types";
import { formatMoney, formatPct, formatRr, formatUsd } from "@/lib/journal/format";

type Props = { stats: JournalStats };

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "win" | "loss" | "muted";
}) {
  const color =
    tone === "win" ? "text-win" : tone === "loss" ? "text-loss" : "text-fg";
  return (
    <Card className="rounded-lg p-4">
      <div className="text-xs font-medium tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-mono text-xl tabular tracking-tight ${color}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-subtle">{hint}</div> : null}
    </Card>
  );
}

export function StatsGrid({ stats }: Props) {
  const pnlTone = stats.pnl > 0 ? "win" : stats.pnl < 0 ? "loss" : "muted";
  const wrTone =
    stats.winrate === null ? "muted" : stats.winrate >= 0.5 ? "win" : "loss";
  const pf =
    stats.profitFactor === null
      ? "—"
      : Number.isFinite(stats.profitFactor)
        ? formatMoney(stats.profitFactor, 2)
        : "∞";
  const streak =
    stats.currentStreak.length === 0 || !stats.currentStreak.type
      ? "—"
      : `${stats.currentStreak.length}× ${
          stats.currentStreak.type === "win" ? "W" : "L"
        }`;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Stat
        label="Stan konta"
        value={formatUsd(stats.currentBalance)}
        hint={
          stats.pnlPct === null
            ? undefined
            : `${stats.pnl >= 0 ? "+" : ""}${formatUsd(stats.pnl)} · ${formatPct(stats.pnlPct)}`
        }
        tone={pnlTone}
      />
      <Stat
        label="Winrate"
        value={formatPct(stats.winrate)}
        hint={`${stats.wins}W / ${stats.losses}L · ${stats.be} BE`}
        tone={wrTone}
      />
      <Stat
        label="Średnie RR"
        value={stats.avgRr === null ? "—" : formatRr(stats.avgRr)}
        hint={`Suma R: ${stats.totalR === 0 ? "0" : formatRr(stats.totalR)}`}
        tone={stats.avgRr !== null && stats.avgRr >= 0 ? "win" : "loss"}
      />
      <Stat
        label="Expectancy"
        value={stats.expectancyR === null ? "—" : `${formatRr(stats.expectancyR)} R`}
        hint={`PF ${pf}`}
      />
      <Stat
        label="Max drawdown"
        value={formatUsd(stats.maxDrawdown)}
        hint={stats.maxDrawdownPct === null ? undefined : formatPct(stats.maxDrawdownPct)}
        tone={stats.maxDrawdown > 0 ? "loss" : "muted"}
      />
      <Stat
        label="1R teraz"
        value={formatUsd(stats.currentRisk)}
        hint={`Seria: ${streak} · ${stats.tradeCount} trans.`}
      />
    </div>
  );
}
