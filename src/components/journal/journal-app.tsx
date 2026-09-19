import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Plus,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { AnalysisView } from "@/components/journal/analysis-view";
import { EquityChart } from "@/components/journal/equity-chart";
import { SettingsDialog } from "@/components/journal/settings-dialog";
import { StatsGrid } from "@/components/journal/stats-grid";
import { TradeEditor } from "@/components/journal/trade-editor";
import { TradeTable } from "@/components/journal/trade-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeStats, computeTrades } from "@/lib/journal/calc";
import {
  downloadText,
  parseBackupJson,
  parseCsv,
  settingsToJson,
  tradesToCsv,
} from "@/lib/journal/csv";
import { rehydrateJournal, useJournalStore } from "@/lib/journal/store";

export function JournalApp() {
  const hydrated = useJournalStore((s) => s.hydrated);
  const trades = useJournalStore((s) => s.trades);
  const settings = useJournalStore((s) => s.settings);
  const addTrade = useJournalStore((s) => s.addTrade);
  const clearExamples = useJournalStore((s) => s.clearExamples);
  const clearAll = useJournalStore((s) => s.clearAll);
  const replaceAll = useJournalStore((s) => s.replaceAll);
  const mergeTrades = useJournalStore((s) => s.mergeTrades);

  const [tab, setTab] = useState("journal");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return rehydrateJournal();
  }, []);

  const computed = useMemo(() => computeTrades(trades, settings), [trades, settings]);
  const stats = useMemo(() => computeStats(computed, settings), [computed, settings]);
  const hasExamples = trades.some((t) => t.example);

  function handleNew() {
    addTrade();
    toast.success("Dodano wiersz — wpisz RR, reszta liczy się sama");
  }

  function handleExportJson() {
    downloadText(
      `dziennik-tradera-${new Date().toISOString().slice(0, 10)}.json`,
      settingsToJson(settings, trades),
      "application/json",
    );
    toast.success("Zapisano kopię JSON");
  }

  function handleExportCsv() {
    downloadText(
      `dziennik-tradera-${new Date().toISOString().slice(0, 10)}.csv`,
      tradesToCsv(computed),
      "text/csv;charset=utf-8",
    );
    toast.success("Zapisano CSV");
  }

  async function handleImport(file: File) {
    const text = await file.text();
    try {
      if (file.name.toLowerCase().endsWith(".json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        const parsed = parseBackupJson(text);
        replaceAll(parsed);
        toast.success(`Wczytano ${parsed.trades.length} transakcji`);
      } else {
        const rows = parseCsv(text);
        if (rows.length === 0) {
          toast.error("Nie znaleziono transakcji w pliku");
          return;
        }
        mergeTrades(rows);
        toast.success(`Dodano ${rows.length} transakcji z CSV`);
      }
    } catch {
      toast.error("Nie udało się wczytać pliku");
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-muted">
        <p className="text-sm">Wczytywanie dziennika…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-win" aria-hidden />
              <h1 className="truncate text-sm font-medium tracking-tight sm:text-base">
                Dziennik Tradera
              </h1>
            </div>
            <p className="truncate pl-4 text-xs text-muted">
              {settings.accountName} · zapis auto w tej przeglądarce
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                  <Download className="size-3.5" />
                  Kopia
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportJson}>Eksport JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCsv}>Eksport CSV</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                  <Upload className="size-3.5" />
                  Import JSON / CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-loss"
                  onClick={() => {
                    if (confirm("Usunąć wszystkie transakcje z tego urządzenia?")) {
                      clearAll();
                      toast.success("Dziennik wyczyszczony");
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Wyczyść dziennik
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="secondary"
              size="icon-sm"
              className="sm:hidden"
              aria-label="Kopia zapasowa"
              onClick={handleExportJson}
            >
              <Download className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Ustawienia"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="size-4" />
            </Button>
            <Button size="sm" onClick={handleNew}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nowa</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 pb-24">
        {hasExamples ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-elevated px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Widzisz przykłady z arkusza (EUR/USD, 25.05.2024). Usuń je i wpisuj swoje setupy.
            </p>
            <Button variant="secondary" size="sm" onClick={clearExamples}>
              Usuń przykłady
            </Button>
          </div>
        ) : null}

        <StatsGrid stats={stats} />
        <EquityChart trades={computed} startingCapital={settings.startingCapital} />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="journal">Dziennik</TabsTrigger>
            <TabsTrigger value="analysis">Analiza taktyk</TabsTrigger>
          </TabsList>
          <TabsContent value="journal" className="flex flex-col gap-3">
            <TradeTable rows={computed} onOpen={setEditingId} />
            <Button variant="secondary" onClick={handleNew} className="self-start">
              <Plus className="size-4" />
              Dodaj transakcję
            </Button>
          </TabsContent>
          <TabsContent value="analysis">
            <AnalysisView rows={computed} />
          </TabsContent>
        </Tabs>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv,text/csv,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImport(file);
          e.target.value = "";
        }}
      />

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TradeEditor tradeId={editingId} onClose={() => setEditingId(null)} />
    </div>
  );
}
