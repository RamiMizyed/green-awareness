"use client";

import { applianceVisual, CATEGORIES, CATEGORY_THEME, type Category } from "@/lib/data/appliances";
import { formatMoney } from "@/lib/calc";
import { IconTile } from "./ui";
import { PERIOD_WORD, useResults } from "./useResults";

const TOP_N = 5;

export function Breakdown() {
	const { rows, totals, region, divisor, period } = useResults();
	if (rows.length === 0 || totals.kwh <= 0) return null;

	const byCat = new Map<Category, number>();
	for (const r of rows) {
		const cat = applianceVisual(r.item.specId).category;
		byCat.set(cat, (byCat.get(cat) ?? 0) + r.kwh);
	}
	const cats = CATEGORIES.filter((c) => (byCat.get(c.id) ?? 0) > 0)
		.map((c) => ({ ...c, share: byCat.get(c.id)! / totals.kwh }))
		.sort((a, b) => b.share - a.share);

	const top = rows.slice(0, TOP_N).filter((r) => r.kwh > 0);
	const topShare = top.slice(0, 3).reduce((s, r) => s + r.share, 0);

	return (
		<section
			aria-labelledby="breakdown-heading"
			className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
			<h2 id="breakdown-heading" className="text-lg font-bold">
				Where your money goes
			</h2>

			<div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
				<div>
					<div
						className="flex h-5 w-full gap-0.5 overflow-hidden rounded-full"
						role="img"
						aria-label={cats.map((c) => `${c.label} ${Math.round(c.share * 100)}%`).join(", ")}>
						{cats.map((c) => (
							<div
								key={c.id}
								className="h-full first:rounded-l-full last:rounded-r-full"
								style={{ width: `${c.share * 100}%`, background: CATEGORY_THEME[c.id].hex }}
							/>
						))}
				</div>
					<ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
						{cats.map((c) => (
							<li key={c.id} className="flex items-center gap-2">
								<span
									className="size-3 shrink-0 rounded-full"
									style={{ background: CATEGORY_THEME[c.id].hex }}
									aria-hidden
								/>
								<span className="truncate">{c.label}</span>
								<span className="ml-auto font-semibold tabular-nums">
									{Math.round(c.share * 100)}%
								</span>
							</li>
						))}
					</ul>

					{top.length >= 3 && (
						<p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm">
							Your top 3 are{" "}
							<strong className="text-base">{Math.round(topShare * 100)}%</strong> of your
							bill. Changes there make the biggest difference.
						</p>
					)}
				</div>
				<div>
					<h3 className="text-sm font-semibold text-muted-foreground">
						Your biggest users
					</h3>
					<ol className="mt-3 flex flex-col gap-4">
						{top.map((r) => {
							const v = applianceVisual(r.item.specId);
							return (
								<li key={r.item.id} className="flex items-center gap-3">
									<IconTile icon={v.icon} tone={v.tone} size="sm" />
									<div className="min-w-0 flex-1">
										<div className="flex items-baseline justify-between gap-3">
											<span className="truncate text-base font-medium">
												{r.item.name || "Unnamed appliance"}
											</span>
											<span className="shrink-0 font-semibold tabular-nums">
												{formatMoney(r.cost / divisor, region.currency, region.locale)}
											</span>
										</div>
										<div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
											<div
												className="h-full rounded-full"
												style={{ width: `${(r.kwh / top[0].kwh) * 100}%`, background: v.hex }}
											/>
										</div>
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
			<p className="sr-only">Amounts shown per {PERIOD_WORD[period]}.</p>
		</section>
	);
}
