export type Position = "long" | "short";
export type Outcome = "win" | "loss" | "be";
export type RiskMode = "compound" | "fixed";

export type Trade = {
  id: string;
  date: string;
  session: string;
  position: Position;
  rr: number | null;
  pair: string;
  tactic: string;
  notes: string;
  screenshot: string;
  management: boolean;
  pablo: boolean;
  htf: boolean;
  mtf: boolean;
  ltf: boolean;
  m1: boolean;
  outcomeOverride: Outcome | null;
  createdAt: number;
  example?: boolean;
};

export type Settings = {
  startingCapital: number;
  riskPercent: number;
  riskMode: RiskMode;
  accountName: string;
};

export type ComputedTrade = Trade & {
  nr: number;
  outcome: Outcome | null;
  pnl: number | null;
  balance: number;
  riskAmount: number;
};

export type GroupStats = {
  key: string;
  trades: number;
  wins: number;
  losses: number;
  be: number;
  winrate: number | null;
  avgRr: number | null;
  totalR: number;
  pnl: number;
};

export type JournalStats = {
  tradeCount: number;
  decided: number;
  wins: number;
  losses: number;
  be: number;
  winrate: number | null;
  avgRr: number | null;
  totalR: number;
  expectancyR: number | null;
  profitFactor: number | null;
  currentBalance: number;
  pnl: number;
  pnlPct: number | null;
  maxDrawdown: number;
  maxDrawdownPct: number | null;
  currentStreak: { type: Outcome | null; length: number };
  avgWinR: number | null;
  avgLossR: number | null;
  currentRisk: number;
};
