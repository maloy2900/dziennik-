import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComputedTrade } from "@/lib/journal/types";
import { equityPoints } from "@/lib/journal/calc";
import { formatDatePl, formatRr, formatUsd } from "@/lib/journal/format";

type Props = {
  trades: ComputedTrade[];
  startingCapital: number;
};

type TipPayload = {
  nr: number;
  label: string;
  balance: number;
  rr: number;
  date: string;
};

function EquityTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TipPayload }>;
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  if (p.nr === 0) {
    return (
      <div className="rounded-md border border-border bg-elevated px-3 py-2 text-xs shadow-panel">
        <div className="text-muted">Kapitał początkowy</div>
        <div className="mt-1 font-mono tabular text-fg">{formatUsd(p.balance)}</div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-border bg-elevated px-3 py-2 text-xs shadow-panel">
      <div className="text-muted">
        #{p.nr}
        {p.date ? ` · ${formatDatePl(p.date)}` : ""}
      </div>
      <div className="mt-1 font-mono tabular text-fg">{formatUsd(p.balance)}</div>
      <div className="text-muted">RR {formatRr(p.rr)}</div>
    </div>
  );
}

function RrTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ComputedTrade }>;
}) {
  if (!active || !payload?.[0]) return null;
  const t = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-elevated px-3 py-2 text-xs shadow-panel">
      <div className="text-muted">
        #{t.nr} · {t.pair}
      </div>
      <div className="mt-1 font-mono tabular text-fg">RR {formatRr(t.rr)}</div>
    </div>
  );
}

export function EquityChart({ trades, startingCapital }: Props) {
  const points = equityPoints(trades, startingCapital);
  const withRr = trades.filter((t) => t.rr !== null);
  const last = points[points.length - 1]?.balance ?? startingCapital;
  const up = last >= startingCapital;

  if (withRr.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center text-sm text-muted">
        Wpisz RR przy transakcji, a tu pojawi się krzywa kapitału.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-3">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium tracking-tight">Krzywa kapitału</h2>
            <p className="text-xs text-muted">Stan konta po każdej transakcji</p>
          </div>
          <div className={`font-mono text-sm tabular ${up ? "text-win" : "text-loss"}`}>
            {formatUsd(last)}
          </div>
        </div>
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={up ? "var(--color-win)" : "var(--color-loss)"}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={up ? "var(--color-win)" : "var(--color-loss)"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(v: number) =>
                  new Intl.NumberFormat("pl-PL", { notation: "compact" }).format(v)
                }
                domain={["auto", "auto"]}
              />
              <Tooltip content={<EquityTip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={up ? "var(--color-win)" : "var(--color-loss)"}
                strokeWidth={2}
                fill="url(#eqFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-2">
        <div className="mb-3">
          <h2 className="text-sm font-medium tracking-tight">RR na transakcję</h2>
          <p className="text-xs text-muted">Zielony plus, czerwony minus</p>
        </div>
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={withRr} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="nr"
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip content={<RrTip />} />
              <Bar dataKey="rr" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {withRr.map((t) => (
                  <Cell
                    key={t.id}
                    fill={
                      (t.rr ?? 0) > 0
                        ? "var(--color-win)"
                        : (t.rr ?? 0) < 0
                          ? "var(--color-loss)"
                          : "var(--color-be)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
