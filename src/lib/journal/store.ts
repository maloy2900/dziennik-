import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, STORAGE_KEY, emptyTrade, exampleTrades } from "./constants";
import type { Settings, Trade } from "./types";

type JournalState = {
  trades: Trade[];
  settings: Settings;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addTrade: (partial?: Partial<Trade>) => string;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  removeTrade: (id: string) => void;
  replaceTrades: (trades: Trade[]) => void;
  mergeTrades: (trades: Trade[]) => void;
  clearExamples: () => void;
  clearAll: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceAll: (payload: { trades: Trade[]; settings?: Partial<Settings> }) => void;
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      trades: exampleTrades(),
      settings: DEFAULT_SETTINGS,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addTrade: (partial) => {
        const last = [...get().trades].sort((a, b) => b.createdAt - a.createdAt)[0];
        const trade = emptyTrade({
          pair: last?.pair ?? "EUR/USD",
          session: last?.session ?? "",
          ...partial,
          example: false,
        });
        set({ trades: [...get().trades, trade] });
        return trade.id;
      },
      updateTrade: (id, patch) => {
        set({
          trades: get().trades.map((t) => (t.id === id ? { ...t, ...patch, example: false } : t)),
        });
      },
      removeTrade: (id) => {
        set({ trades: get().trades.filter((t) => t.id !== id) });
      },
      replaceTrades: (trades) => set({ trades }),
      mergeTrades: (incoming) => {
        const existingIds = new Set(get().trades.map((t) => t.id));
        const mapped = incoming.map((t) =>
          existingIds.has(t.id) ? { ...t, id: `${t.id}-${t.createdAt}` } : t,
        );
        set({ trades: [...get().trades.filter((t) => !t.example), ...mapped] });
      },
      clearExamples: () => set({ trades: get().trades.filter((t) => !t.example) }),
      clearAll: () => set({ trades: [] }),
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      replaceAll: ({ trades, settings }) =>
        set({
          trades,
          settings: settings ? { ...get().settings, ...settings } : get().settings,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      skipHydration: true,
      partialize: (state) => ({ trades: state.trades, settings: state.settings }),
    },
  ),
);

export function rehydrateJournal() {
  const unsub = useJournalStore.persist.onFinishHydration(() => {
    useJournalStore.getState().setHydrated(true);
  });
  void useJournalStore.persist.rehydrate();
  if (useJournalStore.persist.hasHydrated()) {
    useJournalStore.getState().setHydrated(true);
  }
  return unsub;
}
