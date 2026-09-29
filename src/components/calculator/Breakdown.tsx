"use client";

import { CATEGORIES, getSpec, type Category } from "@/lib/data/appliances";
import { formatMoney, formatNumber } from "@/lib/calc";
import { PERIOD_LABEL, useResults } from "./useResults";

const CATEGORY_COLOR: Record<Category, string> = {
	climate: "#f97316",
	kitchen: "#10b981",
	laundry: "#0ea5e9",
	entertainment: "#8b5cf6",
	office: "#6366f1",
	lighting: "#eab308",
	other: "#ec4899",
};

const TOP_N = 5;

export function Breakdown() {
	const { rows, totals, region, divisor, period } = useResults();
	if (rows.length === 0 || totals.kwh <= 0) return null;

	const byCat = new Map<Category, number>();
	for (const r of rows) {
		const cat = getSpec(r.item.specId)?.category ?? "other";
		byCat.set(cat, (byCat.get(cat) ?? 0) + r.kwh);
	}
	const cats = CATEGORIES.filter((c) => (byCat.get(c.id) ?? 0) > 0)
		.map((c) => ({ ...c, kwh: byCat.get(c.id)!, share: byCat.get(c.id)! / totals.kwh }))
		.sort((a, b) => b.kwh - a.kwh);

	const top = rows.slice(0, TOP_N).filter((r) => r.kwh > 0);
	const topShare = top.slice(0, 3).reduce((s, r) => s + r.share, 0);

	return (
		<section
			aria-labelledby="breakdown-heading"
			className="rounded-2xl border bg-card p-5 sm:p-6">
			<h3 id="breakdown-heading" className="text-lg font-semibold">
				Where it goes
			</h3>

			<div
				className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-muted"
				role="img"
				aria-label={cats
					.map((c) => `${c.label} ${Math.round(c.share * 100)}%`)
					.join(", ")}>
				{cats.map((c) => (
					<div
						key={c.id}
						className="h-full border-r-2 border-card last:border-r-0"
						style={{ width: `${c.share * 100}%`, background: CATEGORY_COLOR[c.id] }}
					/>
				))}
			</div>
			<ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
				{cats.map((c) => (
					<li key={c.id} className="flex items-center gap-1.5">
						<span
							className="size-2.5 rounded-sm"
							style={{ background: CATEGORY_COLOR[c.id] }}
							aria-hidden
						/>
						<span>{c.label}</span>
						<span className="tabular-nums text-muted-foreground">
							{Math.round(c.share * 100)}%
						</span>
					</li>
				))}
			</ul>

			<h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Biggest users
			</h4>
			{top.length >= 3 && (
				<p className="mt-1 text-sm text-muted-foreground">
					Your top 3 make up {Math.round(topShare * 100)}% of your bill. That&apos;s
					where changes count most.
				</p>
			)}
			<ol className="mt-3 flex flex-col gap-3">
				{top.map((r, i) => {
					const cat = getSpec(r.item.specId)?.category ?? "other";
					return (
						<li key={r.item.id} className="text-sm">
							<div className="flex items-baseline justify-between gap-3">
								<span className="min-w-0 truncate">
									<span className="mr-2 tabular-nums text-muted-foreground">
										{i + 1}.
									</span>
									{r.item.name || "Unnamed appliance"}
								</span>
								<span className="shrink-0 tabular-nums">
									<span className="font-medium">
										{formatMoney(r.cost / divisor, region.currency, region.locale)}
									</span>
									<span className="text-muted-foreground">
										{" "}
										· {formatNumber(r.kwh / divisor, region.locale)} kWh
									</span>
								</span>
							</div>
							<div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full"
									style={{
										width: `${(r.kwh / top[0].kwh) * 100}%`,
										background: CATEGORY_COLOR[cat],
									}}
								/>
							</div>
						</li>
					);
				})}
			</ol>
			<p className="mt-4 text-xs text-muted-foreground">
				Figures shown {PERIOD_LABEL[period]}.
			</p>
		</section>
	);
}
