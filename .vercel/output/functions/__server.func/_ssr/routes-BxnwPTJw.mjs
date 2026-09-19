import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as Slot, m as require_jsx_runtime, n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as Settings2, c as Ellipsis, d as Check, i as Trash2, l as Download, n as Upload, o as Plus, s as ExternalLink, t as X, u as ChevronDown } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Root2, i as Portal2, n as Item2, o as Separator2, r as Label2, s as Trigger, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn, r as uid } from "./router-BjDQ_iYn.mjs";
import { a as Area, c as Cell, i as XAxis, l as ResponsiveContainer, n as BarChart, o as CartesianGrid, r as YAxis, s as Bar, t as AreaChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { i as Trigger$1, n as List, r as Root2$1, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BxnwPTJw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl border border-border bg-surface text-fg shadow-none", className),
		...props
	});
}
function outcomeFromRr(rr) {
	if (rr > 0) return "win";
	if (rr < 0) return "loss";
	return "be";
}
function resolveOutcome(trade) {
	if (trade.outcomeOverride) return trade.outcomeOverride;
	if (trade.rr === null || Number.isNaN(trade.rr)) return null;
	return outcomeFromRr(trade.rr);
}
function sortTrades(trades) {
	return [...trades].sort((a, b) => {
		if (a.date !== b.date) return a.date.localeCompare(b.date);
		if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
		return a.id.localeCompare(b.id);
	});
}
function computeTrades(trades, settings) {
	const sorted = sortTrades(trades);
	let balance = settings.startingCapital;
	const fixedRisk = settings.startingCapital * (settings.riskPercent / 100);
	return sorted.map((trade, index) => {
		const riskAmount = settings.riskMode === "compound" ? balance * (settings.riskPercent / 100) : fixedRisk;
		const outcome = resolveOutcome(trade);
		const pnl = trade.rr !== null && !Number.isNaN(trade.rr) ? riskAmount * trade.rr : null;
		if (pnl !== null) balance += pnl;
		return {
			...trade,
			nr: index + 1,
			outcome,
			pnl,
			balance,
			riskAmount
		};
	});
}
function avg(values) {
	if (values.length === 0) return null;
	return values.reduce((s, v) => s + v, 0) / values.length;
}
function computeStats(computed, settings) {
	const withRr = computed.filter((t) => t.rr !== null);
	const wins = withRr.filter((t) => t.outcome === "win");
	const losses = withRr.filter((t) => t.outcome === "loss");
	const be = withRr.filter((t) => t.outcome === "be");
	const decided = wins.length + losses.length;
	const rrValues = withRr.map((t) => t.rr);
	const winR = wins.map((t) => t.rr);
	const lossR = losses.map((t) => t.rr);
	const totalR = rrValues.reduce((s, v) => s + v, 0);
	const grossWinR = winR.reduce((s, v) => s + v, 0);
	const grossLossR = Math.abs(lossR.reduce((s, v) => s + v, 0));
	const profitFactor = decided === 0 ? null : grossLossR === 0 ? grossWinR > 0 ? Number.POSITIVE_INFINITY : null : grossWinR / grossLossR;
	const currentBalance = computed.length > 0 ? computed[computed.length - 1].balance : settings.startingCapital;
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
	let currentStreak = {
		type: null,
		length: 0
	};
	for (let i = computed.length - 1; i >= 0; i--) {
		const o = computed[i].outcome;
		if (!o || o === "be") {
			if (currentStreak.length > 0) break;
			continue;
		}
		if (currentStreak.type === null) currentStreak = {
			type: o,
			length: 1
		};
		else if (currentStreak.type === o) currentStreak.length += 1;
		else break;
	}
	const last = computed[computed.length - 1];
	const currentRisk = last ? last.riskAmount : settings.startingCapital * (settings.riskPercent / 100);
	const winrate = decided === 0 ? null : wins.length / decided;
	const avgWinR = avg(winR);
	const avgLossR = avg(lossR);
	const expectancyR = winrate === null || avgWinR === null ? avg(rrValues) : winrate * avgWinR + (1 - winrate) * (avgLossR ?? 0);
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
		currentRisk
	};
}
function groupStats(computed, keyFn) {
	const map = /* @__PURE__ */ new Map();
	for (const t of computed) {
		if (t.rr === null) continue;
		const key = keyFn(t) || "—";
		const list = map.get(key);
		if (list) list.push(t);
		else map.set(key, [t]);
	}
	const rows = [];
	for (const [key, list] of map) {
		const wins = list.filter((t) => t.outcome === "win").length;
		const losses = list.filter((t) => t.outcome === "loss").length;
		const be = list.filter((t) => t.outcome === "be").length;
		const decided = wins + losses;
		const rrValues = list.map((t) => t.rr);
		rows.push({
			key,
			trades: list.length,
			wins,
			losses,
			be,
			winrate: decided === 0 ? null : wins / decided,
			avgRr: avg(rrValues),
			totalR: rrValues.reduce((s, v) => s + v, 0),
			pnl: list.reduce((s, t) => s + (t.pnl ?? 0), 0)
		});
	}
	return rows.sort((a, b) => b.trades - a.trades);
}
function equityPoints(computed, startingCapital) {
	const points = [{
		nr: 0,
		label: "Start",
		balance: startingCapital,
		rr: 0,
		date: ""
	}];
	for (const t of computed) {
		if (t.rr === null) continue;
		points.push({
			nr: t.nr,
			label: `#${t.nr}`,
			balance: t.balance,
			rr: t.rr,
			date: t.date
		});
	}
	return points;
}
var pl = "pl-PL";
function formatMoney(value, digits = 2) {
	return new Intl.NumberFormat(pl, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
}
function formatUsd(value) {
	return `${formatMoney(value)} $`;
}
function formatRr(value) {
	if (value === null || Number.isNaN(value)) return "";
	const digits = Math.abs(value) >= 10 ? 1 : 2;
	const body = new Intl.NumberFormat(pl, {
		minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
		maximumFractionDigits: 2
	}).format(value);
	return value > 0 ? `+${body}` : body;
}
function formatPct(value, digits = 1) {
	if (value === null || Number.isNaN(value)) return "—";
	return new Intl.NumberFormat(pl, {
		style: "percent",
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
}
function formatDatePl(iso) {
	if (!iso) return "";
	const [y, m, d] = iso.split("-");
	if (!y || !m || !d) return iso;
	return `${d}.${m}.${y}`;
}
function parseDateInput(raw) {
	const v = raw.trim();
	if (!v) return null;
	if (/^(\d{4})-(\d{2})-(\d{2})$/.exec(v)) return v;
	const plDate = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(v);
	if (plDate) {
		const dd = plDate[1].padStart(2, "0");
		const mm = plDate[2].padStart(2, "0");
		return `${plDate[3]}-${mm}-${dd}`;
	}
	return null;
}
function parseRr(raw) {
	const v = raw.trim().replace(/\s/g, "").replace(",", ".");
	if (!v) return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}
function parsePosition(raw) {
	const v = raw.toUpperCase();
	if (v.includes("LONG")) return "long";
	if (v.includes("SHORT")) return "short";
	return null;
}
function parseOutcome(raw) {
	const v = raw.trim().toLowerCase();
	if (!v) return null;
	if ([
		"wygrana",
		"win",
		"w",
		"tp"
	].includes(v)) return "win";
	if ([
		"przegrana",
		"loss",
		"l",
		"sl"
	].includes(v)) return "loss";
	if ([
		"be",
		"break even",
		"breakeven",
		"0"
	].includes(v)) return "be";
	return null;
}
function outcomeLabel(outcome) {
	if (outcome === "win") return "Wygrana";
	if (outcome === "loss") return "Przegrana";
	if (outcome === "be") return "BE";
	return "—";
}
function parseBool(raw) {
	const v = raw.trim().toLowerCase();
	return [
		"true",
		"1",
		"tak",
		"yes",
		"x",
		"✓"
	].includes(v);
}
function parseNumberLoose(raw) {
	const v = raw.trim().replace(/\s/g, "").replace(",", ".");
	if (!v) return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}
function Table({ title, data }) {
	if (data.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Za mało danych."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border px-5 py-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: title
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-2 font-medium",
							children: "Grupa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-medium",
							children: "N"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-medium",
							children: "WR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-medium",
							children: "Śr. RR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-medium",
							children: "Suma R"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-2 font-medium",
							children: "PnL"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-2.5 font-medium",
							children: row.key
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5 font-mono tabular text-muted",
							children: row.trades
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5 font-mono tabular",
							children: formatPct(row.winrate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: `px-3 py-2.5 font-mono tabular ${(row.avgRr ?? 0) >= 0 ? "text-win" : "text-loss"}`,
							children: row.avgRr === null ? "—" : formatRr(row.avgRr)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5 font-mono tabular",
							children: formatRr(row.totalR)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: `px-5 py-2.5 font-mono tabular ${row.pnl >= 0 ? "text-win" : "text-loss"}`,
							children: formatUsd(row.pnl)
						})
					]
				}, row.key)) })]
			})
		})]
	});
}
function AnalysisView({ rows }) {
	const byPair = groupStats(rows, (t) => t.pair || "—");
	const bySession = groupStats(rows, (t) => t.session || "bez sesji");
	const byPos = groupStats(rows, (t) => t.position === "long" ? "LONG" : "SHORT");
	const byTactic = groupStats(rows, (t) => t.tactic || "bez taktyki");
	const byMgmt = groupStats(rows, (t) => t.management ? "Zarządzanie OK" : "Zarządzanie słabe");
	const byConfluence = groupStats(rows, (t) => t.htf && t.mtf && t.ltf && t.m1 ? "Pełny checklist TF" : "Niepełny TF");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				title: "Taktyki",
				data: byTactic
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				title: "Pary",
				data: byPair
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				title: "Sesje",
				data: bySession
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				title: "Kierunek",
				data: byPos
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				title: "Zarządzanie pozycją",
				data: byMgmt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				title: "Confluence timeframe",
				data: byConfluence
			})
		]
	});
}
function EquityTip({ active, payload }) {
	if (!active || !payload?.[0]) return null;
	const p = payload[0].payload;
	if (p.nr === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-elevated px-3 py-2 text-xs shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-muted",
			children: "Kapitał początkowy"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-mono tabular text-fg",
			children: formatUsd(p.balance)
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-elevated px-3 py-2 text-xs shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-muted",
				children: [
					"#",
					p.nr,
					p.date ? ` · ${formatDatePl(p.date)}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono tabular text-fg",
				children: formatUsd(p.balance)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-muted",
				children: ["RR ", formatRr(p.rr)]
			})
		]
	});
}
function RrTip({ active, payload }) {
	if (!active || !payload?.[0]) return null;
	const t = payload[0].payload;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-elevated px-3 py-2 text-xs shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-muted",
			children: [
				"#",
				t.nr,
				" · ",
				t.pair
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 font-mono tabular text-fg",
			children: ["RR ", formatRr(t.rr)]
		})]
	});
}
function EquityChart({ trades, startingCapital }) {
	const points = equityPoints(trades, startingCapital);
	const withRr = trades.filter((t) => t.rr !== null);
	const last = points[points.length - 1]?.balance ?? startingCapital;
	const up = last >= startingCapital;
	if (withRr.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center text-sm text-muted",
		children: "Wpisz RR przy transakcji, a tu pojawi się krzywa kapitału."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface p-4 lg:col-span-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium tracking-tight",
					children: "Krzywa kapitału"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Stan konta po każdej transakcji"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `font-mono text-sm tabular ${up ? "text-win" : "text-loss"}`,
					children: formatUsd(last)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-56 w-full sm:h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data: points,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: "eqFill",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: up ? "var(--color-win)" : "var(--color-loss)",
									stopOpacity: .28
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: up ? "var(--color-win)" : "var(--color-loss)",
									stopOpacity: 0
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tick: {
									fill: "var(--color-subtle)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false,
								interval: "preserveStartEnd"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-subtle)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false,
								width: 72,
								tickFormatter: (v) => new Intl.NumberFormat("pl-PL", { notation: "compact" }).format(v),
								domain: ["auto", "auto"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquityTip, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "balance",
								stroke: up ? "var(--color-win)" : "var(--color-loss)",
								strokeWidth: 2,
								fill: "url(#eqFill)",
								isAnimationActive: false
							})
						]
					})
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface p-4 lg:col-span-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium tracking-tight",
					children: "RR na transakcję"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Zielony plus, czerwony minus"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-56 w-full sm:h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: withRr,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "nr",
								tick: {
									fill: "var(--color-subtle)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-subtle)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false,
								width: 36
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RrTip, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "rr",
								radius: [
									4,
									4,
									0,
									0
								],
								isAnimationActive: false,
								children: withRr.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: (t.rr ?? 0) > 0 ? "var(--color-win)" : (t.rr ?? 0) < 0 ? "var(--color-loss)" : "var(--color-be)" }, t.id))
							})
						]
					})
				})
			})]
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-elevated text-fg border border-border hover:bg-surface",
			ghost: "text-fg hover:bg-elevated",
			outline: "border border-border bg-transparent hover:bg-elevated",
			destructive: "bg-loss text-fg hover:opacity-90",
			link: "text-muted underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 rounded-sm px-3 text-xs",
			lg: "h-11 rounded-lg px-5",
			icon: "size-10",
			"icon-sm": "size-8 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/80", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-surface p-6 shadow-panel", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm text-muted hover:text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Zamknij"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 text-left", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-medium tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-10 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg shadow-none transition-colors placeholder:text-subtle file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-xs font-medium tracking-wide text-muted", className),
	...props
}));
Label.displayName = Root.displayName;
var STORAGE_KEY = "trader-journal-v1";
var DEFAULT_SETTINGS = {
	startingCapital: 5e4,
	riskPercent: 1,
	riskMode: "compound",
	accountName: "Konto główne"
};
var SESSION_PRESETS = [
	"Asia",
	"LDN OPEN",
	"LDN LUNCH",
	"NY OPEN",
	"NY AM",
	"NY PM",
	"LDN CLOSE",
	"Silver Bullet AM",
	"Silver Bullet PM"
];
var PAIR_PRESETS = [
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
	"BTC/USD"
];
function emptyTrade(partial) {
	return {
		id: uid(),
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
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
		...partial
	};
}
function exampleTrades() {
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
			createdAt: 1
		}),
		emptyTrade({
			date: day,
			session: "LDN OPEN",
			position: "short",
			rr: -1,
			pair: "EUR/USD",
			notes: "Przykład — strata 1R.",
			example: true,
			createdAt: 2
		}),
		emptyTrade({
			date: day,
			session: "NY OPEN",
			position: "long",
			rr: 0,
			pair: "EUR/USD",
			notes: "Przykład — break even.",
			example: true,
			createdAt: 3
		}),
		emptyTrade({
			date: day,
			session: "NY PM",
			position: "long",
			rr: 3.5,
			pair: "GBP/USD",
			notes: "Przykład — +3.5R.",
			example: true,
			createdAt: 4
		})
	];
}
var CSV_HEADERS = [
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
	"TAKTYKA"
];
var useJournalStore = create()(persist((set, get) => ({
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
			example: false
		});
		set({ trades: [...get().trades, trade] });
		return trade.id;
	},
	updateTrade: (id, patch) => {
		set({ trades: get().trades.map((t) => t.id === id ? {
			...t,
			...patch,
			example: false
		} : t) });
	},
	removeTrade: (id) => {
		set({ trades: get().trades.filter((t) => t.id !== id) });
	},
	replaceTrades: (trades) => set({ trades }),
	mergeTrades: (incoming) => {
		const existingIds = new Set(get().trades.map((t) => t.id));
		const mapped = incoming.map((t) => existingIds.has(t.id) ? {
			...t,
			id: `${t.id}-${t.createdAt}`
		} : t);
		set({ trades: [...get().trades.filter((t) => !t.example), ...mapped] });
	},
	clearExamples: () => set({ trades: get().trades.filter((t) => !t.example) }),
	clearAll: () => set({ trades: [] }),
	updateSettings: (patch) => set({ settings: {
		...get().settings,
		...patch
	} }),
	replaceAll: ({ trades, settings }) => set({
		trades,
		settings: settings ? {
			...get().settings,
			...settings
		} : get().settings
	})
}), {
	name: STORAGE_KEY,
	storage: createJSONStorage(() => {
		if (typeof window === "undefined") return {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {}
		};
		return localStorage;
	}),
	skipHydration: true,
	partialize: (state) => ({
		trades: state.trades,
		settings: state.settings
	})
}));
function rehydrateJournal() {
	const unsub = useJournalStore.persist.onFinishHydration(() => {
		useJournalStore.getState().setHydrated(true);
	});
	useJournalStore.persist.rehydrate();
	if (useJournalStore.persist.hasHydrated()) useJournalStore.getState().setHydrated(true);
	return unsub;
}
function SettingsDialog({ open, onOpenChange }) {
	const settings = useJournalStore((s) => s.settings);
	const updateSettings = useJournalStore((s) => s.updateSettings);
	const [name, setName] = (0, import_react.useState)(settings.accountName);
	const [capital, setCapital] = (0, import_react.useState)(String(settings.startingCapital));
	const [risk, setRisk] = (0, import_react.useState)(String(settings.riskPercent));
	const [mode, setMode] = (0, import_react.useState)(settings.riskMode);
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
			riskMode: mode
		});
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			if (next) syncFromStore();
			onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Ustawienia konta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Saldo i RR liczą się od tych wartości po każdej zmianie — jak formuły w arkuszu." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "acc-name",
							children: "Nazwa konta"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "acc-name",
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "acc-cap",
							children: "Kapitał początkowy ($)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "acc-cap",
							inputMode: "decimal",
							value: capital,
							onChange: (e) => setCapital(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "acc-risk",
							children: "Ryzyko na transakcję (%)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "acc-risk",
							inputMode: "decimal",
							value: risk,
							onChange: (e) => setRisk(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tryb ryzyka" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setMode("compound"),
								className: `rounded-md border px-3 py-2 text-left text-sm ${mode === "compound" ? "border-primary bg-elevated text-fg" : "border-border text-muted"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-fg",
									children: "Składane"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs",
									children: "% od aktualnego salda"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setMode("fixed"),
								className: `rounded-md border px-3 py-2 text-left text-sm ${mode === "fixed" ? "border-primary bg-elevated text-fg" : "border-border text-muted"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-fg",
									children: "Stałe 1R"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs",
									children: "% od kapitału początkowego"
								})]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => onOpenChange(false),
				children: "Anuluj"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Zapisz"
			})] })
		] })
	});
}
function Stat({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-lg p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs font-medium tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-1 font-mono text-xl tabular tracking-tight ${tone === "win" ? "text-win" : tone === "loss" ? "text-loss" : "text-fg"}`,
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-subtle",
				children: hint
			}) : null
		]
	});
}
function StatsGrid({ stats }) {
	const pnlTone = stats.pnl > 0 ? "win" : stats.pnl < 0 ? "loss" : "muted";
	const wrTone = stats.winrate === null ? "muted" : stats.winrate >= .5 ? "win" : "loss";
	const pf = stats.profitFactor === null ? "—" : Number.isFinite(stats.profitFactor) ? formatMoney(stats.profitFactor, 2) : "∞";
	const streak = stats.currentStreak.length === 0 || !stats.currentStreak.type ? "—" : `${stats.currentStreak.length}× ${stats.currentStreak.type === "win" ? "W" : "L"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Stan konta",
				value: formatUsd(stats.currentBalance),
				hint: stats.pnlPct === null ? void 0 : `${stats.pnl >= 0 ? "+" : ""}${formatUsd(stats.pnl)} · ${formatPct(stats.pnlPct)}`,
				tone: pnlTone
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Winrate",
				value: formatPct(stats.winrate),
				hint: `${stats.wins}W / ${stats.losses}L · ${stats.be} BE`,
				tone: wrTone
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Średnie RR",
				value: stats.avgRr === null ? "—" : formatRr(stats.avgRr),
				hint: `Suma R: ${stats.totalR === 0 ? "0" : formatRr(stats.totalR)}`,
				tone: stats.avgRr !== null && stats.avgRr >= 0 ? "win" : "loss"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Expectancy",
				value: stats.expectancyR === null ? "—" : `${formatRr(stats.expectancyR)} R`,
				hint: `PF ${pf}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Max drawdown",
				value: formatUsd(stats.maxDrawdown),
				hint: stats.maxDrawdownPct === null ? void 0 : formatPct(stats.maxDrawdownPct),
				tone: stats.maxDrawdown > 0 ? "loss" : "muted"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "1R teraz",
				value: formatUsd(stats.currentRisk),
				hint: `Seria: ${streak} · ${stats.tradeCount} trans.`
			})
		]
	});
}
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("peer size-4 shrink-0 rounded-xs border border-border bg-elevated data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: "flex items-center justify-center text-current",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-3",
			strokeWidth: 3
		})
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-10 w-full items-center justify-between rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-72 min-w-32 overflow-hidden rounded-md border border-border bg-elevated text-fg shadow-panel", position === "popper" && "min-w-(--radix-select-trigger-width)", className),
	position,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
		className: "p-1",
		children
	})
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none data-highlighted:bg-surface data-[state=checked]:text-fg", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex size-4 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var Sheet = Dialog$1;
var SheetPortal = DialogPortal$1;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/80", className),
	...props
}));
SheetOverlay.displayName = DialogOverlay$1.displayName;
var SheetContent = import_react.forwardRef(({ className, children, side = "right", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed z-50 flex flex-col gap-4 bg-surface shadow-panel border-border", side === "right" && "inset-y-0 right-0 h-full w-full max-w-md border-l p-6", side === "left" && "inset-y-0 left-0 h-full w-full max-w-md border-r p-6", side === "bottom" && "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-xl border-t p-6", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm text-muted hover:text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Zamknij"
		})]
	})]
})] }));
SheetContent.displayName = DialogContent$1.displayName;
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 pr-8", className),
		...props
	});
}
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-medium tracking-tight", className),
	...props
}));
SheetTitle.displayName = DialogTitle$1.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
SheetDescription.displayName = DialogDescription$1.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function Field({ label, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor,
			children: label
		}), children]
	});
}
function TradeEditor({ tradeId, onClose }) {
	const trades = useJournalStore((s) => s.trades);
	const updateTrade = useJournalStore((s) => s.updateTrade);
	const removeTrade = useJournalStore((s) => s.removeTrade);
	const trade = trades.find((t) => t.id === tradeId) ?? null;
	const tactics = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const t of trades) if (t.tactic.trim()) set.add(t.tactic.trim());
		return [...set].sort();
	}, [trades]);
	if (!trade) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: Boolean(tradeId),
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {})
	});
	const current = trade;
	function patch(p) {
		updateTrade(current.id, p);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: Boolean(tradeId),
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Transakcja" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Zmiana RR automatycznie ustawia wynik i przelicza saldo." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 pb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Data",
							htmlFor: "t-date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "t-date",
								type: "date",
								value: trade.date,
								onChange: (e) => patch({ date: e.target.value })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Para",
							htmlFor: "t-pair",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "t-pair",
								list: "pair-list",
								value: trade.pair,
								onChange: (e) => patch({ pair: e.target.value })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
								id: "pair-list",
								children: PAIR_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: p }, p))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Sesja",
						htmlFor: "t-session",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "t-session",
							list: "session-list",
							placeholder: "np. 9:31 - LDN OPEN",
							value: trade.session,
							onChange: (e) => patch({ session: e.target.value })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
							id: "session-list",
							children: SESSION_PRESETS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s }, s))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Pozycja",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: trade.position,
								onValueChange: (v) => patch({ position: v }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "long",
									children: "LONG"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "short",
									children: "SHORT"
								})] })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "RR",
							htmlFor: "t-rr",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "t-rr",
								inputMode: "decimal",
								placeholder: "np. 2,5 lub -1",
								defaultValue: trade.rr === null ? "" : String(trade.rr).replace(".", ","),
								onBlur: (e) => patch({ rr: parseRr(e.target.value) })
							}, `${trade.id}-${trade.rr}`)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Wynik (auto z RR)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: trade.outcomeOverride ?? "auto",
							onValueChange: (v) => patch({ outcomeOverride: v === "auto" ? null : v }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: "auto",
									children: ["Auto ", trade.rr === null ? "" : `(${formatRr(trade.rr)})`]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "win",
									children: "Wygrana"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "loss",
									children: "Przegrana"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "be",
									children: "BE"
								})
							] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "Taktyka / setup",
						htmlFor: "t-tactic",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "t-tactic",
							list: "tactic-list",
							placeholder: "np. FVG + OB, Silver Bullet",
							value: trade.tactic,
							onChange: (e) => patch({ tactic: e.target.value })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
							id: "tactic-list",
							children: tactics.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: t }, t))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notatki",
						htmlFor: "t-notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "t-notes",
							value: trade.notes,
							onChange: (e) => patch({ notes: e.target.value }),
							placeholder: "Co zadziałało, co złamałeś, kontekst HTF…"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Zdjęcie / link TradingView",
						htmlFor: "t-shot",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "t-shot",
							type: "url",
							placeholder: "https://www.tradingview.com/x/…",
							value: trade.screenshot,
							onChange: (e) => patch({ screenshot: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-elevated p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium tracking-wide text-muted",
							children: "Checklist TF"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
									label: "HTF D1",
									checked: trade.htf,
									onChange: (v) => patch({ htf: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
									label: "MTF H4/H1",
									checked: trade.mtf,
									onChange: (v) => patch({ mtf: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
									label: "LTF M15",
									checked: trade.ltf,
									onChange: (v) => patch({ ltf: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
									label: "Wejście M1",
									checked: trade.m1,
									onChange: (v) => patch({ m1: v })
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
							label: "Odpowiednie zarządzanie pozycją",
							checked: trade.management,
							onChange: (v) => patch({ management: v })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckRow, {
							label: "Sprawdzone przez Pablo",
							checked: trade.pablo,
							onChange: (v) => patch({ pablo: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: () => {
							removeTrade(trade.id);
							onClose();
						},
						children: "Usuń transakcję"
					})
				]
			})]
		})
	});
}
function CheckRow({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-11 items-center gap-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
			checked,
			onCheckedChange: (v) => onChange(v === true)
		}), label]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-elevated text-fg",
		outline: "border-border text-muted",
		win: "border-transparent bg-win/15 text-win",
		loss: "border-transparent bg-loss/15 text-loss",
		be: "border-transparent bg-be/15 text-be",
		long: "border-transparent bg-win/15 text-win",
		short: "border-transparent bg-loss/15 text-loss"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-44 overflow-hidden rounded-md border border-border bg-elevated p-1 text-fg shadow-panel", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-highlighted:bg-surface", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-border", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-xs font-medium text-muted", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
