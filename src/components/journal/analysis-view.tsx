import { Card } from "@/components/ui/card";
import { groupStats } from "@/lib/journal/calc";
import { formatPct, formatRr, formatUsd } from "@/lib/journal/format";
import type { ComputedTrade, GroupStats } from "@/lib/journal/types";

type Props = { rows: ComputedTrade[] };

function Table({ title, data }: { title: string; data: GroupStats[] }) {
  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-2 text-sm text-muted">Za mało danych.</p>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-2 font-medium">Grupa</th>
              <th className="px-3 py-2 font-medium">N</th>
              <th className="px-3 py-2 font-medium">WR</th>
              <th className="px-3 py-2 font-medium">Śr. RR</th>
              <th className="px-3 py-2 font-medium">Suma R</th>
              <th className="px-5 py-2 font-medium">PnL</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.key} className="border-t border-border">
                <td className="px-5 py-2.5 font-medium">{row.key}</td>
                <td className="px-3 py-2.5 font-mono tabular text-muted">{row.trades}</td>
                <td className="px-3 py-2.5 font-mono tabular">{formatPct(row.winrate)}</td>
                <td
                  className={`px-3 py-2.5 font-mono tabular ${
                    (row.avgRr ?? 0) >= 0 ? "text-win" : "text-loss"
                  }`}
                >
                  {row.avgRr === null ? "—" : formatRr(row.avgRr)}
                </td>
                <td className="px-3 py-2.5 font-mono tabular">{formatRr(row.totalR)}</td>
                <td
                  className={`px-5 py-2.5 font-mono tabular ${
                    row.pnl >= 0 ? "text-win" : "text-loss"
                  }`}
                >
                  {formatUsd(row.pnl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AnalysisView({ rows }: Props) {
  const byPair = groupStats(rows, (t) => t.pair || "—");
  const bySession = groupStats(rows, (t) => t.session || "bez sesji");
  const byPos = groupStats(rows, (t) => (t.position === "long" ? "LONG" : "SHORT"));
  const byTactic = groupStats(rows, (t) => t.tactic || "bez taktyki");
  const byMgmt = groupStats(rows, (t) =>
    t.management ? "Zarządzanie OK" : "Zarządzanie słabe",
  );
  const byConfluence = groupStats(rows, (t) =>
    t.htf && t.mtf && t.ltf && t.m1 ? "Pełny checklist TF" : "Niepełny TF",
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Table title="Taktyki" data={byTactic} />
      <Table title="Pary" data={byPair} />
      <Table title="Sesje" data={bySession} />
      <Table title="Kierunek" data={byPos} />
      <Table title="Zarządzanie pozycją" data={byMgmt} />
      <Table title="Confluence timeframe" data={byConfluence} />
    </div>
  );
}
