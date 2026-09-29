"use client";

import { Check, Leaf, Sun, Clock, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatMass, formatMoney, formatNumber } from "@/lib/calc";
import type { Effort } from "@/lib/tips";
import { cn } from "@/lib/utils";
import { useResults } from "./useResults";

const EFFORT_STYLE: Record<Effort, string> = {
	Free: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
	"Low cost": "bg-sky-500/15 text-sky-800 dark:text-sky-300",
	Investment: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
};

const BEYOND = [
	{
		icon: Leaf,
		title: "Switch to a renewable tariff",
		detail:
			"Choose a supplier or plan backed by wind and solar. It can cut the CO₂ from your electricity sharply without changing how you live.",
	},
	{
		icon: Sun,
		title: "Consider rooftop or community solar",
		detail:
			"If you own your roof, panels can cover a large part of daytime use. Renters can often join a community solar scheme.",
	},
	{
		icon: Clock,
		title: "Shift heavy loads to off-peak hours",
		detail:
			"If your tariff has cheaper night or weekend rates, run the dishwasher, laundry and car charging then. It is cheaper and often cleaner too.",
	},
];

export function SavingsPlan() {
	const { tips, plan, totals, region, rows } = useResults();
	const planIds = useAppStore((s) => s.plan);
	const togglePlan = useAppStore((s) => s.togglePlan);
	const loc = region.locale;
	const money = (n: number) => formatMoney(n, region.currency, loc);

	const potentialKwh = tips.reduce((s, t) => s + t.kwhSaved, 0);

	return (
		<div className="flex flex-col gap-6">
			{rows.length === 0 ? (
				<div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
					Add your appliances in the calculator above and we&apos;ll show you
					the changes that save you the most.
				</div>
			) : tips.length === 0 ? (
				<div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
					Nice, we couldn&apos;t find any obvious quick wins in your list. Check
					the ideas below for going further.
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<PlanStat
							label="Possible savings"
							value={`${money(tips.reduce((s, t) => s + t.costSaved, 0))} / yr`}
							sub={`${formatNumber((potentialKwh / Math.max(totals.kwh, 1e-9)) * 100, loc, 0)}% of your use`}
						/>
						<PlanStat
							label="In your plan"
							value={`${money(plan.cost)} / yr`}
							sub={`${formatNumber(plan.kwh, loc, 0)} kWh a year`}
							highlight={plan.kwh > 0}
						/>
						<PlanStat
							label="CO₂e avoided"
							value={`${formatMass(plan.co2, loc)} / yr`}
							sub={
								planIds.length === 0
									? "Tick the changes you'll make"
									: `${planIds.length} ${planIds.length === 1 ? "change" : "changes"} planned`
							}
						/>
					</div>

					<ul className="flex flex-col gap-3">
						{tips.map((t) => {
							const on = planIds.includes(t.id);
							return (
								<li key={t.id}>
									<button
										type="button"
										role="checkbox"
										aria-checked={on}
										onClick={() => togglePlan(t.id)}
										className={cn(
											"flex w-full items-start gap-4 rounded-2xl border bg-card p-4 text-left transition-colors sm:p-5",
											on ? "border-primary bg-primary/5" : "hover:border-primary/50"
										)}>
										<span
											className={cn(
												"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
												on ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
											)}
											aria-hidden>
											{on && <Check className="size-4" strokeWidth={3} />}
										</span>
										<span className="min-w-0 flex-1">
											<span className="flex flex-wrap items-center gap-2">
												<span className="font-medium">{t.title}</span>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-[11px] font-medium",
														EFFORT_STYLE[t.effort]
													)}>
													{t.effort}
												</span>
											</span>
											<span className="mt-1 block text-sm text-muted-foreground">
												{t.detail}
											</span>
										</span>
										<span className="shrink-0 text-right">
											<span className="block font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
												{money(t.costSaved)}
											</span>
											<span className="block text-xs text-muted-foreground tabular-nums">
												per year
											</span>
											<span className="mt-1 block text-xs text-muted-foreground tabular-nums">
												{formatMass(t.co2Saved, loc)} CO₂e
											</span>
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</>
			)}

			<div>
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					<Zap className="size-5 text-primary" aria-hidden />
					Going further
				</h3>
				<ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
					{BEYOND.map(({ icon: Icon, title, detail }) => (
						<li key={title} className="rounded-2xl border bg-card p-5">
							<Icon className="size-5 text-primary" aria-hidden />
							<div className="mt-3 font-medium">{title}</div>
							<p className="mt-1 text-sm text-muted-foreground">{detail}</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

function PlanStat({
	label,
	value,
	sub,
	highlight,
}: {
	label: string;
	value: string;
	sub: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={cn(
				"rounded-2xl border bg-card p-4",
				highlight && "border-primary/60 bg-primary/5"
			)}>
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
			<div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
		</div>
	);
}
