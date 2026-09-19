import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJournalStore } from "@/lib/journal/store";
import { parseNumberLoose } from "@/lib/journal/format";
import type { RiskMode } from "@/lib/journal/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsDialog({ open, onOpenChange }: Props) {
  const settings = useJournalStore((s) => s.settings);
  const updateSettings = useJournalStore((s) => s.updateSettings);
  const [name, setName] = useState(settings.accountName);
  const [capital, setCapital] = useState(String(settings.startingCapital));
  const [risk, setRisk] = useState(String(settings.riskPercent));
  const [mode, setMode] = useState<RiskMode>(settings.riskMode);

  function syncFromStore() {
    setName(settings.accountName);
    setCapital(String(settings.startingCapital));
    setRisk(String(settings.riskPercent));
    setMode(settings.riskMode);
  }

  function save() {
    const cap = parseNumberLoose(capital);
    const rp = parseNumberLoose(risk);
    updateSettings({
      accountName: name.trim() || "Konto główne",
      startingCapital: cap && cap > 0 ? cap : settings.startingCapital,
      riskPercent: rp && rp > 0 ? rp : settings.riskPercent,
      riskMode: mode,
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) syncFromStore();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ustawienia konta</DialogTitle>
          <DialogDescription>
            Saldo i RR liczą się od tych wartości po każdej zmianie — jak formuły w arkuszu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="acc-name">Nazwa konta</Label>
            <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="acc-cap">Kapitał początkowy ($)</Label>
            <Input
              id="acc-cap"
              inputMode="decimal"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="acc-risk">Ryzyko na transakcję (%)</Label>
            <Input
              id="acc-risk"
              inputMode="decimal"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tryb ryzyka</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("compound")}
                className={`rounded-md border px-3 py-2 text-left text-sm ${
                  mode === "compound"
                    ? "border-primary bg-elevated text-fg"
                    : "border-border text-muted"
                }`}
              >
                <div className="font-medium text-fg">Składane</div>
                <div className="text-xs">% od aktualnego salda</div>
              </button>
              <button
                type="button"
                onClick={() => setMode("fixed")}
                className={`rounded-md border px-3 py-2 text-left text-sm ${
                  mode === "fixed"
                    ? "border-primary bg-elevated text-fg"
                    : "border-border text-muted"
                }`}
              >
                <div className="font-medium text-fg">Stałe 1R</div>
                <div className="text-xs">% od kapitału początkowego</div>
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={save}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