function CellInput({ defaultValue, onCommit, className, placeholder, list, type = "text", inputMode }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		type,
		inputMode,
		list,
		defaultValue,
		placeholder,
		className: cn("h-9 rounded-sm border-transparent bg-transparent px-2 shadow-none hover:bg-elevated focus-visible:border-border focus-visible:bg-elevated focus-visible:ring-1", className),
		onBlur: (e) => onCommit(e.target.value),
		onKeyDown: (e) => {
			if (e.key === "Enter") e.target.blur();
		}
	});
}
function RrCell({ id, rr, onCommit, className }) {
	const formatted = rr === null || Number.isNaN(rr) ? "" : String(rr).replace(".", ",");
	const [text, setText] = (0, import_react.useState)(formatted);
	(0, import_react.useEffect)(() => {
		setText(formatted);
	}, [formatted, id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		"aria-label": "RR",
		inputMode: "decimal",
		value: text,
		placeholder: "RR",
		onChange: (e) => setText(e.target.value),
		onBlur: () => onCommit(text),
		onKeyDown: (e) => {
			if (e.key === "Enter") e.target.blur();
		},
		className: cn("h-9 rounded-sm border-transparent bg-transparent px-2 font-mono tabular shadow-none hover:bg-elevated focus-visible:border-border focus-visible:bg-elevated focus-visible:ring-1", className)
	});
}
function TradeTable({ rows, onOpen }) {
	const updateTrade = useJournalStore((s) => s.updateTrade);
	const removeTrade = useJournalStore((s) => s.removeTrade);
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: "Brak transakcji"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Dodaj wpis i podaj RR — wynik, saldo i wykres policzą się same."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
			id: "grid-pairs",
			children: PAIR_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: p }, p))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
			id: "grid-sessions",
			children: SESSION_PRESETS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s }, s))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden overflow-x-auto rounded-xl border border-border md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-elevated text-left text-xs tracking-wide text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-12 px-3 py-3 font-medium",
							children: "Nr"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-36 px-2 py-3 font-medium",
							children: "Data"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-3 font-medium",
							children: "Sesja"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-28 px-2 py-3 font-medium",
							children: "Para"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-24 px-2 py-3 font-medium",
							children: "Poz."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-20 px-2 py-3 font-medium",
							children: "RR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-28 px-2 py-3 font-medium",
							children: "Wynik"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-32 px-2 py-3 font-medium",
							children: "PnL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-36 px-2 py-3 font-medium",
							children: "Stan konta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-12 px-2 py-3 font-medium" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border hover:bg-elevated/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-1 font-mono text-xs tabular text-muted",
							children: row.nr
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-1 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
								type: "date",
								defaultValue: row.date,
								onCommit: (v) => updateTrade(row.id, { date: v }),
								className: "w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-1 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
								defaultValue: row.session,
								list: "grid-sessions",
								placeholder: "Sesja",
								onCommit: (v) => updateTrade(row.id, { session: v }),
								className: "w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-1 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellInput, {
								defaultValue: row.pair,
								list: "grid-pairs",
								onCommit: (v) => updateTrade(row.id, { pair: v }),
								className: "w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-sm px-1 py-1",
								onClick: () => updateTrade(row.id, { position: row.position === "long" ? "short" : "long" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: row.position === "long" ? "long" : "short",
									children: row.position === "long" ? "LONG" : "SHORT"
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-1 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RrCell, {
								id: row.id,
								rr: row.rr,
								onCommit: (v) => updateTrade(row.id, { rr: parseRr(v) }),
								className: cn("w-full", (row.rr ?? 0) > 0 && "text-win", (row.rr ?? 0) < 0 && "text-loss")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutcomeBadge, { outcome: row.outcome })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-1 font-mono text-xs tabular", (row.pnl ?? 0) > 0 && "text-win", (row.pnl ?? 0) < 0 && "text-loss", row.pnl === null && "text-subtle"),
							children: row.pnl === null ? "—" : formatUsd(row.pnl)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-1 font-mono text-xs tabular",
							children: formatUsd(row.balance)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-1 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMenu, {
								screenshot: row.screenshot,
								onOpen: () => onOpen(row.id),
								onDelete: () => removeTrade(row.id)
							})
						})
					]
				}, row.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:hidden",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileCard, {
				row,
				onOpen: () => onOpen(row.id),
				onDelete: () => removeTrade(row.id),
				onTogglePos: () => updateTrade(row.id, { position: row.position === "long" ? "short" : "long" }),
				onRr: (v) => updateTrade(row.id, { rr: parseRr(v) })
			}, row.id))
		})
	] });
}
function OutcomeBadge({ outcome }) {
	if (!outcome) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-subtle",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: outcome === "win" ? "win" : outcome === "loss" ? "loss" : "be",
		children: outcomeLabel(outcome)
	});
}
function RowMenu({ screenshot, onOpen, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon-sm",
			"aria-label": "Menu wiersza",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				onClick: onOpen,
				children: "Szczegóły"
			}),
			screenshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: screenshot,
					target: "_blank",
					rel: "noreferrer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" }), "Wykres"]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				className: "text-loss",
				onClick: onDelete,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Usuń"]
			})
		]
	})] });
}
function MobileCard({ row, onOpen, onDelete, onTogglePos, onRr }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [
							"#",
							row.nr,
							" · ",
							formatDatePl(row.date)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: row.pair || "Para"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onTogglePos,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: row.position === "long" ? "long" : "short",
								children: row.position === "long" ? "LONG" : "SHORT"
							})
						})]
					}),
					row.session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 text-xs text-muted",
						children: row.session
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutcomeBadge, { outcome: row.outcome })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-subtle",
						children: "RR"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RrCell, {
						id: `${row.id}-m`,
						rr: row.rr,
						onCommit: onRr,
						className: cn("mt-1 border-border bg-elevated", (row.rr ?? 0) > 0 && "text-win", (row.rr ?? 0) < 0 && "text-loss")
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-subtle",
						children: "PnL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("mt-2 font-mono tabular", (row.pnl ?? 0) > 0 && "text-win", (row.pnl ?? 0) < 0 && "text-loss"),
						children: row.pnl === null ? "—" : formatUsd(row.pnl)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-subtle",
						children: "Saldo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 font-mono tabular",
						children: formatUsd(row.balance)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					className: "flex-1",
					onClick: onOpen,
					children: "Szczegóły"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onDelete,
					"aria-label": "Usuń",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})]
			})
		]
	});
}
var Tabs = Root2$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-10 items-center justify-center rounded-lg bg-elevated p-1 text-muted", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger$1, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-none", className),
	...props
}));
TabsTrigger.displayName = Trigger$1.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-4", className),
	...props
}));
TabsContent.displayName = Content.displayName;
function csvEscape(value) {
	if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, "\"\"")}"`;
	return value;
}
function tradesToCsv(rows) {
	return `\uFEFF${CSV_HEADERS.join(",")}\n${rows.map((t) => [
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
		t.tactic
	].map(csvEscape).join(",")).join("\n")}\n`;
}
function settingsToJson(settings, trades) {
	return JSON.stringify({
		version: 1,
		settings,
		trades
	}, null, 2);
}
function parseBackupJson(text) {
	const data = JSON.parse(text);
	if (Array.isArray(data)) return { trades: data.map(normalizeTrade) };
	if (data && Array.isArray(data.trades)) return {
		settings: data.settings,
		trades: data.trades.map(normalizeTrade)
	};
	throw new Error("Nieprawidłowy plik kopii.");
}
function normalizeTrade(raw) {
	const base = emptyTrade();
	return {
		...base,
		...raw,
		id: raw.id || base.id,
		rr: typeof raw.rr === "number" ? raw.rr : null,
		createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now()
	};
}
function splitCsvLine(line) {
	const out = [];
	let cur = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i++;
				} else inQuotes = false;
			} else cur += ch;
		} else if (ch === ",") {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out;
}
function normHeader(h) {
	return h.trim().toUpperCase().replace(/\s+/g, " ");
}
function parseCsv(text) {
	const lines = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim().length > 0);
	if (lines.length < 2) return [];
	const headers = splitCsvLine(lines[0]).map(normHeader);
	const idx = (name) => headers.indexOf(name);
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
	const trades = [];
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
		if (/winratio|średnie|srednie/i.test(notes) || /winratio|średnie/i.test(pair)) continue;
		if (!Boolean(date || rr !== null || pair || session || screenshot)) continue;
		if (typeof date !== "string") continue;
		const posRaw = iPos >= 0 ? cols[iPos] ?? "" : "";
		const winRaw = iWin >= 0 ? cols[iWin] ?? "" : "";
		const autoOutcome = rr !== null ? rr > 0 ? "win" : rr < 0 ? "loss" : "be" : null;
		const parsedOutcome = parseOutcome(winRaw);
		const outcomeOverride = parsedOutcome && autoOutcome && parsedOutcome !== autoOutcome ? parsedOutcome : null;
		trades.push(emptyTrade({
			date: date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
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
			example: false
		}));
	}
	return trades;
}
function downloadText(filename, content, mime) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function JournalApp() {
	const hydrated = useJournalStore((s) => s.hydrated);
	const trades = useJournalStore((s) => s.trades);
	const settings = useJournalStore((s) => s.settings);
	const addTrade = useJournalStore((s) => s.addTrade);
	const clearExamples = useJournalStore((s) => s.clearExamples);
	const clearAll = useJournalStore((s) => s.clearAll);
	const replaceAll = useJournalStore((s) => s.replaceAll);
	const mergeTrades = useJournalStore((s) => s.mergeTrades);
	const [tab, setTab] = (0, import_react.useState)("journal");
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		return rehydrateJournal();
	}, []);
	const computed = (0, import_react.useMemo)(() => computeTrades(trades, settings), [trades, settings]);
	const stats = (0, import_react.useMemo)(() => computeStats(computed, settings), [computed, settings]);
	const hasExamples = trades.some((t) => t.example);
	function handleNew() {
		addTrade();
		toast.success("Dodano wiersz — wpisz RR, reszta liczy się sama");
	}
	function handleExportJson() {
		downloadText(`dziennik-tradera-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, settingsToJson(settings, trades), "application/json");
		toast.success("Zapisano kopię JSON");
	}
	function handleExportCsv() {
		downloadText(`dziennik-tradera-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, tradesToCsv(computed), "text/csv;charset=utf-8");
		toast.success("Zapisano CSV");
	}
	async function handleImport(file) {
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
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-bg text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: "Wczytywanie dziennika…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2 rounded-full bg-win",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-sm font-medium tracking-tight sm:text-base",
								children: "Dziennik Tradera"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate pl-4 text-xs text-muted",
							children: [settings.accountName, " · zapis auto w tej przeglądarce"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									size: "sm",
									className: "hidden sm:inline-flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Kopia"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onClick: handleExportJson,
										children: "Eksport JSON"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onClick: handleExportCsv,
										children: "Eksport CSV"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => fileRef.current?.click(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), "Import JSON / CSV"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "text-loss",
										onClick: () => {
											if (confirm("Usunąć wszystkie transakcje z tego urządzenia?")) {
												clearAll();
												toast.success("Dziennik wyczyszczony");
											}
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Wyczyść dziennik"]
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon-sm",
								className: "sm:hidden",
								"aria-label": "Kopia zapasowa",
								onClick: handleExportJson,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon-sm",
								"aria-label": "Ustawienia",
								onClick: () => setSettingsOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: handleNew,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Nowa"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 pb-24",
				children: [
					hasExamples ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 rounded-lg border border-border bg-elevated px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Widzisz przykłady z arkusza (EUR/USD, 25.05.2024). Usuń je i wpisuj swoje setupy."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: clearExamples,
							children: "Usuń przykłady"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsGrid, { stats }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquityChart, {
						trades: computed,
						startingCapital: settings.startingCapital
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: tab,
						onValueChange: setTab,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "journal",
								children: "Dziennik"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "analysis",
								children: "Analiza taktyk"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
								value: "journal",
								className: "flex flex-col gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeTable, {
									rows: computed,
									onOpen: setEditingId
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: handleNew,
									className: "self-start",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Dodaj transakcję"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "analysis",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisView, { rows: computed })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: ".json,.csv,text/csv,application/json",
				className: "hidden",
				onChange: (e) => {
					const file = e.target.files?.[0];
					if (file) handleImport(file);
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeEditor, {
				tradeId: editingId,
				onClose: () => setEditingId(null)
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalApp, {});
}
//#endregion
export { Home as component };
