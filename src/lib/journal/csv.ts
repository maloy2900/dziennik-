import { CSV_HEADERS, emptyTrade } from "./constants";
import {
  formatDatePl,
  formatRr,
  outcomeLabel,
  parseBool,
  parseDateInput,
  parseOutcome,
  parsePosition,
  parseRr,
} from "./format";
import type { ComputedTrade, Settings, Trade } from "./types";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function tradesToCsv(rows: ComputedTrade[]): string {
  const header = CSV_HEADERS.join(",");
  const lines = rows.map((t) =>
    [
      String(t.nr),
      formatDatePl(t.date),
      t.session,
      t.position === "long" ? "LONG" : "SHORT",
      t.management ? "TRUE" : "FALSE",
      t.rr === null ? "" : formatRr(t.rr).replace("+", ""),
      outcomeLabel(t.outcome),
      t.pnl === null ? "" : t.balance.toFixed(2),
      t.pablo ? "TRUE" : "FALSE",
      t.notes,
      t.screenshot,
      t.htf ? "TRUE" : "FALSE",
      t.mtf ? "TRUE" : "FALSE",
      t.ltf ? "TRUE" : "FALSE",
      t.m1 ? "TRUE" : "FALSE",
      t.pair,
      t.tactic,
    ]
      .map(csvEscape)
      .join(","),
  );
  return `\uFEFF${header}\n${lines.join("\n")}\n`;
}

export function settingsToJson(settings: Settings, trades: Trade[]): string {
  return JSON.stringify({ version: 1, settings, trades }, null, 2);
}

type Backup = {
  version?: number;
  settings?: Partial<Settings>;
  trades?: Trade[];
};

export function parseBackupJson(text: string): { settings?: Partial<Settings>; trades: Trade[] } {
  const data = JSON.parse(text) as Backup | Trade[];
  if (Array.isArray(data)) {
    return { trades: data.map(normalizeTrade) };
  }
  if (data && Array.isArray(data.trades)) {
    return {
      settings: data.settings,
      trades: data.trades.map(normalizeTrade),
    };
  }
  throw new Error("Nieprawidłowy plik kopii.");
}

function normalizeTrade(raw: Partial<Trade> & { id?: string }): Trade {
  const base = emptyTrade();
  return {
    ...base,
    ...raw,
    id: raw.id || base.id,
    rr: typeof raw.rr === "number" ? raw.rr : null,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
  };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function normHeader(h: string): string {
  return h.trim().toUpperCase().replace(/\s+/g, " ");
}

export function parseCsv(text: string): Trade[] {
  const raw = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(normHeader);
  const idx = (name: string) => headers.indexOf(name);

  const iDate = idx("DATA");
  const iSession = idx("SESJA");
  const iPos = idx("POZYCJA: LONG/SHORT") !== -1 ? idx("POZYCJA: LONG/SHORT") : idx("POZYCJA");
  const iMgmt = idx("ODPOWIEDNIE ZARZĄDZANIE POZYCJA");
  const iRr = idx("RR");
  const iWin = idx("WINRATIO");
  const iPablo = idx("SPRAWDZONE PRZEZ PABLO");
  const iNotes = idx("NOTATKI");
  const iShot = idx("ZDJĘCIE TRADE");
  const iHtf = idx("HTF - D1");
  const iMtf = idx("MTF H4/H1");
  const iLtf = idx("LTF M15");
  const iM1 = idx("WEJŚCIE M1");
  const iPair = idx("PARA");
  const iTactic = idx("TAKTYKA");

  const trades: Trade[] = [];
  let createdAt = Date.now();
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const dateRaw = iDate >= 0 ? cols[iDate] ?? "" : "";
    const rrRaw = iRr >= 0 ? cols[iRr] ?? "" : "";
    const pair = iPair >= 0 ? (cols[iPair] ?? "").trim() : "";
    const session = iSession >= 0 ? (cols[iSession] ?? "").trim() : "";
    const notes = iNotes >= 0 ? (cols[iNotes] ?? "").trim() : "";
    const screenshot = iShot >= 0 ? (cols[iShot] ?? "").trim() : "";
    const rr = parseRr(rrRaw);
    const date = parseDateInput(dateRaw) ?? (dateRaw ? null : "");
    const looksLikeSummary =
      /winratio|średnie|srednie/i.test(notes) || /winratio|średnie/i.test(pair);
    if (looksLikeSummary) continue;
    const hasSignal = Boolean(date || rr !== null || pair || session || screenshot);
    if (!hasSignal) continue;
    if (typeof date !== "string") continue;

    const posRaw = iPos >= 0 ? cols[iPos] ?? "" : "";
    const winRaw = iWin >= 0 ? cols[iWin] ?? "" : "";
    const autoOutcome = rr !== null ? (rr > 0 ? "win" : rr < 0 ? "loss" : "be") : null;
    const parsedOutcome = parseOutcome(winRaw);
    const outcomeOverride =
      parsedOutcome && autoOutcome && parsedOutcome !== autoOutcome ? parsedOutcome : null;

    trades.push(
      emptyTrade({
        date: date || new Date().toISOString().slice(0, 10),
        session,
        position: parsePosition(posRaw) ?? "long",
        rr,
        pair,
        tactic: iTactic >= 0 ? (cols[iTactic] ?? "").trim() : "",
        notes,
        screenshot,
        management: iMgmt >= 0 ? parseBool(cols[iMgmt] ?? "") : false,
        pablo: iPablo >= 0 ? parseBool(cols[iPablo] ?? "") : false,
        htf: iHtf >= 0 ? parseBool(cols[iHtf] ?? "") : false,
        mtf: iMtf >= 0 ? parseBool(cols[iMtf] ?? "") : false,
        ltf: iLtf >= 0 ? parseBool(cols[iLtf] ?? "") : false,
        m1: iM1 >= 0 ? parseBool(cols[iM1] ?? "") : false,
        outcomeOverride,
        createdAt: createdAt++,
        example: false,
      }),
    );
  }
  return trades;
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
