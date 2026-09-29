"use client";

import { Car, Leaf, PiggyBank, Plug, Smartphone, TreeDeciduous, Zap } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { PERIOD_LABEL, useResults } from "./useResults";

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
	const empty = rows.length === 0;

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
			aria-live="polite"
			className="rounded-2xl border bg-card p-5 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<h3 id="results-heading" className="text-lg font-semibold">
					Your footprint
				</h3>
				<div
					className="grid grid-cols-3 rounded-lg border p-0.5 text-xs font-medium"
					role="group"
					aria-label="Time period">
					{PERIODS.map((p) => (
						<button
							key={p.id}
							type="button"
							aria-pressed={period === p.id}
							onClick={() => setPeriod(p.id)}
							className={cn(
								"rounded-md px-3 py-1.5 transition-colors",
								period === p.id
									? "bg-primary text-white"
									: "text-muted-foreground hover:bg-muted"
							)}>
							{p.label}
						</button>
					))}
				</div>
			</div>

			<div className="mt-5">
				<div className="text-sm text-muted-foreground">Electricity cost {per}</div>
				<div className="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
					{formatMoney(totals.cost / divisor, region.currency, loc)}
				</div>
			</div>

			<dl className="mt-5 grid grid-cols-2 gap-3">
				<Stat
					icon={<Zap className="size-4" aria-hidden />}
					label={`Energy ${per}`}
					value={`${formatNumber(totals.kwh / divisor, loc)} kWh`}
				/>
				<Stat
					icon={<Leaf className="size-4" aria-hidden />}
					label={`CO₂e ${per}`}
					value={formatMass(co2, loc)}
				/>
			</dl>

			{!empty && totals.kwh > 0 && (
				<>
					<h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						That&apos;s about the same as
					</h4>
					<ul className="mt-3 flex flex-col gap-2.5 text-sm">
						<Equivalent icon={<Car className="size-4" aria-hidden />}>
							Driving a petrol car <strong>{distance}</strong> {per}
						</Equivalent>
						<Equivalent icon={<TreeDeciduous className="size-4" aria-hidden />}>
							<strong>{formatNumber(trees, loc, 0)} trees</strong> growing all year
							to absorb a year of it
						</Equivalent>
						<Equivalent icon={<Smartphone className="size-4" aria-hidden />}>
							<strong>
								{formatNumber(totals.kwh / divisor / PHONE_CHARGE_KWH, loc, 0)}
							</strong>{" "}
							phone charges {per}
						</Equivalent>
					</ul>

					{standbyCost >= 1 && (
						<p className="mt-5 flex gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
							<Plug className="mt-0.5 size-4 shrink-0" aria-hidden />
							<span>
								Devices on standby cost you{" "}
								<strong>{formatMoney(standbyCost, region.currency, loc)}</strong>{" "}
								a year while doing nothing.
							</span>
						</p>
					)}

					{plan.kwh > 0 && (
						<a
							href="#save"
							className="mt-3 flex gap-2 rounded-lg bg-primary/10 p-3 text-sm text-emerald-900 hover:bg-primary/15 dark:text-emerald-200">
							<PiggyBank className="mt-0.5 size-4 shrink-0" aria-hidden />
							<span>
								Your savings plan cuts this by{" "}
								<strong>
									{formatMoney(plan.cost / divisor, region.currency, loc)}
								</strong>{" "}
								and <strong>{formatMass(plan.co2 / divisor, loc)} CO₂e</strong>{" "}
								{per} ({formatNumber((plan.kwh / totals.kwh) * 100, loc, 0)}%).
							</span>
						</a>
					)}
				</>
			)}

			{empty && (
				<p className="mt-6 text-sm text-muted-foreground">
					Add a few appliances to see what they cost you and how much CO₂
					they&apos;re responsible for.
				</p>
			)}
		</section>
	);
}

function Stat({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-xl bg-muted/60 p-3">
			<dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
				{icon}
				{label}
			</dt>
			<dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
		</div>
	);
}

function Equivalent({
	icon,
	children,
}: {
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<li className="flex items-start gap-2.5">
			<span className="mt-0.5 text-primary">{icon}</span>
			<span>{children}</span>
		</li>
	);
}
