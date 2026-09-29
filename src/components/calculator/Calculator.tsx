"use client";

import { useEffect } from "react";
import { ChevronUp, Clock, Download, Globe2, Lock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { downloadCsv } from "@/lib/export";
import { formatMass, formatMoney } from "@/lib/calc";
import { Button } from "@/components/ui/button";
import { ApplianceList } from "./ApplianceList";
import { Breakdown } from "./Breakdown";
import { Methodology } from "./Methodology";
import { RegionSettings } from "./RegionSettings";
import { ResultsPanel } from "./ResultsPanel";
import { SavingsPlan } from "./SavingsPlan";
import { PERIOD_WORD, useResults } from "./useResults";

const POINTS = [
	{ icon: Clock, text: "About 2 minutes" },
	{ icon: Globe2, text: "29 countries" },
	{ icon: Lock, text: "Private, stays on your device" },
];

/**
 * Client-only (loaded with ssr: false) because the store reads localStorage
 * synchronously when it's created.
 */
export default function Calculator() {
	const guessRegion = useAppStore((s) => s.guessRegion);
	const items = useAppStore((s) => s.items);
	const settings = useAppStore((s) => s.settings);

	useEffect(() => guessRegion(), [guessRegion]);

	return (
		<>
			<section id="calculator" className="scroll-mt-16 pb-16 pt-24 sm:pt-28">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-3xl">
							<h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
								What does your electricity cost you, and the planet?
							</h1>
							<ul className="mt-5 flex flex-wrap gap-2">
								{POINTS.map(({ icon: Icon, text }) => (
									<li
										key={text}
										className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium">
										<Icon className="size-4 text-primary" aria-hidden />
										{text}
									</li>
								))}
							</ul>
						</div>
						{items.length > 0 && (
							<Button
								variant="outline"
								className="self-start bg-card lg:self-auto"
								onClick={() => downloadCsv(items, settings)}>
								<Download aria-hidden /> Download my results
							</Button>
						)}
					</header>

					<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
						<div className="flex min-w-0 flex-col gap-6">
							<RegionSettings />
							<ApplianceList />
						</div>
						<aside
							id="results"
							className="scroll-mt-20 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:rounded-3xl">
							<ResultsPanel />
						</aside>
					</div>

					<div className="mt-6">
						<Breakdown />
					</div>
				</div>
			</section>

			<section id="save" className="scroll-mt-16 border-t bg-card/40 py-16 sm:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<SectionTitle
						title="Your savings plan"
						text="The changes that make the biggest difference in your home. Tick the ones you'll do and watch your savings add up."
					/>
					<div className="mt-8">
						<SavingsPlan />
					</div>
				</div>
			</section>

			<section id="how-it-works" className="scroll-mt-16 border-t py-16 sm:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<SectionTitle
						title="How it works"
						text="The maths, where the data comes from, and what the numbers can and can't tell you."
					/>
					<div className="mt-8">
						<Methodology />
					</div>
				</div>
			</section>

			<MobileSummaryBar />
		</>
	);
}

function SectionTitle({ title, text }: { title: string; text: string }) {
	return (
		<div className="max-w-2xl">
			<h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
			<p className="mt-3 text-lg text-muted-foreground">{text}</p>
		</div>
	);
}

/** Phones: keeps the running total in view while editing the list. */
function MobileSummaryBar() {
	const { totals, region, divisor, period, rows } = useResults();
	if (rows.length === 0) return null;
	return (
		<div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
			<div className="mx-auto flex max-w-xl items-center justify-between gap-3">
				<div className="min-w-0">
					<div className="text-xl font-bold tabular-nums">
						{formatMoney(totals.cost / divisor, region.currency, region.locale)}
						<span className="text-sm font-medium text-muted-foreground">
							{" "}
							a {PERIOD_WORD[period]}
						</span>
					</div>
					<div className="text-sm text-muted-foreground">
						{formatMass(totals.co2 / divisor, region.locale)} CO₂e
					</div>
				</div>
				<Button asChild>
					<a href="#results">
						<ChevronUp aria-hidden /> Results
					</a>
				</Button>
			</div>
		</div>
	);
}
