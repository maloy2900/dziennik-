import { useEffect, useState, type HTMLAttributes } from "react";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PAIR_PRESETS, SESSION_PRESETS } from "@/lib/journal/constants";
import { formatDatePl, formatUsd, outcomeLabel, parseRr } from "@/lib/journal/format";
import { useJournalStore } from "@/lib/journal/store";
import type { ComputedTrade, Position } from "@/lib/journal/types";
import { cn } from "@/lib/utils";

type Props = {
  rows: ComputedTrade[];
  onOpen: (id: string) => void;
};

function CellInput({
  defaultValue,
  onCommit,
  className,
  placeholder,
  list,
  type = "text",
  inputMode,
}: {
  defaultValue: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  list?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <Input
      type={type}
      inputMode={inputMode}
      list={list}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={cn(
        "h-9 rounded-sm border-transparent bg-transparent px-2 shadow-none hover:bg-elevated focus-visible:border-border focus-visible:bg-elevated focus-visible:ring-1",
        className,
      )}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

function RrCell({
  id,
  rr,
  onCommit,
  className,
}: {
  id: string;
  rr: number | null;
  onCommit: (raw: string) => void;
  className?: string;
}) {
  const formatted =
    rr === null || Number.isNaN(rr) ? "" : String(rr).replace(".", ",");
  const [text, setText] = useState(formatted);
  useEffect(() => {
    setText(formatted);
  }, [formatted, id]);

  return (
    <Input
      aria-label="RR"
      inputMode="decimal"
      value={text}
      placeholder="RR"
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onCommit(text)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className={cn(
        "h-9 rounded-sm border-transparent bg-transparent px-2 font-mono tabular shadow-none hover:bg-elevated focus-visible:border-border focus-visible:bg-elevated focus-visible:ring-1",
        className,
      )}
    />
  );
}

export function TradeTable({ rows, onOpen }: Props) {
  const updateTrade = useJournalStore((s) => s.updateTrade);
  const removeTrade = useJournalStore((s) => s.removeTrade);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <p className="text-sm font-medium">Brak transakcji</p>
        <p className="mt-1 text-sm text-muted">
          Dodaj wpis i podaj RR — wynik, saldo i wykres policzą się same.
        </p>
      </div>
    );
  }

  return (
    <>
      <datalist id="grid-pairs">
        {PAIR_PRESETS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <datalist id="grid-sessions">
        {SESSION_PRESETS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-left text-xs tracking-wide text-muted">
            <tr>
              <th className="w-12 px-3 py-3 font-medium">Nr</th>
              <th className="w-36 px-2 py-3 font-medium">Data</th>
              <th className="px-2 py-3 font-medium">Sesja</th>
              <th className="w-28 px-2 py-3 font-medium">Para</th>
              <th className="w-24 px-2 py-3 font-medium">Poz.</th>
              <th className="w-20 px-2 py-3 font-medium">RR</th>
              <th className="w-28 px-2 py-3 font-medium">Wynik</th>
              <th className="w-32 px-2 py-3 font-medium">PnL</th>
              <th className="w-36 px-2 py-3 font-medium">Stan konta</th>
              <th className="w-12 px-2 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-elevated/60">
                <td className="px-3 py-1 font-mono text-xs tabular text-muted">{row.nr}</td>
                <td className="px-1 py-1">
                  <CellInput
                    type="date"
                    defaultValue={row.date}
                    onCommit={(v) => updateTrade(row.id, { date: v })}
                    className="w-full"
                  />
                </td>
                <td className="px-1 py-1">
                  <CellInput
                    defaultValue={row.session}
                    list="grid-sessions"
                    placeholder="Sesja"
                    onCommit={(v) => updateTrade(row.id, { session: v })}
                    className="w-full"
                  />
                </td>
                <td className="px-1 py-1">
                  <CellInput
                    defaultValue={row.pair}
                    list="grid-pairs"
                    onCommit={(v) => updateTrade(row.id, { pair: v })}
                    className="w-full"
                  />
                </td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    className="rounded-sm px-1 py-1"
                    onClick={() =>
                      updateTrade(row.id, {
                        position: row.position === "long" ? "short" : "long",
                      })
                    }
                  >
                    <Badge variant={row.position === "long" ? "long" : "short"}>
                      {row.position === "long" ? "LONG" : "SHORT"}
                    </Badge>
                  </button>
                </td>
                <td className="px-1 py-1">
                  <RrCell
                    id={row.id}
                    rr={row.rr}
                    onCommit={(v) => updateTrade(row.id, { rr: parseRr(v) })}
                    className={cn(
                      "w-full",
                      (row.rr ?? 0) > 0 && "text-win",
                      (row.rr ?? 0) < 0 && "text-loss",
                    )}
                  />
                </td>
                <td className="px-2 py-1">
                  <OutcomeBadge outcome={row.outcome} />
                </td>
                <td
                  className={cn(
                    "px-3 py-1 font-mono text-xs tabular",
                    (row.pnl ?? 0) > 0 && "text-win",
                    (row.pnl ?? 0) < 0 && "text-loss",
                    row.pnl === null && "text-subtle",
                  )}
                >
                  {row.pnl === null ? "—" : formatUsd(row.pnl)}
                </td>
                <td className="px-3 py-1 font-mono text-xs tabular">{formatUsd(row.balance)}</td>
                <td className="px-2 py-1 text-right">
                  <RowMenu
                    screenshot={row.screenshot}
                    onOpen={() => onOpen(row.id)}
                    onDelete={() => removeTrade(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <MobileCard
            key={row.id}
            row={row}
            onOpen={() => onOpen(row.id)}
            onDelete={() => removeTrade(row.id)}
            onTogglePos={() =>
              updateTrade(row.id, {
                position: (row.position === "long" ? "short" : "long") as Position,
              })
            }
            onRr={(v) => updateTrade(row.id, { rr: parseRr(v) })}
          />
        ))}
      </div>
    </>
  );
}

function OutcomeBadge({ outcome }: { outcome: ComputedTrade["outcome"] }) {
  if (!outcome) return <span className="text-xs text-subtle">—</span>;
  return (
    <Badge variant={outcome === "win" ? "win" : outcome === "loss" ? "loss" : "be"}>
      {outcomeLabel(outcome)}
    </Badge>
  );
}

function RowMenu({
  screenshot,
  onOpen,
  onDelete,
}: {
  screenshot: string;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Menu wiersza">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onOpen}>Szczegóły</DropdownMenuItem>
        {screenshot ? (
          <DropdownMenuItem asChild>
            <a href={screenshot} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              Wykres
            </a>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="text-loss" onClick={onDelete}>
          <Trash2 className="size-3.5" />
          Usuń
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileCard({
  row,
  onOpen,
  onDelete,
  onTogglePos,
  onRr,
}: {
  row: ComputedTrade;
  onOpen: () => void;
  onDelete: () => void;
  onTogglePos: () => void;
  onRr: (v: string) => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted">
            #{row.nr} · {formatDatePl(row.date)}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium">{row.pair || "Para"}</span>
            <button type="button" onClick={onTogglePos}>
              <Badge variant={row.position === "long" ? "long" : "short"}>
                {row.position === "long" ? "LONG" : "SHORT"}
              </Badge>
            </button>
          </div>
          {row.session ? <div className="mt-0.5 text-xs text-muted">{row.session}</div> : null}
        </div>
        <OutcomeBadge outcome={row.outcome} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-subtle">RR</div>
          <RrCell
            id={`${row.id}-m`}
            rr={row.rr}
            onCommit={onRr}
            className={cn(
              "mt-1 border-border bg-elevated",
              (row.rr ?? 0) > 0 && "text-win",
              (row.rr ?? 0) < 0 && "text-loss",
            )}
          />
        </div>
        <div>
          <div className="text-subtle">PnL</div>
          <div
            className={cn(
              "mt-2 font-mono tabular",
              (row.pnl ?? 0) > 0 && "text-win",
              (row.pnl ?? 0) < 0 && "text-loss",
            )}
          >
            {row.pnl === null ? "—" : formatUsd(row.pnl)}
          </div>
        </div>
        <div>
          <div className="text-subtle">Saldo</div>
          <div className="mt-2 font-mono tabular">{formatUsd(row.balance)}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onOpen}>
          Szczegóły
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Usuń">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}
