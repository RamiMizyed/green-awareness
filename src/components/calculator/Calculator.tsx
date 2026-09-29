"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { downloadCsv } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { ApplianceList } from "./ApplianceList";
import { Breakdown } from "./Breakdown";
import { Methodology } from "./Methodology";
import { RegionSettings } from "./RegionSettings";
import { ResultsPanel } from "./ResultsPanel";
import { SavingsPlan } from "./SavingsPlan";

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
			<section id="calculator" className="scroll-mt-20 py-16 sm:py-24">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<SectionHeading
						step="1"
						title="Calculate your footprint"
						text="Add the things in your home that use electricity. We'll work out what they cost you and the CO₂ behind them."
						action={
							items.length > 0 && (
								<Button variant="outline" size="sm" onClick={() => downloadCsv(items, settings)}>
									<Download aria-hidden /> Export CSV
								</Button>
							)
						}
					/>
					<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
						<div className="flex min-w-0 flex-col gap-6">
							<RegionSettings />
							<ApplianceList />
						</div>
						<aside className="flex flex-col gap-6 lg:sticky lg:top-24">
							<ResultsPanel />
							<Breakdown />
						</aside>
					</div>
				</div>
			</section>

			<section id="save" className="scroll-mt-20 border-t py-16 sm:py-24">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<SectionHeading
						step="2"
						title="Your savings plan"
						text="Changes that make the biggest difference for your home, worked out from your own list. Tick the ones you'll do."
					/>
					<div className="mt-8">
						<SavingsPlan />
					</div>
				</div>
			</section>

			<section id="how-it-works" className="scroll-mt-20 border-t py-16 sm:py-24">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<SectionHeading
						title="How it works"
						text="The maths, the data sources, and what the numbers can and can't tell you."
					/>
					<div className="mt-8">
						<Methodology />
					</div>
				</div>
			</section>
		</>
	);
}

function SectionHeading({
	step,
	title,
	text,
	action,
}: {
	step?: string;
	title: string;
	text: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="max-w-2xl">
				{step && (
					<div className="text-sm font-semibold text-primary">Step {step}</div>
				)}
				<h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
				<p className="mt-3 text-muted-foreground">{text}</p>
			</div>
			{action}
		</div>
	);
}
