import type {
  ComputedTrade,
  GroupStats,
  JournalStats,
  Outcome,
  Settings,
  Trade,
} from "./types";

export function outcomeFromRr(rr: number): Outcome {
  if (rr > 0) return "win";
  if (rr < 0) return "loss";
  return "be";
}

export function resolveOutcome(trade: Trade): Outcome | null {
  if (trade.outcomeOverride) return trade.outcomeOverride;
  if (trade.rr === null || Number.isNaN(trade.rr)) return null;
  return outcomeFromRr(trade.rr);
}

export function sortTrades(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.id.localeCompare(b.id);
  });
}

export function computeTrades(trades: Trade[], settings: Settings): ComputedTrade[] {
  const sorted = sortTrades(trades);
  let balance = settings.startingCapital;
  const fixedRisk = settings.startingCapital * (settings.riskPercent / 100);

  return sorted.map((trade, index) => {
    const riskAmount =
      settings.riskMode === "compound"
        ? balance * (settings.riskPercent / 100)
        : fixedRisk;
    const outcome = resolveOutcome(trade);
    const hasRr = trade.rr !== null && !Number.isNaN(trade.rr);
    const pnl = hasRr ? riskAmount * (trade.rr as number) : null;
    if (pnl !== null) balance += pnl;
    return {
      ...trade,
      nr: index + 1,
      outcome,
      pnl,
      balance,
      riskAmount,
    };
  });
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function computeStats(computed: ComputedTrade[], settings: Settings): JournalStats {
  const withRr = computed.filter((t) => t.rr !== null);
  const wins = withRr.filter((t) => t.outcome === "win");
  const losses = withRr.filter((t) => t.outcome === "loss");
  const be = withRr.filter((t) => t.outcome === "be");
  const decided = wins.length + losses.length;
  const rrValues = withRr.map((t) => t.rr as number);
  const winR = wins.map((t) => t.rr as number);
  const lossR = losses.map((t) => t.rr as number);
  const totalR = rrValues.reduce((s, v) => s + v, 0);
  const grossWinR = winR.reduce((s, v) => s + v, 0);
  const grossLossR = Math.abs(lossR.reduce((s, v) => s + v, 0));
  const profitFactor =
    decided === 0 ? null : grossLossR === 0 ? (grossWinR > 0 ? Number.POSITIVE_INFINITY : null) : grossWinR / grossLossR;

  const currentBalance =
    computed.length > 0 ? computed[computed.length - 1].balance : settings.startingCapital;
  const pnl = currentBalance - settings.startingCapital;
  const pnlPct = settings.startingCapital !== 0 ? pnl / settings.startingCapital : null;

  let peak = settings.startingCapital;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  for (const row of computed) {
    if (row.balance > peak) peak = row.balance;
    const dd = peak - row.balance;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownPct = peak !== 0 ? dd / peak : 0;
    }
  }

  let currentStreak: JournalStats["currentStreak"] = { type: null, length: 0 };
  for (let i = computed.length - 1; i >= 0; i--) {
    const o = computed[i].outcome;
    if (!o || o === "be") {
      if (currentStreak.length > 0) break;
      continue;
    }
    if (currentStreak.type === null) {
      currentStreak = { type: o, length: 1 };
    } else if (currentStreak.type === o) {
      currentStreak.length += 1;
    } else {
      break;
    }
  }

  const last = computed[computed.length - 1];
  const currentRisk = last
    ? last.riskAmount
    : settings.startingCapital * (settings.riskPercent / 100);

  const winrate = decided === 0 ? null : wins.length / decided;
  const avgWinR = avg(winR);
  const avgLossR = avg(lossR);
  const expectancyR =
    winrate === null || avgWinR === null
      ? avg(rrValues)
      : winrate * avgWinR + (1 - winrate) * (avgLossR ?? 0);

  return {
    tradeCount: withRr.length,
    decided,
    wins: wins.length,
    losses: losses.length,
    be: be.length,
    winrate,
    avgRr: avg(rrValues),
    totalR,
    expectancyR,
    profitFactor,
    currentBalance,
    pnl,
    pnlPct,
    maxDrawdown,
    maxDrawdownPct: computed.length ? maxDrawdownPct : null,
    currentStreak,
    avgWinR,
    avgLossR,
    currentRisk,
  };
}

export function groupStats(
  computed: ComputedTrade[],
  keyFn: (t: ComputedTrade) => string,
): GroupStats[] {
  const map = new Map<string, ComputedTrade[]>();
  for (const t of computed) {
    if (t.rr === null) continue;
    const key = keyFn(t) || "—";
    const list = map.get(key);
    if (list) list.push(t);
    else map.set(key, [t]);
  }
  const rows: GroupStats[] = [];
  for (const [key, list] of map) {
    const wins = list.filter((t) => t.outcome === "win").length;
    const losses = list.filter((t) => t.outcome === "loss").length;
    const be = list.filter((t) => t.outcome === "be").length;
    const decided = wins + losses;
    const rrValues = list.map((t) => t.rr as number);
    rows.push({
      key,
      trades: list.length,
      wins,
      losses,
      be,
      winrate: decided === 0 ? null : wins / decided,
      avgRr: avg(rrValues),
      totalR: rrValues.reduce((s, v) => s + v, 0),
      pnl: list.reduce((s, t) => s + (t.pnl ?? 0), 0),
    });
  }
  return rows.sort((a, b) => b.trades - a.trades);
}

export function equityPoints(computed: ComputedTrade[], startingCapital: number) {
  const points = [{ nr: 0, label: "Start", balance: startingCapital, rr: 0, date: "" }];
  for (const t of computed) {
    if (t.rr === null) continue;
    points.push({
      nr: t.nr,
      label: `#${t.nr}`,
      balance: t.balance,
      rr: t.rr,
      date: t.date,
    });
  }
  return points;
}
