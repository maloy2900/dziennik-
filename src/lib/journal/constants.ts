import type { Settings, Trade } from "./types";
import { uid } from "@/lib/utils";

export const STORAGE_KEY = "trader-journal-v1";

export const DEFAULT_SETTINGS: Settings = {
  startingCapital: 50_000,
  riskPercent: 1,
  riskMode: "compound",
  accountName: "Konto główne",
};

export const SESSION_PRESETS = [
  "Asia",
  "LDN OPEN",
  "LDN LUNCH",
  "NY OPEN",
  "NY AM",
  "NY PM",
  "LDN CLOSE",
  "Silver Bullet AM",
  "Silver Bullet PM",
] as const;

export const PAIR_PRESETS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "XAU/USD",
  "NAS100",
  "US30",
  "GBP/JPY",
  "AUD/USD",
  "USD/CAD",
  "EUR/GBP",
  "BTC/USD",
] as const;

export function emptyTrade(partial?: Partial<Trade>): Trade {
  return {
    id: uid(),
    date: new Date().toISOString().slice(0, 10),
    session: "",
    position: "long",
    rr: null,
    pair: "EUR/USD",
    tactic: "",
    notes: "",
    screenshot: "",
    management: false,
    pablo: false,
    htf: false,
    mtf: false,
    ltf: false,
    m1: false,
    outcomeOverride: null,
    createdAt: Date.now(),
    ...partial,
  };
}

export function exampleTrades(): Trade[] {
  const day = "2024-05-25";
  return [
    emptyTrade({
      date: day,
      session: "9:31 - LDN OPEN",
      position: "long",
      rr: 6.5,
      pair: "EUR/USD",
      screenshot: "https://www.tradingview.com/x/6hlYd6nY/",
      notes: "Przykład z oryginalnego arkusza.",
      example: true,
      createdAt: 1,
    }),
    emptyTrade({
      date: day,
      session: "LDN OPEN",
      position: "short",
      rr: -1,
      pair: "EUR/USD",
      notes: "Przykład — strata 1R.",
      example: true,
      createdAt: 2,
    }),
    emptyTrade({
      date: day,
      session: "NY OPEN",
      position: "long",
      rr: 0,
      pair: "EUR/USD",
      notes: "Przykład — break even.",
      example: true,
      createdAt: 3,
    }),
    emptyTrade({
      date: day,
      session: "NY PM",
      position: "long",
      rr: 3.5,
      pair: "GBP/USD",
      notes: "Przykład — +3.5R.",
      example: true,
      createdAt: 4,
    }),
  ];
}

export const CSV_HEADERS = [
  "NR TRANSAKCJI",
  "DATA",
  "SESJA",
  "POZYCJA: LONG/SHORT",
  "ODPOWIEDNIE ZARZĄDZANIE POZYCJA",
  "RR",
  "WINRATIO",
  "STAN KONTA W $",
  "SPRAWDZONE PRZEZ PABLO",
  "NOTATKI",
  "ZDJĘCIE TRADE",
  "HTF - D1",
  "MTF H4/H1",
  "LTF M15",
  "WEJŚCIE M1",
  "PARA",
  "TAKTYKA",
] as const;
