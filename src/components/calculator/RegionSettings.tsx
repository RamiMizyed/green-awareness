"use client";

import { Info, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getRegion, REGIONS } from "@/lib/data/regions";
import { currencySymbol } from "@/lib/calc";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { NumberField, StepHeader } from "./ui";

export function RegionSettings() {
	const settings = useAppStore((s) => s.settings);
	const setRegion = useAppStore((s) => s.setRegion);
	const updateSettings = useAppStore((s) => s.updateSettings);

	const region = getRegion(settings.regionId);
	const symbol = currencySymbol(region.currency, region.locale);
	const customised =
		settings.pricePerKwh !== region.price ||
		settings.intensity !== region.intensity;

	return (
		<section
			aria-labelledby="region-heading"
			className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
			<StepHeader
				id="region-heading"
				step={1}
				title="Where do you live?"
				text="This sets your electricity price and how clean your power is."
			/>

			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
				<div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
					<span className="text-sm font-medium text-muted-foreground">
						Country or region
					</span>
					<Select value={region.id} onValueChange={setRegion}>
						<SelectTrigger
							className="!h-12 w-full rounded-xl bg-card px-4 text-lg font-semibold"
							aria-label="Country or region">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="max-h-96">
							{REGIONS.map((r) => (
								<SelectItem key={r.id} value={r.id} className="py-2.5 text-base">
									{r.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<NumberField
					label="Price per kWh"
					unit={symbol}
					value={settings.pricePerKwh}
					max={100_000}
					onChange={(pricePerKwh) => updateSettings({ pricePerKwh })}
				/>
				<NumberField
					label="Grid CO₂ per kWh"
					unit="kg"
					value={settings.intensity}
					max={2}
					onChange={(intensity) => updateSettings({ intensity })}
				/>
			</div>

			<div className="mt-4 flex flex-wrap items-start justify-between gap-3">
				<p className="flex max-w-xl gap-2 text-sm text-muted-foreground">
					<Info className="mt-0.5 size-4 shrink-0" aria-hidden />
					Prices here are typical. For the most accurate result, copy the
					price per kWh from your electricity bill.
				</p>
				{customised && (
					<button
						type="button"
						onClick={() => setRegion(region.id)}
						className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
						<RotateCcw className="size-4" aria-hidden />
						Use {region.name} defaults
					</button>
				)}
			</div>
		</section>
	);
}
