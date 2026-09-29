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
import { PERIOD_LABEL, PERIOD_WORD, useResults } from "./useResults";

const PERIODS: { id: Period; label: string }[] = [
	{ id: "day", label: "Day" },
	{ id: "month", label: "Month" },
	{ id: "year", label: "Year" },
];

const KM_PER_MI = 1.609344;

export function ResultsPanel() {
	const { totals, region, divisor, period, plan, rows } = useResults();
	const setPeriod = useAppStore((s) => s.setPeriod);
	const loc = region.locale;
	const per = PERIOD_LABEL[period];
	const empty = rows.length === 0 || totals.kwh <= 0;

	const co2 = totals.co2 / divisor;
	const km = co2 / CAR_KG_PER_KM;
	const distance =
		region.distance === "mi"
			? `${formatNumber(km / KM_PER_MI, loc, 0)} miles`
			: `${formatNumber(km, loc, 0)} km`;
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
						Your results
					</h2>
					<Segmented
						label="Show results per"
						options={PERIODS}
						value={period}
						onChange={setPeriod}
						inverse
					/>
				</div>
				<div className="mt-6" aria-live="polite">
					<div className="text-base opacity-90">Your electricity costs</div>
					<div className="mt-1 flex flex-wrap items-baseline gap-x-2">
						<span className="text-5xl font-extrabold tracking-tight tabular-nums">
							{formatMoney(totals.cost / divisor, region.currency, loc)}
						</span>
						<span className="text-lg font-medium opacity-90">a {PERIOD_WORD[period]}</span>
					</div>
				</div>
			</div>

			<div className="p-5 sm:p-6">
				<dl className="grid grid-cols-2 gap-3">
					<Stat
						icon={Zap}
						tone="bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
						label="Energy used"
						value={`${formatNumber(totals.kwh / divisor, loc)} kWh`}
					/>
					<Stat
						icon={Leaf}
						tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
						label="Carbon (CO₂e)"
						value={formatMass(co2, loc)}
					/>
				</dl>

				{empty ? (
					<p className="mt-5 rounded-2xl bg-muted/60 p-4 text-base text-muted-foreground">
						Add your appliances in step 2 and your results appear here
						straight away.
					</p>
				) : (
					<>
						<h3 className="mt-6 text-sm font-semibold text-muted-foreground">
							Your carbon {per} is about the same as
						</h3>
						<ul className="mt-3 flex flex-col gap-3">
							<Equivalent icon={Car} value={distance} text="driven in a petrol car" />
							<Equivalent
								icon={Smartphone}
								value={formatNumber(totals.kwh / divisor / PHONE_CHARGE_KWH, loc, 0)}
								text="phone charges (in energy)"
							/>
							<Equivalent
								icon={TreeDeciduous}
								value={`${formatNumber(trees, loc, 0)} trees`}
								text="needed to absorb a year of it"
							/>
						</ul>

						{standbyCost >= 1 && (
							<div className="mt-5 flex items-center gap-3 rounded-2xl bg-amber-100 p-4 text-amber-950 dark:bg-amber-400/15 dark:text-amber-100">
								<Plug className="size-6 shrink-0" aria-hidden />
								<p className="text-sm">
									Devices on standby cost you{" "}
									<strong className="text-base">
										{formatMoney(standbyCost, region.currency, loc)}
									</strong>{" "}
									a year while doing nothing.
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
									<>
										Your plan saves{" "}
										<strong className="text-base">
											{formatMoney(plan.cost / divisor, region.currency, loc)}
										</strong>{" "}
										a {PERIOD_WORD[period]} (
										{formatNumber((plan.kwh / totals.kwh) * 100, loc, 0)}% less).
										See your plan
									</>
								) : (
									<>
										<strong className="text-base">See how to cut this</strong>
										<br />
										Tips picked for your home
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
	value,
	text,
}: {
	icon: React.ComponentProps<typeof IconTile>["icon"];
	value: string;
	text: string;
}) {
	return (
		<li className="flex items-center gap-3">
			<IconTile icon={icon} tone="bg-muted text-foreground/80" size="sm" />
			<span className="text-base">
				<strong className="font-bold tabular-nums">{value}</strong>{" "}
				<span className="text-muted-foreground">{text}</span>
			</span>
		</li>
	);
}
