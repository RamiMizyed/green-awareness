"use client";

import { Check, Clock, Leaf, PiggyBank, Plug, Sun, Target } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { applianceVisual } from "@/lib/data/appliances";
import { formatMass, formatMoney, formatNumber } from "@/lib/calc";
import type { Effort } from "@/lib/tips";
import { cn } from "@/lib/utils";
import { IconTile } from "./ui";
import { useResults } from "./useResults";

const EFFORT_STYLE: Record<Effort, string> = {
	Free: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
	"Low cost": "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
	Investment: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
};

const BEYOND = [
	{
		icon: Leaf,
		tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
		title: "Switch to a renewable tariff",
		detail:
			"Choose a supplier or plan backed by wind and solar. It cuts the CO₂ from your electricity without changing how you live.",
	},
	{
		icon: Sun,
		tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
		title: "Look into solar",
		detail:
			"If you own your roof, panels can cover much of your daytime use. Renters can often join a community solar scheme.",
	},
	{
		icon: Clock,
		tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
		title: "Use power when it's cheap",
		detail:
			"If your tariff has cheaper night or weekend rates, run the dishwasher, laundry and car charging then.",
	},
];

export function SavingsPlan() {
	const { tips, plan, totals, region, rows } = useResults();
	const planIds = useAppStore((s) => s.plan);
	const togglePlan = useAppStore((s) => s.togglePlan);
	const loc = region.locale;
	const money = (n: number) => formatMoney(n, region.currency, loc);

	const potentialCost = tips.reduce((s, t) => s + t.costSaved, 0);
	const potentialKwh = tips.reduce((s, t) => s + t.kwhSaved, 0);

	return (
		<div className="flex flex-col gap-8">
			{rows.length === 0 ? (
				<div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-10 text-center">
					<IconTile icon={PiggyBank} tone="bg-primary/10 text-primary" size="lg" />
					<p className="max-w-md text-lg text-muted-foreground">
						Add your appliances above and we&apos;ll show the changes that save
						you the most.
					</p>
				</div>
			) : tips.length === 0 ? (
				<div className="rounded-3xl border bg-card p-6 text-lg text-muted-foreground">
					Nice, there are no obvious quick wins in your list. The ideas below can
					take you further.
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<PlanStat
							icon={Target}
							label="You could save up to"
							value={money(potentialCost)}
							sub={`a year · ${formatNumber((potentialKwh / Math.max(totals.kwh, 1e-9)) * 100, loc, 0)}% of your use`}
						/>
						<PlanStat
							icon={PiggyBank}
							label="Your plan saves"
							value={money(plan.cost)}
							sub={
								planIds.length === 0
									? "Tick the changes below"
									: `a year · ${planIds.length} ${planIds.length === 1 ? "change" : "changes"}`
							}
							highlight
						/>
						<PlanStat
							icon={Leaf}
							label="Carbon you avoid"
							value={formatMass(plan.co2, loc)}
							sub="CO₂e a year"
						/>
					</div>

					<ul className="flex flex-col gap-3">
						{tips.map((t) => {
							const on = planIds.includes(t.id);
							const v = t.specId ? applianceVisual(t.specId) : null;
							return (
								<li key={t.id}>
									<button
										type="button"
										role="checkbox"
										aria-checked={on}
										onClick={() => togglePlan(t.id)}
										className={cn(
											"flex w-full flex-col gap-4 rounded-3xl border-2 bg-card p-5 text-left shadow-sm transition-colors sm:flex-row sm:items-center",
											on ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
										)}>
										<span className="flex items-start gap-4 sm:flex-1 sm:items-center">
											<IconTile
												icon={v?.icon ?? Plug}
												tone={v?.tone ?? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"}
											/>
											<span className="min-w-0 flex-1">
												<span className="flex flex-wrap items-center gap-2">
													<span className="text-lg font-semibold leading-snug">
														{t.title}
													</span>
													<span
														className={cn(
															"rounded-full px-2.5 py-0.5 text-xs font-semibold",
															EFFORT_STYLE[t.effort]
														)}>
														{t.effort}
													</span>
												</span>
												<span className="mt-1 block text-base text-muted-foreground">
													{t.detail}
												</span>
											</span>
										</span>
										<span className="flex items-center justify-between gap-4 border-t pt-4 sm:border-0 sm:pt-0">
											<span className="sm:text-right">
												<span className="block text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
													{money(t.costSaved)}
												</span>
												<span className="block text-sm text-muted-foreground">
													a year · {formatMass(t.co2Saved, loc)} CO₂e
												</span>
											</span>
											<span
												className={cn(
													"flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
													on
														? "bg-primary text-primary-foreground"
														: "bg-muted text-foreground"
												)}
												aria-hidden>
												<span
													className={cn(
														"flex size-5 items-center justify-center rounded-md border-2",
														on ? "border-primary-foreground" : "border-muted-foreground/50"
													)}>
													{on && <Check className="size-3.5" strokeWidth={3.5} />}
												</span>
												{on ? "In my plan" : "I'll do this"}
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
				<h3 className="text-xl font-bold">Going further</h3>
				<ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
					{BEYOND.map((b) => (
						<li key={b.title} className="rounded-3xl border bg-card p-6 shadow-sm">
							<IconTile icon={b.icon} tone={b.tone} />
							<div className="mt-4 text-lg font-semibold">{b.title}</div>
							<p className="mt-1 text-base text-muted-foreground">{b.detail}</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

function PlanStat({
	icon,
	label,
	value,
	sub,
	highlight,
}: {
	icon: React.ComponentProps<typeof IconTile>["icon"];
	label: string;
	value: string;
	sub: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 rounded-3xl border p-5 shadow-sm",
				highlight ? "border-primary bg-primary text-primary-foreground" : "bg-card"
			)}>
			<IconTile
				icon={icon}
				tone={highlight ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}
			/>
			<div className="min-w-0">
				<div className={cn("text-sm", highlight ? "opacity-90" : "text-muted-foreground")}>
					{label}
				</div>
				<div className="text-2xl font-bold tabular-nums">{value}</div>
				<div className={cn("text-sm", highlight ? "opacity-90" : "text-muted-foreground")}>
					{sub}
				</div>
			</div>
		</div>
	);
}
