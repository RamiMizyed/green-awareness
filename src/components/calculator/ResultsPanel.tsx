"use client";

import {
	ArrowDown,
	Car,
	Leaf,
	Plug,
	Smartphone,
	TreeDeciduous,
	Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
	CAR_KG_PER_KM,
	formatMass,
	formatMoney,
	formatNumber,
	PHONE_CHARGE_KWH,
	TREE_KG_PER_YEAR,
	type Period,
} from "@/lib/calc";
import { IconTile, Segmented } from "./ui";
import { useResults } from "./useResults";
import { formatPercent, rich, useLang, useT } from "@/lib/i18n";

const PERIODS: Period[] = ["day", "month", "year"];

const KM_PER_MI = 1.609344;

export function ResultsPanel() {
	const t = useT();
	const lang = useLang();
	const { totals, region, divisor, period, plan, rows } = useResults();
	const setPeriod = useAppStore((s) => s.setPeriod);
	const loc = region.locale;
	const per = t.period.per[period];
	const empty = rows.length === 0 || totals.kwh <= 0;

	const co2 = totals.co2 / divisor;
	const km = co2 / CAR_KG_PER_KM;
	const distance =
		region.distance === "mi"
			? `${formatNumber(km / KM_PER_MI, loc, 0)} ${t.units.miles}`
			: `${formatNumber(km, loc, 0)} ${t.units.km}`;
	const trees = totals.co2 / TREE_KG_PER_YEAR;
	const standbyCost =
		totals.kwh > 0 ? (totals.standbyKwh / totals.kwh) * totals.cost : 0;

	return (
		<section
			aria-labelledby="results-heading"
			className="overflow-hidden rounded-3xl border bg-card shadow-sm">
			{/* Headline */}
			<div className="bg-primary p-5 text-primary-foreground sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 id="results-heading" className="flex items-center gap-3 text-lg font-bold">
						<span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/20 text-base">
							3
						</span>
						{t.results.heading}
					</h2>
					<Segmented
						label={t.period.label}
						options={PERIODS.map((id) => ({ id, label: t.period.name[id] }))}
						value={period}
						onChange={setPeriod}
						inverse
					/>
				</div>
				<div className="mt-6" aria-live="polite">
					<div className="text-base opacity-90">{t.results.costs}</div>
					<div className="mt-1 flex flex-wrap items-baseline gap-x-2">
						<span className="text-5xl font-extrabold tracking-tight tabular-nums">
							{formatMoney(totals.cost / divisor, region.currency, loc)}
						</span>
						<span className="text-lg font-medium opacity-90">{per}</span>
					</div>
				</div>
			</div>

			<div className="p-5 sm:p-6">
				<dl className="grid grid-cols-2 gap-3">
					<Stat
						icon={Zap}
						tone="bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
						label={t.results.energy}
						value={`${formatNumber(totals.kwh / divisor, loc)} kWh`}
					/>
					<Stat
						icon={Leaf}
						tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
						label={t.results.carbon}
						value={formatMass(co2, loc)}
					/>
				</dl>

				{empty ? (
					<p className="mt-5 rounded-2xl bg-muted/60 p-4 text-base text-muted-foreground">
						{t.results.empty}
					</p>
				) : (
					<>
						<h3 className="mt-6 text-sm font-semibold text-muted-foreground">
							{rich(t.results.sameAs, { period: t.period.inSentence[period] })}
						</h3>
						<ul className="mt-3 flex flex-col gap-3">
							<Equivalent icon={Car} template={t.results.driven} value={distance} />
							<Equivalent
								icon={Smartphone}
								template={t.results.phones}
								value={formatNumber(totals.kwh / divisor / PHONE_CHARGE_KWH, loc, 0)}
							/>
							<Equivalent
								icon={TreeDeciduous}
								template={t.results.treesText}
								value={t.results.trees(Math.round(trees), formatNumber(trees, loc, 0))}
							/>
						</ul>

						{standbyCost >= 1 && (
							<div className="mt-5 flex items-center gap-3 rounded-2xl bg-amber-100 p-4 text-amber-950 dark:bg-amber-400/15 dark:text-amber-100">
								<Plug className="size-6 shrink-0" aria-hidden />
								<p className="text-sm">
									{rich(t.results.standby, {
										money: (
											<strong className="text-base">
												{formatMoney(standbyCost, region.currency, loc)}
											</strong>
										),
									})}
								</p>
							</div>
						)}

						<a
							href="#save"
							className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-primary/30 p-4 transition-colors hover:border-primary hover:bg-primary/5">
							<IconTile
								icon={ArrowDown}
								tone="bg-primary text-primary-foreground"
								size="sm"
							/>
							<span className="text-sm">
								{plan.kwh > 0 ? (
									rich(t.results.planSaves, {
										money: (
											<strong className="text-base">
												{formatMoney(plan.cost / divisor, region.currency, loc)}
											</strong>
										),
										period: per,
										pct: formatPercent(lang, plan.kwh / totals.kwh),
									})
								) : (
									<>
										<strong className="text-base">{t.results.cutTitle}</strong>
										<br />
										{t.results.cutText}
									</>
								)}
							</span>
						</a>
					</>
				)}
			</div>
		</section>
	);
}

function Stat({
	icon,
	tone,
	label,
	value,
}: {
	icon: React.ComponentProps<typeof IconTile>["icon"];
	tone: string;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-2xl bg-muted/60 p-4">
			<IconTile icon={icon} tone={tone} size="sm" />
			<dt className="mt-3 text-sm text-muted-foreground">{label}</dt>
			<dd className="text-2xl font-bold tabular-nums">{value}</dd>
		</div>
	);
}

function Equivalent({
	icon,
	template,
	value,
}: {
	icon: React.ComponentProps<typeof IconTile>["icon"];
	template: string;
	value: string;
}) {
	return (
		<li className="flex items-center gap-3">
			<IconTile icon={icon} tone="bg-muted text-foreground/80" size="sm" />
			<span className="text-base text-muted-foreground">
				{rich(template, {
					value: <strong className="font-bold text-foreground tabular-nums">{value}</strong>,
				})}
			</span>
		</li>
	);
}
