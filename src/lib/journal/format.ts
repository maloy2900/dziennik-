import type { Outcome, Position } from "./types";

const pl = "pl-PL";

export function formatMoney(value: number, digits = 2): string {
  return new Intl.NumberFormat(pl, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatUsd(value: number): string {
  return `${formatMoney(value)} $`;
}

export function formatRr(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  const abs = Math.abs(value);
  const digits = abs >= 10 ? 1 : 2;
  const body = new Intl.NumberFormat(pl, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
    maximumFractionDigits: 2,
  }).format(value);
  return value > 0 ? `+${body}` : body;
}

export function formatPct(value: number | null, digits = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(pl, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDatePl(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function parseDateInput(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (iso) return v;
  const plDate = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(v);
  if (plDate) {
    const dd = plDate[1].padStart(2, "0");
    const mm = plDate[2].padStart(2, "0");
    return `${plDate[3]}-${mm}-${dd}`;
  }
  return null;
}

export function parseRr(raw: string): number | null {
  const v = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parsePosition(raw: string): Position | null {
  const v = raw.toUpperCase();
  if (v.includes("LONG")) return "long";
  if (v.includes("SHORT")) return "short";
  return null;
}

export function parseOutcome(raw: string): Outcome | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (["wygrana", "win", "w", "tp"].includes(v)) return "win";
  if (["przegrana", "loss", "l", "sl"].includes(v)) return "loss";
  if (["be", "break even", "breakeven", "0"].includes(v)) return "be";
  return null;
}

export function outcomeLabel(outcome: Outcome | null): string {
  if (outcome === "win") return "Wygrana";
  if (outcome === "loss") return "Przegrana";
  if (outcome === "be") return "BE";
  return "—";
}

export function positionLabel(position: Position): string {
  return position === "long" ? "LONG" : "SHORT";
}

export function parseBool(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return ["true", "1", "tak", "yes", "x", "✓"].includes(v);
}

export function parseNumberLoose(raw: string): number | null {
  const v = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
