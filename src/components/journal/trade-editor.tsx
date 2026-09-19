import { useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { PAIR_PRESETS, SESSION_PRESETS } from "@/lib/journal/constants";
import { formatRr, parseRr } from "@/lib/journal/format";
import { useJournalStore } from "@/lib/journal/store";
import type { Outcome, Position, Trade } from "@/lib/journal/types";

type Props = {
  tradeId: string | null;
  onClose: () => void;
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function TradeEditor({ tradeId, onClose }: Props) {
  const trades = useJournalStore((s) => s.trades);
  const updateTrade = useJournalStore((s) => s.updateTrade);
  const removeTrade = useJournalStore((s) => s.removeTrade);
  const trade = trades.find((t) => t.id === tradeId) ?? null;

  const tactics = useMemo(() => {
    const set = new Set<string>();
    for (const t of trades) if (t.tactic.trim()) set.add(t.tactic.trim());
    return [...set].sort();
  }, [trades]);

  if (!trade) {
    return (
      <Sheet open={Boolean(tradeId)} onOpenChange={(o) => !o && onClose()}>
        <SheetContent />
      </Sheet>
    );
  }

  const current = trade;

  function patch(p: Partial<Trade>) {
    updateTrade(current.id, p);
  }

  return (
    <Sheet open={Boolean(tradeId)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transakcja</SheetTitle>
          <SheetDescription>
            Zmiana RR automatycznie ustawia wynik i przelicza saldo.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data" htmlFor="t-date">
              <Input
                id="t-date"
                type="date"
                value={trade.date}
                onChange={(e) => patch({ date: e.target.value })}
              />
            </Field>
            <Field label="Para" htmlFor="t-pair">
              <Input
                id="t-pair"
                list="pair-list"
                value={trade.pair}
                onChange={(e) => patch({ pair: e.target.value })}
              />
              <datalist id="pair-list">
                {PAIR_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
          </div>

          <Field label="Sesja" htmlFor="t-session">
            <Input
              id="t-session"
              list="session-list"
              placeholder="np. 9:31 - LDN OPEN"
              value={trade.session}
              onChange={(e) => patch({ session: e.target.value })}
            />
            <datalist id="session-list">
              {SESSION_PRESETS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pozycja">
              <Select
                value={trade.position}
                onValueChange={(v) => patch({ position: v as Position })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">LONG</SelectItem>
                  <SelectItem value="short">SHORT</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="RR" htmlFor="t-rr">
              <Input
                id="t-rr"
                inputMode="decimal"
                placeholder="np. 2,5 lub -1"
                defaultValue={trade.rr === null ? "" : String(trade.rr).replace(".", ",")}
                key={`${trade.id}-${trade.rr}`}
                onBlur={(e) => patch({ rr: parseRr(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Wynik (auto z RR)">
            <Select
              value={trade.outcomeOverride ?? "auto"}
              onValueChange={(v) =>
                patch({
                  outcomeOverride: v === "auto" ? null : (v as Outcome),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Auto {trade.rr === null ? "" : `(${formatRr(trade.rr)})`}
                </SelectItem>
                <SelectItem value="win">Wygrana</SelectItem>
                <SelectItem value="loss">Przegrana</SelectItem>
                <SelectItem value="be">BE</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Taktyka / setup" htmlFor="t-tactic">
            <Input
              id="t-tactic"
              list="tactic-list"
              placeholder="np. FVG + OB, Silver Bullet"
              value={trade.tactic}
              onChange={(e) => patch({ tactic: e.target.value })}
            />
            <datalist id="tactic-list">
              {tactics.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>

          <Field label="Notatki" htmlFor="t-notes">
            <Textarea
              id="t-notes"
              value={trade.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              placeholder="Co zadziałało, co złamałeś, kontekst HTF…"
            />
          </Field>

          <Field label="Zdjęcie / link TradingView" htmlFor="t-shot">
            <Input
              id="t-shot"
              type="url"
              placeholder="https://www.tradingview.com/x/…"
              value={trade.screenshot}
              onChange={(e) => patch({ screenshot: e.target.value })}
            />
          </Field>

          <div className="rounded-lg border border-border bg-elevated p-3">
            <div className="text-xs font-medium tracking-wide text-muted">Checklist TF</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <CheckRow
                label="HTF D1"
                checked={trade.htf}
                onChange={(v) => patch({ htf: v })}
              />
              <CheckRow
                label="MTF H4/H1"
                checked={trade.mtf}
                onChange={(v) => patch({ mtf: v })}
              />
              <CheckRow
                label="LTF M15"
                checked={trade.ltf}
                onChange={(v) => patch({ ltf: v })}
              />
              <CheckRow
                label="Wejście M1"
                checked={trade.m1}
                onChange={(v) => patch({ m1: v })}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <CheckRow
              label="Odpowiednie zarządzanie pozycją"
              checked={trade.management}
              onChange={(v) => patch({ management: v })}
            />
            <CheckRow
              label="Sprawdzone przez Pablo"
              checked={trade.pablo}
              onChange={(v) => patch({ pablo: v })}
            />
          </div>

          <Button
            variant="destructive"
            onClick={() => {
              removeTrade(trade.id);
              onClose();
            }}
          >
            Usuń transakcję
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {label}
    </label>
  );
}
